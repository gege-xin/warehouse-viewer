import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import LayoutSortableItem from './LayoutSortableItem.jsx';

function EditableRack({
  active,
  index,
  onDelete,
  onMoveDown,
  onMoveUp,
  onSelect,
  onUpdate,
  rack,
  zoneIndex,
}) {
  return (
    <LayoutSortableItem
      id={`rack-${zoneIndex}-${index}`}
      data={{ type: 'rack', zoneIndex, index }}
      isSelected={active}
      label={rack.rackName || `Rack ${index + 1}`}
      onSelect={onSelect}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_110px_110px_auto]">
        <TextInput
          label="货架名称 / Rack"
          value={rack.rackName || ''}
          onChange={(value) => onUpdate({ rackName: value })}
        />
        <TextInput
          label="英文名称 / EN"
          value={rack.rackNameEn || ''}
          onChange={(value) => onUpdate({ rackNameEn: value })}
        />
        <NumberInput
          label="列 / Columns"
          max={99}
          min={1}
          value={rack.columns || 1}
          onChange={(value) => onUpdate({ columns: value })}
        />
        <NumberInput
          label="层 / Levels"
          max={3}
          min={1}
          value={Math.min(3, Number(rack.levels || 3))}
          onChange={(value) => onUpdate({ levels: Math.min(3, value) })}
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

export default EditableRack;
