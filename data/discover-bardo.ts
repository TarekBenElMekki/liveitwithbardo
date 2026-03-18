/**
 * Content for the Discover Bardo page.
 * All entries must provide genuine, practical value for a first-time visitor to Tunisia.
 */

export interface WhyReason {
  id: string;
  icon: string;       // emoji used as visual icon
  title: string;
  description: string;
}

export interface Persona {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface JourneyStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

export interface ExperienceHighlight {
  id: string;
  quote: string;
  author: string;
  country: string;
  program: string;
}

export const whyReasons: WhyReason[] = [
  {
    id: "why-affordable",
    icon: "💰",
    title: "Genuinely Affordable",
    description:
      "A comfortable monthly budget in Tunis runs 900–1,400 TND (~€270–420), covering rent, food, transport, and leisure. Tunisia is one of the most cost-effective exchange destinations in the Mediterranean.",
  },
  {
    id: "why-culture",
    icon: "🏛️",
    title: "Rich Cultural Heritage",
    description:
      "From the UNESCO-listed Medina of Tunis to the Roman ruins of Dougga and the ancient city of Carthage, Tunisia offers a depth of history and culture that few countries can match.",
  },
  {
    id: "why-climate",
    icon: "☀️",
    title: "Mediterranean Climate",
    description:
      "Warm, dry summers and mild winters make Tunisia comfortable year-round. Spring and autumn are ideal — temperatures between 18–26°C with minimal rain and long sunny days.",
  },
  {
    id: "why-hospitality",
    icon: "🤝",
    title: "Exceptional Hospitality",
    description:
      "Tunisians are famously welcoming. Expect to be invited for tea, offered home-cooked meals, and guided through neighbourhoods by locals who take genuine pride in sharing their country.",
  },
  {
    id: "why-language",
    icon: "🗣️",
    title: "French and English Friendly",
    description:
      "French is widely spoken in business, education, and daily life. English is increasingly common among younger Tunisians. Most exchange participants adapt quickly without needing Arabic.",
  },
  {
    id: "why-location",
    icon: "✈️",
    title: "Gateway to Africa and Europe",
    description:
      "Tunis is a 2-hour flight from most European capitals and a short ferry ride from Italy. Weekend trips to Djerba, the Sahara, or Sicily are all within easy reach during your exchange.",
  },
];

export const personas: Persona[] = [
  {
    id: "persona-student",
    title: "The University Student",
    description:
      "You're studying international relations, development, languages, or social sciences and want real-world experience outside the classroom. Tunisia offers structured volunteer projects, a low cost of living, and a genuinely different cultural context.",
    tags: ["Volunteer", "6–8 weeks", "Low budget", "Cultural immersion"],
  },
  {
    id: "persona-professional",
    title: "The Young Professional",
    description:
      "You have 1–3 years of work experience and want an international internship that adds real value to your CV. Tunisian startups and NGOs offer hands-on roles in tech, marketing, and project management.",
    tags: ["Internship", "3–12 months", "Career development", "Startup ecosystem"],
  },
  {
    id: "persona-volunteer",
    title: "The Impact-Driven Volunteer",
    description:
      "You want to contribute meaningfully — not just observe. AIESEC Tunisia's volunteer projects focus on education, health, environment, and youth empowerment in communities that genuinely benefit from your skills.",
    tags: ["Volunteer", "SDG-aligned", "Community impact", "Flexible duration"],
  },
];

export const journeySteps: JourneyStep[] = [
  {
    id: "step-1",
    step: 1,
    title: "Explore & Apply",
    description:
      "Browse open projects on the AIESEC global platform (aiesec.org). Filter by country, duration, and SDG. Submit your application with a short motivation letter and CV.",
  },
  {
    id: "step-2",
    step: 2,
    title: "Interview & Match",
    description:
      "AIESEC Tunisia reviews your application and connects you with the host organisation. A short interview confirms the match. You'll receive a formal acceptance letter within 2–3 weeks.",
  },
  {
    id: "step-3",
    step: 3,
    title: "Prepare & Pack",
    description:
      "Complete your visa application (if required), arrange travel insurance, and attend a pre-departure briefing. AIESEC Tunisia sends you a practical arrival guide covering accommodation, transport, and local tips.",
  },
  {
    id: "step-4",
    step: 4,
    title: "Arrive in Tunisia",
    description:
      "AIESEC Tunisia arranges airport pickup and an orientation session in your first week. You'll meet your local buddy, tour your neighbourhood, and get set up with a local SIM card and bank account guidance.",
  },
  {
    id: "step-5",
    step: 5,
    title: "Live the Experience",
    description:
      "Work on your project, explore the country, and build genuine connections. AIESEC Tunisia organises cultural events, day trips, and social gatherings throughout your exchange.",
  },
  {
    id: "step-6",
    step: 6,
    title: "Reflect & Grow",
    description:
      "At the end of your exchange, complete a reflection session with your AIESEC buddy. You'll leave with a certificate, a reference letter from your host organisation, and a network that spans continents.",
  },
];

export const experienceHighlights: ExperienceHighlight[] = [
  {
    id: "highlight-1",
    quote:
      "I arrived not knowing a word of Arabic and left with friends I'll have for life. The Medina, the food, the people — Tunisia exceeded every expectation I had.",
    author: "Léa M.",
    country: "France",
    program: "Cultural Exchange, Tunis",
  },
  {
    id: "highlight-2",
    quote:
      "The internship was real work — not coffee runs. I shipped features that are live in production. And the cost of living meant I could actually save money while doing it.",
    author: "Arjun S.",
    country: "India",
    program: "Software Development Internship, Tunis",
  },
  {
    id: "highlight-3",
    quote:
      "Teaching English in a public school changed my perspective on education and privilege. The students were so motivated. I came to give something and left having received far more.",
    author: "Emma K.",
    country: "Germany",
    program: "Volunteer — Teach English, Tunis",
  },
  {
    id: "highlight-4",
    quote:
      "I did a weekend trip to the Sahara during my exchange. Standing in the dunes at sunrise, I thought — this is why you say yes to things that scare you a little.",
    author: "Carlos R.",
    country: "Spain",
    program: "Volunteer — Youth Empowerment, Kairouan",
  },
];
