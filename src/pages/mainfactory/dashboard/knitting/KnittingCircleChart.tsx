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
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import KnittingTodayMachineStatusTable, {
  KnittingTodayMachineStatusRow,
} from "@pages/mainfactory/dashboard/knitting/KnittingTodayMachineStatusTable";
import KnittingMonthOperationStatusTable, {
  KnittingMonthOperationStatusRow,
} from "@pages/mainfactory/dashboard/knitting/KnittingMonthOperationStatusTable";

type PeriodType = "TODAY" | "MONTH";
type FieldKey = string | string[];

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyKnittingRes[];
  selectedTab: FactoryDashboardTab;
  period?: PeriodType;
}

type MachineTypeRow = {
  key: string;
  label: string;
  code: string;
  keep: number;
  use: number;
  keepRate: number;
  useRate: number;
  color: string;
};

type MachineTypeDef = {
  key: string;
  label: string;
  codeField: FieldKey;
  keepField: FieldKey;
  monthUseField: FieldKey;
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

  const list = Array.isArray(keys) ? keys : [keys];

  for (const key of list) {
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

const MACHINE_TYPE_DEFS: MachineTypeDef[] = [
  {
    key: "single",
    label: "SINGLE",
    codeField: "cdSingle",
    keepField: "qtySingleKeep",
    monthUseField: "qtySingleUse",
    todayRateField: "ratSingleKeep",
    monthRateField: "ratSingleUse",
    defaultCode: "01",
    color: "#4e79a7",
  },
  {
    key: "frenchTerry",
    label: "F.TERRY",
    codeField: "cdFrenchTerry",
    keepField: "qtyFrenchTerryKeep",
    monthUseField: "qtyFrenchTerryUse",
    todayRateField: "ratFrenchTerryKeep",
    monthRateField: "ratFrenchTerryUse",
    defaultCode: "02",
    color: "#f28e2b",
  },
  {
    key: "rib",
    label: "RIB",
    codeField: "cdRib",
    keepField: "qtyRibKeep",
    monthUseField: "qtyRibUse",
    todayRateField: "ratRibKeep",
    monthRateField: "ratRibUse",
    defaultCode: "03",
    color: "#e15759",
  },
  {
    key: "double",
    label: "DOUBLE",
    codeField: ["cdDouble", "cdDoble"],
    keepField: ["qtyDoubleKeep", "qtyDobleKeep"],
    monthUseField: ["qtyDoubleUse", "qtyDobleUse"],
    todayRateField: ["ratDoubleKeep", "ratDobleKeep"],
    monthRateField: ["ratDoubleUse", "ratDobleUse"],
    defaultCode: "04",
    color: "#8a63d2",
  },
  {
    key: "jacquardDouble",
    label: "J/DOUBLE",
    codeField: "cdJacquardDouble",
    keepField: "qtyJacquardDoubleKeep",
    monthUseField: "qtyJacquardDoubleUse",
    todayRateField: "ratJacquardDoubleKeep",
    monthRateField: "ratJacquardDoubleUse",
    defaultCode: "05",
    color: "#76b7b2",
  },
  {
    key: "jacquardSingle",
    label: "J/SINGLE",
    codeField: "cdJacquardSingle",
    keepField: "qtyJacquardSingleKeep",
    monthUseField: "qtyJacquardSingleUse",
    todayRateField: "ratJacquardSingleKeep",
    monthRateField: "ratJacquardSingleUse",
    defaultCode: "06",
    color: "#59a14f",
  },
  {
    key: "jacquardZurry",
    label: "ZURRY",
    codeField: "cdJacquardZurry",
    keepField: "qtyJacquardZurryKeep",
    monthUseField: "qtyJacquardZurryUse",
    todayRateField: "ratJacquardZurryKeep",
    monthRateField: "ratJacquardZurryUse",
    defaultCode: "07",
    color: "#edc948",
  },
  {
    key: "engStriper",
    label: "ENG",
    codeField: "cdEngStriper",
    keepField: "qtyEngStriperKeep",
    monthUseField: "qtyEngStriperUse",
    todayRateField: "ratEngStriperKeep",
    monthRateField: "ratEngStriperUse",
    defaultCode: "08",
    color: "#b07aa1",
  },
  {
    key: "smallDouble",
    label: "S/DOUBLE",
    codeField: "cdSmallDouble",
    keepField: "qtySmallDoubleKeep",
    monthUseField: "qtySmallDoubleUse",
    todayRateField: "ratSmallDoubleKeep",
    monthRateField: "ratSmallDoubleUse",
    defaultCode: "09",
    color: "#ff9da7",
  },
  {
    key: "smallSingle",
    label: "S/SINGLE",
    codeField: "cdSmallSingle",
    keepField: "qtySmallSingleKeep",
    monthUseField: "qtySmallSingleUse",
    todayRateField: "ratSmallSingleKeep",
    monthRateField: "ratSmallSingleUse",
    defaultCode: "10",
    color: "#9c755f",
  },
  {
    key: "velour",
    label: "VELOUR",
    codeField: ["cdVelour", "cdVelourUse"],
    keepField: "qtyVelourKeep",
    monthUseField: "qtyVelourUse",
    todayRateField: "ratVelourKeep",
    monthRateField: "ratVelourUse",
    defaultCode: "11",
    color: "#bab0ab",
  },
  {
    key: "raschel",
    label: "RASCHEL",
    codeField: ["cdRashel", "cdRaschel"],
    keepField: ["qtyRashelKeep", "qtyRaschelKeep"],
    monthUseField: ["qtyRashelUse", "qtyRaschelUse"],
    todayRateField: ["ratRashelKeep", "ratRaschelKeep"],
    monthRateField: ["ratRashelUse", "ratRaschelUse"],
    defaultCode: "12",
    color: "#7f7f7f",
  },
];

const getPrimaryBizarea = (
  rows: FactoryDashboardDailyKnittingRes[],
  period: PeriodType
) => {
  const periodRows = (rows || []).filter((row) => {
    const rowAny = row as any;
    return period === "TODAY"
      ? isTodayRow(rowAny?.sw)
      : isMonthRow(rowAny?.sw);
  });

  const sourceRows = periodRows.length > 0 ? periodRows : rows;
  const counter = new Map<string, number>();

  sourceRows.forEach((row) => {
    const rowAny = row as any;
    const bizarea = String(rowAny?.cdBizarea || "");
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
  rows: FactoryDashboardDailyKnittingRes[];
  period: PeriodType;
  primaryBizarea: string;
}) => {
  const filtered = (rows || [])
    .filter((row) => {
      const rowAny = row as any;
      const rowBizarea = String(rowAny?.cdBizarea || "");

      if (period === "TODAY" && !isTodayRow(rowAny?.sw)) return false;
      if (period === "MONTH" && !isMonthRow(rowAny?.sw)) return false;
      if (primaryBizarea && rowBizarea !== primaryBizarea) return false;

      return true;
    })
    .sort((a, b) => {
      const aDate = normalizeDateKey((a as any)?.dtsWork);
      const bDate = normalizeDateKey((b as any)?.dtsWork);
      return aDate.localeCompare(bDate);
    });

  return (filtered[filtered.length - 1] as any) || null;
};

const KnittingCircleChart = memo((props: Props) => {
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

  const machineRows = useMemo<MachineTypeRow[]>(() => {
    if (!targetRow) return [];

    const cntDay = toNum(getFieldValue(targetRow, ["cntDay", "cnDay"]));

    return MACHINE_TYPE_DEFS.map((def) => {
      const code = String(
        getFieldValue(targetRow, def.codeField) ?? def.defaultCode ?? ""
      );

      const rawKeep = toNum(getFieldValue(targetRow, def.keepField));
      const rawUse = toNum(getFieldValue(targetRow, def.monthUseField));
      const rawUseRate = toNum(getFieldValue(targetRow, def.monthRateField));
      const rawRate = toNum(getFieldValue(targetRow, def.monthRateField));
      if (period === "TODAY") {
        return {
          key: def.key,
          label: def.label,
          code,
          keep: rawKeep,                                          // qtySingleKeep
          use: rawUse,                                            // qtySingleUse
          keepRate: toNum(getFieldValue(targetRow, def.todayRateField)), // ratSingleKeep
          useRate: rawUseRate,                                    // ratSingleUse
          color: def.color,
        };
      }

      return {
        key: def.key,
        label: def.label,
        code,
        keep: safeDivide(rawKeep, cntDay, 1),
        use: safeDivide(rawUse, cntDay, 1),
        keepRate: rawRate,
        useRate: rawUseRate,
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

  const todayTableRows = useMemo<KnittingTodayMachineStatusRow[]>(() => {
    return machineRows.map((item) => ({
      key: item.key,
      label: item.label,
      code: item.code,
      keepValue: item.keep,
      rateValue: item.keepRate,       // 보유 %
      useValue: item.use,             // 가동 대수 = qtySingleUse
      useRateValue: item.useRate,     // 가동 %   = ratSingleUse
      color: item.color,
    }));
  }, [machineRows]);

  const monthTableRows = useMemo<KnittingMonthOperationStatusRow[]>(() => {
    return machineRows.map((item) => ({
      key: item.key,
      label: item.label,
      code: item.code,
      keepValue: item.keep,
      useValue: item.use,
      rateValue: item.keepRate,
      color: item.color,
    }));
  }, [machineRows]);

  const totalTodayUseRate = useMemo(() => {
    if (period !== "TODAY" || !targetRow) return undefined;
    return toNum((targetRow as any)?.ratMachine);
  }, [period, targetRow]);
  return (
    <Card className="h-100 mt-n4">
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
                        maxWidth: 64,
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
                          maxWidth: 52,
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
              <KnittingTodayMachineStatusTable
                title={chartTitle}
                rows={todayTableRows}
                totalUseRate={totalTodayUseRate}
              />
            ) : (
              <KnittingMonthOperationStatusTable
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

export default KnittingCircleChart;
