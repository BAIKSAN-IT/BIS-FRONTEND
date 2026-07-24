// hooks/useDragResize.ts
import { useEffect, useRef, useState } from "react";

export function useDragResize(storageKey = "recapSplitPct", defaultPct = 33) {
  const [leftPct, setLeftPct] = useState(() => {
    const v = Number(localStorage.getItem(storageKey));
    return Number.isFinite(v) && v >= 20 && v <= 80 ? v : defaultPct;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onStartDrag = (e: React.MouseEvent) => {
    draggingRef.current = true;
    e.preventDefault();
  };

  const onReset = () => setLeftPct(defaultPct);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(90, Math.max(10, pct)));
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        localStorage.setItem(storageKey, String(leftPct));
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [leftPct, storageKey]);

  return { leftPct, onStartDrag, onReset, containerRef };
}
