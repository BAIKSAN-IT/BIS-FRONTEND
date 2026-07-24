// GroupMenuDropZone.tsx
import React from "react";
import { useDrop } from "react-dnd";
import type { ProgramMenuListRes } from "../../../../redux/system/SystemProgramSlice";
import type { DragProgramItem } from "../../../../utils/dndTypes";
import { Spinner } from "react-bootstrap";

interface Props {
  onDrop: (item: ProgramMenuListRes) => void;
  droppedItems: ProgramMenuListRes[];
  selectedUser?: { userId?: string; nmUser?: string } | null;
  userPrograms?: ProgramMenuListRes[];
  userProgramsLoading?: boolean;
}

const GroupMenuDropZone = ({
  onDrop,
  droppedItems,
  selectedUser,
  userPrograms = [],
  userProgramsLoading = false,
}: Props) => {
  const [{ isOver }, dropRef] = useDrop<DragProgramItem, void, { isOver: boolean }>({
    accept: "PROGRAM_NODE",
    drop: (item) => onDrop(item.program),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  });

  return (
    <div
      ref={dropRef}
      style={{
        minHeight: "300px",
        background: isOver ? "#e6f7ff" : "#f5f5f5",
        border: "1px dashed #1890ff",
        padding: "0.75rem",
      }}
    >
      {/* 사용자 보유 프로그램 */}
      <div style={{ marginBottom: 8 }}>
        <h6 style={{ margin: 0 }}>
          사용자 프로그램
          {selectedUser?.userId ? (
            <small style={{ marginLeft: 6, color: "#666" }}>({selectedUser.nmUser ?? selectedUser.userId})</small>
          ) : null}
        </h6>

        {userProgramsLoading ? (
          <div className="d-flex align-items-center gap-2" style={{ padding: "6px 0" }}>
            <Spinner animation="border" size="sm" />
            <span>불러오는 중...</span>
          </div>
        ) : userPrograms.length === 0 ? (
          <div style={{ padding: "6px 0", color: "#888" }}>목록이 없습니다.</div>
        ) : (
          <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #e6e6e6", padding: 6, borderRadius: 4 }}>
            {userPrograms.map((p) => (
              <div key={`userprog_${p.pgmNo}`} style={{ padding: "2px 0" }}>
                {p.pageNameKo ?? p.pageNameEn ?? p.pageNameVn ?? p.pgmNo}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #c9c9c9", margin: "8px 0" }} />

      {/* 드롭된 그룹 메뉴 */}
      <div>
        <h6 style={{ margin: 0 }}>드롭된 그룹 메뉴</h6>
        {droppedItems.length === 0 ? (
          <div style={{ padding: "6px 0", color: "#888" }}>여기로 메뉴를 드래그하세요.</div>
        ) : (
          <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #e6e6e6", padding: 6, borderRadius: 4 }}>
            {droppedItems.map((item, idx) => (
              <div key={`${item.pgmNo}_${idx}`} style={{ padding: "2px 0" }}>
                {item.pageNameKo ?? item.pageNameEn ?? item.pageNameVn ?? item.pgmNo}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMenuDropZone;
