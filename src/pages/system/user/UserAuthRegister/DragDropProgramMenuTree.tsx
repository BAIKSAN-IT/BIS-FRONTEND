import React, { useState } from "react";
import { Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FolderOutlined } from "@ant-design/icons";

const treeData: DataNode[] = [
  {
    title: "RND",
    key: "0",
    icon: <FolderOutlined />,
    children: [
      { title: "사용자등록", key: "0-0" },
      { title: "노트등록", key: "0-1" },
    ],
  },
  {
    title: "FABRIC 관리",
    key: "1",
    icon: <FolderOutlined />,
    children: [
      { title: "원단확정", key: "1-0" },
      { title: "원단투입", key: "1-1" },
    ],
  },
];

// 드래그 가능한 트리
const DraggableTree = ({ onDragStart }: { onDragStart: (node: DataNode) => void }) => {
  return (
    <Tree
      treeData={treeData}
      draggable
      onDragStart={(info) => {
        onDragStart(info.node);
      }}
    />
  );
};

// 드롭 가능한 영역
const DropZone = ({ onDrop, droppedItems }: { onDrop: (item: DataNode) => void; droppedItems: DataNode[] }) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: "TREE_NODE",
    drop: (item: any) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef}
      style={{
        minHeight: "300px",
        background: isOver ? "#d9f7be" : "#f5f5f5",
        border: "2px dashed #1890ff",
        padding: "1rem",
      }}
    >
      <h4>그룹별 메뉴 설정</h4>
      {droppedItems.map((item, idx) => (
        <div key={idx} style={{ padding: "0.5rem", background: "#fff", marginBottom: "0.5rem" }}>
          {item.title}
        </div>
      ))}
    </div>
  );
};

// 최종 컴포넌트
const DragDropProgramMenuTree = () => {
  const [draggedNode, setDraggedNode] = useState<DataNode | null>(null);
  const [droppedItems, setDroppedItems] = useState<DataNode[]>([]);

  const handleDrop = (item: DataNode) => {
    if (!droppedItems.some((d) => d.key === item.key)) {
      setDroppedItems((prev) => [...prev, item]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <div style={{ flex: 1 }}>
          <h4>전체 프로그램 메뉴</h4>
          <DraggableTree onDragStart={(node) => setDraggedNode({ ...node, type: "TREE_NODE" } as any)} />
        </div>
        <div style={{ flex: 1 }}>
          <DropZone
            onDrop={() => {
              if (draggedNode) handleDrop(draggedNode);
            }}
            droppedItems={droppedItems}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default DragDropProgramMenuTree;
