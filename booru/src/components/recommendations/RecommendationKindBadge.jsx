const React = window.React;
const { useCallback, useEffect, useRef, useState } = React;

export default function RecommendationKindBadge({
  item,
  tooltip = "",
  className = "",
  helpers,
}) {
  const { getRecommendationKindBadgeLabel } = helpers;
  const [visible, setVisible] = useState(false);
  const hoverTimerRef = useRef(null);
  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);
  const startTooltipTimer = useCallback(() => {
    clearHoverTimer();

    if (!tooltip) {
      return;
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, 1000);
  }, [clearHoverTimer, tooltip]);
  const stopTooltip = useCallback(() => {
    clearHoverTimer();
    setVisible(false);
  }, [clearHoverTimer]);

  useEffect(() => () => {
    clearHoverTimer();
  }, [clearHoverTimer]);

  return (
    <span
      className={[
        "booruView__selectionChip",
        "booruView__selectionChip--kindBadge",
        className,
      ].filter(Boolean).join(" ")}
      aria-label={tooltip || undefined}
      onMouseEnter={startTooltipTimer}
      onMouseLeave={stopTooltip}
    >
      <span>{getRecommendationKindBadgeLabel(item)}</span>
      {visible && tooltip ? (
        <span className="booruView__kindTooltip" role="tooltip">
          {tooltip}
        </span>
      ) : null}
    </span>
  );
}
