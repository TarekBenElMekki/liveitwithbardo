import { foods } from "@/data/foods";
import { MediaCarousel } from "@/components/ui/MediaCarousel";
import type { MediaItem } from "@/components/ui/MediaCarousel";

const foodItems: MediaItem[] = foods.map((f) => ({
  type: f.mediaType ?? "image",
  src: f.image,
  title: f.title,
  description: f.description,
  alt: f.alt,
}));

export function FoodSection() {
  return (
    <section
      id="food"
      aria-labelledby="food-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Tunisian Cuisine
          </p>
          <h2
            id="food-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Taste of Tunisia
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            A bold fusion of Berber, Arab, Mediterranean, and Ottoman influences.
            These are the dishes you&apos;ll fall in love with.
          </p>
        </div>
        <MediaCarousel items={foodItems} aspectRatio="aspect-[4/3]" />
      </div>
    </section>
  );
}
