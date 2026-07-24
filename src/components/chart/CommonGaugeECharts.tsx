import React, {memo, useEffect, useMemo, useRef} from "react";
import {Card} from "react-bootstrap";
import * as echarts from "echarts";

export interface CommonGaugeEChartsProps {
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

const CommonGaugeECharts = memo(({
                                   value = 0,
                                   min = 0,
                                   max = 100,
                                   title = "",
                                   showHeader = false,
                                   heightPx = 210,
                                   emptyText = "No data",
                                   formatValue = (v) => `${Number(v).toFixed(1)}%`,
                                 }: CommonGaugeEChartsProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const hasData = Number.isFinite(Number(value));
  const safeMax = max === min ? min + 1 : max;
  const safeValue = useMemo(
    () => clamp(Number(value || 0), min, safeMax),
    [value, min, safeMax]
  );

  useEffect(() => {
    if (!chartRef.current || !hasData) return;

    const chart = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      animation: false,
      tooltip: {
        show: false,
      },
      series: [
        {
          type: "gauge",
          min,
          max: safeMax,
          startAngle: 200,
          endAngle: -20,
          center: ["50%", "70%"],
          radius: "100%",
          splitNumber: 10,

          axisLine: {
            roundCap: false,
            lineStyle: {
              width: 30,
              color: [
                [0.3, "#EF4444"],
                [0.7, "#D69E2E"],
                [1, "#38A169"],
              ],
            },
          },

          progress: {
            show: false,
          },

          pointer: {
            show: true,
            length: "68%",
            width: 5,
            offsetCenter: [0, "8%"],
            itemStyle: {
              color: "111827",
            },
          },

          anchor: {
            show: true,
            showAbove: true,
            size: 12,
            itemStyle: {
              color: "#fff",
              borderColor: "#9CA3AF",
              borderWidth: 2,
            },
          },

          axisTick: {
            show: true,
            splitNumber: 4,
            distance: -10,
            length: 4,
            lineStyle: {
              color: "auto",
              width: 1,
            },
          },

          splitLine: {
            show: true,
            distance: 0,
            length: 20,
            lineStyle: {
              color: "auto",
              width: 1,
            },
          },

          axisLabel: {
            show: true,
            distance: -35,
            color: "auto",
            fontSize: 10,
            fontWeight: "bold",
            formatter: (v: number) => {
              if (v === 0) return "";
              return String(v);
            },
          },

          title: {
            show: false,
          },

          detail: {
            valueAnimation: false,
            offsetCenter: [0, "26%"],
            fontSize: 24,
            fontWeight: "bold",
            color: "#16304F",
            formatter: (v: number) => formatValue(Number(v)),
          },

          data: [
            {
              value: safeValue,
            },
          ],
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [hasData, safeValue, min, safeMax, formatValue]);

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
    <Card className="mt-n2">
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
        ref={chartRef}
        style={{
          width: "100%",
          height: heightPx,
        }}
      />
    </Card>
  );
});

CommonGaugeECharts.displayName = "CommonGaugeECharts";

export default CommonGaugeECharts;
