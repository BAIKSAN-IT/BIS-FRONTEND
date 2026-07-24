// redux/rnd/RecapSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "@helpers/api/apiCore";

/* ================================
   Types
================================ */
export interface RndArticleRecapRes {
  // RD_ARTICLE (B.*)
  cdCompany?: string;
  seqArticle?: string;
  cdHanger?: string;
  cdFabric?: string;
  nmFabric?: string;
  nmFabricSt?: string;
  cdSupplier?: string;
  nmSupplier?: string;
  noSupplierArticle?: string;
  fabricDivision?: string;
  nmFabricDivision?: string;
  fabricType?: string;
  nmFabricType?: string;
  productType?: string;
  nmProductType?: string;
  fabricCategory?: string;
  nmFabricCategory?: string;
  fabricStructure?: string;
  nmFabricStructure?: string;
  cdLayer?: string;
  composition?: string;
  noLot?: string;
  noSample?: string;
  fabricInch?: string;
  fabricGauge?: number;
  widthInch?: number;
  wgtGsm?: number;
  wgtYdm?: number;
  cdPressure?: string;
  cdColorType?: string;
  cdColor?: string;
  nmColor?: string;
  cdCurrency?: string;
  dtPrice?: string /* PRICE DATE */;
  pricePerYard?: number;
  pricePerWight?: number;
  pricePerMeter?: number;
  cdUnit?: string;
  cdCountry?: string;
  cdIncomterms?: string;
  leadtimeDays?: number;
  minOrders?: number;
  minColor?: number;
  qtyKeep?: number;
  buyerNotify?: string;
  internalNotify?: string;
  ynConfirm?: string;
  nmYnConfirm?: string;
  dtConfirm?: string;
  cdDept?: string;
  nmDept?: string;
  noEmp?: string;
  userNm?: string;
  cdTheme?: string;
  cdItem?: string;
  cdHangerPrev?: string;
  dtHanger?: string;
  garmentSample?: string;
  styleDesc?: string;
  nuNidcnt?: number;
  ynDevelopSample?: string;
  yn1stSample?: string;
  ynColorSample?: string;
  ynReviseColorSample?: string;
  ynAppSample?: string;
  fabricFinishing?: string;
  // RD_ARTICLE_RECAP (A.*)
  dtsDate?: string; // YYYYMMDD
  dtsSeq?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  nmSeason?: string;
  dtsYear?: string;
  cdWorker?: string;
  seqSort?: number;
  topic?: string;
  remark?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
  remarkDetail?: string;
}

export interface RndArticleFileRes {
  cdCompany: string;
  seqArticle: string;
  seq: number;
  imgFileNameOrg: string;
  imgFileName: string;
  ynFlag: string | null;
}

export interface RndArticleRecapAllRes {
  rndArticleRecapList: RndArticleRecapRes[];
  rndArticleFileList: RndArticleFileRes[];
}

export interface RndArticleRecapListViewRes {
  cdCompany?: string;
  dtsDate?: string; // YYYYMMDD
  dtsSeq?: string;
  cdWorker?: string;
  userNm?: string;
  nmBuyer?: string;
  nmBrand?: string;
  seqArticle?: string;
  topic?: string;
  remark?: string;
  cdSeason?: string;
  nmSeason?: string;
}

export interface RndArticleRecapReq {
  cdCompany?: string;
  startDate?: string; // YYYYMMDD
  endDate?: string; // YYYYMMDD
  dtsSeq?: string;
  cdWorker?: string;

  // TopRegister 조건
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  dtsYear?: string;
  topic?: string;
  remark?: string;

  // 기타
  seqArticle?: string;
  seq?: number;
}

export interface SaveRndArticleRecapReq {
  cdCompany: string;
  dtsDate: string; // YYYYMMDD
  dtsSeq?: string;
  seqArticle: string;
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  dtsYear?: string;
  cdWorker: string;
  seqSort?: number;
  topic?: string;
  remark?: string;
  remarkDetail?: string;
  idInsert?: string;
  ynFlag?: string; // 'Y' | 'N' | 'D'
}

/* ================================
   State
================================ */
interface RecapState {
  listView: RndArticleRecapListViewRes[]; // 좌측 목록
  list: RndArticleRecapRes[]; // 우측 상세
  fileList: RndArticleFileRes[];
  recapBasket: RndArticleRecapRes[]; // Recap으로 넘길 임시 바구니
  loading: boolean;
  error: string | null;
}

const initialState: RecapState = {
  listView: [],
  list: [],
  fileList: [],
  recapBasket: [],
  loading: false,
  error: null,
};

