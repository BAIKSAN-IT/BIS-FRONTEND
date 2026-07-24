import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  CSSProperties,
} from "react";
import {Col, Row} from "react-bootstrap";
import CommonMultiComboChart, {
  ComboSeriesDef,
} from "@components/chart/CommonMultiComboChart";
import {
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import KnittingMonthMachineMatrixTable from "@pages/mainfactory/dashboard/knitting/KnittingMonthMachineMatrixTable";

type PeriodType = "TODAY" | "MONTH";
type FieldKey = string | string[];

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyKnittingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

export type KnittingMachineDef = {
  key: string;
  label: string;
  keepFields: FieldKey;
  useFields: FieldKey;
  rateFields: FieldKey;
  color: string;
};

type ChartRow = {
  dtsWork: string;
  ym: string;
  cdBizarea: string;
  cdFty: string;
  [key: string]: string | number;
};

const LEGEND_WRAP_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "6px 8px",
  width: "100%",
  minWidth: 0,
  padding: "2px 0 0 0",
};

const LEGEND_BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  border: "1px solid #d8d8d8",
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "2px 6px",
  margin: 0,
  cursor: "pointer",
  minHeight: 22,
  maxWidth: 110,
};

const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getFieldValue = (obj: any, keys?: FieldKey) => {
  if (!obj || !keys) return undefined;

  const keyList = Array.isArray(keys) ? keys : [keys];

  for (const key of keyList) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const getNumByKeys = (obj: any, keys: FieldKey) => {
  return toNum(getFieldValue(obj, keys));
};

const normalizeYmd = (value: any) => {
  const onlyNum = String(value || "").replace(/[^0-9]/g, "");
  return onlyNum.length >= 8 ? onlyNum.slice(0, 8) : "";
};

const normalizeYm = (value: any) => {
  const onlyNum = String(value || "").replace(/[^0-9]/g, "");
  return onlyNum.length >= 6 ? onlyNum.slice(0, 6) : "";
};

const isDayRow = (sw?: string) =>
  String(sw || "").trim().toUpperCase() === "D";

const isMonthRow = (sw?: string) =>
  String(sw || "").trim().toUpperCase() === "M";

const safeDivide = (value: number, divisor: number, digit = 1) => {
  if (!Number.isFinite(value) || !Number.isFinite(divisor) || divisor === 0) {
    return 0;
  }

  const pow = Math.pow(10, digit);
  return Math.round((value / divisor) * pow) / pow;
};

const MACHINE_TYPE_DEFS: KnittingMachineDef[] = [
  {
    key: "single",
    label: "SINGLE",
    keepFields: "qtySingleKeep",
    useFields: "qtySingleUse",
    rateFields: "ratSingleUse",
    color: "#4e79a7",
  },
  {
    key: "frenchTerry",
    label: "F.TERRY",
    keepFields: "qtyFrenchTerryKeep",
    useFields: "qtyFrenchTerryUse",
    rateFields: "ratFrenchTerryUse",
    color: "#f28e2b",
  },
  {
    key: "rib",
    label: "RIB",
    keepFields: "qtyRibKeep",
    useFields: "qtyRibUse",
    rateFields: "ratRibUse",
    color: "#e15759",
  },
  {
    key: "double",
    label: "DOUBLE",
    keepFields: ["qtyDoubleKeep", "qtyDobleKeep"],
    useFields: ["qtyDoubleUse", "qtyDobleUse"],
    rateFields: ["ratDoubleUse", "ratDobleUse"],
    color: "#8a63d2",
  },
  {
    key: "jacquardDouble",
    label: "J/DOUBLE",
    keepFields: "qtyJacquardDoubleKeep",
    useFields: "qtyJacquardDoubleUse",
    rateFields: "ratJacquardDoubleUse",
    color: "#76b7b2",
  },
  {
    key: "jacquardSingle",
    label: "J/SINGLE",
    keepFields: "qtyJacquardSingleKeep",
    useFields: "qtyJacquardSingleUse",
    rateFields: "ratJacquardSingleUse",
    color: "#59a14f",
  },
  {
    key: "jacquardZurry",
    label: "ZURRY",
    keepFields: "qtyJacquardZurryKeep",
    useFields: "qtyJacquardZurryUse",
    rateFields: "ratJacquardZurryUse",
    color: "#edc948",
  },
  {
    key: "engStriper",
    label: "ENG",
    keepFields: "qtyEngStriperKeep",
    useFields: "qtyEngStriperUse",
    rateFields: "ratEngStriperUse",
    color: "#b07aa1",
  },
  {
    key: "smallDouble",
    label: "S/DOUBLE",
    keepFields: "qtySmallDoubleKeep",
    useFields: "qtySmallDoubleUse",
    rateFields: "ratSmallDoubleUse",
    color: "#ff9da7",
  },
  {
    key: "smallSingle",
    label: "S/SINGLE",
    keepFields: "qtySmallSingleKeep",
    useFields: "qtySmallSingleUse",
    rateFields: "ratSmallSingleUse",
    color: "#9c755f",
  },
  {
    key: "velour",
    label: "VELOUR",
    keepFields: "qtyVelourKeep",
    useFields: "qtyVelourUse",
    rateFields: "ratVelourUse",
    color: "#bab0ab",
  },
  {
    key: "raschel",
    label: "RASCHEL",
    keepFields: ["qtyRaschelKeep", "qtyRashelKeep"],
    useFields: ["qtyRaschelUse", "qtyRashelUse"],
    rateFields: ["ratRaschelUse", "ratRashelUse"],
    color: "#7f7f7f",
  },
];

const getPrimaryBizarea = (rows: FactoryDashboardDailyKnittingRes[]) => {
  const monthRows = (rows || []).filter((row) => isMonthRow(row?.sw));
  const counter = new Map<string, number>();

  monthRows.forEach((row) => {
    const bizarea = String(row?.cdBizarea || "").trim();
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

const getLatestFullDate = (rows: FactoryDashboardDailyKnittingRes[]) => {
  const dayDates = (rows || [])
    .filter((row) => isDayRow(row?.sw))
    .map((row) => normalizeYmd(row?.dtsWork))
    .filter((v) => v.length === 8)
    .sort();

  if (dayDates.length > 0) return dayDates[dayDates.length - 1];

  const fullDates = (rows || [])
    .map((row) => normalizeYmd(row?.dtsWork))
    .filter((v) => v.length === 8)
    .sort();

  if (fullDates.length > 0) return fullDates[fullDates.length - 1];

  return "";
};

const KnittingMachineRateChart = memo((props: Props) => {
  const {refs, rows, selectedTab, period = "MONTH"} = props;
  void refs;
  void selectedTab;
  void period;

  const [hiddenSeriesIds, setHiddenSeriesIds] = useState<string[]>([]);
  const [showLines, setShowLines] = useState(true);

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeriesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const primaryBizarea = useMemo(() => getPrimaryBizarea(rows || []), [rows]);
  const latestFullDate = useMemo(() => getLatestFullDate(rows || []), [rows]);
  const latestYm = latestFullDate ? latestFullDate.slice(0, 6) : "";

  const monthlyRows = useMemo<ChartRow[]>(() => {
    const monthBuckets = new Map<string, FactoryDashboardDailyKnittingRes[]>();

    (rows || [])
      .filter((item) => {
        if (!isMonthRow(item?.sw)) return false;

        const rowBizarea = String(item?.cdBizarea || "").trim();
        if (primaryBizarea && rowBizarea !== primaryBizarea) return false;

        return true;
      })
      .forEach((item) => {
        const ym = normalizeYm(item?.dtsWork);
        if (!ym) return;

        if (!monthBuckets.has(ym)) {
          monthBuckets.set(ym, []);
        }
        monthBuckets.get(ym)!.push(item);
      });

    const result: ChartRow[] = [];

    Array.from(monthBuckets.entries()).forEach(([ym, monthItems]) => {
      const latestMonthRow = [...monthItems].sort((a, b) => {
        const aYmd = normalizeYmd(a?.dtsWork) || `${normalizeYm(a?.dtsWork)}01`;
        const bYmd = normalizeYmd(b?.dtsWork) || `${normalizeYm(b?.dtsWork)}01`;
        return aYmd.localeCompare(bYmd);
      })[monthItems.length - 1];

      if (!latestMonthRow) return;

      const cntDay = toNum(getFieldValue(latestMonthRow, ["cntDay", "cnDay"]));
      const displayDate =
        latestYm && ym === latestYm ? latestFullDate : `${ym}01`;

      const nextRow: ChartRow = {
        dtsWork: displayDate,
        ym,
        cdBizarea:
          String(latestMonthRow?.cdBizarea || "").trim() === ""
            ? "TOTAL"
            : String(latestMonthRow?.cdBizarea || ""),
        cdFty:
          String((latestMonthRow as any)?.cdFty || "").trim() === ""
            ? "TOTAL"
            : String((latestMonthRow as any)?.cdFty || ""),
      };

      MACHINE_TYPE_DEFS.forEach((def) => {
        const rawKeep = getNumByKeys(latestMonthRow, def.keepFields);
        const rawUse = getNumByKeys(latestMonthRow, def.useFields);
        const rawRate = getNumByKeys(latestMonthRow, def.rateFields);

        nextRow[`${def.key}Keep`] = safeDivide(rawKeep, cntDay, 1);
        nextRow[`${def.key}Use`] = safeDivide(rawUse, cntDay, 1);
        nextRow[`${def.key}Rate`] = rawRate;
      });

      result.push(nextRow);
    });

    const sortedRows = result
      .sort((a, b) => String(a.ym).localeCompare(String(b.ym)))
      .slice(-12);

    if (sortedRows.length === 0) return sortedRows;

    const lastRow = sortedRows[sortedRows.length - 1];

    return sortedRows.map((row) => {
      const nextRow: ChartRow = {...row};

      MACHINE_TYPE_DEFS.forEach((def) => {
        nextRow[`${def.key}Keep`] = toNum(lastRow[`${def.key}Keep`]);
      });

      return nextRow;
    });
  }, [rows, primaryBizarea, latestFullDate, latestYm]);

  const visibleMachineDefs = useMemo<KnittingMachineDef[]>(() => {
    return MACHINE_TYPE_DEFS.filter((def) => {
      return monthlyRows.some((row) => {
        const useValue = toNum(row[`${def.key}Use`]);

        // 화면에 표시되는 값 기준으로 판단
        return Math.round(useValue) > 0;
      });
    }).map((def) => ({...def}));
  }, [monthlyRows]);
  useEffect(() => {
    setHiddenSeriesIds((prev) =>
      prev.filter((id) => visibleMachineDefs.some((def) => def.key === id))
    );
  }, [visibleMachineDefs]);

  const customDates = useMemo(() => {
    return monthlyRows.map((row) => normalizeYmd(row.dtsWork));
  }, [monthlyRows]);

  const comboSeries = useMemo<ComboSeriesDef[]>(() => {
    const result: ComboSeriesDef[] = [];

    visibleMachineDefs.forEach((def) => {
      result.push({
        key: `${def.key}Use`,
        label: def.label,
        type: "bar",
        color: def.color,
        hidden: hiddenSeriesIds.includes(def.key),
      });

      result.push({
        key: `${def.key}Rate`,
        label: def.label,
        type: "line",
        color: def.color,
        percent: true,
        yAxisID: "y1",
        tooltipKey: `${def.key}Use`,
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !showLines || hiddenSeriesIds.includes(def.key),
      });
    });

    return result;
  }, [visibleMachineDefs, hiddenSeriesIds, showLines]);

  const hasChartData = monthlyRows.length > 0 && visibleMachineDefs.length > 0;

  return (
    <Row className="g-2">
      <Col xs={12}>
        <div style={LEGEND_WRAP_STYLE}>
          {visibleMachineDefs.map((item) => {
            const isHidden = hiddenSeriesIds.includes(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleSeries(item.key)}
                title={item.label}
                style={{
                  ...LEGEND_BUTTON_STYLE,
                  opacity: isHidden ? 0.4 : 1,
                }}
              >
              <span
                style={{
                  width: 8,
                  height: 8,
                  minWidth: 8,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#444",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    maxWidth: 72,
                    lineHeight: 1.1,
                  }}
                >
                {item.label}
              </span>
              </button>
            );
          })}

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              userSelect: "none",
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 0,
              padding: "2px 6px",
              border: "1px solid #d8d8d8",
              borderRadius: 12,
              backgroundColor: "#fff",
              minHeight: 22,
            }}
          >
            <input
              type="checkbox"
              checked={showLines}
              onChange={(e) => setShowLines(e.target.checked)}
            />
            <span style={{color: "#d11a2a"}}>LINE VIEW</span>
          </label>
        </div>
      </Col>

      <Col xs={12} xl={7} style={{minWidth: 0}}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              height: 20,
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#222",
              marginBottom: 4,
            }}
          >
            가동 현황
          </div>

          <div style={{flex: 1}}>
            {hasChartData ? (
              <CommonMultiComboChart
                rows={monthlyRows}
                title=""
                series={comboSeries}
                chartHeight={180}
                minChartWidth={0}
                customDates={customDates}
                yLeftUnit="(M/C)"
                yRightUnit="기계별 가동율(%)"
                yRightMin={0}
                yRightMax={100}
                columns={1}
                showLegend={false}
                tooltipLineOnly={true}
                hideWeekday={true}
                reverseDates={true}
                showHeader={false}
                endDate={customDates[customDates.length - 1]}
                dateLabelMode="MONTHLY_WITH_TODAY_FULL"
              />
            ) : (
              <div
                style={{
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#666",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                }}
              >
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </Col>

      <Col xs={12} xl={5} style={{minWidth: 0}}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              height: 35,
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#222",
              marginBottom: 4,
            }}
          >
            &nbsp;
          </div>

          <div className={'d-grid'}>
            <KnittingMonthMachineMatrixTable
              rows={monthlyRows}
              machineDefs={visibleMachineDefs}
            />
          </div>
        </div>
      </Col>
    </Row>
  );
});

export default KnittingMachineRateChart;
