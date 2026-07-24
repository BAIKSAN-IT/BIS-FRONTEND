import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TwoColumnTheme,
  LayoutMode,
  LayoutTypes,
  LayoutColor,
  LayoutWidth,
  MenuPositions,
  SideBarTheme,
  SideBarTypes,
  TopbarTheme,
} from "../../constants/layout";
import { getLayoutConfigs } from "../../utils";

// 초기 상태 정의
const initialState = {
  twoColumnTheme: TwoColumnTheme.TWOCOLUMN_LIGHT,
  layoutMode: LayoutMode.LAYOUT_DEFAULT,
  sidenavUser: false,
  layoutType: LayoutTypes.LAYOUT_VERTICAL,
  layoutColor: LayoutColor.LAYOUT_COLOR_LIGHT,
  layoutWidth: LayoutWidth.LAYOUT_WIDTH_FLUID,
  menuPosition: MenuPositions.MENU_POSITION_FIXED,
  leftSideBarTheme: SideBarTheme.LEFT_SIDEBAR_THEME_LIGHT,
  leftSideBarType: SideBarTypes.LEFT_SIDEBAR_TYPE_DEFAULT,
  showTwoToneIcons: false,
  showSidebarUserInfo: false,
  topbarTheme: TopbarTheme.TOPBAR_THEME_DARK,
  isOpenRightSideBar: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    changeTwoColumnTheme(state, action: PayloadAction<TwoColumnTheme>) {
      state.twoColumnTheme = action.payload;
    },
    changeLayout(state, action: PayloadAction<LayoutTypes>) {
      state.layoutType = action.payload;
    },
    changeLayoutMode(state, action: PayloadAction<LayoutMode>) {
      state.layoutMode = action.payload;
    },
    changeLayoutColor(state, action: PayloadAction<LayoutColor>) {
      state.layoutColor = action.payload;
    },
    changeLayoutWidth(state, action: PayloadAction<LayoutWidth>) {
      state.layoutWidth = action.payload;
      // layoutConfig는 상수로 유지될 수 있으며, 새로운 설정으로 상태 업데이트
      const layoutConfig = getLayoutConfigs(action.payload);
      return { ...state, ...layoutConfig };
    },
    changeMenuPositions(state, action: PayloadAction<MenuPositions>) {
      state.menuPosition = action.payload;
    },
    changeSidebarTheme(state, action: PayloadAction<SideBarTheme>) {
      state.leftSideBarTheme = action.payload;
    },
    changeSidebarType(state, action: PayloadAction<SideBarTypes>) {
      state.leftSideBarType = action.payload;
    },
    toggleSidebarUserInfo(state, action: PayloadAction<boolean>) {
      state.showSidebarUserInfo = action.payload;
    },
    changeTopbarTheme(state, action: PayloadAction<TopbarTheme>) {
      state.topbarTheme = action.payload;
    },
    toggleTwoToneIcons(state, action: PayloadAction<boolean>) {
      state.showTwoToneIcons = action.payload;
    },
    showRightSidebar(state) {
      state.isOpenRightSideBar = true;
    },
    hideRightSidebar(state) {
      state.isOpenRightSideBar = false;
    },
  },
});

// 액션 생성기와 리듀서 내보내기
export const {
  changeTwoColumnTheme,
  changeLayout,
  changeLayoutMode,
  changeLayoutColor,
  changeLayoutWidth,
  changeMenuPositions,
  changeSidebarTheme,
  changeSidebarType,
  toggleSidebarUserInfo,
  changeTopbarTheme,
  toggleTwoToneIcons,
  showRightSidebar,
  hideRightSidebar,
} = layoutSlice.actions;

export default layoutSlice.reducer;
