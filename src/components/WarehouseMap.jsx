import { useEffect, useRef } from 'react';
import Zone from './Zone.jsx';

function WarehouseMap({
  data,
  focusedCode,
  largeText = false,
  occupiedOnly = false,
  searchTerm,
  onSelectLocation,
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const target = focusedCode
      ? mapRef.current.querySelector(`[data-location-code="${CSS.escape(focusedCode)}"]`)
      : searchTerm
        ? mapRef.current.querySelector('[data-search-match="true"]')
        : null;

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [focusedCode, searchTerm, data]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className={largeText ? 'text-xl font-bold text-slate-950' : 'text-base font-semibold text-slate-950'}>
          仓库平面图 / Warehouse Layout
        </h2>
        <span className="text-xs font-medium text-slate-500">
          可横向滑动 / Swipe horizontally
        </span>
      </div>

      <div className="overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]" ref={mapRef}>
        <div className="flex min-w-[760px] flex-col gap-4 sm:min-w-[920px]">
          {data.map((item, index) => {
            if (item.type === 'aisle') {
              return (
                <AisleBand
                  key={item.id || `${item.nameEn}-${index}`}
                  aisle={item}
                />
              );
            }

            return (
              <Zone
                key={item.id || `${item.nameEn}-${index}`}
                zone={item}
                focusedCode={focusedCode}
                largeText={largeText}
                occupiedOnly={occupiedOnly}
                searchTerm={searchTerm}
                onSelectLocation={onSelectLocation}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AisleBand({ aisle }) {
  const isMain = aisle.aisleType === 'main' || aisle.nameEn === 'Main Aisle';
  const className = isMain
    ? 'h-20 border-slate-500 bg-slate-300 text-slate-800'
    : 'h-16 border-slate-400 bg-slate-200 text-slate-700';

  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed px-4 text-sm font-bold ${className}`}
      aria-label={`${aisle.nameCn} / ${aisle.nameEn}`}
    >
      {aisle.nameCn} / {aisle.nameEn}
    </div>
  );
}

export default WarehouseMap;
