"""
The only place the language model is called. It rephrases an already-correct,
already-safe template hint into warmer language. It never decides correctness
and never invents the hint from scratch: if the model fails or drifts, we
return the original template unchanged.
"""

import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"


def rephrase(template_hint: str, level: int) -> str:
    prompt = (
        "You are Milo, a warm, encouraging coding tutor for a child aged 9 to 13. "
        "Reword the hint below in a friendly, simple way. "
        "Keep it to one or two short sentences. Do not add new instructions. "
        f"{'Do NOT reveal the exact answer; keep it a gentle nudge. ' if level == 1 else ''}"
        f"Hint to reword: {template_hint}"
    )
    try:
        res = httpx.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=20,
        )
        res.raise_for_status()
        text = res.json().get("response", "").strip()
        return text or template_hint
    except Exception:
        # Model down, slow, or errored: the template is already a good hint.
        return template_hint
