import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

/* Corporation Profit & Loss req */
interface CorporationPlListReq {
  cdCompany: string; // 회사 코드
  cdBizarea: string; // 부서 코드
  dtsSyymm: string; // 조회 시작일
  dtsEyymm: string; // 조회 종료일
  cdCurrency: string; // 화폐
}

/* Corporation Profit & Loss Res */
export interface CorporationPlListRes {
  cdAcctGrp: string;
  tpGrpLv: string;
  cdHacctGrp: string;
  nmAcctGrp: string;
  total: number;
  ratTotal: number;
  amtHead: number;
  ratHead: number;
  amtTt: number;
  ratTt: number;
  amtVina: number;
  ratVina: number;
  amtBago: number;
  ratBago: number;
  seqNo: number;
  // ------------------ 1 ------------------
  total1: number;
  ratTotal1: number;
  amtHead1: number;
  ratHead1: number;
  amtTt1: number;
  ratTt1: number;
  amtVina1: number;
  ratVina1: number;
  amtBago1: number;
  ratBago1: number;

  // ------------------ 2 ------------------
  total2: number;
  ratTotal2: number;
  amtHead2: number;
  ratHead2: number;
  amtTt2: number;
  ratTt2: number;
  amtVina2: number;
  ratVina2: number;
  amtBago2: number;
  ratBago2: number;

  // ------------------ 3 ------------------
  total3: number;
  ratTotal3: number;
  amtHead3: number;
  ratHead3: number;
  amtTt3: number;
  ratTt3: number;
  amtVina3: number;
  ratVina3: number;
  amtBago3: number;
  ratBago3: number;

  // ------------------ 4 ------------------
  total4: number;
  ratTotal4: number;
  amtHead4: number;
  ratHead4: number;
  amtTt4: number;
  ratTt4: number;
  amtVina4: number;
  ratVina4: number;
  amtBago4: number;
  ratBago4: number;

  // ------------------ 5 ------------------
  total5: number;
  ratTotal5: number;
  amtHead5: number;
  ratHead5: number;
  amtTt5: number;
  ratTt5: number;
  amtVina5: number;
  ratVina5: number;
  amtBago5: number;
  ratBago5: number;

  // ------------------ 6 ------------------
  total6: number;
  ratTotal6: number;
  amtHead6: number;
  ratHead6: number;
  amtTt6: number;
  ratTt6: number;
  amtVina6: number;
  ratVina6: number;
  amtBago6: number;
  ratBago6: number;

  // ------------------ 7 ------------------
  total7: number;
  ratTotal7: number;
  amtHead7: number;
  ratHead7: number;
  amtTt7: number;
  ratTt7: number;
  amtVina7: number;
  ratVina7: number;
  amtBago7: number;
  ratBago7: number;

  // ------------------ 8 ------------------
  total8: number;
  ratTotal8: number;
  amtHead8: number;
  ratHead8: number;
  amtTt8: number;
  ratTt8: number;
  amtVina8: number;
  ratVina8: number;
  amtBago8: number;
  ratBago8: number;

  // ------------------ 9 ------------------
  total9: number;
  ratTotal9: number;
  amtHead9: number;
  ratHead9: number;
  amtTt9: number;
  ratTt9: number;
  amtVina9: number;
  ratVina9: number;
  amtBago9: number;
  ratBago9: number;

  // ------------------ 10 ------------------
  total10: number;
  ratTotal10: number;
  amtHead10: number;
  ratHead10: number;
  amtTt10: number;
  ratTt10: number;
  amtVina10: number;
  ratVina10: number;
  amtBago10: number;
  ratBago10: number;

  // ------------------ 11 ------------------
  total11: number;
  ratTotal11: number;
  amtHead11: number;
  ratHead11: number;
  amtTt11: number;
  ratTt11: number;
  amtVina11: number;
  ratVina11: number;
  amtBago11: number;
  ratBago11: number;

  // ------------------ 12 ------------------
  total12: number;
  ratTotal12: number;
  amtHead12: number;
  ratHead12: number;
  amtTt12: number;
  ratTt12: number;
  amtVina12: number;
  ratVina12: number;
  amtBago12: number;
  ratBago12: number;
}

export const getCorporationPlList = createAsyncThunk<AxiosResponse, CorporationPlListReq>(
  "corporation/pl/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/corporation/pl/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
