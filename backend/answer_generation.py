"""
CLARA answer generation: intent detection, context selection, two-phase overview generation,
and structured prompt building. No WebSocket, payload, session, TTS, or DB changes.
"""

import logging
import re
from typing import Any, List

from config import RAG_MAX_TOKENS, RAG_TOP_K
from rag import get_relevant_context

logger = logging.getLogger(__name__)

INTENT_COLLEGE_OVERVIEW = "COLLEGE_OVERVIEW"
INTENT_NORMAL_QUERY = "NORMAL_QUERY"

OVERVIEW_CONTEXT_MAX_TOKENS = 1000
OVERVIEW_TOP_K = 10
MODEL_CONTEXT_LIMIT = 128_000
MAX_INPUT_TOKEN_FRACTION = 0.7
GROQ_TEMPERATURE = 0.3
GROQ_TOP_P = 0.8
GROQ_MAX_TOKENS = 400

# Fixed query to retrieve overview-oriented chunks (establishment, affiliation, NAAC, programs, etc.)
OVERVIEW_QUERY = (
    "college overview establishment year affiliation VTU AICTE NAAC NBA location campus "
    "programs CSE AI ML data science ECE MBA achievements rankings infrastructure placement"
)

# Overview intent: English and regional phrases (college overview, brief about college, about SVIT, etc.)
OVERVIEW_KEYWORDS_EN = [
    "college overview",
    "brief about the college",
    "about svit",
    "college information",
    "overview of the college",
    "tell me about the college",
    "institute overview",
    "about the college",
    "college brief",
    "overview of college",
    "information about college",
    "about the institute",
]
# Regional phrases for overview intent (about college, college info, brief, etc.)
OVERVIEW_KEYWORDS_REGIONAL = [
    "college overview",
    "about the college",
    "college information",
    "about svit",
    "कॉलेज का विवरण",
    "कॉलेज की जानकारी",
    "ಕಾಲೇಜು ಮಾಹಿತಿ",
    "கல்லூரி தகவல்",
    "కళాశాల సమాచారం",
    "കോളേജ് വിവരം",
]


def _normalize_text(text: str | None) -> str:
    """Lowercase, strip, collapse spaces. Safe for None."""
    if text is None or not isinstance(text, str):
        return ""
    return re.sub(r"\s+", " ", text.strip().lower())


def detect_intent(text: str) -> str:
    """
    Deterministic intent detection. Returns COLLEGE_OVERVIEW if query matches
    overview keywords (English or regional); else NORMAL_QUERY. No LLM.
    """
    normalized = _normalize_text(text)
    if not normalized:
        return INTENT_NORMAL_QUERY
    for phrase in OVERVIEW_KEYWORDS_EN:
        if phrase in normalized:
            return INTENT_COLLEGE_OVERVIEW
    for phrase in OVERVIEW_KEYWORDS_REGIONAL:
        if phrase in normalized:
            return INTENT_COLLEGE_OVERVIEW
    return INTENT_NORMAL_QUERY


FALLBACK_MSG = "I'm sorry, I couldn't process your request right now."
FALLBACK_CONTEXT_PREFIX = "Based on our college information: "
FALLBACK_CONTEXT_MAX_CHARS = 600


def _fallback_reply(context: str) -> str:
    """Return safe fallback when LLM fails. Never returns None."""
    if context and context.strip():
        trimmed = context.strip()
        if len(trimmed) > FALLBACK_CONTEXT_MAX_CHARS:
            trimmed = trimmed[: FALLBACK_CONTEXT_MAX_CHARS - 3].rsplit(maxsplit=1)[0] + "..."
        return FALLBACK_CONTEXT_PREFIX + trimmed
    return FALLBACK_MSG


def build_overview_context() -> str:
    """
    Return overview-oriented RAG context, hard-capped at OVERVIEW_CONTEXT_MAX_TOKENS (1000).
    Uses fixed canonical query; no DB schema changes.
    """
    return get_relevant_context(
        OVERVIEW_QUERY,
        top_k=OVERVIEW_TOP_K,
        max_tokens=OVERVIEW_CONTEXT_MAX_TOKENS,
    )


