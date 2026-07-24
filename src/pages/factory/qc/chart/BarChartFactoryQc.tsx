import React, { forwardRef, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { ApexOptions } from "apexcharts";
import { QC_COLUMNS_TYPE } from "../../../../constants/factory/qc/qc";
import { dataExtraction, isEmpty } from "../../../../utils/CommonUtil";

interface ChartProps {
  inspectList: QC_COLUMNS_TYPE[];
}

const BarChartFactoryQc = forwardRef<HTMLDivElement, ChartProps>(
  ({ inspectList }, ref) => {
    const [category, setCategory] = useState<string[]>([]);
    const [defectList, setDefectList] = useState<number[]>([]);
    const [defectRateList, setDefectRateList] = useState<number[]>([]);

    useEffect(() => {
      if (!isEmpty(inspectList)) {
        const qtInspData = dataExtraction(inspectList[1], "qtDefect");
        setDefectList(qtInspData.map((item) => item.value));

        const rateData = dataExtraction(inspectList[2], "qtDefect");
        setDefectRateList(rateData.map((item) => item.value));

        const categories = [];
        for (let i = 1; i <= qtInspData.length; i++) {
          categories.push(`LINE-${i}`);
        }
        setCategory(categories);
      }
    }, [inspectList]);

    const apexMixedOpts: ApexOptions = {
      chart: {
        height: 380,
        type: "line",
        toolbar: {
          show: true,
        },
      },
      stroke: {
        width: [0, 4],
      },
      colors: ["#15967d", "#fa5c7c"],
      xaxis: {
        categories: category,
      },
      yaxis: [
        {
          title: {
            text: "Defects",
          },
          labels: {
            formatter: (val) => val.toFixed(0),
          },
        },
        {
          opposite: true,
          title: {
            text: "Rate (%)",
          },
          labels: {
            formatter: (val) => `${val.toFixed(2)}%`,
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
      },
    };

    // 차트 데이터
    const apexMixedData = [
      {
        name: "Defects",
        type: "column",
        data: defectList,
      },
      {
        name: "Rate",
        type: "line",
        data: defectRateList,
      },
    ];

    return (
      <Card>
        <Card.Body>
          <h4 className="header-title mb-3">
            DEFECTIVE FINISHING LINE COMPARISON CHART
          </h4>
          <Chart
            options={apexMixedOpts}
            series={apexMixedData}
            type="line"
            height={380}
            className="apex-charts"
          />
        </Card.Body>
      </Card>
    );
  }
);

export default BarChartFactoryQc;
