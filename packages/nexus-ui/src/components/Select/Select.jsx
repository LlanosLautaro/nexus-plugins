import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

export const Select = forwardRef(function Select(
  { className = "", children, ...props },
  ref,
) {
  return (
    <select
      {...props}
      ref={ref}
      className={cx("nexus-ui-select", className)}
    >
      {children}
    </select>
  );
});
