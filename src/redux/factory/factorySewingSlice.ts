import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import {
  FactorySewingHeaderInfo,
  HeaderInfo,
} from "../../constants/common/common";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

export interface SewingHpsPopUpReq {
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  dtsWk: string;
  bep: number;   // BigDecimal → number
  rat: number;
  gubun: string; // 'H' | 'D' 로 써도 됨
}
export interface SewingHpsPopUpRes {
  dtsWk: string;
  cdFty: string;
  sewLn: string;
  sewNm: string;
  nmBuyer: string;
  nmBrand: string;
  seqStyle: number | null;
  qtOrd: number;
  totalQtSew: number;
  noStyle: string;
  nmItem: string;
  smv: number;
  mpw4: number;
  wHour: number;
  tmWk: number;
  upcCm: number;
  tgtDay: number;
  tgtHour: number;
  inputDate: string;
  inputDays: number;
  qtSew1: number;
  qtSew2: number;
  qtSew3: number;
  qtSew4: number;
  qtSew5: number;
  qtSew6: number;
  qtSew7: number;
  qtSew8: number;
  qtSew9: number;
  qtSew10: number;
  qtSew11: number;
  tgtProd: number;
  actProd: number;
  achProd: number;
  tgtEff: number;
  actEff: number;
  achEff: number;
  bepAmt: number;
  earnAmt: number;
  optEff: number;
  vatEff: number;
  cntLine: number;
  cdRmk: string;
  closure: string;
  cdStatus: string;
  cdFinalSp: string;
  rtEff: number;
}

export interface SewingHpsPopUpMaxRes {
  bep: number;
  rat: number;
  hour: number;
}

export interface UpdateSewingHpsPopUpSewRmkReq {
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  sewLn: number;
  dtsWk: string;
  seqStyle: number;
  cdRmk: string;
  id: string;
}
export const getSewingActual = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/sewing/actual",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/actual", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingActualDefect = createAsyncThunk<
  AxiosResponse,
  HeaderInfo
>("factory/sewing/actual/defect", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/factory/sewing/actual/defect", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getSewingInput = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/sewing/input",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/input", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingInputLine = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/sewing/inputline",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/inputline", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
export const getHpsPopUpList = createAsyncThunk<AxiosResponse, SewingHpsPopUpReq>(
  "factory/sewing/getHpsPopUpList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/getHpsPopUpList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getHpsPopUpMax = createAsyncThunk<AxiosResponse, SewingHpsPopUpReq>(
  "factory/sewing/getHpsPopUpMax",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/getHpsPopUpMax", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const updateHpsPopUpSewRmk = createAsyncThunk<AxiosResponse, UpdateSewingHpsPopUpSewRmkReq>(
  "factory/sewing/updateHpsPopUpSewRmk",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/updateHpsPopUpSewRmk", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const factorySewingSlice = createSlice({
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
      .addCase(getSewingActualDefect.pending, (state) => {})
      .addCase(getSewingActualDefect.fulfilled, (state, action) => {})
      .addCase(getSewingActualDefect.rejected, (state, action) => {})
      .addCase(getSewingInput.pending, (state) => {})
      .addCase(getSewingInput.fulfilled, (state, action) => {})
      .addCase(getSewingInput.rejected, (state, action) => {})
      .addCase(getSewingInputLine.pending, (state) => {})
      .addCase(getSewingInputLine.fulfilled, (state, action) => {})
      .addCase(getSewingInputLine.rejected, (state, action) => {});
  },
});

export const { reset } = factorySewingSlice.actions;

export default factorySewingSlice.reducer;
