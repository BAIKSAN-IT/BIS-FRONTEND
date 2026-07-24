import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import { HeaderInfo } from "../../constants/common/common";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getCuttingStock = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/cutting/stock/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/cutting/stock/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getCuttingActualStyle = createAsyncThunk<
  AxiosResponse,
  HeaderInfo
>("factory/cutting/actual/style", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/factory/cutting/actual/style", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getCuttingActualColor = createAsyncThunk<
  AxiosResponse,
  HeaderInfo
>("factory/cutting/actual/color", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/factory/cutting/actual/color", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const factoryCuttingSlice = createSlice({
  name: "factoryCutting",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCuttingStock.pending, (state) => {})
      .addCase(getCuttingStock.fulfilled, (state, action) => {})
      .addCase(getCuttingStock.rejected, (state, action) => {})
      .addCase(getCuttingActualStyle.pending, (state) => {})
      .addCase(getCuttingActualStyle.fulfilled, (state, action) => {})
      .addCase(getCuttingActualStyle.rejected, (state, action) => {})
      .addCase(getCuttingActualColor.pending, (state) => {})
      .addCase(getCuttingActualColor.fulfilled, (state, action) => {})
      .addCase(getCuttingActualColor.rejected, (state, action) => {});
  },
});

export const { reset } = factoryCuttingSlice.actions;

export default factoryCuttingSlice.reducer;
