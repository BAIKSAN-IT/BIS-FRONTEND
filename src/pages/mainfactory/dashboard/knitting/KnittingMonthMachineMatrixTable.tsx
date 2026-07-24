import React, {memo, useMemo, CSSProperties} from "react";
import {KnittingMachineDef} from "@pages/mainfactory/dashboard/knitting/KnittingMachineRateChart";
import {
  formatDateHeaderLabel,
  formatPercent,
  normalizeMonthDate,
  toNum,
} from "@utils/numberUtils";

export type MonthMachineRow = {
  dtsWork?: string;
  [key: string]: string | number | undefined;
};

interface Props {
  title?: string;
  rows: MonthMachineRow[];
  machineDefs: Pick<KnittingMachineDef, "key" | "label" | "color">[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const BORDER_COLOR = "#ccc";
const DIVIDER_BORDER = "1px solid #aaa";

const COL_WIDTHS = {
  category: 130,
  keep: 76,
  value: 76,
  rate: 58,
};

const wrapperStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
};

const scrollStyle: CSSProperties = {
  width: "100%",
  overflowX: "auto",
  overflowY: "visible",
  position: "relative",
  backgroundColor: "#fff",
  border: `1px solid ${BORDER_COLOR}`,
};

const tableStyle: CSSProperties = {
  width: "max-content",
  minWidth: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
  fontSize: 9,
  margin: 0,
};

const thBaseStyle: CSSProperties = {
  backgroundColor: HEADER_BG,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderRight: `1px solid ${BORDER_COLOR}`,
  borderBottom: `1px solid ${BORDER_COLOR}`,
  fontWeight: 700,
};

const tdBaseStyle: CSSProperties = {
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderRight: `1px solid ${BORDER_COLOR}`,
  borderBottom: `1px solid ${BORDER_COLOR}`,
  lineHeight: 1.2,
};

const stickyHeaderStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 20,
  minWidth: COL_WIDTHS.category,
  width: COL_WIDTHS.category,
  maxWidth: COL_WIDTHS.category,
  backgroundColor: HEADER_BG,
};

const stickyBodyStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 10,
  minWidth: COL_WIDTHS.category,
  width: COL_WIDTHS.category,
  maxWidth: COL_WIDTHS.category,
  fontWeight: 700,
  textAlign: "left",
  padding: "4px 8px",
};

const roundInt = (value: any) => Math.round(toNum(value));

const formatRoundedInt = (value: any, emptyWhenZero = false) => {
  const rounded = roundInt(value);
  if (emptyWhenZero && rounded === 0) return "";
  return String(rounded);
};

const getMetricValue = (
  row: MonthMachineRow | undefined,
  fieldName: string
): number => {
  if (!row) return 0;
  return toNum(row[fieldName]);
};

const getKeepValueFromRows = (
  rows: MonthMachineRow[],
  machineKey: string
): number => {
  for (const row of rows || []) {
    const value = row?.[`${machineKey}Keep`];
    if (value !== undefined && value !== null && String(value) !== "") {
      return toNum(value);
    }
  }
  return 0;
};

const calcDisplayRate = (useValue: number, keepValue: number) => {
  const displayKeep = Math.round(toNum(keepValue));
  const displayUse = Math.round(toNum(useValue));

  if (displayKeep === 0) return 0;
  return (displayUse / displayKeep) * 100;
};

