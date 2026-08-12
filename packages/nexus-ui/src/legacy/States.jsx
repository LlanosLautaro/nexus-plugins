import { cx } from "../utils/cx.js";

export function Notice({ className = "", tone = "info", children }) {
  return <div className={cx("nexus-ui-notice", `nexus-ui-notice--${tone}`, className)}>{children}</div>;
}

export function StateBlock({
  className = "",
  tone = "default",
  eyebrow = "",
  title = "",
  description = "",
  centered = false,
  children = null,
}) {
  return (
    <div className={cx(
      "nexus-ui-state",
      tone !== "default" && `nexus-ui-state--${tone}`,
      centered && "nexus-ui-state--centered",
      className,
    )}>
      {eyebrow ? <span className="nexus-ui-eyebrow">{eyebrow}</span> : null}
      {title ? <strong>{title}</strong> : null}
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}

export function MetricCard({
  className = "",
  tone = "default",
  eyebrow = "",
  value = "",
  description = "",
  children = null,
}) {
  return (
    <div className={cx(
      "nexus-ui-metric",
      tone !== "default" && `nexus-ui-metric--${tone}`,
      className,
    )}>
      {eyebrow ? <span className="nexus-ui-eyebrow">{eyebrow}</span> : null}
      <strong>{value}</strong>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}
