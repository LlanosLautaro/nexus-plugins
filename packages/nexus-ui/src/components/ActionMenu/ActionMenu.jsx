import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx.js";

const VIEWPORT_MARGIN = 8;

export function ActionMenu({
  align = "end",
  anchorRef,
  ariaLabel,
  className = "",
  groups = [],
  onAction,
  onClose,
  x,
  y,
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({
    ready: false,
    submenusLeft: false,
    x: x ?? 0,
    y: y ?? 0,
  });

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedAnchor = anchorRef?.current?.contains?.(event.target);
      if (!menuRef.current?.contains(event.target) && !clickedAnchor) {
        onClose?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
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

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const menuRect = menu.getBoundingClientRect();
    const anchorRect = anchorRef?.current?.getBoundingClientRect();
    const requestedX = Number.isFinite(x)
      ? x
      : align === "start"
        ? (anchorRect?.left ?? VIEWPORT_MARGIN)
        : (anchorRect?.right ?? VIEWPORT_MARGIN) - menuRect.width;
    const requestedY = Number.isFinite(y)
      ? y
      : (anchorRect?.bottom ?? VIEWPORT_MARGIN) + 7;

    setPosition({
      ready: true,
      submenusLeft: requestedX + menuRect.width + 224 > window.innerWidth,
      x: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedX, window.innerWidth - menuRect.width - VIEWPORT_MARGIN),
      ),
      y: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedY, window.innerHeight - menuRect.height - VIEWPORT_MARGIN),
      ),
    });
  }, [align, anchorRef, groups, x, y]);

  const renderActions = (actions, depth = 0) =>
    actions.map((action) => {
      const children = Array.isArray(action.children) ? action.children : [];
      return (
        <div
          className={cx(
            "nexus-ui-action-menu__item",
            children.length && "has-children",
          )}
          key={action.id}
        >
          <button
            aria-checked={action.checked}
            aria-haspopup={children.length ? "menu" : undefined}
            className={cx(
              action.danger && "is-danger",
              action.checked && "is-selected",
            )}
            disabled={action.disabled}
            role={action.role || "menuitem"}
            type="button"
            onClick={() => {
              if (children.length) return;
              onAction?.(action);
              action.onClick?.();
              if (!action.keepOpen) onClose?.();
            }}
          >
            {action.icon ? <span className="nexus-ui-action-menu__icon">{action.icon}</span> : null}
            <span className="nexus-ui-action-menu__copy">
              <strong>{action.label}</strong>
              {action.description ? <small>{action.description}</small> : null}
            </span>
            <span className="nexus-ui-action-menu__end">
              {children.length ? "›" : action.end}
            </span>
          </button>
          {children.length ? (
            <div
              aria-label={action.label}
              className="nexus-ui-action-menu nexus-ui-action-menu__submenu"
              role="menu"
              style={{ "--submenu-depth": depth + 1 }}
            >
              {renderActions(children, depth + 1)}
            </div>
          ) : null}
        </div>
      );
    });

  return createPortal(
    <div
      aria-label={ariaLabel}
      className={cx(
        "nexus-ui-action-menu",
        position.submenusLeft && "has-submenus-left",
        className,
      )}
      ref={menuRef}
      role="menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        visibility: position.ready ? "visible" : "hidden",
      }}
    >
      {groups.map((group, groupIndex) => (
        <div className="nexus-ui-action-menu__group" key={group.id || groupIndex}>
          {renderActions(group.items || [])}
        </div>
      ))}
    </div>,
    document.body,
  );
}
