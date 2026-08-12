import { cx } from "../../utils/cx.js";

export function Checkbox({
  className = "",
  description = "",
  label,
  ...props
}) {
  return (
    <label className={cx("nexus-ui-checkbox", className)}>
      <input {...props} className="nexus-ui-checkbox__input" type="checkbox" />
      <span className="nexus-ui-checkbox__box" aria-hidden="true">
        <svg viewBox="0 0 12 10">
          <path d="M1 5.1 4.2 8 11 1" />
        </svg>
      </span>
      {label || description ? (
        <span className="nexus-ui-checkbox__copy">
          {label ? <span className="nexus-ui-checkbox__label">{label}</span> : null}
          {description ? (
            <span className="nexus-ui-checkbox__description">{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
