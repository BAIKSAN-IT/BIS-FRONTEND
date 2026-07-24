import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "@helpers/api/apiCore";

export interface MenuHistoryListReq {
  cdCompany: string;
  noEmp?: string;
  userNm?: string;
  menuCd?: string;
  menuNm?: string;
  fromDt?: string;
  toDt?: string;
}

export interface MenuHistoryListRes {
  cdCompany: string;
  dtAccess: string;
  seqAccess: number;
  noEmp: string;
  userNm: string;
  menuCd: string;
  menuNm: string;
  menuUrl: string;
  accessTm: string;
  accessIp: string;
  sessionId: string;
  idInsert: string;
  dtInsert: string;
}

export const getMenuHistoryList = createAsyncThunk<
  AxiosResponse<MenuHistoryListRes[]>,
  MenuHistoryListReq
>("menu/history/getMenuHistoryList", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    return await api.create("/menu/history/list", arg);
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});
