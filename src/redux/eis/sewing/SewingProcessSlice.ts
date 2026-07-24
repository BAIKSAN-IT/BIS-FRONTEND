import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

/* Sewing Process Req (PIS) */
interface SewingProcessListReq {
  cdCompany: string; // 회사 코드
  cdBizarea: string; // 부서 코드
  cdFty: string;
  nmBuyer: string; // 바이어명
  dtsFromWk: string; // 조회 시작일
  dtsToWk: string; // 조회 종료일
  style: string; // 스타일
}

/* Sewing Process Res (PIS) */
interface SewingProcessListRes {
  cdCompany: string; // 회사 코드 (예: "1000")
  cdBizarea: string; // 부서 코드 (예: "3000")
  cdFty: string; // 공장 코드 (예: "3100")
  cdBuyer: string; // 바이어 코드 (예: "")
  nmBuyer: string; // 바이어 명 (예: "")
  seqStyle: number; // 스타일 순번 (예: 1)
  noStyle: string; // 스타일 명 (예: 1)
  seqOrd: number; // 주문 순번 (예: 1)
  nmPo: string; // PO (예: "")
  qtOrd: number; // QT ORD (예: "")
  seqDo: number; // DO 순번 (예: 1)
  destinationOrder: string; // destinationOrder (예: 1)
  dtsExFty: string; // 공장납기일
  dtsShip: string; // 선적일
  seqClr: number; // 색상 순번 (예: 1)
  nmClr: string; // nm Clr (예: 1)
  seqSz: number; // 사이즈 순번 (예: 1)
  nmSz: string; // 사이즈 (예: "S")
  szOrd: number; // 사이즈 order (예: "50")
  qtLod: number; // 로딩 수량 (예: 100)
  qtTtlLod: number; // 로딩 수량 (예: 100)
  rateLod: number; // 로딩 수량 (예: 100)
  qtDft: number; // 불량 수량 (예: 5)
  qtTtlDft: number; // 총 불량 수량 (예: 10)
  rateDft: number; // rateDft (예: "")
  qtSew: number; // 봉제 수량 (예: 120)
  qtTtlSew: number; // 총 봉제 수량 (예: 120)
  rateSew: number; // rateSew (예: "")
  qtIron: number; // 봉제 수량 (예: 120)
  qtTtlIron: number; // 총 봉제 수량 (예: 120)
  rateIron: number; // rateIron (예: "")
  qtFinish: number; // 봉제 수량 (예: 120)
  qtTtlFinish: number; // 총 봉제 수량 (예: 120)
  rateFinish: number; // rateFinish (예: "")
  seq: number; // seq (예: 1,2,3,4)
}

export const getSewingProcessList = createAsyncThunk<AxiosResponse, SewingProcessListReq>(
  "sewing/process/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/sewing/process/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export type { SewingProcessListRes };
