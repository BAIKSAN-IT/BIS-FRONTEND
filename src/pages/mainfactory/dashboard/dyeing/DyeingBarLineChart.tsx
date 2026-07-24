import React, {memo, useMemo} from "react";
import {Col, Form, Row} from "react-bootstrap";
import CommonMultiComboChart, {ComboSeriesDef,} from "@components/chart/CommonMultiComboChart";
import {
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";

type PeriodType = "TODAY" | "MONTH";
export type MetricType = "KG" | "AMT";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyKnittingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
  /** 부모 공용 상태 */ metric: MetricType;
  showLineView: boolean;
  onChangeMetric: (metric: MetricType) => void;
  onChangeShowLineView: (checked: boolean) => void;
  /** 컨트롤 한 번만 보일지 여부 */ showControls?: boolean;
  highlightSundayLabel?: boolean;
}

type DyeingChartRow = {
  cdBizarea: string;
  cdFty: string;
  dtsWork: string;
  /** BAR */ prodQty: number;
  prodAmt: number;
  /** LINE */ operationRate: number;
  /** 집계용 */ machineKeep: number;
  machineUse: number;
};
const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const calcRate = (num: number, den: number) => {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
};
const normalizeDateKey = (value?: string) => String(value || "").replace(/[^0-9]/g, "");
const isTodayRow = (sw?: string) => String(sw || "").trim().toUpperCase() === "D";
const getMonthKey = (value?: string) => normalizeDateKey(value).slice(0, 6);
const getBizareaKey = (row: any) => {
  const bizarea = String(row?.cdBizarea ?? "").trim();
  return bizarea || "TOTAL";
};
const getSelectedDateKey = (refs: InputRefMap<"dtsWork">) => {
  const rawValue = (refs as any)?.dtsWork?.current?.value;
  const normalized = normalizeDateKey(rawValue);
  if (normalized.length >= 8) return normalized.slice(0, 8);
  if (normalized.length === 6) return `${normalized}01`;
  return "";
};
const toDayDateKey = (value?: string) => {
  const v = normalizeDateKey(value);
  if (v.length >= 8) return v.slice(0, 8);
  return "";
};
/** * 최신 월 라벨용 표시 날짜 결정 * 1) refs 선택일자가 최신 월과 같으면 그 날짜 사용 * 2) 데이터에 8자리 날짜가 있으면 그 중 최신 날짜 사용 * 3) 없으면 YYYYMM01 fallback */ const resolveLatestMonthDisplayDateKey = (rows: FactoryDashboardDailyKnittingRes[], latestMonthKey: string, refs: InputRefMap<"dtsWork">) => {
  if (!latestMonthKey) return "";
  const selectedDateKey = getSelectedDateKey(refs);
  if (getMonthKey(selectedDateKey) === latestMonthKey) {
    return selectedDateKey;
  }
  const latestRowDateKey = rows.map((row) => normalizeDateKey((row as any)?.dtsWork)).filter((dateKey) => dateKey.length >= 8 && getMonthKey(dateKey) === latestMonthKey).sort().slice(-1)[0] || "";
  if (latestRowDateKey) {
    return latestRowDateKey.slice(0, 8);
  }
  return `${latestMonthKey}01`;
};
/** * MONTH 라벨용 날짜 생성 규칙 * - 최신 월: 선택한 날짜(refs.dtsWork) 또는 최신 실제 날짜 사용 * - 이전 월: YYYYMM01 로 고정 * * 이렇게 해야 CommonMultiComboChart의 * dateLabelMode="MONTHLY_WITH_TODAY_FULL"에서 * 첫 번째만 26.03.25 / 26.03.28 처럼 실제 선택일로 나오고, * 나머지는 26.02 / 26.01 형태로 찍힌다. */ const toMonthDateKey = (rawDate: string, latestMonthKey: string, latestMonthDisplayDateKey: string) => {
  const monthKey = getMonthKey(rawDate);
  if (!monthKey) return "";
  if (monthKey === latestMonthKey) {
    return latestMonthDisplayDateKey || `${monthKey}01`;
  }
  return `${monthKey}01`;
};
const getPrimaryBizarea = (rows: FactoryDashboardDailyKnittingRes[], isToday: boolean): string => {
  const filteredRows = rows.filter((row) => isToday ? isTodayRow((row as any)?.sw) : !isTodayRow((row as any)?.sw));
  const sourceRows = filteredRows.length > 0 ? filteredRows : rows;
  const counter = new Map<string, number>();
  sourceRows.forEach((row) => {
    const bizarea = getBizareaKey(row);
    counter.set(bizarea, (counter.get(bizarea) || 0) + 1);
  });
  let result = "";
  let maxCount = -1;
  counter.forEach((count, bizarea) => {
    if (count > maxCount) {
      maxCount = count;
      result = bizarea;
    }
  });
  return result || "TOTAL";
};
/** * 가동률 계산 * 1) rate 필드가 있으면 우선 사용 * 2) 없으면 keep/use 로 직접 계산 */ const getOperationRateInfo = (row: any) => {
  const machineKeep = toNum(row?.qtyMachineKeep ?? row?.cntMachineKeep ?? row?.machineKeep ?? row?.qtyMcKeep ?? row?.cntMcKeep);
  const machineUse = toNum(row?.qtyMachineUse ?? row?.cntMachineUse ?? row?.machineUse ?? row?.qtyMcUse ?? row?.cntMcUse);
  const explicitRate = toNum(row?.rtMachineUse ?? row?.ratMachineUse ?? row?.machineUseRate ?? row?.operationRate ?? row?.rtOperation);
  const operationRate = machineKeep > 0 ? calcRate(machineUse, machineKeep) : explicitRate;
  return {machineKeep, machineUse, operationRate: clamp(operationRate, 0, 100),};
};
const controlLabelStyle = (checked: boolean) => ({
  display: "inline-flex" as const,
  alignItems: "center" as const,
  gap: 6,
  cursor: "pointer",
  userSelect: "none" as const,
  fontSize: 11,
  fontWeight: 600,
  opacity: checked ? 1 : 0.65,
  padding: "2px 6px",
  borderRadius: 6,
  whiteSpace: "nowrap" as const,
});
const DyeingBarLineChart = memo(({
                                   refs,
                                   rows,
                                   selectedTab,
                                   period = "TODAY",
                                   metric,
                                   showLineView,
                                   onChangeMetric,
                                   onChangeShowLineView,
                                   showControls = false,
                                   highlightSundayLabel = false,
                                 }: Props) => {
  void selectedTab;
  const isToday = period === "TODAY";
  const primaryBizarea = useMemo(() => getPrimaryBizarea(rows, isToday), [rows, isToday]);
  const chartRows = useMemo<DyeingChartRow[]>(() => {
    const filtered = (rows || []).filter((row) => {
      const rowBizarea = getBizareaKey(row);
      if (isToday) {
        if (!isTodayRow((row as any)?.sw)) return false;
      } else {
        if (isTodayRow((row as any)?.sw)) return false;
      }
      if (primaryBizarea && rowBizarea !== primaryBizarea) return false;
      return true;
    });
    if (filtered.length === 0) return [];
    const latestMonthKey = !isToday ? filtered.map((row) => getMonthKey((row as any)?.dtsWork)).filter((v) => v.length === 6).sort().slice(-1)[0] || "" : "";
    const latestMonthDisplayDateKey = !isToday ? resolveLatestMonthDisplayDateKey(filtered, latestMonthKey, refs) : "";
    const mappedRows = filtered.map((row) => {
      const rowAny = row as any;
      const rawDate = String(rowAny?.dtsWork || "");
      const dtsWork = isToday ? toDayDateKey(rawDate) : toMonthDateKey(rawDate, latestMonthKey, latestMonthDisplayDateKey);
      if (!dtsWork) return null;
      const {machineKeep, machineUse, operationRate} = getOperationRateInfo(rowAny);
      return {
        cdBizarea: getBizareaKey(rowAny),
        cdFty: "TOTAL",
        dtsWork,
        prodQty: isToday ? toNum(rowAny?.qtyDay) : toNum(rowAny?.qtyMonthActual),
        prodAmt: isToday ? toNum(rowAny?.amtDay) : toNum(rowAny?.amtMonthActual),
        operationRate,
        machineKeep,
        machineUse,
      };
    }).filter(Boolean) as DyeingChartRow[];
    const grouped = mappedRows.reduce<Record<string, DyeingChartRow[]>>((acc, row) => {
      if (!acc[row.dtsWork]) {
        acc[row.dtsWork] = [];
      }
      acc[row.dtsWork].push(row);
      return acc;
    }, {});
    const aggregated = Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map((dateKey) => {
      const rowsByDate = grouped[dateKey] || [];
      const sumQty = rowsByDate.reduce((sum, row) => sum + toNum(row.prodQty), 0);
      const sumAmt = rowsByDate.reduce((sum, row) => sum + toNum(row.prodAmt), 0);
      const sumKeep = rowsByDate.reduce((sum, row) => sum + toNum(row.machineKeep), 0);
      const sumUse = rowsByDate.reduce((sum, row) => sum + toNum(row.machineUse), 0);
      const avgRate = rowsByDate.length > 0 ? rowsByDate.reduce((sum, row) => sum + toNum(row.operationRate), 0) / rowsByDate.length : 0;
      const operationRate = sumKeep > 0 ? calcRate(sumUse, sumKeep) : avgRate;
      return {
        cdBizarea: primaryBizarea || "TOTAL",
        cdFty: "TOTAL",
        dtsWork: dateKey,
        prodQty: sumQty,
        prodAmt: sumAmt,
        operationRate: clamp(Number(operationRate.toFixed(1)), 0, 100),
        machineKeep: sumKeep,
        machineUse: sumUse,
      };
    });
    return isToday ? aggregated.slice(-30) : aggregated;
  }, [rows, isToday, primaryBizarea, refs]);
  const customDates = useMemo(() => {
    return Array.from(new Set(chartRows.map((item) => item.dtsWork))).filter((v) => v.length === 8).sort();
  }, [chartRows]);
  const currentBarKey = metric === "KG" ? "prodQty" : "prodAmt";
  const series = useMemo<ComboSeriesDef[]>(() => {
    return [{
      key: currentBarKey,
      label: metric === "KG" ? "생산량" : "생산금액",
      type: "bar",
      color: metric === "KG" ? "#4e79a7" : "#f28e2b",
      stack: "prod",
      order: 2,
    }, {
      key: "operationRate",
      label: "가동률",
      type: "line",
      color: "#e15759",
      yAxisID: "y1",
      percent: true,
      order: 1,
      borderWidth: 2,
      pointRadius: 2,
      hidden: !showLineView,
    },];
  }, [currentBarKey, metric, showLineView]);
  const latestDate = customDates.length > 0 ? customDates[customDates.length - 1] : "";
  return (
    <Row className="align-items-stretch d-flex flex-wrap mt-n2">
      <Col xs={12} className="d-flex flex-column">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 6,
          padding: "0 4px",
          minHeight: 28,
          visibility: showControls ? "visible" : "hidden",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          <label style={controlLabelStyle(metric === "KG")}>
            <Form.Check inline type="checkbox" id={`dyeing-shared-qty-${period}`} checked={metric === "KG"}
                        onChange={() => onChangeMetric("KG")} label="생산량"/>
          </label>
          <label style={controlLabelStyle(metric === "AMT")}>
            <Form.Check inline type="checkbox" id={`dyeing-shared-amt-${period}`} checked={metric === "AMT"}
                        onChange={() => onChangeMetric("AMT")} label="AMT"/>
          </label>
          <label style={controlLabelStyle(showLineView)}>
            <Form.Check inline type="checkbox" id={`dyeing-shared-line-view-${period}`} checked={showLineView}
                        onChange={(e) => onChangeShowLineView(e.target.checked)} label="LINE VIEW"/>
          </label>
        </div>
        <CommonMultiComboChart rows={chartRows}
                               title=""
                               series={series}
                               chartHeight={190}
                               minChartWidth={480}
                               customDates={customDates}
                               yLeftUnit={metric === "KG" ? "(KG)" : "(AMT)"}
                               yRightUnit="(%)"
                               yRightMin={0}
                               yRightMax={100}
                               yRightStepSize={20}
                               columns={1}
                               showLegend={false}
                               showLegendOnlyFirstCard={true}
                               tooltipLineOnly={false}
                               showWeekday={false}
                               reverseDates={true}
                               showHeader={true}
                               hideSundayZeroDates={true}
                               highlightSundayLabel={highlightSundayLabel}
                               endDate={latestDate}
                               dateLabelMode={isToday ? "MM.DD" : "MONTHLY_WITH_TODAY_FULL"}
                               minRotation={35}/> A
      </Col>
    </Row>
  );
});
export default DyeingBarLineChart;
