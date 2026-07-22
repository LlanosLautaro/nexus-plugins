const React = window.React;
const { useCallback, useEffect, useRef } = React;

export default function useGalleryColumnWheel(onColumnWheel) {
  const handlerRef = useRef(onColumnWheel);
  const detachRef = useRef(null);

  useEffect(() => {
    handlerRef.current = onColumnWheel;
  }, [onColumnWheel]);

  const attachColumnWheel = useCallback((node) => {
    detachRef.current?.();
    detachRef.current = null;
    if (!node) return;

    const handleWheel = (event) => {
      if (!(event.ctrlKey || event.metaKey) || typeof handlerRef.current !== "function") {
        return;
      }

      event.preventDefault();
      handlerRef.current(event);
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    detachRef.current = () => node.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => () => detachRef.current?.(), []);

  return attachColumnWheel;
}
