import React from "react";

interface SummaryBoxProps {
  label: string;
  value: string | number;
}

const SummaryBox: React.FC<SummaryBoxProps> = ({ label, value}) => {
  return (
    <div className="summary-box">
      <div className="summary-label" dangerouslySetInnerHTML={{ __html: label } }/>
      <div className="summary-value">{value}</div>
    </div>
  );
};
export default SummaryBox;
