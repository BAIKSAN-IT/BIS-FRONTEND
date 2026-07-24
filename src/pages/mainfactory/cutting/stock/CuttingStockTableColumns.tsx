import {BarColumn, CommaColumn, DateColumn, PercentColumn,} from "@utils/CommonUtilJsx";

/** ================= CUT 날짜 ================= */
const CUT_COLUMNS = [
  {
    Header: "START",
    accessor: "cutSwk",
    Cell: ({row}: any) => <DateColumn row={row} columnName="cutSwk"/>,
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "END",
    accessor: "cutEwk",
    Cell: ({row}: any) => <DateColumn row={row} columnName="cutEwk"/>,
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= SEWING 날짜 ================= */
const SEWING_COLUMNS = [
  {
    Header: "START",
    accessor: "sewSdt",
    Cell: ({row}: any) => <DateColumn row={row} columnName="sewSdt"/>,
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "END",
    accessor: "sewEdt",
    Cell: ({row}: any) => <DateColumn row={row} columnName="sewEdt"/>,
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= STATUS ================= */
const STATUS_COLUMNS = [
  {
    id: "cutStatus",
    Header: "CUT",
    accessor: "cutStatus",
    Cell: ({row}: any) => (
      <BarColumn row={row} columnName="cutStatus"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    id: "sewStatus",
    Header: "SEWING",
    accessor: "sewStatus",
    Cell: ({row}: any) => (
      <BarColumn row={row} columnName="sewStatus"/>
    ),
    percent: 5,
    minWidth: 20,
    maxWidth: 1000,
  },
];

export const CuttingStockTableColumns = () => {
  return [
    {
      Header: "No",
      accessor: "no",
      columns: [
        {
          Header: "",
          accessor: "no",
          className: "text-center width-100",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "Buyer",
      accessor: "nmBuyer",
      columns: [
        {
          Header: "",
          accessor: "nmBuyer",
          className: "text-start height-15",
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
          className: "text-start height-15",
          percent: 10,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "PO(DO)",
      accessor: "noPo",
      columns: [
        {
          Header: "",
          accessor: "noPo",
          className: "text-start height-15",
          percent: 10,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "ORD QTY",
      accessor: "qtOrd",
      columns: [
        {
          Header: "",
          accessor: "qtOrd",
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
      Header: "PO QTY",
      accessor: "poOrd",
      columns: [
        {
          Header: "",
          accessor: "poOrd",
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="poOrd"/>
          ),
          percent: 5,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "CUT QTY",
      accessor: "qtCut",
      columns: [
        {
          Header: "",
          accessor: "qtCut",
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="qtCut"/>
          ),
          percent: 5,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "CUT(%)",
      accessor: "qtRate",
      columns: [
        {
          Header: "",
          accessor: "qtRate",
          Cell: ({row}: any) => (
            <PercentColumn row={row} columnName="qtRate"/>
          ),
          percent: 7,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "SEWING IN",
      accessor: "qtSewIn",
      columns: [
        {
          Header: "",
          accessor: "qtSewIn",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <CommaColumn row={row} columnName="qtSewIn"/>
          ),
          percent: 5,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "STOCK QTY",
      accessor: "cutStock",
      columns: [
        {
          Header: "",
          accessor: "cutStock",
          className: 'w-5',
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="cutStock"/>
          ),
          percent: 5,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      className: 'w-5',
      rowSpan: 2,
    },
    {
      Header: "CUT DATE",
      columns: CUT_COLUMNS,
    },
    {
      Header: "SEWING DATE",
      columns: SEWING_COLUMNS,
    },
    {
      Header: "STATUS",
      columns: STATUS_COLUMNS,
    },
  ];
};
