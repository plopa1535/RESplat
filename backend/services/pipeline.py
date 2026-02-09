from pathlib import Path
from config import OUTPUT_DIR, VIDEO_DURATION, CLIP_MAX_DURATION
from services.job_store import update_job_status
from services.narrative import build_scene_prompts
from services.video_gen import generate_clip_with_reference
from services.compositor import (
    trim_clip,
    normalize_clip,
    concatenate_clips,
)


async def run_pipeline(
    job_id: str,
    images: list[Path],
    narrative: str,
    num_images: int,
    reference_index: int = 0,
):
    try:
        update_job_status(job_id, "splitting_narrative", 5, "Splitting narrative...")

        # Determine number of clips (2 clips for 10s total, each ~5s)
        num_clips = 2 if num_images <= 2 else min(num_images, 3)
        clip_duration = VIDEO_DURATION / num_clips

        # Build scene prompts from narrative
        scenes = build_scene_prompts(narrative, num_clips)

        # Select the character reference image
        ref_idx = min(reference_index, len(images) - 1)
        reference_image = images[ref_idx]

        update_job_status(job_id, "generating_clips", 10, "Generating video clips...")

        clip_paths: list[Path] = []
        for i, scene in enumerate(scenes):
            progress = 10 + int((i / num_clips) * 60)
            update_job_status(
                job_id,
                "generating_clips",
                progress,
                f"Generating clip {i + 1}/{num_clips}...",
            )
            clip = await generate_clip_with_reference(
                subject_ref_path=reference_image,
                prompt=scene.scene_prompt,
                job_id=job_id,
                clip_index=i,
            )
            clip_paths.append(clip)

        update_job_status(job_id, "compositing", 75, "Compositing clips...")

        job_output_dir = OUTPUT_DIR / job_id
        job_output_dir.mkdir(parents=True, exist_ok=True)

        processed_paths: list[Path] = []
        for i, clip in enumerate(clip_paths):
            normalized = clip.parent / f"clip_{i:02d}_norm.mp4"
            await normalize_clip(clip, normalized)

            # Trim to exact duration for 10-second total
            trimmed = clip.parent / f"clip_{i:02d}_trimmed.mp4"
            await trim_clip(normalized, trimmed, clip_duration)
            processed_paths.append(trimmed)

        if len(processed_paths) == 1:
            concat_output = processed_paths[0]
        else:
            concat_output = job_output_dir / "concat.mp4"
            await concatenate_clips(processed_paths, concat_output)

        update_job_status(
            job_id,
            "completed",
            100,
            "Done!",
            output_path=str(concat_output),
        )

    except Exception as e:
        update_job_status(job_id, "failed", 0, "Failed", error=str(e))
