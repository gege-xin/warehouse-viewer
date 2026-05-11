import { GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

function LayoutSortableItem({
  children,
  data,
  id,
  isSelected = false,
  label,
  onSelect,
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableNodeRef,
  } = useDraggable({ id, data });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({ id, data });

  function setNodeRef(node) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  return (
    <article
      ref={setNodeRef}
      className={[
        'rounded-md border bg-white p-3 shadow-sm transition',
        isSelected ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-slate-200',
        isDragging ? 'opacity-50' : '',
        isOver ? 'ring-2 ring-amber-300' : '',
      ].join(' ')}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 grid h-9 w-9 shrink-0 touch-none place-items-center rounded-md border border-slate-300 text-slate-600 active:cursor-grabbing"
          aria-label={`拖拽排序 / Drag ${label}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </article>
  );
}

export default LayoutSortableItem;
