import React, { memo } from "react";
import { Button } from "react-bootstrap";

export type ListTabKey = "return";
interface Props {
  onAct: (bucket: ListTabKey) => void;
  selectedCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ReturnTabList = memo(({ onAct, selectedCount, size = "sm", className }: Props) => {
  const bsSize: "sm" | "lg" | undefined = size === "md" ? undefined : size;

  return (
    <div className={`d-flex justify-content-start mb-1 ${className || ""}`}>
      <Button
        size={bsSize}
        variant="primary"
        className="sales-activity-button"
        disabled={!selectedCount}
        title={selectedCount ? "선택을 Return 리스트에 추가/제거" : "체크한 항목이 없습니다"}
        onClick={() => onAct("return")}
      >
        Return
      </Button>
    </div>
  );
});

export default ReturnTabList;
