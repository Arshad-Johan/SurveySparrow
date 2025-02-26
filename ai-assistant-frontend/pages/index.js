import { useState, useEffect } from "react";
import DarkModeToggle from "../components/DarkModeToggle";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  fetchAllData,
  fetchSlackChannels,
  fetchSlackFromChannel,
  logout,
  fetchTelegramDailySummary,
  fetchSlackDailySummary,
} from "../utils/api";
import UrgentMidEmails from "../components/UrgentMidEmails";

/**
 * Main Home Component
 */
export default function Home() {
  const [emails, setEmails] = useState({ urgent: [], mid: [], low: [] });
  const [slack, setSlack] = useState([]);
  const [telegram, setTelegram] = useState([]);
  const [slackChannels, setSlackChannels] = useState([]);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState("");

  const [telegramDailySummary, setTelegramDailySummary] = useState("");
  const [slackDailySummary, setSlackDailySummary] = useState("");

  // Search states
  const [emailSearch, setEmailSearch] = useState("");
  const [slackSearch, setSlackSearch] = useState("");
  const [telegramSearch, setTelegramSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSlack, setLoadingSlack] = useState(false);

  useEffect(() => {
    loadSlackChannels();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSlackChannel) {
      loadSlackData();
    }
  }, [selectedSlackChannel]);

  // Fetch Slack channels
  async function loadSlackChannels() {
    try {
      const channels = await fetchSlackChannels();
      setSlackChannels(channels);
    } catch (error) {
      console.error("Error loading Slack channels:", error);
    }
  }

  // Fetch Emails, Slack, Telegram
  async function loadInitialData() {
    setLoading(true);
    try {
      const data = await fetchAllData("");

      setEmails({
        urgent: data.emails?.urgent || [],
        mid: data.emails?.mid || [],
        low: data.emails?.low || [],
      });

      setTelegram(data.telegram || []);
      setSlack(data.slack || []);

      setTelegramDailySummary(await fetchTelegramDailySummary());
      setSlackDailySummary(await fetchSlackDailySummary(selectedSlackChannel));
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch Slack data for a specific channel
  async function loadSlackData() {
    setLoadingSlack(true);
    try {
      const slackData = await fetchSlackFromChannel(selectedSlackChannel);
      setSlack(slackData || []);
      setSlackDailySummary(await fetchSlackDailySummary(selectedSlackChannel));
    } catch (error) {
      console.error("Error loading Slack data:", error);
      alert("Failed to load Slack data. Please try again.");
    } finally {
      setLoadingSlack(false);
    }
  }

  // Logout
  async function handleLogout() {
    const res = await logout();
    if (!res.error) {
      alert("You have been logged out. Refresh to login again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-xl dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left side: Logo + Title */}
          <div className="flex items-center space-x-3">
            <img
              src="https://img.icons8.com/color/48/artificial-intelligence.png"
              alt="AI Logo"
              className="h-10 w-10"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Personal AI Assistant
            </h1>
          </div>

          {/* Right side: Dark Mode, Refresh, Logout */}
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            <button
              onClick={loadInitialData}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Logout Email
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center mt-10">
            <div className="loader"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Loading your messages...
            </p>
          </div>
        ) : (
          <>
            {/* 3-COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EmailSection
                emails={emails}
                search={emailSearch}
                setSearch={setEmailSearch}
              />
              <SlackSection
                messages={slack}
                search={slackSearch}
                setSearch={setSlackSearch}
                slackChannels={slackChannels}
                selectedSlackChannel={selectedSlackChannel}
                setSelectedSlackChannel={setSelectedSlackChannel}
                loadingSlack={loadingSlack}
              />
              <MessageSection
                title="Telegram (Business Group)"
                icon="telegram-app"
                messages={telegram}
                search={telegramSearch}
                setSearch={setTelegramSearch}
              />
            </div>

            {/* Summaries */}
            <SummaryCard
              title="Telegram Daily Summary"
              summary={telegramDailySummary}
            />
            <SummaryCard
              title="Slack Daily Summary"
              summary={slackDailySummary}
            />
          </>
        )}
      </main>

      {/* URGENT & MID PRIORITY EMAILS */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300"></p>
        ) : (
          <UrgentMidEmails urgent={emails.urgent} mid={emails.mid} />
        )}
      </main>
    </div>
  );
}

/* =========================
   EMAIL SECTION WITH SEARCH
   ========================= */
