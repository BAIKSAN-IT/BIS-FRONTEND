import React, {memo} from "react";
import {Table} from "react-bootstrap";
import {formatNumber, formatPercent} from "@utils/numberUtils";

export interface KnittingTodayMachineStatusRow {
  key: string;
  label: string;
  code: string;
  keepValue: number;
  rateValue: number;      // 보유 %
  useValue?: number;      // 가동 대수
  useRateValue?: number;  // 가동 %
  color: string;
}

interface Props {
  title?: string;
  rows: KnittingTodayMachineStatusRow[];
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

const round1 = (value: number) => {
  return Math.round(value * 10) / 10;
};

const calcPercent = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) {
    return 0;
  }
  return round1((value / total) * 100);
};

const KnittingTodayMachineStatusTable = memo(
  ({title = "", rows, totalUseRate}: Props) => {
    void title;

    const totalKeep = rows.reduce((sum, row) => sum + toNum(row.keepValue), 0);
    const totalUse = rows.reduce((sum, row) => sum + toNum(row.useValue), 0);

    const totalKeepRate =
      totalKeep > 0
        ? round1(rows.reduce((sum, row) => sum + toNum(row.rateValue), 0))
        : 0;

    const hasExplicitUseRate = rows.some(
      (row) => row.useRateValue !== undefined && row.useRateValue !== null
    );

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
            const useValue = toNum(row.useValue);
            const useRateValue =
              row.useRateValue !== undefined && row.useRateValue !== null
                ? toNum(row.useRateValue)
                : calcPercent(useValue, toNum(row.keepValue));

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
                          backgroundColor: row.color,
                          display: "inline-block",
                          marginRight: 6,
                          flexShrink: 0,
                        }}
                      />
                    <span>{row.label}</span>
                  </div>
                </td>

                <td style={valueCellStyle}>{formatNumber(row.keepValue)}</td>
                <td style={valueCellStyle}>
                  {formatPercent(row.rateValue, 1)}
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
                  zIndex: 2,
                }}
              >
                합계
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatNumber(totalKeep)}
              </td>
              <td style={{...valueCellStyle, fontWeight: 700}}>
                {formatPercent(totalKeepRate, 1)}
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

export default KnittingTodayMachineStatusTable;
