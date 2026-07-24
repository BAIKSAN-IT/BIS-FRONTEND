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
  FactoryDashboardDailyDyeingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import DyeingMonthMachineMatrixTable from "@pages/mainfactory/dashboard/dyeing/DyeingMonthMachineMatrixTable";

type PeriodType = "TODAY" | "MONTH";
type FieldKey = string | string[];

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyDyeingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

export type DyeingMachineDef = {
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

const MACHINE_TYPE_DEFS: DyeingMachineDef[] = [
  {
    key: "normalPress499",
    label: "상압 0~499",
    keepFields: "qtyNormalPress499",
    useFields: ["qtyNormalPress499Use", "qtynormalPress499Use"],
    rateFields: "ratNormalPress499Use",
    color: "#4e79a7",
  },
  {
    key: "normalPress999",
    label: "상압 500~999",
    keepFields: "qtyNormalPress999",
    useFields: ["qtyNormalPress999Use", "qtynormalPress999Use"],
    rateFields: "ratNormalPress999Use",
    color: "#f28e2b",
  },
  {
    key: "normalPress1000",
    label: "상압 1000~",
    keepFields: "qtyNormalPress1000",
    useFields: ["qtyNormalPress1000Use", "qtynormalPress1000Use"],
    rateFields: "ratNormalPress1000Use",
    color: "#e15759",
  },
  {
    key: "normalHighPress499",
    label: "상고압 0~499",
    keepFields: "qtyNormalHighPress499",
    useFields: ["qtyNormalHighPress499Use", "qtynormalHighPress499Use"],
    rateFields: "ratNormalHighPress499Use",
    color: "#76b7b2",
  },
  {
    key: "normalHighPress999",
    label: "상고압 500~999",
    keepFields: "qtyNormalHighPress999",
    useFields: ["qtyNormalHighPress999Use", "qtynormalHighPress999Use"],
    rateFields: "ratNormalHighPress999Use",
    color: "#59a14f",
  },
  {
    key: "normalHighPress1000",
    label: "상고압 1000~",
    keepFields: "qtyNormalHighPress1000",
    useFields: ["qtyNormalHighPress1000Use", "qtynormalHighPress1000Use"],
    rateFields: "ratNormalHighPress1000Use",
    color: "#edc948",
  },
  {
    key: "highPress499",
    label: "고압 0~499",
    keepFields: "qtyHighPress499",
    useFields: "qtyHighPress499Use",
    rateFields: "ratHighPress499Use",
    color: "#b07aa1",
  },
  {
    key: "highPress999",
    label: "고압 500~999",
    keepFields: "qtyHighPress999",
    useFields: "qtyHighPress999Use",
    rateFields: "ratHighPress999Use",
    color: "#ff9da7",
  },
  {
    key: "highPress1000",
    label: "고압 1000~",
    keepFields: "qtyHighPress1000",
    useFields: "qtyHighPress1000Use",
    rateFields: "ratHighPress1000Use",
    color: "#9c755f",
  },
  {
    key: "sample",
    label: "SAMPLE",
    keepFields: "qtySample",
    useFields: "qtySampleUse",
    rateFields: "ratSampleUse",
    color: "#bab0ab",
  },
];

const getPrimaryBizarea = (rows: FactoryDashboardDailyDyeingRes[]) => {
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

const getLatestFullDate = (rows: FactoryDashboardDailyDyeingRes[]) => {
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

const DyeingMachineRateChart = memo((props: Props) => {
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
    const monthBuckets = new Map<string, FactoryDashboardDailyDyeingRes[]>();

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

  const visibleMachineDefs = useMemo<DyeingMachineDef[]>(() => {
    return MACHINE_TYPE_DEFS.filter((def) => {
      return monthlyRows.some((row) => {
        const useValue = toNum(row[`${def.key}Use`]);
        const rateValue = toNum(row[`${def.key}Rate`]);
        return useValue > 0 || rateValue > 0;
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
    <Row className="align-items-stretch d-flex flex-wrap mt-n4">
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
            fontSize: 11,
            fontWeight: 700,
            color: "#222",
            lineHeight: 1.2,
          }}
        >
          가동 현황
        </div>

        {hasChartData ? (
          <CommonMultiComboChart
            rows={monthlyRows}
            title=""
            series={comboSeries}
            chartHeight={190}
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
              height: 190,
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
      </Col>

      <Col className={'d-grid'} xs={12} xl={5} style={{minWidth: 0}}>
        <DyeingMonthMachineMatrixTable
          rows={monthlyRows}
          machineDefs={visibleMachineDefs}
        />
      </Col>
    </Row>
  );
});

export default DyeingMachineRateChart;
