// assetSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface AssetData {
  area: string;
  ast_CODE: string;
  ast_MCODE: string;
  nm_EMP: string;
  nm_DEPT: string;
  use_DATE: string;
  status: string;
  model: string;
  serialno: string;
  buy_COMPNM: string;
  buy_DATE: string;
  pr_YYMM: string;
  start_RDATE: string;
  end_RDATE: string;
  os: string;
  cpu: string;
  hdd: string;
  ram: string;
  ip1: string;
  ip2: string;
  ip3: string;
  ip4: string;
  bigo: string;
  detail: string;
}

interface AssetChangeHistoryData {
  ast_SEQ: string;
  nm_EMP: string;
  area: number;
  nm_DEPT: string;
  use_DATE: string;
  start_RDATE: string;
  end_RDATE: string;
  status: string;
  pr_REMARK: string;
  seq_BIGO: string;
}

interface AssetParam {
  astCode: string;
}

interface State {
  asset?: AssetData | null;
  assetChangeHistory?: AssetChangeHistoryData[];
  loading: boolean;
  error: string | null;
}

interface ErrorData {
  errorCode: string;
  errorMessage: string;
}

const initialState: State = {
  asset: null,
  assetChangeHistory: [],
  loading: false,
  error: null,
};

export const getAssetInfo = createAsyncThunk<AxiosResponse, AssetParam>(
  "asset/getAssetInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/asset/", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getAssetChangeHistory = createAsyncThunk<
  AxiosResponse,
  AssetParam
>("asset/getAssetChangeHistory", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/asset/history", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssetInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAssetInfo.fulfilled,
        (state, action: PayloadAction<AxiosResponse>) => {
          if (action.payload.status === 200) {
            state.asset = action.payload.data;
            state.loading = false;
            state.error = null;
          }
        }
      )
      .addCase(getAssetInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      })
      .addCase(getAssetChangeHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAssetChangeHistory.fulfilled,
        (state, action: PayloadAction<AxiosResponse>) => {
          if (action.payload.status === 200) {
            state.assetChangeHistory = action.payload.data;
            state.loading = false;
            state.error = null;
          }
        }
      )
      .addCase(getAssetChangeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      });
  },
});

export const { reset } = assetSlice.actions;

export default assetSlice.reducer;
