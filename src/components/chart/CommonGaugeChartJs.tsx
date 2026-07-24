import React, {memo, useMemo} from "react";
import {Card} from "react-bootstrap";
import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  Plugin,
  Tooltip,
} from "chart.js";
import {Doughnut} from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface CommonGaugeChartJsProps {
  value?: number;
  min?: number;
  max?: number;
  title?: string;
  showHeader?: boolean;
  heightPx?: number;
  emptyText?: string;
  formatValue?: (value: number) => string;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function getGaugeColor(percent: number) {
  if (percent <= 30) return "#EF4444";
  if (percent <= 70) return "#f0ad4e";
  return "#38A169";
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function createGaugeOverlayPlugin(
  safeValue: number,
  min: number,
  max: number,
  formatValue: (value: number) => string
): Plugin<"doughnut"> {
  return {
    id: "gaugeOverlay",
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;

      const firstArc: any = meta.data[0];
      const lastArc: any = meta.data[meta.data.length - 1];
      const ctx = chart.ctx;

      const centerX = firstArc.x;
      const centerY = firstArc.y;
      const outerRadius = firstArc.outerRadius;
      const innerRadius = firstArc.innerRadius;

      const startAngle = firstArc.startAngle;
      const endAngle = lastArc.endAngle;

      const safeMax = max === min ? min + 1 : max;
      const ratio = clamp((safeValue - min) / (safeMax - min), 0, 1);

      /**
       * 양 끝 라벨이 잘리지 않도록
       * 실제 배치 각도는 arc보다 조금 안쪽만 사용
       */
      const edgeInsetRad = degToRad(10);
      const usableStartAngle = startAngle + edgeInsetRad;
      const usableEndAngle = endAngle - edgeInsetRad;

      const needleAngle =
        usableStartAngle + (usableEndAngle - usableStartAngle) * ratio;

      // 0부터 100까지 다 보여주고 싶으면 이렇게
      const majorTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const minorTicks = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];

      /**
       * height가 작아져도 덜 깨지게
       * 전체 요소를 outerRadius 기준으로 비례 계산
       */
      const majorTickOuter = outerRadius - outerRadius * 0.10;
      const majorTickInner = outerRadius - outerRadius * 0.24;

      const minorTickOuter = outerRadius - outerRadius * 0.11;
      const minorTickInner = outerRadius - outerRadius * 0.18;

      const labelRadius = innerRadius - outerRadius * 0.10;

      const majorFontSize = Math.max(8, Math.min(11, outerRadius * 0.14));
      const centerFontSize = Math.max(18, Math.min(28, outerRadius * 0.36));

      const needleLength = outerRadius * 0.76;
      const needleWidth = Math.max(3, outerRadius * 0.055);

      const capOuterRadius = Math.max(8, outerRadius * 0.11);
      const capInnerRadius = Math.max(3, outerRadius * 0.04);

      const drawTick = (tickValue: number, isMajor: boolean) => {
        const tickRatio = tickValue / 100;
        const angle =
          usableStartAngle + (usableEndAngle - usableStartAngle) * tickRatio;

        const tickInner = isMajor ? majorTickInner : minorTickInner;
        const tickOuter = isMajor ? majorTickOuter : minorTickOuter;

        const x1 = centerX + Math.cos(angle) * tickInner;
        const y1 = centerY + Math.sin(angle) * tickInner;

        const x2 = centerX + Math.cos(angle) * tickOuter;
        const y2 = centerY + Math.sin(angle) * tickOuter;

        const lx = centerX + Math.cos(angle) * labelRadius;
        const ly = centerY + Math.sin(angle) * labelRadius;

        const color = getGaugeColor(tickValue);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = isMajor ? 1.8 : 1;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();

        if (isMajor) {
          ctx.save();
          ctx.font = `700 ${majorFontSize}px sans-serif`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(tickValue), lx, ly);
          ctx.restore();
        }
      };

      minorTicks.forEach((tick) => drawTick(tick, false));
      majorTicks.forEach((tick) => drawTick(tick, true));

      // needle
      const needleX = centerX + Math.cos(needleAngle) * needleLength;
      const needleY = centerY + Math.sin(needleAngle) * needleLength;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(needleX, needleY);
      ctx.lineWidth = needleWidth;
      ctx.strokeStyle = "#1F2937";
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // center cap outer
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, capOuterRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#111827";
      ctx.fill();
      ctx.restore();

      // center cap inner
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, capInnerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#E5E7EB";
      ctx.fill();
      ctx.restore();

      // center text
      ctx.save();
      ctx.font = `700 ${centerFontSize}px sans-serif`;
      ctx.fillStyle = "#16304F";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        formatValue(safeValue),
        centerX,
        centerY - innerRadius * 0.30
      );
      ctx.restore();
    },
  };
}

const CommonGaugeChartJs = memo(({
                                   value = 0,
                                   min = 0,
                                   max = 100,
                                   title = "",
                                   showHeader = false,
                                   heightPx = 170,
                                   emptyText = "No data",
                                   formatValue = (v) => `${Number(v).toFixed(1)}%`,
                                 }: CommonGaugeChartJsProps) => {
  const hasData = Number.isFinite(Number(value));
  const safeMax = max === min ? min + 1 : max;
  const safeValue = clamp(Number(value || 0), min, safeMax);

  const compact = heightPx <= 170;

  const data: ChartData<"doughnut"> = useMemo(
    () => ({
      labels: ["RED", "ORANGE", "GREEN"],
      datasets: [
        {
          data: [30, 40, 30],
          backgroundColor: ["#EF4444", "#f0ad4e", "#38A169"],
          borderWidth: 0,
          hoverOffset: 0,
          radius: compact ? "86%" : "92%",
        } as any,
      ],
    }),
    [compact]
  );

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      rotation: -90,
      circumference: 180,
      cutout: compact ? "70%" : "72%",
      layout: {
        padding: {
          top: compact ? 8 : 10,
          bottom: compact ? 2 : 0,
          left: compact ? 16 : 10,
          right: compact ? 16 : 10,
        },
      },
      events: [],
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    }),
    [compact]
  );

  const plugins = useMemo(
    () => [createGaugeOverlayPlugin(safeValue, min, safeMax, formatValue)],
    [safeValue, min, safeMax, formatValue]
  );

  if (!hasData) {
    return (
      <Card className="p-2">
        {showHeader && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            {title}
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
    <Card className="p-2">
      {showHeader && (
        <div
          style={{
            fontWeight: 700,
            fontSize: 11,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
      )}

      <div style={{height: heightPx}}>
        <Doughnut data={data} options={options} plugins={plugins} />
      </div>
    </Card>
  );
});

CommonGaugeChartJs.displayName = "CommonGaugeChartJs";

export default CommonGaugeChartJs;
