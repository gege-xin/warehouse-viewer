import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { AisleBand, buildWarehouseLayoutRows } from './WarehouseMap.jsx';
import {
  buildLocations,
  getLocationGridPosition,
  getRackGridTemplateColumns,
} from './Rack.jsx';
import DraggableLocationCell from './DraggableLocationCell.jsx';
import { useDragScroll } from '../hooks/useDragScroll.js';
import { useAdminDragMove } from '../hooks/useAdminDragMove.js';

function AdminDragWarehouse({ warehouseData }) {
  const [activeLocation, setActiveLocation] = useState(null);
  const [notice, setNotice] = useState('');
  const { error, moving, moveProduct, setError } = useAdminDragMove(warehouseData);
  const layoutRows = buildWarehouseLayoutRows(warehouseData);
  const { dragScrollProps, isDragging } = useDragScroll({ ignoreInteractive: true });
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
        <div
          {...dragScrollProps}
          className={[
            'warehouse-scroll w-full overflow-x-auto overflow-y-auto pb-3 touch-pan-x select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          ].join(' ')}
        >
          <div className="flex min-w-max flex-col gap-4">
            {layoutRows.map((item, index) => {
              if (item.type === 'aisle') {
                return (
                  <AisleBand
                    key={`${item.nameEn}-${item.aisleType}-${index}`}
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

  return (
    <section className="rounded-md border border-cyan-200 bg-cyan-50/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-cyan-950">
          {zone.nameCn} / {zone.nameEn}
        </h3>
        <span className="text-xs font-medium text-cyan-800">
          {racks.length} 货架 / racks
        </span>
      </div>
      <div className="flex min-w-max gap-3">
        {racks.map((rack) => (
          <AdminDragRack
            key={rack.rackName}
            activeCode={activeCode}
            rack={rack}
          />
        ))}
      </div>
    </section>
  );
}

function AdminDragRack({ activeCode, rack }) {
  const locations = buildLocations(rack);

  return (
    <article className="min-w-[360px] rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-950">
          {rack.rackName} / {rack.rackNameEn}
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          {rack.columns} columns · Level 3 / Level 2 / Level 1
        </p>
      </div>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: getRackGridTemplateColumns(rack),
        }}
      >
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
