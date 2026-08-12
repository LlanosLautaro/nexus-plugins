import { cx } from "../../utils/cx.js";

export function AnimatedMenuIcon({ className = "", open = false }) {
  return (
    <span
      aria-hidden="true"
      className={cx("nexus-ui-menu-icon", open && "is-open", className)}
    >
      <i />
      <i />
      <i />
    </span>
  );
}
