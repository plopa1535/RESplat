# RESPLAT - AI Cinematic Video Generator

> 사진 + 서사를 입력하면 AI가 10초짜리 시네마틱 영상을 자동 생성하는 웹앱

---

## Architecture

```
[Next.js :3000] ──HTTP──> [FastAPI :8000] ──API──> [Replicate (Kling v2.1)]
                                │
                          [FFmpeg] ← clip trim / concat / subtitle burn
                                │
                          [final.mp4]
```

| Layer | Tech | Role |
|-------|------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | UI: upload + preview |
| Backend | Python FastAPI | API, pipeline orchestration |
| AI Video | Replicate API (Kling v2.1) | Image-to-video generation |
| Post-processing | FFmpeg | Trim, concat, subtitle burn |

---

## Prerequisites

1. **Node.js** (v18+) + npm
2. **Python** (3.11+)
3. **FFmpeg** installed and in PATH
4. **Replicate API token** in `backend/.env`

---

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
# Edit .env with your REPLICATE_API_TOKEN
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
RESPLAT/
├── frontend/                    # Next.js
│   └── src/
│       ├── app/
│       │   ├── upload/page.tsx  # Photo upload + narrative input
│       │   └── preview/[jobId]/page.tsx  # Progress + preview + download
│       ├── components/          # PhotoUploader, NarrativeInput, ProgressTracker, VideoPlayer, etc.
│       ├── lib/api.ts           # API client
│       └── hooks/useJobPolling.ts
│
├── backend/                     # FastAPI
│   ├── main.py                  # App entry, CORS
│   ├── routers/
│   │   ├── uploads.py           # POST /api/upload
│   │   └── jobs.py              # POST /api/jobs, GET status, GET video
│   └── services/
│       ├── narrative.py         # Narrative → subtitle segments
│       ├── video_gen.py         # Replicate API calls
│       ├── compositor.py        # FFmpeg operations
│       ├── pipeline.py          # Full pipeline orchestrator
│       └── job_store.py         # In-memory job state
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload 1-5 images |
| POST | `/api/jobs` | Create video generation job |
| GET | `/api/jobs/{id}` | Poll job status |
| GET | `/api/jobs/{id}/video` | Download final MP4 |

---

## Pipeline Flow

1. **Narrative split** → text divided into N segments (10/N seconds each)
2. **AI clip generation** → each image + prompt → Replicate → video clip
3. **Normalize + trim** → FFmpeg forces 720p/24fps, trims to exact duration
4. **Concatenate** → FFmpeg concat demuxer joins clips
5. **Subtitle burn** → SRT generated → hard-burned into video
6. **Output** → 10-second MP4 (1280x720, H.264)

---

## Video Specs

- Resolution: 1280x720 (720p)
- FPS: 24
- Codec: H.264 / AAC
- Format: MP4
- Duration: exactly 10 seconds
