import { TitleEnterRow, IronActualColumn } from "@utils/CommonUtilJsx";
import { isEmpty } from "@utils/CommonUtil";

/** 고정(Time) 컬럼 */
export const MAIN_IRON_COLUMNS = [
  {
    Header: "Time",
    accessor: "division",
    columns: [
      {
        Header: "",
        accessor: "division",
        className: "text-center width-50 height-50",
        Cell: ({ row }: any) => <TitleEnterRow row={row} columnName="division" />,
      },
    ],
    rowSpan: 2,
  },
];

/**
 * 라인 헤더 컬럼 생성 (기존 IronActual의 createLineColumn과 동일 개념)
 * - userData의 값으로 헤더 표기
 * - IronActualColumn 사용
 * - colSpanStat 적용
 */
export const createLineColumn = (
  userData: any[],
  lineIdx: number,
  workerCnt: number,
  colSpanStat: boolean[]
) => {
  const columns: any[] = [];

  for (let i = lineIdx * workerCnt; i < lineIdx * workerCnt + workerCnt; i++) {
    columns.push({
      Header: !isEmpty(userData?.[i]?.value) ? userData[i].value : "-",
      accessor: `amt${i + 1}`,
      className: "text-center width-50",
      Cell: ({ row }: { row: any }) => (
        <IronActualColumn row={row} columnName={`amt${i + 1}`} />
      ),
      colSpan: colSpanStat[i] ? workerCnt : 1,
    });
  }

  return columns;
};

/** 초기(빈) 라인 컬럼 */
export const defaultCreateLineColumn = (stationNo: number, workerCnt: number) => {
  const columns: any[] = [];
  // stationNo는 표시용이고 accessor는 amt1.. 형태로 실제는 동적 헤더 생성 시 교체됨
  for (let i = 0; i < workerCnt; i++) {
    columns.push({
      Header: "-",
      accessor: `bs_${stationNo}_${i}`,
      className: "text-center width-50",
    });
  }
  return columns;
};
