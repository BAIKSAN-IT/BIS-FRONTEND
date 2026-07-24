import React from "react";

export type SrsMetricGroup = {
  title: string;
  tone: "blue" | "orange" | "gray";
  items: Array<{
    label: string;
    value: string;
    accent?: boolean;
  }>;
};

type SrsSidebarProps = {
  groups: SrsMetricGroup[];
  processedCount: string;
  totalCount: string;
  score: string;
};

const SrsSidebar = ({ groups, processedCount, totalCount, score }: SrsSidebarProps) => {
  return (
    <aside className="srs-sidebar" aria-label="SRS request summary">
      <section className="srs-side-panel">
        <div className="srs-side-heading">
          <span>Today</span>
          <strong>요청 현황</strong>
        </div>

        {groups.slice(0, 1).map((group) => (
          <MetricCard key={group.title} group={group} />
        ))}

        <div className="srs-progress-card">
          <div>
            <span>처리 건수</span>
            <strong>
              {processedCount}/{totalCount}
            </strong>
          </div>
          <button type="button">{score}</button>
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

export default SrsSidebar;
