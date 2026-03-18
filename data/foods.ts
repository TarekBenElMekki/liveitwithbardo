export interface Food {
  id: string;
  title: string;
  description: string;
  /** Path under /public. Replace with real asset when available. */
  image: string;
  alt: string;
  mediaType?: "image" | "video";
}

// Placeholder used until real food photos are added to /public/images/food/
const PH = "/hero/hero_static_default.png";

export const foods: Food[] = [
  {
    id: "food-couscous",
    title: "Couscous",
    description:
      "Tunisia's national dish — steamed semolina served with a rich vegetable and lamb stew, slow-cooked with aromatic spices.",
    image: PH,
    alt: "A large bowl of traditional Tunisian couscous with lamb and vegetables",
  },
  {
    id: "food-brik",
    title: "Brik",
    description:
      "A crispy fried pastry filled with egg, tuna, capers, and parsley — a beloved street food and starter across Tunisia.",
    image: PH,
    alt: "Golden crispy brik pastry cut open to reveal egg and tuna filling",
  },
  {
    id: "food-lablabi",
    title: "Lablabi",
    description:
      "A hearty chickpea soup seasoned with cumin, garlic, and harissa, poured over torn bread — the ultimate comfort food.",
    image: PH,
    alt: "A bowl of lablabi chickpea soup with bread and harissa on the side",
  },
  {
    id: "food-mechouia",
    title: "Salade Mechouia",
    description:
      "A smoky grilled salad of peppers, tomatoes, and onions blended with olive oil, tuna, and hard-boiled eggs.",
    image: PH,
    alt: "Salade mechouia with grilled vegetables, tuna, and olives on a plate",
  },
  {
    id: "food-harissa",
    title: "Harissa",
    description:
      "Tunisia's fiery chili paste — a blend of roasted red peppers, garlic, and spices that accompanies almost every meal.",
    image: PH,
    alt: "A jar of vibrant red Tunisian harissa paste with dried chili peppers",
  },
  {
    id: "food-makroudh",
    title: "Makroudh",
    description:
      "A traditional semolina pastry filled with date paste and soaked in honey — a sweet treat from the city of Kairouan.",
    image: PH,
    alt: "Diamond-shaped makroudh pastries glazed with honey on a decorative plate",
  },
  {
    id: "food-ojja",
    title: "Ojja",
    description:
      "A spiced tomato and pepper stew with eggs poached directly in the sauce, often served with merguez sausage.",
    image: PH,
    alt: "Ojja stew with eggs and merguez sausage in a cast iron pan",
  },
  {
    id: "food-bambalouni",
    title: "Bambalouni",
    description:
      "Fluffy fried doughnuts dusted with sugar, sold fresh at seaside stalls — a quintessential Tunisian beach snack.",
    image: PH,
    alt: "Freshly fried bambalouni doughnuts dusted with powdered sugar",
  },
];
