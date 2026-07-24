import React from "react";

/** ===== EIS 규격 컬럼 타입 ===== */
type EisTableColumn = {
  Header: string;
  accessor?: string;
  id?: string;
  colSpan?: number;
  columns?: EisTableColumn[];
  sort?: boolean;
  className?: string;

  editable?: boolean;
  type?: "text" | "select" | "checkbox";
  options?: any;
  isOptionsNull?: boolean;

  number?: boolean;
  numberMode?: "int" | "decimal";

  minWidth?: number;
  width?: number;
  maxWidth?: number;

  isSearchBtn?: boolean;
  disabled?: boolean;

  leftSticky?: boolean;
  rightSticky?: boolean;

  groupEnd?: boolean;
  rowSpan?: number;

  Cell?: any;
};
/**  월 보정 */
const addMonth = (year: number, month: number, diff: number) => {
  const d = new Date(year, month - 1 + diff, 1);
  return {year: d.getFullYear(), month: d.getMonth() + 1};
};

/**  0 → 빈값 (ReactNode 반환 필수) */
const ZeroToEmptyCommaCell = ({value, row, column}: any) => {
  if (value === 0 || value === "0" || value == null) {
    return <span/>;
  }

  const isPlan = isPlanRow(row);

  let displayValue = value;

  if (typeof value === "number") {
    displayValue =
      column?.numberMode === "decimal"
        ? value.toLocaleString(undefined, {maximumFractionDigits: 20})
        : value.toLocaleString();
  } else if (typeof value === "string") {
    const num = Number(value.replace(/,/g, ""));
    displayValue = Number.isNaN(num) ? value : num.toLocaleString();
  }

  return (
    <span style={isPlan ? {color: "#007bff"} : undefined}>
      {displayValue}
    </span>
  );
};