def build_normal_context(query: str) -> str:
    """Thin wrapper around get_relevant_context for normal (non-overview) queries."""
    return get_relevant_context(
        query,
        top_k=RAG_TOP_K,
        max_tokens=RAG_MAX_TOKENS,
    )


def build_system_prompt(intent: str, language: str, context: str | None) -> str:
    """
    Build system prompt for Groq. COLLEGE_OVERVIEW: strict 6-section English-only.
    NORMAL_QUERY: existing CLARA style with reply in selected language.
    """
    ctx = (context or "").strip()
    if intent == INTENT_COLLEGE_OVERVIEW:
        prefix = (
            "You are CLARA, a professional campus assistant. "
            "You MUST respond using EXACTLY six numbered sections in this order: "
            "1) About the Institution 2) Academic Programs 3) Quality & Infrastructure "
            "4) Achievements & Recognition 5) Placement & Career Support 6) Closing Assurance. "
            "Rules: Use exactly the numbering format shown above. Do not change the order. Do not skip numbers. "
            "Do not merge sections. Each section must contain 1–2 short sentences. Maximum 12 sentences total. "
            "Plain text only. No markdown. No bullets. No emojis. No extra introduction. No extra closing lines. "
            "Parent-focused tone. Use only verified college information from the context. "
            "If information is missing, explicitly state 'Information not available.'"
        )
        return f"{prefix}\n\nCollege information:\n{ctx}" if ctx else prefix
    # NORMAL_QUERY
    if ctx:
        return (
            f"You are CLARA, a friendly campus assistant. "
            f"Use ONLY the following college information when it is relevant to the user's question. "
            f"Do not invent or assume college-specific facts; only use what is in the College information below. "
            f"If the answer is not in the context, say you don't have that information. "
            f"Reply only in {language}. Be concise and helpful.\n\nCollege information:\n{ctx}"
        )
    return (
        f"You are CLARA, a friendly campus assistant. "
        f"For questions about the college or campus, say you don't have that information if you're unsure. "
        f"Reply only in {language}. Be concise and helpful."
    )


def _count_tokens(text: str) -> int:
    """Return token count using tiktoken cl100k_base. Returns 0 on error."""
    if not text:
        return 0
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except Exception:
        return 0


def _trim_to_tokens(text: str, max_tokens: int) -> str:
    """Trim text to at most max_tokens. Returns text unchanged if already within limit."""
    if max_tokens <= 0 or not text:
        return text
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        tokens = enc.encode(text)
        if len(tokens) <= max_tokens:
            return text
        return enc.decode(tokens[:max_tokens])
    except Exception:
        return text


def generate_structured_overview(
    system_prompt: str,
    context: str,
    groq_client: Any,
    model: str,
) -> str:
    """
    Phase 1: Generate structured college overview in English only.
    Uses temperature=0.3, top_p=0.8, max_tokens=400. On failure returns empty string (caller uses fallback).
    """
    if not groq_client or not model:
        return ""
    try:
        prompt_tokens = _count_tokens(system_prompt) + _count_tokens("Provide the college overview in the required structure.")
        if prompt_tokens > int(MODEL_CONTEXT_LIMIT * MAX_INPUT_TOKEN_FRACTION):
            system_prompt = _trim_to_tokens(system_prompt, int(MODEL_CONTEXT_LIMIT * MAX_INPUT_TOKEN_FRACTION) - 50)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Provide the college overview in the required structure."},
        ]
        completion = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=GROQ_TEMPERATURE,
            top_p=GROQ_TOP_P,
            max_tokens=GROQ_MAX_TOKENS,
        )
        out = (completion.choices[0].message.content or "").strip()
        if out:
            logger.info("Overview generated model=%s tokens_approx=%d", model, prompt_tokens)
        return out
    except Exception as e:
        logger.error("LLM failure (structured overview): %s", e, exc_info=True)
        return ""


