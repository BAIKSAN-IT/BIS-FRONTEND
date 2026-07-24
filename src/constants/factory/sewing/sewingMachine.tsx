export interface SEWING_COLUMNS_TYPE {
  nmKntmac: string;
  nmKntmacNm: string;
  deviceOperatingStatus: string;
  ttQtFprid: string;
  idStyle: string;
  status: string;
  pageNum: string;
  totalCnt: string;
}

export const SEWING_MACHINE_COLUMNS = [
  {
    Header: "ROW",
    accessor: "locRow",
    className: "text-center height-50",
  },
  {
    Header: "1",
    accessor: "l01",
  },
  {
    Header: "2",
    accessor: "l02",
  },
  {
    Header: "3",
    accessor: "l03",
  },
  {
    Header: "4",
    accessor: "l04",
  },
  {
    Header: "5",
    accessor: "l05",
  },
  {
    Header: "6",
    accessor: "l06",
  },
  {
    Header: "7",
    accessor: "l07",
  },
  {
    Header: "8",
    accessor: "l08",
  },
  {
    Header: "9",
    accessor: "l09",
  },
  {
    Header: "10",
    accessor: "l10",
  },
  {
    Header: "11",
    accessor: "l11",
  },
  {
    Header: "12",
    accessor: "l12",
  },
  {
    Header: "13",
    accessor: "l13",
  },
  {
    Header: "14",
    accessor: "l14",
  },
  {
    Header: "15",
    accessor: "l15",
  },
  {
    Header: "16",
    accessor: "l16",
  },
  {
    Header: "17",
    accessor: "l17",
  },
  {
    Header: "18",
    accessor: "l18",
  },
  {
    Header: "19",
    accessor: "l19",
  },
  {
    Header: "20",
    accessor: "l20",
  },
  {
    Header: "21",
    accessor: "l21",
  },
  {
    Header: "22",
    accessor: "l22",
  },
  {
    Header: "W",
    accessor: "l23",
  },
  {
    Header: "X",
    accessor: "l24",
  },
  
];


export interface SEWING_MACHINE_COLUMNS_TYPE {
  locRow: string;
  l01: string;
  l02: string;
  l03: string;
  l04: string;
  l05: string;
  l06: string;
  l07: string;
  l08: string;
  l09: string;
  l10: string;
  l11: string;
  l12: string;
  l13: string;
  l14: string;
  l15colO: string;
  l16: string;
  l17: string;
  l18: string;
  l19: string;
  l20: string;
  l21: string;
  l22: string;
  l23: string;
  l24: string;
}


export interface SewingContainerProps {
  flag: string;
}