const isPlanRow = (row: any) => {
  const buyer = row?.original?.nmBuyerDisp ?? "";
  const isPlanBuyer = buyer.includes("(계획분)");

  return isPlanBuyer;
};
const isSubTotalRow = (row: any) => {
  return row?.original?.group5 === 0 && row?.original?.group2 === 1;
};
export const SixMonthStatusTableColumns = (
  baseDate: string,
  viewMode: "BOTH" | "PCS" | "AMOUNT"
) => {
  const year = Number(baseDate.substring(0, 4));
  const month = Number(baseDate.substring(4, 6));

  const shipYM = addMonth(year, month, -1);
  const targetYM = {year, month};

  const m1 = addMonth(year, month, 1);
  const m2 = addMonth(year, month, 2);
  const m3 = addMonth(year, month, 3);
  const m4 = addMonth(year, month, 4);
  const m5 = addMonth(year, month, 5);
  const m6 = addMonth(year, month, 6);

  const sumYear = year + 1;

  const base: EisTableColumn[] = [
    {
      Header: "INFORMATION",
      columns: [
        {
          Header: "본부",
          accessor: "nmHDept",
          minWidth: 40,
          width: 100,
          maxWidth: 100,
          type: "text",
          leftSticky: true,
        },
        {
          Header: "팀",
          accessor: "noDept",
          minWidth: 30,
          width: 50,
          maxWidth: 60,
          type: "text",
          className: "text-center",
          leftSticky: true,
        },
        {
          Header: "BUYER",
          accessor: "nmBuyerDisp",
          minWidth: 30,
          width: 150,
          maxWidth: 200,
          type: "text",
          leftSticky: true,

          Cell: ({value, row}: any) => {
            const isSubTotalRow = row.original?.group5 === 0 && row.original?.group2 === 1;
            const isPlan = isPlanRow(row);
            return (
              <span
                className={isSubTotalRow ? "font-900" : undefined}
                style={isPlan ? {color: "#007bff"} : undefined}
              >
                {value}
              </span>
            );
          },
        },
        {
          Header: "구분",
          accessor: "sgpOrder",
          minWidth: 30,
          width: 50,
          maxWidth: 60,
          type: "text",
          className: "text-center",
          leftSticky: true,
          Cell: ({row, value}: any) => {
            const isTotalRow = row.original?.sgpOrder === "1";
            return isTotalRow ? "" : value;
          },
        },
      ],
    },
    /** ===== 숫자 그룹들 (원본 그대로 유지) ===== */
    {
      Header: "2025출하합계(~10월)",
      columns: [
        {
          Header: "PCS",
          accessor: "qtShip",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);

            return (
              <span className={isBold ? "font-900" : undefined}>
                {value ? value.toLocaleString() : ""}
              </span>
            );
          }
        },
        {
          Header: "AMOUNT",
          accessor: "amShip",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);

            return (
              <span className={isBold ? "font-900" : undefined}>
                {value ? value.toLocaleString() : ""}
              </span>
            );
          }
        },
      ],
    },
    {
      Header: "11월 설정 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "targetQty",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);

            return (
              <span className={isBold ? "font-900" : undefined}>
                {value ? value.toLocaleString() : ""}
              </span>
            );
          }
        },
        {
          Header: "AMOUNT",
          accessor: "targetAmount",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);

            return (
              <span className={isBold ? "font-900" : undefined}>
                {value ? value.toLocaleString() : ""}
              </span>
            );
          }
        },
      ],
    },
    {
      Header: "11월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd0",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col1 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd0",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col1 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "11월 출하실적",
      columns: [
        {
          Header: "PCS",
          accessor: "qtShip0",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue = isPlanRow(row);

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amShip0",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue = isPlanRow(row);

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "기출하+2025년 수주잔량",
      columns: [
        {
          Header: "PCS",
          accessor: "qtShipQtOrd",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            return (
              <span
                className={"font-900"}
                style={{color: 'orange', fontWeight: '900'}}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amShipAmOrd",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            return (
              <span
                className={"font-900"}
                style={{color: 'orange', fontWeight: '900'}}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2025년 12월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd1",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col2 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd1",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col2 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2026년 1월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd2",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col3 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd2",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col3 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2026년 2월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd3",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col4 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd3",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col4 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2026년 3월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd4",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col5 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd4",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col5 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2026년 4월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd5",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col6 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd5",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col6 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "2026년 5월 ~ 12월 목표",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd6",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col7 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd6",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =
              isPlanRow(row) || row.original?.col7 === "1";

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
    {
      Header: "합계(26년합계)",
      columns: [
        {
          Header: "PCS",
          accessor: "qtOrd1To6",
          minWidth: 40,
          width: 80,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue = isPlanRow(row);

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
        {
          Header: "AMOUNT",
          accessor: "amOrd1To6",
          minWidth: 60,
          width: 100,
          number: true,
          className: "text-center",
          Cell: ({value, row}: any) => {
            const isBold = isSubTotalRow(row);
            const isBlue =isPlanRow(row);

            return (
              <span
                className={isBold ? "font-900" : undefined}
                style={isBlue ? {color: "#007bff"} : undefined}
              >
                {value ? value.toLocaleString() : ""}
              </span>
            );
          },
        },
      ],
    },
  ];

  const isJanuary = month === 1;

  return base
    .filter((g) => !(isJanuary && g.Header === "2025출하합계(~10월)"))
    .map((g) => {
      let Header = g.Header;

      switch (g.Header) {
        case "2025출하합계(~10월)":
          Header = `${shipYM.year}출하합계(~${shipYM.month}월)`;
          break;
        case "11월 설정 목표":
          Header = `${targetYM.month}월 설정 목표`;
          break;
        case "11월 목표":
          Header = `${targetYM.month}월 목표`;
          break;
        case "11월 출하실적":
          Header = `${targetYM.month}월 출하실적`;
          break;
        case "기출하+2025년 수주잔량":
          Header = `기출하+${year}년 수주잔량`;
          break;
        case "2025년 12월 목표":
          Header = `${m1.year}년 ${m1.month}월 목표`;
          break;
        case "2026년 1월 목표":
          Header = `${m2.year}년 ${m2.month}월 목표`;
          break;
        case "2026년 2월 목표":
          Header = `${m3.year}년 ${m3.month}월 목표`;
          break;
        case "2026년 3월 목표":
          Header = `${m4.year}년 ${m4.month}월 목표`;
          break;
        case "2026년 4월 목표":
          Header = `${m5.year}년 ${m5.month}월 목표`;
          break;
        case "2026년 5월 ~ 12월 목표":
          Header = `${m6.year}년 ${m6.month}월 ~ 12월 목표`;
          break;
        case "합계(26년합계)":
          Header = `합계(${sumYear.toString().slice(2)}년합계)`;
          break;
      }

      if (g.Header === "INFORMATION") {
        return {...g, Header};
      }

      if (!g.columns) return {...g, Header};

      const columns = g.columns
        .filter((c) => {
          if (viewMode === "BOTH") return true;
          if (viewMode === "PCS") return c.Header === "PCS";
          if (viewMode === "AMOUNT") return c.Header === "AMOUNT";
          return true;
        })
        .map((c) =>
          c.number && !c.Cell
            ? {...c, Cell: ZeroToEmptyCommaCell}
            : c
        );

      if (columns.length === 0) return null;

      return {...g, Header, columns};
    })
    .filter(Boolean) as EisTableColumn[];
};

export default SixMonthStatusTableColumns;
