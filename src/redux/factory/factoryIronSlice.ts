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

export const getIronActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/iron/actual",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/iron/actual", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const factoryIronSlice = createSlice({
  name: "factoryIronSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getIronActual.pending, (state) => {})
      .addCase(getIronActual.fulfilled, (state, action) => {})
      .addCase(getIronActual.rejected, (state, action) => {});
  },
});

export const { reset } = factoryIronSlice.actions;

export default factoryIronSlice.reducer;
