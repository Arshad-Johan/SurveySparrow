import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function UrgentMidEmails({ urgent, mid }) {
  const [urgentEmails, setUrgentEmails] = useState(urgent);
  const [midEmails, setMidEmails] = useState(mid);

  const handleDismiss = (id, type) => {
    if (type === "urgent") {
      setUrgentEmails((prev) => prev.filter((email) => email.id !== id));
    } else {
      setMidEmails((prev) => prev.filter((email) => email.id !== id));
    }
  };

  return (
    <section className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4">
      {/* 🚨 Urgent Emails */}
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
        🚨 Urgent Emails (Swipe right to remove)
      </h3>
      <div className="overflow-hidden max-h-60 space-y-3 pr-2">
        <AnimatePresence>
          {urgentEmails.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">No urgent emails.</p>
          ) : (
            urgentEmails.map((msg) => (
              <motion.div
                key={msg.id}
                className="border border-gray-400 dark:border-gray-500 rounded p-3 shadow-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                whileDrag={{ scale: 1.05 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 150) handleDismiss(msg.id, "urgent");
                }}
              >
                <p className="font-semibold">{msg.subject}</p>
                <p>{msg.summary}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ⚠️ Mid-Priority Emails */}
      <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center mt-6">
        ⚠️ Mid Priority Emails (Swipe right to remove)
      </h3>
      <div className="overflow-hidden max-h-60 space-y-3 pr-2">
        <AnimatePresence>
          {midEmails.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">No mid-priority emails.</p>
          ) : (
            midEmails.map((msg) => (
              <motion.div
                key={msg.id}
                className="border border-gray-400 dark:border-gray-500 rounded p-3 shadow-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                whileDrag={{ scale: 1.05 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 150) handleDismiss(msg.id, "mid");
                }}
              >
                <p className="font-semibold">{msg.subject}</p>
                <p>{msg.summary}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
