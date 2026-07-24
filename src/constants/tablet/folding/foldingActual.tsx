import { DateColumn, ZeroCommaColumn } from "../../../utils/CommonUtilJsx";

// get qr columns
export const FOLDING_COLUMNS = [
  {
    Header: "No",
    accessor: "no",
    className: "text-center",
  },
  {
    Header: "BUYER",
    accessor: "nmBuyer",
    className: "text-center",
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
    className: "text-center",
  },
  {
    Header: "PO NO",
    accessor: "noPo",
    className: "text-center",
  },
  {
    Header: "D.O",
    accessor: "dest",
    className: "text-center",
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
    className: "text-center",
  },
  {
    Header: "SIZE",
    accessor: "nmSz",
    className: "text-center",
  },
  /*{
    Header: "QTY",
    accessor: "qtOrd",
    className: "text-center",
  },*/
  {
    Header: "QR CODE",
    accessor: "qr",
    className: "text-center",
  },
  {
    Header: "RFID CODE",
    accessor: "rfid",
    className: "text-center",
  },
];

export interface FoldingItems {
  no: number;
  isChecked: boolean;
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  seqStyle?: string;
  noStyle?: string;
  seqOrd?: string;
  noPo?: string;
  seqDo?: string;
  dest?: string;
  seqClr?: string;
  nmClr?: string;
  seqSz?: string;
  nmSz?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  qtOrd?: string;
  poQtOrd?: string;
  qrProdImg?: string;
  rfidProdImg?: string;
  qr?: string;
  rfid?: string;
}

export interface FoldingRes {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  seqStyle?: string;
  noStyle?: string;
  seqOrd?: string;
  noPo?: string;
  seqDo?: string;
  dest?: string;
  seqClr?: string;
  nmClr?: string;
  seqSz?: string;
  nmSz?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  qtOrd?: string;
  poQtOrd?: string;
  prodImg?: string;
  qr?: string;
  rfid?: string;
}

export interface FoldingHeaderInfo {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  qr?: string;
  rfid?: string;
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

export interface RfidParam {
  workInfo?: WorkInfoData;
  foldingList?: FoldingRes[];
}
