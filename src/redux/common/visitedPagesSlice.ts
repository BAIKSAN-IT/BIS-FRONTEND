import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProgramListRes } from "../system/SystemProgramSlice";
import { Cookies } from "react-cookie";

interface VisitedPage {
  path: string;
  label: string;
}

interface VisitedPagesState {
  pages: VisitedPage[];
  userId: string | null; // 현재 사용자 ID 추가
}

const MAX_PAGES = 8; //  최대 저장 개수
const EXCLUDED_PATHS = ["/auth/login", "/auth/logout", "/home"];

const cookies = new Cookies();

// 사용자별 쿠키 키 생성
const getVisitedPagesCookieKey = (userId: string) => `visited_pages_${userId}`;

// 쿠키에서 방문 기록 불러오기 (사용자 ID 별)
const loadPagesFromCookie = (userId: string): VisitedPage[] => {
  const key = getVisitedPagesCookieKey(userId);
  const storedPages = cookies.get(key);
  return storedPages ? storedPages : [];
};

// 쿠키에 저장하는 함수 (사용자 ID 별)
const savePagesToCookie = (pages: VisitedPage[], userId: string) => {
  const key = getVisitedPagesCookieKey(userId);
  cookies.set(key, pages, { path: "/", maxAge: 7 * 24 * 60 * 60 });
};

const initialState: VisitedPagesState = {
  pages: [],
  userId: null,
};

const visitedPagesSlice = createSlice({
  name: "VisitedPages",
  initialState,
  reducers: {
    // 로그인 후 초기화: 사용자 ID 설정 및 해당 사용자의 쿠키에서 방문 기록 불러오기
    initializeVisitedPages(state, action: PayloadAction<string>) {
      state.userId = action.payload;
      state.pages = loadPagesFromCookie(action.payload);
    },
    addVisitedPage(state, action: PayloadAction<VisitedPage>) {
      if (!state.userId) return; // 사용자 ID가 없으면 동작하지 않음

      const { path } = action.payload;
      if (EXCLUDED_PATHS.includes(path)) return;

      const exists = state.pages.some((page) => page.path === path);
      if (!exists) {
        state.pages.push(action.payload);
      }

      // 쿠키에 저장할 때 현재 사용자 ID를 사용
      savePagesToCookie(state.pages, state.userId);
    },
    removeVisitedPage(state, action: PayloadAction<string>) {
      if (!state.userId) return;
      state.pages = state.pages.filter((page) => page.path !== action.payload);
      savePagesToCookie(state.pages, state.userId);
    },
    removeAllVisitedPages(state) {
      if (!state.userId) return;
      state.pages = [];
      savePagesToCookie(state.pages, state.userId);
    },
    updatePageLabels(state, action: PayloadAction<{ systemProgram: ProgramListRes[]; language: string }>) {
      if (!state.userId) return;
      const { systemProgram, language } = action.payload;
      state.pages = state.pages.map((page) => {
        const currentProgram = systemProgram.find((program) => program.pageUrl === page.path);
        if (currentProgram) {
          let label = "";
          switch (language) {
            case "en":
              label = currentProgram.pageNameEn || currentProgram.pageNameKo;
              break;
            case "vi":
              label = currentProgram.pageNameVn || currentProgram.pageNameKo;
              break;
            default:
              label = currentProgram.pageNameKo;
          }
          return { ...page, label };
        }
        return page;
      });
      savePagesToCookie(state.pages, state.userId);
    },
  },
});

export const { initializeVisitedPages, addVisitedPage, removeVisitedPage, updatePageLabels, removeAllVisitedPages } =
  visitedPagesSlice.actions;
export default visitedPagesSlice.reducer;
