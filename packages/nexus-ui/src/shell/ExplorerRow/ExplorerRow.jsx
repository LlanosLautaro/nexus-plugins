import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

export const ExplorerRow = forwardRef(function ExplorerRow(
  { active = false, className = "", selected = false, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        "nexus-shell-explorer-row",
        active && "is-active",
        selected && "is-selected",
        className,
      )}
    />
  );
});
