import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {Card} from "react-bootstrap";
import CommonDonutSummaryChart, {
  DonutSegment,
} from "@components/chart/CommonDonutSummaryChart";
import {
  FactoryDashboardDailyDyeingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import DyeingTodayMachineStatusTable, {
  DyeingTodayMachineStatusRow,
} from "@pages/mainfactory/dashboard/dyeing/DyeingTodayMachineStatusTable";
import DyeingMonthOperationStatusTable, {
  DyeingMonthOperationStatusRow,
} from "@pages/mainfactory/dashboard/dyeing/DyeingMonthOperationStatusTable";

type PeriodType = "TODAY" | "MONTH";
type FieldKey = string | string[];

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyDyeingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

type MachineRow = {
  key: string;
  label: string;
  code: string;
  keep: number;
  use: number;
  keepRate?: number;
  useRate?: number;
  color: string;
};

type MachineTypeDef = {
  key: string;
  label: string;
  codeField: FieldKey;
  keepField: FieldKey;
  useField: FieldKey;
  todayRateField?: FieldKey;
  monthRateField?: FieldKey;
  defaultCode: string;
  color: string;
};

const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeDateKey = (value?: string) =>
  String(value || "").replace(/[^0-9]/g, "");

const isTodayRow = (sw?: string) =>
  String(sw || "").trim().toUpperCase() === "D";

const isMonthRow = (sw?: string) =>
  String(sw || "").trim().toUpperCase() === "M";

const getFieldValue = (row: any, keys?: FieldKey) => {
  if (!row || !keys) return undefined;

  const keyList = Array.isArray(keys) ? keys : [keys];

  for (const key of keyList) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const safeDivide = (value: number, divisor: number, digit = 1) => {
  if (!Number.isFinite(value) || !Number.isFinite(divisor) || divisor === 0) {
    return 0;
  }

  const pow = Math.pow(10, digit);
  return Math.round((value / divisor) * pow) / pow;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

const calcPercent = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) {
    return 0;
  }

  return round1((value / total) * 100);
};

const MACHINE_TYPE_DEFS: MachineTypeDef[] = [
  {
    key: "normalPress499",
    label: "상압 0~499",
    codeField: "cdNormalPress499",
    keepField: "qtyNormalPress499",
    useField: ["qtyNormalPress499Use", "qtynormalPress499Use"],
    todayRateField: "ratNormalPress499",
    monthRateField: "ratNormalPress499Use",
    defaultCode: "01",
    color: "#4e79a7",
  },
  {
    key: "normalPress999",
    label: "상압 500~999",
    codeField: "cdNormalPress999",
    keepField: "qtyNormalPress999",
    useField: ["qtyNormalPress999Use", "qtynormalPress999Use"],
    todayRateField: "ratNormalPress999",
    monthRateField: "ratNormalPress999Use",
    defaultCode: "02",
    color: "#f28e2b",
  },
  {
    key: "normalPress1000",
    label: "상압 1000~",
    codeField: "cdNormalPress1000",
    keepField: "qtyNormalPress1000",
    useField: ["qtyNormalPress1000Use", "qtynormalPress1000Use"],
    todayRateField: "ratNormalPress1000",
    monthRateField: "ratNormalPress1000Use",
    defaultCode: "03",
    color: "#e15759",
  },
  {
    key: "normalHighPress499",
    label: "상고압 0~499",
    codeField: "cdNormalHighPress499",
    keepField: "qtyNormalHighPress499",
    useField: ["qtyNormalHighPress499Use", "qtynormalHighPress499Use"],
    todayRateField: "ratNormalHighPress499",
    monthRateField: "ratNormalHighPress499Use",
    defaultCode: "04",
    color: "#76b7b2",
  },
  {
    key: "normalHighPress999",
    label: "상고압 500~999",
    codeField: "cdNormalHighPress999",
    keepField: "qtyNormalHighPress999",
    useField: ["qtyNormalHighPress999Use", "qtynormalHighPress999Use"],
    todayRateField: "ratNormalHighPress999",
    monthRateField: "ratNormalHighPress999Use",
    defaultCode: "05",
    color: "#59a14f",
  },
  {
    key: "normalHighPress1000",
    label: "상고압 1000~",
    codeField: "cdNormalHighPress1000",
    keepField: "qtyNormalHighPress1000",
    useField: ["qtyNormalHighPress1000Use", "qtynormalHighPress1000Use"],
    todayRateField: "ratNormalHighPress1000",
    monthRateField: "ratNormalHighPress1000Use",
    defaultCode: "06",
    color: "#edc948",
  },
  {
    key: "highPress499",
    label: "고압 0~499",
    codeField: "cdHighPress499",
    keepField: "qtyHighPress499",
    useField: "qtyHighPress499Use",
    todayRateField: "ratHighPress499",
    monthRateField: "ratHighPress499Use",
    defaultCode: "07",
    color: "#b07aa1",
  },
  {
    key: "highPress999",
    label: "고압 500~999",
    codeField: "cdHighPress999",
    keepField: "qtyHighPress999",
    useField: "qtyHighPress999Use",
    todayRateField: "ratHighPress999",
    monthRateField: "ratHighPress999Use",
    defaultCode: "08",
    color: "#ff9da7",
  },
  {
    key: "highPress1000",
    label: "고압 1000~",
    codeField: "cdHighPress1000",
    keepField: "qtyHighPress1000",
    useField: "qtyHighPress1000Use",
    todayRateField: "ratHighPress1000",
    monthRateField: "ratHighPress1000Use",
    defaultCode: "09",
    color: "#9c755f",
  },
  {
    key: "sample",
    label: "SAMPLE",
    codeField: "cdSample",
    keepField: "qtySample",
    useField: "qtySampleUse",
    todayRateField: ["ratQtySample", "ratSample"],
    monthRateField: "ratSampleUse",
    defaultCode: "10",
    color: "#bab0ab",
  },
];

const getPrimaryBizarea = (
  rows: FactoryDashboardDailyDyeingRes[],
  period: PeriodType
) => {
  const periodRows = (rows || []).filter((row) => {
    return period === "TODAY" ? isTodayRow(row?.sw) : isMonthRow(row?.sw);
  });

  const sourceRows = periodRows.length > 0 ? periodRows : rows;
  const counter = new Map<string, number>();

  sourceRows.forEach((row) => {
    const bizarea = String(row?.cdBizarea || "");
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

const getLatestTargetRow = ({
                              rows,
                              period,
                              primaryBizarea,
                            }: {
  rows: FactoryDashboardDailyDyeingRes[];
  period: PeriodType;
  primaryBizarea: string;
}) => {
  const filtered = (rows || [])
    .filter((row) => {
      const rowBizarea = String(row?.cdBizarea || "");

      if (period === "TODAY" && !isTodayRow(row?.sw)) return false;
      if (period === "MONTH" && !isMonthRow(row?.sw)) return false;
      if (primaryBizarea && rowBizarea !== primaryBizarea) return false;

      return true;
    })
    .sort((a, b) => {
      const aDate = normalizeDateKey(a?.dtsWork);
      const bDate = normalizeDateKey(b?.dtsWork);
      return aDate.localeCompare(bDate);
    });

  return filtered[filtered.length - 1] || null;
};

const DyeingCircleChart = memo((props: Props) => {
  const {refs, rows, selectedTab, period = "TODAY"} = props;
  void refs;
  void selectedTab;

  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  const primaryBizarea = useMemo(
    () => getPrimaryBizarea(rows, period),
    [rows, period]
  );

  const targetRow = useMemo(() => {
    return getLatestTargetRow({
      rows,
      period,
      primaryBizarea,
    });
  }, [rows, period, primaryBizarea]);

  const machineRows = useMemo<MachineRow[]>(() => {
    if (!targetRow) return [];

    const cntDay = toNum(getFieldValue(targetRow, "cntDay"));

    const totalKeepToday = MACHINE_TYPE_DEFS.reduce((sum, def) => {
      return sum + toNum(getFieldValue(targetRow, def.keepField));
    }, 0);

    return MACHINE_TYPE_DEFS.map((def) => {
      const code = String(
        getFieldValue(targetRow, def.codeField) ?? def.defaultCode
      );

      const rawKeep = toNum(getFieldValue(targetRow, def.keepField));
      const rawUse = toNum(getFieldValue(targetRow, def.useField));

      if (period === "TODAY") {
        return {
          key: def.key,
          label: def.label,
          code,
          keep: rawKeep,
          use: rawUse,
          keepRate: calcPercent(rawKeep, totalKeepToday),
          useRate: toNum(getFieldValue(targetRow, def.monthRateField)),
          color: def.color,
        };
      }

      return {
        key: def.key,
        label: def.label,
        code,
        keep: safeDivide(rawKeep, cntDay, 1),
        use: safeDivide(rawUse, cntDay, 1),
        useRate: toNum(getFieldValue(targetRow, def.monthRateField)),
        color: def.color,
      };
    });
  }, [targetRow, period]);

  useEffect(() => {
    setHiddenKeys([]);
  }, [period, primaryBizarea, targetRow]);

  const visibleMachineRows = useMemo(() => {
    return machineRows.filter((item) => !hiddenKeys.includes(item.key));
  }, [machineRows, hiddenKeys]);

  const toggleLegend = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  }, []);

  const chartTitle = period === "TODAY" ? "기계 현황" : "가동 현황";

  const donutSegments = useMemo<DonutSegment[]>(() => {
    return visibleMachineRows.map((item) => ({
      key: item.key,
      label: item.label,
      value: Math.round(toNum(period === "TODAY" ? item.keep : item.use)),
      color: item.color,
    }));
  }, [visibleMachineRows, period]);

  const centerValue = useMemo(() => {
    return visibleMachineRows.reduce((sum, item) => {
      const value = period === "TODAY" ? item.keep : item.use;
      return sum + Math.round(toNum(value));
    }, 0);
  }, [visibleMachineRows, period]);

  const todayTableRows = useMemo<DyeingTodayMachineStatusRow[]>(() => {
    return machineRows.map((item) => ({
      key: item.key,
      label: item.label,
      code: item.code,
      qtyValue: item.keep,
      keepRateValue: item.keepRate,
      useValue: item.use,
      useRateValue: item.useRate,
      rateValue: item.useRate,
      color: item.color,
    }));
  }, [machineRows]);

  const monthTableRows = useMemo<DyeingMonthOperationStatusRow[]>(() => {
    return machineRows.map((item) => ({
      key: item.key,
      label: item.label,
      code: item.code,
      keepValue: item.keep,
      useValue: item.use,
      rateValue: item.useRate ?? 0,
      color: item.color,
    }));
  }, [machineRows]);

  const totalTodayUseRate = useMemo(() => {
    if (period !== "TODAY" || !targetRow) return undefined;
    return toNum((targetRow as any)?.ratMachine);
  }, [period, targetRow]);

  return (
    <Card className="h-100 mt-n5">
      <Card.Body style={{padding: "6px 8px"}}>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "stretch",
            width: "100%",
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "0 1 300px",
              minWidth: 200,
              minHeight: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "flex-start",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#222",
                textAlign: "center",
                marginBottom: 2,
                lineHeight: 1.2,
              }}
            >
              {chartTitle}
            </div>

            <div
              style={{
                width: "100%",
                minWidth: 0,
                overflowX: "hidden",
                overflowY: "hidden",
              }}
            >
              {donutSegments.length > 0 ? (
                <CommonDonutSummaryChart
                  title=""
                  showLegend={false}
                  centerValue={centerValue}
                  centerLabel=""
                  segments={donutSegments}
                  height={210}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  {machineRows.length > 0
                    ? "범례에서 모두 숨김"
                    : "데이터가 없습니다."}
                </div>
              )}
            </div>

            {machineRows.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "3px 6px",
                  marginTop: 2,
                  padding: "0 2px",
                  minHeight: 26,
                }}
              >
                {machineRows.map((item) => {
                  const isHidden = hiddenKeys.includes(item.key);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleLegend(item.key)}
                      title={item.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        margin: 0,
                        cursor: "pointer",
                        opacity: isHidden ? 0.35 : 1,
                        maxWidth: 72,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          minWidth: 7,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          color: "#444",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "inline-block",
                          maxWidth: 60,
                          lineHeight: 1.1,
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              flex: "1 1 310px",
              minWidth: 120,
              overflowX: "auto",
            }}
          >
            {period === "TODAY" ? (
              <DyeingTodayMachineStatusTable
                title={chartTitle}
                rows={todayTableRows}
                totalUseRate={totalTodayUseRate}
              />
            ) : (
              <DyeingMonthOperationStatusTable
                title={chartTitle}
                rows={monthTableRows}
              />
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});

export default DyeingCircleChart;
