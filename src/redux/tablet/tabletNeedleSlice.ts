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

export const getNeedleList = createAsyncThunk<AxiosResponse, PackingReqInfo>(
  "needle/actual/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/needle/actual/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getNeedleDetailList = createAsyncThunk<
  AxiosResponse,
  PackingDetailReqInfo
>("needle/actual/detail/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/needle/actual/detail/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const saveNeedleDetail = createAsyncThunk<
  AxiosResponse,
  PackingDetailParam
>("needle/actual/save", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/needle/actual/save", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const deleteNeedleDetail = createAsyncThunk<
  AxiosResponse,
  PackingDetailParam
>("needle/actual/delete", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/needle/actual/delete", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const tabletNeedleSlice = createSlice({
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
      .addCase(getNeedleList.pending, (state) => {})
      .addCase(getNeedleList.fulfilled, (state, action) => {})
      .addCase(getNeedleList.rejected, (state, action) => {})
      .addCase(getNeedleDetailList.pending, (state) => {})
      .addCase(getNeedleDetailList.fulfilled, (state, action) => {})
      .addCase(getNeedleDetailList.rejected, (state, action) => {})
      .addCase(saveNeedleDetail.pending, (state) => {})
      .addCase(saveNeedleDetail.fulfilled, (state, action) => {})
      .addCase(saveNeedleDetail.rejected, (state, action) => {});
  },
});

export const { reset } = tabletNeedleSlice.actions;

export default tabletNeedleSlice.reducer;
