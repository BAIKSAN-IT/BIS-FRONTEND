import {
  CommaColumn,
  DigitColumn, DigitPercentColumn,
  getSewingBgClass,
  HourlyBoxBg,
  RoundTwoColumn,
  SewingPercentColumn,
  TitleEnterCell,
  ZeroCommaColumn,
} from "@utils/CommonUtilJsx";
import {timeFormat} from "@utils/CommonUtil";
import {HOURLY_PRODUCTION_QTY} from "@constants/factory/sewing/sewingActual";
import RemarkCell from "@pages/factory/sewing/hps/RemarkCell";

export const makeHourlyColumns = (data: any[]) => {
  const hourlyColumns = HOURLY_PRODUCTION_QTY.map((item, idx) => {
    const colIndex = idx + 1;
    const key = "qtSew" + colIndex;

    const getBgClass = (row: any) => {
      const val = Number(row.original[key]);
      const target = Number(row.original["tgtHour"]);

      if (!val || !target) return "";

      const ratio = val / target;

      if (ratio >= 0.9) return "hour-bg-green text-center width-50 font-700";
      if (ratio >= 0.8) return "hour-bg-orange text-center width-50 font-700";
      return "hour-bg-red text-center width-50 font-700";
    };

    const columnBase = {
      Header: () => (
        <TitleEnterCell
          header={`${timeFormat(item.startTime)}<br/>${timeFormat(item.endTime)}`}
        />
      ),
      accessor: key,
      className: (row: any) => getBgClass(row),   // ← 핵심!!!
      Cell: ({row}: { row: any }) => (
        <HourlyBoxBg row={row} columnName={key} />
      ),
    };

    // 1~8번까지는 무조건 표시
    if (colIndex <= 8) return columnBase;

    // 9번 이후는 데이터 있는 경우만 표시
    const exists = data.some((row: any) => {
      const v = row[key];
      return v !== null && v !== undefined && v !== "";
    });

    return exists ? columnBase : null;
  });

  return hourlyColumns.filter(Boolean);
};
export const lstRMK: string[] = [];
lstRMK[0] = '';
lstRMK[1] = 'Fabric Incoming Delay';
lstRMK[2] = 'Trim Material Incoming Delay';
lstRMK[3] = 'Fabric Shortage';
lstRMK[4] = 'Trim Material Shortage';
lstRMK[5] = 'New style-LINE CHANGE';
lstRMK[6] = 'Mix production (Short quantity)';
lstRMK[7] = 'Mix production (Repair)';
lstRMK[8] = 'Machine Breakedown';
lstRMK[9] = 'Too many Absence';
lstRMK[10] = 'Not Enough Cutting Qty';
lstRMK[11] = 'Lower Printing Incoming Qty';
lstRMK[12] = 'Lower Emb Incoming Qty';
lstRMK[13] = 'Helper Production Delay';
lstRMK[14] = 'Slow Job Pace';
lstRMK[15] = 'Bottleneck due to Lower Skill';
lstRMK[16] = 'Un-balanced LINE (Lower LOB%)';
lstRMK[17] = 'Bottlneck due to Manpower shortage';
lstRMK[18] = 'Overall lack of manpower';
lstRMK[19] = 'Lower Input Qty due to Material Defect';
lstRMK[20] = 'Manpower support to other FINISHING';
lstRMK[21] = 'Support to sewing LINE 1';
lstRMK[22] = 'Support to sewing LINE 2';
lstRMK[23] = 'Support to sewing LINE 3';
lstRMK[24] = 'Support to sewing LINE 4';
lstRMK[25] = 'Support to sewing LINE 5';
lstRMK[26] = 'Support to sewing LINE 6';
lstRMK[27] = 'Support to sewing LINE 7';
lstRMK[28] = 'Support to sewing LINE 8';
lstRMK[29] = 'Support to sewing LINE 9';
lstRMK[30] = 'Support to sewing LINE 10';
lstRMK[31] = 'Support to sewing LINE 11';
lstRMK[32] = 'Support to sewing LINE 12';
lstRMK[33] = 'Support to sewing LINE 13';
lstRMK[34] = 'Support to sewing LINE 14';
lstRMK[35] = 'Support to sewing LINE 15';
lstRMK[36] = 'Support to sewing LINE 16';
lstRMK[37] = 'Support to sewing LINE 17';
lstRMK[38] = 'Support to sewing LINE 18';
lstRMK[39] = 'Support to sewing LINE 19';
lstRMK[40] = 'Support to sewing LINE 20';
lstRMK[41] = 'Support to sewing LINE 21';
lstRMK[42] = 'Support to sewing LINE 22';
lstRMK[43] = 'Support to sewing LINE 23';
lstRMK[44] = 'Support to sewing LINE 24';
lstRMK[45] = 'LINE BLANK : Reason by production';
lstRMK[46] = 'LINE BLANK : Trim material in coming delay';
lstRMK[47] = 'LINE BLANK : Fabric incoming delay';
lstRMK[48] = 'LINE BLANK : Print & EMB defect';
lstRMK[49] = 'Not Confirm Pre-Cost';
lstRMK[50] = 'Black out(Generator failuer)';
lstRMK[51] = 'LINE BLANK : Nothing New Style';

