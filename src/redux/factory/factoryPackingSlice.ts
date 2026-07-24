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

export const getPackingActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/packing/actual/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/packing/actual/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const factoryPackingSlice = createSlice({
  name: "factoryPacking",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPackingActual.pending, (state) => {})
      .addCase(getPackingActual.fulfilled, (state, action) => {})
      .addCase(getPackingActual.rejected, (state, action) => {});
  },
});

export const { reset } = factoryPackingSlice.actions;

export default factoryPackingSlice.reducer;
