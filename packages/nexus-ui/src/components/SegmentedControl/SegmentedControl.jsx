import { cx } from "../../utils/cx.js";

function readOptionValue(option) {
  return option?.value ?? option?.id;
}

export function SegmentedControl({
  ariaLabel = "Selector",
  className = "",
  flush = false,
  iconOnly = false,
  onChange,
  options = [],
  orientation = "horizontal",
  renderIcon,
  value,
  variant = "default",
}) {
  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  const activeIndex = Math.max(
    0,
    normalizedOptions.findIndex((option) => readOptionValue(option) === value),
  );
  const isCyber = variant === "cyber" || iconOnly;

  return (
    <div
      aria-label={ariaLabel}
      className={cx(
        "nexus-ui-segmented",
        `nexus-ui-segmented--${orientation}`,
        variant !== "default" && `nexus-ui-segmented--${variant}`,
        isCyber && "nexus-ui-segmented--icon-only",
        flush && "nexus-ui-segmented--flush",
        normalizedOptions.length && "has-active",
        className,
      )}
      role="radiogroup"
      style={{
        "--segment-count": Math.max(1, normalizedOptions.length),
        "--active-index": activeIndex,
      }}
    >
      <span className="nexus-ui-segmented__highlight" aria-hidden="true" />
      {normalizedOptions.map((option) => {
        const optionValue = readOptionValue(option);
        const active = optionValue === value;
        const disabled = Boolean(option.disabled);
        const icon = renderIcon?.(option) ?? option.icon ?? null;

        return (
          <button
            aria-checked={active}
            aria-label={iconOnly ? option.label : undefined}
            className={cx(
              "nexus-ui-segmented__button",
              active && "is-active",
              disabled && "is-disabled",
            )}
            disabled={disabled}
            key={optionValue}
            role="radio"
            type="button"
            onClick={() => {
              if (!disabled) {
                onChange?.(optionValue);
              }
            }}
          >
            {icon ? <span className="nexus-ui-segmented__icon">{icon}</span> : null}
            {isCyber ? <span className="nexus-ui-segmented__glare" aria-hidden="true" /> : null}
            {!iconOnly ? <span className="nexus-ui-segmented__label">{option.label}</span> : null}
            {iconOnly ? <span className="nexus-ui-tooltip">{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
