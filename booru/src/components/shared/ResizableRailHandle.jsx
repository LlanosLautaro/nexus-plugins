const React = window.React;
const { useEffect, useRef } = React;

export default function ResizableRailHandle({
  rail,
  width,
  min,
  max,
  onResize,
  onResizeEnd,
}) {
  const dragRef = useRef(null);

  useEffect(() => () => {
    document.body.classList.remove("booru-is-resizing-rail");
  }, []);

  const clamp = (value) => Math.min(max, Math.max(min, Math.round(value)));
  const applyKeyboardStep = (direction) => {
    const nextWidth = clamp(width + direction * 16);
    onResize?.(nextWidth);
    onResizeEnd?.(nextWidth);
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const direction = rail === "right" ? -1 : 1;
    dragRef.current = { startX: event.clientX, startWidth: width, direction };
    document.body.classList.add("booru-is-resizing-rail");

    const handlePointerMove = (moveEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      onResize?.(clamp(drag.startWidth + ((moveEvent.clientX - drag.startX) * drag.direction)));
    };
    const handlePointerUp = (upEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const nextWidth = clamp(drag.startWidth + ((upEvent.clientX - drag.startX) * drag.direction));
      dragRef.current = null;
      document.body.classList.remove("booru-is-resizing-rail");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      onResize?.(nextWidth);
      onResizeEnd?.(nextWidth);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div
      className={`booruView__railResize booruView__railResize--${rail}`}
      role="separator"
      aria-label={`Redimensionar panel ${rail === "left" ? "izquierdo" : "derecho"}`}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const visualDirection = event.key === "ArrowRight" ? 1 : -1;
        applyKeyboardStep(rail === "right" ? -visualDirection : visualDirection);
      }}
    />
  );
}
