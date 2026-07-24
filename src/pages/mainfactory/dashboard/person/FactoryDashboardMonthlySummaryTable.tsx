import React, {memo, CSSProperties, useMemo} from "react";
import {
  formatNumberOrEmpty,
  formatPercentOrEmpty,
  toNum,
} from "@utils/numberUtils";
import DiffArrow from "@components/common/DiffArrow";

export interface MonthlySummaryCell {
  dateKey: string;
  label: string;

  /** 인원 */
  value: number;

  /** 총원 % */
  rate: number;

  /** 전월대비 */
  diffValue: number;
}

export interface MonthlySummaryRow {
  key: string;
  label: string;
  color: string;
  months: MonthlySummaryCell[];
}

interface Props {
  rows: MonthlySummaryRow[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const BORDER_COLOR = "#ccc";
const TOTAL_RED = "#FF0000";

const COL_WIDTHS = {
  category: 90,
  value: 58,
  rate: 44,
  diff: 52,
};

const wrapperStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  display: "grid",
};

const scrollStyle: CSSProperties = {
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
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
  fontSize: 10,
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
  lineHeight: 1.2,
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
  boxShadow: `1px 0 0 ${BORDER_COLOR}`,
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

const FactoryDashboardMonthlySummaryTable = memo(({rows}: Props) => {
  const monthHeaders = useMemo(() => rows?.[0]?.months ?? [], [rows]);

  const totalColSpan =
    1 + (monthHeaders.length === 0 ? 3 : monthHeaders.length * 3);

  return (
    <div style={wrapperStyle}>
      <div style={scrollStyle}>
        <table style={tableStyle}>
          <colgroup>
            <col
              style={{
                width: COL_WIDTHS.category,
                minWidth: COL_WIDTHS.category,
              }}
            />
            {monthHeaders.length === 0 ? (
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
                <col
                  style={{
                    width: COL_WIDTHS.diff,
                    minWidth: COL_WIDTHS.diff,
                  }}
                />
              </>
            ) : (
              monthHeaders.map((month) => (
                <React.Fragment key={month.dateKey}>
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
                  <col
                    style={{
                      width: COL_WIDTHS.diff,
                      minWidth: COL_WIDTHS.diff,
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
              }}
            >
              구분
            </th>

            {monthHeaders.length === 0 ? (
              <th colSpan={3} style={thBaseStyle}>
                -
              </th>
            ) : (
              monthHeaders.map((month) => (
                <th
                  key={month.dateKey}
                  colSpan={3}
                  style={thBaseStyle}
                >
                  {month.label}
                </th>
              ))
            )}
          </tr>

          <tr>
            {monthHeaders.length === 0 ? (
              <>
                <th style={thBaseStyle}>인원</th>
                <th style={thBaseStyle}>%</th>
                <th style={thBaseStyle}>
                  <span style={{color: "#ff0000", fontWeight: 700}}>▲</span>
                  <span style={{color: "#0066ff", fontWeight: 700}}>▼</span>
                </th>
              </>
            ) : (
              monthHeaders.flatMap((month) => [
                <th key={`${month.dateKey}_value`} style={thBaseStyle}>
                  인원
                </th>,
                <th key={`${month.dateKey}_rate`} style={thBaseStyle}>
                  %
                </th>,
                <th key={`${month.dateKey}_diff`} style={thBaseStyle}>
                  <span style={{color: "#ff0000", fontWeight: 700}}>▲</span>
                  <span style={{color: "#0066ff", fontWeight: 700}}>▼</span>
                </th>,
              ])
            )}
          </tr>
          </thead>

          <tbody>
          {rows.length === 0 || monthHeaders.length === 0 ? (
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
            rows.map((row, rowIndex) => {
              const rowBg = rowIndex % 2 === 0 ? BODY_BG : ALT_BODY_BG;
              const isTotalRow = row.label?.toUpperCase() === "TOTAL";

              return (
                <tr key={row.key}>
                  <td
                    style={{
                      ...tdBaseStyle,
                      ...stickyBodyStyle,
                      backgroundColor: rowBg,
                      color: isTotalRow ? TOTAL_RED : "#212529",
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
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: row.color,
                            display: "inline-block",
                            marginRight: 6,
                            flexShrink: 0,
                          }}
                        />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                          maxWidth: 64,
                          fontWeight: 700,
                        }}
                        title={row.label}
                      >
                          {row.label}
                        </span>
                    </div>
                  </td>

                  {row.months.map((month) => {
                    const countValue = toNum(month.value);
                    const rateValue = toNum(month.rate);
                    const diffValue = toNum(month.diffValue);

                    const diffColor =
                      diffValue > 0
                        ? "#ff0000"
                        : diffValue < 0
                          ? "#0066ff"
                          : "#666";

                    const cellTextColor = isTotalRow ? TOTAL_RED : "#212529";

                    return (
                      <React.Fragment key={`${row.key}_${month.dateKey}`}>
                        <td
                          style={{
                            ...tdBaseStyle,
                            backgroundColor: rowBg,
                            color: cellTextColor,
                            fontWeight: isTotalRow ? 700 : 400,
                          }}
                        >
                          {formatNumberOrEmpty(countValue)}
                        </td>

                        <td
                          style={{
                            ...tdBaseStyle,
                            backgroundColor: rowBg,
                            color: cellTextColor,
                            fontWeight: isTotalRow ? 700 : 400,
                          }}
                        >
                          {formatPercentOrEmpty(rateValue)}
                        </td>

                        <td
                          style={{
                            ...tdBaseStyle,
                            backgroundColor: rowBg,
                            color: diffColor,
                            fontWeight: 700,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <DiffArrow value={diffValue} />
                            <span>
                                {diffValue === 0
                                  ? ""
                                  : formatNumberOrEmpty(Math.abs(diffValue))}
                              </span>
                          </div>
                        </td>
                      </React.Fragment>
                    );
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
});

export default FactoryDashboardMonthlySummaryTable;
