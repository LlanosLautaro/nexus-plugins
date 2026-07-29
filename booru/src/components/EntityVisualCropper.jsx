import { Button } from "@nexus/ui";
import {
  getBooruEntityVisualMediaStyle,
  normalizeBooruEntityVisualLayout,
} from "../domain/entity-visual-policy.js";

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
 * Ratio-locked workbench for entity avatars and banners. The visible frame is
 * the final target ratio. Dragging pans the media and the wheel adjusts its
 * scale; the surrounding frame remains Nexus background by design.
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
  const [layout, setLayout] = useState(() => normalizeBooruEntityVisualLayout(initialLayout));
  const [saving, setSaving] = useState(false);
  const isBanner = role === "banner";

  useEffect(() => {
    setLayout(normalizeBooruEntityVisualLayout(initialLayout));
  }, [entityId, initialLayout?.offsetX, initialLayout?.offsetY, initialLayout?.scale, role]);

  const mediaStyle = useMemo(() => getBooruEntityVisualMediaStyle(layout), [layout]);

  const beginPointer = (event) => {
    if (busy || saving || !frameRef.current) return;
    event.preventDefault();
    const bounds = frameRef.current.getBoundingClientRect();
    pointerRef.current = {
      id: event.pointerId,
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
    setLayout((current) => ({
      ...current,
      offsetX: clamp(gesture.layout.offsetX + dx, -1.5, 1.5),
      offsetY: clamp(gesture.layout.offsetY + dy, -1.5, 1.5),
    }));
  };

  const endPointer = (event) => {
    if (pointerRef.current?.id === event.pointerId) pointerRef.current = null;
  };

  const handleWheel = (event) => {
    if (busy || saving) return;
    event.preventDefault();
    const multiplier = event.deltaY < 0 ? 1.12 : 0.88;
    setLayout((current) => ({
      ...current,
      scale: clamp(current.scale * multiplier, 0.2, 4),
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

  if (!source?.pathValue) return null;
  const src = toFileUrl(source.pathValue);

  return (
    <div className="booruVisualCropper" role="dialog" aria-label={`Ajustar ${isBanner ? "banner" : "perfil"}`}>
      <div
        ref={frameRef}
        className={["booruVisualCropper__frame", isBanner ? "is-banner" : "is-avatar"].join(" ")}
        onPointerDown={beginPointer}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={handleWheel}
      >
        {source.mediaKind === "video" ? (
          <video src={src} style={mediaStyle} muted autoPlay loop playsInline preload="metadata" />
        ) : (
          <img src={src} alt="" draggable="false" style={mediaStyle} />
        )}
      </div>
      <div className="booruVisualCropper__actions">
        <Button
          type="button"
          onClick={() => {
            setLayout(normalizeBooruEntityVisualLayout(initialLayout));
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
