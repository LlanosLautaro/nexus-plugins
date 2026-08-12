import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

export const ShellTab = forwardRef(function ShellTab(
  { active = false, className = "", exiting = false, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        "nexus-shell-tab",
        active && "is-active",
        exiting && "is-exiting",
        className,
      )}
    />
  );
});
