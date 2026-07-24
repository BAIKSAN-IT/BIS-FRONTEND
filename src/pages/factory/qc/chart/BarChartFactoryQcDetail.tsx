import React, { forwardRef, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { ApexOptions } from "apexcharts";
import { DEFECTS_COLUMNS_TYPE } from "../../../../constants/factory/qc/qc";
import { isEmpty } from "../../../../utils/CommonUtil";

interface ChartProps {
  defectList: DEFECTS_COLUMNS_TYPE[];
}

interface DefectType {
  name: string;
  data: number[];
  color: string;
}

const BarChartFactoryQcDetail = forwardRef<HTMLDivElement, ChartProps>(
  ({ defectList }, ref) => {
    const [apexAreaChartData, setApexAreaChartData] = useState<DefectType[]>(
      []
    );

    useEffect(() => {
      if (!isEmpty(defectList)) {
        const updatedApexAreaChartData = defectList.map((item) => ({
          name: item.nmDefect,
          data: [Number(item.qtDefect) ?? 0],
          color: generateRandomColor(),
        }));

        setApexAreaChartData(updatedApexAreaChartData);
      }
    }, [defectList]);

    useEffect(() => {
      console.log(apexAreaChartData);
    }, [apexAreaChartData]);

    // 랜덤으로 색상을 생성하는 함수
    const generateRandomColor = () => {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return `#${randomColor}`;
    };

    const apexAreaChartOpts: ApexOptions = {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top",
          },
          columnWidth: "50%",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "left",
        floating: false,
        offsetY: 0,
        fontSize: "12px",
        labels: {
          useSeriesColors: true,
        },
      },
      xaxis: {
        categories: ["Defect Types"],
      },
    };

    return (
      <Card>
        <Card.Body>
          <h4 className="header-title mb-3">DEFECT COMPARISON CHART</h4>
          <Chart
            options={apexAreaChartOpts}
            series={apexAreaChartData}
            height={500}
            type="bar"
            className="apex-charts"
          />
        </Card.Body>
      </Card>
    );
  }
);

export default BarChartFactoryQcDetail;
