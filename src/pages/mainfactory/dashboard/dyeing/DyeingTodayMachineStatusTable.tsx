import React, {memo} from "react";
import {Table} from "react-bootstrap";
import {formatNumber, formatPercent} from "@utils/numberUtils";

export interface DyeingTodayMachineStatusRow {
  key: string;
  label: string;
  code: string;
  qtyValue: number;          // 보유 대수
  keepRateValue?: number;    // 보유 %
  useValue?: number;         // 가동 대수
  useRateValue?: number;     // 가동 %
  rateValue?: number;        // 기존 호환용
  color?: string;
}

interface Props {
  title?: string;
  rows: DyeingTodayMachineStatusRow[];
  totalUseRate?: number;
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const TOTAL_BG = "#EAF4FF";
const DIVIDER_BORDER = "1px solid #aaa";

const COL_WIDTHS = {
  category: "24%",
  keepQty: "19%",
  keepRate: "19%",
  useQty: "19%",
  useRate: "19%",
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

const subThStyle: React.CSSProperties = {
  ...thStyle,
  fontWeight: 600,
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

const toNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

const calcPercent = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) {
    return 0;
  }
  return round1((value / total) * 100);
};

const DyeingTodayMachineStatusTable = memo(
  ({title = "", rows, totalUseRate}: Props) => {
    void title;
    console.log(rows)
    const totalKeep = rows.reduce((sum, row) => sum + toNum(row.qtyValue), 0);
    const totalUse = rows.reduce((sum, row) => sum + toNum(row.useValue), 0);

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
            <col style={{width: COL_WIDTHS.keepQty}} />
            <col style={{width: COL_WIDTHS.keepRate}} />
            <col style={{width: COL_WIDTHS.useQty}} />
            <col style={{width: COL_WIDTHS.useRate}} />
          </colgroup>

          <thead>
          <tr>
            <th
              rowSpan={2}
              style={{
                ...thStyle,
                position: "sticky",
                left: 0,
                zIndex: 3,
              }}
            >
              종류
            </th>
            <th colSpan={2} style={thStyle}>
              보유
            </th>
            <th colSpan={2} style={thStyle}>
              가동
            </th>
          </tr>
          <tr>
            <th style={subThStyle}>대수</th>
            <th style={subThStyle}>%</th>
            <th style={subThStyle}>대수</th>
            <th style={subThStyle}>%</th>
          </tr>
          </thead>

          <tbody>
          {rows.length === 0 && (
            <tr style={{backgroundColor: BODY_BG}}>
              <td
                colSpan={5}
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

            const keepValue = toNum(row.qtyValue);
            const useValue = toNum(row.useValue);

            const keepRateValue =
              row.keepRateValue !== undefined && row.keepRateValue !== null
                ? toNum(row.keepRateValue)
                : calcPercent(keepValue, totalKeep);

            const useRateValue =
              row.useRateValue !== undefined && row.useRateValue !== null
                ? toNum(row.useRateValue)
                : row.rateValue !== undefined && row.rateValue !== null
                  ? toNum(row.rateValue)
                  : calcPercent(useValue, keepValue);

            return (
              <tr key={row.key} style={{backgroundColor: rowBg}}>
                <td
                  style={{
                    ...leftCellBaseStyle,
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
                          backgroundColor: row.color || "#999",
                          display: "inline-block",
                          marginRight: 6,
                          flexShrink: 0,
                        }}
                      />
                    <span>{row.label}</span>
                  </div>
                </td>

                <td style={valueCellStyle}>{formatNumber(keepValue)}</td>
                <td style={valueCellStyle}>
                  {formatPercent(keepRateValue, 1)}
                </td>
                <td style={valueCellStyle}>{formatNumber(useValue)}</td>
                <td style={valueCellStyle}>
                  {formatPercent(useRateValue, 1)}
                </td>
              </tr>
            );
          })}

          {rows.length > 0 && (
            <tr style={{backgroundColor: TOTAL_BG}}>
              <td
                style={{
                  ...leftCellBaseStyle,
                  backgroundColor: TOTAL_BG,
                  textAlign: "center",
                }}
              >
                합계
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatNumber(totalKeep)}
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatPercent(totalKeep > 0 ? 100 : 0, 1)}
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatNumber(totalUse)}
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatPercent(totalUseRate, 1)}
              </td>
            </tr>
          )}
          </tbody>
        </Table>
      </div>
    );
  }
);

export default DyeingTodayMachineStatusTable;
