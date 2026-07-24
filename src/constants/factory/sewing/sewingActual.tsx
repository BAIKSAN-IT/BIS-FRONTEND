import { timeFormat } from "../../../utils/CommonUtil";
import {
  CmColumn,
  CommaColumn,
  DateColumn,
  DigitColumn,
  HourlyBox,
  NumberPercentColumn,
  RemarkColumn,
  SewingPercentColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const HOURLY_PRODUCTION_QTY = [
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

const productionQuantity = [
  {
    Header: "Target",
    accessor: "tgtProd",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <DigitColumn row={row} columnName="tgtProd" />
    ),
  },
  {
    Header: "Actual",
    accessor: "actProd",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <DigitColumn row={row} columnName="actProd" />
    ),
  },
  {
    Header: "%",
    accessor: "achProd",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <SewingPercentColumn row={row} columnName="achProd" />
    ),
  },
];

const efficiency = [
  {
    Header: "Target",
    accessor: "tgtEff",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <NumberPercentColumn row={row} columnName="tgtEff" />
    ),
  },
  {
    Header: "Actual",
    accessor: "actEff",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <NumberPercentColumn row={row} columnName="actEff" />
    ),
  },
  {
    Header: "%",
    accessor: "achEff",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => (
      <SewingPercentColumn row={row} columnName="achEff" />
    ),
  },
];

export const SEWING_ACTUAL_COLUMNS = [
  {
    Header: "Line",
    accessor: "sewLn",
    columns: [
      { Header: "", accessor: "sewLn", className: "text-center height-30" },
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
    Header: "STYLE NO",
    accessor: "noStyle",
    columns: [{ Header: "", accessor: "noStyle" }],
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
    Header: () => <TitleEnterCell header="Sew<br/>ing" />,
    accessor: "mpw4",
    columns: [
      {
        Header: "",
        accessor: "mpw4",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="mpw4" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="W.<br/>Hour" />,
    accessor: "whour",
    columns: [
      {
        Header: "",
        accessor: "whour",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DigitColumn row={row} columnName="whour" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Target<br/>Day" />,
    accessor: "tgtDay",
    columns: [
      {
        Header: "",
        accessor: "tgtDay",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="tgtDay" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Target<br/>1H" />,
    accessor: "tgtHour",
    columns: [
      {
        Header: "",
        accessor: "tgtHour",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <CommaColumn row={row} columnName="tgtHour" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Start<br/>Date" />,
    accessor: "inputDate",
    columns: [
      {
        Header: "",
        accessor: "inputDate",
        className: "text-center",
        Cell: ({ row }: { row: any }) => (
          <DateColumn row={row} columnName="inputDate" />
        ),
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "HOURLY PRODUCTION QTY",
    columns: HOURLY_PRODUCTION_QTY.map((item, idx) => ({
      Header: () => <TitleEnterCell header={timeFormat(item.endTime)} />,
      accessor: "qtSew" + (idx + 1),
      className: "text-center",
      Cell: ({ row }: { row: any }) => (
        <HourlyBox row={row} columnName={"qtSew" + (idx + 1)} />
      ),
    })),
    accessor: "",
  },
  {
    Header: "PRODUCTION QUANTITY",
    columns: productionQuantity,
    accessor: "",
  },
  {
    Header: "EFFICIENCY",
    columns: efficiency,
    accessor: "",
  },
  {
    Header: "REMARK",
    accessor: "nmRmk",
    columns: [
      {
        Header: "",
        accessor: "nmRmk",
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
  seqOrd: string;
  seqDo: string;
  cdBuyer: string;
  nmBuyer: string;
  noStyle: string;
  upcCm: string;
  smv: string;
  mpw4: string;
  whour: string;
  tmWk: string;
  helper: string;
  tgtDay: string;
  tgtHour: string;
  inputDate: string;
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
  achProd: string;
  tgtEff: string;
  actEff: string;
  achEff: string;
  totalQty: string;
  tgtProd: string;
  seqTm: string;
  tmTgt: string;
  lastHour: string;
  cdRmk: string;
  nmRmk: string;
  startHour: string;
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
