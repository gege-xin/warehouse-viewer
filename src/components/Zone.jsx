import Rack from './Rack.jsx';

function Zone({ zone, searchTerm, onSelectLocation }) {
  return (
    <section className="rounded-md border border-cyan-200 bg-cyan-50/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-cyan-950">
          {zone.nameCn} / {zone.nameEn}
        </h3>
        <span className="text-xs font-medium text-cyan-800">
          {zone.racks?.length || 0} 货架 / racks
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {(zone.racks || []).map((rack) => (
          <Rack
            key={rack.rackName}
            rack={rack}
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