function EmailSection({ emails, search, setSearch }) {
  // Filter urgent, mid, low
  const filteredUrgent = emails.urgent.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
      msg.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMid = emails.mid.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
      msg.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLow = emails.low.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
      msg.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-red-600 dark:text-red-400">
        <img
          src="https://img.icons8.com/color/24/gmail--v1.png"
          alt="Gmail Icon"
          className="mr-2 h-6 w-6"
        />
        Emails (Last 24 hours)
      </h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search Emails..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      />

      {/* URGENT EMAILS */}
      <h3 className="text-lg font-semibold mt-4 text-red-500">🚨 Urgent Emails</h3>
      <div className="overflow-y-auto max-h-40 space-y-3 pr-2 border-l-4 border-red-500 pl-3">
        {filteredUrgent.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No urgent emails.</p>
        ) : (
          filteredUrgent.map((msg, idx) => (
            <PriorityEmailCard key={idx} msg={msg} />
          ))
        )}
      </div>

      {/* MID-PRIORITY EMAILS */}
      <h3 className="text-lg font-semibold mt-6 text-yellow-500">⚠️ Mid Priority Emails</h3>
      <div className="overflow-y-auto max-h-36 space-y-3 pr-2 border-l-4 border-yellow-500 pl-3">
        {filteredMid.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No mid-priority emails.</p>
        ) : (
          filteredMid.map((msg, idx) => (
            <PriorityEmailCard key={idx} msg={msg} />
          ))
        )}
      </div>

      {/* LOW-PRIORITY EMAILS */}
      <h3 className="text-lg font-semibold mt-6 text-gray-500">📩 Low Priority Emails</h3>
      <div className="overflow-y-auto max-h-32 space-y-3 pr-2 border-l-4 border-gray-400 pl-3">
        {filteredLow.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No low-priority emails.</p>
        ) : (
          filteredLow.map((msg, idx) => (
            <PriorityEmailCard key={idx} msg={msg} />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================
   SLACK SECTION WITH SEARCH
   ========================= */
function SlackSection({
  messages = [],
  search = "",
  setSearch = () => {},
  slackChannels = [],
  selectedSlackChannel,
  setSelectedSlackChannel,
  loadingSlack,
}) {
  // Filter Slack messages
  const filteredSlack = messages.filter(
    (msg) =>
      msg.sender?.toLowerCase().includes(search.toLowerCase()) ||
      msg.summary?.toLowerCase().includes(search.toLowerCase()) ||
      msg.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col max-h-[750px]">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-purple-600 dark:text-purple-400">
        <img
          src="https://img.icons8.com/color/24/slack-new.png"
          alt="Slack Icon"
          className="mr-2 h-6 w-6"
        />
        Slack
      </h2>

      {/* Slack Channel Dropdown */}
      <select
        className="mb-2 p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        value={selectedSlackChannel}
        onChange={(e) => setSelectedSlackChannel(e.target.value)}
      >
        <option value="">Select a Channel...</option>
        {slackChannels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>

      {/* Search Slack */}
      <input
        type="text"
        placeholder="Search Slack Messages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      />

      <div className="overflow-y-auto max-h-[600px] space-y-3 pr-2">
        {filteredSlack.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No Slack messages found.
          </p>
        ) : (
          filteredSlack.map((msg, idx) => <MessageCard key={idx} msg={msg} />)
        )}
      </div>
    </section>
  );
}

/* =========================
   TELEGRAM SECTION (SEARCH)
   ========================= */
function MessageSection({
  title,
  icon,
  messages = [],
  search = "",
  setSearch = () => {},
}) {
  const filteredMessages = messages.filter(
    (msg) =>
      msg.sender?.toLowerCase().includes(search.toLowerCase()) ||
      msg.summary?.toLowerCase().includes(search.toLowerCase()) ||
      msg.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col max-h-[775px]">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-600 dark:text-blue-400">
        <img
          src={`https://img.icons8.com/color/24/${icon}.png`}
          alt={`${title} Icon`}
          className="mr-2 h-6 w-6"
        />
        {title}
      </h2>

      {/* Search Telegram */}
      <input
        type="text"
        placeholder={`Search ${title}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      />

      <div className="overflow-y-auto max-h-[610px] space-y-3 pr-2">
        {filteredMessages.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No {title} messages found.
          </p>
        ) : (
          filteredMessages.map((msg, idx) => (
            <MessageCard key={idx} msg={msg} />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================
   PRIORITY EMAIL CARD
   ========================= */
   function PriorityEmailCard({ msg }) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded p-3 shadow-sm bg-gray-50 dark:bg-gray-700">
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {msg.subject || "No Subject"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {msg.summary || "No summary available"}
        </p>
        {msg.quick_reply && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Quick Reply: {msg.quick_reply}
          </p>
        )}
      </div>
    );
  }
  

/* =========================
   MESSAGE CARD (Slack/Telegram)
   ========================= */
function MessageCard({ msg }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-3 shadow-sm bg-gray-50 dark:bg-gray-700">
      {msg.sender && (
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
          <strong>Sender:</strong> {msg.sender}
        </p>
      )}
      <p className="font-semibold text-gray-800 dark:text-gray-100">
        {msg.summary || "No Summary"}
      </p>
      {msg.text && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Original: {msg.text}
        </p>
      )}
    </div>
  );
}

/* =========================
   SUMMARY CARD
   ========================= */
function SummaryCard({ title, summary }) {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-green-600 dark:text-green-400">
        {title}
      </h2>
      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
        {summary || "No summary available."}
      </p>
    </section>
  );
}
