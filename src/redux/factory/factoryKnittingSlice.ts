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

export const getKnittingStatus = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/knitting/status/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/knitting/status/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);


export const getKnittingMachine = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/knitting/status/machine",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/knitting/status/machine", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
const factoryKnittingSlice = createSlice({
  name: "factoryKnitting",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKnittingStatus.pending, (state) => {})
      .addCase(getKnittingStatus.fulfilled, (state, action) => {})
      .addCase(getKnittingStatus.rejected, (state, action) => {});
  },
});

export const { reset } = factoryKnittingSlice.actions;

export default factoryKnittingSlice.reducer;
