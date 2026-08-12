import { cx } from "../../utils/cx.js";

export function Switch({
  className = "",
  description = "",
  label,
  ...props
}) {
  return (
    <label className={cx("nexus-ui-switch", className)}>
      <input {...props} className="nexus-ui-switch__input" type="checkbox" role="switch" />
      <span className="nexus-ui-switch__track" aria-hidden="true">
        <span className="nexus-ui-switch__thumb" />
      </span>
      {label || description ? (
        <span className="nexus-ui-switch__copy">
          {label ? <span className="nexus-ui-switch__label">{label}</span> : null}
          {description ? (
            <span className="nexus-ui-switch__description">{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
