import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

export const Input = forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      className={cx("nexus-ui-input", className)}
      type={type}
    />
  );
});
