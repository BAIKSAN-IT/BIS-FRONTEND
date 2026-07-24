import React, {memo, useCallback, useMemo, useState} from "react";
import CommonMultiComboChart, {
  ComboSeriesDef,
} from "@components/chart/CommonMultiComboChart";
import {
  FactoryDashboardDailySewingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";

type PeriodType = "TODAY" | "MONTH";
type MetricType = "KG" | "AMT";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailySewingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

type ChartRow = {
  dtsWork: string;
  cdBizarea: string;
  cdFty: string;

  /** bar */
  prodQty: number;
  prodAmt: number;

  /** line */
  qtyDayPerson: number;
  amtHourDayPerson: number;
};

const BIZAREA_TARGETS = [
  {cdBizarea: "TOTAL"},
  {cdBizarea: "3000"},
  {cdBizarea: "5000"},
  {cdBizarea: "7000"},
] as const;

const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const normalizeDate = (value: any) => {
  if (!value) return "";
  const onlyNum = String(value).replace(/[^0-9]/g, "");
  if (onlyNum.length >= 8) return onlyNum.slice(0, 8);
  return "";
};

const parseDateKey = (dateKey?: string) => {
  const v = normalizeDate(dateKey);
  if (v.length !== 8) return null;

  const yyyy = Number(v.slice(0, 4));
  const mm = Number(v.slice(4, 6));
  const dd = Number(v.slice(6, 8));

  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;

  return d;
};

const isSunday = (dateKey?: string) => {
  const d = parseDateKey(dateKey);
  if (!d) return false;
  return d.getDay() === 0;
};

const generateMockDateKeys = (period: PeriodType, count = 30) => {
  const result: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);

    if (period === "TODAY") {
      d.setDate(now.getDate() - i);
    } else {
      d.setMonth(now.getMonth() - i);
      d.setDate(1);
    }

    result.push(
      `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`
    );
  }

  return result;
};

const buildMockRows = (period: PeriodType): ChartRow[] => {
  const dateKeys = generateMockDateKeys(period, 30);

  return BIZAREA_TARGETS.flatMap((biz, bizIndex) =>
    dateKeys.map((dateKey, index) => {
      const qtyBase = [980, 780, 650, 590][bizIndex] ?? 500;
      const amtBase = [52000, 41000, 36000, 33000][bizIndex] ?? 30000;

      const sundayZero = isSunday(dateKey) && index % 2 === 0;

      const prodQty = sundayZero
        ? 0
        : period === "TODAY"
          ? qtyBase + index * 12 + (index % 3) * 18
          : qtyBase * 10 + index * 90 + (index % 4) * 70;

      const prodAmt = sundayZero
        ? 0
        : period === "TODAY"
          ? amtBase + index * 420 + (index % 3) * 350
          : amtBase * 8 + index * 5200 + (index % 4) * 2800;

      const qtyDayPerson = sundayZero
        ? 0
        : Number((8 + bizIndex * 0.9 + (index % 6) * 0.35).toFixed(2));

      const amtHourDayPerson = sundayZero
        ? 0
        : Number((1.8 + bizIndex * 0.18 + (index % 5) * 0.11).toFixed(2));

      return {
        dtsWork: dateKey,
        cdBizarea: biz.cdBizarea,
        cdFty: "TOTAL",
        prodQty,
        prodAmt,
        qtyDayPerson,
        amtHourDayPerson,
      };
    })
  );
};

const buildRealRows = (
  rows: FactoryDashboardDailySewingRes[]
): ChartRow[] => {
  return (rows || [])
    .map((item: any) => {
      const dtsWork = normalizeDate(item?.dtsWork ?? item?.dtsWk);
      if (!dtsWork) return null;

      return {
        dtsWork,
        cdBizarea:
          item?.cdBizarea && String(item.cdBizarea).trim() !== ""
            ? String(item.cdBizarea).trim()
            : "TOTAL",
        cdFty: "TOTAL",

        prodQty: toNum(item?.qtyDay),
        prodAmt: toNum(item?.amtDay),

        qtyDayPerson: toNum(item?.qtyDayPerson),
        amtHourDayPerson: toNum(item?.amtHourDayPerson),
      };
    })
    .filter(Boolean) as ChartRow[];
};

const legendItemStyle = (checked: boolean) => ({
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
});

