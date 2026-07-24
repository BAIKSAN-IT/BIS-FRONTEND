import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { SrsStatisticsSummary } from "@redux/srs/srsSlice";

type SrsStatisticsPanelProps = {
  statistics: SrsStatisticsSummary;
};

const SrsStatisticsPanel = ({ statistics }: SrsStatisticsPanelProps) => {
  const donutOptions: ApexOptions = {
    chart: { type: "donut", toolbar: { show: false } },
    labels: ["접수대기", "처리중", "처리완료"],
    legend: { position: "bottom" },
    colors: ["#f59e0b", "#0ea5e9", "#10b981"],
    dataLabels: { enabled: true },
  };

  const deptOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, horizontal: true } },
    xaxis: { categories: statistics.departmentRows.slice(0, 5).map((row) => row.dept) },
    colors: ["#2563eb"],
  };

  const monthlyOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    fill: { opacity: 0.2 },
    xaxis: { categories: statistics.monthlyRows.map((row) => row.label) },
    colors: ["#7c3aed"],
  };

  return (
    <section className="srs-notice-panel" aria-label="SRS 통계">
      <div className="srs-section-title">
        <div>
          <p>통계</p>
          <h2>SRS 통계 대시보드</h2>
        </div>
        <span>현재 조회 조건 기준 집계</span>
      </div>

      <div className="srs-stat-summary-grid">
        <StatCard label="전체 요청" value={statistics.total} />
        <StatCard label="접수대기" value={statistics.pending} />
        <StatCard label="처리중" value={statistics.progress} />
        <StatCard label="처리완료" value={statistics.done} />
      </div>

      <div className="srs-stat-panels">
        <section className="srs-stat-panel">
          <h3>상태별 차트</h3>
          <Chart options={donutOptions} series={[statistics.pending, statistics.progress, statistics.done]} type="donut" height={280} />
        </section>
        <section className="srs-stat-panel">
          <h3>상위 부서 현황</h3>
          <Chart
            options={deptOptions}
            series={[{ name: "요청건수", data: statistics.departmentRows.slice(0, 5).map((row) => row.total) }]}
            type="bar"
            height={280}
          />
        </section>
      </div>

      <div className="srs-stat-panels">
        <section className="srs-stat-panel">
          <h3>월별 요청 추이</h3>
          <Chart
            options={monthlyOptions}
            series={[{ name: "요청건수", data: statistics.monthlyRows.map((row) => row.count) }]}
            type="area"
            height={280}
          />
        </section>
        <section className="srs-stat-panel">
          <h3>평균 만족도</h3>
          <div className="srs-score-highlight">
            <strong>{statistics.avgScore.toFixed(1)}</strong>
            <span>점</span>
          </div>
          <div className="srs-stat-list">
            {statistics.statusRows.map((row) => (
              <div key={row.label} className="srs-stat-row">
                <div className="srs-stat-row-head">
                  <span>{row.label}</span>
                  <strong>{row.count}건</strong>
                </div>
                <div className="srs-rate-cell">
                  <span style={{ width: `${Math.max(0, Math.min(100, row.rate))}%` }} />
                  <strong>{row.rate}%</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => {
  return (
    <article className="srs-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
};

export default SrsStatisticsPanel;
