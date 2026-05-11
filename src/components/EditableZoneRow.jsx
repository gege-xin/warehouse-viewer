import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import EditableRack from './EditableRack.jsx';
import LayoutSortableItem from './LayoutSortableItem.jsx';

function EditableZoneRow({
  active,
  index,
  onAddRack,
  onDelete,
  onDeleteRack,
  onMoveDown,
  onMoveRack,
  onMoveUp,
  onSelect,
  onSelectRack,
  onUpdate,
  onUpdateRack,
  selected,
  zone,
}) {
  const racks = zone.racks || [];

  return (
    <LayoutSortableItem
      id={`layout-${index}`}
      data={{ type: 'layout', index }}
      isSelected={active}
      label={zone.nameEn || `Zone ${index + 1}`}
      onSelect={onSelect}
    >
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <TextInput
            label="区域中文名 / Zone CN"
            value={zone.nameCn || ''}
            onChange={(value) => onUpdate({ nameCn: value })}
          />
          <TextInput
            label="区域英文名 / Zone EN"
            value={zone.nameEn || ''}
            onChange={(value) => onUpdate({ nameEn: value })}
          />
          <div className="flex items-end gap-1">
            <IconButton label="上移 / Move up" onClick={onMoveUp}>
              <ChevronUp className="h-4 w-4" />
            </IconButton>
            <IconButton label="下移 / Move down" onClick={onMoveDown}>
              <ChevronDown className="h-4 w-4" />
            </IconButton>
            <IconButton danger label="删除 / Delete" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              货架 / Racks ({racks.length})
            </h4>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddRack();
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
            >
              <Plus className="h-4 w-4" />
              新增货架 / Add Rack
            </button>
          </div>

          <div className="grid gap-2">
            {racks.map((rack, rackIndex) => (
              <EditableRack
                key={rack.id || `${rack.rackName}-${rackIndex}`}
                active={
                  selected.type === 'rack' &&
                  selected.zoneIndex === index &&
                  selected.rackIndex === rackIndex
                }
                index={rackIndex}
                rack={rack}
                zoneIndex={index}
                onDelete={() => onDeleteRack(rackIndex)}
                onMoveDown={() => onMoveRack(rackIndex, rackIndex + 1)}
                onMoveUp={() => onMoveRack(rackIndex, rackIndex - 1)}
                onSelect={() =>
                  onSelectRack({
                    type: 'rack',
                    zoneIndex: index,
                    rackIndex,
                  })
                }
                onUpdate={(patch) => onUpdateRack(rackIndex, patch)}
              />
            ))}
          </div>
        </div>
      </div>
    </LayoutSortableItem>
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

function IconButton({ children, danger = false, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        'grid h-10 w-10 place-items-center rounded-md border',
        danger ? 'border-red-200 text-red-700' : 'border-slate-300 text-slate-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default EditableZoneRow;
