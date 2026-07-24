import React, {memo, useMemo} from "react";
import {Table} from "react-bootstrap";
import {FactoryDashboardDailySewingRes} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {normalizeDate} from "@utils/numberUtils";
import DiffArrow from "@components/common/DiffArrow";
interface Props {
  rows: FactoryDashboardDailySewingRes[];
}

const HEADER_BG = "#BBDAF6";
const BODY_BG = "#FFFFFF";
const ALT_BODY_BG = "#F8F8F8";
const DIVIDER_BORDER = "1px solid #aaa";

/**
 * 구분 컬럼은 반드시 28%로 통일
 */
const COL_WIDTHS = {
  category: "21%",
  prev: "26%",
  curr: "26%",
  diff: "27%",
};

const thStyle: React.CSSProperties = {
  backgroundColor: HEADER_BG,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "center",
  padding: "4px 6px",
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

const SewingAvgWorkStatusTable = memo(({rows}: Props) => {
  const latestRow = useMemo(() => {
    const sorted = [...(rows || [])].sort((a: any, b: any) =>
      normalizeDate(b?.dtsWk ?? b?.dtsWork).localeCompare(
        normalizeDate(a?.dtsWk ?? a?.dtsWork)
      )
    );

    return sorted[0];
  }, [rows]);

  const displayRows = useMemo(() => {
    if (!latestRow) return [];

    const prevCnt = toNum((latestRow as any)?.cntMmPrev);
    const currCnt = toNum((latestRow as any)?.cntMmCurr);

    const prevAvgHourWork = safeDivide(
      toNum((latestRow as any)?.hourWorkMmPrev),
      prevCnt
    );
    const currAvgHourWork = safeDivide(
      toNum((latestRow as any)?.hourWorkMmCurr),
      currCnt
    );

    const prevAvgQty = safeDivide(
      toNum((latestRow as any)?.qtyMmPrev),
      prevCnt
    );
    const currAvgQty = safeDivide(
      toNum((latestRow as any)?.qtyMmCurr),
      currCnt
    );

    const prevAvgAmt = safeDivide(
      toNum((latestRow as any)?.amtMmPrev),
      prevCnt
    );
    const currAvgAmt = safeDivide(
      toNum((latestRow as any)?.amtMmCurr),
      currCnt
    );

    return [
      {
        key: "avgHourWork",
        label: "평균작업시간",
        prevValue: prevAvgHourWork,
        currValue: currAvgHourWork,
        diffValue: currAvgHourWork - prevAvgHourWork,
      },
      {
        key: "avgQty",
        label: "생산수량",
        prevValue: prevAvgQty,
        currValue: currAvgQty,
        diffValue: currAvgQty - prevAvgQty,
      },
      {
        key: "avgAmt",
        label: "생산금액",
        prevValue: prevAvgAmt,
        currValue: currAvgAmt,
        diffValue: currAvgAmt - prevAvgAmt,
      },
    ];
  }, [latestRow]);

  return (
    <div
      className={'mt-1'}
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
          fontSize: 10,
          tableLayout: "fixed",
          width: "100%",
          marginBottom: 0,
        }}
      >
        <colgroup>
          <col style={{width: COL_WIDTHS.category}} />
          <col style={{width: COL_WIDTHS.prev}} />
          <col style={{width: COL_WIDTHS.curr}} />
          <col style={{width: COL_WIDTHS.diff}} />
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
                    ...leftCellBaseStyle,
                    width: COL_WIDTHS.category,
                    backgroundColor: rowBg,
                  }}
                >
                  {row.label}
                </td>

                <td style={valueCellStyle}>
                  {formatNumberOrEmpty(row.currValue)}
                </td>

                <td style={valueCellStyle}>
                  {formatNumberOrEmpty(row.prevValue)}
                </td>

                <td
                  style={{
                    ...valueCellStyle,
                    borderRight: DIVIDER_BORDER,
                  }}
                >
                  {row.diffValue === 0 ? (
                    ""
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{gap: 4}}
                    >
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
});

export default SewingAvgWorkStatusTable;
