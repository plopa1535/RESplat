from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from models.schemas import JobCreate, JobStatus
from services.job_store import jobs
from services.pipeline import run_pipeline

router = APIRouter()


@router.post("/jobs", response_model=JobStatus)
async def create_job(req: JobCreate, background_tasks: BackgroundTasks):
    if req.job_id not in jobs:
        raise HTTPException(404, "Upload job_id not found. Upload images first.")

    job = jobs[req.job_id]

    if not req.narrative.strip():
        raise HTTPException(400, "Narrative text is required")

    image_paths = []
    for filename in req.image_order:
        matched = [p for p in job.image_paths if Path(p).name == filename]
        if matched:
            image_paths.append(Path(matched[0]))
        else:
            image_paths.append(Path(job.image_paths[0]))

    if not image_paths:
        image_paths = [Path(p) for p in job.image_paths]

    job.status = "queued"
    job.current_step = "Queued"
    job.progress_pct = 0

    background_tasks.add_task(
        run_pipeline,
        req.job_id,
        image_paths,
        req.narrative,
        len(image_paths),
        req.reference_index,
    )

    return JobStatus(
        job_id=req.job_id,
        status="queued",
        progress_pct=0,
        current_step="Queued",
    )


@router.get("/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    return JobStatus(
        job_id=job.job_id,
        status=job.status,
        progress_pct=job.progress_pct,
        current_step=job.current_step,
        error=job.error,
    )


@router.get("/jobs/{job_id}/video")
async def download_video(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    if job.status != "completed" or not job.output_path:
        raise HTTPException(404, "Video not ready")
    return FileResponse(
        job.output_path,
        media_type="video/mp4",
        filename=f"resplat_{job_id}.mp4",
    )
