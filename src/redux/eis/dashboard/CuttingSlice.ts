import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import { HeaderInfo } from "../../../constants/common/common";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export const getCuttingActual = createAsyncThunk<
  AxiosResponse,
  HeaderInfo
>("/factory/cutting/dashboard-5", async (arg, thunkAPI) => {

  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/factory/cutting/dashboard-5", arg);

    return res;
  } catch (err) {

    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const CuttingSlice = createSlice({
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
      .addCase(getCuttingActual.pending, (state) => {})
      .addCase(getCuttingActual.fulfilled, (state, action) => {})
      .addCase(getCuttingActual.rejected, (state, action) => {})
  },
});

export const { reset } = CuttingSlice.actions;

export default CuttingSlice.reducer;
