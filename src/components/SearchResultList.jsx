import UnassignedBadge from './UnassignedBadge.jsx';

function SearchResultList({ largeText, results, searchTerm, selectedCode, onLocate }) {
  const hasSearch = searchTerm.trim().length > 0;
  if (!hasSearch) return null;

  if (results.length === 0) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700 shadow-panel">
        未找到产品 / Product Not Found
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={largeText ? 'text-lg font-bold' : 'text-sm font-bold'}>
          定位结果 / Locate Results
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {results.length} matched
        </span>
      </div>
      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
        {results.map((result) => {
          const isSelected = selectedCode === result.code;
          const isUnassigned =
            result.status === 'unassigned' ||
            String(result.code || '').toUpperCase().startsWith('TEMP-');

          return (
            <button
              key={`${result.code}-${result.model}`}
              type="button"
              onClick={() => onLocate(result.code)}
              className={[
                'rounded-md border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-500',
                isSelected
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                  : 'border-slate-200 bg-white hover:border-cyan-300',
                largeText ? 'text-base' : 'text-sm',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-all font-extrabold text-slate-950">
                    {result.model || result.code}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatLocation(result)}
                  </p>
                </div>
                {isUnassigned ? <UnassignedBadge compact /> : null}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600">
                {result.category || '-'} · {result.qty || 0} pcs
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function formatLocation(result) {
  if (
    result.status === 'unassigned' ||
    String(result.code || '').toUpperCase().startsWith('TEMP-')
  ) {
    return '待整理区 / Staging Area';
  }

  return [
    result.zoneNameCn && result.zoneNameEn
      ? `${result.zoneNameCn} / ${result.zoneNameEn}`
      : '',
    result.rackName || '',
    result.code || '',
  ]
    .filter(Boolean)
    .join(' · ');
}

export default SearchResultList;
