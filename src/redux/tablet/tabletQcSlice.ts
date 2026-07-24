import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import {
  QrListParam,
  QrParam,
  QrSaveParam,
} from "../../constants/tablet/sewing/sewingActual";
import {
  BQrDetailParam,
  BQrSaveParam,
  QrItems,
} from "../../constants/tablet/sewing/sewingInput";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getQcActualQrInfo = createAsyncThunk<AxiosResponse, QrParam>(
  "qc/actual/qr/info",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/qc/actual/qr/info", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getQcActualQrList = createAsyncThunk<AxiosResponse, QrListParam>(
  "qc/actual/qr/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/qc/actual/qr/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getTodayQcActualQrList = createAsyncThunk<
  AxiosResponse,
  QrListParam
>("qc/actual/qr/performance/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/qc/actual/qr/performance/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const deleteQrListInfo = createAsyncThunk<AxiosResponse, QrSaveParam>(
  "qc/actual/qr/delete",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/qc/actual/qr/delete", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const saveQrListInfo = createAsyncThunk<AxiosResponse, QrSaveParam>(
  "qc/actual/qr/save",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/qc/actual/qr/save", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const tabletQcSlice = createSlice({
  name: "tabletSewing",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQcActualQrInfo.pending, (state) => {})
      .addCase(getQcActualQrInfo.fulfilled, (state, action) => {})
      .addCase(getQcActualQrInfo.rejected, (state, action) => {})
      .addCase(getQcActualQrList.pending, (state) => {})
      .addCase(getQcActualQrList.fulfilled, (state, action) => {})
      .addCase(getQcActualQrList.rejected, (state, action) => {})
      .addCase(getTodayQcActualQrList.pending, (state) => {})
      .addCase(getTodayQcActualQrList.fulfilled, (state, action) => {})
      .addCase(getTodayQcActualQrList.rejected, (state, action) => {})
      .addCase(deleteQrListInfo.pending, (state) => {})
      .addCase(deleteQrListInfo.fulfilled, (state, action) => {})
      .addCase(deleteQrListInfo.rejected, (state, action) => {})
      .addCase(saveQrListInfo.pending, (state) => {})
      .addCase(saveQrListInfo.fulfilled, (state, action) => {})
      .addCase(saveQrListInfo.rejected, (state, action) => {});
  },
});

export const { reset } = tabletQcSlice.actions;

export default tabletQcSlice.reducer;
