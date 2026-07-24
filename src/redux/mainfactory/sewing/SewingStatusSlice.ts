import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

export interface SewingStatusReq {
  cdCompany?: string;        // 회사 코드
  cdBizarea?: string;        // 사업장 코드
  seqStyle: number;        // 스타일 SEQ (단일)
  dtsWk?: string;            // 기준일자 (YYYYMMDD)
  clrszSumYn?: string; // 집계 구분
  cdBizareaB?: string;      // 조회 사업장(B)
  seqStyleLst?: string;     // 스타일 리스트 (comma)
  dtsWkF: string;           // 시작일자 (YYYYMMDD)
  nmBuyer?: string;         // 바이어 코드
  cdFty?: string;           // 공장 코드
  planEx?: string;       // 계획 제외 여부
  noStyle?: string;       // 스타일 조회
}

/** ================================
 *  컨테이너: 멀티 ResultSet 응답
 *  ================================ */
export interface SewingStatusRes {
  nmBuyer: string;
  cdBrand: string;
  nmBrand: string;
  fileStyle: string;
  noStyle: string;
  nmStyle: string;
  noPo: string;
  noDo: string;
  noPoUql?: string;
  seqStyle: number;
  seqOrd: number;
  seqDo: string;
  dtsShip: string;
  dtsExfty: string;
  dtsExftyBf: string;
  clr?: string;
  sz?: string;
  seqClr?: number;
  seqSz?: number;

  /* ===== 수량 ===== */
  qtOrd: number;
  qtOrdSz: number;
  qtOrdT: number;
  cutDay: number;
  cutTtl: number;
  cutPer?: string;
  cutBal: number;
  inpDay: number;
  inpTtl: number;
  inpPer?: string;
  inpBal: number;
  sewDay: number;
  sewTtl: number;
  sewPer?: string;
  sewBal: number;
  finDay: number;
  finTtl: number;
  finPer?: string;
  finBal: number;
  pakDay: number;
  pakTtl: number;
  pakPer?: string;
  pakBal: number;
  expDay: number;
  expTtl: number;
  expPer?: string;
  expBal: number;

  /* ===== 운영 정보 ===== */
  cdCompany: string;
  cdBizarea: string;
  cdFty: string;
  cdFtyOp: string;
  cdTeam: string;
  idCharger: string;
  cdBuyer: string;
  dtsEd?: string;
  dtsSkuOp?: string;
  dtsPoOp?: string;
}
export const getSewingStatusList = createAsyncThunk<AxiosResponse, SewingStatusReq>(
  "main/sewing/status/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/main/sewing/status/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
