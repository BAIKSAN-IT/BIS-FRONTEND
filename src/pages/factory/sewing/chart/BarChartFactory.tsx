import React, { forwardRef, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { ApexOptions } from "apexcharts";
import { SEWING_ACTUAL_DEFECT_TYPE } from "../../../../constants/factory/sewing/sewingActual";
import { isEmpty } from "../../../../utils/CommonUtil";

interface ChartProps {
  defect: SEWING_ACTUAL_DEFECT_TYPE[];
}

const BarChartFactory = forwardRef<HTMLDivElement, ChartProps>(
  ({ defect }, ref) => {
    useEffect(() => {
      if (!isEmpty(defect)) {
        setCategory("DEFECT");
        setTtlDefectRate(Number(setNumberType(defect[0]?.ttlDefect)));
      } else {
        setCategory(null);
        setTtlDefectRate(null);
      }
    }, [defect]);

    const [category, setCategory] = useState<string | null>();
    const [TtlDefectRate, setTtlDefectRate] = useState<Number | null>();

    const setNumberType = (val: any) => {
      return Number(val).toLocaleString("ko-KR", {
        maximumFractionDigits: 2,
      });
    };

    const apexBarChartOpts: ApexOptions = {
      chart: {
        height: 320,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {
            position: "top",
          },
        },
      },
      // dataLabels: {
      //   enabled: true,
      //   offsetX: -6,
      //   style: {
      //     fontSize: "12px",
      //     colors: ["#fff"],
      //   },
      // },
      colors: ["#fa5c7c"],
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: [category],
      },
      legend: {
        offsetY: -10,
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
      },
      grid: {
        borderColor: "#f1f3fa",
      },
    };

    // chart data
    const apexBarChartData = [
      {
        name: "Defect",
        data: [TtlDefectRate],
      },
    ];

    return (
      <Card>
        <Card.Body>
          <Chart
            options={apexBarChartOpts}
            series={apexBarChartData}
            type="bar"
            className="apex-charts"
            height={200}
            width={120}
          />
        </Card.Body>
      </Card>
    );
  }
);

export default BarChartFactory;
