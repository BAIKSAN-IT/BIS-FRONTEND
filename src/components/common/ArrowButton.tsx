import React, { memo } from "react";

type Direction = "up" | "down";

interface ArrowButtonProps {
  direction: Direction;      // "up" | "down"
  onClick?: () => void;

  /** 버튼 크기 */
  width?: number;            // 기본 18
  height?: number;           // 기본 14

  /** SVG 화살표 크기 (가로/세로 독립 제어) */
  arrowWidth?: number;       // 기본 12  ← 가로 늘리고 싶으면 이 값 키우기
  arrowHeight?: number;      // 기본 6   ← 세로 줄이고 싶으면 이 값 줄이기

  /** 스타일 */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ArrowButton: React.FC<ArrowButtonProps> = memo(
  ({
     direction,
     onClick,
     width = 18,
     height = 14,
     arrowWidth = 12,
     arrowHeight = 6,
     disabled = false,
     className,
     style,
   }) => {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={className}
        style={{
          width,
          height,
          padding: 0,
          border: "1px solid #ccc",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
      >
        <svg
          width={arrowWidth}
          height={arrowHeight}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {direction === "up" ? (
            /* ▲ */
            <path d="M7 14l5-5 5 5z" fill="currentColor" />
          ) : (
            /* ▼ */
            <path d="M7 10l5 5 5-5z" fill="currentColor" />
          )}
        </svg>
      </button>
    );
  }
);

export default ArrowButton;
