import LocationCell from './LocationCell.jsx';

export function getRackPrefix(rackName) {
  return rackName.match(/[A-Z]\d+/i)?.[0] || rackName.replace(/\s/g, '');
}

export function buildLocations(rack) {
  const explicitLocations = rack.locations || [];
  const byCode = new Map(explicitLocations.map((location) => [location.code, location]));
  const prefix = getRackPrefix(rack.rackName);
  const locations = [];
  let linearIndex = 0;

  for (let level = 1; level <= Number(rack.levels || 0); level += 1) {
    for (let column = 1; column <= Number(rack.columns || 0); column += 1) {
      const code = `${prefix}-${String(level).padStart(2, '0')}-${String(
        column,
      ).padStart(2, '0')}`;

      locations.push(
        byCode.get(code) ||
          explicitLocations[linearIndex] || {
            code,
            model: '',
            qty: 0,
            status: 'empty',
            note: '',
          },
      );
      linearIndex += 1;
    }
  }

  return locations;
}

export function getForkliftAisleAfterColumn(rack) {
  return Math.max(1, Math.floor(Number(rack.columns || 0) / 2));
}

export function getRackGridTemplateColumns(rack) {
  const columns = Number(rack.columns || 0);
  const leftColumns = getForkliftAisleAfterColumn(rack);
  const rightColumns = Math.max(0, columns - leftColumns);

  return [
    `repeat(${leftColumns}, minmax(64px, 1fr))`,
    'minmax(86px, 104px)',
    rightColumns ? `repeat(${rightColumns}, minmax(64px, 1fr))` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getLocationGridPosition(rack, index) {
  const columns = Math.max(1, Number(rack.columns || 0));
  const originalColumn = (index % columns) + 1;
  const row = Math.floor(index / columns) + 1;
  const aisleAfterColumn = getForkliftAisleAfterColumn(rack);
  const gridColumn =
    originalColumn > aisleAfterColumn ? originalColumn + 1 : originalColumn;

  return {
    gridColumn,
    gridRow: row,
  };
}

export function ForkliftAisle({ rack }) {
  return (
    <div
      className="flex min-h-[64px] items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-200 px-2 text-center text-[11px] font-bold text-slate-700 sm:min-h-[76px] sm:text-xs"
      style={{
        gridColumn: getForkliftAisleAfterColumn(rack) + 1,
        gridRow: `1 / span ${Number(rack.levels || 1)}`,
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
      aria-label="叉车通道 / Forklift Aisle"
    >
      叉车通道 / Forklift Aisle
    </div>
  );
}

function Rack({ rack, searchTerm, onSelectLocation }) {
  const locations = buildLocations(rack);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-950">
            {rack.rackName} / {rack.rackNameEn}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {rack.columns} 列 / columns · {rack.levels} 层 / levels
          </p>
        </div>
      </div>

      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: getRackGridTemplateColumns(rack),
        }}
      >
        <ForkliftAisle rack={rack} />
        {locations.map((location, index) => (
          <div key={location.code} style={getLocationGridPosition(rack, index)}>
            <LocationCell
              location={location}
              searchTerm={searchTerm}
              onClick={() => onSelectLocation(location)}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

export default Rack;
