import React, {memo, useMemo} from "react";
import {Card} from "react-bootstrap";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {Bar} from "react-chartjs-2";
import {BIZAREA_CODE, FACTORY_CODE} from "@utils/factoryUtils";
import {
  buildDateWindow,
  dateToYYYYMMDD,
  formatNumberWithComma,
  normalizeDate,
  normalizeText,
  toNum,
  yyyymmddToDate,
} from "@utils/numberUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export type ChartBaseRow = {
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  dtsWork?: string;
  [key: string]: any;
};

export type ComboSeriesDef = {
  key: string;
  label: string;
  type: "bar" | "line";
  color: string;
  yAxisID?: "y" | "y1";
  percent?: boolean;
  stack?: string;
  order?: number;
  borderWidth?: number;
  pointRadius?: number;
  hidden?: boolean;
  tooltipKey?: string;
};

export type DateLabelMode = "MM.DD" | "YY.MM" | "MONTHLY_WITH_TODAY_FULL";

interface Props<T extends ChartBaseRow = ChartBaseRow> {
  rows: T[];
  series: ComboSeriesDef[];
  days?: number;
  targetBizarea?: string;
  title?: string;
  chartHeight?: number;
  minChartWidth?: number;
  endDate?: string;
  customDates?: string[];
  yLeftUnit?: string;
  yRightUnit?: string;
  emptyText?: string;
  showHeader?: boolean;
  columns?: number;
  yRightMin?: number;
  yRightMax?: number;
  yRightStepSize?: number;
  showLegend?: boolean;
  showLegendOnlyFirstCard?: boolean;
  tooltipLineOnly?: boolean;
  hideWeekday?: boolean;
  showWeekday?: boolean;
  dateLabelMode?: DateLabelMode;
  reverseDates?: boolean;
  minRotation?: number;

  /** 카드별로 일요일 + 전 series 0인 날짜는 x축에서 제거 */
  hideSundayZeroDates?: boolean;
  highlightSundayLabel?: boolean;
}

type ChartModel = {
  keys: string[];
  bizModels: Array<{
    cdBizarea: string;
    ftyModels: Array<{
      cdFty: string;
      labels: string[];
      series: Record<string, number[]>;
      rowsByDate: Record<string, ChartBaseRow>;
    }>;
  }>;
};

function safeLabel(label?: string) {
  const s = String(label ?? "").trim();
  return s ? s : "?";
}

function isSundayDateKey(yyyymmdd?: string) {
  const v = normalizeDate(yyyymmdd);
  if (v.length !== 8) return false;

  const dt = yyyymmddToDate(v);
  return dt.getDay() === 0;
}

function formatDateLabel(
  yyyymmdd: string,
  mode: DateLabelMode = "MM.DD",
  showWeekday = false,
  focusDate?: string
) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;

  const dt = yyyymmddToDate(yyyymmdd);
  const yyyy = String(dt.getFullYear());
  const yy = yyyy.slice(2);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  const targetDate = normalizeDate(focusDate || dateToYYYYMMDD(new Date()));

  if (mode === "YY.MM") {
    return `${yy}.${mm}`;
  }

  if (mode === "MONTHLY_WITH_TODAY_FULL") {
    if (yyyymmdd === targetDate) {
      return `${yy}.${mm}.${dd}`;
    }
    return `${yy}.${mm}`;
  }

  if (!showWeekday) {
    return `${mm}.${dd}`;
  }

  const wk = new Intl.DateTimeFormat("en-US", {weekday: "short"})
    .format(dt)
    .toUpperCase();

  return [`${mm}.${dd}`, wk];
}

