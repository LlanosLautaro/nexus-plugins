import { Button } from "../../../../nexus-frontend/src/ui/index.js";

const React = window.React;
const { useEffect, useMemo, useRef, useState } = React;

async function invoke(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo guardar el encuadre.");
  }
  return response.data;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

function toFileUrl(pathValue) {
  if (!pathValue) return "";
  return new URL(window.nexus.urls.pathToFileUrl(pathValue)).href;
}

/**
 * Reusable, ratio-locked crop workbench for entity avatars and banners.
 * Crop size is represented as zoom; x/y are normalized focal offsets so the
 * same saved layout remains correct at every responsive size.
 */
export default function EntityVisualCropper({
  kind,
  entityId,
  role,
  source,
  initialLayout,
  busy = false,
  onSaved,
  onCancel,
}) {
  const frameRef = useRef(null);
  const pointerRef = useRef(null);
  const [layout, setLayout] = useState(() => ({
    scale: Number(initialLayout?.scale || 1),
    offsetX: Number(initialLayout?.offsetX || 0),
    offsetY: Number(initialLayout?.offsetY || 0),
  }));
  const [saving, setSaving] = useState(false);
  const isBanner = role === "banner";

  useEffect(() => {
    setLayout({
      scale: Number(initialLayout?.scale || 1),
      offsetX: Number(initialLayout?.offsetX || 0),
      offsetY: Number(initialLayout?.offsetY || 0),
    });
  }, [entityId, initialLayout?.offsetX, initialLayout?.offsetY, initialLayout?.scale, role]);

  const mediaStyle = useMemo(() => ({
    transform: `translate(${layout.offsetX * 100}%, ${layout.offsetY * 100}%) scale(${layout.scale})`,
    transformOrigin: "center center",
  }), [layout]);

  const beginPointer = (event, mode) => {
    if (busy || saving || !frameRef.current) return;
    event.preventDefault();
    const bounds = frameRef.current.getBoundingClientRect();
    pointerRef.current = {
      id: event.pointerId,
      mode,
      x: event.clientX,
      y: event.clientY,
      width: bounds.width,
      height: bounds.height,
      layout,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const movePointer = (event) => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = (event.clientX - gesture.x) / Math.max(1, gesture.width);
    const dy = (event.clientY - gesture.y) / Math.max(1, gesture.height);
    if (gesture.mode === "move") {
      setLayout((current) => ({
        ...current,
        offsetX: clamp(gesture.layout.offsetX + dx / gesture.layout.scale, -0.5, 0.5),
        offsetY: clamp(gesture.layout.offsetY + dy / gesture.layout.scale, -0.5, 0.5),
      }));
      return;
    }
    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    const direction = gesture.mode === "shrink" ? -1 : 1;
    setLayout((current) => ({
      ...current,
      scale: clamp(gesture.layout.scale + (distance * direction * 2), 0.7, 4),
    }));
  };

  const endPointer = (event) => {
    if (pointerRef.current?.id === event.pointerId) pointerRef.current = null;
  };

  const handleWheel = (event) => {
    if (busy || saving) return;
    event.preventDefault();
    setLayout((current) => ({
      ...current,
      scale: clamp(current.scale * (event.deltaY > 0 ? 0.94 : 1.06), 0.7, 4),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await invoke("booru:set-entity-visual-layout", {
        kind,
        entityId,
        visualRole: role,
        layout,
      });
      onSaved?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };

  if (!source?.pathValue || source.mediaKind === "video") return null;
  const src = toFileUrl(source.pathValue);

  return (
    <div className="booruVisualCropper" role="dialog" aria-label={`Ajustar ${isBanner ? "banner" : "perfil"}`}>
      <div
        ref={frameRef}
        className={["booruVisualCropper__frame", isBanner ? "is-banner" : "is-avatar"].join(" ")}
        onPointerDown={(event) => beginPointer(event, "move")}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={handleWheel}
      >
        <img src={src} alt="" draggable="false" style={mediaStyle} />
        <span className="booruVisualCropper__shade" aria-hidden="true" />
        <span className="booruVisualCropper__handle booruVisualCropper__handle--nw" onPointerDown={(event) => beginPointer(event, "shrink")} />
        <span className="booruVisualCropper__handle booruVisualCropper__handle--ne" onPointerDown={(event) => beginPointer(event, "grow")} />
        <span className="booruVisualCropper__handle booruVisualCropper__handle--sw" onPointerDown={(event) => beginPointer(event, "shrink")} />
        <span className="booruVisualCropper__handle booruVisualCropper__handle--se" onPointerDown={(event) => beginPointer(event, "grow")} />
      </div>
      <div className="booruVisualCropper__actions">
        <Button
          type="button"
          onClick={() => {
            setLayout({
              scale: Number(initialLayout?.scale || 1),
              offsetX: Number(initialLayout?.offsetX || 0),
              offsetY: Number(initialLayout?.offsetY || 0),
            });
            onCancel?.();
          }}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="button" tone="primary" onClick={() => void save()} disabled={busy || saving}>
          {saving ? "Guardando" : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
