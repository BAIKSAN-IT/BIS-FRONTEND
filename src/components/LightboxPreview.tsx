import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  src: string;
  name?: string;
  onClose: () => void;
};

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;

const LightboxPreview: React.FC<Props> = ({ open, src, name, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // ← 추가 (deg)

  // ESC + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  // 열릴 때마다 줌 초기화
  useEffect(() => {
    if (open) {
      setScale(1);
      setRotation(0);
    }
  }, [open, src]);

  if (!open) return null;

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.min(ZOOM_MAX, +(s + ZOOM_STEP).toFixed(2)));
  };
  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.max(ZOOM_MIN, +(s - ZOOM_STEP).toFixed(2)));
  };
  const zoomReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
  };
  const rotateLeft = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((r) => (r - 90 + 360) % 360);
  };

  const rotateRight = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  const rotateReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation(0);
  };
  /*useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") rotateLeft();
      if (e.key === "ArrowRight") rotateRight();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);*/
  return createPortal(
    <div
      onClick={onClose}
      onWheel={(e) => {
        e.preventDefault();
        setScale((s) =>
          e.deltaY > 0
            ? Math.max(ZOOM_MIN, +(s - ZOOM_STEP).toFixed(2))
            : Math.min(ZOOM_MAX, +(s + ZOOM_STEP).toFixed(2))
        );
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 100000,
        display: "grid",
        placeItems: "center",
        padding: 16,
        overscrollBehavior: "contain",
      }}
    >
      {/* 닫기 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          border: "none",
          background: "rgba(255,255,255,0.2)",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
        }}
        aria-label="Close"
        title="닫기 (Esc)"
      >
        ×
      </button>

      {/* 컨텐츠 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "95vw", maxHeight: "95vh", display: "grid", placeItems: "center" }}
      >
        <img
          src={src}
          alt={name}
          style={{
            maxWidth: "95vw",
            maxHeight: "95vh",
            objectFit: "contain",
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            willChange: "transform",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            borderRadius: 8,
            transition: "transform 120ms ease",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setScale((s) => (s === 1 ? 2 : 1));
          }}
        />
      </div>

      {/* 하단 컨트롤 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          background: "rgba(0,0,0,0.45)",
          padding: "6px 10px",
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <button
          onClick={zoomOut}
          title="축소(-)"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          −
        </button>
        <span style={{ color: "#fff", fontSize: 13, minWidth: 48, textAlign: "center" }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          title="확대(+)"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={rotateLeft}
          title="왼쪽 회전"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ⟲
        </button>

        <button
          onClick={rotateRight}
          title="오른쪽 회전"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ⟳
        </button>

        <button
          onClick={rotateReset}
          title="회전 초기화"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          0°
        </button>
        <button
          onClick={zoomReset}
          title="원본(100%)"
          style={{
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 12,
            cursor: "pointer",
            marginLeft: 4,
          }}
        >
          100%
        </button>
      </div>
    </div>,
    document.body
  );
};

export default LightboxPreview;
