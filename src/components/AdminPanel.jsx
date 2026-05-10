import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { auth, hasFirebaseConfig } from '../lib/firebase.js';
import {
  createWarehouseItem,
  removeWarehouseItem,
  saveWarehouseItem,
  seedWarehouseData,
} from '../lib/warehouseService.js';
import { statusOptions } from './LocationCell.jsx';
import AdminDragWarehouse from './AdminDragWarehouse.jsx';

const emptyLocation = {
  code: '',
  model: '',
  type: 'box',
  category: '',
  cabinetModel: '',
  colorCode: '',
  colorName: '',
  qty: 0,
  status: 'unassigned',
  note: '位置待定 / Location pending',
};

function AdminPanel({ currentUser, warehouseData }) {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragMode, setDragMode] = useState(false);

  const zones = useMemo(
    () => warehouseData.filter((item) => item.type === 'zone'),
    [warehouseData],
  );

  const selectedItem =
    warehouseData.find((item) => item.id === selectedDocId) || zones[0] || null;
  const editableItem = selectedItem ? structuredClone(selectedItem) : null;

  async function runAction(action, successMessage) {
    setSaving(true);
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setMessage(`操作失败 / Failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function addZone() {
    await runAction(
      () =>
        createWarehouseItem({
          type: 'zone',
          order: warehouseData.length + 1,
          nameCn: '新区',
          nameEn: 'New Zone',
          racks: [],
        }),
      '已新增区域 / Zone added',
    );
  }

  async function addAisle() {
    await runAction(
      () =>
        createWarehouseItem({
          type: 'aisle',
          order: warehouseData.length + 1,
          nameCn: '新走廊',
          nameEn: 'New Aisle',
        }),
      '已新增走廊 / Aisle added',
    );
  }

  async function saveItem(item) {
    await runAction(() => saveWarehouseItem(item), '已保存 / Saved');
  }

  async function deleteItem(id) {
    if (!window.confirm('确认删除？/ Delete this item?')) return;
    await runAction(() => removeWarehouseItem(id), '已删除 / Deleted');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              返回仓库 / Back
            </Link>
            <h1 className="mt-1 truncate text-xl font-bold text-slate-950">
              管理员后台 / Admin Panel
            </h1>
            <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
          </div>

          {auth ? (
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold"
            >
              退出 / Sign out
            </button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          {!hasFirebaseConfig ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Firebase 未配置，后台写入不可用。
            </div>
          ) : null}

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setDragMode((value) => !value)}
              className={[
                'h-10 rounded-md px-3 text-sm font-semibold',
                dragMode
                  ? 'bg-amber-500 text-amber-950'
                  : 'border border-slate-300 bg-white text-slate-800',
              ].join(' ')}
            >
              {dragMode
                ? '关闭拖拽 / Drag Mode On'
                : '开启拖拽 / Drag Mode Off'}
            </button>
            <button
              type="button"
              disabled={saving || !hasFirebaseConfig}
              onClick={() =>
                runAction(() => seedWarehouseData(), '已分配 SKU 数据已导入 / Seeded')
              }
              className="h-10 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              导入已分配 SKU / Seed Assigned SKUs
            </button>
            <button
              type="button"
              disabled={saving || !hasFirebaseConfig}
              onClick={addZone}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              新增区域 / Add Zone
            </button>
            <button
              type="button"
              disabled={saving || !hasFirebaseConfig}
              onClick={addAisle}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              新增走廊 / Add Aisle
            </button>
          </div>

          <div className="mt-5 grid gap-2">
            {warehouseData.map((item) => (
              <button
                key={item.id || `${item.type}-${item.order}`}
                type="button"
                onClick={() => item.id && setSelectedDocId(item.id)}
                className={[
                  'rounded-md border px-3 py-2 text-left text-sm',
                  selectedItem?.id === item.id
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <span className="font-semibold">
                  {item.nameCn} / {item.nameEn}
                </span>
                <span className="block text-xs text-slate-500">
                  {item.type}
                  {item.type === 'zone'
                    ? ` · ${(item.racks || []).reduce(
                        (count, rack) => count + (rack.locations?.length || 0),
                        0,
                      )} SKUs`
                    : ''}
                </span>
              </button>
            ))}
          </div>

          {message ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
              {message}
            </div>
          ) : null}
        </aside>

        <section className="min-w-0">
          {dragMode ? (
            <AdminDragWarehouse warehouseData={warehouseData} />
          ) : editableItem?.type === 'zone' ? (
            <ZoneEditor
              key={editableItem.id || editableItem.nameEn}
              disabled={saving || !hasFirebaseConfig}
              zone={editableItem}
              onDelete={() => deleteItem(editableItem.id)}
              onSave={saveItem}
            />
          ) : editableItem?.type === 'aisle' ? (
            <AisleEditor
              key={editableItem.id || editableItem.nameEn}
              aisle={editableItem}
              disabled={saving || !hasFirebaseConfig}
              onDelete={() => deleteItem(editableItem.id)}
              onSave={saveItem}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              暂无区域。请先导入已分配 SKU 或新增区域。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ZoneEditor({ disabled, zone, onDelete, onSave }) {
  const [draft, setDraft] = useState(zone);

  function updateRack(index, nextRack) {
    setDraft((current) => ({
      ...current,
      racks: (current.racks || []).map((rack, rackIndex) =>
        rackIndex === index ? nextRack : rack,
      ),
    }));
  }

  function addRack() {
    setDraft((current) => ({
      ...current,
      racks: [
        ...(current.racks || []),
        {
          rackName: `New Rack ${(current.racks || []).length + 1}`,
          rackNameEn: `Rack ${(current.racks || []).length + 1}`,
          columns: 5,
          levels: 4,
          locations: [],
        },
      ],
    }));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <EditorHeader
        title="编辑区域 / Edit Zone"
        subtitle="可修改区域、货架、货位和 SKU 数据。"
        disabled={disabled}
        onDelete={onDelete}
        onSave={() => onSave(draft)}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TextField
          label="中文名 / CN"
          value={draft.nameCn}
          onChange={(value) => setDraft({ ...draft, nameCn: value })}
        />
        <TextField
          label="英文名 / EN"
          value={draft.nameEn}
          onChange={(value) => setDraft({ ...draft, nameEn: value })}
        />
        <NumberField
          label="排序 / Order"
          value={draft.order || 1}
          onChange={(value) => setDraft({ ...draft, order: value })}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="font-bold text-slate-950">货架 / Racks</h3>
        <button
          type="button"
          onClick={addRack}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          新增货架 / Add Rack
        </button>
      </div>

      <div className="mt-3 grid gap-4">
        {(draft.racks || []).map((rack, index) => (
          <RackEditor
            key={`${rack.rackName}-${index}`}
            rack={rack}
            onChange={(nextRack) => updateRack(index, nextRack)}
            onDelete={() =>
              setDraft((current) => ({
                ...current,
                racks: (current.racks || []).filter((_, rackIndex) => rackIndex !== index),
              }))
            }
          />
        ))}
      </div>
    </div>
  );
}

function AisleEditor({ aisle, disabled, onDelete, onSave }) {
  const [draft, setDraft] = useState(aisle);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <EditorHeader
        title="编辑走廊 / Edit Aisle"
        subtitle="走廊会在仓库图中显示为灰色横向区域。"
        disabled={disabled}
        onDelete={onDelete}
        onSave={() => onSave(draft)}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TextField
          label="中文名 / CN"
          value={draft.nameCn}
          onChange={(value) => setDraft({ ...draft, nameCn: value })}
        />
        <TextField
          label="英文名 / EN"
          value={draft.nameEn}
          onChange={(value) => setDraft({ ...draft, nameEn: value })}
        />
        <NumberField
          label="排序 / Order"
          value={draft.order || 1}
          onChange={(value) => setDraft({ ...draft, order: value })}
        />
      </div>
    </div>
  );
}

function RackEditor({ rack, onChange, onDelete }) {
  function updateLocation(index, nextLocation) {
    onChange({
      ...rack,
      locations: (rack.locations || []).map((location, locationIndex) =>
        locationIndex === index ? nextLocation : location,
      ),
    });
  }

  function addLocation() {
    onChange({
      ...rack,
      locations: [...(rack.locations || []), { ...emptyLocation }],
    });
  }

  return (
    <article className="rounded-md border border-slate-200 p-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <TextField
          label="货架名 / Rack"
          value={rack.rackName}
          onChange={(value) => onChange({ ...rack, rackName: value })}
        />
        <TextField
          label="英文名 / EN"
          value={rack.rackNameEn || ''}
          onChange={(value) => onChange({ ...rack, rackNameEn: value })}
        />
        <NumberField
          label="列 / Columns"
          value={rack.columns}
          onChange={(value) => onChange({ ...rack, columns: value })}
        />
        <NumberField
          label="层 / Levels"
          value={rack.levels}
          onChange={(value) => onChange({ ...rack, levels: value })}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addLocation}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          新增货位 / Add Location
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          删除货架
        </button>
      </div>

      <div className="mt-3 grid gap-3">
        {(rack.locations || []).map((location, index) => (
          <LocationEditor
            key={`${location.code}-${index}`}
            location={location}
            onChange={(nextLocation) => updateLocation(index, nextLocation)}
            onDelete={() =>
              onChange({
                ...rack,
                locations: (rack.locations || []).filter((_, i) => i !== index),
              })
            }
          />
        ))}
      </div>
    </article>
  );
}

function LocationEditor({ location, onChange, onDelete }) {
  return (
    <div className="grid gap-2 rounded-md bg-slate-50 p-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_110px_130px_1fr_1fr_1fr_1fr_40px]">
      <TextField
        label="货位 / Code"
        value={location.code}
        onChange={(value) => onChange({ ...location, code: value })}
      />
      <TextField
        label="型号 / Model"
        value={location.model}
        onChange={(value) => onChange({ ...location, model: value })}
      />
      <NumberField
        label="数量 / Qty"
        value={location.qty}
        onChange={(value) => onChange({ ...location, qty: value })}
      />
      <SelectField
        label="状态 / Status"
        value={location.status}
        options={statusOptions}
        onChange={(value) => onChange({ ...location, status: value })}
      />
      <TextField
        label="类型 / Type"
        value={location.type}
        onChange={(value) => onChange({ ...location, type: value })}
      />
      <TextField
        label="分类 / Category"
        value={location.category}
        onChange={(value) => onChange({ ...location, category: value })}
      />
      <TextField
        label="柜体型号 / Cabinet"
        value={location.cabinetModel}
        onChange={(value) => onChange({ ...location, cabinetModel: value })}
      />
      <TextField
        label="颜色 / Color"
        value={location.colorCode}
        onChange={(value) => onChange({ ...location, colorCode: value })}
      />
      <button
        type="button"
        onClick={onDelete}
        className="mt-5 grid h-10 place-items-center rounded-md border border-red-200 text-red-700"
        aria-label="删除货位 / Delete location"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="sm:col-span-2 xl:col-span-9">
        <TextField
          label="备注 / Note"
          value={location.note}
          onChange={(value) => onChange({ ...location, note: value })}
        />
      </div>
    </div>
  );
}

function EditorHeader({ title, subtitle, disabled, onDelete, onSave }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onSave}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          保存 / Save
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="grid h-10 w-10 place-items-center rounded-md border border-red-200 text-red-700 disabled:opacity-50"
          aria-label="删除 / Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        type="number"
        min="0"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 font-normal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default AdminPanel;
