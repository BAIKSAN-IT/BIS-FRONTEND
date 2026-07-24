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

export const getNeedleActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/needle/actual/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/needle/actual/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const factoryNeedleSlice = createSlice({
  name: "factoryNeedle",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNeedleActual.pending, (state) => {})
      .addCase(getNeedleActual.fulfilled, (state, action) => {})
      .addCase(getNeedleActual.rejected, (state, action) => {});
  },
});

export const { reset } = factoryNeedleSlice.actions;

export default factoryNeedleSlice.reducer;
