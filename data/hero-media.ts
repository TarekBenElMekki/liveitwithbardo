export type HeroMediaType = "image" | "video";

export interface HeroMedia {
  id: string;
  type: HeroMediaType;
  src: string;
  poster?: string;
  alt: string;
  row: 0 | 1 | 2;
}

export const heroMedia: HeroMedia[] = [
  // Row 0
  {
    id: "hm-01",
    type: "image",
    src: "/images/hero/tunis-medina.jpg",
    alt: "The ancient medina of Tunis with traditional architecture and bustling souks",
    row: 0,
  },
  {
    id: "hm-02",
    type: "video",
    src: "/reels/exchange-moments.mp4",
    poster: "/images/hero/exchange-moments-poster.jpg",
    alt: "AIESEC exchange participants sharing cultural moments in Tunisia",
    row: 0,
  },
  {
    id: "hm-03",
    type: "image",
    src: "/images/hero/sidi-bou-said.jpg",
    alt: "The iconic blue and white village of Sidi Bou Said overlooking the Mediterranean",
    row: 0,
  },
  {
    id: "hm-04",
    type: "image",
    src: "/images/hero/sahara-dunes.jpg",
    alt: "Golden sand dunes of the Tunisian Sahara at sunset",
    row: 0,
  },
  // Row 1
  {
    id: "hm-05",
    type: "video",
    src: "/reels/bardo-experience.mp4",
    poster: "/images/hero/bardo-experience-poster.jpg",
    alt: "Young professionals experiencing the Bardo cultural exchange program",
    row: 1,
  },
  {
    id: "hm-06",
    type: "image",
    src: "/images/hero/carthage-ruins.jpg",
    alt: "Ancient ruins of Carthage with columns standing against a blue sky",
    row: 1,
  },
  {
    id: "hm-07",
    type: "image",
    src: "/images/hero/tunisian-food-spread.jpg",
    alt: "A vibrant spread of traditional Tunisian dishes and spices",
    row: 1,
  },
  {
    id: "hm-08",
    type: "image",
    src: "/images/hero/aiesec-team.jpg",
    alt: "AIESEC Tunisia team members collaborating at a community event",
    row: 1,
  },
  // Row 2
  {
    id: "hm-09",
    type: "image",
    src: "/images/hero/el-jem-amphitheatre.jpg",
    alt: "The magnificent Roman amphitheatre of El Jem, a UNESCO World Heritage Site",
    row: 2,
  },
  {
    id: "hm-10",
    type: "video",
    src: "/reels/cultural-exchange.mp4",
    poster: "/images/hero/cultural-exchange-poster.jpg",
    alt: "International volunteers engaging with local Tunisian communities",
    row: 2,
  },
  {
    id: "hm-11",
    type: "image",
    src: "/images/hero/dougga-temple.jpg",
    alt: "The well-preserved Roman temple at Dougga surrounded by olive trees",
    row: 2,
  },
  {
    id: "hm-12",
    type: "image",
    src: "/images/hero/hammamet-beach.jpg",
    alt: "Crystal clear waters and white sand beach at Hammamet",
    row: 2,
  },
];