/* ================================
   Utils
================================ */
const mergeBy = <T>(arr: T[], keyFn: (v: T) => string) => {
  const m = new Map<string, T>();
  for (const v of arr) m.set(keyFn(v), v);
  return Array.from(m.values());
};

const normalizeRow = (row: RndArticleRecapRes): RndArticleRecapRes & { remarkDetail?: string } => {
  return { ...row, remarkDetail: row.remarkDetail ?? "" };
};

/* ================================
   Thunks
================================ */
export const saveRndArticleRecap = createAsyncThunk<AxiosResponse, SaveRndArticleRecapReq[]>(
  "recap/saveRndArticleRecap",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("recap/saveRndArticleRecap", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleRecapAllList = createAsyncThunk<AxiosResponse, RndArticleRecapReq>(
  "recap/recapAllList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("recap/recapAllList", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleRecapListView = createAsyncThunk<AxiosResponse, RndArticleRecapReq>(
  "recap/recapListView",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("recap/recapListView", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* ================================
   Slice
================================ */
const recapSlice = createSlice({
  name: "recap",
  initialState,
  reducers: {
    addRecap: (state, action: PayloadAction<RndArticleRecapRes[]>) => {
      const normalized = action.payload.map(normalizeRow);
      state.list = mergeBy([...state.list, ...normalized], (v) => String(v.seqArticle || ""));
    },
    removeRecap: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.list = state.list.filter((r) => !removeSet.has(String(r.seqArticle || "")));
    },
    mergeRecapFiles: (state, action: PayloadAction<RndArticleFileRes[]>) => {
      const next = [...state.fileList, ...(action.payload || [])];
      state.fileList = mergeBy(next, (f) => `${f.seqArticle}|${f.seq}`);
    },

    clearRecap: (state) => {
      state.list = [];
      state.fileList = [];
    },
    clearRecapView: (state) => {
      state.listView = [];
    },

    // ✅ Recap 바구니 (더블클릭 전용 사용)
    addToRecapBasket: (state, action: PayloadAction<RndArticleRecapRes[]>) => {
      const merged = mergeBy([...state.recapBasket, ...action.payload.map(normalizeRow)], (v) =>
        String((v as any).seqArticle ?? (v as any).seqNo ?? "")
      );
      state.recapBasket = merged;
    },
    removeFromRecapBasket: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.recapBasket = state.recapBasket.filter((r) => !removeSet.has(String(r.seqArticle ?? r.seqNo ?? "")));
    },
    clearRecapBasket: (state) => {
      state.recapBasket = [];
    },

    // ✅ 셀 수정 허용 필드 제한
    patchRecapCell: (
      state,
      action: PayloadAction<{ seqArticle: string; field: keyof RndArticleRecapRes; value: any }>
    ) => {
      const { seqArticle, field, value } = action.payload;
      const idx = state.list.findIndex((r) => String(r.seqArticle || "") === String(seqArticle));
      if (idx < 0) return;
      const editable = new Set<keyof RndArticleRecapRes>(["remarkDetail", "topic", "seqSort"]);
      if (!editable.has(field)) return;
      (state.list[idx] as any)[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      // 좌측
      .addCase(getRndArticleRecapListView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleRecapListView.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as any;
        const arr: RndArticleRecapListViewRes[] = Array.isArray(data) ? data : data?.rndArticleRecapListView ?? [];
        state.listView = arr ?? [];
      })
      .addCase(getRndArticleRecapListView.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "리스트뷰 조회 실패";
      })

      // 우측 상세
      .addCase(getRndArticleRecapAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleRecapAllList.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as RndArticleRecapAllRes;

        const normalized = (data?.rndArticleRecapList ?? []).map(normalizeRow);

        state.list = mergeBy([...state.list, ...normalized], (v) => String(v.seqArticle || ""));

        if (data?.rndArticleFileList?.length) {
          const nextFiles = [...state.fileList, ...data.rndArticleFileList];
          state.fileList = mergeBy(nextFiles, (f) => `${f.seqArticle}|${f.seq}`);
        }
      })
      .addCase(getRndArticleRecapAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "상세 조회 실패";
      })

      // 저장
      .addCase(saveRndArticleRecap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRndArticleRecap.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveRndArticleRecap.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "저장 실패";
      });
  },
});

export const {
  addRecap,
  removeRecap,
  mergeRecapFiles,
  clearRecap,
  clearRecapView,
  addToRecapBasket,
  removeFromRecapBasket,
  clearRecapBasket,
  patchRecapCell,
} = recapSlice.actions;

export default recapSlice.reducer;
