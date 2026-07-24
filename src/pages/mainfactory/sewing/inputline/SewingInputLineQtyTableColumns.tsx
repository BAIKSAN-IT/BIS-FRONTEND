import {
  BarColumn, CmColumn,
  CommaColumn,
  DateColumn, DigitColumn,
  PercentColumn, RemarkColumn, TitleEnterCell,
} from "@utils/CommonUtilJsx";
import {HOURLY_SEWINGINPUT_QTY} from "@constants/factory/sewing/sewingInputLine";
import {timeFormat} from "@utils/CommonUtil";

const cuttingQuantity = [
  {
    Header: "QTY",
    accessor: "qtTtlcut",
    className: "text-center width-60",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="qtTtlcut"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "rateCutsewin",
    className: "text-center width-60",
    Cell: ({row}: { row: any }) => (
      <PercentColumn row={row} columnName="rateCutsewin"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
];

const sewinQuantity = [
  {
    Header: "QTY",
    accessor: "qtTtlsewin",
    className: "text-center width-60",
    Cell: ({row}: { row: any }) => (
      <DigitColumn row={row} columnName="qtTtlsewin"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "rateSewin",
    className: "text-center width-60",
    Cell: ({row}: { row: any }) => (
      <PercentColumn row={row} columnName="rateSewin"/>
    ),
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
];

export const SewingInputLineQtyTableColumns = () => {
  return [
    {
      Header: "LINE",
      accessor: "sewLn",
      columns: [
        {
          Header: "",
          accessor: "sewLn",
          className: "text-center height-30",
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "BUYER",
      accessor: "nmBuyer",
      columns: [{
        Header: "",
        accessor: "nmBuyer",
        className: "text-start height-30",
        percent: 7,
        minWidth: 20,
        maxWidth: 1000,
      }],
      rowSpan: 2,
    },
    {
      Header: "STYLE NO",
      accessor: "noStyle",
      columns: [{
        Header: "",
        accessor: "noStyle",
        className: "text-start height-30",
        percent: 7,
        minWidth: 20,
        maxWidth: 1000,
      }],
      rowSpan: 2,
    },
    {
      Header: "PO",
      accessor: "noPo",
      columns: [{
        Header: "",
        accessor: "noPo",
        className: "text-start height-30",
        percent: 7,
        minWidth: 20,
        maxWidth: 1000,
      }],
      rowSpan: 2,
    },
    {
      Header: "COLOR",
      accessor: "nmClr",
      columns: [{
        Header: "",
        accessor: "nmClr",
        className: "text-start height-30",
        percent: 7,
        minWidth: 20,
        maxWidth: 1000,
      }],
      rowSpan: 2,
    },
    {
      Header: () => <TitleEnterCell header="ORDER<br/>QTY"/>,
      accessor: "qtOrd",
      columns: [
        {
          Header: "",
          accessor: "qtOrd",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DigitColumn row={row} columnName="qtOrd"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: () => <TitleEnterCell header="PO<br/>QTY"/>,
      accessor: "qtPo",
      columns: [
        {
          Header: "",
          accessor: "qtPo",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DigitColumn row={row} columnName="qtPo"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
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
          Cell: ({row}: { row: any }) => (
            <CmColumn row={row} columnName="upcCm"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: () => <TitleEnterCell header="START<br/>DATE"/>,
      accessor: "cutSdate",
      columns: [
        {
          Header: "",
          accessor: "cutSdate",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DateColumn row={row} columnName="cutSdate"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: () => <TitleEnterCell header="END<br/>DATE"/>,
      accessor: "cutEdate",
      columns: [
        {
          Header: "",
          accessor: "cutEdate",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DateColumn row={row} columnName="cutEdate"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: () => <TitleEnterCell header="INPUT<br/>START"/>,
      accessor: "dtsStart",
      columns: [
        {
          Header: "",
          accessor: "dtsStart",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DateColumn row={row} columnName="dtsStart"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "HOURLY SEWING INPUT QTY",
      columns: HOURLY_SEWINGINPUT_QTY.map((item, idx) => ({
        Header: () => <TitleEnterCell header={timeFormat(item.endTime)}/>,
        accessor: "qtSew" + (idx + 1),
        className: "text-center",
        Cell: ({row}: { row: any }) => (
          <DigitColumn row={row} columnName={"qtSew" + (idx + 1)}/>
          //<HourlyBoxNo row={row} columnName={"qtSew" + (idx + 1)} />
        ),
        percent: 2,
        minWidth: 20,
        maxWidth: 1000,
      })),
      accessor: "",
    },
    {
      Header: () => <TitleEnterCell header="TODAY<br/>QTY"/>,
      accessor: "actProd",
      columns: [
        {
          Header: "",
          accessor: "actProd",
          className: "text-center",
          Cell: ({row}: { row: any }) => (
            <DigitColumn row={row} columnName="actProd"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
    },

    {
      Header: "CUTTING",
      columns: cuttingQuantity,
      accessor: "cuttingHeader",
    },
    {
      Header: () => <TitleEnterCell header="SEWIN INPUT"/>,
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
          Cell: ({row}: { row: any }) => (
            <RemarkColumn row={row} columnName="nmRmk"/>
          ),
        },
      ],
      rowSpan: 2,
    },
  ];
};
