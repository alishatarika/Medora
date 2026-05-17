from fastapi import APIRouter, Depends
from pydantic import BaseModel
from dependencies import get_current_user
from services.ai_service import get_ai_response, clear_conversation

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatRequest(BaseModel):
    query: str

@router.post("/")
def chat(data: ChatRequest, current_user=Depends(get_current_user)):
    if not data.query.strip():
        return {"response": "Please type something."}
    # Use user ID so each user has their own conversation history
    response = get_ai_response(data.query, user_id=str(current_user.id))
    return {"response": response}

@router.post("/clear")
def clear_chat(current_user=Depends(get_current_user)):
    """Reset conversation history for the current user."""
    clear_conversation(str(current_user.id))
    return {"message": "Conversation cleared."}
