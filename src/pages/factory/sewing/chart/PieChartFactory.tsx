import React, { forwardRef, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { ApexOptions } from "apexcharts";
import { SEWING_ACTUAL_DEFECT_TYPE } from "../../../../constants/factory/sewing/sewingActual";

interface ChartProps {
  defect: SEWING_ACTUAL_DEFECT_TYPE[];
}

const PieChartFactory = forwardRef<HTMLDivElement, ChartProps>(
  ({ defect }, ref) => {
    useEffect(() => {
      setNmDefect(defect?.map((item) => item.nmDefect));
      setDefectRate(defect?.map((item) => Number(setNumberType(item.rate))));
    }, [defect]);

    const [nmDefect, setNmDefect] = useState<string[]>([]);
    const [defectRate, setDefectRate] = useState<Number[]>([]);

    const setNumberType = (val: any) => {
      return Number(val).toLocaleString("ko-KR", {
        maximumFractionDigits: 2,
      });
    };

    const apexDonutOpts: ApexOptions = {
      chart: {
        height: 320,
        type: "pie",
      },
      labels: nmDefect,
      colors: ["#727cf5", "#6c757d", "#0acf97"],
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

    const apexDonutData = defectRate;

    return (
      <Card>
        <Card.Body>
          <Chart
            options={apexDonutOpts}
            series={apexDonutData}
            type="pie"
            height={250}
            className="apex-charts"
          />
        </Card.Body>
      </Card>
    );
  }
);

export default PieChartFactory;
