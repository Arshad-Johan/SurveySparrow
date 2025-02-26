import os
import logging
from fastapi import APIRouter, Query
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from utils.summarizer import summarize_text  # Your summarizer function (e.g., Bart, T5, etc.)

slack_router = APIRouter()

# Load environment variables (.env) for the Slack bot token.
ENV_FILE_PATH = os.path.join(os.getcwd(), ".env")

def load_env_vars(env_file: str) -> dict:
    env_vars = {}
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("#") or not line.strip():
                    continue
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env_vars = load_env_vars(ENV_FILE_PATH)
SLACK_BOT_TOKEN = env_vars.get("SLACK_BOT_TOKEN", "")

# Initialize the Slack WebClient
slack_client = WebClient(token=SLACK_BOT_TOKEN)

@slack_router.get("/channels")
def get_slack_channels():
    try:
        response = slack_client.conversations_list()
        channels = response.get("channels", [])
        return {"channels": [{"id": ch["id"], "name": ch["name"]} for ch in channels]}
    except SlackApiError as e:
        logging.error(f"Error fetching Slack channels: {e}")
        return {"error": "Failed to fetch channels."}

@slack_router.get("/fetch_summarized")
def get_summarized_slack_messages(channel_id: str = Query(..., description="Slack Channel ID")):
    try:
        response = slack_client.conversations_history(channel=channel_id)
        messages = response.get("messages", [])

        summarized_messages = []
        for msg in messages:
            text = msg.get("text", "")
            user_id = msg.get("user", None)

            sender_name = "Unknown"
            if user_id:
                try:
                    user_info = slack_client.users_info(user=user_id)
                    sender_name = user_info["user"]["real_name"]
                except SlackApiError:
                    pass

            summary = summarize_text(text)
            summarized_messages.append({
                "text": text,
                "summary": summary,
                "sender": sender_name
            })

        return {"summarized_slack_messages": summarized_messages}
    except SlackApiError as e:
        logging.error(f"Error fetching Slack messages: {e}")
        return {"error": "Failed to fetch messages."}

def fetch_all_slack_messages(channel_id: str):
    """
    Fetches ALL Slack messages from the specified channel, handling pagination.
    Returns a list of { text, sender, timestamp } for each message.
    """
    all_messages = []
    next_cursor = None
    page_count = 0

    while True:
        page_count += 1
        try:
            params = {
                "channel": channel_id,
                "limit": 200  # Slack returns up to 200 messages per call
            }
            if next_cursor:
                params["cursor"] = next_cursor

            logging.info(f"[DEBUG] Fetching page {page_count} with params: {params}")
            response = slack_client.conversations_history(**params)
            messages = response.get("messages", [])
            logging.info(f"[DEBUG] Fetched {len(messages)} messages on page {page_count}")

            all_messages.extend(messages)

            if response.get("has_more"):
                next_cursor = response.get("response_metadata", {}).get("next_cursor")
                logging.info(f"[DEBUG] has_more=True, next_cursor={next_cursor}")
                if not next_cursor:
                    break
            else:
                logging.info("[DEBUG] has_more=False, no more pages.")
                break

        except SlackApiError as e:
            logging.error(f"[DEBUG] SlackApiError on page {page_count}: {e}")
            break

    logging.info(f"[DEBUG] Total messages fetched: {len(all_messages)}")

    all_msgs_list = []
    for msg in all_messages:
        text = msg.get("text", "")
        user_id = msg.get("user", None)
        sender_name = "Unknown"
        if user_id:
            try:
                user_info = slack_client.users_info(user=user_id)
                sender_name = user_info["user"]["real_name"]
            except SlackApiError as ex:
                logging.error(f"[DEBUG] Error fetching user info for {user_id}: {ex}")
        ts_str = msg.get("ts", "0")
        try:
            timestamp = float(ts_str)
        except ValueError:
            timestamp = 0.0
        all_msgs_list.append({
            "text": text,
            "sender": sender_name,
            "timestamp": timestamp
        })

    return all_msgs_list

@slack_router.get("/fetch_summarized_daily")
def get_summarized_slack_all(channel_id: str = Query(..., description="Slack Channel ID")):
    """
    Returns a single summary of ALL Slack messages from the specified channel.
    If no messages exist, returns a default message.
    """
    all_msgs = fetch_all_slack_messages(channel_id)
    if not all_msgs:
        return {"all_summary": "No Slack messages found in this channel."}

    combined_text = "\n".join(f"{m['sender']}: {m['text']}" for m in all_msgs)
    summary = summarize_text(combined_text)
    return {"all_summary": summary}
