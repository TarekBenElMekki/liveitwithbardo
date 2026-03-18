"use client";

import { useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function ChatPanel({ isOpen, onClose, messages, onSend }: ChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input || !input.value.trim()) return;
    onSend(input.value.trim());
    input.value = "";
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Chat with AIESEC in Bardo"
      className="absolute bottom-20 right-0 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: "480px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-sm font-semibold text-gray-900">Bardo Assistant</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 transition-colors focus-ring"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <ul
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0"
        style={{ maxHeight: "320px" }}
      >
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 border-t border-gray-100"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about Tunisia, costs, AIESEC..."
          aria-label="Type your message"
          className="flex-1 bg-[var(--section-alt)] text-gray-900 text-sm rounded-full px-4 py-2 border border-gray-200 placeholder-gray-400 focus-ring focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="p-2 rounded-full bg-accent text-white hover:bg-[var(--accent-dark)] transition-colors focus-ring flex-shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
