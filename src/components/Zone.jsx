import { Fragment } from 'react';
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
  const mainAisleIndex = Math.ceil(racks.length / 2);

  return (
    <section className="rounded-md border border-cyan-200 bg-cyan-50/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={largeText ? 'text-lg font-extrabold text-cyan-950' : 'text-sm font-bold text-cyan-950'}>
          {zone.nameCn} / {zone.nameEn}
        </h3>
        <span className="text-xs font-medium text-cyan-800">
          {zone.racks?.length || 0} 货架 / racks
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {racks.map((rack, index) => (
          <Fragment key={rack.rackName}>
            <Rack
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
            {index + 1 === mainAisleIndex ? <MainAisle /> : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export function MainAisle() {
  return (
    <div className="flex min-h-16 items-center justify-center rounded-md border border-dashed border-slate-500 bg-slate-300 px-4 py-3 text-sm font-bold text-slate-800 xl:col-span-2">
      主走廊 / Main Aisle
    </div>
  );
}

export default Zone;
