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

export const getQcActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/qc/actual",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qc/actual", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getQcActualChart = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/qc/actual/chart",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qc/actual/chart", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const factoryQcSlice = createSlice({
  name: "factoryQcSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQcActual.pending, (state) => {})
      .addCase(getQcActual.fulfilled, (state, action) => {})
      .addCase(getQcActual.rejected, (state, action) => {})
      .addCase(getQcActualChart.pending, (state) => {})
      .addCase(getQcActualChart.fulfilled, (state, action) => {})
      .addCase(getQcActualChart.rejected, (state, action) => {});
  },
});


export const getQcActualLine = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/qc/finishqcline", 
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qc/finishqcline", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);


export const { reset } = factoryQcSlice.actions;

export default factoryQcSlice.reducer;
