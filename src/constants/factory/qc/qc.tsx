import {
  QcNumberPercentColumn,
  TitleEnterCell,
} from "../../../utils/CommonUtilJsx";

export const QC_COLUMNS = [
  {
    Header: () => <TitleEnterCell header="Defects<br/>Description" />,
    accessor: "nmDefect",
    className: "text-center",
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    Header: () => <TitleEnterCell header={`Line<br/>${i + 1}`} />,
    accessor: `qtDefect${i < 9 ? "0" + (i + 1) : i + 1}`,
    className: "text-center",
  })),
  {
    Header: () => <TitleEnterCell header="TOTAL<br/>DEFECTIVE<br/>QTY" />,
    accessor: "qtTtlDefect",
    className: "text-center",
  },
  {
    Header: () => <TitleEnterCell header="TOTAL<br/>DEFECTIVE<br/>%" />,
    accessor: "qtTtlRate",
    className: "text-center",
    Cell: ({ row }: { row: any }) => (
      <QcNumberPercentColumn row={row} columnName="qtTtlRate" />
    ),
  },
];

export interface QC_COLUMNS_TYPE {
  cdDefect: string;
  nmDefect: string;
  qtDefect01: string;
  qtDefect02: string;
  qtDefect03: string;
  qtDefect04: string;
  qtDefect05: string;
  qtDefect06: string;
  qtDefect07: string;
  qtDefect08: string;
  qtDefect09: string;
  qtDefect10: string;
  qtDefect11: string;
  qtDefect12: string;
  qtDefect13: string;
  qtDefect14: string;
  qtDefect15: string;
  qtDefect16: string;
  qtDefect17: string;
  qtDefect18: string;
  qtDefect19: string;
  qtDefect20: string;
  qtDefect21: string;
  qtDefect22: string;
  qtDefect23: string;
  qtDefect24: string;
  qtTtlDefect: string;
  qtTtl: string;
  qtRate01: string;
  qtRate02: string;
  qtRate03: string;
  qtRate04: string;
  qtRate05: string;
  qtRate06: string;
  qtRate07: string;
  qtRate08: string;
  qtRate09: string;
  qtRate10: string;
  qtRate11: string;
  qtRate12: string;
  qtRate13: string;
  qtRate14: string;
  qtRate15: string;
  qtRate16: string;
  qtRate17: string;
  qtRate18: string;
  qtRate19: string;
  qtRate20: string;
  qtRate21: string;
  qtRate22: string;
  qtRate23: string;
  qtRate24: string;
  qtTtlRate: string;
  maxLn: string;
}

export interface DEFECTS_COLUMNS_TYPE {
  cdDefect: string;
  nmDefect: string;
  qtDefect: string;
  qtTtl: string;
  qtRate: string;
  rate: string;
  ranks: string;
}
