import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

export interface DailyReportListReq {
  cdCompany?: string; // 회사 코드
  yyyymmdd?: string; // 조회일자 (YYYYMMDD)
}

/** ================================
 *  컨테이너: 멀티 ResultSet 응답
 *  ================================ */
export interface DailyReportListRes {
  cdPart: string;
  noRow: string;
  amt11: number;
  amt12: number;
  amt13: number;
  amt21: number;
  amt22: number;
  amt23: number;
  amt31: number;
  amt32: number;
  amt33: number;
  amt41: number;
  amt42: number;
  amt43: number;
}
export const getDailyReportList = createAsyncThunk<AxiosResponse, DailyReportListReq>(
  "daily/report/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/daily/report/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