const FactoryProductionQtyAmountChart = memo((props: Props) => {
  const {refs, rows, selectedTab, period = "TODAY"} = props;
  void refs;
  void selectedTab;

  const [metricType, setMetricType] = useState<MetricType>("KG");
  const [showLineView, setShowLineView] = useState(true);

  const handleSelectQty = useCallback(() => {
    setMetricType("KG");
  }, []);

  const handleSelectAmt = useCallback(() => {
    setMetricType("AMT");
  }, []);

  const realRows = useMemo(() => buildRealRows(rows || []), [rows]);
  const mockRows = useMemo(() => buildMockRows(period), [period]);

  const chartRows = useMemo(() => {
    const source = realRows.length > 0 ? realRows : mockRows;

    const groupedByDate = source.reduce<Record<string, ChartRow[]>>((acc, item) => {
      const key = normalizeDate(item.dtsWork);
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});

    const visibleDateKeysDesc = Object.keys(groupedByDate)
      .sort((a, b) => b.localeCompare(a))
      .filter((dateKey) => {
        const rowsByDate = groupedByDate[dateKey] || [];
        const isSundayDate = isSunday(dateKey);
        if (!isSundayDate) return true;

        const isAllZero = rowsByDate.every(
          (item) => toNum(item.prodQty) === 0 && toNum(item.prodAmt) === 0
        );

        return !isAllZero;
      })
      .slice(0, 30);

    const visibleDateSet = new Set(visibleDateKeysDesc);

    return source
      .filter((item) => visibleDateSet.has(normalizeDate(item.dtsWork)))
      .sort((a, b) => a.dtsWork.localeCompare(b.dtsWork));
  }, [realRows, mockRows]);

  const customDates = useMemo(() => {
    return Array.from(
      new Set(chartRows.map((item) => normalizeDate(item.dtsWork)))
    )
      .filter((v) => v.length === 8)
      .sort();
  }, [chartRows]);

  const currentBarKey = useMemo(
    () => (metricType === "KG" ? "prodQty" : "prodAmt"),
    [metricType]
  );

  const currentLineKey = useMemo(
    () => (metricType === "KG" ? "amtHourDayPerson" : "amtHourDayPerson"),
    [metricType]
  );

  const series = useMemo(() => {
    const currentBarLabel = metricType === "KG" ? "생산수량" : "생산금액";
    const currentLineLabel = "인시당 생산금액";

    const barColor = metricType === "KG" ? "#4e79a7" : "#f28e2b";
    const lineColor = "#e15759" ;

    const result: ComboSeriesDef[] = [
      {
        key: currentBarKey,
        label: currentBarLabel,
        type: "bar",
        color: barColor,
        stack: "prod",
      },
      {
        key: currentLineKey,
        tooltipKey: currentLineKey,
        label: currentLineLabel,
        type: "line",
        color: lineColor,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !showLineView,
      },
    ];

    return result;
  }, [metricType, currentBarKey, currentLineKey, showLineView]);

  const yLeftUnit = metricType === "KG" ? "(KG)" : "(AMT)";
  const yRightUnit = metricType === "KG" ? "(인시당생산)" : "(인시당생산)";

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 6,
          padding: "0 4px",
        }}
      >
        <label style={legendItemStyle(metricType === "KG")}>
          <input
            type="checkbox"
            checked={metricType === "KG"}
            onChange={handleSelectQty}
          />
          <span>생산수량</span>
        </label>

        <label style={legendItemStyle(metricType === "AMT")}>
          <input
            type="checkbox"
            checked={metricType === "AMT"}
            onChange={handleSelectAmt}
          />
          <span>생산금액</span>
        </label>

        <label style={legendItemStyle(showLineView)}>
          <input
            type="checkbox"
            checked={showLineView}
            onChange={(e) => setShowLineView(e.target.checked)}
          />
          <span style={{color: "red"}}>LINE VIEW</span>
        </label>
      </div>

      <CommonMultiComboChart
        rows={chartRows}
        title=""
        series={series}
        chartHeight={170}
        minChartWidth={420}
        customDates={customDates}
        yLeftUnit={yLeftUnit}
        yRightUnit={yRightUnit}
        yRightMin={0}
        yRightMax={10}
        yRightStepSize={2}
        columns={1}
        showLegend={false}
        showLegendOnlyFirstCard={true}
        tooltipLineOnly={false}
        showWeekday={false}
        reverseDates={true}
        showHeader={true}
        hideSundayZeroDates={true}
        endDate={customDates[customDates.length - 1]}
        dateLabelMode={
          period === "TODAY" ? "MM.DD" : "MONTHLY_WITH_TODAY_FULL"
        }
      />
    </>
  );
});

export default FactoryProductionQtyAmountChart;
