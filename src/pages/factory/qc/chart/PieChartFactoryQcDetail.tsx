import React, { forwardRef, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { ApexOptions } from "apexcharts";
import { DEFECTS_COLUMNS_TYPE } from "../../../../constants/factory/qc/qc";
import { isEmpty } from "../../../../utils/CommonUtil";

interface ChartProps {
  topDefectList: DEFECTS_COLUMNS_TYPE[];
}

const PieChartFactoryQcDetail = forwardRef<HTMLDivElement, ChartProps>(
  ({ topDefectList }, ref) => {
    const [nmDefect, setNmDefect] = useState<string[]>([]);
    const [qtTtl, setQtTtl] = useState<number[]>([]);

    useEffect(() => {
      if (!isEmpty(topDefectList)) {
        setNmDefect(topDefectList.map((item) => item.nmDefect));
        setQtTtl(topDefectList.map((item) => Number(item.qtDefect) ?? 0));
      }
    }, [topDefectList]);

    // default options
    const apexDonutOpts: ApexOptions = {
      chart: {
        type: "pie",
      },
      labels: nmDefect,
      colors: ["#e83e8c", "#8e44ad", "#8b0000"],
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        floating: false,
        fontSize: "14px",
        offsetX: 0,
        offsetY: -10,
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: {
              height: 240,
            },
            legend: {
              show: false,
            },
          },
        },
      ],
    };

    // chart data
    const apexDonutData = qtTtl;

    return (
      <Card>
        <Card.Body>
          <h4 className="header-title mb-3">TOP 3 HEIGHEST DEFECTS</h4>
          <Chart
            options={apexDonutOpts}
            series={apexDonutData}
            type="pie"
            height={500}
            className="apex-charts"
          />
        </Card.Body>
      </Card>
    );
  }
);

export default PieChartFactoryQcDetail;
