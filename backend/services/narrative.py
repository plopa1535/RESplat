import re
from dataclasses import dataclass


@dataclass
class SubtitleSegment:
    text: str
    start_time: float
    end_time: float


@dataclass
class SceneSegment:
    subtitle: SubtitleSegment
    scene_prompt: str  # cinematic prompt for video generation


def split_narrative(narrative: str, num_segments: int) -> list[SubtitleSegment]:
    sentences = re.split(r'(?<=[.!?。])\s+', narrative.strip())
    sentences = [s.strip() for s in sentences if s.strip()]

    if not sentences:
        sentences = [narrative.strip()]

    duration_per_segment = 10.0 / num_segments
    segments: list[SubtitleSegment] = []

    if len(sentences) <= num_segments:
        for i in range(num_segments):
            text = sentences[i] if i < len(sentences) else ""
            segments.append(SubtitleSegment(
                text=text,
                start_time=i * duration_per_segment,
                end_time=(i + 1) * duration_per_segment,
            ))
    else:
        per_bucket = len(sentences) // num_segments
        remainder = len(sentences) % num_segments
        idx = 0
        for i in range(num_segments):
            count = per_bucket + (1 if i < remainder else 0)
            bucket = sentences[idx:idx + count]
            idx += count
            text = " ".join(bucket)
            segments.append(SubtitleSegment(
                text=text,
                start_time=i * duration_per_segment,
                end_time=(i + 1) * duration_per_segment,
            ))

    return segments


def build_scene_prompts(
    narrative: str,
    num_clips: int,
) -> list[SceneSegment]:
    """Split narrative into subtitle segments and generate cinematic scene prompts.

    Each scene prompt wraps the narrative text with cinematic direction
    so the video model generates a new scene (not just animating a photo).
    """
    subtitles = split_narrative(narrative, num_clips)

    scene_segments: list[SceneSegment] = []
    cinematic_styles = [
        "Cinematic wide establishing shot, dramatic golden hour lighting, slow camera dolly.",
        "Medium close-up with shallow depth of field, soft natural lighting, gentle camera movement.",
        "Dramatic low-angle shot with volumetric lighting, slow push-in camera.",
        "Tracking shot with beautiful bokeh background, warm cinematic color grading.",
        "Epic wide shot with atmospheric haze, slow pan revealing the scene.",
    ]

    for i, sub in enumerate(subtitles):
        style = cinematic_styles[i % len(cinematic_styles)]
        if sub.text:
            scene_prompt = f"{style} {sub.text}"
        else:
            scene_prompt = f"{style} Cinematic motion, dramatic atmosphere."

        scene_segments.append(SceneSegment(
            subtitle=sub,
            scene_prompt=scene_prompt,
        ))

    return scene_segments
