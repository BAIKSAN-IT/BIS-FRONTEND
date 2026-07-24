import React, { memo } from "react";
import KnittingStatusSummaryBox from "./KnittingStatusSummaryBox";
import { KNITTING_COLUMNS_TYPE } from "@constants/factory/knitting/knitting";

interface Props {
  knittingList?: KNITTING_COLUMNS_TYPE[];
}

const KnittingStatusSummaryTab = memo(({ knittingList }: Props) => {
  const row = knittingList?.[0];

  /** string | number 안전 숫자 변환 */
  const n = (v?: string | number | null) => {
    const num = Number(v);
    return isNaN(num) ? 0 : num;
  };

  /** count / percent를 위아래로 분리 */
  const formatRate = (
    total?: string | number | null,
    on?: string | number | null,
    rate?: string | number | null
  ) => {
    return `${n(total)} / ${n(on)}<br/>${n(rate)}%`;
  };

  return (
    <div className="mt-n2" style={{ display: "flex"}}>
      <KnittingStatusSummaryBox
        label="TOTAL<br/>MACHINE"
        value={`${n(row?.totalCnt)}`}
      />

      <KnittingStatusSummaryBox
        label="TODAY<br/>ACTIVE"
        value={`${n(row?.totalOn)} / ${n(row?.totalCnt)}<br/>${n(row?.totalOnRate)}%`}
      />

      <KnittingStatusSummaryBox
        label="CURRENT<br/>ACTIVE"
        value={`${n(row?.totalCurrent)} / ${n(row?.totalCnt)}<br/>${n(row?.totalCurrentRate)}%`}
      />

      <KnittingStatusSummaryBox
        label="SINGLE"
        value={formatRate(
          row?.totalSingleOn,
          row?.totalSingle,
          row?.totalSingleOnRate
        )}
        style={"#0000FF"}
      />

      <KnittingStatusSummaryBox
        label="ZURRY"
        value={formatRate(
          row?.totalZurryOn,
          row?.totalZurry,
          row?.totalZurryOnRate
        )}
        style={"#2E7D32"}
      />

      <KnittingStatusSummaryBox
        label="DOUBLE"
        value={formatRate(
          row?.totalDoubleOn,
          row?.totalDouble,
          row?.totalDoubleOnRate
        )}
        style={"#FF00FF"}
      />

      <KnittingStatusSummaryBox
        label="OTHERS"
        value={formatRate(
          row?.totalOthersOn,
          row?.totalOthers,
          row?.totalOthersOnRate
        )}
      />
    </div>
  );
});

export default KnittingStatusSummaryTab;
