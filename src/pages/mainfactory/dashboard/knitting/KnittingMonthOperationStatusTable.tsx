import React, {memo} from "react";
import {Table} from "react-bootstrap";
import {formatNumber, formatPercent} from "@utils/numberUtils";

export interface KnittingMonthOperationStatusRow {
  key: string;
  label: string;
  code: string;
  keepValue: number;
  useValue: number;
  rateValue: number;
  color: string;
}

interface Props {
  title?: string;
  rows: KnittingMonthOperationStatusRow[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const DIVIDER_BORDER = "1px solid #aaa";

const COL_WIDTHS = {
  category: "28%",
  code: "16%",
  keep: "18%",
  use: "18%",
  rate: "20%",
};

const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const calcRate = (useValue: number, keepValue: number) => {
  const keep = toNum(keepValue);
  const use = toNum(useValue);

  if (keep === 0) return 0;
  return (use / keep) * 100;
};

const thStyle: React.CSSProperties = {
  backgroundColor: HEADER_BG,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "2px 2px",
  height: "25px",
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

const KnittingMonthOperationStatusTable = memo(
  ({title = "", rows}: Props) => {
    void title;

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
            height: "180px",
          }}
        >
          <colgroup>
            <col style={{width: COL_WIDTHS.category}} />
            <col style={{width: COL_WIDTHS.keep}} />
            <col style={{width: COL_WIDTHS.use}} />
            <col style={{width: COL_WIDTHS.rate}} />
          </colgroup>

          <thead>
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
            <th style={thStyle}>보유</th>
            <th style={thStyle}>가동</th>
            <th style={thStyle}>%</th>
          </tr>
          </thead>

          <tbody>
          {rows.length === 0 && (
            <tr style={{backgroundColor: BODY_BG}}>
              <td
                colSpan={4}
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

            const displayKeep = Math.round(toNum(row.keepValue));
            const displayUse = Math.round(toNum(row.useValue));
            const displayRate =
              displayKeep > 0 ? (displayUse / displayKeep) * 100 : 0;

            return (
              <tr key={row.key} style={{backgroundColor: rowBg}}>
                <td
                  style={{
                    ...leftCellBaseStyle,
                    width: COL_WIDTHS.category,
                    backgroundColor: rowBg,
                    textAlign: "left",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-start">
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
                    <span>{row.label}</span>
                  </div>
                </td>

                <td style={valueCellStyle}>{formatNumber(displayKeep)}</td>
                <td style={valueCellStyle}>{formatNumber(displayUse)}</td>
                <td style={valueCellStyle}>{formatPercent(displayRate, 1)}</td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </div>
    );
  }
);

export default KnittingMonthOperationStatusTable;
