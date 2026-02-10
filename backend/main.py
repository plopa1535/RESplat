import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import uploads, jobs, narrative

app = FastAPI(title="RESPLAT Video Generator")

allowed_origins = [
    "http://localhost:3000",
]
extra_origin = os.getenv("FRONTEND_URL", "")
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uploads.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(narrative.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
