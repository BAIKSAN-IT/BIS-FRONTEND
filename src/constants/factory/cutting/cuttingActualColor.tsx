import {
  CommaColumn,
  DateColumn,
  PercentColumn,
  SelectRemarkColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const CUTTING_STYLE_COLOR_COLUMNS = [
  {
    Header: "Table",
    accessor: "noTbl",
    className: "text-center height-50",
  },
  {
    Header: "Buyer",
    accessor: "nmBuyer",
  },
  {
    Header: "Style",
    accessor: "noStyle",
  },
  {
    Header: "EX_FTY",
    accessor: "dtsExfty",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="dtsExfty" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="START<br/>DATE" />,
    accessor: "cutSDate",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="cutSDate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="END<br/>DATE" />,
    accessor: "cutEDate",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="cutEDate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="JOB<br/>CNT" />,
    accessor: "jobCnt",
    className: "text-center",
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
  },
  {
    Header: "Size",
    accessor: "nmSz",
    className: "text-center",
  },
  {
    Header: () => <TitleEnterCell header="ORDER<br/>QTY" />,
    accessor: "qtOrd",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="qtOrd" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="SIZE<br/>QTY" />,
    accessor: "szQty",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="szQty" />
    ),
  },
  {
    Header: "Cut / Day",
    accessor: "qtCut",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="qtCut" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL_CUT<br/>QTY" />,
    accessor: "qtTtlCut",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="qtTtlCut" />
    ),
  },
  {
    Header: "Balance",
    accessor: "balance",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="balance" />
    ),
  },
  {
    Header: "+/- %",
    accessor: "cutRATE",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="cutRATE" />
    ),
  },
  {
    Header: "CUT/AVG",
    accessor: "cutDay",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="cutDay" />
    ),
  },
  {
    Header: "Input / Day",
    accessor: "sewInDay",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="sewInDay" />
    ),
  },
  {
    Header: "Total Input",
    accessor: "sewIn",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="sewIn" />
    ),
  },
  {
    Header: "Stock",
    accessor: "stock",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="stock" />
    ),
  },
  // {
  //   Header: "Remark",
  //   accessor: "remark",
  //   className: "width-220",
  //   Cell: ({ row }: { row: any }) => (
  //     <SelectRemarkColumn row={row} columnName="remark" />
  //   ),
  // },
];

export interface CUTTING_STYLE_COLOR_COLUMNS_TYPE {
  noTbl: number;
  nmBuyer: string;
  noStyle: string;
  dtsExfty: string;
  cutSDate: string;
  cutEDate: string;
  nmClr: string;
  qtOrd: string;
  clrQty: string;
  qtTtlCut: string;
  qtCut: string;
  balance: string;
  cutRATE: string;
  cutDay: string;
  sewIn: string;
  sewInDay: string;
  stock: string;
  totalCnt: string;
  rowNum: string;
  cutRank: string;
  jobCnt: string;
  szQty: string;
  nmSz: string;
  cdSz: string;
  remark: number;
}
