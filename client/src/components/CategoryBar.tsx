interface CategoryBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function CategoryBar({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryBarProps) {
  return (
    <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
        Department:
      </span>
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? 'bg-red-600 text-white font-bold'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

