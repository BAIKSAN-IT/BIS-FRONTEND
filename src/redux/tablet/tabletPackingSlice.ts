import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import {
  PackingDetailParam,
  PackingDetailReqInfo,
  PackingReqInfo,
} from "../../constants/tablet/packing/packingActual";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getPackingList = createAsyncThunk<AxiosResponse, PackingReqInfo>(
  "packing/actual/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/packing/actual/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getPackingDetailList = createAsyncThunk<
  AxiosResponse,
  PackingDetailReqInfo
>("packing/actual/detail/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/packing/actual/detail/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const savePackingDetail = createAsyncThunk<
  AxiosResponse,
  PackingDetailParam
>("packing/actual/save", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/packing/actual/save", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const deletePackingDetail = createAsyncThunk<
  AxiosResponse,
  PackingDetailParam
>("packing/actual/delete", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/packing/actual/delete", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const tabletPackingSlice = createSlice({
  name: "factoryIron",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPackingList.pending, (state) => {})
      .addCase(getPackingList.fulfilled, (state, action) => {})
      .addCase(getPackingList.rejected, (state, action) => {})
      .addCase(getPackingDetailList.pending, (state) => {})
      .addCase(getPackingDetailList.fulfilled, (state, action) => {})
      .addCase(getPackingDetailList.rejected, (state, action) => {})
      .addCase(savePackingDetail.pending, (state) => {})
      .addCase(savePackingDetail.fulfilled, (state, action) => {})
      .addCase(savePackingDetail.rejected, (state, action) => {});
  },
});

export const { reset } = tabletPackingSlice.actions;

export default tabletPackingSlice.reducer;
