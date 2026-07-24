import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  CSSProperties,
} from "react";
import {Col, Row} from "react-bootstrap";
import FactoryDashboardPersonPanel from "./FactoryDashboardPersonPanel";
import {
  BIZAREA_TARGETS,
  FactoryDashboardDailyPersonRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import CommonMultiComboChart, {
  ComboSeriesDef,
} from "@components/chart/CommonMultiComboChart";
import {InputRefMap} from "@utils/useInputRefs";
import FactoryDashboardMonthlySummaryTable, {
  MonthlySummaryRow,
} from "./FactoryDashboardMonthlySummaryTable";
import {
  formatMonthHeader,
  normalizeDate,
  toNum,
  toRate,
} from "@utils/numberUtils";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyPersonRes[] | [];
  selectedTab: FactoryDashboardTab;
}

const LINE_SERIES_META = [
  {
    id: "total",
    label: "TOTAL",
    color: "#FF0000",
    barKey: "cntPerson",
    rateKey: "cntPersonRate",
  },
  {
    id: "sewing",
    label: "SEWING",
    color: "#4e79a7",
    barKey: "cntSewPerson",
    rateKey: "cntSewRate",
  },
  {
    id: "sewgen",
    label: "SEW-GEN",
    color: "#76b7b2",
    barKey: "cntSewgenPerson",
    rateKey: "cntSewgenRate",
  },
  {
    id: "knit",
    label: "KNITTING",
    color: "#59a14f",
    barKey: "cntKnitPerson",
    rateKey: "cntKnitRate",
  },
  {
    id: "dye",
    label: "DYEING",
    color: "#e15759",
    barKey: "cntDyePerson",
    rateKey: "cntDyeRate",
  },
  {
    id: "yarn",
    label: "YARNDYE",
    color: "#F28E2B",
    barKey: "cntYarnPerson",
    rateKey: "cntYarnRate",
  },
  {
    id: "gen",
    label: "GENERAL",
    color: "#7AA7FF",
    barKey: "cntGenPerson",
    rateKey: "cntGenRate",
  },
] as const;

const LEGEND_WRAP_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "6px 8px",
  width: "100%",
  minWidth: 0,
  padding: "2px 0 0 0",
};

const LEGEND_BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  border: "1px solid #d8d8d8",
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "2px 6px",
  margin: 0,
  cursor: "pointer",
  minHeight: 22,
  maxWidth: 110,
};

