export interface Place {
  id: string;
  name: string;
  description: string;
  /** Path under /public. Replace with real asset when available. */
  image: string;
  alt: string;
  mediaType?: "image" | "video";
}

// Placeholder used until real place photos are added to /public/images/places/
const PH = "/hero/hero_static_default.png";

export const places: Place[] = [
  {
    id: "place-sidi-bou-said",
    name: "Sidi Bou Said",
    description:
      "A clifftop village of dazzling white walls and cobalt-blue doors perched above the Gulf of Tunis — one of the most photographed places in North Africa.",
    image: PH,
    alt: "White and blue architecture of Sidi Bou Said village overlooking the sea",
  },
  {
    id: "place-sahara",
    name: "Sahara Desert",
    description:
      "Experience the vast golden dunes of the Tunisian Sahara near Douz — camel treks, stargazing, and the silence of the world's greatest desert.",
    image: PH,
    alt: "Vast golden sand dunes of the Tunisian Sahara at golden hour",
  },
  {
    id: "place-carthage",
    name: "Carthage",
    description:
      "Walk among the ruins of one of antiquity's greatest civilisations — Punic ports, Roman baths, and the Antonine Baths overlooking the Mediterranean.",
    image: PH,
    alt: "Ancient Roman columns at the ruins of Carthage with the sea in the background",
  },
  {
    id: "place-el-jem",
    name: "El Jem Amphitheatre",
    description:
      "A UNESCO World Heritage Site and one of the best-preserved Roman amphitheatres in the world, rising dramatically from the Tunisian plains.",
    image: PH,
    alt: "The grand Roman amphitheatre of El Jem under a clear blue sky",
  },
  {
    id: "place-djerba",
    name: "Djerba Island",
    description:
      "A sun-drenched island of whitewashed villages, ancient synagogues, and turquoise lagoons — where Berber, Arab, and Jewish cultures intertwine.",
    image: PH,
    alt: "Traditional whitewashed buildings and palm trees on Djerba island",
  },
  {
    id: "place-medina-tunis",
    name: "Medina of Tunis",
    description:
      "Lose yourself in the labyrinthine souks of the UNESCO-listed medina — a living medieval city of mosques, hammams, and artisan workshops.",
    image: PH,
    alt: "Narrow alleyways of the Tunis medina with colourful market stalls",
  },
  {
    id: "place-dougga",
    name: "Dougga",
    description:
      "The best-preserved Roman town in North Africa, set on a hillside with a stunning Capitol temple, theatre, and panoramic views of the Tunisian countryside.",
    image: PH,
    alt: "The Capitol temple at Dougga surrounded by ancient Roman ruins",
  },
  {
    id: "place-hammamet",
    name: "Hammamet",
    description:
      "A Mediterranean resort town with a historic kasbah, jasmine-scented gardens, and some of Tunisia's finest beaches.",
    image: PH,
    alt: "Hammamet beach with turquoise water and the old kasbah in the background",
  },
];
