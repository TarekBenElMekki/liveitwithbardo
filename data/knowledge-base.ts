import { faqEntries, FALLBACK_MESSAGE } from "./faq";
import { transportOptions, safetyTips, languagePhrases } from "./lifestyle";
import { whyReasons, journeySteps } from "./discover-bardo";
import { projects } from "./projects";

export type KnowledgeTopic =
  | "cost"
  | "tunisia"
  | "aiesec"
  | "general"
  | "projects"
  | "lifestyle"
  | "bardo";

export type KnowledgeSource = "faq" | "lifestyle" | "discover" | "projects";

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  topic: KnowledgeTopic;
  source: KnowledgeSource;
}

export { FALLBACK_MESSAGE };

function buildKnowledgeBase(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];

  // ── FAQ entries (already well-structured) ──────────────────────────────────
  for (const faq of faqEntries) {
    entries.push({
      id: faq.id,
      keywords: faq.keywords,
      question: faq.question,
      answer: faq.answer,
      topic: faq.topic as KnowledgeTopic,
      source: "faq",
    });
  }

  // ── Transport options ──────────────────────────────────────────────────────
  for (const t of transportOptions) {
    entries.push({
      id: `kb-transport-${t.id}`,
      keywords: [t.name.toLowerCase(), "transport", "getting around", "travel", "commute"],
      question: `How do I use ${t.name} in Tunisia?`,
      answer: `${t.description} Average cost: ${t.avgCost}. Tip: ${t.tip}`,
      topic: "lifestyle",
      source: "lifestyle",
    });
  }

  // ── Safety tips ────────────────────────────────────────────────────────────
  entries.push({
    id: "kb-safety-overview",
    keywords: ["safe", "safety", "security", "dangerous", "crime", "emergency", "police", "ambulance"],
    question: "Is Tunisia safe and what should I know about safety?",
    answer: safetyTips.map((t) => `${t.category}: ${t.tip}`).join(" | "),
    topic: "tunisia",
    source: "lifestyle",
  });

  // ── Language basics ────────────────────────────────────────────────────────
  entries.push({
    id: "kb-language-phrases",
    keywords: ["language", "arabic", "french", "phrase", "speak", "words", "communicate", "hello", "thank you"],
    question: "What are some useful phrases in Arabic and French for Tunisia?",
    answer:
      languagePhrases
        .map((p) => `${p.english}: Arabic — ${p.arabic}, French — ${p.french}`)
        .join("; "),
    topic: "tunisia",
    source: "lifestyle",
  });

  // ── Why Tunisia ────────────────────────────────────────────────────────────
  entries.push({
    id: "kb-why-tunisia",
    keywords: ["why tunisia", "choose tunisia", "reason", "benefit", "advantage", "worth it"],
    question: "Why should I choose Tunisia for my AIESEC exchange?",
    answer: whyReasons.map((r) => `${r.title}: ${r.description}`).join(" | "),
    topic: "bardo",
    source: "discover",
  });

  // ── Journey steps ──────────────────────────────────────────────────────────
  entries.push({
    id: "kb-journey",
    keywords: ["process", "steps", "how to apply", "journey", "what happens", "timeline", "procedure"],
    question: "What is the process for joining an AIESEC exchange in Tunisia?",
    answer: journeySteps
      .map((s) => `Step ${s.step} — ${s.title}: ${s.description}`)
      .join(" | "),
    topic: "aiesec",
    source: "discover",
  });

  // ── Open projects summary ──────────────────────────────────────────────────
  const openProjects = projects.filter((p) => p.isOpen);
  if (openProjects.length > 0) {
    entries.push({
      id: "kb-open-projects",
      keywords: ["open projects", "available", "opportunities", "apply now", "current projects", "what projects"],
      question: "What projects are currently open in Tunisia?",
      answer:
        `There are currently ${openProjects.length} open projects: ` +
        openProjects.map((p) => `${p.title} in ${p.city} (${p.category})`).join(", ") +
        ". Visit the Our Projects page for full details and to apply.",
      topic: "projects",
      source: "projects",
    });
  }

  return entries;
}

export const knowledgeBase: KnowledgeEntry[] = buildKnowledgeBase();
