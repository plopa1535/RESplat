"""
LLM-based narrative generation service using Google Gemini API.

Analyzes uploaded images to auto-generate cinematic narratives,
and merges them with user-provided narratives.
"""

import base64
from pathlib import Path

from google import genai
from google.genai import types
from config import GEMINI_API_KEY

_client = None
MODEL = "gemini-2.0-flash"


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set. Add it to backend/.env")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _load_image_part(image_path: Path) -> types.Part:
    """Load an image file and return a Gemini Part."""
    data = image_path.read_bytes()
    suffix = image_path.suffix.lower()
    mime_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    mime = mime_map.get(suffix, "image/jpeg")
    return types.Part.from_bytes(data=data, mime_type=mime)


async def analyze_images(image_paths: list[Path]) -> str:
    """Analyze images and generate a cinematic narrative in Korean."""
    parts: list[types.Part] = []
    for p in image_paths:
        parts.append(_load_image_part(p))

    parts.append(types.Part.from_text(
        "당신은 시네마틱 영상의 내레이션 작가입니다.\n"
        "위 이미지들을 순서대로 분석하여, 10초짜리 시네마틱 영상에 어울리는 "
        "감성적이고 짧은 서사(내레이션)를 한국어로 작성해주세요.\n\n"
        "규칙:\n"
        "- 이미지 수에 맞춰 문장을 나누세요 (각 이미지당 1~2문장)\n"
        "- 전체적으로 하나의 이야기로 연결되어야 합니다\n"
        "- 시적이고 영화적인 톤으로 작성하세요\n"
        "- 총 길이는 3~6문장으로 짧게 유지하세요\n"
        "- 서사 텍스트만 출력하세요 (설명이나 부연 없이)"
    ))

    response = _get_client().models.generate_content(
        model=MODEL,
        contents=[types.Content(role="user", parts=parts)],
    )
    return response.text.strip()


async def merge_narratives(ai_narrative: str, user_narrative: str) -> str:
    """Merge AI-generated narrative with user-provided narrative."""
    prompt = (
        "당신은 시네마틱 영상의 내레이션 작가입니다.\n"
        "아래 두 가지 서사를 결합하여 하나의 새로운 서사를 만들어주세요.\n\n"
        f"[AI가 이미지를 분석하여 생성한 서사]\n{ai_narrative}\n\n"
        f"[사용자가 직접 작성한 서사]\n{user_narrative}\n\n"
        "규칙:\n"
        "- 두 서사의 핵심 감정과 내용을 모두 살리세요\n"
        "- 사용자 서사의 의도를 우선적으로 반영하세요\n"
        "- AI 서사의 시각적 묘사를 자연스럽게 결합하세요\n"
        "- 10초짜리 시네마틱 영상에 어울리는 짧은 서사로 작성하세요\n"
        "- 총 3~6문장으로 유지하세요\n"
        "- 결합된 서사 텍스트만 출력하세요 (설명이나 부연 없이)"
    )

    response = _get_client().models.generate_content(
        model=MODEL,
        contents=prompt,
    )
    return response.text.strip()


async def generate_narrative(
    image_paths: list[Path],
    user_narrative: str | None = None,
) -> dict:
    """
    Full narrative generation pipeline.

    1. Analyze images → AI narrative
    2. If user narrative provided → merge both
    3. Return all narratives
    """
    ai_narrative = await analyze_images(image_paths)

    if user_narrative and user_narrative.strip():
        merged = await merge_narratives(ai_narrative, user_narrative.strip())
    else:
        merged = ai_narrative

    return {
        "ai_narrative": ai_narrative,
        "user_narrative": user_narrative or "",
        "merged_narrative": merged,
    }
