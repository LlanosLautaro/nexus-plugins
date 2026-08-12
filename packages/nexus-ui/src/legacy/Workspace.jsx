import { cx } from "../utils/cx.js";

export function WorkspacePage({ className = "", children }) {
  return <div className={cx("nexus-ui-page", className)}>{children}</div>;
}
export function WorkspaceTopbar({ className = "", children }) {
  return <div className={cx("nexus-ui-topbar", className)}>{children}</div>;
}
export function WorkspaceTitle({ className = "", eyebrow = "", title = "", description = "", aside = null }) {
  return (
    <div className={cx("nexus-ui-title", className)}>
      <div className="nexus-ui-title__copy">
        {eyebrow ? <span className="nexus-ui-eyebrow">{eyebrow}</span> : null}
        {title ? <strong>{title}</strong> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {aside ? <div className="nexus-ui-title__aside">{aside}</div> : null}
    </div>
  );
}
export function ToolbarActions({ className = "", children }) {
  return <div className={cx("nexus-ui-toolbar-actions", className)}>{children}</div>;
}
export function WorkspaceBody({ className = "", children }) {
  return <div className={cx("nexus-ui-body", className)}>{children}</div>;
}
export function SplitLayout({ className = "", variant = "main-aside", children }) {
  return (
    <div className={cx(
      "nexus-ui-split",
      variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
      className,
    )}>
      {children}
    </div>
  );
}
export function SplitMain({ className = "", children }) {
  return <div className={cx("nexus-ui-split__main", className)}>{children}</div>;
}
export function SplitAside({ className = "", children }) {
  return <aside className={cx("nexus-ui-split__aside", className)}>{children}</aside>;
}
export function SplitSidebar({ className = "", children }) {
  return <aside className={cx("nexus-ui-split__sidebar", className)}>{children}</aside>;
}
export function SplitDetail({ className = "", children }) {
  return <main className={cx("nexus-ui-split__detail", className)}>{children}</main>;
}
export function ScrollRegion({ className = "", children }) {
  return <div className={cx("nexus-ui-scroll-region", className)}>{children}</div>;
}
