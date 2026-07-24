import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { SalesActivityDashboardRes } from "../../../redux/sales/SalesActivitySlice";
import { SalesActivityDashboardPortlet } from "./SalesActivityDashboardPortlet";

interface Props {
  data?: SalesActivityDashboardRes;
  type: "dept-total" | "dept";
  donutLabels?: string[];
  donutSeries?: number[];
  barLabels?: string[];
  barSeries?: { name: string; data: number[] }[];
  chartTitle?: string;
}

const SalesActivityDashboardChart = ({
  data,
  type,
  donutLabels,
  donutSeries,
  barLabels,
  barSeries,
  chartTitle,
}: Props) => {
  let finalDonutSeries: number[] = [];
  let finalDonutLabels: string[] = [];

  if (type === "dept-total") {
    finalDonutLabels = donutLabels ?? [];
    finalDonutSeries = donutSeries ?? [];
  } else if (type === "dept") {
    const list = data?.saleDashboardListRes ?? [];
    finalDonutLabels = list.map((item) => item.nmWork ?? "-");
    finalDonutSeries = list.map((item) => Number(item.cntWork ?? 0));
  }

  // 도넛차트
  const donutOpts: ApexOptions = {
    chart: { type: "donut" },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: { show: true },
          },
        },
      },
    },
    dataLabels: { enabled: true },
    colors:
      type === "dept-total"
        ? ["#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#FF5722"]
        : ["#E91E63", "#FFC107", "#2196F3", "#4CAF50", "#FF5722", "#9C27B0"],
    legend: { show: true, position: "bottom", horizontalAlign: "center", fontSize: "12px", fontWeight: "bold" },
    labels: finalDonutLabels,
    tooltip: { enabled: true },
  };

  // 막대차트
  const barOpts: ApexOptions = {
    chart: { type: "bar", stacked: true },
    plotOptions: { bar: { horizontal: false, columnWidth: "40%" } },
    dataLabels: { enabled: true },
    colors: ["#E91E63", "#FFC107", "#2196F3", "#4CAF50", "#FF5722", "#9C27B0"],
    xaxis: {
      categories: barLabels,
      labels: {
        style: { fontSize: "12px", fontWeight: "bold" },
        rotateAlways: true,
        rotate: -30,
      },
    },
    yaxis: { title: { text: "건수/부서", rotate: 0, offsetX: 30, offsetY: -99 } },
    legend: { show: true },
  };

  return (
    <>
      <SalesActivityDashboardPortlet
        className={"mt-n2"}
        cardTitle={data?.deptNm || chartTitle || "-"}
        titleClass="header-title"
      >
        <div className="text-center mt-n4">
          <div className="d-flex justify-content-center align-items-center" style={{ gap: "10px", minHeight: 270 }}>
            <div style={{ flex: 0.9, minWidth: 0 }}>
              <Chart
                options={donutOpts}
                series={finalDonutSeries}
                type="donut"
                height={300}
                className="apex-charts mt-2"
              />
            </div>
            {type === "dept-total" && (
              <div style={{ flex: 1.6 }}>
                <Chart options={barOpts} series={barSeries} type="bar" height={270} className="apex-charts mt-4" />
              </div>
            )}
          </div>
        </div>
      </SalesActivityDashboardPortlet>
    </>
  );
};

export default SalesActivityDashboardChart;
