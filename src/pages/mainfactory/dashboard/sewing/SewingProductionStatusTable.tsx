import React, {memo, useMemo, CSSProperties} from "react";
import {FactoryDashboardDailySewingRes} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {normalizeDate} from "@utils/numberUtils";
import DiffArrow from "@components/common/DiffArrow";

interface Props {
  rows: FactoryDashboardDailySewingRes[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const BORDER_COLOR = "#aaa";

const TABLE_HEIGHT = 145;

const COL_WIDTHS = {
  category: 78,
  target: 62,
  actual: 92,
  rate: 48,
  diff: 72,
};

const wrapperStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
};

const scrollStyle: CSSProperties = {
  width: "100%",
  height: TABLE_HEIGHT,
  minHeight: TABLE_HEIGHT,
  maxHeight: TABLE_HEIGHT,
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
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

const tdSoftDividerStyle: CSSProperties = {
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderBottom: `1px solid ${BORDER_COLOR}`,
  borderRight: "1px solid #ddd",
  lineHeight: 1.2,
};

const stickyHeaderStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 30,
  minWidth: COL_WIDTHS.category,
  width: COL_WIDTHS.category,
  maxWidth: COL_WIDTHS.category,
  backgroundColor: HEADER_BG,
  borderRight: `1px solid ${BORDER_COLOR}`,
};

const stickyBodyStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 20,
  minWidth: COL_WIDTHS.category,
  width: COL_WIDTHS.category,
  maxWidth: COL_WIDTHS.category,
  fontWeight: 700,
  textAlign: "center",
  padding: "4px 8px",
  whiteSpace: "nowrap",
};

const titleCellTextStyle: CSSProperties = {
  whiteSpace: "nowrap",
  lineHeight: 1.15,
  fontSize: 10,
  fontWeight: 700,
};

const toNum = (value: any) => Number(value) || 0;

const formatDateLabel = (value?: string) => {
  const onlyNum = String(value || "").replace(/[^0-9]/g, "").slice(0, 8);
  if (onlyNum.length !== 8) return "";
  return onlyNum.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3");
};

