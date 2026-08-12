import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

export const TextArea = forwardRef(function TextArea(
  { className = "", ...props },
  ref,
) {
  return (
    <textarea
      {...props}
      ref={ref}
      className={cx("nexus-ui-textarea", className)}
    />
  );
});
