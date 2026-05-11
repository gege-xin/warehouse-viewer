import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import LayoutSortableItem from './LayoutSortableItem.jsx';

const aisleOptions = [
  { value: 'forklift', label: '叉车通道 / Forklift Aisle' },
  { value: 'main', label: '主走廊 / Main Aisle' },
  { value: 'normal', label: '普通走廊 / Normal Aisle' },
];

function EditableAisle({
  active,
  aisle,
  index,
  onDelete,
  onMoveDown,
  onMoveUp,
  onSelect,
  onUpdate,
}) {
  return (
    <LayoutSortableItem
      id={`layout-${index}`}
      data={{ type: 'layout', index }}
      isSelected={active}
      label={aisle.nameEn || 'Aisle'}
      onSelect={onSelect}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_110px_auto]">
        <TextInput
          label="中文名称 / CN"
          value={aisle.nameCn || ''}
          onChange={(value) => onUpdate({ nameCn: value })}
        />
        <TextInput
          label="英文名称 / EN"
          value={aisle.nameEn || ''}
          onChange={(value) => onUpdate({ nameEn: value })}
        />
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          类型 / Type
          <select
            value={aisle.aisleType || 'normal'}
            onChange={(event) =>
              onUpdate(getAisleTypePatch(event.target.value))
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
          label="高度 / Height"
          max={180}
          min={36}
          value={aisle.heightPx || 64}
          onChange={(value) => onUpdate({ heightPx: value })}
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

function getAisleTypePatch(aisleType) {
  if (aisleType === 'main') {
    return {
      aisleType,
      nameCn: '主走廊',
      nameEn: 'Main Aisle',
      heightPx: 96,
    };
  }
  if (aisleType === 'forklift') {
    return {
      aisleType,
      nameCn: '叉车通道',
      nameEn: 'Forklift Aisle',
      heightPx: 64,
    };
  }
  return {
    aisleType,
    nameCn: '走廊',
    nameEn: 'Aisle',
    heightPx: 48,
  };
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

export default EditableAisle;
