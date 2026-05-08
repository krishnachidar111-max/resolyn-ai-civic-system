from fastapi import APIRouter
from ..schemas import ChatbotRequest, ChatbotResponse

router = APIRouter(prefix="/chatbot", tags=["AI Civic Assistant"])


@router.post("/ask", response_model=ChatbotResponse)
def ask_bot(payload: ChatbotRequest):
    msg = payload.message.lower()
    if any(word in msg for word in ["road", "pothole", "gaddha", "sadak"]):
        reply = "Road Damage category select karo, photo upload karo aur map par exact location pin karo. AI ise Road & Transport Department ko assign karega."
    elif any(word in msg for word in ["water", "pani", "pipe"]):
        reply = "Water Supply complaint ke liye description, pincode aur location add karo. 3+ days issue ho to priority Medium/High ho sakti hai."
    elif any(word in msg for word in ["animal", "dog", "cow", "rescue", "injured"]):
        reply = "Animal Emergency page open karke photo + location submit karo. Resolyn nearby verified NGO ko alert karega."
    elif any(word in msg for word in ["track", "status", "complaint number"]):
        reply = "Track Complaint section me RSL-YYYY-XXXXX complaint number enter karo. Timeline, status aur officer remark dikh jayega."
    elif any(word in msg for word in ["electric", "bijli", "wire", "spark"]):
        reply = "Electricity issue me broken wire/spark words mention karo. AI emergency detect karke Electricity Department ko urgent route karega."
    else:
        reply = "Main Resolyn AI civic assistant hoon. Aap complaint category, tracking, department routing, animal rescue ya emergency help ke baare me pooch sakte ho."
    return {"reply": reply}
