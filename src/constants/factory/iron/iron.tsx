import { TitleEnterCell, TitleEnterRow } from "../../../utils/CommonUtilJsx";

export const defaultCreateLineColumn = (idx: any, lineCnt: number) => {
  const columns: any[] = [];

  for (let i = 0; i < lineCnt; i++) {
    columns.push({
      Header: "-",
      accessor: `bs_${i}_${idx}`,
      className: "text-center",
    });
  }

  return columns;
};

export const IRON_COLUMNS = [
  {
    Header: "Time",
    accessor: "division",
    columns: [
      {
        Header: "",
        accessor: "division",
        className: "text-center width-50 height-50",
        Cell: ({ row }: { row: any }) => (
          <TitleEnterRow row={row} columnName="division" />
        ),
      },
    ],
    rowSpan: 2,
  },
];

export interface IRON_COLUMNS_TYPE {
  division: string;
  amt1: string;
  amt2: string;
  amt3: string;
  amt4: string;
  amt5: string;
  amt6: string;
  amt7: string;
  amt8: string;
  amt9: string;
  amt10: string;
  amt11: string;
  amt12: string;
  amt13: string;
  amt14: string;
  amt15: string;
  amt16: string;
  amt17: string;
  amt18: string;
  amt19: string;
  amt20: string;
  amt21: string;
  amt22: string;
  amt23: string;
  amt24: string;
  target1: string;
  target2: string;
  target3: string;
  target4: string;
  target5: string;
  target6: string;
  target7: string;
  target8: string;
  target9: string;
  target10: string;
  target11: string;
  target12: string;
  target13: string;
  target14: string;
  target15: string;
  target16: string;
  target17: string;
  target18: string;
  target19: string;
  target20: string;
  target21: string;
  target22: string;
  target23: string;
  target24: string;
}
