import httpx
import replicate
from pathlib import Path
from config import CLIPS_DIR, REPLICATE_MODEL


async def generate_clip_with_reference(
    subject_ref_path: Path,
    prompt: str,
    job_id: str = "",
    clip_index: int = 0,
) -> Path:
    """Generate a video clip using subject_reference for character consistency.

    Uses minimax/video-01 (S2V-01) which takes a character reference image
    and generates a NEW video scene while preserving the subject's identity.
    """
    clip_dir = CLIPS_DIR / job_id
    clip_dir.mkdir(parents=True, exist_ok=True)
    clip_path = clip_dir / f"clip_{clip_index:02d}.mp4"

    output = replicate.run(
        REPLICATE_MODEL,
        input={
            "subject_reference": open(subject_ref_path, "rb"),
            "prompt": prompt,
            "prompt_optimizer": True,
        },
    )

    video_url = output if isinstance(output, str) else str(output)

    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.get(video_url)
        resp.raise_for_status()
        with open(clip_path, "wb") as f:
            f.write(resp.content)

    return clip_path
