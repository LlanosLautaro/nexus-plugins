import { Button, SegmentedControl } from "../../../../../nexus-frontend/src/ui/index.js";

export default function ContextBrowseControls({
  value,
  options,
  groupOptions = [],
  groupOrderOptions = [],
  onChange,
  onRegenerateRandom,
  compact = false,
}) {
  const directionLabel = value?.direction === "desc" ? "Decreciente" : "Creciente";
  const random = value?.sortBy === "random";
  const hasResourceGrouping = groupOptions.length > 0;
  const resourceSectioned = value?.grouping === "sectioned" && hasResourceGrouping;

  return (
    <div className={["booruView__browseControls", compact ? "is-compact" : ""].filter(Boolean).join(" ")}>
      {resourceSectioned ? (
        <>
          <label className="booruView__browseField">
            <span>Agrupar por</span>
            <select
              value={value?.groupBy || "importedAt"}
              onChange={(event) => onChange?.({ ...value, groupBy: event.target.value })}
              aria-label="Criterio de agrupación"
            >
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="booruView__browseField">
            <span>Ordenar grupos</span>
            <select
              value={value?.groupOrderBy || "importedAt"}
              onChange={(event) => onChange?.({ ...value, groupOrderBy: event.target.value })}
              aria-label="Criterio de orden de grupos"
            >
              {groupOrderOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <label className="booruView__browseField">
          <span>Ordenar</span>
          <select
            value={value?.sortBy || ""}
            onChange={(event) => {
              const sortBy = event.target.value;
              onChange?.({
                ...value,
                sortBy,
                ...(!hasResourceGrouping && value?.grouping === "sectioned" && sortBy !== "random"
                  ? { groupBy: sortBy }
                  : {}),
              });
            }}
            aria-label="Criterio de orden"
          >
            {(Array.isArray(options) ? options : []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      )}

      <span className="booruView__browseTooltipHost">
        <Button
          type="button"
          className="booruView__browseDirection"
          aria-label={directionLabel}
          onClick={() => onChange?.({
            ...value,
            direction: value?.direction === "desc" ? "asc" : "desc",
          })}
        >
          <span aria-hidden="true">{value?.direction === "desc" ? "↓" : "↑"}</span>
        </Button>
        <span className="booruView__browseTooltip" role="tooltip">{directionLabel}</span>
      </span>

      {random && !resourceSectioned ? (
        <span className="booruView__browseTooltipHost">
          <Button
            type="button"
            className="booruView__browseDirection"
            aria-label="Volver a mezclar"
            onClick={() => onRegenerateRandom?.()}
          >
            <span aria-hidden="true">↻</span>
          </Button>
          <span className="booruView__browseTooltip" role="tooltip">Volver a mezclar</span>
        </span>
      ) : null}

      <SegmentedControl
        className="booruView__browseGrouping"
        variant="compact"
        options={[
          { value: "continuous", label: "Continuo" },
          { value: "sectioned", label: "Seccionado" },
        ]}
        value={random ? "continuous" : (value?.grouping || "continuous")}
        onChange={(grouping) => onChange?.({
          ...value,
          grouping,
          ...(!hasResourceGrouping && grouping === "sectioned" ? { groupBy: value?.sortBy } : {}),
        })}
        disabled={random}
        ariaLabel="Modo de agrupacion"
      />
    </div>
  );
}
