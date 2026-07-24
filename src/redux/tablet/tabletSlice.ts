import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {api} from "@helpers/api/apiCore";
import {AxiosError, AxiosResponse} from "axios";
import {FactoryLineData, FactoryWorkerData} from "@constants/common/common";
import {isEmpty} from "@utils/CommonUtil";

interface BizareaData {
  code?: string;
  name?: string;
  existYn?: string;
}

interface FactoryData {
  code?: string;
  name?: string;
  existYn?: string;
}

interface FactoryTimeData {
  startTime?: string;
  endTime?: string;
}

interface UserEnvData {
  cdCompany?: string;
  cdBizarea?: string;
  nmBizarea?: string;
  cdFty?: string;
  nmFty?: string;
  dtsWk?: string;
  processGbn?: string;
  cdPart?: string;
  cdFtyAll?: string;
  firstLogin?: boolean;
}
interface InitUserEnvData extends UserEnvData {}

interface State {
  line?: FactoryLineData;
  worker?: FactoryWorkerData;
  workTime?: string;
  workTimeIdx?: number;
  autoSaveCnt?: number;
  isPass?: boolean;
  nmPass?: string;
  userEnvInfo: UserEnvData;
  initUserEnvInfo: InitUserEnvData;
  factoryList: FactoryData[];
  initFactoryList: FactoryData[];
  bizareaList: BizareaData[];
  initBizareaList: BizareaData[];
  factoryLineList: FactoryLineData[];
  factoryTotalWorkerList: FactoryWorkerData[];
  factoryWorkerList: FactoryWorkerData[];
  workerLineList: string[];
  factoryTimeList: FactoryTimeData[];
  loading: boolean;
  error?: string;
  hideTopbarPart?: boolean;
}

interface ErrorData {
  errorCode: string;
  errorMessage: string;
}

interface FactoryLineList {
  sewLn: string;
  sewNm: string;
}

export const getBizareaList = createAsyncThunk<AxiosResponse, UserEnvData>("bizarea/list", async (arg, thunkAPI) => {
  const {rejectWithValue} = thunkAPI;

  try {
    const res = await api.create("/company/bizarea/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getFactoryList = createAsyncThunk<AxiosResponse, UserEnvData>("factory/list", async (arg, thunkAPI) => {
  const {rejectWithValue} = thunkAPI;

  try {
    const res = await api.create("/company/factory/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getLineList = createAsyncThunk<AxiosResponse, UserEnvData>("factory/line", async (arg, thunkAPI) => {
  const {rejectWithValue} = thunkAPI;

  try {
    const res = await api.create("/company/factory/line", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getTimeList = createAsyncThunk<AxiosResponse, UserEnvData>("factory/time", async (arg, thunkAPI) => {
  const {rejectWithValue} = thunkAPI;

  try {
    const res = await api.create("/company/factory/time", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getWorkerList = createAsyncThunk<AxiosResponse, UserEnvData>("factory/worker", async (arg, thunkAPI) => {
  const {rejectWithValue} = thunkAPI;

  try {
    const res = await api.create("/company/factory/worker", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

// Initial state
const initialState: State = {
  line: {},
  worker: {},
  workTime: "",
  workTimeIdx: 0,
  autoSaveCnt: 0,
  isPass: true,
  nmPass: "PASS",
  userEnvInfo: {},
  initUserEnvInfo: {},
  bizareaList: [],
  initBizareaList: [],
  factoryList: [],
  initFactoryList: [],
  factoryLineList: [],
  factoryWorkerList: [],
  factoryTotalWorkerList: [],
  workerLineList: [],
  factoryTimeList: [],
  loading: false,
  hideTopbarPart: false,
};

const tabletSlice = createSlice({
  name: "tablet",
  initialState,
  reducers: {
    setLineInfo(state, action: PayloadAction<FactoryLineData>) {
      state.line = action.payload;
    },
    resetFactoryLineInfo(state) {
      state.line = {};
      state.factoryLineList = [];
    },
    resetFactoryWorkerInfo(state) {
      state.worker = {};
      state.workerLineList = [];
      state.factoryWorkerList = [];
      state.factoryTotalWorkerList = [];
    },
    setWorkerInfo(state, action: PayloadAction<FactoryWorkerData>) {
      state.worker = action.payload;
    },
    setWorkerList(state, action: PayloadAction<FactoryWorkerData[]>) {
      state.factoryWorkerList = action.payload;
    },
    setWorkTime(state, action: PayloadAction<string>) {
      state.workTime = action.payload;
    },
    setWorkTimeIdx(state, action: PayloadAction<number>) {
      state.workTimeIdx = action.payload;
    },
    setAutoSaveCnt(state, action: PayloadAction<number>) {
      state.autoSaveCnt = action.payload;
    },
    setIsPass(state, action: PayloadAction<boolean>) {
      state.isPass = action.payload;
    },
    setNmPass(state, action: PayloadAction<string>) {
      state.nmPass = action.payload;
    },

    setUserEnvInfo(state, action: PayloadAction<UserEnvData>) {
      state.userEnvInfo = action.payload;
    },
    setInitUserEnvInfo: (state, action: PayloadAction<InitUserEnvData>) => {
      state.initUserEnvInfo = action.payload;
    },
    setHideTopbarPart(state, action) {
      state.hideTopbarPart = action.payload;
    },
    resetInitEnvList(state) {
      state.initFactoryList = [];
      state.initUserEnvInfo = {};
      state.userEnvInfo = {};
      state.initBizareaList = [];
    },
    reset(state) {
      state.loading = false;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBizareaList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBizareaList.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          state.bizareaList = action.payload.data;

          if (isEmpty(state.initBizareaList)) {
            state.initBizareaList = action.payload.data;
          }

          state.loading = false;
        }
      })
      .addCase(getBizareaList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      })
      .addCase(getFactoryList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFactoryList.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          state.factoryList = action.payload.data;

          // 최초 1회만 저장
          if (isEmpty(state.initFactoryList)) {
            state.initFactoryList = action.payload.data;
          }

          state.loading = false;
        }
      })
      .addCase(getFactoryList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      })
      .addCase(getLineList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLineList.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          if (!isEmpty(action.payload.data)) {
            state.line = action.payload.data[0];
          }
          state.factoryLineList = action.payload.data;
          state.loading = false;
        }
      })
      .addCase(getLineList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      })
      .addCase(getTimeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTimeList.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          state.factoryTimeList = action.payload.data;
          state.loading = false;
        }
      })
      .addCase(getTimeList.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed";
      })
      .addCase(getWorkerList.pending, (state) => {
      })
      .addCase(getWorkerList.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          state.factoryWorkerList = action.payload.data;
          state.factoryTotalWorkerList = action.payload.data;
          state.worker = action.payload.data[0];
          state.loading = false;
        }
      })
      .addCase(getWorkerList.rejected, (state, action) => {
      });
  },
});

export const {
  setLineInfo,
  resetFactoryLineInfo,
  resetFactoryWorkerInfo,
  setWorkerInfo,
  setWorkerList,
  setWorkTime,
  setWorkTimeIdx,
  setAutoSaveCnt,
  setIsPass,
  setNmPass,
  setUserEnvInfo,
  setInitUserEnvInfo,
  reset,
  setHideTopbarPart,
  resetInitEnvList,
} = tabletSlice.actions;

export default tabletSlice.reducer;

export type {FactoryLineList};
