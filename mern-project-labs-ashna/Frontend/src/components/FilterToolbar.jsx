export default function FilterToolbar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  totalResults
}) {
  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Books",
    "Home"
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-8">
      {/* Top search & summary row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
        {/* Search input with icons */}
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by title or keywords..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results Count indicator */}
        {totalResults !== undefined && (
          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap self-end sm:self-center">
            Found <span className="font-bold text-slate-900">{totalResults}</span> items
          </div>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          Filter:
        </span>
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs scale-102"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
