import {CommaColumn, DateColumn, PercentColumn,} from "@utils/CommonUtilJsx";

export const MainPackingTableColumns = () => [
  {
    Header: "BUYER",
    accessor: "nmBuyer",
    columns: [
      {
        Header: "",
        accessor: "nmBuyer",
        className: "text-start width-10",
        percent: 10,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "STYLE",
    accessor: "noStyle",
    columns: [
      {
        Header: "",
        accessor: "noStyle",
        className: "text-start width-10",
        percent: 10,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    rowSpan: 2,
  },
  {
    Header: "EX_FTY",
    accessor: "dtsExfty",
    columns: [
      {
        Header: "",
        accessor: "dtsExfty",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <DateColumn row={row} columnName="dtsExfty"/>
        ),
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center width-90",
    rowSpan: 2,
  },
  {
    Header: "START",
    accessor: "cutSDate",
    columns: [
      {
        Header: "",
        accessor: "cutSDate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <DateColumn row={row} columnName="cutSdate"/>
        ),
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center width-90",
    rowSpan: 2,
  },
  {
    Header: "END",
    accessor: "cutEDate",
    columns: [
      {
        Header: "",
        accessor: "cutEDate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <DateColumn row={row} columnName="cutEdate"/>
        ),
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center width-90",
    rowSpan: 2,
  },
  {
    Header: "JOB",
    accessor: "jobCnt",
    columns: [
      {
        Header: "",
        accessor: "jobCnt",
        className: "text-center width-10",
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    rowSpan: 2,
    className: "text-center",
  },
  {
    Header: "TTL_CUT/QTY",
    accessor: "qtTtlcut",
    columns: [
      {
        Header: "",
        accessor: "qtTtlcut",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="qtTtlcut"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "ORDER/QTY",
    accessor: "qtOrd",
    columns: [
      {
        Header: "",
        accessor: "qtOrd",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="qtOrd"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "COLOR",
    accessor: "nmClr",
    columns: [
      {
        Header: "",
        accessor: "nmClr",
        className: "text-center width-10",
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "COLOR/QTY",
    accessor: "clrQty",
    columns: [
      {
        Header: "",
        accessor: "clrQty",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="clrQty"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "SIZE",
    accessor: "nmSz",
    columns: [
      {
        Header: "",
        accessor: "nmSz",
        className: "text-center width-10",
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "SIZE/QTY",
    accessor: "szQty",
    columns: [
      {
        Header: "",
        accessor: "szQty",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="szQty"/>
        ),
        percent: 3,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL_CLR/SEW IN",
    accessor: "ttlClrsewin",
    columns: [
      {
        Header: "",
        accessor: "ttlClrsewin",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlClrsewin"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL/SEW IN",
    accessor: "ttlSewin",
    columns: [
      {
        Header: "",
        accessor: "ttlSewin",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlSewin"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL_CLR/SEW",
    accessor: "ttlClrsew",
    columns: [
      {
        Header: "",
        accessor: "ttlClrsew",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlClrsew"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL_SZ/SEW",
    accessor: "ttlSew",
    columns: [
      {
        Header: "",
        accessor: "ttlSew",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlSew"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "CLR_SEW/RATE",
    accessor: "clrSewrate",
    columns: [
      {
        Header: "",
        accessor: "clrSewrate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <PercentColumn row={row} columnName="clrSewrate"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "SZ_SEW/RATE",
    accessor: "szSewrate",
    columns: [
      {
        Header: "",
        accessor: "szSewrate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <PercentColumn row={row} columnName="szSewrate"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "CLR_PAK",
    accessor: "clrPak",
    columns: [
      {
        Header: "",
        accessor: "clrPak",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="clrPak"/>
        ),
        percent: 4,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "PAK/QTY",
    accessor: "qtPak",
    columns: [
      {
        Header: "",
        accessor: "qtPak",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="qtPak"/>
        ),
        percent: 4,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "CLR/RATE",
    accessor: "clrRate",
    columns: [
      {
        Header: "",
        accessor: "clrRate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <PercentColumn row={row} columnName="clrRate"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "SZ/RATE",
    accessor: "szRate",
    columns: [
      {
        Header: "",
        accessor: "szRate",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <PercentColumn row={row} columnName="szRate"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL_CLR/PAK",
    accessor: "ttlClrPak",
    columns: [
      {
        Header: "",
        accessor: "ttlClrPak",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlClrPak"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
  {
    Header: "TTL/PAK",
    accessor: "ttlPak",
    columns: [
      {
        Header: "",
        accessor: "ttlPak",
        className: "text-center width-10",
        Cell: ({row}: { row: any }) => (
          <CommaColumn row={row} columnName="ttlPak"/>
        ),
        percent: 5,
        minWidth: 20,
        maxWidth: 1000,
      },
    ],
    className: "text-center",
    rowSpan: 2,
  },
];
