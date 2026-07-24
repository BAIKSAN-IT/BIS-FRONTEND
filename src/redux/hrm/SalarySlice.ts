import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

/* 사번 급여정보 가져오기 Req */
interface GetSalaryReq {
  cdCompany: string; //회사코드
  noEmp: string; // 사원번호
  numRegist: string; // 주민등록번호뒷자리
  password: string; // 사용자패스워드
  yymm: string; // 기준년월
  loginPassword:string; //login password 
}

/* 사용자 리스트 조회 Res */
interface GetSalaryRes {
  cdCompany: string; // 호사코드
  dtsYm: string; // 기준년월
  noEmp: string; // 사번
  nmEmp: string; // 성명
  dtsBirth: string; //생년월일
  dtsStart: string; // 연봉시작일
  dtsEnd: string; // 연봉종료일
  cdDept: string; // 부서코드
  nmDept: string; // 부서명
  cdSw: string; // 국내해외구분 0:국내 1:해외
  amtBasicYear: string; //기본연봉
  amtOverYear: string; //연장연봉
  amtFoodYear: string; //식대교통비
  amtLocalYear: string; //현지연봉 $
  amtPayYear: string; //1년순수연봉 (기본연봉 + 연장연봉)
  amtBasic: string; //기본월급여
  amtOver: string; //기본월연장
  amtFood: string; //기본월식대교통비
  amtLocal: string; //기본월현지 $
  amtPay: string; //월순수급여 (기본 + 연장)
  cdApproval: string; //승인구분 00:승인 99:거부
  dtsApproval: string; //승인일자
  nmApproval: string; //승인자명
  signUrl: string; //사인URL
  remark: string; // REMARK
}

/* 사번 급여정보 갱신 */
interface SaveSalaryReq {
  cdCompany: string; //회사정보
  yymm: string; // 기준년월
  noEmp: string; // 사원번호
}

/* 년봉승인 업데이트 API */
export const saveSalaryAmt = createAsyncThunk<AxiosResponse, SaveSalaryReq>(
  "system/user/saveSalaryAmt",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/saveSalaryAmt", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 사용자 급여정보 가져오기 API */
export const getSalaryAmt = createAsyncThunk<AxiosResponse, GetSalaryReq>(
  "system/user/salaryAmt",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/salaryAmt", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export type { GetSalaryReq, GetSalaryRes, SaveSalaryReq };
