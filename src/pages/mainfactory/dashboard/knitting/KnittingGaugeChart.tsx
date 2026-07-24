import React, {memo, useMemo} from "react";
import {
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import CommonGaugeECharts from "@components/chart/CommonGaugeECharts";
import KnittingGaugeSummaryTable, {
  KnittingGaugeSummaryTableRow,
} from "./KnittingGaugeSummaryTable";

type PeriodType = "TODAY" | "MONTH";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyKnittingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

const TITLE_BLUE = "#0000FF";

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const toNum = (value: any) => Number(value) || 0;

const formatNumber = (value?: number, digit = 0) => {
  const num = Number(value || 0);

  return num.toLocaleString(undefined, {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
};

const calcRate = (num: number, den: number) => {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
};

const normalizeDateKey = (value?: string) =>
  String(value || "").replace(/[^0-9]/g, "");

const formatDayText = (value?: string) => {
  const onlyNum = normalizeDateKey(value);
  if (onlyNum.length < 8) return "-";
  return `${onlyNum.slice(2, 4)}.${onlyNum.slice(4, 6)}.${onlyNum.slice(6, 8)}`;
};

const formatMonthText = (value?: string) => {
  const onlyNum = normalizeDateKey(value);
  if (onlyNum.length < 6) return "-";
  return `${onlyNum.slice(2, 4)}.${onlyNum.slice(4, 6)}`;
};

const getPrimaryBizarea = (
  rows: FactoryDashboardDailyKnittingRes[]
): string => {
  const dailyRows = (rows || []).filter(
    (row) => (row?.sw || "").toUpperCase() === "D" && !!row?.cdBizarea
  );

  const sourceRows = dailyRows.length > 0 ? dailyRows : rows || [];
  const counter = new Map<string, number>();

  sourceRows.forEach((row) => {
    const bizarea = row?.cdBizarea || "";
    if (!bizarea) return;
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

  return result;
};

const getSortedPeriodRows = (
  rows: FactoryDashboardDailyKnittingRes[],
  period: PeriodType
) => {
  const sw = period === "TODAY" ? "D" : "M";
  const primaryBizarea = getPrimaryBizarea(rows);

  return (rows || [])
    .filter((row) => {
      const rowSw = (row?.sw || "").toUpperCase();
      const rowBizarea = row?.cdBizarea || "";

      if (rowSw !== sw) return false;
      if (primaryBizarea && rowBizarea !== primaryBizarea) return false;

      return true;
    })
    .sort((a, b) =>
      normalizeDateKey(b?.dtsWork).localeCompare(normalizeDateKey(a?.dtsWork))
    );
};

const toDisplayValue = (value: number, digit = 1) => {
  return value !== 0 ? formatNumber(value, digit) : "";
};

const toPercentDisplayValue = (value: number, enable: boolean) => {
  if (!enable) return "";
  return `${formatNumber(value, 1)}%`;
};

const toDiffDisplayValue = (value: number, enable: boolean, digit = 1) => {
  if (!enable) return "";
  if (value === 0) return "";
  return formatNumber(Math.abs(value), digit);
};

const toRateDiffDisplayValue = (value: number, enable: boolean) => {
  if (!enable) return "";
  if (value === 0) return "";
  return `${formatNumber(Math.abs(value), 1)}%`;
};

const KnittingGaugeChart = memo(
  ({
     refs,
     rows,
     selectedTab,
     period = "TODAY",
   }: Props) => {
    void refs;
    void selectedTab;

    const isToday = period === "TODAY";

    const chartModel = useMemo(() => {
      const periodRows = getSortedPeriodRows(rows, period);
      const currentRow = periodRows[0];
      const previousRow = periodRows[1];

      const emptyPreviousTitle = isToday ? "전일\n-" : "전월\n-";
      const emptyCurrentTitle = isToday ? "당일\n-" : "당월\n-";

      if (!currentRow) {
        return {
          title: isToday ? "TODAY" : "MONTH",
          gaugeValue: 0,
          previousTitle: emptyPreviousTitle,
          currentTitle: emptyCurrentTitle,
          tableRows: [
            {
              key: "target",
              label: "TARGET",
              prevQtyValue: "",
              prevAmtValue: "",
              currQtyValue: "",
              currAmtValue: "",
              diffQtyValue: "",
              diffAmtValue: "",
              diffQtySign: 0,
              diffAmtSign: 0,
            },
            {
              key: "actual",
              label: "ACTUAL",
              prevQtyValue: "",
              prevAmtValue: "",
              currQtyValue: "",
              currAmtValue: "",
              diffQtyValue: "",
              diffAmtValue: "",
              diffQtySign: 0,
              diffAmtSign: 0,
            },
            {
              key: "rate",
              label: "달성율",
              prevQtyValue: "",
              prevAmtValue: "",
              currQtyValue: "",
              currAmtValue: "",
              diffQtyValue: "",
              diffAmtValue: "",
              diffQtySign: 0,
              diffAmtSign: 0,
            },
          ] as KnittingGaugeSummaryTableRow[],
        };
      }

      const gaugeValue = clampPercent(toNum(currentRow.ratMachine));

      if (isToday) {
        const prevQtyActual = toNum(previousRow?.qtyDay);
        const prevAmtActual = toNum(previousRow?.amtDay);
        const currQtyActual = toNum(currentRow?.qtyDay);
        const currAmtActual = toNum(currentRow?.amtDay);

        const hasPrevious = !!previousRow;

        const diffQtyActual = currQtyActual - prevQtyActual;
        const diffAmtActual = currAmtActual - prevAmtActual;

        return {
          title: "TODAY",
          gaugeValue,
          previousTitle: `${formatDayText(previousRow?.dtsWork)}`,
          currentTitle: `${formatDayText(currentRow?.dtsWork)}`,
          tableRows: [
            {
              key: "target",
              label: "TARGET",
              prevQtyValue: "",
              prevAmtValue: "",
              currQtyValue: "",
              currAmtValue: "",
              diffQtyValue: "",
              diffAmtValue: "",
              diffQtySign: 0,
              diffAmtSign: 0,
            },
            {
              key: "actual",
              label: "ACTUAL",
              prevQtyValue: toDisplayValue(prevQtyActual, 1),
              prevAmtValue: toDisplayValue(prevAmtActual, 1),
              currQtyValue: toDisplayValue(currQtyActual, 1),
              currAmtValue: toDisplayValue(currAmtActual, 1),
              diffQtyValue: toDiffDisplayValue(diffQtyActual, hasPrevious, 1),
              diffAmtValue: toDiffDisplayValue(diffAmtActual, hasPrevious, 1),
              diffQtySign: hasPrevious ? diffQtyActual : 0,
              diffAmtSign: hasPrevious ? diffAmtActual : 0,
            },
            {
              key: "rate",
              label: "달성율",
              prevQtyValue: "",
              prevAmtValue: "",
              currQtyValue: "",
              currAmtValue: "",
              diffQtyValue: "",
              diffAmtValue: "",
              diffQtySign: 0,
              diffAmtSign: 0,
            },
          ] as KnittingGaugeSummaryTableRow[],
        };
      }

      const prevQtyTarget = toNum(previousRow?.qtyMonthTarget);
      const prevAmtTarget = toNum(previousRow?.amtMonthTarget);
      const currQtyTarget = toNum(currentRow?.qtyMonthTarget);
      const currAmtTarget = toNum(currentRow?.amtMonthTarget);

      const prevQtyActual = toNum(previousRow?.qtyMonthActual);
      const prevAmtActual = toNum(previousRow?.amtMonthActual);
      const currQtyActual = toNum(currentRow?.qtyMonthActual);
      const currAmtActual = toNum(currentRow?.amtMonthActual);

      const prevQtyRate =
        prevQtyTarget > 0 ? calcRate(prevQtyActual, prevQtyTarget) : 0;
      const prevAmtRate =
        prevAmtTarget > 0 ? calcRate(prevAmtActual, prevAmtTarget) : 0;

      const currQtyRate =
        currQtyTarget > 0 ? calcRate(currQtyActual, currQtyTarget) : 0;
      const currAmtRate =
        currAmtTarget > 0 ? calcRate(currAmtActual, currAmtTarget) : 0;

      const hasPrevious = !!previousRow;

      const diffQtyTarget = currQtyTarget - prevQtyTarget;
      const diffAmtTarget = currAmtTarget - prevAmtTarget;

      const diffQtyActual = currQtyActual - prevQtyActual;
      const diffAmtActual = currAmtActual - prevAmtActual;

      const diffQtyRate = currQtyRate - prevQtyRate;
      const diffAmtRate = currAmtRate - prevAmtRate;

      return {
        title: "MONTH",
        gaugeValue,
        previousTitle: `${formatMonthText(previousRow?.dtsWork)}`,
        currentTitle: `${formatMonthText(currentRow?.dtsWork)}`,
        tableRows: [
          {
            key: "target",
            label: "TARGET",
            prevQtyValue: toDisplayValue(prevQtyTarget, 1),
            prevAmtValue: toDisplayValue(prevAmtTarget, 1),
            currQtyValue: toDisplayValue(currQtyTarget, 1),
            currAmtValue: toDisplayValue(currAmtTarget, 1),
            diffQtyValue: toDiffDisplayValue(diffQtyTarget, hasPrevious, 1),
            diffAmtValue: toDiffDisplayValue(diffAmtTarget, hasPrevious, 1),
            diffQtySign: hasPrevious ? diffQtyTarget : 0,
            diffAmtSign: hasPrevious ? diffAmtTarget : 0,
          },
          {
            key: "actual",
            label: "ACTUAL",
            prevQtyValue: toDisplayValue(prevQtyActual, 1),
            prevAmtValue: toDisplayValue(prevAmtActual, 1),
            currQtyValue: toDisplayValue(currQtyActual, 1),
            currAmtValue: toDisplayValue(currAmtActual, 1),
            diffQtyValue: toDiffDisplayValue(diffQtyActual, hasPrevious, 1),
            diffAmtValue: toDiffDisplayValue(diffAmtActual, hasPrevious, 1),
            diffQtySign: hasPrevious ? diffQtyActual : 0,
            diffAmtSign: hasPrevious ? diffAmtActual : 0,
          },
          {
            key: "rate",
            label: "달성율",
            prevQtyValue: toPercentDisplayValue(prevQtyRate, prevQtyTarget > 0),
            prevAmtValue: toPercentDisplayValue(prevAmtRate, prevAmtTarget > 0),
            currQtyValue: toPercentDisplayValue(currQtyRate, currQtyTarget > 0),
            currAmtValue: toPercentDisplayValue(currAmtRate, currAmtTarget > 0),
            diffQtyValue: toRateDiffDisplayValue(diffQtyRate, hasPrevious),
            diffAmtValue: toRateDiffDisplayValue(diffAmtRate, hasPrevious),
            diffQtySign: hasPrevious ? diffQtyRate : 0,
            diffAmtSign: hasPrevious ? diffAmtRate : 0,
          },
        ] as KnittingGaugeSummaryTableRow[],
      };
    }, [rows, period, isToday]);

    return (
      <div
        style={{
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 24,
            marginBottom: 2,
          }}
        >
          {isToday && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                가동률
              </span>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: "20%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#4e79a7",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: TITLE_BLUE,
                whiteSpace: "nowrap",
              }}
            >
              {chartModel.title}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "stretch",
            width: "100%",
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <div
            className="mt-n1"
            style={{
              flex: "1 1 230px",
              minWidth: 0,
              overflowX: "hidden",
              overflowY: "hidden",
            }}
          >
            <CommonGaugeECharts
              value={chartModel.gaugeValue}
              title={chartModel.title}
              heightPx={180}
              showHeader={false}
            />
          </div>

          <div
            style={{
              flex: "1 1 390px",
              minWidth: 0,
              overflowX: "auto",
              overflowY: "hidden",
              marginTop: 36,
            }}
          >
            <KnittingGaugeSummaryTable
              rows={chartModel.tableRows}
              previousTitle={chartModel.previousTitle}
              currentTitle={chartModel.currentTitle}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default KnittingGaugeChart;
