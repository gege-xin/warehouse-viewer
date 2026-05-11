import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import EditableAisle from './EditableAisle.jsx';
import EditableZoneRow from './EditableZoneRow.jsx';
import { useLayoutEditor } from '../hooks/useLayoutEditor.js';

const aisleOptions = [
  { value: 'forklift', label: '叉车通道 / Forklift Aisle' },
  { value: 'main', label: '主走廊 / Main Aisle' },
  { value: 'normal', label: '普通走廊 / Normal Aisle' },
];

function AdminLayoutEditor({ currentUser, warehouseData }) {
  const editor = useLayoutEditor(warehouseData, currentUser);
  const [activeDrag, setActiveDrag] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    nameCn: '',
    nameEn: '',
    insertIndex: warehouseData.length,
  });
  const [rackForm, setRackForm] = useState({
    zoneIndex: 0,
    rackName: '',
    rackNameEn: '',
    columns: 5,
    levels: 3,
  });
  const [aisleForm, setAisleForm] = useState({
    aisleType: 'forklift',
    insertIndex: warehouseData.length,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  function handleDragEnd(event) {
    const source = event.active?.data.current;
    const target = event.over?.data.current;
    setActiveDrag(null);

    if (!source || !target) return;

    if (source.type === 'layout' && target.type === 'layout') {
      editor.moveLayoutItem(source.index, target.index);
    }

    if (
      source.type === 'rack' &&
      target.type === 'rack' &&
      source.zoneIndex === target.zoneIndex
    ) {
      editor.moveRack(source.zoneIndex, source.index, target.index);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            编辑仓库结构 / Edit Warehouse Layout
          </h2>
          <p className="text-sm text-slate-500">
            调整 Zone、Rack 和 Aisle。产品拖拽模式不会在这里启用。
          </p>
        </div>
        <button
          type="button"
          disabled={editor.saving}
          onClick={editor.saveLayout}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          保存结构 / Save Layout
        </button>
      </div>

      {editor.message ? (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          {editor.message}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <FormCard title="新增 Zone / Add Zone">
          <TextInput
            label="中文名称 / CN"
            value={zoneForm.nameCn}
            onChange={(value) => setZoneForm({ ...zoneForm, nameCn: value })}
          />
          <TextInput
            label="英文名称 / EN"
            value={zoneForm.nameEn}
            onChange={(value) => setZoneForm({ ...zoneForm, nameEn: value })}
          />
          <NumberInput
            label="插入位置 / Insert position"
            max={editor.draft.length}
            min={0}
            value={zoneForm.insertIndex}
            onChange={(value) => setZoneForm({ ...zoneForm, insertIndex: value })}
          />
          <ActionButton
            onClick={() =>
              editor.addZone({
                ...zoneForm,
                insertIndex: Number(zoneForm.insertIndex),
              })
            }
          >
            新增 Zone
          </ActionButton>
        </FormCard>

        <FormCard title="新增 Rack / Add Rack">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            所属 Zone / Zone
            <select
              value={rackForm.zoneIndex}
              onChange={(event) =>
                setRackForm({ ...rackForm, zoneIndex: Number(event.target.value) })
              }
              className="h-10 rounded-md border border-slate-300 px-2 text-sm font-normal"
            >
              {editor.zones.map((zone) => (
                <option key={zone.layoutIndex} value={zone.layoutIndex}>
                  {zone.nameCn} / {zone.nameEn}
                </option>
              ))}
            </select>
          </label>
          <TextInput
            label="货架名称 / Rack"
            value={rackForm.rackName}
            onChange={(value) => setRackForm({ ...rackForm, rackName: value })}
          />
          <NumberInput
            label="列 / Columns"
            max={99}
            min={1}
            value={rackForm.columns}
            onChange={(value) => setRackForm({ ...rackForm, columns: value })}
          />
          <NumberInput
            label="层 / Levels"
            max={3}
            min={1}
            value={rackForm.levels}
            onChange={(value) =>
              setRackForm({ ...rackForm, levels: Math.min(3, value) })
            }
          />
          <ActionButton onClick={() => editor.addRack(rackForm)}>
            新增 Rack
          </ActionButton>
        </FormCard>

        <FormCard title="新增 Aisle / Add Aisle">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            类型 / Type
            <select
              value={aisleForm.aisleType}
              onChange={(event) =>
                setAisleForm({ ...aisleForm, aisleType: event.target.value })
              }
              className="h-10 rounded-md border border-slate-300 px-2 text-sm font-normal"
            >
              {aisleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <NumberInput
            label="插入位置 / Insert position"
            max={editor.draft.length}
            min={0}
            value={aisleForm.insertIndex}
            onChange={(value) =>
              setAisleForm({ ...aisleForm, insertIndex: value })
            }
          />
          <ActionButton onClick={() => editor.addAisle(aisleForm)}>
            新增 Aisle
          </ActionButton>
        </FormCard>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        <span>电脑可拖拽排序。</span>
        <span>手机可拖拽，也可使用每行的上移 / 下移按钮。</span>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveDrag(event.active.data.current)}
        onDragCancel={() => setActiveDrag(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-3">
          {editor.draft.map((item, index) =>
            item.type === 'zone' ? (
              <EditableZoneRow
                key={item.id || `${item.nameEn}-${index}`}
                active={
                  editor.selected.type === 'layout' &&
                  editor.selected.index === index
                }
                index={index}
                selected={editor.selected}
                zone={item}
                onAddRack={() =>
                  editor.addRack({
                    zoneIndex: index,
                    columns: 5,
                    levels: 3,
                  })
                }
                onDelete={() => editor.deleteLayoutItem(index)}
                onDeleteRack={(rackIndex) => editor.deleteRack(index, rackIndex)}
                onMoveDown={() => editor.moveLayoutItem(index, index + 1)}
                onMoveRack={(from, to) => editor.moveRack(index, from, to)}
                onMoveUp={() => editor.moveLayoutItem(index, index - 1)}
                onSelect={() => editor.setSelected({ type: 'layout', index })}
                onSelectRack={editor.setSelected}
                onUpdate={(patch) => editor.updateItem(index, patch)}
                onUpdateRack={(rackIndex, patch) =>
                  editor.updateRack(index, rackIndex, patch)
                }
              />
            ) : (
              <EditableAisle
                key={item.id || `${item.nameEn}-${index}`}
                active={
                  editor.selected.type === 'layout' &&
                  editor.selected.index === index
                }
                aisle={item}
                index={index}
                onDelete={() => editor.deleteLayoutItem(index)}
                onMoveDown={() => editor.moveLayoutItem(index, index + 1)}
                onMoveUp={() => editor.moveLayoutItem(index, index - 1)}
                onSelect={() => editor.setSelected({ type: 'layout', index })}
                onUpdate={(patch) => editor.updateItem(index, patch)}
              />
            ),
          )}
        </div>

        <DragOverlay>
          {activeDrag ? (
            <div className="rounded-md border-2 border-cyan-500 bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-2xl">
              {activeDrag.type === 'rack' ? 'Rack' : 'Layout'} #{activeDrag.index + 1}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

function FormCard({ children, title }) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 px-2 text-sm font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function NumberInput({ label, max, min, value, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-md border border-slate-300 px-2 text-sm font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

export default AdminLayoutEditor;
