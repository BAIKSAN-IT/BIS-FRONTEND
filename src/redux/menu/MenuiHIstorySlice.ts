import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

/* ================================
 * 요청 DTO
 * ================================ */
export interface MenuHistoryReq {

  /* ===== 회사 / 사용자 ===== */
  cdCompany: string;     // 회사코드
  noEmp: string;         // 사번
  userNm?: string;       // 사용자명

  /* ===== 메뉴 정보 ===== */
  menuCd: string;        // 메뉴코드
  menuNm: string;        // 메뉴명
  menuUrl: string;       // URL

  /* ===== 등록자 ===== */
  idInsert: string;      // 등록자
}


/* ================================
 * 응답 DTO
 * ================================ */
export interface MenuHistoryRes {

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


/* ================================
 * 메뉴 접근 이력 저장
 * ================================ */
export const saveMenuHistory = createAsyncThunk<
  AxiosResponse,
  MenuHistoryReq
>(  "menu/history/saveMenuHistory",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("/menu/history/saveMenuHistory",arg);

      return res;

    } catch (err) {

      return rejectWithValue(
        (err as AxiosError).response?.data
      );
    }
  }
);


/* ================================
 * 메뉴 접근 이력 조회
 * ================================ */
export interface MenuHistoryListReq {

  cdCompany: string;
  noEmp?: string;

  fromDt?: string;   // YYYYMMDD
  toDt?: string;     // YYYYMMDD

  menuCd?: string;
}


export const getMenuHistoryList = createAsyncThunk<
  AxiosResponse<MenuHistoryRes[]>,
  MenuHistoryListReq
>(
  "menu/history/list",

  async (arg, thunkAPI) => {

    const { rejectWithValue } = thunkAPI;

    try {

      const res = await api.create(
        "/api/menu/history/list",
        arg
      );

      return res;

    } catch (err) {

      return rejectWithValue(
        (err as AxiosError).response?.data
      );
    }
  }
);
