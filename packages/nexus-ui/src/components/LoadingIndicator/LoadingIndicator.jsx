import { cx } from "../../utils/cx.js";

export function LoadingIndicator({
  className = "",
  label = "Cargando",
  ...props
}) {
  return (
    <span
      {...props}
      className={cx("nexus-ui-loading", className)}
      role="status"
      aria-label={label}
    >
      <span className="nexus-ui-loading__cell" />
      <span className="nexus-ui-loading__cell" />
      <span className="nexus-ui-loading__cell" />
      <span className="nexus-ui-loading__cell" />
    </span>
  );
}
