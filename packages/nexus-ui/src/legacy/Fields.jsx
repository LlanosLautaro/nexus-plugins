import { cx } from "../utils/cx.js";

export function Field({ className = "", label = "", description = "", wide = false, children }) {
  return (
    <label className={cx("nexus-ui-field", wide && "nexus-ui-field--wide", className)}>
      <span className="nexus-ui-field__label">{label}</span>
      {description ? <span className="nexus-ui-field__description">{description}</span> : null}
      <div className="nexus-ui-field__control">{children}</div>
    </label>
  );
}

export function InlineField({ className = "", label = "", children, grow = false }) {
  return (
    <label className={cx("nexus-ui-inline-field", grow && "nexus-ui-inline-field--grow", className)}>
      <span className="nexus-ui-inline-field__label">{label}</span>
      <div className="nexus-ui-inline-field__control">{children}</div>
    </label>
  );
}

export function FieldGrid({ className = "", children }) {
  return <div className={cx("nexus-ui-field-grid", className)}>{children}</div>;
}
