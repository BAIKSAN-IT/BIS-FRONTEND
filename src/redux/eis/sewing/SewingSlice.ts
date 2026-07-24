import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import {
  FactorySewingHeaderInfo,
  HeaderInfo,
} from "../../../constants/common/common";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getSewingActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/sewing/sewingstatus",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/sewingstatus", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const SewingSlice = createSlice({
  name: "factorySewing",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSewingActual.pending, (state) => {})
      .addCase(getSewingActual.fulfilled, (state, action) => {})
      .addCase(getSewingActual.rejected, (state, action) => {})

  },
});

export const { reset } = SewingSlice.actions;

export default SewingSlice.reducer;
