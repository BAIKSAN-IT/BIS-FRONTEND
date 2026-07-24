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

export const getSewingActualQrInfo = createAsyncThunk<AxiosResponse, QrParam>(
  "sewing/actual/qr/info",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/actual/qr/info", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingActualQrList = createAsyncThunk<
  AxiosResponse,
  QrListParam
>("sewing/actual/qr/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/sewing/actual/qr/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getTodaySewingActualQrList = createAsyncThunk<
  AxiosResponse,
  QrListParam
>("sewing/actual/qr/performance/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/sewing/actual/qr/performance/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const deleteQrListInfo = createAsyncThunk<AxiosResponse, QrSaveParam>(
  "sewing/actual/qr/delete",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/actual/qr/delete", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const saveQrListInfo = createAsyncThunk<AxiosResponse, QrSaveParam>(
  "sewing/actual/qr/save",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/actual/qr/save", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingInputQrInfo = createAsyncThunk<AxiosResponse, QrParam>(
  "sewing/input/qr/info",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/input/qr/info", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingInputQrDetail = createAsyncThunk<
  AxiosResponse,
  BQrDetailParam
>("sewing/input/qr/detail", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/sewing/input/qr/detail", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const deleteBQrListInfo = createAsyncThunk<AxiosResponse, BQrSaveParam>(
  "sewing/input/qr/delete",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/input/qr/delete", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const saveBQrListInfo = createAsyncThunk<AxiosResponse, BQrSaveParam>(
  "sewing/input/qr/save",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/input/qr/save", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const tabletSewingSlice = createSlice({
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
      .addCase(getSewingActualQrInfo.pending, (state) => {})
      .addCase(getSewingActualQrInfo.fulfilled, (state, action) => {})
      .addCase(getSewingActualQrInfo.rejected, (state, action) => {})
      .addCase(getSewingActualQrList.pending, (state) => {})
      .addCase(getSewingActualQrList.fulfilled, (state, action) => {})
      .addCase(getSewingActualQrList.rejected, (state, action) => {})
      .addCase(getTodaySewingActualQrList.pending, (state) => {})
      .addCase(getTodaySewingActualQrList.fulfilled, (state, action) => {})
      .addCase(getTodaySewingActualQrList.rejected, (state, action) => {})
      .addCase(deleteQrListInfo.pending, (state) => {})
      .addCase(deleteQrListInfo.fulfilled, (state, action) => {})
      .addCase(deleteQrListInfo.rejected, (state, action) => {})
      .addCase(saveQrListInfo.pending, (state) => {})
      .addCase(saveQrListInfo.fulfilled, (state, action) => {})
      .addCase(saveQrListInfo.rejected, (state, action) => {})
      .addCase(getSewingInputQrInfo.pending, (state) => {})
      .addCase(getSewingInputQrInfo.fulfilled, (state, action) => {})
      .addCase(getSewingInputQrInfo.rejected, (state, action) => {})
      .addCase(deleteBQrListInfo.pending, (state) => {})
      .addCase(deleteBQrListInfo.fulfilled, (state, action) => {})
      .addCase(deleteBQrListInfo.rejected, (state, action) => {})
      .addCase(saveBQrListInfo.pending, (state) => {})
      .addCase(saveBQrListInfo.fulfilled, (state, action) => {})
      .addCase(saveBQrListInfo.rejected, (state, action) => {});
  },
});

export const { reset } = tabletSewingSlice.actions;

export default tabletSewingSlice.reducer;
