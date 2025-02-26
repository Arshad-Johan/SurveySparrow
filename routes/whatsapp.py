import os
from fastapi import APIRouter
from twilio.rest import Client
from utils.summarizer import summarize_text
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

whatsapp_router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
MY_WHATSAPP_NUMBER = os.getenv("MY_WHATSAPP_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def fetch_and_summarize_whatsapp_messages():
    try:
        messages = client.messages.list(limit=5)
        summarized_messages = []
        for msg in messages:
            text = msg.body
            summary = summarize_text(text)
            summarized_messages.append({"text": text, "summary": summary})
        return summarized_messages
    except Exception as e:
        # Log or handle errors as needed
        print(f"Error fetching WhatsApp messages: {e}")
        return {"error": str(e)}

@whatsapp_router.get("/fetch_summarized")
def get_summarized_whatsapp_messages():
    messages = fetch_and_summarize_whatsapp_messages()
    return {"summarized_whatsapp_messages": messages}
