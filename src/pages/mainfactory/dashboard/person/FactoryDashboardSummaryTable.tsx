import React, {memo} from "react";
import {Table} from "react-bootstrap";
import {formatNumberOrEmpty, formatPercentOrEmpty, toNum} from "@utils/numberUtils";

export interface SummaryTableRow {
  key: string;
  label: string;
  totalCount: number;
  attendCount: number;
  absentCount: number;
  totalRate: number;
  attendRate: number;
  absentRate: number;
  color: string;
}

interface Props {
  rows: SummaryTableRow[];
}

const HEADER_BG = "#BBDAF6";
const EVEN_ROW_BG = "#FFFFFF";
const ODD_ROW_BG = "#F3F3F3";
const TOTAL_RED = "#FF0000";
const DIVIDER_BORDER = "1px solid #aaa";

const FactoryDashboardSummaryTable = memo(({rows}: Props) => {
  return (
    <Table
      bordered
      size="sm"
      className="factory-summary-table mb-0 text-center align-middle"
      style={{
        fontSize: 10,
        tableLayout: "auto",
      }}
    >
      <thead>
      <tr>
        <th
          rowSpan={2}
          style={{
            backgroundColor: HEADER_BG,
            verticalAlign: "middle",
            whiteSpace: "nowrap",
            wordBreak: "keep-all",
            width: 75,
            minWidth: 75,
            borderRight: DIVIDER_BORDER,
          }}
        >
          구분
        </th>
        <th
          colSpan={2}
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          총원
        </th>
        <th
          colSpan={2}
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          출근
        </th>
        <th
          colSpan={2}
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          결근
        </th>
      </tr>
      <tr>
        <th style={{backgroundColor: HEADER_BG, whiteSpace: "nowrap"}}>인원</th>
        <th
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          %
        </th>
        <th style={{backgroundColor: HEADER_BG, whiteSpace: "nowrap"}}>인원</th>
        <th
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          %
        </th>
        <th style={{backgroundColor: HEADER_BG, whiteSpace: "nowrap"}}>인원</th>
        <th
          style={{
            backgroundColor: HEADER_BG,
            whiteSpace: "nowrap",
            borderRight: DIVIDER_BORDER,
          }}
        >
          %
        </th>
      </tr>
      </thead>

      <tbody>
      {rows.map((row, index) => {
        const rowTotal = toNum(row.totalCount);
        const rowAttend = toNum(row.attendCount);
        const rowAbsent = toNum(row.absentCount);

        const totalPercent = toNum(row.totalRate);
        const attendPercent = toNum(row.attendRate);
        const absentPercent = toNum(row.absentRate);

        const rowBg = index % 2 === 0 ? EVEN_ROW_BG : ODD_ROW_BG;
        const isTotalRow = row.label?.toUpperCase() === "TOTAL";

        const baseValueStyle = {
          whiteSpace: "nowrap" as const,
          backgroundColor: rowBg,
          color: isTotalRow ? TOTAL_RED : "#212529",
          fontWeight: isTotalRow ? 700 : 400,
          padding: '3px 8px',
        };

        return (
          <tr
            key={row.key}
            style={{
              backgroundColor: rowBg,
            }}
          >
            <td
              style={{
                fontWeight: 700,
                whiteSpace: "nowrap",
                wordBreak: "keep-all",
                backgroundColor: rowBg,
                borderRight: DIVIDER_BORDER,
                padding: '2px 8px',
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
                <span style={{fontSize: 10, whiteSpace: "nowrap"}}>
                  {row.label}
                </span>
              </div>
            </td>

            <td style={baseValueStyle}>{formatNumberOrEmpty(rowTotal)}</td>
            <td style={{...baseValueStyle, borderRight: DIVIDER_BORDER}}>
              {formatPercentOrEmpty(totalPercent)}
            </td>

            <td style={baseValueStyle}>{formatNumberOrEmpty(rowAttend)}</td>
            <td style={{...baseValueStyle, borderRight: DIVIDER_BORDER}}>
              {formatPercentOrEmpty(attendPercent)}
            </td>

            <td style={baseValueStyle}>{formatNumberOrEmpty(rowAbsent)}</td>
            <td style={{...baseValueStyle, borderRight: DIVIDER_BORDER}}>
              {formatPercentOrEmpty(absentPercent)}
            </td>
          </tr>
        );
      })}
      </tbody>
    </Table>
  );
});

export default FactoryDashboardSummaryTable;
