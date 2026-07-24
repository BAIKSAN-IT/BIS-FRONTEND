import React, {memo, useMemo} from "react";
import {Card} from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import {ApexOptions} from "apexcharts";

export interface CommonGaugeApexProps {
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
  if (percent <= 70) return "#D69E2E";
  return "#38A169";
}

const CommonGaugeApex = memo(({
                                value = 0,
                                min = 0,
                                max = 100,
                                title = "",
                                showHeader = false,
                                heightPx = 210,
                                emptyText = "No data",
                                formatValue = (v) => `${Number(v).toFixed(1)}%`,
                              }: CommonGaugeApexProps) => {
  const hasData = Number.isFinite(Number(value));
  const safeMax = max === min ? min + 1 : max;
  const safeValue = clamp(Number(value || 0), min, safeMax);
  const percent = ((safeValue - min) / (safeMax - min)) * 100;
  const gaugeColor = getGaugeColor(percent);

  const series = useMemo(() => [Number(percent.toFixed(2))], [percent]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        animations: {
          enabled: false,
        },
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      colors: [gaugeColor],
      stroke: {
        lineCap: "round",
      },
      plotOptions: {
        radialBar: {
          startAngle: -100,
          endAngle: 100,
          hollow: {
            size: "62%",
            margin: 0,
            background: "transparent",
          },
          track: {
            startAngle: -100,
            endAngle: 100,
            background: "#E5E7EB",
            strokeWidth: "100%",
            margin: 0,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              offsetY: 10,
              fontSize: "28px",
              fontWeight: "700",
              color: "#16304F",
              formatter: () => formatValue(safeValue),
            },
          },
        },
      },
      fill: {
        type: "solid",
      },
      labels: [title],
    }),
    [gaugeColor, safeValue, title, formatValue]
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
        <ReactApexChart
          type="radialBar"
          series={series}
          options={options}
          height={heightPx}
        />
      </div>
    </Card>
  );
});

CommonGaugeApex.displayName = "CommonGaugeApex";

export default CommonGaugeApex;
