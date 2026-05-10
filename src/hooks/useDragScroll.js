import { useRef, useState } from 'react';

export function useDragScroll({ ignoreInteractive = false } = {}) {
  const ref = useRef(null);
  const dragState = useRef({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  function handleMouseDown(event) {
    if (
      event.button !== 0 ||
      (ignoreInteractive && event.target.closest('button, a, input, textarea, select'))
    ) {
      return;
    }

    const node = ref.current;
    if (!node) return;

    dragState.current = {
      dragging: true,
      moved: false,
      startX: event.pageX,
      startY: event.pageY,
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
    };
    setIsDragging(true);
  }

  function handleMouseMove(event) {
    const node = ref.current;
    const state = dragState.current;
    if (!node || !state.dragging) return;

    const deltaX = event.pageX - state.startX;
    const deltaY = event.pageY - state.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      state.moved = true;
    }

    if (state.moved) {
      event.preventDefault();
      node.scrollLeft = state.scrollLeft - deltaX;
      node.scrollTop = state.scrollTop - deltaY;
    }
  }

  function stopDragging() {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    setIsDragging(false);

    window.setTimeout(() => {
      dragState.current.moved = false;
    }, 0);
  }

  function handleClickCapture(event) {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleWheel(event) {
    const node = ref.current;
    if (!node || !event.shiftKey) return;

    event.preventDefault();
    node.scrollLeft += event.deltaY || event.deltaX;
  }

  return {
    dragScrollProps: {
      ref,
      onClickCapture: handleClickCapture,
      onMouseDown: handleMouseDown,
      onMouseLeave: stopDragging,
      onMouseMove: handleMouseMove,
      onMouseUp: stopDragging,
      onWheel: handleWheel,
    },
    isDragging,
    scrollRef: ref,
  };
}
