from dataclasses import dataclass, field
from typing import Optional


@dataclass
class JobState:
    job_id: str
    status: str = "queued"
    progress_pct: int = 0
    current_step: str = ""
    error: Optional[str] = None
    output_path: Optional[str] = None
    image_paths: list[str] = field(default_factory=list)


jobs: dict[str, JobState] = {}


def update_job_status(
    job_id: str,
    status: str,
    progress_pct: int = 0,
    current_step: str = "",
    error: Optional[str] = None,
    output_path: Optional[str] = None,
):
    if job_id in jobs:
        job = jobs[job_id]
        job.status = status
        job.progress_pct = progress_pct
        job.current_step = current_step
        if error is not None:
            job.error = error
        if output_path is not None:
            job.output_path = output_path
