import { Button } from "../../../../../nexus-frontend/src/ui/index.js";
import {
  BOORU_FLOATING_DETAILS_MIN_HEIGHT,
  BOORU_FLOATING_DETAILS_MIN_WIDTH,
  clampBooruFloatingDetailsGeometry,
} from "../../domain/floating-details.js";

const React = window.React;
const { useEffect, useRef } = React;

function getViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function FloatingDetailsWindow({ geometry, onGeometryChange, onClose, children }) {
  const dragRef = useRef(null);

  useEffect(() => {
    const handleResize = () => onGeometryChange?.(clampBooruFloatingDetailsGeometry(geometry, getViewport()));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [geometry, onGeometryChange]);

  const startPointerOperation = (event, mode) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      geometry,
    };
  };

  const movePointerOperation = (event) => {
    const operation = dragRef.current;
    if (!operation || operation.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - operation.clientX;
    const deltaY = event.clientY - operation.clientY;
    const nextGeometry = operation.mode === "resize"
      ? { ...operation.geometry, width: operation.geometry.width + deltaX, height: operation.geometry.height + deltaY }
      : { ...operation.geometry, x: operation.geometry.x + deltaX, y: operation.geometry.y + deltaY };
    onGeometryChange?.(clampBooruFloatingDetailsGeometry(nextGeometry, getViewport()));
  };

  const finishPointerOperation = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <aside
      className="booruView__floatingDetails"
      aria-label="Detalles del recurso"
      style={{ left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }}
    >
      <div
        className="booruView__floatingDetailsBar"
        onPointerDown={(event) => startPointerOperation(event, "move")}
        onPointerMove={movePointerOperation}
        onPointerUp={finishPointerOperation}
        onPointerCancel={finishPointerOperation}
      >
        <strong>Detalles</strong>
        <Button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>Cerrar</Button>
      </div>
      <div className="booruView__floatingDetailsContent">{children}</div>
      <div
        className="booruView__floatingDetailsResize"
        role="separator"
        aria-label="Redimensionar detalles"
        tabIndex={-1}
        onPointerDown={(event) => startPointerOperation(event, "resize")}
        onPointerMove={movePointerOperation}
        onPointerUp={finishPointerOperation}
        onPointerCancel={finishPointerOperation}
        style={{ minWidth: BOORU_FLOATING_DETAILS_MIN_WIDTH, minHeight: BOORU_FLOATING_DETAILS_MIN_HEIGHT }}
      />
    </aside>
  );
}
