import {CommaColumn, CommaMinusRedColumn, DateColumn, PercentColumn, TitleEnterCell,} from "@utils/CommonUtilJsx";

/** ================= 날짜 ================= */
const DATE_COLUMNS = [
  {
    Header: () => <TitleEnterCell header="START"/>,
    accessor: "cutSDate",
    className: "text-center width-90",
    Cell: ({row}: any) => (
      <DateColumn row={row} columnName="cutSDate"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: () => <TitleEnterCell header="END"/>,
    accessor: "cutEDate",
    className: "text-center width-90",
    Cell: ({row}: any) => (
      <DateColumn row={row} columnName="cutEDate"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= 수량 ================= */
const QTY_COLUMNS = [
  {
    Header: () => <TitleEnterCell header="COLOR"/>,
    accessor: "clrQty",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="clrQty"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: () => <TitleEnterCell header="SIZE"/>,
    accessor: "szQty",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="szQty"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "DAY",
    accessor: "qtCut",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="qtCut"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: () => <TitleEnterCell header="TTL"/>,
    accessor: "qtTtlCut",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="qtTtlCut"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: () => <TitleEnterCell header="TTL PART"/>,
    accessor: "qtTtlPart",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="qtTtlPart"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= 실적 ================= */
const PERFORMANCE_COLUMNS = [
  {
    Header: "BALANCE",
    accessor: "balance",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaMinusRedColumn row={row} columnName="balance"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "+ / - %",
    accessor: "cutRATE",
    className: "text-center",
    Cell: ({row}: any) => (
      <PercentColumn row={row} columnName="cutRATE"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "CUT / AVG",
    accessor: "cutDay",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="cutDay"/>
    ),
  },
];

/** ================= SEWING ================= */
const SEWING_COLUMNS = [
  {
    Header: "INPUT / DAY",
    accessor: "sewInDay",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="sewInDay"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL INPUT",
    accessor: "sewIn",
    className: "text-center",
    Cell: ({row}: any) => (
      <CommaColumn row={row} columnName="sewIn"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= 메인 컬럼 ================= */
export const CuttingActualColorTableColumns = () => {
  return [
    {
      Header: "NO",
      accessor: "seq",
      columns: [
        {
          Header: "",
          accessor: "seq",
          className: "text-center height-50 width-60",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "BUYER",
      accessor: "nmBuyer",
      columns: [
        {
          Header: "",
          accessor: "nmBuyer",
          className: "text-start",
          percent: 10,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "STYLE",
      accessor: "noStyle",
      columns: [
        {
          Header: "",
          accessor: "noStyle",
          className: "text-start",
          percent: 10,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "ORDER QTY",
      accessor: "qtOrd",
      className: "text-center width-90",
      columns: [
        {
          Header: "",
          accessor: "qtOrd",
          className: "text-center",
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="qtOrd"/>
          ),
          percent: 5,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "EX FTY",
      accessor: "dtsExfty",
      className: "text-center width-90",
      columns: [
        {
          Header: "",
          accessor: "dtsExfty",
          className: "text-center",
          Cell: ({row}: any) => (
            <DateColumn row={row} columnName="dtsExfty"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "DATE",
      columns: DATE_COLUMNS,
    },
    {
      Header: "JOB",
      accessor: "jobCnt",
      columns: [
        {
          Header: "",
          accessor: "jobCnt",
          className: "text-center",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "COLOR",
      accessor: "nmClr",
      columns: [
        {
          Header: "",
          accessor: "nmClr",
          className: "text-start",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "SIZE",
      accessor: "nmSz",
      columns: [
        {
          Header: "",
          accessor: "nmSz",
          className: "text-center",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "QUANTITY",
      columns: QTY_COLUMNS,
    },
    {
      Header: "PERFORMANCE",
      columns: PERFORMANCE_COLUMNS,
    },
    {
      Header: "SEWING",
      columns: SEWING_COLUMNS,
    },
    {
      Header: "STOCK",
      accessor: "stock",
      className: "text-center",
      columns: [
        {
          Header: "",
          accessor: "stock",
          className: "text-center",
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="stock"/>
          ),
          percent: 7,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
  ];
};
