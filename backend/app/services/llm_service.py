import json
import logging
import re
from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.schemas.llm import ExplainResponse
from app.services.risk import build_risk
from app.services.process_monitor import get_top_processes

logger = logging.getLogger(__name__)

# --- FIX 1: cold-start timeout / keep_alive -------------------------------
# Ollama's first request after startup loads the model into memory, which
# for qwen2.5:3b-instruct was measured at ~22-40s. 8s was too short and
# caused every cold-start call to time out and fall back. 45s comfortably
# covers a cold load without being unbounded. keep_alive tells Ollama to
# keep the model resident after this call so subsequent calls are fast.
OLLAMA_TIMEOUT_SECONDS = 45.0
OLLAMA_KEEP_ALIVE = "30m"
# ---------------------------------------------------------------------------

TOP_PROCESS_LIMIT = 5

SYSTEM_PROMPT = (
    "You are a system monitoring assistant. You will be given real, "
    "already-computed facts about a laptop's CPU, RAM, and disk risk, "
    "plus the actual top CPU- and RAM-consuming processes captured just now.\n\n"
    "Respond with ONLY a valid JSON object, no markdown, no code fences, "
    "no extra text, in exactly this shape:\n"
    "{\"title\": \"...\", \"explanation\": \"...\", \"recommendation\": \"...\"}\n\n"
    "Rules you must follow:\n"
    "- Use ONLY numbers, percentages, and process names that appear "
    "explicitly in the FACTS block below. Never invent a number, "
    "process name, threshold, or time estimate.\n"
    "- You may identify a process as a top CPU or RAM consumer based on "
    "the supplied process list (e.g. 'X is currently the largest "
    "RAM-consuming process in the captured list').\n"
    "- Do NOT claim a process definitely caused the CPU/RAM/disk "
    "situation unless the facts themselves state that causation. "
    "Correlation shown in the list is not proof of causation.\n"
    "- Keep explanation to 2-4 sentences and recommendation to 1-2 sentences."
)

# --- FIX 2: process-name validation ----------------------------------------
# Matches Windows executable-style tokens (e.g. "python.exe",
# "llama-server.exe"). Used to detect ANY .exe-shaped token the LLM
# mentions, not just ones we already know about - this is what lets us
# catch an invented process name, which the old substring-only check
# could never do.
PROCESS_TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_\-]+\.exe", re.IGNORECASE)


def _find_process_name_mentions(text: str) -> set[str]:
    """Return every .exe-style token mentioned in the LLM's text, regardless
    of whether it's a name we supplied. Callers compare this against the
    allow-list built from the current request's own facts."""
    return set(PROCESS_TOKEN_PATTERN.findall(text))
# ---------------------------------------------------------------------------


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _build_facts_text(metric: str | None) -> tuple[str, dict]:
    risk = build_risk()
    metrics = {"cpu": risk.cpu, "ram": risk.ram, "disk": risk.disk}
    selected = {metric: metrics[metric]} if metric else metrics

    lines = []
    for name, m in selected.items():
        lines.append(
            f"{name.upper()}: current={m.current}%, severity={m.severity}, "
            f"trend={m.trend}, risk_level={m.risk_level}, "
            f"threshold={m.threshold}%, reason=\"{m.reason}\", "
            f"prediction=\"{m.prediction}\""
        )
        if m.time_to_threshold_minutes is not None:
            lines.append(
                f"{name.upper()}_time_to_threshold_minutes={m.time_to_threshold_minutes}"
            )

    top_cpu, top_ram, _ = get_top_processes(limit=TOP_PROCESS_LIMIT)

    lines.append("")
    lines.append("TOP CPU PROCESSES:")
    for p in top_cpu:
        lines.append(f"- {p.name}: {p.cpu_percent}% CPU, {p.memory_mb} MB RAM")

    lines.append("")
    lines.append("TOP RAM PROCESSES:")
    for p in top_ram:
        lines.append(f"- {p.name}: {p.memory_mb} MB RAM")

    facts_text = "\n".join(lines)
    return facts_text, selected


