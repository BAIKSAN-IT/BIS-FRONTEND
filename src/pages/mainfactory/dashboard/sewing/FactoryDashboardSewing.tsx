import React, {memo, useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import FactoryDashboardSewingPanel from "./FactoryDashboardSewingPanel";
import {
  BIZAREA_TARGETS,
  FactoryDashboardDailySewingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import SewingProductionStatusTable from "./SewingProductionStatusTable";
import {normalizeDate} from "@utils/numberUtils";
import SewingWorkStatusTable from "@pages/mainfactory/dashboard/sewing/SewingWorkStatusTable";
import FactoryProductionQtyAmountChart from "@pages/mainfactory/dashboard/sewing/FactoryProductionQtyAmountChart";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailySewingRes[];
  selectedTab: FactoryDashboardTab;
}

type SewingChartRow = FactoryDashboardDailySewingRes & {
  dtsWk: string;
  cdBizarea: string;
  cdFty: string;
};

const toNum = (value: any) => Number(value) || 0;

const safeDivide = (value: number, divisor: number) => {
  if (!divisor) return 0;
  return value / divisor;
};

const getLatestRow = (rows: FactoryDashboardDailySewingRes[]) => {
  const sorted = [...(rows || [])].sort((a: any, b: any) =>
    normalizeDate(b?.dtsWk ?? b?.dtsWork).localeCompare(
      normalizeDate(a?.dtsWk ?? a?.dtsWork)
    )
  );

  return sorted[0];
};

const getAvgHourWork = (
  row: any,
  hourField: string,
  workDayField: string
): number => {
  return safeDivide(toNum(row?.[hourField]), toNum(row?.[workDayField]));
};

const FactoryDashboardSewing = memo(({refs, rows, selectedTab}: Props) => {
  /**
   * 공통 정규화
   */
  const chartRows = useMemo<SewingChartRow[]>(() => {
    return (rows || []).map((item: FactoryDashboardDailySewingRes) => ({
      ...item,
      dtsWk: item.dtsWork ?? "",
      cdBizarea:
        item.cdBizarea && String(item.cdBizarea).trim() !== ""
          ? String(item.cdBizarea).trim()
          : "TOTAL",
      cdFty: "TOTAL",
    }));
  }, [rows]);

  /**
   * 상단 카드용
   */
  const summaryCards = useMemo(() => {
    return BIZAREA_TARGETS.map((target) => {
      const matchedRows = chartRows
        .filter(
          (item: any) =>
            String(item?.cdBizarea ?? "").trim() === target.chartBizarea
        )
        .sort((a: any, b: any) =>
          normalizeDate(a.dtsWk ?? a.dtsWork).localeCompare(
            normalizeDate(b.dtsWk ?? b.dtsWork)
          )
        );

      const row =
        matchedRows.length > 0
          ? matchedRows[matchedRows.length - 1]
          : undefined;

      return {
        ...target,
        row,
      };
    });
  }, [chartRows]);

  const visibleSummaryCards = useMemo(() => {
    return summaryCards.filter((card) => card.row);
  }, [summaryCards]);

  const colSize = useMemo(() => {
    const count = visibleSummaryCards.length;

    if (count <= 0) return 12;
    if (count === 1) return 12;
    if (count === 2) return 6;
    if (count === 3) return 4;
    return 3;
  }, [visibleSummaryCards]);

  /**
   * 사업장별 테이블용 원본 rows
   */
  const bizareaSummaryTables = useMemo(() => {
    return BIZAREA_TARGETS.map((target) => {
      const sourceRows = chartRows
        .filter(
          (row: any) =>
            String(row.cdBizarea ?? "").trim() === target.chartBizarea
        )
        .sort((a: any, b: any) =>
          normalizeDate(b.dtsWk ?? b.dtsWork).localeCompare(
            normalizeDate(a.dtsWk ?? a.dtsWork)
          )
        );

      return {
        cdBizarea: target.chartBizarea,
        title: target.title,
        sourceRows,
      };
    });
  }, [chartRows]);

  const visibleBizareaSummaryTables = useMemo(() => {
    return bizareaSummaryTables.filter((item) => item.sourceRows.length > 0);
  }, [bizareaSummaryTables]);

  /**
   * 첫 번째 테이블의 평균작업시간은
   * 2, 3, 4번째 테이블의 평균작업시간을 더해서 / 3 처리
   */
  const firstTableAvgHourWorkOverride = useMemo(() => {
    const targetTables = visibleBizareaSummaryTables.slice(1, 4);

    if (targetTables.length !== 3) return null;

    const latestRows = targetTables
      .map((item) => getLatestRow(item.sourceRows))
      .filter(Boolean);

    if (latestRows.length !== 3) return null;

    const prevAvgHourWork =
      latestRows.reduce((sum, row) => {
        return sum + getAvgHourWork(row, "hourWorkMmPrev", "cntMmPrev");
      }, 0) / 3;

    const currAvgHourWork =
      latestRows.reduce((sum, row) => {
        return sum + getAvgHourWork(row, "hourWorkMmCurr", "cntMmCurr");
      }, 0) / 3;

    return {
      prevAvgHourWork,
      currAvgHourWork,
    };
  }, [visibleBizareaSummaryTables]);

  /**
   * 차트는 TOTAL 하나가 아니라 전체 사업장 rows를 넘겨야 4개가 그려짐
   */
  const chartAllRows = useMemo(() => {
    return [...chartRows];
  }, [chartRows]);

  return (
    <Row style={{height: "200px"}}>
      {visibleSummaryCards.map((card) => (
        <Col
          className="mt-n2"
          key={card.chartBizarea}
          xs={colSize}
          md={colSize}
          xl={colSize}
          style={{minWidth: 0, overflow: "hidden"}}
        >
          <FactoryDashboardSewingPanel
            row={card.row}
            title={card.title}
            selectedTab={selectedTab}
          />
        </Col>
      ))}

      {visibleBizareaSummaryTables.map((item, index) => (
        <Col
          key={item.cdBizarea}
          xs={colSize}
          md={colSize}
          xl={colSize}
          className="mt-1 overflow-auto"
          style={{minWidth: 0}}
        >
          <SewingProductionStatusTable rows={item.sourceRows} />
          <SewingWorkStatusTable
            rows={item.sourceRows}
            avgHourWorkOverride={
              index === 0 ? firstTableAvgHourWorkOverride : null
            }
          />
        </Col>
      ))}

      {chartAllRows.length > 0 && (
        <Col xs={12} md={12} xl={12}>
          <FactoryProductionQtyAmountChart
            refs={refs}
            rows={chartAllRows}
            selectedTab={selectedTab}
            period="TODAY"
          />
        </Col>
      )}
    </Row>
  );
});

export default FactoryDashboardSewing;
