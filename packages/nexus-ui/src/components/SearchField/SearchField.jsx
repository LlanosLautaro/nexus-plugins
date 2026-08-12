import { forwardRef } from "react";
import { cx } from "../../utils/cx.js";

function DefaultSearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  );
}

export const SearchField = forwardRef(function SearchField(
  {
    className = "",
    endAction = null,
    icon,
    inputClassName = "",
    ...props
  },
  ref,
) {
  return (
    <div className={cx("nexus-ui-search-field", className)}>
      {icon !== null ? (
        <span className="nexus-ui-search-field__icon">
          {icon === undefined ? <DefaultSearchIcon /> : icon}
        </span>
      ) : null}
      <input
        {...props}
        ref={ref}
        className={cx("nexus-ui-search-field__input", inputClassName)}
        type="search"
      />
      {endAction ? <span className="nexus-ui-search-field__action">{endAction}</span> : null}
    </div>
  );
});
