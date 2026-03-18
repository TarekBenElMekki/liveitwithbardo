import { places } from "@/data/places";
import { MediaCarousel } from "@/components/ui/MediaCarousel";
import type { MediaItem } from "@/components/ui/MediaCarousel";

const placeItems: MediaItem[] = places.map((p) => ({
  type: p.mediaType ?? "image",
  src: p.image,
  title: p.name,
  description: p.description,
  alt: p.alt,
}));

export function PlacesSection() {
  return (
    <section
      id="places"
      aria-labelledby="places-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Discover the Country
          </p>
          <h2
            id="places-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Places to Explore
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            From ancient ruins to desert dunes and Mediterranean beaches —
            Tunisia rewards every kind of explorer.
          </p>
        </div>
        <MediaCarousel items={placeItems} aspectRatio="aspect-[3/2]" />
      </div>
    </section>
  );
}
