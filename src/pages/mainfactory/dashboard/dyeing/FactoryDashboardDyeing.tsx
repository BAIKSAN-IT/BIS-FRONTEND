import React, {memo, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {FactoryDashboardDailyDyeingRes, FactoryDashboardTab,} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import {InputRefMap} from "@utils/useInputRefs";
import DyeingMachineRateChart from "@pages/mainfactory/dashboard/dyeing/DyeingMachineRateChart";
import DyeingCircleChart from "@pages/mainfactory/dashboard/dyeing/DyeingCircleChart";
import DyeingBarLineChart, {MetricType} from "@pages/mainfactory/dashboard/dyeing/DyeingBarLineChart";
import DyeingGaugeChart from "@pages/mainfactory/dashboard/dyeing/DyeingGaugeChart";

interface Props {
  refs: InputRefMap<"dtsWork">;
  rows: FactoryDashboardDailyDyeingRes[];
  selectedTab: FactoryDashboardTab;
}

const FactoryDashboardDyeing = memo(({refs, rows, selectedTab}: Props) => {
  const [metric, setMetric] = useState<MetricType>("KG");
  const [showLineView, setShowLineView] = useState(true);

  return (
    <Row className="g-2 mt-n3" style={{height: '200px'}}>
      {/* TODAY GAUGE */}
      <Col xl={7} lg={7} md={12} sm={12} style={{minWidth: 0}}>
        <DyeingGaugeChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="TODAY"
        />
      </Col>

      {/* MONTH GAUGE */}
      <Col xl={5} lg={5} md={12} sm={12} style={{minWidth: 0}}>
        <DyeingGaugeChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>

      {/* TODAY BAR/LINE */}
      <Col xl={7} lg={7} md={12} sm={12} style={{minWidth: 0}}>
        <DyeingBarLineChart
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
        <DyeingBarLineChart
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
        <DyeingCircleChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="TODAY"
        />
      </Col>

      {/* MONTH CIRCLE */}
      <Col xl={5} lg={5} md={12} sm={12} style={{minWidth: 0}}>
        <DyeingCircleChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>

      {/* MACHINE RATE */}
      <Col xl={12} lg={12} md={12} sm={12} style={{minWidth: 0}}>
        <DyeingMachineRateChart
          refs={refs}
          rows={rows}
          selectedTab={selectedTab}
          period="MONTH"
        />
      </Col>
    </Row>
  );
});

export default FactoryDashboardDyeing;
