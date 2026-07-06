import {
  CheckIcon,
  ChevronRightIcon,
} from "../icons.jsx";

function QueueStatusPill({ status, label }) {
  return (
    <span className={["habitosView__queueStatusPill", `is-${status || "pending"}`].join(" ")}>
      {label}
    </span>
  );
}

export function QueueItemCard({
  item,
  badge,
  secondaryCopy = "",
  toggleMeta = null,
  isSelected = false,
  isSettled = false,
  saving = false,
  inlineActionLabel = "",
  inlineActionDisabled = false,
  showStatusPill = false,
  quantityControl = null,
  subitems = null,
  onToggle,
  onContextMenu,
  onInlineAction,
  onToggleExpanded,
  onToggleSubitem,
}) {
  return (
    <article
      className={[
        "habitosView__queueItem",
        item.isOverdue ? "is-overdue" : "",
        isSelected ? "is-selected" : "",
        item.status ? `is-status-${item.status}` : "",
        isSettled ? "is-settled" : "",
      ].filter(Boolean).join(" ")}
      onContextMenu={(event) => onContextMenu?.(event, item)}
    >
      <div
        className="habitosView__queueBadge"
        style={{ "--habitos-item-accent": badge?.accentColor }}
        aria-hidden="true"
      >
        {badge?.icon || null}
      </div>

      <div className="habitosView__queueCopy">
        <div className="habitosView__queueCopyText">
          <strong>{item.title}</strong>
          {secondaryCopy ? <span>{secondaryCopy}</span> : null}
        </div>
      </div>

      <div className="habitosView__queueActions">
        {showStatusPill ? (
          <QueueStatusPill status={item.status} label={item.statusLabel} />
        ) : null}

        {quantityControl}

        {subitems ? (
          <button
            type="button"
            className={["habitosView__queueExpand", subitems.isExpanded ? "is-expanded" : ""].filter(Boolean).join(" ")}
            onClick={() => onToggleExpanded?.(item.id)}
            disabled={saving}
            aria-expanded={subitems.isExpanded ? "true" : "false"}
          >
            <ChevronRightIcon />
            <span>{subitems.label}</span>
          </button>
        ) : null}

        {inlineActionLabel ? (
          <button
            type="button"
            className="habitosView__queueInlineAction"
            onClick={onInlineAction || onToggle}
            disabled={saving || inlineActionDisabled}
          >
            {inlineActionLabel}
          </button>
        ) : null}

        {toggleMeta ? (
          <button
            type="button"
            className={["habitosView__queueCheck", toggleMeta.className].filter(Boolean).join(" ")}
            onClick={onToggle}
            aria-label={toggleMeta.ariaLabel}
            aria-pressed={toggleMeta.isPressed ? "true" : "false"}
            disabled={saving || toggleMeta.disabled}
          >
            {toggleMeta.content}
          </button>
        ) : null}
      </div>

      {subitems ? (
        <div
          className={[
            "habitosView__queueChecklistRegion",
            subitems.isExpanded ? "is-expanded" : "",
          ].filter(Boolean).join(" ")}
          aria-hidden={subitems.isExpanded ? undefined : "true"}
        >
          <div className="habitosView__queueChecklist">
            {subitems.items.map((subitem) => (
              <button
                key={subitem.id}
                type="button"
                className={["habitosView__queueChecklistItem", subitem.isCompleted ? "is-completed" : ""].filter(Boolean).join(" ")}
                onClick={() => onToggleSubitem?.(item, subitem.id)}
                disabled={saving || !subitems.isExpanded || subitems.toggleDisabled}
                tabIndex={subitems.isExpanded ? 0 : -1}
              >
                <span className="habitosView__queueChecklistMark" aria-hidden="true">
                  {subitem.isCompleted ? <CheckIcon /> : null}
                </span>
                <span>{subitem.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
