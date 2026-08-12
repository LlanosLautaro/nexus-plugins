import { cx } from "../../utils/cx.js";

export function Button({
  className = "",
  tone = "secondary",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={cx(
        "nexus-ui-button",
        tone !== "secondary" && `nexus-ui-button--${tone}`,
        className,
      )}
    >
      {children}
    </button>
  );
}
