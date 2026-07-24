export interface KNITTING_COLUMNS_TYPE {
  nmKntmac: string;
  nmKntmacNm: string;
  deviceOperatingStatus: string;
  ttQtFprid: string;
  idStyle: string;
  status: string;
  pageNum: string;
  totalCnt: string;
  totalOn: string;
  totalOnRate: string;
  totalCurrent: string;
  totalCurrentRate: string;
  totalDouble: string;
  totalSingle: string;
  totalZurry: string;
  totalOthers: string;
  totalDoubleOn: string;
  totalDoubleOnRate: string;
  totalSingleOn: string;
  totalSingleOnRate: string;
  totalZurryOn: string;
  totalZurryOnRate: string;
  totalOthersOn: string;
  totalOthersOnRate: string;
}

export const KNITTING_MACHINE_COLUMNS = [
  {
    Header: "ROW",
    accessor: "locRow",
    className: "text-center height-50",
  },
  {
    Header: "A",
    accessor: "colA",
  },
  {
    Header: "B",
    accessor: "colB",
  },
  {
    Header: "C",
    accessor: "colC",
  },
  {
    Header: "D",
    accessor: "colD",
  },
  {
    Header: "E",
    accessor: "colE",
  },
  {
    Header: "F",
    accessor: "colF",
  },
  {
    Header: "G",
    accessor: "colG",
  },
  {
    Header: "H",
    accessor: "colH",
  },
  {
    Header: "I",
    accessor: "colI",
  },
  {
    Header: "J",
    accessor: "colJ",
  },
  {
    Header: "K",
    accessor: "colK",
  },
  {
    Header: "L",
    accessor: "colL",
  },
  {
    Header: "M",
    accessor: "colM",
  },
  {
    Header: "N",
    accessor: "colN",
  },
  {
    Header: "O",
    accessor: "colO",
  },
  {
    Header: "P",
    accessor: "colP",
  },
  {
    Header: "Q",
    accessor: "colQ",
  },
  {
    Header: "R",
    accessor: "colR",
  },
  {
    Header: "S",
    accessor: "colS",
  },
  {
    Header: "T",
    accessor: "colT",
  },
  {
    Header: "U",
    accessor: "colU",
  },
  {
    Header: "V",
    accessor: "colV",
  },
  {
    Header: "W",
    accessor: "colW",
  },
  {
    Header: "X",
    accessor: "colX",
  },
  {
    Header: "Y",
    accessor: "colY",
  },
  {
    Header: "Z",
    accessor: "colZ",
  },

];


export interface KNITTING_MACHINE_COLUMNS_TYPE {
  locRow: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
  colF: string;
  colG: string;
  colH: string;
  colI: string;
  colJ: string;
  colK: string;
  colL: string;
  colM: string;
  colN: string;
  colO: string;
  colP: string;
  colQ: string;
  colR: string;
  colS: string;
  colT: string;
  colU: string;
  colV: string;
  colW: string;
  colX: string;
  colY: string;
  colZ: string;
}


export interface KnittingContainerProps {
  flag: string;
}