const KnittingMonthMachineMatrixTable = memo(
  ({title = "", rows, machineDefs}: Props) => {
    const displayDates = useMemo(() => {
      return Array.from(
        new Set(
          (rows || [])
            .map((row) => normalizeMonthDate(row.dtsWork))
            .filter((v) => v.length === 8)
        )
      ).sort((a, b) => b.localeCompare(a));
    }, [rows]);

    const rowMapByDate = useMemo(() => {
      const map = new Map<string, MonthMachineRow>();

      (rows || []).forEach((row) => {
        const dtsWork = normalizeMonthDate(row.dtsWork);
        if (dtsWork.length === 8) {
          map.set(dtsWork, {
            ...row,
            dtsWork,
          });
        }
      });

      return map;
    }, [rows]);

    const keepValueMap = useMemo(() => {
      const map = new Map<string, number>();

      machineDefs.forEach((machine) => {
        map.set(machine.key, getKeepValueFromRows(rows, machine.key));
      });

      return map;
    }, [rows, machineDefs]);

    const totalColSpan =
      2 + (displayDates.length === 0 ? 2 : displayDates.length * 2);

    return (
      <div style={wrapperStyle}>
        {!!title && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#222",
              textAlign: "center",
              marginBottom: 4,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
        )}

        <div style={scrollStyle}>
          <table style={tableStyle}>
            <colgroup>
              <col
                style={{
                  width: COL_WIDTHS.category,
                  minWidth: COL_WIDTHS.category,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.keep,
                  minWidth: COL_WIDTHS.keep,
                }}
              />
              {displayDates.length === 0 ? (
                <>
                  <col
                    style={{
                      width: COL_WIDTHS.value,
                      minWidth: COL_WIDTHS.value,
                    }}
                  />
                  <col
                    style={{
                      width: COL_WIDTHS.rate,
                      minWidth: COL_WIDTHS.rate,
                    }}
                  />
                </>
              ) : (
                displayDates.map((dateKey) => (
                  <React.Fragment key={dateKey}>
                    <col
                      style={{
                        width: COL_WIDTHS.value,
                        minWidth: COL_WIDTHS.value,
                      }}
                    />
                    <col
                      style={{
                        width: COL_WIDTHS.rate,
                        minWidth: COL_WIDTHS.rate,
                      }}
                    />
                  </React.Fragment>
                ))
              )}
            </colgroup>

            <thead>
            <tr>
              <th
                rowSpan={2}
                style={{
                  ...thBaseStyle,
                  ...stickyHeaderStyle,
                  borderRight: DIVIDER_BORDER,
                }}
              >
                구분
              </th>

              <th
                rowSpan={2}
                style={{
                  ...thBaseStyle,
                  width: COL_WIDTHS.keep,
                  minWidth: COL_WIDTHS.keep,
                  borderRight: DIVIDER_BORDER,
                }}
              >
                보유
              </th>

              {displayDates.length === 0 ? (
                <th
                  colSpan={2}
                  style={{
                    ...thBaseStyle,
                    borderRight: DIVIDER_BORDER,
                  }}
                >
                  -
                </th>
              ) : (
                displayDates.map((dateKey, index) => (
                  <th
                    key={dateKey}
                    colSpan={2}
                    style={{
                      ...thBaseStyle,
                      borderRight: DIVIDER_BORDER,
                    }}
                  >
                    {formatDateHeaderLabel(dateKey, index)}
                  </th>
                ))
              )}
            </tr>

            <tr>
              {displayDates.length === 0 ? (
                <>
                  <th style={thBaseStyle}>가동</th>
                  <th
                    style={{
                      ...thBaseStyle,
                      borderRight: DIVIDER_BORDER,
                    }}
                  >
                    %
                  </th>
                </>
              ) : (
                displayDates.flatMap((dateKey) => [
                  <th key={`${dateKey}_value`} style={thBaseStyle}>
                    가동
                  </th>,
                  <th
                    key={`${dateKey}_rate`}
                    style={{
                      ...thBaseStyle,
                      borderRight: DIVIDER_BORDER,
                    }}
                  >
                    %
                  </th>,
                ])
              )}
            </tr>
            </thead>

            <tbody>
            {machineDefs.length === 0 || displayDates.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  style={{
                    ...tdBaseStyle,
                    backgroundColor: BODY_BG,
                    padding: "10px 6px",
                    textAlign: "center",
                  }}
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              machineDefs.map((machine, rowIndex) => {
                const rowBg = rowIndex % 2 === 0 ? BODY_BG : ALT_BODY_BG;
                const keepValue = keepValueMap.get(machine.key) ?? 0;
                const displayKeep = Math.round(toNum(keepValue));

                return (
                  <tr key={machine.key}>
                    <td
                      style={{
                        ...tdBaseStyle,
                        ...stickyBodyStyle,
                        backgroundColor: rowBg,
                        borderRight: DIVIDER_BORDER,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        {machine.color && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: machine.color,
                              display: "inline-block",
                              marginRight: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            maxWidth: 100,
                          }}
                          title={machine.label}
                        >
                            {machine.label}
                          </span>
                      </div>
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle,
                        backgroundColor: rowBg,
                        fontWeight: 700,
                        borderRight: DIVIDER_BORDER,
                      }}
                    >
                      {displayKeep === 0 ? "" : String(displayKeep)}
                    </td>

                    {displayDates.flatMap((dateKey) => {
                      const dateRow = rowMapByDate.get(dateKey);
                      const useValue = getMetricValue(
                        dateRow,
                        `${machine.key}Use`
                      );

                      const displayUse = Math.round(toNum(useValue));
                      const displayRate = calcDisplayRate(
                        displayUse,
                        displayKeep
                      );

                      return [
                        <td
                          key={`${machine.key}_${dateKey}_value`}
                          style={{
                            ...tdBaseStyle,
                            backgroundColor: rowBg,
                          }}
                        >
                          <div style={{fontWeight: 700}}>
                            {formatRoundedInt(displayUse)}
                          </div>
                        </td>,
                        <td
                          key={`${machine.key}_${dateKey}_rate`}
                          style={{
                            ...tdBaseStyle,
                            backgroundColor: rowBg,
                            borderRight: DIVIDER_BORDER,
                          }}
                        >
                          <div style={{fontWeight: 700}}>
                            {formatPercent(displayRate, 1)}
                          </div>
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default KnittingMonthMachineMatrixTable;
