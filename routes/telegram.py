import os
import logging
import requests
from datetime import datetime
from fastapi import APIRouter
from typing import List, Dict
from utils.summarizer import summarize_text  # Import summarization function

telegram_router = APIRouter()

# In-memory storage for Telegram messages.
telegram_messages: List[Dict] = []

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GROUP_CHAT_ID = os.getenv("GROUP_CHAT_ID", "")  # Optional filtering by chat
IGNORED_MESSAGE_ID1 = 159  # Message ID to be ignored
IGNORED_MESSAGE_ID2 = 170  # Message ID to be ignored

def fetch_telegram_messages():
    """Fetch all Telegram messages and process them, except message ID 159."""

    if not TELEGRAM_BOT_TOKEN:
        logging.error("TELEGRAM_BOT_TOKEN is not set.")
        return

    base_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"

    try:
        response = requests.get(base_url, timeout=10)
        data = response.json()
    except Exception as e:
        logging.error(f"Error fetching updates from Telegram: {e}")
        return

    updates = data.get("result", [])

    telegram_messages.clear()  # Clear old messages

    for update in updates:
        if "message" in update:
            message = update["message"]
            message_id = message.get("message_id")  # Get the message ID

            # Skip processing message ID 159
            if message_id == IGNORED_MESSAGE_ID1 or message_id == IGNORED_MESSAGE_ID2:
                continue

            chat_id = message["chat"]["id"]

            # Extract sender details
            sender_first = message.get("from", {}).get("first_name", "")
            sender_last = message.get("from", {}).get("last_name", "")
            sender = (sender_first + " " + sender_last).strip() or "Unknown"

            # Get message text and clean it
            text = message.get("text", "").strip()
            text = text.replace("\n", " ").replace("\r", " ")  # Remove newline issues

            if text:
                summary = summarize_text(text)  # Use imported summarization function
                telegram_messages.append({
                    "message_id": message_id,
                    "text": text,
                    "summary": summary,
                    "sender": sender,
                    "chat_id": chat_id,
                    "timestamp": datetime.utcfromtimestamp(message.get("date", 0))
                })


@telegram_router.get("/fetch_all")
def get_all_telegram_messages():
    """Fetches the latest messages from Telegram and returns **all stored messages**, excluding message ID 159."""
    fetch_telegram_messages()
    return {"all_telegram_messages": telegram_messages}


@telegram_router.get("/fetch_summarized")
def get_summarized_telegram_messages():
    """Fetches the latest messages from Telegram and returns **all stored messages** with summaries, excluding message ID 159."""
    fetch_telegram_messages()
    return {"summarized_telegram_messages": telegram_messages}


@telegram_router.get("/fetch_summarized_daily")
def get_summarized_daily():
    """Fetch all messages from Telegram and summarize them, excluding message ID 159."""
    fetch_telegram_messages()

    if not telegram_messages:
        return {"daily_summary": "No messages available."}

    # Combine all messages
    combined_text = "\n".join(f"{m['sender']}: {m['text']}" for m in telegram_messages)

    # Summarize all messages using the external summarizer function
    daily_summary = summarize_text(combined_text)

    return {"daily_summary": daily_summary}
