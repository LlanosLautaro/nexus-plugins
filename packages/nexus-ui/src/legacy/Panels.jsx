import { cx } from "../utils/cx.js";

export function SectionPanel({ className = "", tone = "default", padding = "default", children }) {
  return (
    <section className={cx(
      "nexus-ui-panel",
      tone !== "default" && `nexus-ui-panel--${tone}`,
      padding !== "default" && `nexus-ui-panel--padding-${padding}`,
      className,
    )}>
      {children}
    </section>
  );
}

export function PanelHeader({ className = "", children, actions = null }) {
  return (
    <div className={cx("nexus-ui-panel-header", className)}>
      <div className="nexus-ui-panel-header__copy">{children}</div>
      {actions ? <div className="nexus-ui-panel-header__actions">{actions}</div> : null}
    </div>
  );
}

export function PanelTitle({ eyebrow = "", title = "", description = "" }) {
  return (
    <div className="nexus-ui-panel-title">
      {eyebrow ? <span className="nexus-ui-eyebrow">{eyebrow}</span> : null}
      {title ? <strong>{title}</strong> : null}
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function PanelStack({ className = "", children }) {
  return <div className={cx("nexus-ui-stack", className)}>{children}</div>;
}
