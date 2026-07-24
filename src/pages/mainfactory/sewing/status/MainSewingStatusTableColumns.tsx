import {FactoryBarColumn, CommaColumn, DateColumn, TitleEnterCell,} from "@utils/CommonUtilJsx";
import React from "react";

/** ================= CUTTING ================= */
const CUTTING_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "cutDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="cutDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "cutTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="cutTtl"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "cutBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="cutBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "cutPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="cutPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= INPUT ================= */
const INPUT_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "inpDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="inpDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "inpTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="inpTtl"/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "inpBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="inpBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "inpPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="inpPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= SEWING ================= */
const SEWING_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "sewDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="sewDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "sewTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="sewTtl"/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "sewBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="sewBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "sewPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="sewPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= FINISHING ================= */
const FINISHING_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "finDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="finDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "finTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="finTtl"/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "finBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="finBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "finPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="finPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= PACKING ================= */
const PACKING_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "pakDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="pakDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "pakTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="pakTtl"/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "pakBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="pakBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "pakPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="pakPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

/** ================= EXPORT ================= */
const EXPORT_COLUMNS = [
  {
    Header: "DAILY",
    accessor: "expDay",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="expDay"/>,
    percent: 3,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "TOTAL",
    accessor: "expTtl",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="expTtl"/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "BALANCE",
    accessor: "expBal",
    Cell: ({row}: any) => <CommaColumn row={row} columnName="expBal" color={'red'}/>,
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
  {
    Header: "%",
    accessor: "expPer",
    Cell: ({row}: any) => (
      <FactoryBarColumn row={row} columnName="expPer"/>
    ),
    percent: 4,
    minWidth: 20,
    maxWidth: 1000,
  },
];

export const MainSewingStatusTableColumns = () => {
  return [
    {
      Header: "NO",
      accessor: "no",
      columns: [
        {
          Header: "",
          accessor: "no",
          className: "text-center width-100",
          percent: 2,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "BUYER",
      accessor: "nmBuyer",
      columns: [
        {
          Header: "",
          accessor: "nmBuyer",
          className: "text-start height-15",
          percent: 7,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "BRAND",
      accessor: "nmBrand",
      columns: [
        {
          Header: "",
          accessor: "nmBrand",
          className: "text-start height-15",
          percent: 7,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "STYLE #",
      accessor: "noStyle",
      columns: [
        {
          Header: "",
          accessor: "noStyle",
          className: "text-start height-15",
          percent: 6,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "P/O #",
      accessor: "noPo",
      columns: [
        {
          Header: "",
          accessor: "noPo",
          className: "text-start height-15",
          percent: 6,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "D/O #",
      accessor: "noDo",
      columns: [
        {
          Header: "",
          accessor: "noDo",
          className: "text-start height-15",
          percent: 6,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "G1 PO",
      accessor: "g1Po",
      columns: [
        {
          Header: "",
          accessor: "g1Po",
          className: "text-start height-15",
          percent: 6,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: () => <TitleEnterCell header={`ORDER<br/>PCS`}/>,
      accessor: "qtOrd",
      columns: [
        {
          Header: "",
          accessor: "qtOrd",
          Cell: ({row}: any) => (
            <CommaColumn row={row} columnName="qtOrd"/>
          ),
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "EX FTY",
      accessor: "dtsExfty",
      columns: [
        {
          Header: "",
          accessor: "dtsExfty",
          Cell: ({row}: any) => <DateColumn row={row} columnName="dtsExfty" color={'red'}/>,
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "COLOR",
      accessor: "clr",
      columns: [
        {
          Header: "",
          accessor: "clr",
          Cell: ({row}: any) => <DateColumn row={row} columnName="clr"/>,
          percent: 3,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "SIZE",
      accessor: "sz",
      columns: [
        {
          Header: "",
          accessor: "sz",
          Cell: ({row}: any) => <DateColumn row={row} columnName="sz"/>,
          percent: 2,
          minWidth: 20,
          maxWidth: 1000,
        },
      ],
      rowSpan: 2,
      leftSticky: true,
    },
    {
      Header: "CUTTING",
      columns: CUTTING_COLUMNS,
    },
    {
      Header: "INPUT",
      columns: INPUT_COLUMNS,
    },
    {
      Header: "SEWING",
      columns: SEWING_COLUMNS,
    },
    {
      Header: "FINISHING",
      columns: FINISHING_COLUMNS,
    },
    {
      Header: "PACKING",
      columns: PACKING_COLUMNS,
    },
    {
      Header: "EXPORT",
      columns: EXPORT_COLUMNS,
    },
  ];
};
