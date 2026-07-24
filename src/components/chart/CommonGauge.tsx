import React, {memo, useMemo, useRef, useState} from "react";
import {Card} from "react-bootstrap";
import GaugeChart from "react-gauge-chart";
import {createPortal} from "react-dom";

const GaugeChartAny = GaugeChart as any;

export type GaugeStop = {
  stop: number;
  color: string;
};

export interface CommonGaugeProps {
  value?: number;
  min?: number;
  max: number;
  stops?: GaugeStop[];

  title?: string;
  showHeader?: boolean;

  showText?: boolean;
  formatValue?: (
    v: number,
    ctx: {min: number; max: number; percent: number}
  ) => string;

  widthPx?: number;
  heightPx?: number;

  className?: string;
  style?: React.CSSProperties;

  showNeedle?: boolean;
  needleColor?: string;
  needleBaseColor?: string;

  animate?: boolean;
  marginInPercent?: number;

  emptyText?: string;
  enablePopupPreview?: boolean;
}

const DEFAULT_PERCENT_STOPS: GaugeStop[] = [
  {stop: 30, color: "#EF4444"},
  {stop: 70, color: "#D69E2E"},
  {stop: 100, color: "#38A169"},
];

const MAJOR_TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const MINOR_TICKS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0);

function buildArcs(stops: GaugeStop[], min: number, max: number) {
  const safeMax = max === min ? min + 1 : max;
  const sorted = [...stops].sort((a, b) => a.stop - b.stop);

  const colors = sorted.map((s) => s.color);
  const normalizedStops = sorted.map((s) =>
    clamp((s.stop - min) / (safeMax - min), 0, 1)
  );

  let prev = 0;
  const lengths = normalizedStops.map((p) => {
    const len = Math.max(0, p - prev);
    prev = p;
    return len;
  });

  const sum = lengths.reduce((acc, cur) => acc + cur, 0);
  if (sum < 1) {
    lengths.push(1 - sum);
    colors.push(colors[colors.length - 1] ?? "#38A169");
  }

  return {
    arcColors: colors,
    arcLength: lengths,
  };
}

function getTickColor(tick: number) {
  if (tick >= 10 && tick <= 30) return "#EF4444";
  if (tick >= 40 && tick <= 70) return "#D69E2E";
  return "#38A169";
}

function getAngleByValue(value: number, min: number, max: number) {
  const safeMax = max === min ? min + 1 : max;

  // 너무 벌어지지 않게 각도 범위 축소
  // 끝값(10, 100)이 아래로 너무 떨어지지 않도록 조정
  const startDeg = -100;
  const endDeg = 100;

  const ratio = clamp((value - min) / (safeMax - min), 0, 1);
  return startDeg + (endDeg - startDeg) * ratio;
}

