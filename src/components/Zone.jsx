import Rack from './Rack.jsx';

function Zone({
  focusedCode,
  largeText = false,
  occupiedOnly = false,
  zone,
  searchTerm,
  onSelectLocation,
}) {
  const racks = zone.racks || [];

  return (
    <section className="rounded-md border border-cyan-200 bg-cyan-50/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3
          className={
            largeText
              ? 'text-xl font-extrabold text-cyan-950'
              : 'text-base font-bold text-cyan-950'
          }
        >
          {zone.nameCn} / {zone.nameEn}
        </h3>
        <span className="text-xs font-medium text-cyan-800">
          {racks.length} 货架 / racks
        </span>
      </div>

      <div className="flex min-w-max gap-3">
        {racks.map((rack) => (
          <Rack
            key={rack.rackName}
            rack={rack}
            focusedCode={focusedCode}
            largeText={largeText}
            occupiedOnly={occupiedOnly}
            searchTerm={searchTerm}
            onSelectLocation={(location) =>
              onSelectLocation({
                ...location,
                zoneNameCn: zone.nameCn,
                zoneNameEn: zone.nameEn,
                rackName: rack.rackName,
                rackNameEn: rack.rackNameEn,
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

export default Zone;
