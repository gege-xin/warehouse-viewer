import { Search, X } from 'lucide-react';

function SearchBar({ searchTerm, onSearchChange, matchCount }) {
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:p-4">
      <label
        htmlFor="model-search"
        className="text-sm font-semibold text-slate-950"
      >
        搜索型号或货位 / Search Model or Location
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            id="model-search"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="例如 / Example: 3219D"
            className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
          {hasSearch ? (
            <button
              type="button"
              aria-label="清空搜索 / Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="min-h-6 text-sm font-medium">
          {hasSearch && matchCount > 0 ? (
            <span className="text-emerald-700">
              找到 {matchCount} 个 / {matchCount} matched
            </span>
          ) : null}
          {hasSearch && matchCount === 0 ? (
            <span className="text-red-700">未找到 / No result</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SearchBar;
