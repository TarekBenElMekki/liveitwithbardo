import type { Food } from "@/data/foods";

interface FoodCardProps {
  food: Food;
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <article className="group rounded-2xl overflow-hidden bg-white border border-[var(--border)] transition-transform duration-300 hover:scale-105">
      {/* Placeholder image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400 text-center px-3 line-clamp-2">{food.alt}</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{food.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {food.description}
        </p>
      </div>
    </article>
  );
}
