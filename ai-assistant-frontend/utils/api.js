import axios from "axios";

// Point to your FastAPI server
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// 📩 Fetch categorized emails
export async function fetchEmails() {
  try {
    const response = await api.get("/gmail/process_emails");

    // Return categorized emails separately
    return {
      urgent: response.data.urgent_emails || [],
      mid: response.data.mid_priority_emails || [],
      low: response.data.low_priority_emails || [],
    };
  } catch (error) {
    console.error("Error fetching emails:", error.message);
    return { urgent: [], mid: [], low: [] };
  }
}


// 🔵 Fetch Slack channels list
export async function fetchSlackChannels() {
  try {
    const response = await api.get("/slack/channels");
    return response.data.channels || [];
  } catch (error) {
    console.error("Error fetching Slack channels:", error.message);
    return [];
  }
}

export async function fetchSlackFromChannel(channelId) {
  if (!channelId) {
    console.error("Error: Channel ID is required to fetch Slack messages.");
    return [];
  }

  try {
    const response = await api.get(`/slack/fetch_summarized?channel_id=${channelId}`);
    return response.data.summarized_slack_messages || [];
  } catch (error) {
    console.error("Error fetching Slack messages:", error.message);
    return [];
  }
}


// 🔷 Fetch all Telegram messages
export async function fetchTelegramAll() {
  try {
    const res = await api.get("/telegram/fetch_summarized");
    return res.data.summarized_telegram_messages || [];
  } catch (error) {
    console.error("Error fetching Telegram messages:", error.message);
    return [];
  }
}

export async function fetchSlackDailySummary(channelId) {
  if (!channelId) {
    console.error("Error: Slack channel ID is required for daily summary.");
    return "";
  }
  try {
    const response = await api.get(`/slack/fetch_summarized_daily?channel_id=${channelId}`);

    // If backend returns a pre-generated summary
    if (response.data.all_summary) {
      return response.data.all_summary;
    }
    
    // If backend returns an array of messages instead of a single summary
    if (response.data.summarized_slack_messages) {
      return response.data.summarized_slack_messages
        .map(msg => msg.summary)
        .join(" ");
    }
    
    return "";
  } catch (error) {
    console.error("Error fetching Slack daily summary:", error.message);
    return "Error fetching summary.";
  }
}



// 🟢 Fetch Telegram daily summary
export async function fetchTelegramDailySummary() {
  try {
    const res = await api.get("/telegram/fetch_summarized_daily");
    return res.data.daily_summary || "";
  } catch (error) {
    console.error("Error fetching Telegram daily summary:", error.message);
    return "Error fetching summary.";
  }
}

/**
 * 📊 Fetch all data in parallel (Emails, Slack, Telegram)
 * Requires `selectedSlackChannelId` to fetch Slack messages properly.
 */
export async function fetchAllData(selectedSlackChannelId) {
  try {
      const [emails, slack, telegram] = await Promise.all([
          fetchEmails(),
          selectedSlackChannelId ? fetchSlackFromChannel(selectedSlackChannelId) : [],
          fetchTelegramAll(),
      ]);

      return {
          emails: emails || [], // Ensure it's always an array
          slack: slack || [],
          telegram: telegram || []
      };
  } catch (error) {
      console.error("Error fetching all data:", error.message);
      return { emails: [], slack: [], telegram: [] };
  }
}



// 🚪 Logout user
export async function logout() {
  try {
    const response = await api.get("/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error.message);
    return { error: error.message };
  }
}
