import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {Card} from "react-bootstrap";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
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
  formatLabelTwoLinesEN,
  formatNumberWithComma,
  formatNumberWithCommaFixed,
  toNum,
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

type Row = Record<string, any>;

type SeriesDef = {
  key: string;
  label?: string;
};

type LegendItem = {
  key: string;
  label: string;
  color: string;
  type: "bar" | "line";
};

interface Props {
  rows: Row[];
  days?: number;
  barSeries: SeriesDef[];
  lineSeries?: SeriesDef;
  line2Series?: SeriesDef;
  line3Series?: SeriesDef;
  line4Series?: SeriesDef;
  line5Series?: SeriesDef;
  line6Series?: SeriesDef;
  targetBizarea?: string;
  title?: string;
  chartHeight?: number;
  minChartWidth?: number;
  endDate?: string;
  customDates?: string[];
  yLeftUnit?: string;
  yRightUnit?: string;
  reverseDates?: boolean;
}

/** 라벨이 없으면 ? */
function safeLabel(label?: string) {
  const s = String(label ?? "").trim();
  return s ? s : "?";
}

/** 퍼센트 계열 라인 판별 */
function isPercentLineKey(lineKey?: string) {
  const k = String(lineKey ?? "").trim().toLowerCase();
  if (!k) return false;

  return (
    k.includes("rate") ||
    k.includes("eff") ||
    k.includes("percent") ||
    k.startsWith("rt") ||
    k === "utileff" ||
    k === "utilrate" ||
    k === "rteff"
  );
}

/** series key 유니크 추출 */
function uniqueKeysFromSeries(
  barSeries: SeriesDef[],
  lineSeries?: SeriesDef,
  lineSeries2?: SeriesDef,
  lineSeries3?: SeriesDef,
  lineSeries4?: SeriesDef,
  lineSeries5?: SeriesDef,
  lineSeries6?: SeriesDef
) {
  const seen: Record<string, boolean> = {};
  const out: string[] = [];

  const pushKey = (key?: string) => {
    const k = String(key ?? "").trim();
    if (!k) return;
    if (!seen[k]) {
      seen[k] = true;
      out.push(k);
    }
  };

  for (let i = 0; i < barSeries.length; i++) {
    pushKey(barSeries[i]?.key);
  }

  pushKey(lineSeries?.key);
  pushKey(lineSeries2?.key);
  pushKey(lineSeries3?.key);
  pushKey(lineSeries4?.key);
  pushKey(lineSeries5?.key);
  pushKey(lineSeries6?.key);

  return out;
}

/** YYYYMMDD -> Date */
function parseYYYYMMDD(value: string) {
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(4, 6)) - 1;
  const d = Number(value.slice(6, 8));
  return new Date(y, m, d);
}

/** Date -> YYYYMMDD */
function formatYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** YYYYMMDD에 일수 더하기 */
function addDaysToYYYYMMDD(value: string, diff: number) {
  const dt = parseYYYYMMDD(value);
  dt.setDate(dt.getDate() + diff);
  return formatYYYYMMDD(dt);
}

/** 일요일 여부 */
function isSundayYYYYMMDD(value: string) {
  return parseYYYYMMDD(value).getDay() === 0;
}

/** 해당 날짜의 모든 series가 0인지 */
function hasAnyNonZeroValue(
  values: Record<string, number> | undefined,
  keys: string[]
) {
  if (!values) return false;

  for (let i = 0; i < keys.length; i++) {
    const n = Number(values[keys[i]] ?? 0);
    if (n !== 0) return true;
  }

  return false;
}

/**
 * 최근 날짜부터 거꾸로 보면서
 * "일요일 && 모든 series 값 0" 인 날은 제외하고
 * 부족하면 과거 날짜를 더 채워서 총 size개 반환
 *
 * 반환은 기본적으로 오래된 날짜 -> 최신 날짜 순
 */
function buildFilteredDateWindow(
  baseDate: string,
  size: number,
  bucket: Map<string, Record<string, number>>,
  keys: string[]
) {
  const descDates: string[] = [];
  let cursor = baseDate;
  let guard = 0;

  while (descDates.length < size && guard < 1000) {
    const values = bucket.get(cursor);
    const shouldSkipSundayZero =
      isSundayYYYYMMDD(cursor) && !hasAnyNonZeroValue(values, keys);

    if (!shouldSkipSundayZero) {
      descDates.push(cursor);
    }

    cursor = addDaysToYYYYMMDD(cursor, -1);
    guard += 1;
  }

  return descDates.reverse();
}

