import { useEffect, useRef } from 'react';
import Zone from './Zone.jsx';
import { useDragScroll } from '../hooks/useDragScroll.js';

function WarehouseMap({
  data,
  focusedCode,
  largeText = false,
  occupiedOnly = false,
  searchTerm,
  onSelectLocation,
}) {
  const mapRef = useRef(null);
  const layoutRows = buildWarehouseLayoutRows(data);
  const { dragScrollProps, isDragging, scrollRef } = useDragScroll();

  useEffect(() => {
    if (!scrollRef.current) return;

    const target = focusedCode
      ? scrollRef.current.querySelector(`[data-location-code="${CSS.escape(focusedCode)}"]`)
      : searchTerm
        ? scrollRef.current.querySelector('[data-search-match="true"]')
        : null;

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [focusedCode, searchTerm, data, scrollRef]);

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

      <div
        {...dragScrollProps}
        className={[
          'warehouse-scroll w-full overflow-x-auto overflow-y-auto pb-3 touch-pan-x select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        ref={(node) => {
          mapRef.current = node;
          scrollRef.current = node;
        }}
      >
        <div className="flex min-w-max flex-col gap-4">
          {layoutRows.map((item, index) => {
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

export function buildWarehouseLayoutRows(data) {
  const zonesByLetter = new Map();
  const zoneRows = ['A', 'B', 'C', 'D', 'E', 'F'];

  data
    .filter((item) => item.type === 'zone')
    .forEach((zone) => {
      const letter = getZoneLetter(zone);
      if (letter) zonesByLetter.set(letter, zone);
    });

  return zoneRows.flatMap((letter, index) => {
    const zone =
      zonesByLetter.get(letter) || createEmptyZone(letter, index * 2 + 1);
    const next =
      letter === 'A' || letter === 'B' || letter === 'D' || letter === 'E'
        ? createAisle('forklift', index * 2 + 2)
        : letter === 'C'
          ? createAisle('main', index * 2 + 2)
          : null;

    return next ? [zone, next] : [zone];
  });
}

function getZoneLetter(zone) {
  return String(zone.nameEn || zone.nameCn || '')
    .match(/Zone\s+([A-Z])|([A-Z])\s*区/i)
    ?.slice(1)
    .find(Boolean)
    ?.toUpperCase();
}

function createEmptyZone(letter, order) {
  return {
    type: 'zone',
    order,
    nameCn: `${letter}区`,
    nameEn: `Zone ${letter}`,
    racks: [],
    isSynthetic: true,
  };
}

function createAisle(aisleType, order) {
  const isMain = aisleType === 'main';

  return {
    type: 'aisle',
    order,
    aisleType,
    nameCn: isMain ? '主走廊' : '叉车通道',
    nameEn: isMain ? 'Main Aisle' : 'Forklift Aisle',
    isSynthetic: true,
  };
}

export function AisleBand({ aisle }) {
  const isMain = aisle.aisleType === 'main' || aisle.nameEn === 'Main Aisle';
  const className = isMain
    ? 'h-24 border-slate-600 bg-slate-300 text-slate-900'
    : 'h-16 border-slate-400 bg-slate-200 text-slate-700';

  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed px-4 text-sm font-bold ${className}`}
      aria-label={`${aisle.nameCn} / ${aisle.nameEn}`}
    >
      {isMain ? '主走廊 / Main Aisle' : '叉车通道 / Forklift Aisle'}
    </div>
  );
}

export default WarehouseMap;
