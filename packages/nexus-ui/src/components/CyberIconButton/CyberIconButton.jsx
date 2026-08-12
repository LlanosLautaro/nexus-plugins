import { useState } from "react";
import { Tooltip } from "../Tooltip/Tooltip.jsx";
import { cx } from "../../utils/cx.js";

export function CyberIconButton({
  active = false,
  className = "",
  children,
  label,
  title,
  tone = "neutral",
  ref,
  onClick,
  onPointerLeave,
  ...props
}) {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const accessibleLabel = props["aria-label"] || label || title;
  const tooltipLabel = label || title;

  return (
    <button
      {...props}
      ref={ref}
      type={props.type || "button"}
      className={cx(
        "nexus-ui-cyber-icon-button",
        active && "is-active",
        tone !== "neutral" && `nexus-ui-cyber-icon-button--${tone}`,
        tooltipDismissed && "is-tooltip-dismissed",
        className,
      )}
      aria-label={accessibleLabel}
      onClick={(event) => {
        setTooltipDismissed(true);
        onClick?.(event);
      }}
      onPointerLeave={(event) => {
        setTooltipDismissed(false);
        onPointerLeave?.(event);
      }}
    >
      <span className="nexus-ui-cyber-icon-button__icon">{children}</span>
      <span className="nexus-ui-cyber-icon-button__glare" aria-hidden="true" />
      {tooltipLabel ? <Tooltip>{tooltipLabel}</Tooltip> : null}
    </button>
  );
}
