import React, {memo, useMemo, useState} from "react";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  ChartData,
  ChartOptions,
  Plugin,
} from "chart.js";
import {Doughnut} from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  title?: string;
  donutTitle?: string;
  centerValue?: number;
  centerLabel?: string;
  segments: DonutSegment[];
  height?: number;
  showLegend?: boolean;
}

const toNum = (value: any) => Number(value) || 0;

const formatNumber = (value?: number | string) => {
  const num = Number(value || 0);
  return num.toLocaleString();
};

const formatPercent = (value?: number) => {
  const num = Number(value || 0);
  return `${num.toFixed(1)}%`;
};

type OutsideLabelItem = {
  index: number;
  label: string;
  value: number;
  percent: number;
  color: string;
  isRight: boolean;
  sx: number;
  sy: number;
  mx: number;
  my: number;
  ex: number;
  ey: number;
};

const CommonDonutSummaryChart = memo(({
                                        title,
                                        donutTitle,
                                        centerValue = 0,
                                        centerLabel = "",
                                        segments,
                                        height = 210,
                                        showLegend = true,
                                      }: Props) => {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  const visibleSegments = useMemo(() => {
    return segments.map((item) => ({
      ...item,
      hidden: hiddenKeys.includes(item.key),
    }));
  }, [segments, hiddenKeys]);

  const chartLabels = useMemo(
    () => visibleSegments.map((item) => item.label),
    [visibleSegments]
  );

  const chartValues = useMemo(
    () => visibleSegments.map((item) => (item.hidden ? 0 : toNum(item.value))),
    [visibleSegments]
  );

  const chartColors = useMemo(
    () => visibleSegments.map((item) => item.color),
    [visibleSegments]
  );

  const chartData = useMemo<ChartData<"doughnut">>(() => {
    return {
      labels: chartLabels,
      datasets: [
        {
          data: chartValues,
          backgroundColor: chartColors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [chartLabels, chartValues, chartColors]);

  const resolvedCenterValue = useMemo(() => {
    const propValue = toNum(centerValue);
    if (propValue > 0) return propValue;
    return chartValues.reduce((sum, v) => sum + toNum(v), 0);
  }, [centerValue, chartValues]);

  const outsideLabelPlugin = useMemo<Plugin<"doughnut">>(() => {
    return {
      id: "outsideLabelPlugin",
      afterDraw(chart) {
        const {ctx, chartArea} = chart;
        const meta = chart.getDatasetMeta(0);

        if (!meta?.data?.length || !chartArea) return;

        const total = chartValues.reduce((sum, v) => sum + toNum(v), 0);
        if (total <= 0) return;

        const items: OutsideLabelItem[] = [];

        meta.data.forEach((arc: any, index: number) => {
          const value = toNum(chartValues[index]);
          if (value <= 0) return;

          const label = String(chartLabels[index] || "");
          const color = String(chartColors[index] || "#666");
          const percent = (value / total) * 100;

          const angle = (arc.startAngle + arc.endAngle) / 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const sx = arc.x + cos * (arc.outerRadius - 2);
          const sy = arc.y + sin * (arc.outerRadius - 2);

          const mx = arc.x + cos * (arc.outerRadius + 12);
          const my = arc.y + sin * (arc.outerRadius + 12);

          const isRight = cos >= 0;
          const ex = mx + (isRight ? 26 : -26);
          const ey = my;

          items.push({
            index,
            label,
            value,
            percent,
            color,
            isRight,
            sx,
            sy,
            mx,
            my,
            ex,
            ey,
          });
        });

        const topLimit = chartArea.top + 10;
        const bottomLimit = chartArea.bottom - 10;
        const gap = 16;

        const leftItems = items.filter((item) => !item.isRight).sort((a, b) => a.ey - b.ey);
        const rightItems = items.filter((item) => item.isRight).sort((a, b) => a.ey - b.ey);

        const adjustVertical = (arr: OutsideLabelItem[]) => {
          if (!arr.length) return;

          arr[0].ey = Math.max(arr[0].ey, topLimit);

          for (let i = 1; i < arr.length; i += 1) {
            if (arr[i].ey - arr[i - 1].ey < gap) {
              arr[i].ey = arr[i - 1].ey + gap;
            }
          }

          if (arr[arr.length - 1].ey > bottomLimit) {
            arr[arr.length - 1].ey = bottomLimit;
            for (let i = arr.length - 2; i >= 0; i -= 1) {
              if (arr[i + 1].ey - arr[i].ey < gap) {
                arr[i].ey = arr[i + 1].ey - gap;
              }
            }
          }
        };

        adjustVertical(leftItems);
        adjustVertical(rightItems);

        ctx.save();
        ctx.font = "700 10px sans-serif";

        [...leftItems, ...rightItems].forEach((item) => {
          const text = `${item.label} ${item.percent.toFixed(1)}%`;
          const measured = ctx.measureText(text);
          const textWidth = measured.width;
          const pointRadius = 2;
          const textGap = 4;

          let lineEndX = item.ex;
          let textX = item.isRight ? lineEndX + textGap : lineEndX - textGap;

          if (item.isRight) {
            const maxRight = chart.width - 6;
            const textRight = textX + textWidth;
            if (textRight > maxRight) {
              const overflow = textRight - maxRight;
              lineEndX -= overflow;
              textX -= overflow;
            }
          } else {
            const minLeft = 6;
            const textLeft = textX - textWidth;
            if (textLeft < minLeft) {
              const overflow = minLeft - textLeft;
              lineEndX += overflow;
              textX += overflow;
            }
          }

          ctx.beginPath();
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          ctx.moveTo(item.sx, item.sy);
          ctx.lineTo(item.mx, item.my);
          ctx.lineTo(lineEndX, item.ey);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = item.color;
          ctx.arc(lineEndX, item.ey, pointRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = item.color;
          ctx.font = "700 10px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = item.isRight ? "left" : "right";
          ctx.fillText(text, textX, item.ey);
        });

        ctx.restore();
      },
    };
  }, [chartValues, chartLabels, chartColors]);

  const centerTextPlugin = useMemo<Plugin<"doughnut">>(() => {
    return {
      id: "centerTextPlugin",
      afterDraw(chart) {
        const meta = chart.getDatasetMeta(0);
        const arc = meta?.data?.[0] as any;
        if (!arc) return;

        const {ctx} = chart;
        const x = arc.x;
        const y = arc.y;

        const labelText = centerLabel || "";
        const valueText = formatNumber(resolvedCenterValue);

        const labelFontSize = labelText.length >= 9 ? 9 : 11;
        const valueFontSize = String(valueText).length >= 7 ? 15 : 18;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let totalHeight = valueFontSize;
        if (labelText) totalHeight += labelFontSize + 4;

        let currentY = y - totalHeight / 2;

        if (labelText) {
          ctx.fillStyle = "#6c757d";
          ctx.font = `700 ${labelFontSize}px sans-serif`;
          ctx.fillText(labelText, x, currentY + labelFontSize / 2);
          currentY += labelFontSize + 4;
        }

        ctx.fillStyle = "#212529";
        ctx.font = `700 ${valueFontSize}px sans-serif`;
        ctx.fillText(valueText, x, currentY + valueFontSize / 2);

        ctx.restore();
      },
    };
  }, [centerLabel, resolvedCenterValue]);

  const chartOptions = useMemo<ChartOptions<"doughnut">>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      cutout: "40%",
      layout: {
        padding: {
          top: 10,
          right: 66,
          bottom: 10,
          left: 66,
        },
      },
      plugins: {
        legend: {
          display: showLegend,
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 9,
            padding: 9,
            color: "#495057",
            font: {
              size: 9,
              weight: "600",
            },
          },
          onClick: (_e, legendItem) => {
            const label = String(legendItem.text || "");
            const target = segments.find((item) => item.label === label);
            if (!target) return;

            setHiddenKeys((prev) =>
              prev.includes(target.key)
                ? prev.filter((v) => v !== target.key)
                : [...prev, target.key]
            );
          },
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const rawValue = Number(context.raw || 0);
              const total = Number(resolvedCenterValue || 0);
              const percent = total > 0 ? (rawValue / total) * 100 : 0;
              return `${context.label}: ${formatNumber(rawValue)} (${formatPercent(percent)})`;
            },
          },
        },
        title: {
          display: false,
        },
      },
    };
  }, [segments, resolvedCenterValue]);

  return (
    <div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#2f3e4d",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {title || ""}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: height,
        }}
      >
        <Doughnut
          key={`${resolvedCenterValue}-${chartValues.join(",")}-${chartLabels.join(",")}`}
          data={chartData}
          options={chartOptions}
          plugins={[outsideLabelPlugin, centerTextPlugin]}
        />
      </div>
    </div>
  );
});

export default CommonDonutSummaryChart;
