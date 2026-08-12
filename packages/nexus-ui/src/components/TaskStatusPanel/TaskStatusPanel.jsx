import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button.jsx";
import { cx } from "../../utils/cx.js";

const VIEWPORT_MARGIN = 8;

function normalizeProgress(progress) {
  const current = Math.max(0, Number(progress?.current) || 0);
  const rawTotal = progress?.total;
  const total = rawTotal == null ? null : Math.max(current, Number(rawTotal) || 0);

  return {
    current,
    total,
    percent: total > 0 ? Math.min(100, (current / total) * 100) : null,
    label: String(progress?.label || "").trim(),
  };
}

export function TaskStatusPanel({
  anchorRef,
  ariaLabel = "Actividad de Nexus",
  className = "",
  emptyMessage = "Sin tareas activas",
  onClose,
  onDismissError,
  tasks = [],
}) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({
    ready: false,
    x: VIEWPORT_MARGIN,
    y: VIEWPORT_MARGIN,
  });

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedAnchor = anchorRef?.current?.contains?.(event.target);
      if (!panelRef.current?.contains(event.target) && !clickedAnchor) {
        onClose?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    const closeOnViewportChange = () => onClose?.();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [anchorRef, onClose]);

  useEffect(() => {
    if (position.ready) {
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [position.ready]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef?.current;

    if (!panel || !anchor) {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const requestedX = anchorRect.right + 10;
    const requestedY = anchorRect.bottom - panelRect.height;

    setPosition({
      ready: true,
      x: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedX, window.innerWidth - panelRect.width - VIEWPORT_MARGIN),
      ),
      y: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedY, window.innerHeight - panelRect.height - VIEWPORT_MARGIN),
      ),
    });
  }, [anchorRef, tasks]);

  return createPortal(
    <section
      aria-label={ariaLabel}
      className={cx("nexus-ui-task-status-panel", className)}
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        visibility: position.ready ? "visible" : "hidden",
      }}
    >
      <header className="nexus-ui-task-status-panel__header">
        <strong>Actividad de Nexus</strong>
        <span>{tasks.length ? `${tasks.length} en curso` : "Todo en orden"}</span>
      </header>

      {tasks.length ? (
        <div className="nexus-ui-task-status-panel__list">
          {tasks.map((task) => {
            const progress = normalizeProgress(task.progress);
            const isError = task.state === "error";

            return (
              <article
                className={cx(
                  "nexus-ui-task-status-panel__task",
                  isError && "is-error",
                )}
                key={`${task.ownerId}:${task.id}`}
              >
                <div className="nexus-ui-task-status-panel__taskHeader">
                  <span>{task.ownerLabel}</span>
                  {progress.total != null ? (
                    <small>{progress.current}/{progress.total}</small>
                  ) : null}
                </div>
                <strong>{task.title}</strong>
                {task.detail ? <p>{task.detail}</p> : null}

                {progress.percent != null ? (
                  <div
                    aria-label={`${progress.current} de ${progress.total} ${progress.label}`.trim()}
                    aria-valuemax={progress.total}
                    aria-valuemin="0"
                    aria-valuenow={progress.current}
                    className="nexus-ui-task-status-panel__progress"
                    role="progressbar"
                  >
                    <span style={{ width: `${progress.percent}%` }} />
                  </div>
                ) : null}

                {isError ? (
                  <Button
                    className="nexus-ui-task-status-panel__dismiss"
                    type="button"
                    onClick={() => onDismissError?.(task)}
                  >
                    Descartar
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="nexus-ui-task-status-panel__empty">{emptyMessage}</p>
      )}
    </section>,
    document.body,
  );
}
