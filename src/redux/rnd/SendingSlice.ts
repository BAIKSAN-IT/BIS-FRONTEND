// redux/rnd/SendingSlice.ts
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import {api} from "@helpers/api/apiCore";

/* ================================
   Types
================================ */
export interface SaveRndArticleSendReq {
  cdCompany: string; // 회사코드
  dtsDate: string; // 기준일자 YYYYMMDD
  dtsSeq: string; // 일자내 순번
  qrcode: string; // QR 코드
  seqArticle: string; // ARTICLE 일련번호
  cdSending: string; // 발송 구분 코드
  recipient: string; // 수신자
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  dtsYear?: string;
  cdWorker: string;
  topic?: string;
  remark?: string;
  remarkDetail?: string;
  ynHanger?: string;
  ynSwatch?: string;
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

export interface RndArticleSendRes {
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
  dtPrice?: string;
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

  // RD_ARTICLE_SEND
  dtsDate?: string;
  dtsSeq?: string;
  qrcode?: string;
  seqArticle?: string;
  cdSending?: string;
  nmSending?: string;
  recipient?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  nmSeason?: string;
  dtsYear?: string;
  cdWorker?: string;
  topic?: string;
  remark?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
  remarkDetail?: string;
  ynHanger?: string;
  ynSwatch?: string;
}

export interface RndArticleSendListViewRes {
  cdCompany?: string;
  dtsDate?: string; // YYYYMMDD
  dtsSeq?: string;
  cdSending?: string;
  nmSending?: string;
  recipient?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  nmSeason?: string;
  dtsYear?: string;
  cdWorker?: string;
  userNm?: string;
  topic?: string;
  remark?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
}

/** sendAllList 응답 */
export interface RndArticleSendAllRes {
  rndArticleSendList: RndArticleSendRes[];
  rndArticleFileList: RndArticleFileRes[];
}

export interface RndArticleSendReq {
  cdCompany?: string;
  seqArticle?: string;
  startDate?: string;
  endDate?: string;
  dtsSeq?: string;
  cdSending?: string;
  recipient?: string;
  cdWorker?: string;
  cdBuyer?: string;
  nmBuyer?: string;
  cdBrand?: string;
  nmBrand?: string;
  cdSeason?: string;
  topic?: string;
  remark?: string;
  seq?: number;
}

/* ================================
   State
================================ */
interface SendState {
  listView: RndArticleSendListViewRes[]; // ListView
  list: RndArticleSendRes[]; // 상세
  fileList: RndArticleFileRes[];
  sendBasket: RndArticleSendRes[]; // 더블클릭 바구니
  loading: boolean;
  error: string | null;
}

const initialState: SendState = {
  listView: [],
  list: [],
  fileList: [],
  sendBasket: [],
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

const normalizeRow = (
  row: RndArticleSendRes
): RndArticleSendRes & { remarkDetail?: string; ynHanger?: string; ynSwatch?: string } => {
  return {
    ...row,
    remarkDetail: row.remarkDetail ?? "",
    ynHanger: ynTo10(row.ynHanger) || "0",
    ynSwatch: ynTo10(row.ynSwatch) || "0",
  };
};

/* ================================
   Thunks
================================ */
export const saveRndArticleSend = createAsyncThunk<AxiosResponse, SaveRndArticleSendReq[]>(
  "sending/saveRndArticleSend",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("sending/saveRndArticleSend", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleSendAllList = createAsyncThunk<AxiosResponse, RndArticleSendReq>(
  "sending/sendAllList",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("sending/sendAllList", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleSendListView = createAsyncThunk<AxiosResponse, RndArticleSendReq>(
  "sending/sendListView",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const res = await api.create("sending/sendListView", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* ================================
   Slice
================================ */
const SendingSlice = createSlice({
  name: "sending",
  initialState,
  reducers: {
    addSend: (state, action: PayloadAction<RndArticleSendRes[]>) => {
      const normalized = action.payload.map(normalizeRow);
      state.list = mergeBy([...state.list, ...normalized], (v) => String(v.qrcode || ""));
    },
    removeSend: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.list = state.list.filter((r) => !removeSet.has(String(r.qrcode || "")));
    },
    mergeSendFiles: (state, action: PayloadAction<RndArticleFileRes[]>) => {
      const next = [...state.fileList, ...(action.payload || [])];
      state.fileList = mergeBy(next, (f) => `${f.seqArticle}|${f.seq}`);
    },
    clearSend: (state) => {
      state.list = [];
      state.fileList = [];
    },
    addToSendBasket: (state, action: PayloadAction<RndArticleSendRes[]>) => {
      const merged = mergeBy([...state.sendBasket, ...action.payload.map(normalizeRow)], (v) =>
        String((v as any).qrcode ?? v.seqNo ?? "")
      );
      state.sendBasket = merged;
    },
    removeFromSendBasket: (state, action: PayloadAction<string[]>) => {
      const removeSet = new Set(action.payload.map(String));
      state.sendBasket = state.sendBasket.filter((r) => !removeSet.has(String(r.qrcode ?? r.seqNo ?? "")));
    },
    clearSendBasket: (state) => {
      state.sendBasket = [];
    },
    clearSendView: (state) => {
      state.listView = [];
    },
    patchSendCell: (
      state,
      action: PayloadAction<{ seqArticle: string; field: keyof RndArticleSendRes; value: any }>
    ) => {
      const {seqArticle, field, value} = action.payload;
      const idx = state.list.findIndex((r) => String(r.seqArticle || "") === String(seqArticle));
      if (idx < 0) return;
      const editable = new Set<keyof RndArticleSendRes>(["remarkDetail", "topic", "ynHanger", "ynSwatch"]);
      if (!editable.has(field)) return;
      (state.list[idx] as any)[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRndArticleSendAllList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      /*.addCase(getRndArticleSendAllList.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as RndArticleSendAllRes;
        const normalized = (data?.rndArticleSendList ?? []).map(normalizeRow);
        state.list = mergeBy([...normalized], (v) => String(v.seqArticle || "")); // replace
        state.fileList = data?.rndArticleFileList?.length
          ? mergeBy([...data.rndArticleFileList], (f) => `${f.seqArticle}|${f.seq}`)
          : [];
      })*/
      .addCase(getRndArticleSendAllList.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data as RndArticleSendAllRes;

        const normalized = (data?.rndArticleSendList ?? []).map(normalizeRow);

        state.list = mergeBy([...state.list, ...normalized], (v) => String(v.qrcode || ""));

        if (data?.rndArticleFileList?.length) {
          const nextFiles = [...state.fileList, ...data.rndArticleFileList];
          state.fileList = mergeBy(nextFiles, (f) => `${f.seqArticle}|${f.seq}`);
        }
      })
      .addCase(getRndArticleSendAllList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "상세 조회 실패";
      })
      .addCase(getRndArticleSendListView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRndArticleSendListView.fulfilled, (state, action) => {
        state.loading = false;
        state.listView = action.payload.data as RndArticleSendListViewRes[];
      })
      .addCase(getRndArticleSendListView.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "ListView 조회 실패";
      })
      .addCase(saveRndArticleSend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRndArticleSend.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveRndArticleSend.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "저장 실패";
      });
  },
});

export const {
  addSend,
  removeSend,
  mergeSendFiles,
  clearSend,
  clearSendView,
  addToSendBasket,
  removeFromSendBasket,
  clearSendBasket,
  patchSendCell,
} = SendingSlice.actions;

export default SendingSlice.reducer;
