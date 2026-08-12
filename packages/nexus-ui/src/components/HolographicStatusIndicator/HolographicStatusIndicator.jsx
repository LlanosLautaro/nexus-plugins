import { cx } from "../../utils/cx.js";

export function HolographicStatusIndicator({
  className = "",
  compact = false,
  label,
  status = "ok",
}) {
  const normalizedStatus = ["ok", "busy", "error"].includes(status) ? status : "ok";
  const defaultLabel = {
    ok: "Nexus funciona correctamente",
    busy: "Nexus está procesando cambios",
    error: "Nexus detectó un error",
  }[normalizedStatus];

  return (
    <span
      aria-label={label || defaultLabel}
      className={cx(
        "nexus-ui-holo-status",
        `is-${normalizedStatus}`,
        compact && "is-compact",
        className,
      )}
      role="status"
    >
      <span className="nexus-ui-holo-status__aura" aria-hidden="true" />
      <span className="nexus-ui-holo-status__orb" aria-hidden="true">
        <i className="nexus-ui-holo-status__core" />
        <i className="nexus-ui-holo-status__scan" />
      </span>
    </span>
  );
}
