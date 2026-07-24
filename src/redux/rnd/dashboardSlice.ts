import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "../../helpers/api/apiCore";

const initialState = {
  list: [],
  fileList: [],
  loading: false,
  error: null,
};
export interface RndArticleDashboardReq {
  cdCompany?: string;
  startDate?: string;
  endDate?: string;
}

export interface RndArticleDashboardRes {
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
  // RD_ARTICLE_INVENTORY (A.*)
  qtyQr?: number;
  qtySend?: number;
  qtyReturn?: number;
  qtyJunk?: number;
  qtyStock?: number;
  remark?: string;
  idInsert?: string;
  dtInsert?: string;
  idUpdate?: string;
  dtUpdate?: string;
  seqNo?: number;
}

export const getRndArticleInventoryAllList = createAsyncThunk<AxiosResponse, RndArticleDashboardReq>(
  "inventory/inventoryAllList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("inventory/inventoryAllList", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
