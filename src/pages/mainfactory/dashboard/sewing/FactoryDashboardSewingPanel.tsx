import React, {memo, useMemo} from "react";
import FactoryDashboardSewingSummaryTable from "./FactoryDashboardSewingSummaryTable";
import {
  FactoryDashboardDailySewingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {calcRate, toNum} from "@utils/numberUtils";
import CommonGaugeECharts from "@components/chart/CommonGaugeECharts";

interface Props {
  row?: FactoryDashboardDailySewingRes;
  title?: string;
  selectedTab: FactoryDashboardTab;
}

const TITLE_BLUE = "#0000FF";

const getTitleColor = (title?: string) => {
  switch ((title || "").toUpperCase()) {
    case "TOTAL":
      return "#4e79a7";
    case "VINA":
      return "#4e79a7";
    case "TAMTHANG":
      return "#4e79a7";
    case "BAGO":
      return "#4e79a7";
    default:
      return TITLE_BLUE;
  }
};

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const FactoryDashboardSewingPanel = memo(
  ({
     row,
     title = "TOTAL",
     selectedTab,
   }: Props) => {
    const upperTitle = (title || "").toUpperCase();
    const isTotal = upperTitle === "TOTAL";

    const chartModel = useMemo(() => {
      const cntLine = toNum(row?.cntLine);
      const cntLineUse = toNum(row?.cntLineUse);
      const cntLineOutput = toNum(row?.cntLineOutput);

      const tableRows = [
        {
          key: "total",
          label: "전체",
          lineValue: cntLine,
          rate: cntLine > 0 ? 100 : 0,
          color: "#6c757d",
        },
        {
          key: "use",
          label: "가동",
          lineValue: cntLineUse,
          rate: calcRate(cntLineUse, cntLine),
          color: "#4e79a7",
        },
        {
          key: "output",
          label: "생산",
          lineValue: cntLineOutput,
          rate: calcRate(cntLineOutput, cntLine),
          color: "#76b7b2",
        },
      ];

      return {
        tableRows,
      };
    }, [row, selectedTab]);

    const titleDotColor = useMemo(() => getTitleColor(title), [title]);

    const gaugeValue = useMemo(() => {
      const cntLine = toNum(row?.cntLine);
      const cntLineUse = toNum(row?.cntLineUse);

      return clampPercent(calcRate(cntLineUse, cntLine));
    }, [row]);

    return (
      <div
        style={{
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 24,
            marginBottom: 2,
          }}
        >
          {isTotal && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                가동률
              </span>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: titleDotColor,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: TITLE_BLUE,
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
          </div>
        </div>

        <div
          className={"mt-n1"}
          style={{
            width: "100%",
            minWidth: 0,
            overflowX: "hidden",
            overflowY: "hidden",
          }}
        >
          <CommonGaugeECharts
            value={gaugeValue}
            title={title}
            heightPx={180}
            showHeader={false}
          />
        </div>

        <div
          className={"mt-n3"}
          style={{
            width: "100%",
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <FactoryDashboardSewingSummaryTable rows={chartModel.tableRows} />
        </div>
      </div>
    );
  }
);

export default FactoryDashboardSewingPanel;
