/**
 * Content for the Tunisian Lifestyle page.
 * All entries must provide genuine, practical value for a first-time visitor to Tunisia.
 */

export interface TransportOption {
  id: string;
  name: string;
  description: string;
  avgCost: string;
  icon: string;
  tip: string;
}

export interface ClimateMonth {
  month: string;
  avgHigh: number;   // °C
  avgLow: number;    // °C
  description: string;
  icon: string;
}

export interface LanguagePhrase {
  id: string;
  english: string;
  arabic: string;
  french: string;
  pronunciation?: string;
  category: "greeting" | "practical" | "food" | "emergency";
}

export interface EtiquetteTip {
  id: string;
  type: "do" | "dont";
  tip: string;
}

export interface SafetyTip {
  id: string;
  category: string;
  tip: string;
}

export interface PackingItem {
  id: string;
  category: string;
  item: string;
  essential: boolean;
}

// ─── Transport ────────────────────────────────────────────────────────────────

export const transportOptions: TransportOption[] = [
  {
    id: "transport-metro",
    name: "Metro (TGM)",
    description:
      "The Tunis–Goulette–Marsa light rail connects central Tunis to the northern coastal suburbs (La Marsa, Sidi Bou Said, Carthage). Clean, reliable, and very affordable.",
    avgCost: "0.5–1 TND per trip",
    icon: "🚇",
    tip: "Buy a rechargeable card at any TGM station to avoid queuing for single tickets.",
  },
  {
    id: "transport-bus",
    name: "City Bus (SNT)",
    description:
      "Extensive bus network covering greater Tunis and intercity routes. Slower than the metro but reaches areas the TGM doesn't. Buses run from around 5:30am to 10pm.",
    avgCost: "0.5–1 TND per trip",
    icon: "🚌",
    tip: "Have exact change ready — drivers rarely carry much change. Google Maps works reasonably well for Tunis bus routes.",
  },
  {
    id: "transport-taxi",
    name: "Yellow Taxi",
    description:
      "Metered yellow taxis are widely available across Tunis. Affordable by European standards. Always insist the driver uses the meter (compteur) at the start of the trip.",
    avgCost: "5–15 TND for a city ride",
    icon: "🚕",
    tip: "Say 'bil compteur, s'il vous plaît' (by meter, please) when you get in. Night rates apply after 9pm.",
  },
  {
    id: "transport-bolt",
    name: "Bolt / InDriver",
    description:
      "Ride-hailing apps Bolt and InDriver both operate in Tunis. Prices are fixed upfront, no meter negotiation needed. Useful late at night or when you want a price estimate in advance.",
    avgCost: "6–18 TND depending on distance",
    icon: "📱",
    tip: "InDriver lets you propose your own price — useful for longer trips. Bolt is faster for short city rides.",
  },
  {
    id: "transport-louage",
    name: "Louage (Shared Taxi)",
    description:
      "Shared long-distance taxis that depart when full. The fastest and most common way to travel between Tunisian cities. Louage stations are separate from bus stations.",
    avgCost: "5–25 TND depending on distance",
    icon: "🚐",
    tip: "Louages to southern cities (Sfax, Sousse, Tozeur) depart from Bab Alioua station in Tunis. Arrive early for popular routes.",
  },
];

// ─── Climate ──────────────────────────────────────────────────────────────────

export const climateMonths: ClimateMonth[] = [
  { month: "Jan", avgHigh: 14, avgLow: 7,  description: "Cool and occasionally rainy. Light jacket needed.", icon: "🌧️" },
  { month: "Feb", avgHigh: 15, avgLow: 8,  description: "Similar to January. Almond trees begin to bloom.", icon: "🌦️" },
  { month: "Mar", avgHigh: 18, avgLow: 10, description: "Warming up. Pleasant for sightseeing.", icon: "⛅" },
  { month: "Apr", avgHigh: 21, avgLow: 13, description: "Ideal weather. Green landscapes, mild temperatures.", icon: "🌤️" },
  { month: "May", avgHigh: 25, avgLow: 16, description: "Warm and sunny. One of the best months to visit.", icon: "☀️" },
  { month: "Jun", avgHigh: 30, avgLow: 20, description: "Hot and dry. Beach season begins.", icon: "🌞" },
  { month: "Jul", avgHigh: 34, avgLow: 23, description: "Peak summer heat. Stay hydrated and avoid midday sun.", icon: "🔆" },
  { month: "Aug", avgHigh: 34, avgLow: 24, description: "Hottest month. Coastal areas are busy with tourists.", icon: "🔆" },
  { month: "Sep", avgHigh: 29, avgLow: 20, description: "Cooling down. Excellent for travel and outdoor activities.", icon: "🌤️" },
  { month: "Oct", avgHigh: 24, avgLow: 16, description: "Comfortable temperatures. Fewer tourists.", icon: "⛅" },
  { month: "Nov", avgHigh: 19, avgLow: 12, description: "Mild with some rain. Good for city exploration.", icon: "🌦️" },
  { month: "Dec", avgHigh: 15, avgLow: 8,  description: "Cool and quiet. Festive atmosphere in Tunis.", icon: "🌧️" },
];