const CommonMultiComboChart = memo(function CommonMultiComboChart<
  T extends ChartBaseRow = ChartBaseRow
>({
    rows,
    series,
    days = 30,
    targetBizarea,
    title = "",
    chartHeight = 200,
    minChartWidth = 1200,
    endDate,
    customDates,
    yLeftUnit = "",
    yRightUnit = "",
    emptyText = "No data",
    showHeader = true,
    columns = 1,
    yRightMin = 0,
    yRightMax = 100,
    yRightStepSize = 20,
    showLegend = false,
    showLegendOnlyFirstCard = false,
    tooltipLineOnly = false,
    hideWeekday = false,
    showWeekday,
    dateLabelMode = "MM.DD",
    reverseDates = false,
    hideSundayZeroDates = false,
    highlightSundayLabel = false,
    minRotation = 0,

  }: Props<T>) {
  const resolvedShowWeekday =
    typeof showWeekday === "boolean" ? showWeekday : !hideWeekday;

  const model = useMemo<ChartModel>(() => {
    if (!rows?.length || !series?.length) {
      return {keys: [], bizModels: []};
    }

    const keys = series.map((s) => String(s?.key || "").trim()).filter(Boolean);

    const hasFilter = !!normalizeText(targetBizarea);

    const bizSet = new Set<string>();
    const bizList: string[] = [];

    rows.forEach((row) => {
      const bizarea = normalizeText(row?.cdBizarea);
      if (!bizarea) return;

      if (hasFilter) {
        if (bizarea === normalizeText(targetBizarea) && !bizSet.has(bizarea)) {
          bizSet.add(bizarea);
          bizList.push(bizarea);
        }
      } else {
        if (!bizSet.has(bizarea)) {
          bizSet.add(bizarea);
          bizList.push(bizarea);
        }
      }
    });

    bizList.sort((a, b) => {
      if (a === "TOTAL") return -1;
      if (b === "TOTAL") return 1;
      return a.localeCompare(b);
    });

    const bizModels: ChartModel["bizModels"] = [];

    for (let bi = 0; bi < bizList.length; bi++) {
      const cdBizarea = bizList[bi];

      const bizRows = rows.filter(
        (row) => normalizeText(row?.cdBizarea) === cdBizarea
      );

      const group = new Map<string, T[]>();

      bizRows.forEach((row) => {
        const fty = normalizeText(row?.cdFty);
        if (!fty) return;

        const prev = group.get(fty) ?? [];
        prev.push(row);
        group.set(fty, prev);
      });

      const ftyModels: ChartModel["bizModels"][number]["ftyModels"] = [];

      group.forEach((ftyRows, cdFty) => {
        const bucket = new Map<string, Record<string, number>>();
        const rowsByDate: Record<string, ChartBaseRow> = {};

        for (let i = 0; i < ftyRows.length; i++) {
          const row = ftyRows[i];
          const rawDate = normalizeDate(row?.dtsWk ?? row?.dtsWork);
          if (rawDate.length !== 8) continue;

          const cur = bucket.get(rawDate) ?? {};

          for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            cur[key] = (cur[key] ?? 0) + toNum(row?.[key]);
          }

          bucket.set(rawDate, cur);

          if (!rowsByDate[rawDate]) {
            rowsByDate[rawDate] = row;
          }
        }

        const normalizedCustomDates =
          customDates && customDates.length > 0
            ? customDates
              .map((d) => normalizeDate(d))
              .filter((d) => d.length === 8)
            : [];

        const normalizedEndDate = normalizeDate(endDate);

        const baseDate =
          normalizedEndDate.length === 8
            ? normalizedEndDate
            : dateToYYYYMMDD(new Date());

        let windowDates =
          normalizedCustomDates.length > 0
            ? [...normalizedCustomDates]
            : buildDateWindow(baseDate, days);

        /**
         * 핵심:
         * 카드별로 일요일 + 현재 카드의 모든 series 값이 0이면
         * 그 날짜 라벨 자체를 제거
         */
        if (hideSundayZeroDates) {
          windowDates = windowDates.filter((dateKey) => {
            if (!isSundayDateKey(dateKey)) return true;

            const hasAnyValue = keys.some((key) => {
              return toNum(bucket.get(dateKey)?.[key]) !== 0;
            });

            return hasAnyValue;
          });
        }

        if (reverseDates) {
          windowDates = [...windowDates].reverse();
        }

        const seriesMap: Record<string, number[]> = {};

        for (let k = 0; k < keys.length; k++) {
          const key = keys[k];
          seriesMap[key] = windowDates.map(
            (dateKey) => bucket.get(dateKey)?.[key] ?? 0
          );
        }

        ftyModels.push({
          cdFty,
          labels: windowDates,
          series: seriesMap,
          rowsByDate,
        });
      });

      ftyModels.sort((a, b) => a.cdFty.localeCompare(b.cdFty));

      if (ftyModels.length > 0) {
        bizModels.push({
          cdBizarea,
          ftyModels,
        });
      }
    }

    return {keys, bizModels};
  }, [
    rows,
    series,
    days,
    targetBizarea,
    endDate,
    customDates,
    reverseDates,
    hideSundayZeroDates,
  ]);

  if (!model.bizModels.length) {
    return (
      <div style={{height: 360, display: "flex", alignItems: "center"}}>
        {emptyText}
      </div>
    );
  }

  const bizareaLabelMap = new Map(
    (BIZAREA_CODE || []).map((v: any) => [v.code, v.label])
  );
  const factoryLabelMap = new Map(
    (FACTORY_CODE || []).map((v: any) => [v.code, v.label])
  );

  const getBizareaLabel = (code?: string) =>
    (code && bizareaLabelMap.get(code)) || code || "";

  const getFactoryLabel = (code?: string) =>
    (code && factoryLabelMap.get(code)) || code || "";

  const cards = model.bizModels.flatMap((biz) =>
    biz.ftyModels.map((m) => ({
      bizCd: biz.cdBizarea,
      chart: m,
    }))
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        alignItems: "start",
        gap: 8,
      }}
    >
      {cards.map(({bizCd, chart: m}, cardIndex) => {
        const cardKey = `${bizCd}_${m.cdFty}`;

        const datasets = series.map((s) => {
          const axisId = s.yAxisID ?? (s.percent ? "y1" : "y");

          if (s.type === "bar") {
            return {
              type: "bar" as const,
              label: safeLabel(s.label),
              data: m.series[s.key] ?? [],
              backgroundColor: s.color,
              borderColor: s.color,
              borderWidth: s.borderWidth ?? 1,
              barPercentage: 0.75,
              categoryPercentage: 0.8,
              maxBarThickness: 18,
              stack: s.stack ?? "bar",
              yAxisID: axisId,
              order: s.order ?? 2,
              hidden: !!s.hidden,
            };
          }

          return {
            type: "line" as const,
            label: safeLabel(s.label),
            data: m.series[s.key] ?? [],
            borderColor: s.color,
            backgroundColor: s.color,
            pointBackgroundColor: s.color,
            pointBorderColor: s.color,
            borderWidth: s.borderWidth ?? 2,
            pointRadius: s.pointRadius ?? 2,
            pointHoverRadius: 4,
            tension: 0.25,
            fill: false,
            yAxisID: axisId,
            order: s.order ?? 1,
            hidden: !!s.hidden,
          };
        });

        const data: ChartData<"bar", number[], string> = {
          labels: m.labels,
          datasets: datasets as any,
        };

        const hasRightAxis = series.some((s) => {
          const axisId = s.yAxisID ?? (s.percent ? "y1" : "y");
          return axisId === "y1";
        });

        const legendDisplay =
          showLegend && (!showLegendOnlyFirstCard || cardIndex === 0);

        const options: ChartOptions<"bar"> = {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {left: 6, right: 6, top: 6, bottom: 14},
          },
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              display: legendDisplay,
              align: "end",
              labels: {
                font: {size: 10},
                boxWidth: 10,
                boxHeight: 10,
                padding: 8,
              },
            },
            title: {
              display: false,
              text: title,
            },
            tooltip: {
              filter: (tooltipItem: any) => {
                if (!tooltipLineOnly) return true;
                return tooltipItem?.dataset?.type === "bar";
              },
              callbacks: {
                label: (context: any) => {
                  const datasetLabel = context.dataset.label || "";
                  const value = Number(context.parsed?.y ?? 0);
                  return `${datasetLabel}: ${formatNumberWithComma(value)}`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: minRotation ? minRotation : 0,
                padding: 0,
                font: {size: 10},
                color: (context: any) => {
                  if (!highlightSundayLabel) return "#666";

                  const idx = Number(context?.index);
                  const raw =
                    Number.isFinite(idx) && m.labels[idx]
                      ? String(m.labels[idx])
                      : "";

                  return isSundayDateKey(raw) ? "#ff0000" : "#666";
                },
                callback: function (value: any) {
                  const idx = Number(value);
                  const raw =
                    Number.isFinite(idx) && m.labels[idx]
                      ? String(m.labels[idx])
                      : String(value);

                  if (raw.length === 8) {
                    return formatDateLabel(
                      raw,
                      dateLabelMode,
                      resolvedShowWeekday,
                      endDate
                    ) as any;
                  }

                  return raw as any;
                },
              },
              grid: {
                display: true,
                color: "rgba(0,0,0,0.08)",
              },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                font: {size: 11},
              },
              grid: {
                color: "rgba(0,0,0,0.08)",
              },
              title: {
                display: !!yLeftUnit,
                text: yLeftUnit,
                align: "end",
                padding: {top: 0, bottom: 0},
                font: {size: 11 as any},
              },
            },
            y1: hasRightAxis
              ? {
                beginAtZero: false,
                min: yRightMin,
                max: yRightMax,
                position: "right" as const,
                ticks: {
                  font: {size: 11},
                  stepSize: yRightStepSize ?? 20,
                  callback: function (value: any) {
                    return `${value}`;
                  },
                },
                grid: {
                  drawOnChartArea: false,
                },
                title: {
                  display: !!yRightUnit,
                  text: yRightUnit,
                  align: "end",
                  padding: {top: 0, bottom: 0},
                  font: {size: 11 as any},
                },
              }
              : undefined,
          },
        };

        const innerStyle =
          minChartWidth > 0
            ? {minWidth: minChartWidth, height: chartHeight}
            : {height: chartHeight};

        return (
          <Card key={cardKey} className="p-2">
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
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 60,
                      opacity: 0.75,
                      color: "blue",
                      pointerEvents: "none",
                      textAlign: "right",
                    }}
                  >
                    {getBizareaLabel(bizCd)}
                  </span>

                  {m.cdFty !== "TOTAL" && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getFactoryLabel(m.cdFty)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                overflowX: minChartWidth > 0 ? "auto" : "visible",
              }}
            >
              <div style={innerStyle}>
                <Bar data={data} options={options} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
});

export default CommonMultiComboChart;