const formatMMDD = (yyyymmdd?: string) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.substring(4, 6)}/${yyyymmdd.substring(6, 8)}`;
};

const productionQuantity = [
  {
    Header: () => <TitleEnterCell header="Target"/>,
    accessor: "tgtProd",
    className: "text-center width-50 font-700",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="tgtProd"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="Actual"/>,
    accessor: "actProd",
    className: "text-center width-50 font-700",
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
    className: "text-center width-50 font-700",
    Cell: ({row}: { row: any }) => (
      <DigitPercentColumn row={row} columnName="tgtEff"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="Actual"/>,
    accessor: "actEff",
    className: "text-center width-50 font-700",
    Cell: ({row}: { row: any }) => (
      <DigitPercentColumn row={row} columnName="actEff"/>
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

const orderQtyStatus = [
  {
    Header: () => <TitleEnterCell header="ORDER"/>,
    accessor: "qtOrd",
    className: "text-center font-700 width-60",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="qtOrd"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="ACTUAL"/>,
    accessor: "totalQtSew",
    className: "text-center font-700 width-60",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="totalQtSew"/>
    ),
  },
  {
    Header: () => <TitleEnterCell header="%" />,
    accessor: "totalPercent",
    className: (row: any) =>
      `text-center width-40 font-700 ${getSewingBgClass(row, "totalPercent")}`,
    Cell: ({ row }: any) => {
      const ord = Number(row.original.qtOrd);
      const acc = Number(row.original.totalQtSew);
      const percent = ord > 0 ? Math.round((acc / ord) * 100) : null;

      // 데이터 바인딩
      row.original.totalPercent = percent;

      return (
        <HourlyBoxBg
          row={row}
          columnName="totalPercent"
          isShowPercent={true}
        />
      );
    },
  },
];
export const SEWING_HPS_POPUP_COLUMNS = (
  data: any,
  onReloadDetail: (dtsWk: string) => void
) => [
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
    rowSpan: 2,
    className: "text-left width-140",
  },
  {
    Header: "Type",
    accessor: "nmItem",
    columns: [
      {Header: "", accessor: "nmItem", className: "text-center height-15"},
    ],
    className: "text-left width-90",
    rowSpan: 2,
  },
  {
    Header: "Style Number",
    accessor: "noStyle",
    columns: [
      {Header: "", accessor: "noStyle", className: "text-start height-15"},
    ],
    className: "text-left width-180",
    rowSpan: 2,
  },
  {
    Header: "QTY",
    columns: orderQtyStatus,
    className: "text-left width-200",
  },
  {
    Header: () => <TitleEnterCell header="CM<br/>($)"/>,
    accessor: "upcCm",
    className: "text-center width-50",
    columns: [
      {
        Header: "",
        accessor: "upcCm",
        className: "text-center",
        Cell: ({row}: any) => {
          const v = row.original.upcCm;
          if (v === null || v === undefined || v === "") {
            return <span></span>;
          }
          return (
            <span>
              ${Number(v).toLocaleString()}
            </span>
          );
        },
      },
    ],
    Cell: ({row}: any) => <ZeroCommaColumn row={row} columnName="upcCm"/>,
    rowSpan: 2,
  },
  {
    Header: "SMV",
    accessor: "smv",
    className: "text-center width-50",
    columns: [
      {
        Header: "",
        accessor: "smv",
        className: "text-center font-700 height-15",
        Cell: ({row}: any) => {
          const v = row.original.smv;
          return (
            <span style={{color: "blue"}}>
        {v === null || v === undefined ? "" : Number(v).toLocaleString()}
      </span>
          );
        }
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "Sewing",
    accessor: "mpw4",
    columns: [
      {Header: "", accessor: "mpw4", className: "text-center height-15"},
    ],
    className: "text-center width-50",
    Cell: ({row}: any) => <ZeroCommaColumn row={row} columnName="mpw4"/>,
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="W.<br/>Hour"/>,
    accessor: "whour",
    columns: [
      {
        Header: "",
        accessor: "whour",
        className: "text-center height-15",
        Cell: ({row}: { row: any }) => (
          <RoundTwoColumn row={row} columnName="whour"/>
        ),
      },
    ],
    className: "text-center width-50",
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Total<br/>W.Hour"/>,
    accessor: "tmWk",
    columns: [
      {Header: "", accessor: "tmWk", className: "text-center height-15"},
    ],
    className: "text-center width-50",
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
    className: "text-center width-50",
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
    className: "text-center width-50",
    rowSpan: 2,
  },
  {
    Header: () => <TitleEnterCell header="Input<br/>Date"/>,
    accessor: "inputDate",
    className: "text-center width-50",
    columns: [
      {
        Header: "",
        accessor: "inputDate",
        className: "text-center height-15",
        Cell: ({row}: any) => {
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
    className: "text-center width-50",
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
        Cell: ({row}: any) => {
          const v = row.original.ramUp;
          const color = v === "RISK" ? "red" : v === "OK" ? "blue" : "#000";
          return (
            <span style={{color}}>
              {v}
            </span>
          );
        },
      },
    ],
    className: "text-center width-55",
    rowSpan: 2,
  },


  // -------------------- SUMMARY FIXED AREA --------------------
  {
    Header: "HOURLY PRODUCTION QTY",
    columns: makeHourlyColumns(data),
    className: "text-center w-20",
  },
  {
    Header: "PRODUCTION QUANTITY",
    columns: productionQuantity,
    className: "text-center w-10",
  },
  {
    Header: "EFFICIENCY",
    columns: efficiency,
    className: "text-center w-10",
  },
  {
    Header: "Remark",
    accessor: "cdRmk",
    className: "text-left w-10",
    columns: [
      {
        Header: "",
        accessor: "cdRmk",
        className: "text-left font-700 height-15",
        Cell: ({row}: any) => <RemarkCell row={row} onCellClick={(e:any) => {
          e.stopPropagation(); // row 클릭 차단
        }}
        onUpdated={() => onReloadDetail(row.original.dtsWk)}
        />
      },
    ],
    rowSpan: 2,
  },
];
