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

const factoryFoldingSlice = createSlice({
  name: "factoryFoldingSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getFoldingActualLine.pending, (state) => {})
      .addCase(getFoldingActualLine.fulfilled, (state, action) => {})
      .addCase(getFoldingActualLine.rejected, (state, action) => {});
  },
});


export const getFoldingActualLine = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/folding/foldingline", 
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/folding/foldingline", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);


export const { reset } = factoryFoldingSlice.actions;

export default factoryFoldingSlice.reducer;
