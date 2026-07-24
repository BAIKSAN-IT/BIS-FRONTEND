import React from "react";

interface DailyProductionSummaryBoxProps {
  label: string;
  value: string | number;
}

const SewingActualSummaryBox: React.FC<DailyProductionSummaryBoxProps> = ({ label, value}) => {
  return (
    <div className="daily-production-summary-box">
      <div className="daily-production-summary-label" dangerouslySetInnerHTML={{ __html: label } }/>
      <div className="daily-production-summary-value">{value}</div>
    </div>
  );
};
export default SewingActualSummaryBox;
