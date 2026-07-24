import { ProgramListRes, ProgramMenuListRes } from "../redux/system/SystemProgramSlice";

export interface MenuItemTypes {
  key: string;
  label: string;
  isTitle?: boolean;
  icon?: string;
  url?: string;
  badge?: {
    variant: string;
    text: string;
  };
  level?: string;
  parentKey?: string;
  target?: string;
  children?: MenuItemTypes[];
}

export const convertProgramListToMenu = (
  programList: ProgramListRes[] | ProgramMenuListRes[],
  language: string
): MenuItemTypes[] => {
  const menuMap = new Map<string, MenuItemTypes>();

  programList.forEach((item) => {
    let label = item.pageNameKo; // 기본값 (ko)
    if (language === "en") {
      label = item.pageNameEn || item.pageNameKo;
    } else if (language === "vi") {
      label = item.pageNameVn || item.pageNameKo;
    }

    menuMap.set(item.menuId, {
      key: item.menuId,
      label: label,
      level: item.menuLevel,
      url: item.pageUrl,
      parentKey: item.parentNo,
      icon: item.menuLevel === "1" ? item.menuIcon || "airplay" : "",
      isTitle: item.menuLevel === "0",
      children: item.menuLevel === "99" ? undefined : [],
    });
  });

  // 부모-자식 관계 구성
  const menuTree: MenuItemTypes[] = [];
  menuMap.forEach((menu) => {
    if (menu.parentKey && menuMap.has(menu.parentKey)) {
      const parent = menuMap.get(menu.parentKey);
      parent?.children?.push(menu);
    } else {
      menuTree.push(menu);
    }
  });

  // level === 2 처리
  menuMap.forEach((level2Menu) => {
    if (level2Menu.level === "2") {
      const level1Menu = menuMap.get(level2Menu.parentKey!);
      if (level1Menu) {
        // level 2 중복 방지: 같은 key의 자식이 없을 때만 추가
        if (!level1Menu.children?.some((child) => child.key === level2Menu.key)) {
          level1Menu.children?.push(level2Menu);
        }
      }

      // level 2 하위의 level 99만 필터링
      level2Menu.children = level2Menu.children?.filter(
        (child) => child.level === "99" && child.parentKey === level2Menu.key
      );
    }
  });

  // level === 99 필터링 (level 2 하위 또는 level 1 하위에만 존재하도록)
  const filteredMenuTree = menuTree.map((menu) => {
    if (menu.level === "1") {
      menu.children = menu.children
        ?.map((subMenu) => {
          if (subMenu.level === "2") {
            subMenu.children = subMenu.children?.filter((child) => child.level === "99");
          }
          return subMenu;
        })
        .filter((subMenu) => subMenu.level === "2" || subMenu.level === "99");
    }
    return menu;
  });
  return filteredMenuTree;
};
