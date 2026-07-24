import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "@helpers/api/apiCore";

export interface UserHistoryListReq {
  loginId?: string;
  userId?: string;
  userNm?: string;
  loginIp?: string;
  fromDt?: string;
  toDt?: string;
}

export interface UserHistoryListRes {
  seqNo: number;
  loginId: string;
  loginIp: string;
  loginDate: string;
  logoutDate: string;
  regId: string;
  regDate: string;
  modId: string;
  modDate: string;
  userId: string;
  userNm: string;
  userGubunCd: string;
  logoutTypeCd: string;
}

export const getUserHistoryList = createAsyncThunk<
  AxiosResponse<UserHistoryListRes[]>,
  UserHistoryListReq
>("user/history/getUserHistoryList", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    return await api.create("/user/history/list", arg);
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});
