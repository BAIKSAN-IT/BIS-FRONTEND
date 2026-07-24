import React from "react";
import { SrsMetricGroup } from "@redux/srs/srsSlice";

type SrsSidebarPanelProps = {
  groups: SrsMetricGroup[];
  processedCount: string;
  totalCount: string;
  requestedAverage: string;
  receivedAverage: string;
};

const SrsSidebarPanel = ({ groups, processedCount, totalCount, requestedAverage, receivedAverage }: SrsSidebarPanelProps) => {
  return (
    <aside className="srs-sidebar" aria-label="SRS 요청 요약">
      <section className="srs-side-panel">
        <div className="srs-side-heading">
          <span>오늘 기준</span>
          <strong>요청 요약</strong>
        </div>

        {groups.slice(0, 1).map((group) => (
          <MetricCard key={group.title} group={group} />
        ))}

        <div className="srs-progress-card">
          <div>
            <span>처리완료</span>
            <strong>
              {processedCount}/{totalCount}
            </strong>
          </div>
          <div className="srs-progress-avg" role="note" aria-label="평균 만족도 요약">
            <span>요청한 처리 평균</span>
            <strong>{requestedAverage}</strong>
            <span>요청받은 처리 평균</span>
            <strong>{receivedAverage}</strong>
          </div>
        </div>

        {groups.slice(1).map((group) => (
          <MetricCard key={group.title} group={group} />
        ))}
      </section>
    </aside>
  );
};

const MetricCard = ({ group }: { group: SrsMetricGroup }) => {
  return (
    <section className={`srs-metric-card ${group.tone}`}>
      <h2>{group.title}</h2>
      <dl>
        {group.items.map((item) => (
          <div key={item.label} className={item.accent ? "accent" : ""}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default SrsSidebarPanel;
