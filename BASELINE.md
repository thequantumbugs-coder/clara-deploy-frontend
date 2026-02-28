# Code Structure Baseline

This document captures the current code structure of the CLARA deployment as of the baseline. Use it as a reference before making large changes.

---

## Repository layout

```
clara-deploy-frontend/             # repo root
├── BASELINE.md                    # This file
├── backend/                       # Python FastAPI + WebSocket server
│   ├── main.py                    # App entry, WS handler, TTS/STT/RAG orchestration
│   ├── config.py                  # Env/config (Groq, Sarvam, DB, etc.)
│   ├── db.py                      # PostgreSQL + RAG (pgvector)
│   ├── rag.py                     # get_relevant_context, embeddings
│   ├── answer_generation.py       # Intent, overview vs normal, Groq prompts
│   ├── greetings.py               # GREETINGS by language
│   ├── stt.py                     # wav_to_transcript (Sarvam/Whisper)
│   ├── ingest_college_knowledge_pg.py
│   ├── core/
│   │   ├── audio_pipeline.py      # record_audio
│   │   └── __init__.py
│   ├── tools/
│   │   └── mic_probe.py
│   ├── models/
│   │   └── __init__.py
│   └── test_db_rag.py
├── frontend/                      # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx                # State machine (0=Sleep, 3=Lang, 4|5=Chat), WS
│   │   ├── main.tsx
│   │   ├── context/
│   │   │   └── LanguageContext.tsx # language, t(), translations (incl. digital book copy)
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useVoiceAnalyser.ts
│   │   │   ├── useSpeechRecognition.ts
│   │   │   └── useAnimeAnimations.ts
│   │   ├── types/
│   │   │   └── chat.ts            # ChatMessage, CollegeBriefMessage, etc.
│   │   ├── utils/
│   │   │   ├── intentClassifier.ts # isAboutCollegeIntent, getMessageIntent
│   │   │   └── parseOverviewReply.ts # (5 sections; not used for book content)
│   │   └── components/
│   │       ├── SleepScreen.tsx
│   │       ├── LanguageSelect.tsx
│   │       ├── ChatScreen.tsx     # Chat + Digital Book flow, split/fullscreen
│   │       ├── VoiceOrb.tsx, VoiceOrbCanvas.tsx, VoiceWaveformVisualizer.tsx
│   │       ├── BackgroundParticles.tsx
│   │       └── chat/
│   │           ├── DigitalBook.tsx # Spiral book, cover + 5 pages, diary_tts, onComplete
│   │           ├── CollegeDiaryCard.tsx
│   │           ├── ClaraBubble, UserBubble, SystemBubble
│   │           ├── CardMessage, ImageCard
│   │           └── ...
│   ├── package.json, vite.config.ts, tsconfig.json
│   └── e2e/
│       └── chat-flow.spec.ts
└── config/
    └── ui_config.json
```

---

## App flow (frontend)

- **State (effectiveState):** 0 = Sleep, 3 = Language select, 4|5 = Chat. URL `?state=5` overrides; keys 0–8 in dev switch state.
- **Chat (state 4|5):** Renders `ChatScreen`. When user asks about college (about-college intent), `overviewSessionId` is set and **Digital Book flow** runs: full-screen `DigitalBook` only (chat hidden). Book opens immediately (no wait for LLM reply). Content = translated copy from `LanguageContext` (5 pages + cover). TTS via `diary_tts`; first incoming audio (overview reply TTS) is skipped. Page advance on TTS end or 15s fallback. On last page, `onComplete` → back to chat.
- **ChatScreen** when not in book flow: split (70% visual / 30% chat) when intent is informational/about-college; otherwise fullscreen. Does not play `payload.audioBase64` when `isDigitalBookFlow` is true.

---

## WebSocket contract (unchanged by baseline)

- **Payload:** `messages`, `isProcessing`, `isSpeaking`; optional `error`, `audioBase64`.
- **Frontend → Backend:** e.g. `wake`, `language_selected`, `conversation_started`, `mic_start`, user text messages, `diary_tts` (with `text` for digital book TTS).

---

## Digital Book (current behavior)

- **Content:** Cover (visual only, auto-flip 2.5s) + 5 pages from `LanguageContext`: `bookPage1Title/Content` … `bookPage5Title/Content` (About the Institution, Academic Programs, Quality & Infrastructure, Achievements & Recognition, Placement & Career Support). All 6 languages.
- **TTS:** `sendMessage({ action: 'diary_tts', text: pageText })` per content page. Advance on audio `ended`; 15s fallback if no audio. `skipFirstAudio` used to ignore overview reply TTS.
- **Exit:** `onComplete()` on last page → `setCompletedOverviewId(overviewSessionId)` → return to chat.

---

## Backend (current behavior)

- **main.py:** WebSocket handler; on user message runs intent (overview vs normal), RAG, answer_generation (Groq); TTS via Sarvam; sends messages + optional `audioBase64`. Handles `diary_tts` for book TTS.
- **answer_generation.py:** `detect_intent`, `build_overview_context` / `build_normal_context`, `generate_reply` (overview = 6-section English then translate; normal = single call). No change to payload shape.
- **db.py, rag.py:** PostgreSQL, pgvector, embeddings for RAG.

---

## Key files to touch for common changes

| Change | Where |
|--------|--------|
| Kiosk states / routing | `frontend/src/App.tsx` |
| Chat vs book, when book opens | `frontend/src/components/ChatScreen.tsx` |
| Book UI, TTS timing, cover/page logic | `frontend/src/components/chat/DigitalBook.tsx` |
| Book copy (all languages) | `frontend/src/context/LanguageContext.tsx` |
| Intent (about college, etc.) | `frontend/src/utils/intentClassifier.ts` |
| WS URL, env | `frontend/.env`, `App.tsx` (WS_URL) |
| API keys, DB, RAG config | `backend/config.py`, `backend/main.py` |
| Overview vs normal reply, prompts | `backend/answer_generation.py` |

---

*Baseline set: structure and behavior as implemented for chat-only + Digital Book (instant open, no overview TTS in chat, book TTS only, 15s fallback, 5 content pages from translations).*
