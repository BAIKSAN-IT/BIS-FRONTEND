import {
  DateColumn,
  NumberPercentColumn,
  PercentColumn,
  ZeroCommaColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const SEWING_INPUT_COLUMNS = [
  {
    Header: "Line",
    accessor: "noSewLn",
    className: "text-center height-50",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="noSewLn" />
    ),
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
    accessor: "sewinSDate",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="sewinSDate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="END<br/>DATE" />,
    accessor: "sewinEDate",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="sewinEDate" />
    ),
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
  },
  {
    Header: () => <TitleEnterCell header="ORDER<br/>QTY" />,
    accessor: "qtOrd",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtOrd" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="PO/DO<br/>QTY" />,
    accessor: "clrQty",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="clrQty" />
    ),
  },
  {
    Header: "Sewing IN",
    accessor: "qtLod",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtLod" />
    ),
  },
  {
    Header: "Defect",
    accessor: "qtDft",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtDft" />
    ),
  },
  {
    Header: "Defect / Rate",
    accessor: "dftRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <NumberPercentColumn row={row} columnName="dftRate" />
    ),
  },
  {
    Header: "TTL_CUTTING",
    accessor: "qtTtlCut",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtTtlCut" />
    ),
  },
  {
    Header: "+/- %",
    accessor: "cutRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="cutRate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL_SEWING<br/>INPUT" />,
    accessor: "qtTtlSewin",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtTtlSewin" />
    ),
  },
  {
    Header: "Balance",
    accessor: "balanceSewin",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="balanceSewin" />
    ),
  },
  {
    Header: "+/- %",
    accessor: "sewinRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="sewinRate" />
    ),
  },
  {
    Header: "TTL_SEWING",
    accessor: "qtTtlSew",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtTtlSew" />
    ),
  },
  {
    Header: "+/- %",
    accessor: "sewRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="sewRate" />
    ),
  },
];

export interface SEWING_INPUT_COLUMNS_TYPE {
  noSewLn: string;
  nmBuyer: string;
  noStyle: string;
  dtsExfty: string;
  cutSDate: string;
  cutEDate: string;
  sewinSDate: string;
  sewinEDate: string;
  nmClr: string;
  qtOrd: string;
  qtDft: string;
  dftRate: string;
  clrQty: string;
  qtTtlCut: string;
  balanceCut: string;
  cutRate: string;
  qtLod: string;
  qtTtlSewin: string;
  sewinRate: string;
  balanceSewin: string;
  qtTtlSew: string;
  sewRate: string;
}
