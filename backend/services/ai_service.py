import requests
from typing import Dict, List

MODEL_NAME = "llama3"
OLLAMA_URL = "http://localhost:11434/api/chat"

SYSTEM_PROMPT = """You are a professional doctor assistant.

STRICT RULES - FOLLOW EXACTLY:
1. NEVER give a diagnosis immediately
2. ALWAYS ask follow-up questions first
3. Ask AT LEAST 3 questions before suggesting anything:
   - How long have you had this symptom?
   - How severe is it on a scale of 1-10?
   - Do you have any other symptoms?
4. Also consider: lifestyle, environment, travel history, age, medications
5. Only AFTER gathering enough info:
   - List possible causes
   - Give basic precautions
   - Recommend seeing a real doctor

Keep responses SHORT and FOCUSED. Ask ONE question at a time."""

_conversations: Dict[str, List[dict]] = {}


def get_ai_response(user_message: str, user_id: str = "guest") -> str:
    if user_id not in _conversations:
        _conversations[user_id] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

    _conversations[user_id].append({"role": "user", "content": user_message})

    try:
        resp = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "messages": _conversations[user_id],
            "stream": False,
            "keep_alive": "10m",   # keep model loaded for 10 min between requests
            "options": {
                "temperature": 0.3,   # lower = more focused, less random
                "num_predict": 300,   # limit response length
            }
        }, timeout=120)

        if resp.status_code != 200:
            err = resp.json().get("error", resp.text)
            # Memory error — give helpful message
            if "memory" in err.lower():
                return (
                    "⚠️ The AI model needs more RAM to run. "
                    "Please close other applications to free up memory, "
                    "then try again. Alternatively, keep 'ollama run llama3' "
                    "open in a terminal before using this chat."
                )
            return f"⚠️ Ollama error: {err}"

        doctor_reply = resp.json()["message"]["content"]
        _conversations[user_id].append({"role": "assistant", "content": doctor_reply})
        return doctor_reply

    except requests.exceptions.ConnectionError:
        return "⚠️ Cannot connect to Ollama. Run `ollama serve` in a terminal first."
    except Exception as e:
        return f"⚠️ AI error: {str(e)}"


def clear_conversation(user_id: str):
    _conversations.pop(user_id, None)
