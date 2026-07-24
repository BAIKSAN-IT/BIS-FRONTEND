import React, { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

/* lb */
import { Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { FolderOutlined } from "@ant-design/icons";

/* redux */
import { RootState } from "../../../../redux/store";
import { ProgramMenuListRes } from "../../../../redux/system/SystemProgramSlice";

/* constants */
import { convertProgramListToMenu, MenuItemTypes } from "../../../../constants/menuUtils";

export interface CustomDataNode extends DataNode {
  url?: string;
  data?: any;
}

// URL에 해당하는 노드의 key를 찾는 재귀함수
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

const convertToAntTree = (menuList: MenuItemTypes[]): CustomDataNode[] => {
  return menuList.map((menu) => ({
    title: menu.label,
    key: menu.key,
    url: menu.url,
    icon: <FolderOutlined />,
    data: menu,
    children: menu.children ? convertToAntTree(menu.children) : undefined,
  }));
};

interface Props {
  programMenuTree: ProgramMenuListRes[];
  setSelectedRow: (row: ProgramMenuListRes) => void;
}

const ProgramMenuTree = memo(({ programMenuTree, setSelectedRow }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useSelector((state: RootState) => ({
    language: state.systemProgram.language,
  }));

  const treeData: CustomDataNode[] = useMemo(() => {
    const menuList: MenuItemTypes[] = convertProgramListToMenu(programMenuTree, language);
    return convertToAntTree(menuList);
  }, [programMenuTree]);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    if (info.node.data) {
      setSelectedRow(info.node.data as ProgramMenuListRes);
    }
  };

  const onExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys as string[]);
  };

  const selectedKey = findKeyByUrl(treeData, location.pathname);
  return (
    <Tree
      className={"program-menu-tree"}
      treeData={treeData}
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      selectedKeys={selectedKey ? [selectedKey] : []}
      onSelect={onSelect}
    />
  );
});

export default ProgramMenuTree;
