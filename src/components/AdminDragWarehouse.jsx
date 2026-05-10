import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { AisleBand } from './WarehouseMap.jsx';
import {
  ForkliftAisle,
  buildLocations,
  getLocationGridPosition,
  getRackGridTemplateColumns,
} from './Rack.jsx';
import { MainAisle } from './Zone.jsx';
import DraggableLocationCell from './DraggableLocationCell.jsx';
import { useAdminDragMove } from '../hooks/useAdminDragMove.js';

function AdminDragWarehouse({ warehouseData }) {
  const [activeLocation, setActiveLocation] = useState(null);
  const [notice, setNotice] = useState('');
  const { error, moving, moveProduct, setError } = useAdminDragMove(warehouseData);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const totalProducts = useMemo(
    () =>
      warehouseData
        .filter((item) => item.type === 'zone')
        .flatMap((zone) => zone.racks || [])
        .reduce(
          (count, rack) =>
            count + (rack.locations || []).filter((location) => location.model).length,
          0,
        ),
    [warehouseData],
  );

  async function handleDragEnd(event) {
    const sourceCode = event.active?.id;
    const targetCode = event.over?.id;
    setActiveLocation(null);
    setNotice('');
    setError('');

    if (!targetCode || sourceCode === targetCode) return;

    try {
      const result = await moveProduct(sourceCode, targetCode);
      if (result.changed) {
        setNotice(`已更新货位 / Location updated: ${sourceCode} -> ${targetCode}`);
      }
    } catch (moveError) {
      setNotice(`拖拽失败，已回滚 / Move failed and rolled back: ${moveError.message}`);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            拖拽调整货位 / Drag Location Assignment
          </h2>
          <p className="text-sm text-slate-500">
            拖动 SKU 到空位会移动；拖到已有 SKU 会询问是否交换。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          {totalProducts} SKUs
        </div>
      </div>

      {moving ? (
        <div className="mb-3 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm font-semibold text-cyan-800">
          正在更新 Firestore / Updating Firestore...
        </div>
      ) : null}
      {notice || error ? (
        <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          {notice || error}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveLocation(event.active.data.current?.location)}
        onDragCancel={() => setActiveLocation(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[760px] flex-col gap-4 sm:min-w-[920px]">
            {warehouseData.map((item, index) => {
            if (item.type === 'aisle') {
              return (
                <AisleBand
                  key={item.id || `${item.nameEn}-${index}`}
                  aisle={item}
                />
              );
            }

              return (
                <AdminDragZone
                  key={item.id || `${item.nameEn}-${index}`}
                  activeCode={activeLocation?.code}
                  zone={item}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeLocation ? (
            <div className="w-36 rounded-md border-2 border-cyan-500 bg-white p-3 text-xs font-bold text-slate-950 shadow-2xl">
              <div>{activeLocation.code}</div>
              <div className="mt-1 break-all text-cyan-700">{activeLocation.model}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

function AdminDragZone({ activeCode, zone }) {
  const racks = zone.racks || [];
  const mainAisleIndex = Math.ceil(racks.length / 2);

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
        {racks.map((rack, index) => (
          <div key={rack.rackName} className="contents">
            <AdminDragRack activeCode={activeCode} rack={rack} />
            {index + 1 === mainAisleIndex ? <MainAisle /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminDragRack({ activeCode, rack }) {
  const locations = buildLocations(rack);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-950">
          {rack.rackName} / {rack.rackNameEn}
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          {rack.columns} 列 / columns · {rack.levels} 层 / levels
        </p>
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
            <DraggableLocationCell activeCode={activeCode} location={location} />
          </div>
        ))}
      </div>
    </article>
  );
}

export default AdminDragWarehouse;
