import {
  BarColumn,
  CommaColumn,
  DateColumn,
  PercentColumn,
  SelectRemarkColumn,
} from "../../../utils/CommonUtilJsx";

export const CUT_COLUMNS = [
  {
    Header: "Start Date",
    accessor: "cutSwk",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="cutSwk" />
    ),
  },
  {
    Header: "End Date",
    accessor: "cutEwk",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="cutEwk" />
    ),
  },
];

export const SEWING_COLUMNS = [
  {
    Header: "Start Date",
    accessor: "sewSdt",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="sewSdt" />
    ),
  },
  {
    Header: "End Date",
    accessor: "sewEdt",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="sewEdt" />
    ),
  },
];

export const STATUS_COLUMNS = [
  {
    Header: "CUT",
    accessor: "cutStatus",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <BarColumn row={row} columnName="cutStatus" />
    ),
  },
  {
    Header: "SEWING",
    accessor: "sewStatus",
    className: "text-center width-120",
    Cell: ({ row }: { row: any }) => (
      <BarColumn row={row} columnName="sewStatus" />
    ),
  },
];

export const CUTTING_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    columns: [
      { Header: "", accessor: "no", className: "text-center height-50" },
    ],
    rowSpan: 2,
  },
  {
    Header: "Buyer",
    accessor: "nmBuyer",
    columns: [{ Header: "", accessor: "nmBuyer" }],
    rowSpan: 2,
  },
  {
    Header: "STYLE",
    accessor: "noStyle",
    columns: [{ Header: "", accessor: "noStyle" }],
    rowSpan: 2,
  },
  {
    Header: "PO(DO)",
    accessor: "noPo",
    columns: [{ Header: "", accessor: "noPo" }],
    rowSpan: 2,
  },
  {
    Header: "ORD QTY",
    accessor: "qtOrd",
    columns: [
      {
        Header: "",
        accessor: "qtOrd",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="qtOrd" />
        ),
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
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="poOrd" />
        ),
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
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="qtCut" />
        ),
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
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <PercentColumn row={row} columnName="qtRate" />
        ),
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
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="qtSewIn" />
        ),
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
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="cutStock" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "CUT",
    columns: CUT_COLUMNS,
    accessor: "",
  },
  {
    Header: "SEWING",
    columns: SEWING_COLUMNS,
    accessor: "",
  },
  {
    Header: "STATUS",
    columns: STATUS_COLUMNS,
    accessor: "",
  },
  // {
  //   Header: "Remark",
  //   accessor: "remark",
  //   columns: [
  //     {
  //       Header: "",
  //       accessor: "remark",
  //       className: "width-220",
  //       Cell: ({ row }: { row: any }) => (
  //         <SelectRemarkColumn row={row} columnName="remark" />
  //       ),
  //     },
  //   ],
  //   rowSpan: 2,
  // },
];

export interface CUTTING_COLUMNS_TYPE {
  no: string;
  seqStyle: string;
  seqOrd: string;
  seqDo: string;
  cdBuyer: string;
  nmBuyer: string;
  noStyle: string;
  noPo: string;
  nmDo: string;
  qtOrd: string;
  poOrd: string;
  qtCut: string;
  qtRate: string;
  qtSewIn: string;
  cutStock: string;
  cutSwk: string;
  cutEwk: string;
  qtSew: string;
  sewSdt: string;
  sewEdt: string;
  cutStatus: string;
  sewStatus: string;
  cRate: string;
  sRate: string;
  totalCnt: string;
  rowNum: string;
  remark: number;
}
