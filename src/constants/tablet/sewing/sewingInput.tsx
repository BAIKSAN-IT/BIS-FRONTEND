import { ZeroCommaColumn } from "../../../utils/CommonUtilJsx";

// constants
export const QR_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    className: "text-center",
  },
  {
    Header: "QR",
    accessor: "qrCode",
  },
  {
    Header: "QR SEQ",
    accessor: "iseqQrcode",
    className: "text-center",
  },
  {
    Header: "PO NO",
    accessor: "noPo",
  },
  {
    Header: "D.O",
    accessor: "dest",
    className: "text-center",
  },
  {
    Header: "BUYER",
    accessor: "nmBuyer",
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
  },
  {
    Header: "BODY/RIB",
    accessor: "partNm",
    className: "text-center",
  },
  {
    Header: "LAYER CNT",
    accessor: "layerCount",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="layerCount" />,
    className: "text-center",
  },
  {
    Header: "SEW IN",
    accessor: "qtLod",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtLod" />,
    className: "text-center",
  },
  {
    Header: "DFT CUT",
    accessor: "qtDft",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtDft" />,
    className: "text-center",
  },
  {
    Header: "BALANCE",
    accessor: "balance",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="balance" />,
    className: "text-center",
  },
];

// constants
export const QR_COLUMNS_MODIFY = [
  {
    Header: "No",
    accessor: "no",
    className: "text-center",
  },
  {
    Header: "QR",
    accessor: "qrCode",
  },
  {
    Header: "QR SEQ",
    accessor: "iseqQrcode",
    className: "text-center",
  },
  {
    Header: "PO NO",
    accessor: "noPo",
  },
  {
    Header: "D.O",
    accessor: "dest",
    className: "text-center",
  },
  {
    Header: "BUYER",
    accessor: "nmBuyer",
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
  },
  {
    Header: "BODY/RIB",
    accessor: "partNm",
    className: "text-center",
  },
  {
    Header: "LAYER CNT",
    accessor: "layerCount",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="layerCount" />,
    className: "text-center",
  },
  {
    Header: "SEW IN",
    accessor: "qtLod",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtLod" />,
    className: "text-center",
  },
  {
    Header: "DFT CUT",
    accessor: "qtDft",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtDft" />,
    className: "text-center",
  },
];

export const INPUT_COLUMNS = [
  {
    Header: "COLOR",
    accessor: "nmClr",
  },
  {
    Header: "SIZE",
    accessor: "nmSz",
    className: "text-center",
  },
  {
    Header: "QRD QTY",
    accessor: "qtOrd",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtOrd" />,
    className: "text-center",
  },
  {
    Header: "CUT QTY",
    accessor: "qtCut",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="qtCut" />,
    className: "text-center",
  },
  {
    Header: "SEW IN",
    accessor: "sewIn",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="sewIn" />,
    className: "text-center beigeBackgroundImportant",
  },
  {
    Header: "DFT IN",
    accessor: "dft",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="dft" />,
    className: "text-center beigeBackgroundImportant",
  },
  {
    Header: "SEW TTL",
    accessor: "ttlSewIn",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="ttlSewIn" />,
    sort: false,
    className: "text-center",
  },
  {
    Header: "DFT TTL",
    accessor: "ttlDft",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="ttlDft" />,
    sort: false,
    className: "text-center",
  },
  {
    Header: "BALANCE",
    accessor: "balance",
    Cell: ({ row }: { row: any }) => <ZeroCommaColumn row={row} columnName="balance" />,
    className: "text-center",
  },
];

export interface QrItems {
  isChecked: boolean;
  qrCode: string;
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  dtsWk: string;
  seqWk: string;
  seqSz: string;
  partGubun: string;
  partCount: string;
  partNm: string;
  cdBuyer: string;
  nmBuyer: string;
  noFile: string;
  seqStyle: string;
  noStyle: string;
  seqFab: string;
  seqClr: string;
  cdClr: string;
  nmClr: string;
  seqOrd: string;
  seqDo: string;
  do_: string;
  dest: string;
  layerCount: string;
  qtLod: string;
  qtDft: string;
  fabPart: string;
  idInsert: string;
  dtInsert: string;
  noPo: string;
  iseqQrcode: string;
  inputQty: string;
  balance: string;
}

export interface InputItems {
  qrCode: string;
  seqStyle: string;
  seqFab: string;
  seqOrd: string;
  seqDo: string;
  seqClr: string;
  noFile: string;
  quantity: string;
  cdBuyer: string;
  nmBuyer: string;
  nmClr: string;
  nmSz: string;
  seqSz: string;
  seqWk: string;
  dtsWk: string;
  qtOrd: string;
  qtCut: string;
  sewIn: string;
  dft: string;
  ttlSewIn: string;
  ttlDft: string;
  balance: string;
  cSewIn: string;
  cDft: string;
}

export interface BQrSaveParam {
  workInfo?: WorkInfoData;
  qrList: InputItems[];
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
  qrCode?: string;
  dataType?: string;
  iseqQrcode?: string;
  workTimeIdx?: number;
}

export interface BQrDetailParam {
  workInfo?: WorkInfoData;
  qrInfo: QrItems;
}

export type InputState = [number, string];