def translate_preserving_structure(
    english_text: str,
    target_language: str,
    groq_client: Any,
    model: str,
) -> str:
    """
    Phase 2: Translate English overview into target_language, preserving structure.
    On failure logs warning and returns english_text (graceful fallback).
    """
    if not english_text or not target_language or target_language.lower() == "english":
        return english_text or ""
    if not groq_client or not model:
        return english_text
    try:
        system_content = (
            f"Translate the following text into {target_language}. "
            "Preserve structure, sentence count, and meaning exactly. Do not expand or shorten. Output only the translation."
        )
        messages = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": english_text},
        ]
        completion = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=GROQ_TEMPERATURE,
            top_p=GROQ_TOP_P,
            max_tokens=GROQ_MAX_TOKENS,
        )
        out = (completion.choices[0].message.content or "").strip()
        return out if out else english_text
    except Exception as e:
        logger.warning("Translation fallback to English: %s", e)
        return english_text


def generate_reply(
    intent: str,
    text: str,
    context: str,
    language: str,
    session_messages: List[dict],
    groq_client: Any,
    model: str,
) -> str:
    """
    Orchestrator: COLLEGE_OVERVIEW = two-phase (English then translate); NORMAL_QUERY = single call.
    Token-safe: truncates context before calling Groq. On any failure returns fallback string; never None.
    """
    safe_context = (context or "").strip()
    if not groq_client or not model:
        return _fallback_reply(safe_context)

    if intent == INTENT_COLLEGE_OVERVIEW:
        try:
            system_prompt = build_system_prompt(INTENT_COLLEGE_OVERVIEW, "English", safe_context)
            reply_text = generate_structured_overview(system_prompt, safe_context, groq_client, model)
            if not reply_text:
                return _fallback_reply(safe_context)
            if language and language != "English":
                reply_text = translate_preserving_structure(reply_text, language, groq_client, model)
            return reply_text or _fallback_reply(safe_context)
        except Exception as e:
            logger.error("LLM failure (overview): %s", e, exc_info=True)
            return _fallback_reply(safe_context)

    # NORMAL_QUERY: token safety before Groq call
    try:
        system_prompt = build_system_prompt(INTENT_NORMAL_QUERY, language, safe_context)
        rest_tokens = sum(_count_tokens(m.get("text", "") or "") for m in (session_messages or [])) + _count_tokens(text or "")
        total_tokens = _count_tokens(system_prompt) + rest_tokens
        max_allowed = int(MODEL_CONTEXT_LIMIT * MAX_INPUT_TOKEN_FRACTION)
        if total_tokens > max_allowed and safe_context:
            normal_prefix = (
                f"You are CLARA, a friendly campus assistant. "
                f"Use ONLY the following college information when it is relevant to the user's question. "
                f"Do not invent or assume college-specific facts; only use what is in the College information below. "
                f"If the answer is not in the context, say you don't have that information. "
                f"Reply only in {language}. Be concise and helpful.\n\nCollege information:\n"
            )
            prefix_tokens = _count_tokens(normal_prefix)
            max_context_tokens = max(0, max_allowed - prefix_tokens - rest_tokens)
            trimmed_context = _trim_to_tokens(safe_context, max_context_tokens)
            system_prompt = normal_prefix + trimmed_context
            logger.info("Context truncated to fit model limit; approx_tokens=%d", _count_tokens(trimmed_context))
        messages = [{"role": "system", "content": system_prompt}]
        for m in session_messages or []:
            role = "assistant" if m.get("role") == "clara" else "user"
            messages.append({"role": role, "content": m.get("text", "") or ""})
        messages.append({"role": "user", "content": text or ""})

        completion = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=GROQ_TEMPERATURE,
            top_p=GROQ_TOP_P,
            max_tokens=GROQ_MAX_TOKENS,
        )
        out = (completion.choices[0].message.content or "").strip()
        if out:
            logger.info("Reply generated intent=%s model=%s", intent, model)
        return out if out else _fallback_reply(safe_context)
    except Exception as e:
        logger.error("LLM failure (normal query): %s", e, exc_info=True)
        return _fallback_reply(safe_context)
