import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
  programList: ProgramListRes[]; // 프로그램 목록 저장
  language: string;
}

const initialState: State = {
  loading: false,
  error: null,
  programList: [],
  language: "ko",
};

/* 프로그램 저장 및 업데이트 Req */
interface ProgramMenuSaveReq {
  cdCompany: string; // 회사 코드
  pgmNo: string; // 프로그램 번호
  appName: string; // 애플리케이션 이름
  menuId: string; // 메뉴 ID
  menuLevel: string; // 메뉴 레벨
  menuType: string; // 메뉴 타입
  pageId: string; // 페이지 ID
  pageNameKo: string; // 페이지명 (한국어)
  pageNameEn: string; // 페이지명 (영어)
  pageNameVn: string; // 페이지명 (베트남어)
  pageNameL1: string; // 페이지명 L1
  pageNameL2: string; // 페이지명 L2
  pageNameL3: string; // 페이지명 L3
  pageUrl: string; // 페이지 URL
  pagePrefix: string; // 페이지 접두어
  parentNo: string; // 부모 번호
  sortNo: string; // 정렬 번호
  pageYn: string; // 페이지 사용 여부
  menuIcon: string; // 메뉴 아이콘
  remark: string; // 비고
  find: string; // 조회 여부
  newFlag: string; // 신규 여부
  del: string; // 삭제 여부
  sav: string; // 저장 여부
  prt: string; // 출력 여부
  excelDown: string; // 엑셀 다운로드 여부
  excelUp: string; // 엑셀 업로드 여부
  useGrp: string; // 그룹 사용 여부
  copy: string; // 복사 여부
  rowAdd: string; // 행 추가 여부
  rowDel: string; // 행 삭제 여부
  popup: string; // 팝업 여부
  extBtn1: string; // 확장 버튼 1
  extBtn2: string; // 확장 버튼 2
  extBtn3: string; // 확장 버튼 3
  useYn: string; // 사용 여부
  pageRemark: string; // 페이지 비고
  idInsert: string; // 입력 ID
}

/* 프로그램 목록 조회 Req */
interface ProgramListReq {
  cdCompany: string; // 회사 코드
  groupId: string; // GROUP ID
  cdUserId: string; // User ID
}

/* 프로그램 목록 조회 Res */
interface ProgramListRes {
  cdCompany: string; // 회사 코드
  pgmNo: string; // 프로그램 번호
  appName: string; // 애플리케이션 이름
  menuId: string; // 메뉴 ID
  menuLevel: string; // 메뉴 레벨
  pageNameKo: string; // 페이지 이름 (한국어)
  pageNameEn: string; // 페이지 이름 (영어)
  pageNameVn: string; // 페이지 이름 (베트남어)
  menuType: string; // 메뉴 타입
  pageId: string; // 페이지 ID
  pagePrefix: string; // 페이지 접두사
  pageUrl: string; // 페이지 URL
  sortNo: string; // 정렬 번호
  parentNo: string; // 부모 번호
  menuIcon: string; // 메뉴 아이콘
  userLvl: string; // 사용자 레벨
  lvlYn: string; // 레벨 여부
  find: string; // 조회 권한
  newEntry: string; // 신규 권한
  del: string; // 삭제 권한
  sav: string; // 저장 권한
  prt: string; // 출력 권한
  excelDown: string; // 엑셀 다운로드 권한
  excelUp: string; // 엑셀 업로드 권한
  useGrp: string; // 사용 그룹
  copy: string; // 복사 권한
  rowAdd: string; // 행 추가 권한
  rowDel: string; // 행 삭제 권한
  popup: string; // 팝업 권한
  extBtn1: string; // 버튼 1
  extBtn2: string; // 버튼 2
  extBtn3: string; // 버튼 3
  language: string; // 현재언어
}

/* 전체 프로그램 메뉴 목록 조회 Req */
interface ProgramMenuListReq {
  cdCompany: string; // 회사 코드
  menuLevel: string; // MenuLEVEL
  appName: string; // 애플리케이션 이름
  pageName: string; // 프로그램 명
}

/* 전체 프로그램 메뉴 목록 조회 Res */
interface ProgramMenuListRes {
  cdCompany: string; // 회사 코드
  pgmNo: string; // 프로그램 번호
  appName: string; // 애플리케이션 이름
  menuId: string; // 메뉴 ID
  menuLevel: string; // 메뉴 레벨
  menuType: string; // 메뉴 타입
  pageNameKo: string; // 페이지 이름 (한국어)
  pageNameEn: string; // 페이지 이름 (영어)
  pageNameVn: string; // 페이지 이름 (베트남어)
  pageNameL1: string; // 페이지 이름 L1
  pageNameL2: string; // 페이지 이름 L2
  pageNameL3: string; // 페이지 이름 L3
  pageId: string; // 페이지 ID
  pagePrefix: string; // 페이지 접두어
  pageUrl: string; // 페이지 URL
  sortNo: string; // 정렬 번호
  parentNo: string; // 부모 번호
  menuIcon: string; // 메뉴 아이콘
  remark: string; // 비고
  find: string; // 조회 여부
  newFlag: string; // 신규 여부
  del: string; // 삭제 여부
  sav: string; // 저장 여부
  prt: string; // 출력 여부
  excelDown: string; // 엑셀 다운로드 여부
  excelUp: string; // 엑셀 업로드 여부
  useGrp: string; // 그룹 사용 여부
  copy: string; // 복사 여부
  rowAdd: string; // 행 추가 여부
  rowDel: string; // 행 삭제 여부
  popup: string; // 팝업 여부
  extBtn1: string; // 확장 버튼 1
  extBtn2: string; // 확장 버튼 2
  extBtn3: string; // 확장 버튼 3
  useYn: string; // 사용 여부
  pageYn: string; // 페이지 사용 여부
  pageRemark: string; // 페이지 비고
  seqNo: string;
  isNew: boolean;
}

/* 사용자 정보 저장 및 업데이트 API */
export const saveProgramMenuInfo = createAsyncThunk<AxiosResponse, ProgramMenuSaveReq>(
  "system/program/saveProgramMenuInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/program/saveProgramMenuInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 프로그램 목록 조회 API */
export const getProgramList = createAsyncThunk<AxiosResponse, ProgramListReq>(
  "system/program/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/program/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 전체 프로그램 메뉴 목록 조회 API */
export const getProgramMenuList = createAsyncThunk<AxiosResponse, ProgramMenuListReq>(
  "system/program/menuList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/program/menuList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const SystemProgramSlice = createSlice({
  name: "systemProgram",
  initialState,
  reducers: {
    setProgramList(state, action: PayloadAction<ProgramListRes[]>) {
      state.programList = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    reset(state) {
      state.loading = false;
      state.error = null;
      state.programList = [];
      state.language = "ko"; // 초기화 시 언어도 리셋
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProgramList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProgramList.fulfilled, (state, action: PayloadAction<AxiosResponse<ProgramListRes[]>>) => {
        state.loading = false;
        state.programList = action.payload.data.map((program) => ({
          ...program,
          language: state.language, // 현재 Redux 언어를 프로그램에 추가
        }));
      })
      .addCase(getProgramList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { errorMessage?: string })?.errorMessage ?? "프로그램 목록 조회 실패";
      });
  },
});

export const { setProgramList, setLanguage, reset } = SystemProgramSlice.actions;

export default SystemProgramSlice.reducer;

export type { ProgramListRes, ProgramListReq, ProgramMenuListRes, ProgramMenuListReq, ProgramMenuSaveReq };
