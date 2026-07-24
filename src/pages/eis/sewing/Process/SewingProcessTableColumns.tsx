import React from "react";
import { CommaColumn, DigitColumn, SewingPercentColumn, TitleEnterCell } from "../../../../utils/CommonUtilJsx";

/* 엑셀 다운로드 */
export const multiHeader = [
  [
    "BUYER", // 0
    "STYLE NO", // 1
    "PO", // 2
    "ORD QTY", // 3
    "DO", // 4
    "COLOR", // 5
    "SIZE", // 6
    "SIZE QTY", // 7
    "INPUT", // 8 (부모)
    "", // 9 (부모에 속한 자식 컬럼 자리)
    "", // 10
    "DEFECT", // 11 (부모)
    "", // 12
    "", // 13
    "SWEING", // 14 (부모)
    "", // 15
    "", // 16
    "IRON", // 17 (부모)
    "", // 18
    "", // 19
    "FINISH QC", // 20 (부모)
    "", // 21
    "", // 22
  ],
  [
    "", // BUYER 아래는 자식 없음
    "", // STYLE NO 아래는 자식 없음
    "", // PO 아래는 자식 없음
    "", // ORD QTY 아래는 자식 없음
    "", // DO 아래는 자식 없음
    "", // COLOR
    "", // SIZE
    "", // SIZE QTY
    "QTY", // INPUT의 자식 1
    "TTL", // INPUT의 자식 2
    "RATE", // INPUT의 자식 3
    "QTY", // DEFECT의 자식 1
    "TTL", // DEFECT의 자식 2
    "RATE", // DEFECT의 자식 3
    "QTY", // SWEING 자식 ...
    "TTL",
    "RATE",
    "QTY", // IRON 자식 ...
    "TTL",
    "RATE",
    "QTY", // FINISH 자식 ...
    "TTL",
    "RATE",
  ],
];
export const merges = [
  // s: start, e: end (row, col)
  { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // INPUT  (0행, 8~10열)
  { s: { r: 0, c: 11 }, e: { r: 0, c: 13 } }, // DEFECT (0행, 11~13열)
  { s: { r: 0, c: 14 }, e: { r: 0, c: 16 } }, // SWEING
  { s: { r: 0, c: 17 }, e: { r: 0, c: 19 } }, // IRON
  { s: { r: 0, c: 20 }, e: { r: 0, c: 22 } }, // FINISH
];

const lodQuantity = [
  {
    Header: "QTY",
    accessor: "qtLod",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtLod" />,
  },
  {
    Header: "TTL",
    accessor: "qtTtlLod",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtTtlLod" />,
  },
  {
    Header: "RATE",
    accessor: "rateLod",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <SewingPercentColumn row={row} columnName="rateLod" />,
  },
];

const dftQuantity = [
  {
    Header: "QTY",
    accessor: "qtDft",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtDft" />,
  },
  {
    Header: "TTL",
    accessor: "qtTtlDft",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtTtlDft" />,
  },
  {
    Header: "RATE",
    accessor: "rateDft",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <SewingPercentColumn row={row} columnName="rateDft" />,
  },
];

const sewingInputQuantity = [
  {
    Header: "QTY",
    accessor: "qtSew",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtSew" />,
  },
  {
    Header: "TTL",
    accessor: "qtTtlSew",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtTtlSew" />,
  },
  {
    Header: "RATE",
    accessor: "rateSew",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <SewingPercentColumn row={row} columnName="rateSew" />,
  },
];

const ironQuantity = [
  {
    Header: "QTY",
    accessor: "qtIron",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtIron" />,
  },
  {
    Header: "TTL",
    accessor: "qtTtlIron",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtTtlIron" />,
  },
  {
    Header: "RATE",
    accessor: "rateIron",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <SewingPercentColumn row={row} columnName="rateIron" />,
  },
];

const qcFinishQuantity = [
  {
    Header: "QTY",
    accessor: "qtFinish",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtFinish" />,
  },
  {
    Header: "TTL",
    accessor: "qtTtlFinish",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <DigitColumn row={row} columnName="qtTtlFinish" />,
  },
  {
    Header: "RATE",
    accessor: "rateFinish",
    className: "text-center width-60",
    Cell: ({ row }: { row: any }) => <SewingPercentColumn row={row} columnName="rateFinish" />,
  },
];

export const SalesActivityTableColumns = () => {
  return [
    {
      Header: "SEQ",
      accessor: "seq",
      columns: [{ Header: "", accessor: "seq", className: "text-center height-30" }],
      rowSpan: 2,
    },
    {
      Header: "BUYER",
      accessor: "nmBuyer",
      columns: [{ Header: "", accessor: "nmBuyer", className: "text-left height-30" }],
      rowSpan: 2,
    },
    {
      Header: "STYLE NO",
      accessor: "noStyle",
      columns: [{ Header: "", accessor: "noStyle", className: "text-left height-30" }],
      rowSpan: 2,
    },
    {
      Header: "PO",
      accessor: "nmPo",
      columns: [{ Header: "", accessor: "nmPo", className: "text-left height-30" }],
      rowSpan: 2,
    },
    {
      Header: "ORD QTY",
      accessor: "qtOrd",
      columns: [
        {
          Header: "",
          accessor: "qtOrd",
          className: "text-center height-30",
          Cell: ({ row }: { row: any }) => <CommaColumn row={row} columnName="qtOrd" />,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "DO",
      accessor: "destinationOrder",
      columns: [{ Header: "", accessor: "destinationOrder", className: "text-left height-30" }],
      rowSpan: 2,
    },
    {
      Header: "EXP DATE",
      accessor: "dtsExFty",
      columns: [{ Header: "", accessor: "dtsExFty", className: "text-center height-30" }],
      rowSpan: 2,
    },
    {
      Header: "SHIP DATE",
      accessor: "dtsShip",
      columns: [{ Header: "", accessor: "dtsShip", className: "text-center height-30" }],
      rowSpan: 2,
    },
    {
      Header: "COLOR",
      accessor: "nmClr",
      columns: [{ Header: "", accessor: "nmClr", className: "text-left height-30" }],
      rowSpan: 2,
    },
    {
      Header: "SIZE",
      accessor: "nmSz",
      columns: [{ Header: "", accessor: "nmSz", className: "text-center height-30" }],
      rowSpan: 2,
    },
    {
      Header: "SIZE QTY",
      accessor: "szOrd",
      columns: [
        {
          Header: "",
          accessor: "szOrd",
          className: "text-center height-30",
          Cell: ({ row }: { row: any }) => <CommaColumn row={row} columnName="szOrd" />,
        },
      ],
      rowSpan: 2,
    },
    {
      Header: "INPUT",
      columns: lodQuantity,
      accessor: "",
    },
    {
      Header: "DEFECT",
      columns: dftQuantity,
      accessor: "",
    },
    {
      Header: "SWEING",
      columns: sewingInputQuantity,
      accessor: "",
    },
    {
      Header: "IRON",
      columns: ironQuantity,
      accessor: "",
    },
    {
      Header: "FINISH QC",
      columns: qcFinishQuantity,
      accessor: "",
    },
  ];
};
