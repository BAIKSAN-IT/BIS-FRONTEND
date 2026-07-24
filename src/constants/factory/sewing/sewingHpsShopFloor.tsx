import {
  CommaColumn,
  DigitColumn, getSewingBgClass,
  HourlyBox, HourlyBoxBg,
  NumberPercentColumn, RoundTwoColumn,
  SewingPercentColumn,
  TitleEnterCell,
  ZeroCommaColumn,
} from "@utils/CommonUtilJsx";
import {timeFormat} from "@utils/CommonUtil";
import {HOURLY_PRODUCTION_QTY} from "@constants/factory/sewing/sewingActual";
import {makeHourlyColumns} from "@constants/factory/sewing/sewingHps";

const formatMMDD = (yyyymmdd?: string) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.substring(4, 6)}/${yyyymmdd.substring(6, 8)}`;
};

const productionQuantity = [
  {
    Header: () => <TitleEnterCell header="Target"/>,
    accessor: "tgtProd",
    className: "text-center font-700 width-50",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="tgtProd"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="Actual"/>,
    accessor: "actProd",
    className: "text-center font-700 width-50",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="actProd"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="%"/>,
    accessor: "achProd",
    className: (row: any) =>
      `text-center width-50 font-700 ${getSewingBgClass(row, "achProd")}`,
    Cell: ({ row }: any) => {
      const tgt = Number(row.original.tgtProd);
      const act = Number(row.original.actProd);

      let percent = null;

      if (tgt > 0 && act != null) {
        percent = Math.round((act / tgt) * 100);
      }

      row.original.achProd = percent;

      return (
        <HourlyBoxBg
          row={row}
          columnName="achProd"
          isShowPercent={true}
        />
      );
    },
  },
];

const efficiency = [
  {
    Header: () => <TitleEnterCell header="Target"/>,
    accessor: "tgtEff",
    className: "text-center font-700 width-50",
    Cell: ({row}: { row: any }) => (
      <NumberPercentColumn row={row} columnName="tgtEff"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="Actual"/>,
    accessor: "actEff",
    className: "text-center font-700 width-50",
    Cell: ({row}: { row: any }) => (
      <NumberPercentColumn row={row} columnName="actEff"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="%"/>,
    accessor: "achEff",
    className: (row: any) =>
      `text-center width-50 font-700 ${getSewingBgClass(row, "achEff")}`,
    Cell: ({ row }: any) => {
      const tgt = Number(row.original.tgtEff);
      const act = Number(row.original.actEff);

      let percent = null;

      if (tgt > 0 && act != null) {
        percent = Math.round((act / tgt) * 100);
      }

      row.original.achProd = percent;

      return (
        <HourlyBoxBg
          row={row}
          columnName="achEff"
          isShowPercent={true}
        />
      );
    },
  },
];
export const SEWING_HPS_SHOP_FLOOR_POPUP_COLUMNS = (data:any)=>[
  // -------------------- LEFT FIXED AREA --------------------
  {
    Header: "Line",
    accessor: "sewLn",
    className: "text-center width-55",
    columns: [
      {Header: "", accessor: "sewLn", className: "text-center height-15"},
    ],
    Cell: ({row}: any) => <ZeroCommaColumn row={row} columnName="sewLn"/>,
    rowSpan: 2,
  },
  {
    Header: "Brand",
    accessor: "nmBrand",
    columns: [
      {Header: "", accessor: "nmBrand", className: "text-start height-15"},
    ],
    className: "text-left width-250",
    rowSpan: 2,
  },
  {
    Header: "Type",
    accessor: "nmItem",
    columns: [
      {Header: "", accessor: "nmItem", className: "text-center height-15"},
    ],
    className: "text-center width-90",
    rowSpan: 2,
  },
  {
    Header: "Style Number",
    accessor: "noStyle",
    columns: [
      {Header: "", accessor: "noStyle", className: "text-start height-15"},
    ],
    className: "text-left width-250",
    rowSpan: 2,
  },
  {
    Header: "Sewing",
    accessor: "mpw4",
    columns: [
      {Header: "", accessor: "mpw4", className: "text-center height-15"},
    ],
    className: "text-center width-80",
    Cell: ({row}: any) => <ZeroCommaColumn row={row} columnName="mpw4"/>,
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Total<br/>W.Hour"/>,
    accessor: "tmWk",
    columns: [
      {Header: "", accessor: "tmWk", className: "text-center height-15"},
    ],
    className: "text-center width-80",
    Cell: ({row}: any) => <ZeroCommaColumn row={row} columnName="tmWk"/>,
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Target<br/>/Day"/>,
    accessor: "tgtDay",
    columns: [
      {
        Header: "",
        accessor: "tgtDay",
        className: "text-center height-15",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="tgtDay"/>
        ),
      },
    ],
    className: "text-center width-80",
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Target<br/>/1H"/>,
    accessor: "tgtHour",
    columns: [
      {
        Header: "",
        accessor: "tgtHour",
        className: "text-center height-15",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="tgtHour"/>
        ),
      },
    ],
    className: "text-center width-100",
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Input<br/>Date" />,
    accessor: "inputDate",
    className: "text-center width-80",
    columns: [
      {
        Header: "",
        accessor: "inputDate",
        className: "text-center height-15",
        Cell: ({ row }: any) => {
          const v = row.original.inputDate;
          const formatted = formatMMDD(v);
          return (
            <span>
              {formatted}
            </span>
          );
        },
      },
    ],
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Input<br/>Days"/>,
    accessor: "inputDays",
    columns: [
      {
        Header: "",
        accessor: "inputDays",
        className: "text-center font-700 height-15",
        Cell: ({row}: any) => {
          const v = row.original.inputDays;
          return (
            <span style={{color: "blue"}}>
              {v === null || v === undefined ? "" : Number(v).toLocaleString()}
            </span>
          );
        },
      },
    ],
    className: "text-center width-80",
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Ramp<br/>up"/>,
    accessor: "ramUp",
    columns: [
      {
        Header: "",
        accessor: "ramUp",
        className: "text-center font-900 height-15",
        Cell: ({ row }: any) => {
          const v = row.original.ramUp;
          const color = v === "RISK" ? "red" : v === "OK" ? "blue" : "#000";
          return (
            <span style={{ color }}>
              {v}
            </span>
          );
        },
      },
    ],
    className: "text-center width-80",
    rowSpan: 2,
  },


  // -------------------- SUMMARY FIXED AREA --------------------
  {
    Header: "HOURLY PRODUCTION QTY",
    columns: makeHourlyColumns(data),
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
];
