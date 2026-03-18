export type SDG =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export type ProjectCategory = "volunteer" | "internship" | "cultural";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;        // path under /public/images
  alt: string;
  sdgs: SDG[];
  startDate: string;    // ISO 8601 "YYYY-MM-DD"
  endDate: string;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
}

export const projects: Project[] = [
  {
    id: "proj-001",
    slug: "teach-english-tunis",
    title: "Teach English in Tunis",
    description:
      "Support local students in underserved neighbourhoods by delivering conversational English classes. Work alongside Tunisian teachers and contribute to improving educational outcomes in public schools.",
    image: "/images/projects/teach-english-tunis.jpg",
    alt: "Students in a classroom in Tunis",
    sdgs: [4, 10],
    startDate: "2026-06-01",
    endDate: "2026-07-31",
    city: "Tunis",
    category: "volunteer",
    isOpen: true,
  },
  {
    id: "proj-002",
    slug: "sustainable-agriculture-sfax",
    title: "Sustainable Agriculture in Sfax",
    description:
      "Partner with local farmers to introduce sustainable farming techniques, reduce water usage, and improve crop yields. Ideal for students in agronomy, environmental science, or biology.",
    image: "/images/projects/sustainable-agriculture-sfax.jpg",
    alt: "Olive grove in Sfax, Tunisia",
    sdgs: [2, 12, 13, 15],
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    city: "Sfax",
    category: "volunteer",
    isOpen: true,
  },
  {
    id: "proj-003",
    slug: "digital-marketing-internship-tunis",
    title: "Digital Marketing Internship",
    description:
      "Join a fast-growing Tunisian startup and manage social media campaigns, SEO strategy, and content creation. Gain hands-on experience in a real business environment in the heart of Tunis.",
    image: "/images/projects/digital-marketing-tunis.jpg",
    alt: "Young professionals working on laptops in a co-working space",
    sdgs: [8, 9],
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    city: "Tunis",
    category: "internship",
    isOpen: true,
  },
  {
    id: "proj-004",
    slug: "public-health-sousse",
    title: "Public Health Awareness — Sousse",
    description:
      "Collaborate with local health organisations to run awareness campaigns on hygiene, nutrition, and preventive care in coastal communities around Sousse.",
    image: "/images/projects/public-health-sousse.jpg",
    alt: "Health workers speaking with community members in Sousse",
    sdgs: [3, 10],
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    city: "Sousse",
    category: "volunteer",
    isOpen: true,
  },
  {
    id: "proj-005",
    slug: "cultural-exchange-medina-tunis",
    title: "Cultural Exchange in the Medina",
    description:
      "Immerse yourself in the UNESCO-listed Medina of Tunis. Work with local artisans, cultural associations, and heritage organisations to document and promote traditional crafts and architecture.",
    image: "/images/projects/medina-cultural-exchange.jpg",
    alt: "Colourful doorways in the Medina of Tunis",
    sdgs: [11, 16],
    startDate: "2026-07-01",
    endDate: "2026-08-15",
    city: "Tunis",
    category: "cultural",
    isOpen: true,
  },
  {
    id: "proj-006",
    slug: "renewable-energy-tozeur",
    title: "Renewable Energy Education — Tozeur",
    description:
      "Support a solar energy NGO in the Saharan south by educating local communities on renewable energy benefits and assisting with small-scale solar panel installation projects.",
    image: "/images/projects/renewable-energy-tozeur.jpg",
    alt: "Solar panels in the Tunisian desert near Tozeur",
    sdgs: [7, 13],
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    city: "Tozeur",
    category: "volunteer",
    isOpen: false,
  },
  {
    id: "proj-007",
    slug: "software-dev-internship-tunis",
    title: "Software Development Internship",
    description:
      "Work with an established Tunisian tech company on real product features. Contribute to frontend or backend development using modern stacks. Mentorship provided throughout.",
    image: "/images/projects/software-dev-tunis.jpg",
    alt: "Developer writing code on a laptop",
    sdgs: [8, 9, 17],
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    city: "Tunis",
    category: "internship",
    isOpen: false,
  },
  {
    id: "proj-008",
    slug: "youth-empowerment-kairouan",
    title: "Youth Empowerment — Kairouan",
    description:
      "Facilitate workshops on leadership, communication, and career planning for young people in Kairouan. Work with local youth centres and schools to deliver impactful sessions.",
    image: "/images/projects/youth-empowerment-kairouan.jpg",
    alt: "Young people in a workshop in Kairouan",
    sdgs: [4, 8, 10],
    startDate: "2026-06-15",
    endDate: "2026-08-15",
    city: "Kairouan",
    category: "volunteer",
    isOpen: true,
  },
];
