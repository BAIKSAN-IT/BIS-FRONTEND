import { timeFormat } from "../../../utils/CommonUtil";

import {
  CmColumn,
  CommaColumn,
  PercentColumn,  
  DateColumn,
  DigitColumn,
  HourlyBox,
  NumberPercentColumn,
  RemarkColumn,
  SewingPercentColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const HOURLY_SEWINGINPUT_QTY = [
  { startTime: "0730", endTime: "0830" },
  { startTime: "0830", endTime: "0930" },
  { startTime: "0930", endTime: "1030" },
  { startTime: "1030", endTime: "1130" },
  { startTime: "1230", endTime: "1330" },
  { startTime: "1330", endTime: "1430" },
  { startTime: "1430", endTime: "1530" },
  { startTime: "1530", endTime: "1630" },
  { startTime: "1630", endTime: "1730" },
  { startTime: "1800", endTime: "1900" },
  { startTime: "1900", endTime: "2030" },
];

const cuttingQuantity = [
  {
    Header: "QTY",
    accessor: "qtTtlcut",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <DigitColumn row={row} columnName="qtTtlcut" />
    ),
  },
  {
    Header: "%",
    accessor: "rateCutsewin",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="rateCutsewin" />
    ),
  },
];

const sewinQuantity = [
  {
    Header: "QTY",
    accessor: "qtTtlsewin",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <DigitColumn row={row} columnName="qtTtlsewin" />
    ),
  },
  {
    Header: "%",
    accessor: "rateSewin",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <PercentColumn row={row} columnName="rateSewin" />
    ),
  },
];

export const SEWING_ACTUAL_COLUMNS = [
  {
    Header: "LINE",
    accessor: "sewLn",
    columns: [
      { Header: "", accessor: "sewLn", className: "text-center height-30" },
    ],
    rowSpan: 2,
  },
  {
    Header: "BUYER",
    accessor: "nmBuyer",
    columns: [{ Header: "", accessor: "nmBuyer" }],
    rowSpan: 2,
  },
  {
    Header: "STYLE NO",
    accessor: "noStyle",
    columns: [{ Header: "", accessor: "noStyle" }],
    rowSpan: 2,
  },
  {
    Header: "PO",
    accessor: "noPo",
    columns: [{ Header: "", accessor: "noPo" }],
    rowSpan: 2,
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
    columns: [{ Header: "", accessor: "nmClr" }],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="ORDER<br/>QTY" />,
    accessor: "qtOrd",
    columns: [
      {
        Header: "",
        accessor: "qtOrd",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DigitColumn row={row} columnName="qtOrd" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="PO<br/>QTY" />,
    accessor: "qtPo",
    columns: [
      {
        Header: "",
        accessor: "qtPo",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DigitColumn row={row} columnName="qtPo" />
        ),
      },
    ],
    rowSpan: 2,
  },  
  {
    Header: "CM($)",
    accessor: "upcCm",
    columns: [
      {
        Header: "",
        accessor: "upcCm",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CmColumn row={row} columnName="upcCm" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="START<br/>CUT" />,
    accessor: "cutSdate",
    columns: [
      {
        Header: "",
        accessor: "cutSdate",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DateColumn row={row} columnName="cutSdate" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="END<br/>CUT" />,
    accessor: "cutEdate",
    columns: [
      {
        Header: "",
        accessor: "cutEdate",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DateColumn row={row} columnName="cutEdate" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="INPUT<br/>START" />,
    accessor: "dtsStart",
    columns: [
      {
        Header: "",
        accessor: "dtsStart",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DateColumn row={row} columnName="dtsStart" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "HOURLY SEWING INPUT QTY",
    columns: HOURLY_SEWINGINPUT_QTY.map((item, idx) => ({
      Header: () => <TitleEnterCell header={timeFormat(item.endTime)} />,
      accessor: "qtSew" + (idx + 1),
      className: "text-center",
      Cell: ({ row }: { row: any }) => (
        <DigitColumn row={row} columnName={"qtSew" + (idx + 1)} />
        //<HourlyBoxNo row={row} columnName={"qtSew" + (idx + 1)} />
      ),
    })),
    accessor: "",
  },
  {
    Header: () => <TitleEnterCell header="TODAY<br/>QTY" />,
    accessor: "actProd",
    columns: [
      {
        Header: "",
        accessor: "actProd",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DigitColumn row={row} columnName="actProd" />
        ),
      },
    ],
    rowSpan: 2,
  },

  {
    Header: "CUTTING QUANTITY",
    columns: cuttingQuantity,
    accessor: "cuttingHeader",
  },
  {
    Header: () => <TitleEnterCell header="SEWIN INPUT<br/>QUANTITY" />,
    columns: sewinQuantity,
    accessor: "sewInHeader",
  },
  {
    Header: "REMARK",
    accessor: "nmRmk",
    columns: [
      {
        Header: "",
        accessor: "nmRmk",
        className: "text-left width-60",
        Cell: ({ row }: { row: any }) => (
          <RemarkColumn row={row} columnName="nmRmk" />
        ),
      },
    ],
    rowSpan: 2,
  },
];

export interface SEWING_ACTUAL_TYPE {
  sewLn: string;
  cdBizarea: string;
  dtsWk: string;
  cdFty: string;
  seqStyle: string;
  noPo: string;
  nmDo: string;
  nmClr: string;
  seqOrd: string;
  seqDo: string;
  cdBuyer: string;
  nmBuyer: string;
  qtOrd:string;
  qtPo:string;
  qtTtlsewin:string;
  dtsStart:string;
  cutSdate:string;
  cutEdate:string;
  qtTtlcut:string;
  noStyle: string;
  upcCm: string;
  qtSew1: string;
  qtSew2: string;
  qtSew3: string;
  qtSew4: string;
  qtSew5: string;
  qtSew6: string;
  qtSew7: string;
  qtSew8: string;
  qtSew9: string;
  qtSew10: string;
  qtSew11: string;
  actProd: string;
  rateCutsewin: string;
  rateSewin: string;
  totalQty: string;
  cdRmk: string;
  nmRmk: string;
}

export interface SEWING_TIME_TYPE {
  startTime: string;
  endTime: string;
}

export interface SEWING_ACTUAL_DEFECT_TYPE {
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  sewLn: string;
  cdDefect: string;
  nmDefect: string;
  qtInsp: string;
  qtOk: string;
  qtDefect: string;
  ttlDefect: string;
  ttlRate: string;
  rate: string;
  ranks: string;
}

export interface SEWING_DATA {
  actual: SEWING_ACTUAL_TYPE[][];
  defect: SEWING_ACTUAL_DEFECT_TYPE[][];
}
