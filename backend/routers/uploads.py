import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import UploadResponse
from services.job_store import jobs, JobState
from config import UPLOADS_DIR

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_images(files: list[UploadFile] = File(...)):
    if len(files) == 0:
        raise HTTPException(400, "At least 1 image is required")
    if len(files) > 5:
        raise HTTPException(400, "Maximum 5 images allowed")

    job_id = str(uuid.uuid4())
    job_dir = UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    saved_files = []
    for i, file in enumerate(files):
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(400, f"File {file.filename} is not an image")

        ext = Path(file.filename or f"image_{i}.png").suffix or ".png"
        dest = job_dir / f"image_{i:02d}{ext}"
        with open(dest, "wb") as f:
            content = await file.read()
            f.write(content)
        saved_files.append(str(dest))

    jobs[job_id] = JobState(job_id=job_id, image_paths=saved_files)

    return UploadResponse(
        job_id=job_id,
        files=[Path(f).name for f in saved_files],
    )
