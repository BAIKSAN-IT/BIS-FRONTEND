import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "../../helpers/api/apiCore";
import { getRndArticleRecapAllList, RndArticleRecapAllRes } from "./RecapSlice";

/* ================================
   요청/응답 DTO
================================ */
export interface SaveRndArticleFavoriteReq {
  cdCompany: string;
  cdWorker: string;
  seqArticle: string;
  useYn?: string;
  remark?: string;
  idInsert?: string;
  ynFlag?: string; // I/U/D
}

export interface RndArticleFileRes {
  cdCompany: string;
  seqArticle: string;
  seq: number;
  imgFileNameOrg: string;
  imgFileName: string;
  ynFlag: string | null;
}

export interface RndArticleFavoriteAllRes {
  rndArticleFavoriteList: RndArticleFavoriteRes[];
  rndArticleFileList: RndArticleFileRes[];
}

export interface RndArticleFavoriteReq {
  cdCompany?: string;
  cdDept?: string;
  cdWorker?: string;
  useYn?: string;
  remark?: string;
  seqArticle?: string;
  seq?: number;
}

export interface RndArticleFavoriteRes {
  cdCompany?: string;
  seqArticle?: string;
  nmFabric?: string;
  nmSupplier?: string | null;
  noSupplierArticle?: string;

  pricePerMeter?: number;

  cdWorker?: string;
  useYn?: string;
  remark?: string; // ← 화면/저장에서 사용할 필드(정규화 대상)
  remarkDetail?: string; // ← 서버에서 들어오는 원본 필드

  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;

  // 이 외에도 서버에서 내려오는 속성들 존재 가능(생략)
}

/* ================================
   유틸
================================ */
const mergeBy = <T>(arr: T[], keyFn: (v: T) => string) => {
  const m = new Map<string, T>();
  for (const v of arr) m.set(keyFn(v), v);
  return Array.from(m.values());
};

// ✅ 서버 응답/추가 데이터 정규화: remark <- remark ?? remarkDetail ?? ""
const normalizeRow = (row: RndArticleFavoriteRes): RndArticleFavoriteRes => {
  const remark = row.remark ?? row.remarkDetail ?? "";
  return { ...row, remark };
};

/* ================================
   Thunks
================================ */
export const saveRndArticleFavorite = createAsyncThunk<AxiosResponse, SaveRndArticleFavoriteReq[]>(
  "favorite/saveRndArticleFavorite",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("favorite/saveRndArticleFavorite", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleFavoriteAllList = createAsyncThunk<AxiosResponse, RndArticleFavoriteReq>(
  "favorite/favoriteAllList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("favorite/favoriteAllList", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* ================================
   Slice
================================ */
interface FavoriteState {
  list: RndArticleFavoriteRes[];
  fileList: RndArticleFileRes[];
  loading: boolean;
  error: string | null;
  /** 최초 진입 시 1회 서버 조회했는지(신규로 비워도 재조회 금지) */
}

const initialState: FavoriteState = {
  list: [],
  fileList: [],
  loading: false,
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    /** FabricList에서 넘어온 항목 추가(append + dedup) + remark 정규화 */
    addFavorite: (state, action: PayloadAction<RndArticleFavoriteRes[]>) => {
      const normalized = action.payload.map(normalizeRow);
      state.list = mergeBy([...state.list, ...normalized], (v) => (v.seqArticle || "").toString());
    },
    /** 선택 삭제 */
    removeFavorite: (state, action: PayloadAction<string[]>) => {
      state.list = state.list.filter((item) => !action.payload.includes(item.seqArticle || ""));
    },
    /** 신규 버튼: 목록만 지우고 fetch-플래그는 유지(=true)해서 재조회 방지 */
    clearFavorite: (state) => {
      state.list = [];
      state.fileList = [];
    },
    /** 파일 누적/중복제거 */
    mergeFavoriteFiles: (state, action: PayloadAction<RndArticleFileRes[]>) => {
      const next = [...state.fileList, ...(action.payload || [])];
      state.fileList = mergeBy(next, (f) => `${f.seqArticle}|${f.seq}`);
    },
    /** 셀 수정(로컬) */
    patchFavoriteCell: (
      state,
      action: PayloadAction<{ seqArticle: string; field: keyof RndArticleFavoriteRes; value: any }>
    ) => {
      const { seqArticle, field, value } = action.payload;
      const idx = state.list.findIndex((r) => (r.seqArticle || "") === seqArticle);
      if (idx >= 0) {
        (state.list[idx] as any)[field] = value;
        // remark만 수정해도 remarkDetail은 굳이 건드릴 필요 없음(정규화로 항상 remark를 신뢰)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRndArticleFavoriteAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleFavoriteAllList.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as RndArticleFavoriteAllRes;

        const normalized = (data?.rndArticleFavoriteList ?? []).map(normalizeRow);
        const incomingFiles = data?.rndArticleFileList ?? [];

        // ALL 탭에서 로컬로 추가 후 Favorite 탭으로 이동했을 때,
        // 서버 조회 결과가 빈 배열이면 로컬 목록을 덮어쓰지 않도록 보호한다.
        if (!(normalized.length === 0 && state.list.length > 0)) {
          state.list = mergeBy(normalized, (v) => String(v.seqArticle || ""));
        }

        if (!(incomingFiles.length === 0 && state.fileList.length > 0)) {
          state.fileList = mergeBy(incomingFiles, (f) => `${f.seqArticle}|${f.seq}`);
        }
      })
      .addCase(getRndArticleFavoriteAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "조회 실패";
      })
      .addCase(saveRndArticleFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRndArticleFavorite.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveRndArticleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "저장 실패";
      });
  },
});

export const { addFavorite, removeFavorite, clearFavorite, mergeFavoriteFiles, patchFavoriteCell } =
  favoriteSlice.actions;

export default favoriteSlice.reducer;