// ─── Language ─────────────────────────────────────────────────────────────────

export const languagePhrases: LanguagePhrase[] = [
  {
    id: "phrase-hello",
    english: "Hello",
    arabic: "مرحبا (Marhaba)",
    french: "Bonjour",
    pronunciation: "mar-HA-ba",
    category: "greeting",
  },
  {
    id: "phrase-thankyou",
    english: "Thank you",
    arabic: "شكراً (Shukran)",
    french: "Merci",
    pronunciation: "SHOOK-ran",
    category: "greeting",
  },
  {
    id: "phrase-please",
    english: "Please",
    arabic: "من فضلك (Min fadlik)",
    french: "S'il vous plaît",
    pronunciation: "min FAD-lik",
    category: "practical",
  },
  {
    id: "phrase-howmuch",
    english: "How much does this cost?",
    arabic: "بقداش هذا؟ (Bqaddesh hedha?)",
    french: "Combien ça coûte ?",
    pronunciation: "b-KAD-esh HED-ha",
    category: "practical",
  },
  {
    id: "phrase-where",
    english: "Where is...?",
    arabic: "وين...؟ (Win...?)",
    french: "Où est... ?",
    pronunciation: "win",
    category: "practical",
  },
  {
    id: "phrase-water",
    english: "Water, please",
    arabic: "ماء من فضلك (Ma' min fadlik)",
    french: "De l'eau, s'il vous plaît",
    pronunciation: "MA min FAD-lik",
    category: "food",
  },
  {
    id: "phrase-bill",
    english: "The bill, please",
    arabic: "الحساب من فضلك (El-hsab min fadlik)",
    french: "L'addition, s'il vous plaît",
    pronunciation: "el-HSAB min FAD-lik",
    category: "food",
  },
  {
    id: "phrase-help",
    english: "Help!",
    arabic: "نجدة! (Najda!)",
    french: "Au secours !",
    pronunciation: "NAJ-da",
    category: "emergency",
  },
  {
    id: "phrase-doctor",
    english: "I need a doctor",
    arabic: "نحتاج طبيب (Nahtaj tabib)",
    french: "J'ai besoin d'un médecin",
    pronunciation: "nah-TAJ ta-BIB",
    category: "emergency",
  },
];

// ─── Etiquette ────────────────────────────────────────────────────────────────

export const etiquetteTips: EtiquetteTip[] = [
  { id: "etiq-do-1",   type: "do",   tip: "Accept tea or coffee when offered — refusing can be seen as impolite. A simple 'shukran' and a sip goes a long way." },
  { id: "etiq-do-2",   type: "do",   tip: "Dress modestly when visiting mosques, religious sites, or conservative neighbourhoods. Cover shoulders and knees." },
  { id: "etiq-do-3",   type: "do",   tip: "Greet shopkeepers and hosts with 'Marhaba' or 'Bonjour' before asking for anything. Tunisians appreciate the courtesy." },
  { id: "etiq-do-4",   type: "do",   tip: "During Ramadan, eat and drink discreetly in public during daylight hours out of respect for those fasting." },
  { id: "etiq-do-5",   type: "do",   tip: "Bargain politely in souks and markets — it's expected and part of the culture. Start at about 50–60% of the asking price." },
  { id: "etiq-dont-1", type: "dont", tip: "Don't photograph people without asking permission first, especially in traditional areas or religious settings." },
  { id: "etiq-dont-2", type: "dont", tip: "Don't display excessive public affection. Tunisia is relatively liberal but public kissing or embracing is not the norm." },
  { id: "etiq-dont-3", type: "dont", tip: "Don't enter a mosque during prayer time unless you are Muslim. Non-Muslims are welcome outside prayer hours at most sites." },
  { id: "etiq-dont-4", type: "dont", tip: "Don't assume everyone speaks French. In rural areas and with older generations, Arabic is the primary language." },
];

