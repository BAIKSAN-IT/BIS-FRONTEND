import React, {memo, useMemo} from "react";
import {Table} from "react-bootstrap";
import {FactoryDashboardDailySewingRes} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {normalizeDate} from "@utils/numberUtils";
import DiffArrow from "@components/common/DiffArrow";

interface Props {
  rows: FactoryDashboardDailySewingRes[];
  avgHourWorkOverride?: {
    prevAvgHourWork: number;
    currAvgHourWork: number;
  } | null;
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const DIVIDER_BORDER = "1px solid #aaa";

const COL_WIDTHS = {
  category: "21%",
  curr: "26%",
  prev: "26%",
  diff: "27%",
};

const thStyle: React.CSSProperties = {
  backgroundColor: HEADER_BG,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
  borderRight: DIVIDER_BORDER,
};

const leftCellStyle: React.CSSProperties = {
  fontWeight: 700,
  whiteSpace: "normal",
  wordBreak: "keep-all",
  borderRight: DIVIDER_BORDER,
  padding: "4px 8px",
  textAlign: "center",
  verticalAlign: "middle",
};

const valueCellStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
  textAlign: "center",
  padding: "4px 6px",
  verticalAlign: "middle",
  borderRight: DIVIDER_BORDER,
};

const toNum = (value: any) => Number(value) || 0;

const safeDivide = (value: number, divisor: number) => {
  if (!divisor) return 0;
  return value / divisor;
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

type DisplayRow = {
  key: string;
  label: string;
  currValue: number;
  prevValue: number;
  diffValue: number;
};

const SewingWorkStatusTable = memo(
  ({rows, avgHourWorkOverride}: Props) => {
    const latestRow = useMemo(() => {
      const sorted = [...(rows || [])].sort((a: any, b: any) =>
        normalizeDate(b?.dtsWk ?? b?.dtsWork).localeCompare(
          normalizeDate(a?.dtsWk ?? a?.dtsWork)
        )
      );

      return sorted[0];
    }, [rows]);

    const displayRows = useMemo<DisplayRow[]>(() => {
      if (!latestRow) return [];

      const prevWorkDays = toNum((latestRow as any)?.cntMmPrev);
      const currWorkDays = toNum((latestRow as any)?.cntMmCurr);

      const prevOtHours = toNum((latestRow as any)?.hourOverTimeMmPrev);
      const currOtHours = toNum((latestRow as any)?.hourOverTimeMmCurr);

      const prevAvgHourWork =
        avgHourWorkOverride?.prevAvgHourWork ??
        safeDivide(toNum((latestRow as any)?.hourWorkMmPrev), prevWorkDays);

      const currAvgHourWork =
        avgHourWorkOverride?.currAvgHourWork ??
        safeDivide(toNum((latestRow as any)?.hourWorkMmCurr), currWorkDays);

      // 생산수량 / 생산금액은 평균이 아니라 월 합계를 그대로 사용
      const prevQty = toNum((latestRow as any)?.qtyMmPrev);
      const currQty = toNum((latestRow as any)?.qtyMmCurr);

      const prevAmt = toNum((latestRow as any)?.amtMmPrev);
      const currAmt = toNum((latestRow as any)?.amtMmCurr);

      return [
        {
          key: "workDays",
          label: "작업일수",
          currValue: currWorkDays,
          prevValue: prevWorkDays,
          diffValue: currWorkDays - prevWorkDays,
        },
        {
          key: "otHours",
          label: "O.T",
          currValue: currOtHours,
          prevValue: prevOtHours,
          diffValue: currOtHours - prevOtHours,
        },
        {
          key: "avgHourWork",
          label: "평균작업시간",
          currValue: currAvgHourWork,
          prevValue: prevAvgHourWork,
          diffValue: currAvgHourWork - prevAvgHourWork,
        },
        {
          key: "qty",
          label: "생산수량",
          currValue: currQty,
          prevValue: prevQty,
          diffValue: currQty - prevQty,
        },
        {
          key: "amt",
          label: "생산금액",
          currValue: currAmt,
          prevValue: prevAmt,
          diffValue: currAmt - prevAmt,
        },
      ];
    }, [latestRow, avgHourWorkOverride]);

    return (
      <div
        className="mt-1"
        style={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Table
          bordered
          size="sm"
          className="factory-summary-table mb-0 text-center align-middle"
          style={{
            fontSize: 10,
            tableLayout: "fixed",
            width: "100%",
            maxWidth: "100%",
            marginBottom: 0,
          }}
        >
          <colgroup>
            <col style={{width: COL_WIDTHS.category}} />
            <col style={{width: COL_WIDTHS.curr}} />
            <col style={{width: COL_WIDTHS.prev}} />
            <col style={{width: COL_WIDTHS.diff}} />
          </colgroup>

          <thead>
          <tr>
            <th
              colSpan={4}
              style={{
                ...thStyle,
                borderRight: DIVIDER_BORDER,
              }}
            >
              월 작업 현황
            </th>
          </tr>

          <tr>
            <th
              style={{
                ...thStyle,
                width: COL_WIDTHS.category,
                borderRight: DIVIDER_BORDER,
              }}
            >
              구분
            </th>
            <th style={thStyle}>당월</th>
            <th style={thStyle}>전월</th>
            <th
              style={{
                ...thStyle,
                borderRight: DIVIDER_BORDER,
              }}
            >
              <span style={{color: "#ff0000", fontWeight: 700}}>▲</span>
              <span style={{color: "#0066ff", fontWeight: 700}}>▼</span>
            </th>
          </tr>
          </thead>

          <tbody>
          {displayRows.length === 0 ? (
            <tr style={{backgroundColor: BODY_BG}}>
              <td
                colSpan={4}
                style={{
                  ...valueCellStyle,
                  padding: "12px 6px",
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
                <tr key={row.key} style={{backgroundColor: rowBg}}>
                  <td
                    style={{
                      ...leftCellStyle,
                      backgroundColor: rowBg,
                    }}
                  >
                    <span style={{fontSize: 10}}>{row.label}</span>
                  </td>

                  <td style={valueCellStyle}>
                    {formatNumberOrEmpty(row.currValue)}
                  </td>

                  <td style={valueCellStyle}>
                    {formatNumberOrEmpty(row.prevValue)}
                  </td>

                  <td
                    style={{
                      fontSize: "9px",
                      ...valueCellStyle,
                      borderRight: DIVIDER_BORDER,
                    }}
                  >
                    {row.diffValue === 0 ? (
                      ""
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <DiffArrow value={row.diffValue} />
                        <span
                          style={{
                            fontWeight: 700,
                            color: diffColor,
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
        </Table>
      </div>
    );
  }
);

export default SewingWorkStatusTable;
