// MenuTreeListDragDrop.tsx
import React, { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import { Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { FolderOutlined } from "@ant-design/icons";
import { convertProgramListToMenu, MenuItemTypes } from "../../../../constants/menuUtils";
import type { ProgramMenuListRes } from "../../../../redux/system/SystemProgramSlice";
import type { DragProgramItem } from "../../../../utils/dndTypes";

/** -------------- 역매핑 인덱스 -------------- **/
type ProgramIndex = {
  byUrl: Map<string, ProgramMenuListRes>;
  byLabel: Map<string, ProgramMenuListRes>;
  byKey: Map<string, ProgramMenuListRes>;
};

const keyOf = (v?: string) => (v ?? "").trim().toLowerCase();

const buildProgramIndex = (list: ProgramMenuListRes[]): ProgramIndex => {
  const byUrl = new Map<string, ProgramMenuListRes>();
  const byLabel = new Map<string, ProgramMenuListRes>();
  const byKey = new Map<string, ProgramMenuListRes>();

  const walk = (arr: any[]) => {
    for (const it of arr) {
      ["url", "pageUrl", "path"].forEach((f) => {
        if (it?.[f]) byUrl.set(keyOf(it[f]), it);
      });
      ["pageNameKo", "pageNameEn", "pageNameVn"].forEach((f) => {
        if (it?.[f]) byLabel.set(keyOf(it[f]), it);
      });
      ["pgmNo", "menuKey", "code", "key"].forEach((f) => {
        if (it?.[f] != null) byKey.set(String(it[f]), it);
      });
      if (Array.isArray(it?.children) && it.children.length) walk(it.children);
    }
  };

  walk(list);
  return { byUrl, byLabel, byKey };
};

const resolveProgram = (menu: MenuItemTypes, idx: ProgramIndex): ProgramMenuListRes | undefined => {
  if (menu.url) {
    const p = idx.byUrl.get(keyOf(menu.url));
    if (p) return p;
  }
  const labelCandidates = [keyOf(menu.label), keyOf((menu as any).labelKo), keyOf((menu as any).labelEn)].filter(
    Boolean
  );
  for (const k of labelCandidates) {
    const p = idx.byLabel.get(k);
    if (p) return p;
  }
  if (menu.key != null) {
    const p = idx.byKey.get(String(menu.key));
    if (p) return p;
  }
  return undefined;
};

/** -------------- DnD 가능한 타이틀 -------------- **/
const DraggableNode: React.FC<{
  node: MenuItemTypes;
  getProgram: (m: MenuItemTypes) => ProgramMenuListRes | undefined;
}> = ({ node, getProgram }) => {
  const program = getProgram(node);
  const isLeaf = !!program;

  const [{ isDragging }, dragRef] = useDrag<DragProgramItem, void, { isDragging: boolean }>({
    type: "PROGRAM_NODE",
    canDrag: () => Boolean(isLeaf),
    item: () => ({ type: "PROGRAM_NODE", program: program! }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <span
      ref={isLeaf ? dragRef : undefined}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isLeaf ? "move" : "default",
        display: "inline-block",
        pointerEvents: "auto",
      }}
      title={isLeaf ? "드래그해서 그룹으로 추가" : "메뉴 그룹은 드래그할 수 없습니다"}
    >
      {node.label}
    </span>
  );
};

export interface CustomDataNode extends DataNode {
  url?: string;
  data?: MenuItemTypes;
}

const convertToAntTree = (
  menuList: MenuItemTypes[],
  getProgram: (m: MenuItemTypes) => ProgramMenuListRes | undefined
): CustomDataNode[] =>
  menuList.map((menu) => ({
    title: <DraggableNode node={menu} getProgram={getProgram} />,
    key: menu.key,
    url: menu.url,
    icon: <FolderOutlined />,
    data: menu,
    children: menu.children ? convertToAntTree(menu.children, getProgram) : undefined,
  }));

const findKeyByUrl = (nodes: CustomDataNode[], url: string): string | null => {
  for (const node of nodes) {
    if (node.url === url) return node.key as string;
    if (node.children) {
      const found = findKeyByUrl(node.children as CustomDataNode[], url);
      if (found) return found;
    }
  }
  return null;
};

interface Props {
  /**  항상 마스터 메뉴만 들어와야 함 */
  programMenuTree: ProgramMenuListRes[];
  setSelectedRow: (row: ProgramMenuListRes | MenuItemTypes) => void;
}

const MenuTreeListDragDrop = memo(({ programMenuTree, setSelectedRow }: Props) => {
  const { language } = useSelector((state: any) => ({
    language: state.systemProgram.language,
  }));
  /**  마스터 메뉴로 인덱스 작성 (사용자 메뉴 X) */
  const index = useMemo(() => buildProgramIndex(programMenuTree), [programMenuTree]);
  const getProgram = (m: MenuItemTypes) => resolveProgram(m, index);

  const treeData = useMemo(() => {
    const menuList = convertProgramListToMenu(programMenuTree, language); // 건드리지 않음
    return convertToAntTree(menuList, getProgram);
  }, [programMenuTree, language]);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const selectedKey = findKeyByUrl(treeData, window.location.pathname);

  return (
    <Tree
      className="program-menu-tree"
      treeData={treeData}
      expandedKeys={expandedKeys}
      selectedKeys={selectedKey ? [selectedKey] : []}
      onExpand={(keys) => setExpandedKeys(keys as string[])}
      onSelect={(_, info) => setSelectedRow((info.node as any).data || {})}
      draggable={false}
    />
  );
});

export default MenuTreeListDragDrop;
