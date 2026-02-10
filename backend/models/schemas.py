from pydantic import BaseModel
from typing import Optional


class JobCreate(BaseModel):
    job_id: str
    narrative: str
    image_order: list[str]
    reference_index: int = 0  # which photo is the character reference


class JobStatus(BaseModel):
    job_id: str
    status: str
    progress_pct: int
    current_step: str
    error: Optional[str] = None


class UploadResponse(BaseModel):
    job_id: str
    files: list[str]


class NarrativeRequest(BaseModel):
    job_id: str
    user_narrative: Optional[str] = None


class NarrativeResponse(BaseModel):
    ai_narrative: str
    user_narrative: str
    merged_narrative: str
