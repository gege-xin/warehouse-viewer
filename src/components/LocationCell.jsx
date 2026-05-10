import UnassignedBadge from './UnassignedBadge.jsx';

export const statusStyles = {
  empty: 'border-slate-300 bg-white text-slate-700',
  occupied: 'border-emerald-600 bg-emerald-100 text-emerald-950',
  reserved: 'border-red-600 bg-red-100 text-red-950',
  unassigned: 'border-amber-500 bg-amber-100 text-amber-950',
  aisle: 'border-slate-400 bg-slate-200 text-slate-700',
  disabled: 'border-slate-950 bg-slate-950 text-white',
};

export const statusLabels = {
  empty: '空位 / Empty',
  occupied: '有货 / Occupied',
  reserved: '预留 / Reserved',
  unassigned: '未分配 / Unassigned',
  aisle: '走廊 / Aisle',
  disabled: '禁用 / Disabled',
};

export const statusOptions = [
  { value: 'unassigned', label: statusLabels.unassigned },
  { value: 'empty', label: statusLabels.empty },
  { value: 'occupied', label: statusLabels.occupied },
  { value: 'reserved', label: statusLabels.reserved },
  { value: 'disabled', label: statusLabels.disabled },
];

export function getLocationSearchText(location) {
  return [
    location.code,
    location.model,
    location.type,
    location.category,
    location.categoryCn,
    location.cabinetModel,
    location.colorCode,
    location.colorName,
    location.colorNameCn,
    location.note,
    location.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function locationMatches(location, searchTerm) {
  if (!searchTerm) return false;
  if (searchTerm.includes(' ')) {
    return getLocationSearchText(location).includes(searchTerm);
  }

  const tokens = [
    location.code,
    location.model,
    location.type,
    location.category,
    location.categoryCn,
    location.cabinetModel,
    location.colorCode,
    location.colorName,
    location.colorNameCn,
    location.note,
    location.status,
  ]
    .filter(Boolean)
    .flatMap((value) =>
      String(value)
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean),
    );

  const compactValues = [
    location.code,
    location.model,
    location.cabinetModel,
    location.colorCode,
    location.type,
    location.status,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return (
    compactValues.includes(searchTerm) ||
    tokens.some((token) => token.startsWith(searchTerm))
  );
}

function LocationCell({
  focused = false,
  largeText = false,
  location,
  occupiedOnly = false,
  searchTerm,
  onClick,
}) {
  const matched = locationMatches(location, searchTerm);
  const style = statusStyles[location.status] || statusStyles.empty;
  const isUnassigned =
    location.status === 'unassigned' ||
    String(location.code || '').toUpperCase().startsWith('TEMP-');
  const dimmed =
    occupiedOnly && location.status !== 'occupied' && !matched && !focused;

  return (
    <button
      type="button"
      data-location-code={location.code}
      data-search-match={matched ? 'true' : undefined}
      onClick={onClick}
      className={[
        'flex h-full min-h-[64px] flex-col justify-between rounded-md border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:min-h-[76px]',
        largeText ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs',
        style,
        isUnassigned ? 'border-amber-500 bg-amber-100' : '',
        matched ? 'ring-4 ring-amber-400 ring-offset-2' : '',
        focused ? 'auto-locate-pulse ring-4 ring-amber-400 ring-offset-2' : '',
        dimmed ? 'opacity-25 grayscale' : '',
      ].join(' ')}
    >
      <span className="font-bold leading-tight">{location.code}</span>
      <span
        className={[
          'line-clamp-2 break-all',
          largeText ? 'font-extrabold leading-tight' : 'font-semibold',
        ].join(' ')}
      >
        {location.model || '-'}
      </span>
      <span className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
        <span>{location.qty} 件 / pcs</span>
        {location.colorCode ? <span>{location.colorCode}</span> : null}
      </span>
      {isUnassigned ? <UnassignedBadge compact /> : null}
    </button>
  );
}

export default LocationCell;
