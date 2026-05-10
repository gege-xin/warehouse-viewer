import { useDraggable, useDroppable } from '@dnd-kit/core';
import { statusLabels, statusStyles } from './LocationCell.jsx';

function DraggableLocationCell({ activeCode, location }) {
  const hasProduct = Boolean(location.model);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableNodeRef,
  } = useDraggable({
    id: location.code,
    data: { location },
    disabled: !hasProduct,
  });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: location.code,
    data: { location },
  });

  function setNodeRef(node) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  const style = statusStyles[location.status] || statusStyles.empty;
  const isActive = activeCode === location.code;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={[
        'flex min-h-[64px] touch-manipulation flex-col justify-between rounded-md border p-2 text-left text-[11px] transition focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:min-h-[76px] sm:text-xs',
        style,
        hasProduct ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        isDragging || isActive ? 'opacity-40 ring-4 ring-cyan-400 ring-offset-2' : '',
        isOver ? 'scale-[1.02] ring-4 ring-amber-400 ring-offset-2' : '',
      ].join(' ')}
      {...(hasProduct ? listeners : {})}
      {...(hasProduct ? attributes : {})}
    >
      <span className="font-bold leading-tight">{location.code}</span>
      <span className="line-clamp-1 break-all font-semibold">
        {location.model || '空位 / Empty'}
      </span>
      <span className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
        <span>{location.qty || 0} 件 / pcs</span>
        <span>{statusLabels[location.status] || location.status}</span>
      </span>
    </button>
  );
}

export default DraggableLocationCell;
