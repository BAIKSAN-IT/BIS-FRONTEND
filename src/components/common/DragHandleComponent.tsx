import React, { memo, useCallback } from "react";

interface Props {
  onStartDrag: (e: React.MouseEvent) => void;
  onReset?: () => void;
  title?: string;
}

const DragHandleComponent = memo(({ onStartDrag, onReset, title }: Props) => {
  const handleDoubleClick = useCallback(() => {
    if (onReset) onReset();
  }, [onReset]);

  return (
    <div
      onMouseDown={onStartDrag}
      onDoubleClick={handleDoubleClick}
      title={title ?? "드래그해서 폭 조절 (더블클릭: 초기화)"}
      style={{
        width: "8px",
        cursor: "col-resize",
        userSelect: "none",
        borderRadius: "4px",
      }}
    />
  );
});

export default DragHandleComponent;
