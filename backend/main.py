from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import uploads, jobs

app = FastAPI(title="RESPLAT Video Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uploads.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
