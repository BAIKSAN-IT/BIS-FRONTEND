import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

export interface SixMonthBasePeriodReq {
  periodYear: string; // 년도(YYYY)
  dtBegin: string; // 기준일(YYYYMMDD)
}

export interface SixMonthBasePeriodRes {
  periodYear: string; // 년도(YYYY)
  periodWeek: string; // 주차
  dtBPeriod: string; // 기간 시작
  dtEPeriod: string; // 기간 끝
  dtBegin: string; // 사용 날짜
  dtEnd: string; // 끝 날짜
}

interface SixMonthOrderReq {
  cdCompany: string; // 회사 코드
  cdBizarea: string; // 부서 코드
  bSDate: string; // 조회 시작일
  bEDate: string; // 조회 종료일
  fgLang: string;
}

export interface SixMonthOrderListRes {
  /* grouping */
  group6: number | null;
  group1: number | null;
  group5: number | null;
  group2: number | null;
  group3: number | null;
  group4: number | null;

  /* 조직 */
  hDept: string | null;
  nmHDept: string | null;
  gNoDept: string | null;
  noDept: string | null;
  noDisp: number | null;
  nmBuyerDisp: string | null;

  /* KR / SGP */
  sgpOrder: "KR" | "SGP" | null;

  /* 목표 */
  targetQty: number;
  targetAmount: number;

  /* 실적 */
  qtShip: number;
  amShip: number;
  qtOrd0: number;
  amOrd0: number;
  qtShip0: number;
  amShip0: number;

  /* 누계 */
  qtShipQtOrd: number;
  amShipAmOrd: number;

  /* 연간 목표 */
  amPnT: number;
  gPlan: string | null;

  /* 잔액 */
  amBal: number;
  amBal2: number;

  /* 월별 수주 */
  qtOrd1: number;
  qtOrd2: number;
  qtOrd3: number;
  qtOrd4: number;
  qtOrd5: number;
  qtOrd6: number;
  qtOrd1To6: number;
  qtOrd7: number;

  amOrd1: number;
  amOrd2: number;
  amOrd3: number;
  amOrd4: number;
  amOrd5: number;
  amOrd6: number;
  amOrd1To6: number;
  amOrd7: number;

  /* 정렬 */
  idx: number;     // 1: KR, 2: SGP, 3: TOTAL
  noSort: number;

  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
}
export const getSixMonthOrderStatusList = createAsyncThunk<AxiosResponse, SixMonthOrderReq>(
  "month/order/status/six/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/month/order/status/six/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
export const getSixMonthBasePeriodInfo = createAsyncThunk<AxiosResponse, SixMonthBasePeriodReq>(
  "month/order/status/six/period",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/month/order/status/six/period", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
