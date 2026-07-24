import React, {memo, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardTab,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";

import KnittingGaugeChart from "@pages/mainfactory/dashboard/knitting/KnittingGaugeChart";
import KnittingBarLineChart, {
  MetricType,
} from "@pages/mainfactory/dashboard/knitting/KnittingBarLineChart";
import KnittingCircleChart from "@pages/mainfactory/dashboard/knitting/KnittingCircleChart";
import KnittingMachineRateChart from "@pages/mainfactory/dashboard/knitting/KnittingMachineRateChart";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyKnittingRes[];
  selectedTab: FactoryDashboardTab;
}

const FactoryDashboardKnitting = memo(({refs, rows, selectedTab}: Props) => {
  const [metric, setMetric] = useState<MetricType>("QTY");
  const [showLineView, setShowLineView] = useState(true);

  return (
    <Row className="g-2 mt-n2" style={{height: '200px'}}>
      {/* TODAY GAUGE */}
      <Col xl={7} lg={7} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingGaugeChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="TODAY"
        />
      </Col>

      {/* MONTH GAUGE */}
      <Col xl={5} lg={5} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingGaugeChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>

      {/* TODAY BAR/LINE */}
      <Col xl={7} lg={7} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingBarLineChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="TODAY"
          metric={metric}
          showLineView={showLineView}
          onChangeMetric={setMetric}
          onChangeShowLineView={setShowLineView}
          showControls={true}
          highlightSundayLabel={true}
        />
      </Col>

      {/* MONTH BAR/LINE */}
      <Col xl={5} lg={5} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingBarLineChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
          metric={metric}
          showLineView={showLineView}
          onChangeMetric={setMetric}
          onChangeShowLineView={setShowLineView}
          showControls={false}
        />
      </Col>

      {/* TODAY CIRCLE */}
      <Col xl={7} lg={7} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingCircleChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="TODAY"
        />
      </Col>

      {/* MONTH CIRCLE */}
      <Col xl={5} lg={5} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingCircleChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>

      {/* MACHINE RATE */}
      <Col xl={12} lg={12} md={12} sm={12} style={{minWidth: 0}}>
        <KnittingMachineRateChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>
    </Row>
  );
});

export default FactoryDashboardKnitting;
