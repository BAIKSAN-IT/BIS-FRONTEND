// redux/rnd/ReturnSlice.ts
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import {api} from "@helpers/api/apiCore";

/* ================================
   Types
================================ */
export interface SaveRndArticleReturnReq {
  cdCompany: string; // 회사코드
  dtsDate: string; // 기준일자 YYYYMMDD
  dtsSeq: string; // 일자내 순번
  qrcode: string; // QR 코드
  seqArticle: string; // ARTICLE 일련번호
  cdStatus: string; // 발송 구분 코드
  cdWorker: string;
  remark?: string;
  remarkDetail?: string;
  idInsert?: string;
  ynFlag?: string;
}

export interface RndArticleFileRes {
  cdCompany: string;
  seqArticle: string;
  seq: number;
  imgFileNameOrg: string;
  imgFileName: string;
  ynFlag: string | null;
}

export interface RndArticleReturnRes {
  // RD_ARTICLE
  cdCompany?: string;
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
  dtPrice?: string /* PRICE DATE */
  ;
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

  // RD_ARTICLE_RETURN
  dtsDate?: string;
  dtsSeq?: string;
  qrcode?: string;
  seqArticle?: string;
  cdStatus?: string;
  nmStatus?: string;
  cdWorker?: string;
  remark?: string;
  remarkDetail?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
}

export interface RndArticleReturnListViewRes {
  cdCompany?: string;
  dtsDate?: string; // YYYYMMDD
  dtsSeq?: string;
  cdWorker?: string;
  userNm?: string;
  remark?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
}

/** ReturnAllList 응답 */
export interface RndArticleReturnAllRes {
  rndArticleReturnList: RndArticleReturnRes[];
  rndArticleFileList: RndArticleFileRes[];
}

export interface RndArticleReturnReq {
  cdCompany?: string;
  seqArticle?: string;
  startDate?: string;
  endDate?: string;
  dtsSeq?: string;
  cdStatus?: string;
  cdWorker?: string;
  remark?: string;
  remarkDetail?: string;
  seq?: number;
}

/* ================================
   State
================================ */
interface ReturnState {
  listView: RndArticleReturnListViewRes[]; // ListView
  list: RndArticleReturnRes[]; // 상세
  fileList: RndArticleFileRes[];
  returnBasket: RndArticleReturnRes[]; // 더블클릭 바구니
  loading: boolean;
  error: string | null;
}

const initialState: ReturnState = {
  listView: [],
  list: [],
  fileList: [],
  returnBasket: [],
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
const ynTo10 = (v?: string) => (v === "1" || v === "Y" ? "1" : v === "0" || v === "N" ? "0" : "");

const normalizeRow = (row: RndArticleReturnRes): RndArticleReturnRes & { remarkDetail?: string } => {
  return {
    ...row,
    remarkDetail: row.remarkDetail ?? "",
  };
};

/* ================================
   Thunks
================================ */
export const saveRndArticleReturn = createAsyncThunk<AxiosResponse, SaveRndArticleReturnReq[]>(
  "return/saveRndArticleReturn",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("return/saveRndArticleReturn", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleReturnAllList = createAsyncThunk<AxiosResponse, RndArticleReturnReq>(
  "return/returnAllList",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("return/returnAllList", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleReturnListView = createAsyncThunk<AxiosResponse, RndArticleReturnReq>(
  "return/returnListView",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("return/returnListView", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* ================================
   Slice
================================ */
const ReturnSlice = createSlice({
  name: "Return",
  initialState,
  reducers: {
    addReturn: (state, action: PayloadAction<RndArticleReturnRes[]>) => {
      const normalized = action.payload.map(normalizeRow);
      state.list = mergeBy([...state.list, ...normalized], (v) => String(v.seqArticle || ""));
    },
    removeReturn: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.list = state.list.filter((r) => !removeSet.has(String(r.seqArticle || "")));
    },
    mergeReturnFiles: (state, action: PayloadAction<RndArticleFileRes[]>) => {
      const next = [...state.fileList, ...(action.payload || [])];
      state.fileList = mergeBy(next, (f) => `${f.seqArticle}|${f.seq}`);
    },
    clearReturn: (state) => {
      state.list = [];
      state.fileList = [];
    },
    addToReturnBasket: (state, action: PayloadAction<RndArticleReturnRes[]>) => {
      const merged = mergeBy([...state.returnBasket, ...action.payload.map(normalizeRow)], (v) =>
        String((v as any).seqArticle ?? v.seqNo ?? "")
      );
      state.returnBasket = merged;
    },
    removeFromReturnBasket: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.returnBasket = state.returnBasket.filter((r) => !removeSet.has(String(r.seqArticle ?? r.seqNo ?? "")));
    },
    clearReturnBasket: (state) => {
      state.returnBasket = [];
    },
    clearReturnView: (state) => {
      state.listView = [];
    },
    patchReturnCell: (
      state,
      action: PayloadAction<{ seqArticle: string; field: keyof RndArticleReturnRes; value: any }>
    ) => {
      const {seqArticle, field, value} = action.payload;
      const idx = state.list.findIndex((r) => String(r.seqArticle || "") === String(seqArticle));
      if (idx < 0) return;
      const editable = new Set<keyof RndArticleReturnRes>(["remarkDetail"]);
      if (!editable.has(field)) return;
      (state.list[idx] as any)[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRndArticleReturnAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleReturnAllList.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as RndArticleReturnAllRes;

        const normalized = (data?.rndArticleReturnList ?? []).map(normalizeRow);

        state.list = mergeBy([...state.list, ...normalized], (v) => String(v.seqArticle || ""));

        if (data?.rndArticleFileList?.length) {
          const nextFiles = [...state.fileList, ...data.rndArticleFileList];
          state.fileList = mergeBy(nextFiles, (f) => `${f.seqArticle}|${f.seq}`);
        }
      })
      .addCase(getRndArticleReturnAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "상세 조회 실패";
      })
      .addCase(getRndArticleReturnListView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleReturnListView.fulfilled, (state, action) => {
        state.loading = false;
        state.listView = action.payload.data as RndArticleReturnListViewRes[];
      })
      .addCase(getRndArticleReturnListView.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "ListView 조회 실패";
      })
      .addCase(saveRndArticleReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRndArticleReturn.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveRndArticleReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "저장 실패";
      });
  },
});

export const {
  addReturn,
  removeReturn,
  mergeReturnFiles,
  clearReturn,
  clearReturnView,
  addToReturnBasket,
  removeFromReturnBasket,
  clearReturnBasket,
  patchReturnCell,
} = ReturnSlice.actions;

export default ReturnSlice.reducer;