const FactoryDashboardPerson = memo(({refs, rows, selectedTab}: Props) => {
  void refs;

  const [hiddenSeriesIds, setHiddenSeriesIds] = useState<string[]>([]);
  const [hideAllLines, setHideAllLines] = useState(true);

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeriesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const summaryCards = useMemo(() => {
    return BIZAREA_TARGETS.map((target) => {
      const matchedRows = rows.filter(
        (item) => (item.cdBizarea || "") === target.cdBizarea
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
  }, [rows]);

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

  const chartRows = useMemo(() => {
    return (rows || []).map((item: any) => {
      const total = toNum(item.cntPerson);

      return {
        ...item,
        dtsWk: item.dtsWork ?? item.dtsWk ?? "",
        cdBizarea:
          item.cdBizarea && String(item.cdBizarea).trim() !== ""
            ? item.cdBizarea
            : "TOTAL",
        cdFty:
          item.cdFty && String(item.cdFty).trim() !== ""
            ? item.cdFty
            : "TOTAL",

        rtSewPerson: toRate(item.cntSewPerson, total),
        rtSewgenPerson: toRate(item.cntSewgenPerson, total),
        rtKnitPerson: toRate(item.cntKnitPerson, total),
        rtDyePerson: toRate(item.cntDyePerson, total),
        rtYarnPerson: toRate(item.cntYarnPerson, total),
        rtGenPerson: toRate(item.cntGenPerson, total),
      };
    });
  }, [rows]);

  const customDates = useMemo(() => {
    const map = new Map<string, boolean>();

    (rows || []).forEach((item: any) => {
      const d = normalizeDate(item?.dtsWork ?? item?.dtsWk);
      if (d.length === 8) {
        map.set(d, true);
      }
    });

    return Array.from(map.keys()).sort().slice(-12);
  }, [rows]);

  const monthlyDates = useMemo(() => {
    const unique = Array.from(new Set(customDates))
      .filter((d) => String(d).length === 8)
      .sort()
      .reverse();

    return unique.slice(0, 12);
  }, [customDates]);

  const rightSeries = useMemo(() => {
    return [
      {
        key: "cntSewPerson",
        label: "SEWING",
        type: "bar",
        color: "#4e79a7",
        stack: "person",
        hidden: hiddenSeriesIds.includes("sewing"),
      },
      {
        key: "cntSewgenPerson",
        label: "SEW-GEN",
        type: "bar",
        color: "#76b7b2",
        stack: "person",
        hidden: hiddenSeriesIds.includes("sewgen"),
      },
      {
        key: "cntKnitPerson",
        label: "KNITTING",
        type: "bar",
        color: "#59a14f",
        stack: "person",
        hidden: hiddenSeriesIds.includes("knit"),
      },
      {
        key: "cntDyePerson",
        label: "DYEING",
        type: "bar",
        color: "#e15759",
        stack: "person",
        hidden: hiddenSeriesIds.includes("dye"),
      },
      {
        key: "cntYarnPerson",
        label: "YARNDYE",
        type: "bar",
        color: "#F28E2B",
        stack: "person",
        hidden: hiddenSeriesIds.includes("yarn"),
      },
      {
        key: "cntGenPerson",
        label: "GENERAL",
        type: "bar",
        color: "#7AA7FF",
        stack: "person",
        hidden: hiddenSeriesIds.includes("gen"),
      },

      {
        key: "rtSewPerson",
        tooltipKey: "cntSewPerson",
        label: "SEWING",
        type: "line",
        color: "#4e79a7",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("sewing"),
      },
      {
        key: "rtSewgenPerson",
        tooltipKey: "cntSewgenPerson",
        label: "SEW-GEN",
        type: "line",
        color: "#76b7b2",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("sewgen"),
      },
      {
        key: "rtKnitPerson",
        tooltipKey: "cntKnitPerson",
        label: "KNITTING",
        type: "line",
        color: "#59a14f",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("knit"),
      },
      {
        key: "rtDyePerson",
        tooltipKey: "cntDyePerson",
        label: "DYEING",
        type: "line",
        color: "#e15759",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("dye"),
      },
      {
        key: "rtYarnPerson",
        tooltipKey: "cntYarnPerson",
        label: "YARNDYE",
        type: "line",
        color: "#F28E2B",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("yarn"),
      },
      {
        key: "rtGenPerson",
        tooltipKey: "cntGenPerson",
        label: "GENERAL",
        type: "line",
        color: "#7AA7FF",
        percent: true,
        yAxisID: "y1",
        order: 1,
        borderWidth: 2,
        pointRadius: 2,
        hidden: !hideAllLines || hiddenSeriesIds.includes("gen"),
      },
    ] as ComboSeriesDef[];
  }, [hiddenSeriesIds, hideAllLines]);

  const bizareaSummaryTables = useMemo(() => {
    return BIZAREA_TARGETS.map((target) => {
      const targetRows = chartRows
        .filter(
          (row: any) =>
            String(row.cdBizarea ?? "").trim() === target.chartBizarea
        )
        .sort((a: any, b: any) =>
          normalizeDate(b.dtsWk ?? b.dtsWork).localeCompare(
            normalizeDate(a.dtsWk ?? a.dtsWork)
          )
        );

      const rowMap = new Map<string, any>();
      targetRows.forEach((row: any) => {
        const dateKey = normalizeDate(row.dtsWk ?? row.dtsWork);
        if (dateKey.length === 8 && !rowMap.has(dateKey)) {
          rowMap.set(dateKey, row);
        }
      });

      const tableRows: MonthlySummaryRow[] = LINE_SERIES_META.map((meta) => {
        const months = monthlyDates.map((dateKey, index) => {
          const currentRow = rowMap.get(dateKey) ?? {};
          const currentValue = toNum(currentRow?.[meta.barKey]);
          const currentTotal = toNum(currentRow?.cntPerson);

          return {
            dateKey,
            label: formatMonthHeader(dateKey, index === 0),
            value: currentValue,
            rate:
              meta.id === "total" && currentTotal == 100
                ? 100
                : toRate(currentValue, currentTotal),
            diffValue: toNum(currentRow?.[meta.rateKey]),
          };
        });

        return {
          key: meta.id,
          label: meta.label,
          color: meta.color,
          months,
        };
      });

      return {
        cdBizarea: target.chartBizarea,
        title: target.title,
        rows: tableRows,
      };
    });
  }, [chartRows, monthlyDates]);

  const visibleBizareaSummaryTables = useMemo(() => {
    return bizareaSummaryTables.filter((item) => {
      const bizRows = chartRows.filter(
        (row: any) => String(row.cdBizarea ?? "").trim() === item.cdBizarea
      );

      return bizRows.length > 0;
    });
  }, [bizareaSummaryTables, chartRows]);

  return (
    <Row className="g-2">
      {visibleSummaryCards.map((card) => (
        <Col
          className="mt-n2"
          key={card.chartBizarea}
          xs={colSize}
          md={colSize}
          xl={colSize}
          style={{minWidth: 0, overflow: "hidden"}}
        >
          <FactoryDashboardPersonPanel
            row={card.row}
            title={card.title}
            selectedTab={selectedTab}
          />
        </Col>
      ))}

      <Col xs={12} style={{height: "200px"}}>
        <div style={LEGEND_WRAP_STYLE}>
          {LINE_SERIES_META.filter((v) => v.id !== "total").map((item) => {
            const isHidden = hiddenSeriesIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSeries(item.id)}
                title={item.label}
                style={{
                  ...LEGEND_BUTTON_STYLE,
                  opacity: isHidden ? 0.4 : 1,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#444",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    maxWidth: 72,
                    lineHeight: 1.1,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              userSelect: "none",
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 0,
              padding: "2px 6px",
              border: "1px solid #d8d8d8",
              borderRadius: 12,
              backgroundColor: "#fff",
              minHeight: 22,
            }}
          >
            <input
              type="checkbox"
              checked={hideAllLines}
              onChange={(e) => setHideAllLines(e.target.checked)}
            />
            <span style={{color: "#d11a2a"}}>LINE VIEW</span>
          </label>
        </div>

        {visibleBizareaSummaryTables.map((item, idx) => (
          <Row className={`g-2 ${idx > 0 ? "mt-n4" : ""}`} key={item.cdBizarea}>
            <Col xs={6}>
              <CommonMultiComboChart
                rows={chartRows.filter(
                  (row: any) =>
                    String(row.cdBizarea ?? "").trim() === item.cdBizarea
                )}
                title={item.title}
                series={rightSeries}
                chartHeight={190}
                minChartWidth={400}
                customDates={[...monthlyDates].reverse()}
                yLeftUnit="(PERSON)"
                yRightUnit="(%)"
                yRightMin={-20}
                yRightMax={100}
                columns={1}
                showLegend={false}
                tooltipLineOnly={true}
                hideWeekday={true}
                reverseDates={true}
                dateLabelMode="MONTHLY_WITH_TODAY_FULL"
                showHeader={true}
                endDate={monthlyDates[0]}
              />
            </Col>

            <Col xs={6} className={"overflow-auto"}>
              <FactoryDashboardMonthlySummaryTable rows={item.rows} />
            </Col>
          </Row>
        ))}
      </Col>
    </Row>
  );
});

export default FactoryDashboardPerson;
