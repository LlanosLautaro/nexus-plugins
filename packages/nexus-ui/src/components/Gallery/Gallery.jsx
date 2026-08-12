import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";

function normalizeColumnCount(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : fallback;
}

function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object") {
    ref.current = value;
  }
}

export const GalleryGrid = forwardRef(function GalleryGrid(
  {
    as: Component = "div",
    className = "",
    compact = false,
    virtual = false,
    columns,
    defaultColumns,
    minColumns = 1,
    maxColumns = 12,
    adjustableColumns = true,
    onColumnsChange,
    style,
    children,
    ...props
  },
  ref,
) {
  const nodeRef = useRef(null);
  const leftControlPressedRef = useRef(false);
  const [uncontrolledColumns, setUncontrolledColumns] = useState(() =>
    normalizeColumnCount(defaultColumns),
  );
  const controlledColumns = normalizeColumnCount(columns);
  const activeColumns = controlledColumns ?? uncontrolledColumns;
  const normalizedMinColumns = normalizeColumnCount(minColumns, 1);
  const normalizedMaxColumns = Math.max(
    normalizedMinColumns,
    normalizeColumnCount(maxColumns, 12),
  );

  const setNodeRef = useCallback((node) => {
    nodeRef.current = node;
    assignRef(ref, node);
  }, [ref]);

  useEffect(() => {
    if (!adjustableColumns || !activeColumns || !nodeRef.current) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = true;
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = false;
      }
    };
    const handleBlur = () => {
      leftControlPressedRef.current = false;
    };
    const handleWheel = (event) => {
      if (!leftControlPressedRef.current || !Number(event.deltaY)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const direction = Number(event.deltaY) < 0 ? -1 : 1;
      const nextColumns = Math.min(
        normalizedMaxColumns,
        Math.max(normalizedMinColumns, activeColumns + direction),
      );

      if (nextColumns === activeColumns) {
        return;
      }

      if (controlledColumns == null) {
        setUncontrolledColumns(nextColumns);
      }
      onColumnsChange?.(nextColumns);
    };

    const node = nodeRef.current;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    node.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      node.removeEventListener("wheel", handleWheel);
    };
  }, [
    activeColumns,
    adjustableColumns,
    controlledColumns,
    normalizedMaxColumns,
    normalizedMinColumns,
    onColumnsChange,
  ]);

  const resolvedStyle = activeColumns && !virtual
    ? {
        ...style,
        gridTemplateColumns: `repeat(${activeColumns}, minmax(0, 1fr))`,
      }
    : style;

  return (
    <Component
      {...props}
      ref={setNodeRef}
      data-gallery-columns={activeColumns || undefined}
      style={resolvedStyle}
      className={cx(
        "nexus-ui-gallery",
        activeColumns && adjustableColumns && "nexus-ui-gallery--columns-adjustable",
        compact && "nexus-ui-gallery--compact",
        virtual && "nexus-ui-gallery--virtual",
        className,
      )}
    >
      {children}
    </Component>
  );
});

export const GalleryCard = forwardRef(function GalleryCard(
  {
    as: Component = "article",
    className = "",
    interactive,
    selected = false,
    children,
    ...props
  },
  ref,
) {
  const isInteractive = interactive ?? (Component === "button" || Component === "a");

  return (
    <Component
      {...props}
      ref={ref}
      className={cx(
        "nexus-ui-gallery-card",
        isInteractive && "nexus-ui-gallery-card--interactive",
        selected && "is-selected",
        className,
      )}
    >
      {children}
    </Component>
  );
});

export function GalleryCardMedia({ className = "", children }) {
  return <div className={cx("nexus-ui-gallery-card__media", className)}>{children}</div>;
}

export function GalleryCardBody({ className = "", children }) {
  return <div className={cx("nexus-ui-gallery-card__body", className)}>{children}</div>;
}

export function GalleryCardTitle({ as: Component = "strong", className = "", children }) {
  return <Component className={cx("nexus-ui-gallery-card__title", className)}>{children}</Component>;
}

export function GalleryCardMeta({ as: Component = "span", className = "", children }) {
  return <Component className={cx("nexus-ui-gallery-card__meta", className)}>{children}</Component>;
}
