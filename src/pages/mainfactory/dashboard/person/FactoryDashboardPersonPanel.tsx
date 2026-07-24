import React, {memo, useMemo} from "react";
import CommonDonutSummaryChart, {DonutSegment,} from "@components/chart/CommonDonutSummaryChart";
import FactoryDashboardSummaryTable, {SummaryTableRow} from "./FactoryDashboardSummaryTable";
import {FactoryDashboardDailyPersonRes, FactoryDashboardTab,} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {calcRate, toNum} from "@utils/numberUtils";

interface Props {
  row?: FactoryDashboardDailyPersonRes;
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

const FactoryDashboardPersonPanel = memo(({
                                            row,
                                            title = "TOTAL",
                                            selectedTab,
                                          }: Props) => {
  const chartModel = useMemo(() => {
    const personTotal = toNum(row?.cntPerson);
    const personAttend = toNum(row?.cntAttendPerson);
    const personAbsent = toNum(row?.cntAbsentPerson);

    const sewingTotal = toNum(row?.cntSewPerson);
    const sewingAttend = toNum(row?.cntAttendSewPerson);
    const sewingAbsent = toNum(row?.cntAbsentSewPerson);

    const sewingGenTotal = toNum(row?.cntSewgenPerson);
    const sewingGenAttend = toNum(row?.cntAttendSewgenPerson);
    const sewingGenAbsent = toNum(row?.cntAbsentSewgenPerson);

    const knittingTotal = toNum(row?.cntKnitPerson);
    const knittingAttend = toNum(row?.cntAttendKnitPerson);
    const knittingAbsent = toNum(row?.cntAbsentKnitPerson);

    const dyeingTotal = toNum(row?.cntDyePerson);
    const dyeingAttend = toNum(row?.cntAttendDyePerson);
    const dyeingAbsent = toNum(row?.cntAbsentDyePerson);

    const yarnTotal = toNum(row?.cntYarnPerson);
    const yarnAttend = toNum(row?.cntAttendYarnPerson);
    const yarnAbsent = toNum(row?.cntAbsentYarnPerson);

    const generalTotal = toNum(row?.cntGenPerson);
    const generalAttend = toNum(row?.cntAttendGenPerson);
    const generalAbsent = toNum(row?.cntAbsentGenPerson);

    if (selectedTab === "PERSON") {
      const segments: DonutSegment[] = [
        {key: "sewing", label: "SEWING", value: sewingTotal, color: "#4e79a7"},
        {key: "sewgen", label: "SEW-GEN", value: sewingGenTotal, color: "#76b7b2"},
        {key: "knitting", label: "KNITTING", value: knittingTotal, color: "#59a14f"},
        {key: "dyeing", label: "DYEING", value: dyeingTotal, color: "#E15759"},
        {key: "yarn", label: "YARNDYE", value: yarnTotal, color: "#F28E2B"},
        {key: "general", label: "GENERAL", value: generalTotal, color: "#7AA7FF"},
      ];

      const tableRows: SummaryTableRow[] = [
        {
          key: "person",
          label: "TOTAL",
          totalCount: personTotal,
          attendCount: personAttend,
          absentCount: personAbsent,
          totalRate: personTotal ? 100 : 0,
          attendRate: personTotal ? calcRate(personAttend, personTotal) : 0,
          absentRate: personTotal ? calcRate(personAbsent, personTotal) : 0,
          color: "#6c757d",
        },
        {
          key: "sewing",
          label: "SEWING",
          totalCount: sewingTotal,
          attendCount: sewingAttend,
          absentCount: sewingAbsent,
          totalRate: calcRate(sewingTotal, personTotal),
          attendRate: calcRate(sewingAttend, sewingTotal),
          absentRate: calcRate(sewingAbsent, sewingTotal),
          color: "#4e79a7",
        },
        {
          key: "sewgen",
          label: "SEW-GEN",
          totalCount: sewingGenTotal,
          attendCount: sewingGenAttend,
          absentCount: sewingGenAbsent,
          totalRate: calcRate(sewingGenTotal, personTotal),
          attendRate: calcRate(sewingGenAttend, sewingGenTotal),
          absentRate: calcRate(sewingGenAbsent, sewingGenTotal),
          color: "#76b7b2",
        },
        {
          key: "knitting",
          label: "KNITTING",
          totalCount: knittingTotal,
          attendCount: knittingAttend,
          absentCount: knittingAbsent,
          totalRate: calcRate(knittingTotal, personTotal),
          attendRate: calcRate(knittingAttend, knittingTotal),
          absentRate: calcRate(knittingAbsent, knittingTotal),
          color: "#59a14f",
        },
        {
          key: "dyeing",
          label: "DYEING",
          totalCount: dyeingTotal,
          attendCount: dyeingAttend,
          absentCount: dyeingAbsent,
          totalRate: calcRate(dyeingTotal, personTotal),
          attendRate: calcRate(dyeingAttend, dyeingTotal),
          absentRate: calcRate(dyeingAbsent, dyeingTotal),
          color: "#e15759",
        },
        {
          key: "yarn",
          label: "YARNDYE",
          totalCount: yarnTotal,
          attendCount: yarnAttend,
          absentCount: yarnAbsent,
          totalRate: calcRate(yarnTotal, personTotal),
          attendRate: calcRate(yarnAttend, yarnTotal),
          absentRate: calcRate(yarnAbsent, yarnTotal),
          color: "#F28E2B",
        },
        {
          key: "general",
          label: "GENERAL",
          totalCount: generalTotal,
          attendCount: generalAttend,
          absentCount: generalAbsent,
          totalRate: calcRate(generalTotal, personTotal),
          attendRate: calcRate(generalAttend, generalTotal),
          absentRate: calcRate(generalAbsent, generalTotal),
          color: "#7AA7FF",
        },
      ];

      return {
        centerValue: personTotal,
        centerLabel: "",
        segments,
        tableRows,
      };
    }

    return {
      centerValue: personTotal,
      centerLabel: "",
      segments: [],
      tableRows: [],
    };
  }, [row, selectedTab]);

  const titleDotColor = useMemo(() => getTitleColor(title), [title]);

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 4,
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

      <div
        style={{
          width: "100%",
          minWidth: 0,
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      >
        <CommonDonutSummaryChart
          title=""   // 부모에서 직접 title 그리니까 비움
          centerValue={chartModel.centerValue}
          centerLabel={chartModel.centerLabel}
          segments={chartModel.segments}
          height={210}
        />
      </div>

      <div
        style={{
          width: "100%",
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <FactoryDashboardSummaryTable rows={chartModel.tableRows} />
      </div>
    </div>
  );
});

export default FactoryDashboardPersonPanel;
