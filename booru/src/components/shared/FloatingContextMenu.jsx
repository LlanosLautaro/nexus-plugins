import { ActionMenu } from "@nexus/ui";

export default function FloatingContextMenu({ state, onClose, onAction }) {
  if (!state?.items?.length) return null;

  return (
    <ActionMenu
      ariaLabel="Acciones de Booru"
      groups={[{ id: "booru-actions", items: state.items }]}
      x={state.x}
      y={state.y}
      onAction={(action) => onAction?.(action.id)}
      onClose={onClose}
    />
  );
}
