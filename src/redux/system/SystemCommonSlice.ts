import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
  codeList: CodeListRes[]; // 코드 목록 저장
  codeDtlList: CodeDtlListRes[]; // 코드 목록 저장
  language: string;
}

const initialState: State = {
  loading: false,
  error: null,
  codeList: [],
  codeDtlList: [],
  language: "ko",
};

/* 프로그램 저장 및 업데이트 Req */
interface SaveCodeListReq {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  nmField: string; // 대분류코드명
  nmFieldEn: string; // 대분류코드명 영어
  nmFieldJp: string; // 대분류코드명 일어
  nmFieldCh: string; // 대분류코드명 중국어
  nmFieldL1: string; // 대분류코드명 L1
  nmFieldL2: string; // 대분류코드명 L2
  nmFieldL3: string; // 대분류코드명 L3
  nmFieldL4: string; // 대분류코드명 L4
  nmFieldL5: string; // 대분류코드명 L5
  fgSysCode: string; // SYS CODE
  remark: string; // 참고사항
  idUser: string; // 입력 ID
}

/* 프로그램 목록 조회 Req */
interface CodeListReq {
  cdCompany: string; // 회사 코드
  nmField: string; // 대분류 코드
}

/* 프로그램 목록 조회 Res */
interface CodeListRes {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  nmField: string; // 대분류코드명
  nmFieldEn: string; // 대분류코드명 영어
  nmFieldJp: string; // 대분류코드명 일어
  nmFieldCh: string; // 대분류코드명 중국어
  nmFieldL1: string; // 대분류코드명 L1
  nmFieldL2: string; // 대분류코드명 L2
  nmFieldL3: string; // 대분류코드명 L3
  nmFieldL4: string; // 대분류코드명 L4
  nmFieldL5: string; // 대분류코드명 L5
  fgSysCode: string; // SYS CODE
  remark: string; // 참고사항
  seqNo: number;
  isNew: boolean;
}

/* 프로그램 저장 및 업데이트 Req */
interface SaveCodeDtlListReq {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  cdSysdef: string; //세부코드
  nmSysdef: string; // 세부코드명
  nmSysdefEn: string; // 세부코드명 영어
  nmSysdefJp: string; // 세부코드명 일어
  nmSysdefCh: string; // 세부코드명 중국어
  nmSysdefL1: string; // 세부코드명 L1
  nmSysdefL2: string; // 세부코드명 L2
  nmSysdefL3: string; // 세부코드명 L3
  nmSysdefL4: string; // 세부코드명 L4
  nmSysdefL5: string; // 세부코드명 L5
  cdHigh: string; //상위코드
  cdUsrdef: string; //사용자정의 코드
  nmUsrdef: string; //사용자정의명
  nmUsrdefEn: string; //사용자정의명 영어
  nmUsrdefL1: string; //사용자정의명
  nmUsrdefL2: string; //사용자정의명
  fgSysCode: string; //syscode
  cdFlag1: string; //flag 1
  cdFlag2: string; //flag 1
  cdFlag3: string; //flag 1
  noOrder: string; //정렬순선
  useYn: string; //사용여부
  remark: string; // 참고사항
  idUser: string; // 입력 ID
  isNew: boolean;
  seqNo: number;
}

/* 프로그램 목록 조회 Req */
interface CodeDtlListReq {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류 코드
}

/* 프로그램 목록 조회 Res */
interface CodeDtlListRes {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  cdSysdef: string; //세부코드
  nmSysdef: string; // 세부코드명
  nmSysdefEn: string; // 세부코드명 영어
  nmSysdefJp: string; // 세부코드명 일어
  nmSysdefCh: string; // 세부코드명 중국어
  nmSysdefL1: string; // 세부코드명 L1
  nmSysdefL2: string; // 세부코드명 L2
  nmSysdefL3: string; // 세부코드명 L3
  nmSysdefL4: string; // 세부코드명 L4
  nmSysdefL5: string; // 세부코드명 L5
  cdHigh: string; //상위코드
  cdUsrdef: string; //사용자정의 코드
  nmUsrdef: string; //사용자정의명
  nmUsrdefEn: string; //사용자정의명 영어
  nmUsrdefL1: string; //사용자정의명
  nmUsrdefL2: string; //사용자정의명
  fgSysCode: string; //syscode
  cdFlag1: string; //flag 1
  cdFlag2: string; //flag 1
  cdFlag3: string; //flag 1
  noOrder: string; //정렬순선
  useYn: string; //사용여부
  remark: string; // 참고사항
  isNew: boolean;
  idUser: string; // 입력 ID
  seqNo: number;
}

// 전체 영업 활동 저장 요청 DTO
interface SaveCodeReq {
  saveCodeList: SaveCodeListReq[]; // 영업 활동 데이터 목록
  saveCodeDtlList: SaveCodeDtlListReq[]; // 영업 활동 오더 데이터 목록
}

interface CodeListAllRes {
  codeList: CodeListRes[];
  codeDtlList: CodeDtlListRes[];
}

interface DeleteCodeReq {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  nmField: string; // 대분류코드명
  nmFieldEn: string; // 대분류코드명 영어
}

interface DeleteCodeDtlReq {
  cdCompany: string; // 회사 코드
  cdField: string; // 대분류코드
  cdSysdef: string; //세부코드
  nmSysdef: string; // 세부코드명
  nmSysdefEn: string; // 세부코드명 영어
}
/* code list update API */
export const saveCodeInfo = createAsyncThunk<AxiosResponse, SaveCodeListReq>(
  "system/code/saveCodeInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/saveCodeInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* code list detail update API */
export const saveCodeDtlInfo = createAsyncThunk<AxiosResponse, SaveCodeDtlListReq>(
  "system/code/saveCodeDtlInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/saveCodeDtlInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* code list 조회 API */
export const getCodeList = createAsyncThunk<AxiosResponse, CodeListReq>(
  "system/code/codeList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/codeList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* code detail list 조회 API */
export const getCodeDtlList = createAsyncThunk<AxiosResponse, CodeDtlListReq>(
  "system/code/codeDtlList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/codeDtlList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* code 삭제 API */
export const deleteCodeInfo = createAsyncThunk<AxiosResponse, DeleteCodeReq>(
  "system/code/deleteCodeInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/deleteCodeInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* code detail 삭제 API */
export const deleteCodeDtlInfo = createAsyncThunk<AxiosResponse, DeleteCodeDtlReq>(
  "system/code/deleteCodeDtlInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/code/deleteCodeDtlInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const SystemCommonSlice = createSlice({
  name: "systemCommon",
  initialState,
  reducers: {
    setCodeList(state, action: PayloadAction<CodeListRes[]>) {
      state.codeList = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    reset(state) {
      state.loading = false;
      state.error = null;
      state.codeList = [];
      state.codeDtlList = [];
      state.language = "ko"; // 초기화 시 언어도 리셋
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCodeList.fulfilled, (state, action: PayloadAction<AxiosResponse<CodeListRes[]>>) => {
        state.loading = false;
        state.codeList = action.payload.data.map((program) => ({
          ...program,
          language: state.language, // 현재 Redux 언어를 프로그램에 추가
        }));
      })
      .addCase(getCodeList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { errorMessage?: string })?.errorMessage ?? "프로그램 목록 조회 실패";
      });
  },
});

export const { setCodeList, setLanguage, reset } = SystemCommonSlice.actions;

export default SystemCommonSlice.reducer;

export type {
  CodeListRes,
  CodeListReq,
  CodeDtlListRes,
  CodeDtlListReq,
  SaveCodeListReq,
  SaveCodeDtlListReq,
  CodeListAllRes,
};