// ─── Safety ───────────────────────────────────────────────────────────────────

export const safetyTips: SafetyTip[] = [
  {
    id: "safety-general",
    category: "General",
    tip: "Tunisia is generally safe for exchange participants in major cities. Apply the same common sense you would in any unfamiliar city — stay aware of your surroundings, especially at night.",
  },
  {
    id: "safety-registration",
    category: "Official Registration",
    tip: "Register with your country's embassy or consulate upon arrival. Most countries offer a free online registration service. This ensures you can be contacted in an emergency.",
  },
  {
    id: "safety-documents",
    category: "Documents",
    tip: "Keep a digital copy of your passport, visa, and insurance documents in cloud storage. Carry a photocopy rather than your original passport for daily use.",
  },
  {
    id: "safety-health",
    category: "Health",
    tip: "Tap water in Tunis is technically safe but many locals and expats drink bottled water. Bottled water is cheap and widely available. Carry hand sanitiser for markets and street food areas.",
  },
  {
    id: "safety-emergency",
    category: "Emergency Numbers",
    tip: "Police: 197 | Ambulance: 190 | Fire: 198 | National Guard: 193. Save these in your phone on arrival. AIESEC Tunisia also provides a 24/7 emergency contact number at orientation.",
  },
  {
    id: "safety-transport",
    category: "Transport",
    tip: "Use metered taxis or ride-hailing apps (Bolt, InDriver) rather than unmarked vehicles. Agree on the price or confirm the meter is running before the trip starts.",
  },
  {
    id: "safety-valuables",
    category: "Valuables",
    tip: "Use a money belt or inside pocket in crowded areas like the Medina and bus stations. Don't leave bags unattended in cafés or on public transport.",
  },
];

// ─── Packing ──────────────────────────────────────────────────────────────────

export const packingItems: PackingItem[] = [
  // Documents
  { id: "pack-passport",   category: "Documents",  item: "Passport (valid 6+ months beyond your stay)", essential: true },
  { id: "pack-visa",       category: "Documents",  item: "Visa or acceptance letter (if required)", essential: true },
  { id: "pack-insurance",  category: "Documents",  item: "Travel and health insurance documents", essential: true },
  { id: "pack-copies",     category: "Documents",  item: "Photocopies of all key documents", essential: true },
  // Clothing
  { id: "pack-modest",     category: "Clothing",   item: "Modest clothing for religious sites (long trousers/skirt, scarf)", essential: true },
  { id: "pack-layers",     category: "Clothing",   item: "Light layers for spring/autumn evenings", essential: true },
  { id: "pack-swimwear",   category: "Clothing",   item: "Swimwear for coastal visits", essential: false },
  { id: "pack-shoes",      category: "Clothing",   item: "Comfortable walking shoes for medinas and ruins", essential: true },
  // Health
  { id: "pack-sunscreen",  category: "Health",     item: "High-SPF sunscreen (expensive locally)", essential: true },
  { id: "pack-meds",       category: "Health",     item: "Personal prescription medications (bring enough for your stay)", essential: true },
  { id: "pack-sanitiser",  category: "Health",     item: "Hand sanitiser", essential: true },
  { id: "pack-rehydration",category: "Health",     item: "Oral rehydration sachets for stomach upsets", essential: false },
  // Tech
  { id: "pack-adapter",    category: "Tech",       item: "European Type C/E plug adapter (Tunisia uses European sockets)", essential: true },
  { id: "pack-powerbank",  category: "Tech",       item: "Portable power bank", essential: false },
  { id: "pack-unlocked",   category: "Tech",       item: "Unlocked phone for a local SIM card (Tunisie Telecom or Ooredoo)", essential: true },
  // Practical
  { id: "pack-cash",       category: "Practical",  item: "Some euros or USD to exchange on arrival (ATMs available at airport)", essential: true },
  { id: "pack-bag",        category: "Practical",  item: "Day backpack or crossbody bag", essential: true },
  { id: "pack-waterbottle",category: "Practical",  item: "Reusable water bottle", essential: false },
];
