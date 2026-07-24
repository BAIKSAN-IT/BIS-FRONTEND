import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import { HeaderInfo } from "../../constants/common/common";
import { FoldingHeaderInfo, RfidParam } from "../../constants/tablet/folding/foldingActual";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getFoldingQr = createAsyncThunk<AxiosResponse, FoldingHeaderInfo>("folding/qr", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/folding/qr", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getFoldingRfid = createAsyncThunk<AxiosResponse, FoldingHeaderInfo>(
  "folding/rfid",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/folding/rfid", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const saveFoldingRfid = createAsyncThunk<AxiosResponse, RfidParam>(
  "folding/save/rfid",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/folding/save/rfid", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteFoldingRfid = createAsyncThunk<AxiosResponse, RfidParam>(
  "folding/delete/rfid",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/folding/delete/rfid", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const tabletFoldingSlice = createSlice({
  name: "tabletFoldingSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFoldingQr.pending, (state) => {})
      .addCase(getFoldingQr.fulfilled, (state, action) => {})
      .addCase(getFoldingQr.rejected, (state, action) => {})
      .addCase(getFoldingRfid.pending, (state) => {})
      .addCase(getFoldingRfid.fulfilled, (state, action) => {})
      .addCase(getFoldingRfid.rejected, (state, action) => {})
      .addCase(saveFoldingRfid.pending, (state) => {})
      .addCase(saveFoldingRfid.fulfilled, (state, action) => {})
      .addCase(saveFoldingRfid.rejected, (state, action) => {});
  },
});

export const { reset } = tabletFoldingSlice.actions;

export default tabletFoldingSlice.reducer;
