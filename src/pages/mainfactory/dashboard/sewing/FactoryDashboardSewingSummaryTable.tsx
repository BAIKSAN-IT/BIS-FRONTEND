import React, {memo} from "react";
import {Table} from "react-bootstrap";
import DiffArrow from "@components/common/DiffArrow";
export interface SewingSummaryTableRow {
  key: string;
  label: string;
  lineValue: number;
  rate: number;
  color?: string;
}

interface Props {
  rows: SewingSummaryTableRow[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const DIVIDER_BORDER = "1px solid #aaa";

/**
 * 다른 테이블들과 동일 기준
 * - 구분 컬럼: 28%
 */
const COL_WIDTHS = {
  category: "21%",
  line: "40%",
  rate: "39%",
};

const thStyle: React.CSSProperties = {
  backgroundColor: HEADER_BG,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderRight: DIVIDER_BORDER,
};

const leftCellBaseStyle: React.CSSProperties = {
  fontWeight: 700,
  whiteSpace: "nowrap",
  wordBreak: "keep-all",
  borderRight: DIVIDER_BORDER,
  padding: "4px 8px",
  position: "sticky",
  left: 0,
  zIndex: 2,
};

const valueCellStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
  textAlign: "center",
  padding: "4px 6px",
  borderRight: DIVIDER_BORDER,
};

const formatNumber = (value?: number) => {
  const num = Number(value || 0);

  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const formatPercent = (value?: number) => {
  const num = Number(value || 0);

  if (Number.isInteger(num)) {
    return num.toFixed(0);
  }

  return num.toFixed(1);
};

const FactoryDashboardSewingSummaryTable = memo(({rows}: Props) => {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        overflowX: "auto",
      }}
    >
      <Table
        bordered
        size="sm"
        className="factory-summary-table mb-0 text-center align-middle"
        style={{
          width: "100%",
          fontSize: 10,
          tableLayout: "fixed",
          marginBottom: 0,
        }}
      >
        <colgroup>
          <col style={{width: COL_WIDTHS.category}} />
          <col style={{width: COL_WIDTHS.line}} />
          <col style={{width: COL_WIDTHS.rate}} />
        </colgroup>

        <thead>
        <tr>
          <th
            colSpan={3}
            style={{
              ...thStyle,
              borderRight: DIVIDER_BORDER,
            }}
          >
            라인 작업 현황
          </th>
        </tr>

        <tr>
          <th
            style={{
              ...thStyle,
              width: COL_WIDTHS.category,
              borderRight: DIVIDER_BORDER,
              position: "sticky",
              left: 0,
              zIndex: 3,
            }}
          >
            구분
          </th>
          <th style={thStyle}>LINE</th>
          <th style={thStyle}>%</th>
        </tr>
        </thead>

        <tbody>
        {rows.length === 0 && (
          <tr style={{backgroundColor: BODY_BG}}>
            <td
              colSpan={3}
              style={{
                ...valueCellStyle,
                padding: "8px 6px",
              }}
            >
              데이터가 없습니다.
            </td>
          </tr>
        )}

        {rows.map((row, index) => {
          const rowBg = index % 2 === 0 ? BODY_BG : ALT_BODY_BG;

          return (
            <tr key={row.key} style={{backgroundColor: rowBg}}>
              <td
                style={{
                  ...leftCellBaseStyle,
                  width: COL_WIDTHS.category,
                  backgroundColor: rowBg,
                }}
              >
                {row.label}
              </td>

              <td style={valueCellStyle}>
                {formatNumber(row.lineValue)}
              </td>

              <td style={valueCellStyle}>
                {formatPercent(row.rate)}
              </td>
            </tr>
          );
        })}
        </tbody>
      </Table>
    </div>
  );
});

export default FactoryDashboardSewingSummaryTable;
