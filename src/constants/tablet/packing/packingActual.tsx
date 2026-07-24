import { DateColumn, ZeroCommaColumn } from "../../../utils/CommonUtilJsx";

// get qr columns
export const PACKING_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    sort: true,
    className: "text-center",
  },
  {
    Header: "SEQ",
    accessor: "seqWk",
    className: "text-center",
  },
  {
    Header: "BUYER",
    accessor: "cdBuyer",
    sort: true,
    className: "text-center",
  },
  {
    Header: "DTS EXFTY",
    accessor: "dtsExfty",
    sort: true,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="dtsExfty" />
    ),
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
    sort: true,
    className: "text-center",
  },
  {
    Header: "PO NO",
    accessor: "noPo",
    sort: true,
    className: "text-center",
  },

  {
    Header: "D.O",
    accessor: "nmDo",
    className: "text-center",
    sort: true,
  },

  {
    Header: "COLOR",
    accessor: "nmClr",
    sort: true,
    className: "text-center",
  },
  {
    Header: "PO ORD",
    accessor: "poOrd",
    sort: true,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="poOrd" />
    ),
  },
  {
    Header: "QT ORD",
    accessor: "qtOrd",
    sort: true,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtOrd" />
    ),
  },
  {
    Header: "CUTTING",
    accessor: "qtCut",
    sort: false,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtCut" />
    ),
  },
  {
    Header: "SEWING",
    accessor: "qtSew",
    sort: false,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtSew" />
    ),
  },
  {
    Header: "PACKING",
    accessor: "qtPak",
    sort: false,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtPak" />
    ),
  },
  {
    Header: "BALANCE",
    accessor: "balance",
    sort: true,
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="balance" />
    ),
  },
];

// get input columns
export const PACKING_INPUT_COLUMNS = [
  {
    Header: "SIZE",
    accessor: "nmSz",
    className: "text-center",
  },
  {
    Header: "PO QRD",
    accessor: "poOrd",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="poOrd" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "QT QRD",
    accessor: "qtOrd",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtOrd" />
    ),
    sort: true,
    className: "text-center",
  },

  {
    Header: "CUTTING",
    accessor: "qtCut",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtCut" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "SEWING",
    accessor: "qtSew",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtSew" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "PACK",
    accessor: "qtPak",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtPak" />
    ),
    sort: false,
    className: "text-center beigeBackgroundImportant",
  },
  {
    Header: "TTL PACK",
    accessor: "qtTtlPak",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtTtlPak" />
    ),
    sort: false,
    className: "text-center",
  },
  {
    Header: "BALANCE",
    accessor: "balance",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="balance" />
    ),
    sort: true,
    className: "text-center",
  },
];

export interface PackingItems {
  isChecked: boolean;
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  dtsWk: string;
  seqWk: string;
  seqStyle: string;
  seqOrd: string;
  seqDo: string;
  seqClr: string;
  nmClr: string;
  cdBuyer: string;
  noStyle: string;
  noPo: string;
  noFile: string;
  nmDo: string;
  poOrd: string;
  qtOrd: string;
  qtCut: string;
  dtsExfty: string;
  qtSew: string;
  qtPak: string;
  balance: string;
  sewLn: string;
  timeWork: string;
  worker: string;
}

export interface PackingInputItems {
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  seqStyle: string;
  seqOrd: string;
  seqDo: string;
  seqClr: string;
  nmClr: string;
  seqSz: string;
  nmSz: string;
  noPo: string;
  nmDo: string;
  poOrd: string;
  qtOrd: string;
  qtCut: string;
  qtSew: string;
  cqtPak: string;
  qtPak: string;
  qtTtlPak: string;
  balance: string;
  dtsWk: string;
  seqWk: string;
}

export interface PackingReqInfo {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  noStyle?: string;
  sewLn?: string;
  noPo?: string;
  nmColor?: string;
  dataType?: string;
}

export interface PackingDetailReqInfo {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  seqWk?: string;
  seqStyle?: string;
  seqOrd?: string;
  seqClr?: string;
  dataType?: string;
  sewLn?: string;
  timeWork?: string;
  cdWork?: string;
}

export interface WorkInfoData {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  seqWk?: string | null;
  sewLn?: string;
  idWork?: string;
  insertDt?: string;
  dataType?: string;
  workTimeIdx?: number;
  cdBuyer?: string;
  worker?: string;
}

export interface PackingDetailParam {
  workInfo?: WorkInfoData;
  packingList?: PackingInputItems[];
}