const formatNumberOrEmpty = (value?: number) => {
  const num = Number(value || 0);
  if (num === 0) return "";

  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const formatPercentOrEmpty = (value?: number) => {
  const num = Number(value || 0);
  if (num === 0) return "";

  if (Number.isInteger(num)) {
    return num.toFixed(0);
  }

  return num.toFixed(1);
};

const SewingProductionStatusTable = memo(({rows}: Props) => {
  const sortedRows = useMemo(() => {
    return [...(rows || [])].sort((a: any, b: any) =>
      normalizeDate(b?.dtsWk ?? b?.dtsWork).localeCompare(
        normalizeDate(a?.dtsWk ?? a?.dtsWork)
      )
    );
  }, [rows]);

  const latestRow = sortedRows[0];
  const prevRow = sortedRows[1];

  const displayRows = useMemo(() => {
    if (!latestRow) return [];

    const prevHourActual = toNum(
      (prevRow as any)?.hourWork ?? (latestRow as any)?.hourWorkDayPrev
    );
    const currHourActual = toNum((latestRow as any)?.hourWork);

    const prevQtyActual = toNum(
      (prevRow as any)?.qtyDay ?? (latestRow as any)?.qtyDayPrev
    );
    const currQtyActual = toNum((latestRow as any)?.qtyDay);

    const prevAmtActual = toNum(
      (prevRow as any)?.amtDay ?? (latestRow as any)?.amtDayPrev
    );
    const currAmtActual = toNum((latestRow as any)?.amtDay);

    return [
      {
        key: "time",
        label: "시간",
        prevTarget: 0,
        prevActual: prevHourActual,
        prevRate: 0,
        currTarget: 0,
        currActual: currHourActual,
        currRate: 0,
        diffValue: currHourActual - prevHourActual,
      },
      {
        key: "qty",
        label: "수량",
        prevTarget: 0,
        prevActual: prevQtyActual,
        prevRate: 0,
        currTarget: 0,
        currActual: currQtyActual,
        currRate: 0,
        diffValue: currQtyActual - prevQtyActual,
      },
      {
        key: "amt",
        label: "금액",
        prevTarget: 0,
        prevActual: prevAmtActual,
        prevRate: 0,
        currTarget: 0,
        currActual: currAmtActual,
        currRate: 0,
        diffValue: currAmtActual - prevAmtActual,
      },
    ];
  }, [latestRow, prevRow]);

  const totalColSpan = 8;

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
            <col
              style={{
                width: COL_WIDTHS.target,
                minWidth: COL_WIDTHS.target,
              }}
            />
            <col
              style={{
                width: COL_WIDTHS.actual,
                minWidth: COL_WIDTHS.actual,
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
                width: COL_WIDTHS.target,
                minWidth: COL_WIDTHS.target,
              }}
            />
            <col
              style={{
                width: COL_WIDTHS.actual,
                minWidth: COL_WIDTHS.actual,
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
          </colgroup>

          <thead>
          <tr>
            <th
              colSpan={totalColSpan}
              style={{
                ...thBaseStyle,
                borderRight: `1px solid ${BORDER_COLOR}`,
              }}
            >
              생산 현황
            </th>
          </tr>

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

            <th colSpan={3} style={thBaseStyle}>
              <div style={titleCellTextStyle}>
                {formatDateLabel(latestRow?.dtsWork)}
              </div>
            </th>

            <th colSpan={3} style={thBaseStyle}>
              <div style={titleCellTextStyle}>
                {formatDateLabel(prevRow?.dtsWork)}
              </div>
            </th>

            <th
              rowSpan={2}
              style={{
                ...thBaseStyle,
                minWidth: COL_WIDTHS.diff,
              }}
            >
              <div
                style={{
                  ...titleCellTextStyle,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{color: "#ff0000", fontWeight: 700}}>▲</span>
                <span
                  style={{
                    color: "#0066ff",
                    fontWeight: 700,
                    marginLeft: 2,
                  }}
                >
                    ▼
                  </span>
              </div>
            </th>
          </tr>

          <tr>
            <th style={thBaseStyle}>목표</th>
            <th style={thBaseStyle}>실적</th>
            <th style={thBaseStyle}>%</th>

            <th style={thBaseStyle}>목표</th>
            <th style={thBaseStyle}>실적</th>
            <th style={thBaseStyle}>%</th>
          </tr>
          </thead>

          <tbody>
          {displayRows.length === 0 ? (
            <tr>
              <td
                colSpan={totalColSpan}
                style={{
                  ...tdBaseStyle,
                  backgroundColor: BODY_BG,
                  padding: "12px 6px",
                  textAlign: "center",
                }}
              >
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            displayRows.map((row, index) => {
              const rowBg = index % 2 === 0 ? BODY_BG : ALT_BODY_BG;

              const diffColor =
                row.diffValue > 0
                  ? "#ff0000"
                  : row.diffValue < 0
                    ? "#0066ff"
                    : "#666";

              return (
                <tr key={row.key}>
                  <td
                    style={{
                      ...tdBaseStyle,
                      ...stickyBodyStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {row.label}
                  </td>

                  <td
                    style={{
                      ...tdSoftDividerStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatNumberOrEmpty(row.currTarget)}
                  </td>

                  <td
                    style={{
                      ...tdBaseStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatNumberOrEmpty(row.currActual)}
                  </td>

                  <td
                    style={{
                      ...tdBaseStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatPercentOrEmpty(row.currRate)}
                  </td>

                  <td
                    style={{
                      ...tdSoftDividerStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatNumberOrEmpty(row.prevTarget)}
                  </td>

                  <td
                    style={{
                      ...tdBaseStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatNumberOrEmpty(row.prevActual)}
                  </td>

                  <td
                    style={{
                      ...tdBaseStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {formatPercentOrEmpty(row.prevRate)}
                  </td>

                  <td
                    style={{
                      ...tdBaseStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    {row.diffValue === 0 ? (
                      ""
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <DiffArrow value={row.diffValue} />
                        <span
                          style={{
                            color: diffColor,
                            fontWeight: 700,
                          }}
                        >
                            {formatNumberOrEmpty(Math.abs(row.diffValue))}
                          </span>
                      </div>
                    )}
                  </td>
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

export default SewingProductionStatusTable;
