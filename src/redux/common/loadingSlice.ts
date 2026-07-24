import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  pendingCount: number;
  error: string | null;
}

const initialState: LoadingState = {
  pendingCount: 0,
  error: null,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.pendingCount += 1;
      state.error = null;
    },
    stopLoading: (state) => {
      state.pendingCount = Math.max(0, state.pendingCount - 1);
    },
    resetLoading: (state) => {
      state.pendingCount = 0;
      state.error = null;
    },
  },
});

export const { startLoading, stopLoading, resetLoading } =
  loadingSlice.actions;

export default loadingSlice.reducer;
