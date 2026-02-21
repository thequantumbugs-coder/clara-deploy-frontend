# CLARA Kiosk — Baseline (Current Structure)

This document captures the **baseline** state of the project after structural UI changes. All E2E tests in `frontend/e2e/chat-flow.spec.ts` pass and define the accepted behavior.

**Date:** 2025-02-21

---

## Application Flow

| Step | State | Screen | Transition |
|------|--------|--------|------------|
| 1 | 0 | **Sleep** | Tap → state 3 |
| 2 | 3 | **Language Select** | Select language → state 5 |
| 3 | 5 | **Chat** | Back → state 3 |

**No menu screen.** Language selection goes directly to the Chat interface. Chat "Back" returns to Language Select.

---

## Frontend Structure

```
frontend/
├── e2e/
│   └── chat-flow.spec.ts    # Baseline E2E tests (Playwright)
├── src/
│   ├── App.tsx             # State 0, 3, 4|5 → Sleep, Language, Chat
│   ├── main.tsx
│   ├── index.css
│   ├── context/
│   │   └── LanguageContext.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   └── useVoiceAnalyser.ts
│   ├── types/
│   │   └── chat.ts         # ChatMessage, OrbState, college_brief, image_card
│   └── components/
│       ├── SleepScreen.tsx
│       ├── LanguageSelect.tsx
│       ├── ChatScreen.tsx
│       ├── VoiceOrbCanvas.tsx   # Audio-reactive orb
│       ├── VoiceOrb.tsx         # Legacy (optional)
│       ├── VoiceConversation.tsx
│       └── chat/
│           ├── ClaraBubble.tsx
│           ├── UserBubble.tsx
│           ├── CardMessage.tsx
│           ├── CollegeDiaryCard.tsx   # type: college_brief
│           └── ImageCard.tsx           # type: image_card
```

---

## Chat Message Types

- **text** — Clara / User bubbles (role + text)
- **card** — Glass card with image, title, description, CTAs
- **college_brief** — Diary-style college info card (CollegeDiaryCard)
- **image_card** — Image + optional title/description (ImageCard)

---

## How to Run Baseline Tests

1. **Start backend** (from project root):
   ```bash
   .venv\Scripts\python backend\main.py
   ```
2. **Start frontend**:
   ```bash
   cd frontend && npm run dev
   ```
3. **Run E2E baseline**:
   ```bash
   cd frontend && npm run test:baseline
   ```
   or:
   ```bash
   cd frontend && npx playwright test e2e/chat-flow.spec.ts --project=chromium
   ```

---

## Baseline Test Cases

1. **Sleep → Language → Chat (no menu)**  
   Wake, select English, assert Chat screen with CLARA header, greeting text, and voice orb (no menu step).

2. **URL ?state=5**  
   Direct load to chat; assert chat screen, greeting, orb.

3. **Debug keys 3 then 5**  
   Key 3 → language; key 5 → chat; assert chat visible.

---

## Hardware / Environment

See `HARDWARE.md` for kiosk hardware (Beelink S12 Pro, Intel N100, 13.3" 1080p, etc.).

---

## Backend

- **WebSocket:** `ws://localhost:8000/ws/clara`
- **States:** 0 (sleep), 3 (language), 5 (chat). State 4 is treated as chat.
- **Actions:** `wake`, `language_selected`, `menu_select`, `toggle_mic`, `conversation_started`

---

*Baseline set after E2E tests passed. Future changes should keep these tests green or update this document and tests together.*