/** 색상 */
const BAR_PALETTE = ["#1f77b4", "#ff7f0e"];
const LINE_COLOR = "#FFA500";
const LINE2_COLOR = "#d9534f";
const LINE3_COLOR = "#5bc0de";
const LINE4_COLOR = "#5cb85c";
const LINE5_COLOR = "#9370DB";
const LINE6_COLOR = "#8c564b";

const LineComboChart = memo(function LineComboChart({
                                                      rows,
                                                      days = 30,
                                                      barSeries,
                                                      lineSeries,
                                                      line2Series,
                                                      line3Series,
                                                      line4Series,
                                                      line5Series,
                                                      line6Series,
                                                      targetBizarea,
                                                      title = "?",
                                                      chartHeight = 200,
                                                      minChartWidth = 1200,
                                                      endDate,
                                                      customDates,
                                                      yLeftUnit = "",
                                                      yRightUnit = "",
                                                      reverseDates = false,
                                                    }: Props) {
  /** 커스텀 공통 범례 */
  const legendItems = useMemo<LegendItem[]>(() => {
    const items: LegendItem[] = [];
    const seen: Record<string, boolean> = {};

    const pushItem = (
      key: string | undefined,
      label: string | undefined,
      color: string,
      type: "bar" | "line"
    ) => {
      const k = String(key ?? "").trim();
      if (!k || seen[k]) return;
      seen[k] = true;
      items.push({
        key: k,
        label: safeLabel(label),
        color,
        type,
      });
    };

    for (let i = 0; i < barSeries.length; i++) {
      pushItem(
        barSeries[i]?.key,
        barSeries[i]?.label,
        BAR_PALETTE[i % BAR_PALETTE.length],
        "bar"
      );
    }

    pushItem(lineSeries?.key, lineSeries?.label, LINE_COLOR, "line");
    pushItem(line2Series?.key, line2Series?.label, LINE2_COLOR, "line");
    pushItem(line3Series?.key, line3Series?.label, LINE3_COLOR, "line");
    pushItem(line4Series?.key, line4Series?.label, LINE4_COLOR, "line");
    pushItem(line5Series?.key, line5Series?.label, LINE5_COLOR, "line");
    pushItem(line6Series?.key, line6Series?.label, LINE6_COLOR, "line");

    return items;
  }, [
    barSeries,
    lineSeries,
    line2Series,
    line3Series,
    line4Series,
    line5Series,
    line6Series,
  ]);

  /** key 기준으로 전체 차트 공통 on/off */
  const [hiddenSeriesMap, setHiddenSeriesMap] = useState<Record<string, boolean>>({});

  const toggleSeries = useCallback((seriesKey: string) => {
    setHiddenSeriesMap((prev) => ({
      ...prev,
      [seriesKey]: !prev[seriesKey],
    }));
  }, []);

  /** 모드가 바뀌어 series 구성이 달라지면 숨김 상태 초기화 */
  useEffect(() => {
    setHiddenSeriesMap({});
  }, [legendItems]);

  const model = useMemo(() => {
    if (!rows || rows.length === 0) {
      return {keys: [] as string[], bizModels: [] as any[]};
    }

    const keys = uniqueKeysFromSeries(
      barSeries,
      lineSeries,
      line2Series,
      line3Series,
      line4Series,
      line5Series,
      line6Series
    );

    const hasFilter = !!(targetBizarea && String(targetBizarea).trim().length > 0);

    const bizSet: Record<string, boolean> = {};
    const bizList: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const b = String(rows[i]?.cdBizarea ?? "").trim();
      if (!b) continue;

      if (hasFilter) {
        if (b === String(targetBizarea).trim() && !bizSet[b]) {
          bizSet[b] = true;
          bizList.push(b);
        }
      } else {
        if (!bizSet[b]) {
          bizSet[b] = true;
          bizList.push(b);
        }
      }
    }

    bizList.sort((a, b) => a.localeCompare(b));

    const bizModels: Array<{
      cdBizarea: string;
      ftyModels: Array<{
        cdFty: string;
        labels: string[];
        series: Record<string, number[]>;
      }>;
    }> = [];

    for (let bi = 0; bi < bizList.length; bi++) {
      const cdBizarea = bizList[bi];

      const bizRows: Row[] = [];
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i]?.cdBizarea ?? "").trim() === cdBizarea) {
          bizRows.push(rows[i]);
        }
      }

      const group = new Map<string, Row[]>();
      for (let i = 0; i < bizRows.length; i++) {
        const r = bizRows[i];
        const fty = String(r?.cdFty ?? "").trim();
        if (!fty) continue;

        const arr = group.get(fty);
        if (arr) arr.push(r);
        else group.set(fty, [r]);
      }

      const ftyModels: Array<{
        cdFty: string;
        labels: string[];
        series: Record<string, number[]>;
      }> = [];

      group.forEach((ftyRows, cdFty) => {
        const bucket = new Map<string, Record<string, number>>();

        for (let i = 0; i < ftyRows.length; i++) {
          const r = ftyRows[i];
          const raw = String(r?.dtsWk ?? "").replaceAll("-", "").slice(0, 8);
          if (!raw || raw.length !== 8) continue;

          const cur = bucket.get(raw) ?? {};

          for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            cur[key] = (cur[key] ?? 0) + toNum(r?.[key]);
          }

          bucket.set(raw, cur);
        }

        const normalizedCustomDates =
          customDates && customDates.length > 0
            ? customDates
              .map((d) => String(d ?? "").replaceAll("-", "").slice(0, 8))
              .filter((d) => d.length === 8)
            : [];

        const baseDate =
          endDate && String(endDate).trim().length === 8
            ? String(endDate).trim()
            : formatYYYYMMDD(new Date());

        let windowDates: string[] = [];

        /**
         * customDates가 있으면 기존처럼 customDates 우선 사용
         * 다만 일요일 0건은 제외
         */
        if (normalizedCustomDates.length > 0) {
          windowDates = normalizedCustomDates.filter((d) => {
            const values = bucket.get(d);
            const shouldSkipSundayZero =
              isSundayYYYYMMDD(d) && !hasAnyNonZeroValue(values, keys);
            return !shouldSkipSundayZero;
          });

          /**
           * customDates 사용 시 개수가 모자라도
           * 여기서는 customDates를 우선 존중
           */
        } else {
          windowDates = buildFilteredDateWindow(baseDate, days, bucket, keys);
        }

        if (reverseDates) {
          windowDates = [...windowDates].reverse();
        }

        const labels: string[] = [...windowDates];

        const series: Record<string, number[]> = {};
        for (let k = 0; k < keys.length; k++) {
          const key = keys[k];
          const arr: number[] = [];

          for (let i = 0; i < windowDates.length; i++) {
            const d = windowDates[i];
            arr.push(bucket.get(d)?.[key] ?? 0);
          }

          series[key] = arr;
        }

        ftyModels.push({cdFty, labels, series});
      });

      ftyModels.sort((a, b) => a.cdFty.localeCompare(b.cdFty));
      if (ftyModels.length > 0) {
        bizModels.push({cdBizarea, ftyModels});
      }
    }

    return {keys, bizModels};
  }, [
    rows,
    days,
    barSeries,
    lineSeries,
    line2Series,
    line3Series,
    line4Series,
    line5Series,
    line6Series,
    targetBizarea,
    endDate,
    customDates,
    reverseDates,
  ]);

  if (!model.bizModels || model.bizModels.length === 0) {
    return (
      <div style={{height: 360, display: "flex", alignItems: "center"}}>
        No data
      </div>
    );
  }

  const bizareaLabelMap = new Map(BIZAREA_CODE.map((v) => [v.code, v.label]));
  const factoryLabelMap = new Map(FACTORY_CODE.map((v) => [v.code, v.label]));

  const getBizareaLabel = (code?: string) =>
    (code && bizareaLabelMap.get(code)) || code || "";

  const getFactoryLabel = (code?: string) =>
    (code && factoryLabelMap.get(code)) || code || "";

  let globalIdx = 0;

  return (
    <div style={{display: "grid"}}>
      {/* 공통 범례 1번만 */}
      {legendItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "end",
            gap: 12,
            marginBottom: 6,
            padding: "2px 8px 6px 8px",
          }}
        >
          {legendItems.map((item) => {
            const isHidden = !!hiddenSeriesMap[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleSeries(item.key)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  opacity: isHidden ? 0.35 : 1,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: item.type === "line" ? 14 : 10,
                    height: item.type === "line" ? 2 : 10,
                    borderRadius: item.type === "line" ? 999 : 2,
                    backgroundColor: item.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {model.bizModels.map((biz) => (
        <div key={biz.cdBizarea} style={{display: "grid"}}>
          {biz.ftyModels.map((m: any, idx: any) => {
            const cardClassName = globalIdx === 0 ? "mt-n1 p-2" : "mt-n4 p-2";
            globalIdx += 1;

            const datasets: any[] = [];

            /** 막대 */
            for (let i = 0; i < barSeries.length; i++) {
              const s = barSeries[i];
              const key = String(s?.key ?? "").trim();
              if (!key) continue;

              const color = BAR_PALETTE[i % BAR_PALETTE.length];

              datasets.push({
                type: "bar" as const,
                label: safeLabel(s.label),
                data: m.series[key] ?? [],
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                maxBarThickness: 18,
                yAxisID: "y",
                hidden: !!hiddenSeriesMap[key],
              });
            }

            /** line 1 */
            const lineKey = String(lineSeries?.key ?? "").trim();
            const hasLine = !!lineKey;
            const lineIsPercent = isPercentLineKey(lineKey);
            const lineAxisId = lineIsPercent ? "y1" : "y";

            if (hasLine) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(lineSeries?.label),
                data: m.series[lineKey] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE_COLOR,
                pointBackgroundColor: LINE_COLOR,
                pointBorderColor: LINE_COLOR,
                yAxisID: lineAxisId,
                hidden: !!hiddenSeriesMap[lineKey],
              });
            }

            /** line 2 */
            const line2Key = String(line2Series?.key ?? "").trim();
            const hasLine2 = !!line2Key;
            const lineIsPercent2 = isPercentLineKey(line2Key);
            const lineAxisId2 = lineIsPercent2 ? "y2" : "y";

            if (hasLine2) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(line2Series?.label),
                data: m.series[line2Key] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE2_COLOR,
                pointBackgroundColor: LINE2_COLOR,
                pointBorderColor: LINE2_COLOR,
                yAxisID: lineAxisId2,
                hidden: !!hiddenSeriesMap[line2Key],
              });
            }

            /** line 3 */
            const line3Key = String(line3Series?.key ?? "").trim();
            const hasLine3 = !!line3Key;
            const lineIsPercent3 = isPercentLineKey(line3Key);
            const lineAxisId3 = lineIsPercent3 ? "y3" : "y";

            if (hasLine3) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(line3Series?.label),
                data: m.series[line3Key] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE3_COLOR,
                pointBackgroundColor: LINE3_COLOR,
                pointBorderColor: LINE3_COLOR,
                yAxisID: lineAxisId3,
                hidden: !!hiddenSeriesMap[line3Key],
              });
            }

            /** line 4 */
            const line4Key = String(line4Series?.key ?? "").trim();
            const hasLine4 = !!line4Key;
            const lineIsPercent4 = isPercentLineKey(line4Key);
            const lineAxisId4 = lineIsPercent4 ? "y4" : "y";

            if (hasLine4) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(line4Series?.label),
                data: m.series[line4Key] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE4_COLOR,
                pointBackgroundColor: LINE4_COLOR,
                pointBorderColor: LINE4_COLOR,
                yAxisID: lineAxisId4,
                hidden: !!hiddenSeriesMap[line4Key],
              });
            }

            /** line 5 */
            const line5Key = String(line5Series?.key ?? "").trim();
            const hasLine5 = !!line5Key;
            const lineIsPercent5 = isPercentLineKey(line5Key);
            const lineAxisId5 = lineIsPercent5 ? "y5" : "y";

            if (hasLine5) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(line5Series?.label),
                data: m.series[line5Key] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE5_COLOR,
                pointBackgroundColor: LINE5_COLOR,
                pointBorderColor: LINE5_COLOR,
                yAxisID: lineAxisId5,
                hidden: !!hiddenSeriesMap[line5Key],
              });
            }

            /** line 6 */
            const line6Key = String(line6Series?.key ?? "").trim();
            const hasLine6 = !!line6Key;
            const lineIsPercent6 = isPercentLineKey(line6Key);
            const lineAxisId6 = lineIsPercent6 ? "y6" : "y";

            if (hasLine6) {
              datasets.push({
                type: "line" as const,
                label: safeLabel(line6Series?.label),
                data: m.series[line6Key] ?? [],
                tension: 0.25,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false,
                borderColor: LINE6_COLOR,
                pointBackgroundColor: LINE6_COLOR,
                pointBorderColor: LINE6_COLOR,
                yAxisID: lineAxisId6,
                hidden: !!hiddenSeriesMap[line6Key],
              });
            }

            const data = {
              labels: m.labels,
              datasets,
            };

            const options: ChartOptions<"bar"> = {
              responsive: true,
              maintainAspectRatio: false,
              layout: {padding: {left: 6, right: 6, top: 6, bottom: 14}},
              plugins: {
                legend: {
                  display: false, // ✅ 기본 범례 제거
                },
                title: {display: false},
                tooltip: {
                  mode: "index",
                  intersect: false,
                  callbacks: {
                    label: function (ctx) {
                      const dsType = (ctx.dataset as any)?.type;
                      const axisId = String((ctx.dataset as any)?.yAxisID ?? "");
                      const isPercentAxis =
                        axisId === "y1" ||
                        axisId === "y2" ||
                        axisId === "y3" ||
                        axisId === "y4" ||
                        axisId === "y5" ||
                        axisId === "y6";

                      const y = Number(ctx.parsed?.y ?? 0);

                      if (dsType === "line" && isPercentAxis) {
                        return `${ctx.dataset.label}: ${formatNumberWithCommaFixed(y, 1)}%`;
                      }

                      return `${ctx.dataset.label}: ${formatNumberWithComma(y)}${
                        yLeftUnit ? " " + yLeftUnit : ""
                      }`;
                    },
                  },
                },
              },
              interaction: {mode: "index", intersect: false},
              scales: {
                x: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    padding: 0,
                    font: {size: 10},
                    callback: function (value: any) {
                      const raw = String(value);
                      const idx = Number(raw);

                      const yyyymmdd =
                        Number.isFinite(idx) && m?.labels?.[idx]
                          ? String(m.labels[idx])
                          : raw;

                      if (yyyymmdd.length === 8) {
                        return formatLabelTwoLinesEN(yyyymmdd) as any;
                      }

                      return raw as any;
                    } as any,
                  },
                  grid: {display: true, color: "rgba(0,0,0,0.08)"},
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    font: {size: 11},
                  },
                  grid: {color: "rgba(0,0,0,0.08)"},
                  title: {
                    display: !!yLeftUnit,
                    text: yLeftUnit,
                    align: "end",
                    padding: {top: 0, bottom: 0},
                    font: {size: 11 as any},
                  },
                },
                y1: lineIsPercent
                  ? {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    position: "right",
                    ticks: {
                      font: {size: 11},
                      callback: function (value) {
                        return `${value}%`;
                      },
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  }
                  : undefined,
                y2: lineIsPercent2
                  ? {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: {display: false, drawOnChartArea: false},
                    ticks: {display: false},
                  }
                  : undefined,
                y3: lineIsPercent3
                  ? {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: {display: false, drawOnChartArea: false},
                    ticks: {display: false},
                  }
                  : undefined,
                y4: lineIsPercent4
                  ? {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: {display: false, drawOnChartArea: false},
                    ticks: {display: false},
                  }
                  : undefined,
                y5: lineIsPercent5
                  ? {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: {display: false, drawOnChartArea: false},
                    ticks: {display: false},
                  }
                  : undefined,
                y6: lineIsPercent6
                  ? {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: {display: false, drawOnChartArea: false},
                    ticks: {display: false},
                  }
                  : undefined,
              },
            };

            const innerStyle =
              minChartWidth && minChartWidth > 0
                ? {minWidth: minChartWidth, height: chartHeight}
                : {height: chartHeight};

            return (
              <Card key={biz.cdBizarea + "_" + m.cdFty} className={cardClassName}>
                <div
                  className="mt-n3"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
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
                        opacity: idx === 0 ? 0.75 : 0,
                        color: "blue",
                        pointerEvents: "none",
                        textAlign: "right",
                      }}
                    >
                      {getBizareaLabel(biz.cdBizarea)}
                    </span>

                    <span
                      style={{
                        color: "orange",
                        pointerEvents: "none",
                      }}
                    >
                      {getFactoryLabel(m.cdFty)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    overflowX: minChartWidth && minChartWidth > 0 ? "auto" : "visible",
                  }}
                >
                  <div style={innerStyle as any}>
                    <Bar data={data as any} options={options as any} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
});

export default LineComboChart;
