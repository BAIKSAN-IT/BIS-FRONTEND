import { DateColumn, ZeroCommaColumn } from "../../../utils/CommonUtilJsx";

// constants
export const QR_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    sort: true,
    className: "text-center",
  },
  {
    Header: "STATUS",
    accessor: "status",
    sort: true,
    className: "text-center redImportant",
  },
  {
    Header: "QR",
    accessor: "qrCode",
    sort: true,
  },
  {
    Header: "NO PO",
    accessor: "noPo",
    sort: true,
  },

  {
    Header: "D.O",
    accessor: "dest",
    className: "text-center",
  },
  {
    Header: "BUYER",
    accessor: "nmBuyer",
    sort: true,
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
    sort: true,
  },
  {
    Header: "EXF DATE",
    accessor: "dtsExfty",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <DateColumn row={row} columnName="dtsExfty" />
    ),
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
    sort: true,
  },
  {
    Header: "SIZE",
    accessor: "nmSz",
    sort: false,
    className: "text-center",
  },
];

export const PASS_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    sort: true,
    className: "text-center",
  },
  {
    Header: "STYLE/PO",
    accessor: "noStyle",
    sort: true,
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
    sort: true,
  },

  {
    Header: "SIZE",
    accessor: "nmSz",
    className: "text-center",
  },
  {
    Header: "ORD QTY",
    accessor: "qtOrd",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtOrd" />
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
    Header: "IRON",
    accessor: "qtIron",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="qtIron" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "REJECT",
    accessor: "reject",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="reject" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "TTL SEW IN",
    accessor: "ttlSewIn",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="ttlSewIn" />
    ),
    sort: true,
    className: "text-center",
  },
  {
    Header: "TTL SEW",
    accessor: "ttlSew",
    Cell: ({ row }: { row: any }) => (
      <ZeroCommaColumn row={row} columnName="ttlSew" />
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

export const REJECT_COLUMNS = [
  {
    Header: "DEFECT POINTS",
    accessor: "nmSysdefV",
  },
];

export interface QrItems {
  isChecked: boolean;
  no: number;
  qrCode: string;
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  dtsWk: string;
  seqWk: string;
  seqStyle: string;
  noStyle: string;
  seqOrd: string;
  noPo: string;
  seqDo: string;
  do_: string;
  dest: string;
  seqClr: string;
  cdClr: string;
  nmClr: string;
  seqSz: string;
  cdSz: string;
  nmSz: string;
  cdBuyer: string;
  nmBuyer: string;
  noFile: string;
  dtsExfty: string;
  dtsShip: string;
  qtOrd: string;
  poQtOrd: string;
  qtCut: string;
  bundleQrCode: string;
  idInsert: string;
  dtInsert: string;
  dtIdx: number;
  dtsExFty: string;
  status: string;
  remark: string;
  rejectList: Array<string>;
  outProc: string;
}

export interface PassItems {
  no: number;
  noStyle: string;
  nmClr: string;
  nmSz: string;
  qtOrd: string;
  ttlSewIn: string;
  qtSew: string;
  sewing: string;
  reject: string;
  ttlSew: string;
  balance: string;
  seqClr: string;
  seqStyle: string;
  seqSz: string;
}

export interface RejectItems {
  isChecked: boolean;
  cdSysdef: string;
  nmSysdef: string;
  nmSysdefE: string;
  nmSysdefV: string;
}

export interface QrParam {
  qrCode: string;
  cdCompany?: string;
  cdBizarea?: string;
  dataType?: string;
}

export interface QrListParam {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  sewLn?: string;
}

export interface QrSaveParam {
  workInfo?: WorkInfoData;
  qrList: QrItems[];
}

export interface WorkInfoData {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  sewLn?: string;
  idWork?: string;
  workTimeIdx?: number;
}
