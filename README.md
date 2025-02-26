AI Communication Assistant
==========================

An AI-powered communication assistant that integrates Gmail, Slack and Telegram into a single, user-friendly platform.

Overview
--------

I developed this project as a solo contributor to streamline communication management across multiple platforms. The system aggregates emails, Slack messages and Telegram messages, providing concise summaries and automated quick reply suggestions using state-of-the-art NLP models. This solution is designed to help users prioritize important communications while reducing information overload.

Features
--------

*   **Multi-Platform Integration:** Consolidates communications from Gmail, Slack and Telegram.
    
*   **Message Summarization:** Utilizes Facebook BART for summarizing lengthy messages.
    
*   **Quick Reply Suggestions:** Generates automated quick replies using GPT-2.
    
*   **Priority Categorization:** Automatically classifies emails into urgent, mid-priority, and low-priority based on key phrases.
    
*   **Responsive UI:** Built with React/Next.js and Tailwind CSS, featuring dark mode support and real-time data refresh.
    
*   **Modular Architecture:** Separates functionality into distinct backend routes for maintainability and scalability.
    

Technologies Used
-----------------

*   **Backend:** Python, FastAPI, Uvicorn
    
*   **Frontend:** React, Next.js, Tailwind CSS
    
*   **NLP Models:** Facebook BART (for summarization)GPT-2 (for quick reply generation)
    
*   **APIs & Integrations:** Gmail API, Slack API, Telegram Bot API
    
*   **Other Tools:** dotenv for environment variable management, logging, and modular code organization
    

Setup and Installation
----------------------

### Prerequisites

*   Modern operating system (Windows, macOS, or Linux)
    
*   Python 3.7+
    
*   Node.js (v12+)
    
*   Git
    

### Backend Setup

**Clone the Repository:**

`git clone   cd` 

**Create a Virtual Environment and Install Dependencies:**
`python -m venv venv  source venv/bin/activate`
`venv\Scripts\activate`
`pip install -r requirements.txt`

**Configure Environment Variables:**

Create a .env file in the root directory with the following (update with your credentials):

`TELEGRAM_BOT_TOKEN=your_telegram_bot_token`
`GROUP_CHAT_ID=your_telegram_group_chat_id`
`SLACK_BOT_TOKEN=your_slack_bot_token`

**Gmail Credentials:**

For Gmail integration, you must have a credentials.json file from the Google API Console placed in the root directory.

**Run the Backend Server:**

`  Set-ExecutionPolicy Unrestricted -Scope Process `
` ./restart_bot.ps1 `

### Frontend Setup

**Navigate to the Frontend Directory:**

If the frontend is in a separate directory, navigate there:

`   cd ai-assistant-frontend  `

**Install Dependencies:**

`   npm install   `

**Configure the API URL:**

In api.js, ensure the BASE\_URL is set to your backend's URL.

**Run the Development Server:**

`   npm run dev   `

**Access the Application:**

Open http://localhost:3000  in your browser.

API Endpoints
-------------

The FastAPI backend exposes several endpoints:

### General

*   / – Health check
    
*   /logout – Logs out the user by removing token files
    

### Gmail

*   /gmail/process\_emails – Fetches and processes emails with priority categorization, summarization, and quick reply suggestions
    

### Slack

*   /slack/channels – Retrieves a list of Slack channels
    
*   /slack/fetch\_summarized – Fetches summarized Slack messages for a given channel
    
*   /slack/fetch\_summarized\_daily – Provides a daily summary of Slack messages
    

### Telegram

*   /telegram/fetch\_all – Retrieves all Telegram messages (excluding specified messages)
    
*   /telegram/fetch\_summarized – Retrieves summarized Telegram messages
    
*   /telegram/fetch\_summarized\_daily – Provides a daily summary of Telegram messages
    

    

Usage
-----

Once both the backend and frontend are running:

*   **Email Module:** View categorized email summaries along with quick reply suggestions.
    
*   **Slack Module:** Select a Slack channel, view summarized messages, and read the daily summary.
    
*   **Telegram Module:** Access business group messages and daily summaries.
    
*   **General Interface:** Utilize dark mode, real-time refresh, and intuitive search features to manage communications efficiently.
    

Future Enhancements
-------------------

*   **Performance Optimization:** Further refine asynchronous processing and API call efficiency to reduce latency.
    
*   **User Experience Enhancements:** Introduce advanced filtering options, customizable dashboards, and real-time notifications.
    
*   **Platform Expansion:** Integrate additional communication channels and social media platforms.
    
*   **Advanced NLP Features:** Add sentiment analysis, context-aware reply generation, and trend analytics for deeper insights.
    
*   **Continuous Feedback Loop:** Gather user feedback for iterative improvements and feature refinement.
    

Additional Configuration
------------------------

*   **Environment Variables:** Ensure all necessary API keys and credentials are set in the .env file.
    
*   **Gmail Credentials:** Place your credentials.json file in the root directory for Gmail API authentication.
    
*   **Port Configuration:** The backend server defaults to port 8001; modify if necessary.
    
*   **Frontend API URL:** Verify that the BASE\_URL in api.js matches your backend URL.
