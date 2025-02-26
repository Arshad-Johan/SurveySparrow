import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/gmail/process_emails",
        destination: "http://127.0.0.1:8000/gmail/process_emails",
      },
      {
        source: "/api/slack/fetch_summarized",
        destination: "http://127.0.0.1:8000/slack/fetch_summarized",
      },
      {
        source: "/api/whatsapp/fetch_summarized",
        destination: "http://127.0.0.1:8000/whatsapp/fetch_summarized",
      },
    ];
  },
};

export default nextConfig;
