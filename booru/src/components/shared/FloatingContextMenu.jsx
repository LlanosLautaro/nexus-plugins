const React = window.React;
const { useEffect } = React;

export default function FloatingContextMenu({ state, onClose, onAction }) {
  useEffect(() => {
    if (!state) return undefined;
    const close = () => onClose?.();
    const escape = (event) => { if (event.key === "Escape") onClose?.(); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [onClose, state]);

  if (!state?.items?.length) return null;
  return (
    <div className="booruView__contextMenu" style={{ left: Math.max(8, state.x), top: Math.max(8, state.y) }} onPointerDown={(event) => event.stopPropagation()}>
      {state.items.map((item) => (
        <button key={item.id} type="button" className={["booruView__contextMenuItem", item.danger ? "is-danger" : ""].filter(Boolean).join(" ")} onClick={() => onAction?.(item.id)} disabled={item.disabled}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
