"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatPanel, type ChatMessage } from "./ChatPanel";
import { knowledgeBase, FALLBACK_MESSAGE } from "@/data/knowledge-base";
import { matchFaq } from "@/lib/utils";
import { AiesecHuman } from "@/components/ui/AiesecHuman";

let msgCounter = 0;
function makeId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "agent",
  text: "👋 Hi! I'm the Bardo Assistant. Ask me anything about Tunisia, AIESEC exchanges, or the cost of living. How can I help?",
  timestamp: new Date(),
};

export function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  const handleToggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    const match = matchFaq(text, knowledgeBase);
    const agentMsg: ChatMessage = {
      id: makeId(),
      role: "agent",
      text: match ? match.answer : FALLBACK_MESSAGE,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" style={{ display: "none" }} aria-hidden="true">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChatPanel
              isOpen={isOpen}
              onClose={handleClose}
              messages={messages}
              onSend={handleSend}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger — AIESEC Human mark */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
        className="mt-3 animate-float focus-ring rounded-full shadow-xl shadow-accent/30 hover:scale-110 transition-transform duration-200"
      >
        <AiesecHuman size={48} />
      </button>
    </div>
  );
}