function getGaugeTickGeometry(
  value: number,
  min: number,
  max: number,
  kind: "major" | "minor"
) {
  const angleDeg = getAngleByValue(value, min, max);

  // viewBox 기준
  const cx = 50;
  const cy = 68;

  /**
   * 핵심:
   * - tick은 arc 바로 안쪽에
   * - label은 tick보다 더 안쪽에
   * => 숫자가 원형 밑(arc 안쪽)으로 들어감
   */
  const tickInnerR = kind === "major" ? 33.5 : 35.5;
  const tickOuterR = kind === "major" ? 39.8 : 38.2;
  const labelR = 27.8;

  const p1 = polarToCartesian(cx, cy, tickInnerR, angleDeg);
  const p2 = polarToCartesian(cx, cy, tickOuterR, angleDeg);
  const lp = polarToCartesian(cx, cy, labelR, angleDeg);

  return {
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
    lx: lp.x,
    ly: lp.y,
  };
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

const GaugeTicks = memo(({min, max}: {min: number; max: number}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* 보조 눈금 */}
      {MINOR_TICKS.map((tick) => {
        const {x1, y1, x2, y2} = getGaugeTickGeometry(tick, min, max, "minor");

        return (
          <line
            key={`minor-${tick}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={getTickColor(tick)}
            strokeWidth={0.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}

      {/* 메인 눈금 + 숫자 */}
      {MAJOR_TICKS.map((tick) => {
        const {x1, y1, x2, y2, lx, ly} = getGaugeTickGeometry(
          tick,
          min,
          max,
          "major"
        );
        const color = getTickColor(tick);

        return (
          <g key={`major-${tick}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <text
              x={lx}
              y={ly}
              fill={color}
              fontSize="4.2"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                letterSpacing: "-0.1px",
              }}
            >
              {tick}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
GaugeTicks.displayName = "GaugeTicks";

const CommonGauge = memo(({
                            value = 0,
                            min = 0,
                            max,
                            stops,

                            title = "",
                            showHeader = true,

                            showText = true,
                            formatValue = (_value, ctx) => `${Math.round(ctx.percent)}%`,

                            widthPx,
                            heightPx = 210,

                            className,
                            style,

                            showNeedle = true,
                            needleColor = "#1F2937",
                            needleBaseColor = "#1F2937",

                            animate = false,
                            marginInPercent = 0.01,

                            emptyText = "No data",
                            enablePopupPreview = false,
                          }: CommonGaugeProps) => {
  const touchDevice = useMemo(isTouchDevice, []);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const hasData = Number.isFinite(Number(value));
  const safeMax = useMemo(() => (max === min ? min + 1 : max), [min, max]);

  const clampedValue = useMemo(
    () => clamp(Number(value || 0), min, safeMax),
    [value, min, safeMax]
  );

  const percent = useMemo(
    () => (clampedValue - min) / (safeMax - min),
    [clampedValue, min, safeMax]
  );

  const appliedStops = useMemo(() => {
    if (stops?.length) return stops;

    if (min === 0 && Math.abs(safeMax - 100) < 0.0001) {
      return DEFAULT_PERCENT_STOPS;
    }

    const redEnd = min + (safeMax - min) * 0.3;
    const orangeEnd = min + (safeMax - min) * 0.7;

    return [
      {stop: redEnd, color: "#EF4444"},
      {stop: orangeEnd, color: "#D69E2E"},
      {stop: safeMax, color: "#38A169"},
    ];
  }, [stops, min, safeMax]);

  const {arcColors, arcLength} = useMemo(
    () => buildArcs(appliedStops, min, safeMax),
    [appliedStops, min, safeMax]
  );

  const centerText = showText
    ? formatValue(clampedValue, {
      min,
      max: safeMax,
      percent: percent * 100,
    })
    : "";

  const wrapperStyle: React.CSSProperties = {
    ...(style ?? {}),
    width: widthPx ? `${widthPx}px` : "100%",
    height: `${heightPx}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    margin: "0 auto",
  };

  const clearCloseTimer = () => {
    if (closeTimer.current != null && typeof window !== "undefined") {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    if (!enablePopupPreview || touchDevice) return;
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    if (!enablePopupPreview || touchDevice) return;
    clearCloseTimer();
    if (typeof window !== "undefined") {
      closeTimer.current = window.setTimeout(() => setOpen(false), 120);
    }
  };

  const handleTap = () => {
    if (!enablePopupPreview || !touchDevice) return;
    setOpen((prev) => !prev);
  };

  const gaugeNode = (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GaugeChartAny
        id={`common-gauge-${title || "default"}`}
        nrOfLevels={arcColors.length}
        arcsLength={arcLength}
        colors={arcColors}
        percent={percent}
        animate={animate}
        marginInPercent={marginInPercent}
        arcPadding={0}
        cornerRadius={0}
        needleColor={showNeedle ? needleColor : "transparent"}
        needleBaseColor={showNeedle ? needleBaseColor : "transparent"}
        needleScale={0.82}
        hideText={true}
      />

      <GaugeTicks min={min} max={safeMax} />

      {/* 바늘 중심축 느낌 */}
      {showNeedle && (
        <>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "78%",
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #4B5563, #111827)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "78%",
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#E5E7EB",
              zIndex: 4,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {showText && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "67%",
            transform: "translate(-50%, -50%)",
            fontSize: 28,
            fontWeight: 800,
            color: "#16304F",
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 1px 2px rgba(255,255,255,0.9)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: "-0.4px",
          }}
        >
          {centerText}
        </div>
      )}
    </div>
  );

  if (!hasData) {
    return (
      <Card className="p-2">
        {showHeader && (
          <div
            className="mt-n1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div
              className="mt-n1"
              style={{
                fontWeight: 700,
                fontSize: 11,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{title}</span>
            </div>
          </div>
        )}

        <div
          style={{
            height: heightPx,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#666",
          }}
        >
          {emptyText}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-2">
        {showHeader && (
          <div
            className="mt-n1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div
              className="mt-n1"
              style={{
                fontWeight: 700,
                fontSize: 11,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{title}</span>
            </div>
          </div>
        )}

        <div
          className={className}
          style={wrapperStyle}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleTap}
        >
          {gaugeNode}
        </div>
      </Card>

      {enablePopupPreview && open &&
        createPortal(
          <div
            onClick={() => touchDevice && setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: touchDevice ? "rgba(0,0,0,0.45)" : "transparent",
              zIndex: 2147483647,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: touchDevice ? "auto" : "none",
            }}
          >
            <div
              onClick={(e) => touchDevice && e.stopPropagation()}
              style={{
                width: "min(520px, 92vw)",
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: Math.max(heightPx + 40, 250),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {gaugeNode}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

CommonGauge.displayName = "CommonGauge";

export default CommonGauge;
