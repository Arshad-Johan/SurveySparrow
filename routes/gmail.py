import os
import logging
import warnings
from fastapi import APIRouter
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from transformers import pipeline

gmail_router = APIRouter()

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# Initialize summarizer and quick reply generator
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
reply_generator = pipeline("text-generation", model="gpt2")

logger = logging.getLogger(__name__)

warnings.filterwarnings("ignore", message="file_cache is only supported with oauth2client<4.0.0")


def authenticate_gmail(force_reauth=False):
    """
    Authenticate with Gmail API.
    - If token.json exists (and force_reauth=False), reuse it.
    - Otherwise, run the local server flow to get a new token.
    """
    creds = None
    token_file = "token.json"

    # 1. If we already have token.json and not forcing re-auth, reuse it
    if os.path.exists(token_file) and not force_reauth:
        logger.info("✅ Using existing token.json for authentication.")
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)
        # If creds are invalid or expired, the request to the Gmail API will fail
        # so we can handle that scenario below if needed
    else:
        # 2. We either forced reauth or token.json doesn't exist
        logger.info("🔄 No valid token found or force_reauth=True. Running local server flow...")
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(
            port=8081,              # or another free port
            prompt='consent',       # force Google to show the consent screen again
            access_type='offline'   # request a refresh token
        )

        # 3. Save the new token for next time
        with open(token_file, "w") as token:
            token.write(creds.to_json())
            logger.info("✅ New token.json created.")

    return creds


def categorize_email(email_subject, email_body):
    """
    Categorizes an email based on its subject and body content.
    """
    subject_lower = email_subject.lower()
    body_lower = email_body.lower()

    # Expanded list of urgent keywords
    urgent_keywords = [
        "urgent", "asap", "immediately", "important", "critical", "action required",
        "meeting", "deadline", "security issue", "payment", "invoice", "response needed",
        "time-sensitive", "high priority", "emergency", "pressing", "imperative", "alert",
        "crucial", "very important","high-priority"
    ]

    # Expanded list of mid-priority keywords
    mid_priority_keywords = [
        "follow-up", "reminder", "update", "pending", "action needed",
        "new release", "schedule", "report", "assignment", "task",
        "check in", "progress", "status update", "request", "friendly reminder",
        "in progress", "review", "due soon", "upcoming", "follow up"
    ]

    # Check for urgent
    if any(word in subject_lower or word in body_lower for word in urgent_keywords):
        return "Urgent"
    # Check for mid priority
    elif any(word in subject_lower or word in body_lower for word in mid_priority_keywords):
        return "Mid Priority"
    else:
        return "Low Priority"


def summarize_email_text(email_body):
    """
    Uses a Transformer model to generate a summary of an email body.
    """
    if len(email_body) < 30:
        return email_body  # Return as is if it's already short

    summary = summarizer(email_body, max_length=50, min_length=10, do_sample=False)
    return summary[0]['summary_text']


def suggest_quick_reply(email_text):
    """
    Generates a quick reply suggestion based on the email content.
    """
    prompt = f"Email: {email_text}\nQuick reply suggestion:"
    result = reply_generator(prompt, max_new_tokens=30, num_return_sequences=1, truncation=True)

    generated = result[0]["generated_text"]
    suggestion = generated.split("Quick reply suggestion:")[-1].strip()

    return suggestion if suggestion else "No reply suggestion."


def fetch_and_process_emails():
    """
    Fetch and process emails from the last 7 days using existing or newly obtained token.
    """
    creds = authenticate_gmail(force_reauth=False)
    service = build("gmail", "v1", credentials=creds)

    # -----------------------------------------------
    # 1. Fetch all messages from the last 1 day
    # -----------------------------------------------
    query = "newer_than:1d"  # messages from the last 1 day
    all_messages = []
    next_page_token = None

    while True:
        # Gmail allows up to 500 for maxResults, here we use 100 for demonstration
        results = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=100,
            pageToken=next_page_token
        ).execute()

        messages = results.get("messages", [])
        if not messages:
            break

        all_messages.extend(messages)
        next_page_token = results.get("nextPageToken")
        if not next_page_token:
            break

    logger.info(f"✅ Fetched {len(all_messages)} messages from the last 1 day.")

    # -----------------------------------------------
    # 2. Process each message (summarize, categorize, etc.)
    # -----------------------------------------------
    email_details = []
    for msg in all_messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()

        # Extract Subject
        subject = next(
            (header["value"] for header in msg_data.get("payload", {}).get("headers", [])
             if header["name"].lower() == "subject"),
            "No Subject"
        )

        # Snippet is a short preview of the email body
        body_snippet = msg_data.get("snippet", "")

        # Summarize, categorize, and suggest a quick reply
        summary = summarize_email_text(body_snippet) if body_snippet else "No Summary Available"
        priority = categorize_email(subject, body_snippet)
        quick_reply = suggest_quick_reply(body_snippet)

        email_details.append({
            "id": msg["id"],
            "subject": subject,
            "summary": summary,
            "priority": priority,
            "quick_reply": quick_reply,
            "needs_follow_up": len(body_snippet) < 30
        })

    return email_details


@gmail_router.get("/process_emails")
def get_processed_emails():
    """
    Endpoint to fetch processed emails with priority segmentation.
    """
    emails = fetch_and_process_emails()

    # Segregate emails based on priority
    urgent_emails = [email for email in emails if email["priority"] == "Urgent"]
    mid_priority_emails = [email for email in emails if email["priority"] == "Mid Priority"]
    low_priority_emails = [email for email in emails if email["priority"] == "Low Priority"]

    return {
        "urgent_emails": urgent_emails,
        "mid_priority_emails": mid_priority_emails,
        "low_priority_emails": low_priority_emails
    }
