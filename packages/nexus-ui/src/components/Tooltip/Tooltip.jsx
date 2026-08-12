import { cx } from "../../utils/cx.js";

export function Tooltip({ className = "", children }) {
  return <span className={cx("nexus-ui-tooltip", className)}>{children}</span>;
}
