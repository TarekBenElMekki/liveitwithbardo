export type FaqTopic = "cost" | "tunisia" | "aiesec" | "general";

export interface FaqEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  topic: FaqTopic;
}

export const faqEntries: FaqEntry[] = [
  // Cost of living
  {
    id: "faq-rent",
    keywords: ["rent", "apartment", "housing", "accommodation", "flat", "live"],
    question: "How much does rent cost in Tunisia?",
    answer:
      "Rent in Tunis varies by neighbourhood. A furnished room in a shared apartment costs around 300–500 TND/month (~€90–150), while a private studio runs 600–900 TND/month (~€180–270). Areas like La Marsa and Sidi Bou Said are pricier; central Tunis and suburbs are more affordable.",
    topic: "cost",
  },
  {
    id: "faq-food-cost",
    keywords: ["food", "groceries", "eat", "meal", "restaurant", "dining"],
    question: "How much does food cost in Tunisia?",
    answer:
      "Food is very affordable. A local restaurant meal costs 8–15 TND (~€2.50–4.50). Groceries for a week run about 60–100 TND (~€18–30). Street food like brik or sandwiches costs 2–5 TND. Cooking at home is the most economical option.",
    topic: "cost",
  },
  {
    id: "faq-transport",
    keywords: ["transport", "bus", "metro", "taxi", "commute", "travel", "getting around"],
    question: "How do I get around in Tunisia?",
    answer:
      "Tunis has a metro (TGM), buses, and taxis. A metro/bus ride costs 0.5–1 TND. Monthly transport passes are around 30–50 TND. Taxis are metered and affordable — a city ride is typically 5–15 TND. Bolt and InDriver apps also operate in Tunis.",
    topic: "cost",
  },
  {
    id: "faq-monthly-budget",
    keywords: ["budget", "monthly", "total cost", "how much", "expenses", "cost of living", "afford"],
    question: "What is the total monthly cost of living in Tunisia?",
    answer:
      "A comfortable monthly budget for an exchange participant in Tunis is approximately 900–1,400 TND (~€270–420). This covers rent (shared), food, transport, and leisure. Tunisia is one of the most affordable countries for AIESEC exchanges in the Mediterranean region.",
    topic: "cost",
  },
  {
    id: "faq-currency",
    keywords: ["currency", "dinar", "tnd", "money", "exchange rate", "euro", "dollar"],
    question: "What currency is used in Tunisia?",
    answer:
      "Tunisia uses the Tunisian Dinar (TND). As of 2024, 1 EUR ≈ 3.3 TND and 1 USD ≈ 3.1 TND. Currency exchange is available at banks, airports, and official exchange offices. Credit cards are accepted in hotels and larger shops; cash is preferred for markets and street food.",
    topic: "cost",
  },
  // Tunisia info
  {
    id: "faq-weather",
    keywords: ["weather", "climate", "temperature", "hot", "cold", "season", "when to visit"],
    question: "What is the weather like in Tunisia?",
    answer:
      "Tunisia has a Mediterranean climate in the north — warm, dry summers (25–35°C) and mild winters (10–18°C). The south is desert climate with extreme summer heat. The best time to visit is spring (March–May) or autumn (September–November) for comfortable temperatures.",
    topic: "tunisia",
  },
  {
    id: "faq-language",
    keywords: ["language", "speak", "arabic", "french", "communicate", "english"],
    question: "What languages are spoken in Tunisia?",
    answer:
      "Arabic (Tunisian dialect) is the official language. French is widely spoken in business, education, and tourism. English is increasingly common among younger Tunisians and in the tech sector. Most AIESEC exchange participants manage well with French or English in Tunis.",
    topic: "tunisia",
  },
  {
    id: "faq-safety",
    keywords: ["safe", "safety", "security", "dangerous", "crime", "risk"],
    question: "Is Tunisia safe for exchange participants?",
    answer:
      "Tunisia is generally safe for exchange participants, especially in major cities like Tunis, Sfax, and Sousse. Standard urban precautions apply. AIESEC Tunisia provides orientation and local support to all incoming participants. Always register with your country's embassy upon arrival.",
    topic: "tunisia",
  },
  {
    id: "faq-culture",
    keywords: ["culture", "customs", "tradition", "religion", "islam", "dress", "etiquette"],
    question: "What should I know about Tunisian culture?",
    answer:
      "Tunisia is a Muslim-majority country with a secular constitution and a cosmopolitan culture. Dress modestly when visiting religious sites. Ramadan is observed nationally — be respectful of fasting hours. Tunisians are famously hospitable; accepting tea or coffee is a sign of respect.",
    topic: "tunisia",
  },
  // AIESEC
  {
    id: "faq-what-is-aiesec",
    keywords: ["what is aiesec", "aiesec", "organisation", "organization", "ngo", "youth"],
    question: "What is AIESEC?",
    answer:
      "AIESEC is the world's largest youth-run organisation, present in 120+ countries. It provides young people with leadership development opportunities through international exchanges, volunteer programs, and professional internships. AIESEC in Bardo has been active since 1984.",
    topic: "aiesec",
  },
  {
    id: "faq-exchange-program",
    keywords: ["exchange", "program", "internship", "volunteer", "opportunity", "apply", "join"],
    question: "How do I apply for an AIESEC exchange in Tunisia?",
    answer:
      "You can apply through the AIESEC global platform at aiesec.org. Search for opportunities in Tunisia, select a project that matches your skills and interests, and apply directly. AIESEC Tunisia will review your application and connect you with a local host organisation.",
    topic: "aiesec",
  },
  {
    id: "faq-bardo",
    keywords: ["bardo", "platform", "experience", "this platform", "what is bardo"],
    question: "What is the Bardo experience platform?",
    answer:
      "Bardo is AIESEC Tunisia's immersive experience platform designed to help incoming exchange participants discover Tunisia — its culture, food, places, and lifestyle — before and during their exchange. It's your digital companion for making the most of your time in Tunisia.",
    topic: "aiesec",
  },
  {
    id: "faq-duration",
    keywords: ["duration", "how long", "weeks", "months", "length", "period"],
    question: "How long are AIESEC exchanges in Tunisia?",
    answer:
      "Exchange durations vary by program type. Volunteer projects typically run 6–8 weeks. Professional internships last 3–12 months. Short-term cultural exchanges can be as brief as 2 weeks. You can filter opportunities by duration on the AIESEC platform.",
    topic: "aiesec",
  },
  {
    id: "faq-support",
    keywords: ["support", "help", "contact", "reach", "assistance", "problem", "issue"],
    question: "How can I get support from AIESEC Tunisia?",
    answer:
      "AIESEC Tunisia provides full support to all exchange participants: airport pickup, orientation sessions, local buddy system, and 24/7 emergency contact. You can reach the team via the AIESEC Tunisia Facebook page, Instagram @aiesec_tunisia, or email at aiesec.tn@aiesec.net.",
    topic: "general",
  },
];

export const FALLBACK_MESSAGE =
  "I don't have a specific answer for that yet. For more information, please reach out to AIESEC Tunisia directly on Instagram @aiesec_tunisia or email aiesec.tn@aiesec.net — the team is always happy to help!";
