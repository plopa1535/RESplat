import subprocess
from pathlib import Path
from config import OUTPUT_DIR, FFMPEG_PATH
from services.narrative import SubtitleSegment


def _seconds_to_srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def generate_srt(segments: list[SubtitleSegment], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    for i, seg in enumerate(segments, 1):
        if not seg.text:
            continue
        lines.append(str(i))
        lines.append(f"{_seconds_to_srt_time(seg.start_time)} --> {_seconds_to_srt_time(seg.end_time)}")
        lines.append(seg.text)
        lines.append("")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return output_path


async def trim_clip(input_path: Path, output_path: Path, duration: float) -> Path:
    cmd = [
        FFMPEG_PATH, "-y",
        "-i", str(input_path),
        "-t", f"{duration:.3f}",
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac",
        "-r", "24",
        "-s", "1280x720",
        str(output_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


async def normalize_clip(input_path: Path, output_path: Path) -> Path:
    cmd = [
        FFMPEG_PATH, "-y",
        "-i", str(input_path),
        "-c:v", "libx264", "-preset", "fast",
        "-r", "24",
        "-s", "1280x720",
        "-c:a", "aac",
        "-ar", "44100",
        str(output_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


async def concatenate_clips(clip_paths: list[Path], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    concat_file = output_path.parent / "concat_list.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for clip in clip_paths:
            escaped = str(clip).replace("\\", "/")
            f.write(f"file '{escaped}'\n")

    cmd = [
        FFMPEG_PATH, "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac",
        str(output_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


async def burn_subtitles(video_path: Path, srt_path: Path, output_path: Path) -> Path:
    srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")
    subtitle_filter = (
        f"subtitles='{srt_escaped}'"
        f":force_style='FontSize=22,FontName=Arial,"
        f"PrimaryColour=&HFFFFFF,OutlineColour=&H000000,"
        f"Outline=2,Shadow=1,MarginV=30'"
    )
    cmd = [
        FFMPEG_PATH, "-y",
        "-i", str(video_path),
        "-vf", subtitle_filter,
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac",
        str(output_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path
