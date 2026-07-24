import React, {memo, CSSProperties} from "react";
import DiffArrow from "@components/common/DiffArrow";
export interface DyeingGaugeSummaryTableRow {
  key: string;
  label: string;

  prevQtyValue: string;
  prevAmtValue: string;

  currQtyValue: string;
  currAmtValue: string;

  diffQtyValue: string;
  diffAmtValue: string;

  diffQtySign: number;
  diffAmtSign: number;
}

interface Props {
  rows: DyeingGaugeSummaryTableRow[];
  previousTitle: string;
  currentTitle: string;
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const BORDER_COLOR = "#aaa";

const COL_WIDTHS = {
  category: 84,
  qty: 72,
  amt: 72,
  diffQty: 76,
  diffAmt: 76,
};

const wrapperStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
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

const tdBaseStyle2: CSSProperties = {
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderBottom: `1px solid ${BORDER_COLOR}`,
  borderRight: `1px solid #ddd`,
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
  borderRight: "1px solid #aaa",
};

const stickyBodyStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 10,
  minWidth: COL_WIDTHS.category,
  width: COL_WIDTHS.category,
  maxWidth: COL_WIDTHS.category,
  fontWeight: 700,
  textAlign: "center",
  padding: "4px 8px",
  borderRight: "1px solid #aaa",
};

const titleCellTextStyle: CSSProperties = {
  whiteSpace: "pre-line",
  lineHeight: 1.15,
  fontSize: 10,
  fontWeight: 700,
};

const DyeingGaugeSummaryTable = memo(
  ({rows, previousTitle, currentTitle}: Props) => {
    const totalColSpan = 7;

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
                  width: COL_WIDTHS.qty,
                  minWidth: COL_WIDTHS.qty,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.amt,
                  minWidth: COL_WIDTHS.amt,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.qty,
                  minWidth: COL_WIDTHS.qty,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.amt,
                  minWidth: COL_WIDTHS.amt,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.diffQty,
                  minWidth: COL_WIDTHS.diffQty,
                }}
              />
              <col
                style={{
                  width: COL_WIDTHS.diffAmt,
                  minWidth: COL_WIDTHS.diffAmt,
                }}
              />
            </colgroup>

            <thead>
            <tr>
              <th
                rowSpan={3}
                style={{
                  ...thBaseStyle,
                  ...stickyHeaderStyle,
                }}
              >
                구분
              </th>
            </tr>

            <tr>
              <th colSpan={2} style={thBaseStyle}>
                <div style={titleCellTextStyle}>{currentTitle}</div>
              </th>

              <th colSpan={2} style={thBaseStyle}>
                <div style={titleCellTextStyle}>{previousTitle}</div>
              </th>

              <th colSpan={2} style={thBaseStyle}>
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
              <th style={thBaseStyle}>KG</th>
              <th style={thBaseStyle}>AMT</th>

              <th style={thBaseStyle}>KG</th>
              <th style={thBaseStyle}>AMT</th>

              <th style={thBaseStyle}>KG</th>
              <th style={thBaseStyle}>AMT</th>
            </tr>
            </thead>

            <tbody>
            {rows.length === 0 ? (
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
              rows.map((row, index) => {
                const rowBg = index % 2 === 0 ? BODY_BG : ALT_BODY_BG;

                const diffQtyColor =
                  row.diffQtySign > 0
                    ? "#ff0000"
                    : row.diffQtySign < 0
                      ? "#0066ff"
                      : "#666";

                const diffAmtColor =
                  row.diffAmtSign > 0
                    ? "#ff0000"
                    : row.diffAmtSign < 0
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
                        ...tdBaseStyle2,
                        backgroundColor: rowBg,
                      }}
                    >
                      {row.currQtyValue}
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle,
                        backgroundColor: rowBg,
                      }}
                    >
                      {row.currAmtValue}
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle2,
                        backgroundColor: rowBg,
                      }}
                    >
                      {row.prevQtyValue}
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle,
                        backgroundColor: rowBg,
                      }}
                    >
                      {row.prevAmtValue}
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle2,
                        backgroundColor: rowBg,
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
                        {row.diffQtyValue ? (
                          <DiffArrow value={row.diffQtySign} />
                        ) : null}
                        <span
                          style={{
                            color: diffQtyColor,
                            fontWeight: 700,
                          }}
                        >
                            {row.diffQtyValue}
                          </span>
                      </div>
                    </td>

                    <td
                      style={{
                        ...tdBaseStyle,
                        backgroundColor: rowBg,
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
                        {row.diffAmtValue ? (
                          <DiffArrow value={row.diffAmtSign} />
                        ) : null}
                        <span
                          style={{
                            color: diffAmtColor,
                            fontWeight: 700,
                          }}
                        >
                            {row.diffAmtValue}
                          </span>
                      </div>
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
  }
);

export default DyeingGaugeSummaryTable;
