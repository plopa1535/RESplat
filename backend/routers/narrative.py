from pathlib import Path
from fastapi import APIRouter, HTTPException
from models.schemas import NarrativeRequest, NarrativeResponse
from services.job_store import jobs
from services.llm_narrative import generate_narrative

router = APIRouter()


@router.post("/narrative/generate", response_model=NarrativeResponse)
async def generate_narrative_endpoint(req: NarrativeRequest):
    """Generate a narrative from uploaded images, optionally merging with user text."""
    if req.job_id not in jobs:
        raise HTTPException(404, "Upload job_id not found. Upload images first.")

    job = jobs[req.job_id]

    if not job.image_paths:
        raise HTTPException(400, "No images found for this job.")

    image_paths = [Path(p) for p in job.image_paths]

    # Verify all images exist
    for p in image_paths:
        if not p.exists():
            raise HTTPException(400, f"Image file not found: {p.name}")

    try:
        result = await generate_narrative(
            image_paths=image_paths,
            user_narrative=req.user_narrative,
        )
    except Exception as e:
        raise HTTPException(500, f"Narrative generation failed: {str(e)}")

    return NarrativeResponse(**result)
