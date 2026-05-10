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

export function getRackGridTemplateColumns(rack) {
  return `repeat(${Number(rack.columns || 0)}, minmax(64px, 1fr))`;
}

export function getLocationGridPosition(rack, index) {
  const columns = Math.max(1, Number(rack.columns || 0));

  return {
    gridColumn: (index % columns) + 1,
    gridRow: Math.floor(index / columns) + 1,
  };
}

function Rack({
  focusedCode,
  largeText = false,
  occupiedOnly = false,
  rack,
  searchTerm,
  onSelectLocation,
}) {
  const locations = buildLocations(rack);

  return (
    <article className="min-w-[360px] rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4
            className={
              largeText
                ? 'text-base font-extrabold text-slate-950'
                : 'text-sm font-bold text-slate-950'
            }
          >
            {rack.rackName} / {rack.rackNameEn}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {rack.columns} columns · Level 3 / Level 2 / Level 1
          </p>
        </div>
      </div>

      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: getRackGridTemplateColumns(rack),
        }}
      >
        {locations.map((location, index) => (
          <div key={location.code} style={getLocationGridPosition(rack, index)}>
            <LocationCell
              focused={focusedCode === location.code}
              largeText={largeText}
              location={location}
              occupiedOnly={occupiedOnly}
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
