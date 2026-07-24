import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

interface SmartCompanyListRes {
  Code: string; // 택배 회사 코드
  International: String; // 국제 택배 지원 여부
  Name: string; // 택배 회사 이름
}

interface SmartTrackingReq {
  companyCode: string; // 택배 회사 코드
  invoiceNumber: String; // 국제 택배 지원 여부
}

/* Sewing Process Req (PIS) */
interface SmartTrackingRes {
  Code: string; // 택배 회사 코드
  International: String; // 국제 택배 지원 여부
  Name: string; // 택배 회사 이름
}

export const getSmartCompanyList = createAsyncThunk<AxiosResponse>("tracking/company/list", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.get("/tracking/company/list", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getTrackingInfo = createAsyncThunk<AxiosResponse, SmartTrackingReq>(
  "tracking/info",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.get("/tracking/info", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export type { SmartCompanyListRes };