def _collect_allowed_numbers(facts_text: str) -> set[str]:
    return set(re.findall(r"\d+\.?\d*", facts_text))


def _collect_allowed_process_names(top_cpu, top_ram) -> set[str]:
    """Allow-list built ONLY from process names actually present in this
    request's own facts payload - never a hardcoded/global process list."""
    names = {p.name for p in top_cpu} | {p.name for p in top_ram}
    return names


def _deterministic_fallback(metric: str | None, selected: dict, top_cpu, top_ram) -> tuple[str, str, str]:
    title = f"{metric.upper()} Risk Summary" if metric else "System Risk Summary"

    explanation_parts = []
    for name, m in selected.items():
        explanation_parts.append(
            f"{name.upper()} is at {m.current}% ({m.severity}, {m.risk_level} risk). "
            f"{m.reason} {m.prediction}"
        )
    explanation = " ".join(explanation_parts)

    any_high = any(m.risk_level == "high" for m in selected.values())
    if any_high and top_cpu:
        top = top_cpu[0]
        recommendation = (
            f"Consider closing or investigating high-usage applications such as "
            f"{top.name}, currently the top CPU consumer at {top.cpu_percent}%."
        )
    elif any_high and top_ram:
        top = top_ram[0]
        recommendation = (
            f"Consider closing or investigating high-usage applications such as "
            f"{top.name}, currently the top RAM consumer at {top.memory_mb} MB."
        )
    else:
        recommendation = "No action needed at this time."

    return title, explanation, recommendation


async def get_explanation(metric: str | None) -> ExplainResponse:
    facts_text, selected = _build_facts_text(metric)

    top_cpu, top_ram, _ = get_top_processes(limit=TOP_PROCESS_LIMIT)
    allowed_numbers = _collect_allowed_numbers(facts_text)
    allowed_process_names = _collect_allowed_process_names(top_cpu, top_ram)
    allowed_process_names_lower = {n.lower() for n in allowed_process_names}

    fallback_title, fallback_explanation, fallback_recommendation = _deterministic_fallback(
        metric, selected, top_cpu, top_ram
    )

    prompt = f"{SYSTEM_PROMPT}\n\nFACTS:\n{facts_text}"

    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT_SECONDS) as client:
            resp = await client.post(
                f"{settings.ollama_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "keep_alive": OLLAMA_KEEP_ALIVE,
                },
            )
        resp.raise_for_status()
        data = resp.json()
        raw_text = data.get("response", "").strip()

        if not raw_text:
            raise ValueError("empty response")

        parsed = json.loads(raw_text)

        title = parsed.get("title")
        explanation = parsed.get("explanation")
        recommendation = parsed.get("recommendation")

        if not title or not explanation or not recommendation:
            raise ValueError("missing required field(s)")

        combined_text = f"{title} {explanation} {recommendation}"

        # --- numeric validation (unchanged) ---
        found_numbers = re.findall(r"\d+\.?\d*", combined_text)
        if not all(n in allowed_numbers for n in found_numbers):
            raise ValueError("unsupported numeric claim")

        # --- FIX 2: process-name validation ---
        # Detect every .exe-style token the LLM mentioned, then reject if
        # any of them isn't one of the process names actually supplied in
        # THIS request's facts. This catches invented process names, which
        # the previous substring-only check could not.
        mentioned = _find_process_name_mentions(combined_text)
        unsupported = {m for m in mentioned if m.lower() not in allowed_process_names_lower}
        if unsupported:
            raise ValueError(f"unsupported process name(s): {sorted(unsupported)}")

        return ExplainResponse(
            metric=metric,
            title=str(title),
            explanation=str(explanation),
            recommendation=str(recommendation),
            source="llm",
            generated_at=_now(),
        )

    except Exception as exc:
        logger.info("LLM explain falling back to deterministic response: %s: %s", type(exc).__name__, exc)
        return ExplainResponse(
            metric=metric,
            title=fallback_title,
            explanation=fallback_explanation,
            recommendation=fallback_recommendation,
            source="fallback",
            generated_at=_now(),
        )
