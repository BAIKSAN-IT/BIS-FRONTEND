import {
  CommaColumn,
  DateColumn,
  PercentColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const PACKING_COLUMNS = [
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
      <DateColumn row={row} columnName="cutSdate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="END<br/>DATE" />,
    accessor: "cutEDate",
    className: "text-center width-90",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="cutEdate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="JOB<br/>CNT" />,
    accessor: "jobCnt",
    className: "text-center",
  },
  {
    Header: () => <TitleEnterCell header="TTL_CUT<br/>QTY" />,
    accessor: "qtTtlcut",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="qtTtlcut" />
    ),
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
    Header: "COLOR",
    accessor: "nmClr",
    className: "text-center",
  },
  {
    Header: () => <TitleEnterCell header="COLOR<br/>QTY" />,
    accessor: "clrQty",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="clrQty" />
    ),
  },
  {
    Header: "SIZE",
    accessor: "nmSz",
    className: "text-center",
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
    Header: () => <TitleEnterCell header="TTL_CLR<br/>SEW IN" />,
    accessor: "ttlClrsewin",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlClrsewin" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL<br/>SEW IN" />,
    accessor: "ttlSewin",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlSewin" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL_CLR<br/>SEW" />,
    accessor: "ttlClrsew",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlClrsew" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL_SZ<br/>SEW" />,
    accessor: "ttlSew",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlSew" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="CLR_SEW<br/>RATE" />,
    accessor: "clrSewrate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="clrSewrate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="SZ_SEW<br/>RATE" />,
    accessor: "szSewrate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="szSewrate" />
    ),
  },
  {
    Header: "CLR_PAK",
    accessor: "clrPak",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="clrPak" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="PAK<br/>QTY" />,
    accessor: "qtPak",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="qtPak" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="CLR<br/>RATE" />,
    accessor: "clrRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="clrRate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="SZ<br/>RATE" />,
    accessor: "szRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="szRate" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL_CLR<br/>PAK" />,
    accessor: "ttlClrPak",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlClrPak" />
    ),
  },
  {
    Header: () => <TitleEnterCell header="TTL<br/>PAK" />,
    accessor: "ttlPak",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <CommaColumn row={row} columnName="ttlPak" />
    ),
  },
];

export interface PACKING_COLUMNS_TYPE {
  sw: string;
  seqStyle: string;
  nmBuyer: string;
  seqOrd: string;
  seqDo: string;
  seqClr: string;
  seqSz: string;
  jobCnt: string;
  cutSdate: string;
  cutEdate: string;
  qtTtlcut: string;
  noStyle: string;
  dtsExfty: string;
  qtOrd: string;
  nmClr: string;
  nmSz: string;
  clrQty: string;
  szQty: string;
  ttlClrsewin: string;
  ttlSewin: string;
  ttlClrsew: string;
  ttlSew: string;
  clrSewrate: string;
  szSewrate: string;
  clrPak: string;
  qtPak: string;
  clrRate: string;
  szRate: string;
  ttlClrPak: string;
  ttlPak: string;
  numClr: string;
  numSz: string;
}
