import {createAsyncThunk} from "@reduxjs/toolkit";
import {api} from "@helpers/api/apiCore";
import {AxiosError, AxiosResponse} from "axios";


export const BIZAREA_TARGETS = [
  {cdBizarea: "", chartBizarea: "TOTAL", title: "TOTAL"},
  {cdBizarea: "3000", chartBizarea: "3000", title: "VINA"},
  {cdBizarea: "5000", chartBizarea: "5000", title: "TAMTHANG"},
  {cdBizarea: "7000", chartBizarea: "7000", title: "BAGO"},
];

export type FactoryDashboardTab =
  | "PERSON"
  | "SEWING"
  | "KNITTING"
  | "DYEING"

export interface FactoryDashboardReq {
  cdCompany?: string;   // 사업장 코드
  cdBizarea?: string;   // 사업장 코드
  dtsWork?: string;       // 작업 일시
}
export type FactoryDashboardDailyPersonRes = {
  cdCompany?: string;                // 회사 코드
  dtsWork?: string;                  // 근무 일자
  cdBizarea?: string;                // 사업장 코드
  cntPerson?: number;                // 총 인원
  cntPersonRate?: number;            // 전월대비 총 인원
  cntAttendPerson?: number;          // 총 출근 인원
  cntAbsentPerson?: number;          // 총 결근 인원
  cntSewPerson?: number;             // 봉제 인원
  cntSewRate?: number;               // 전월대비 봉제 인원
  cntAttendSewPerson?: number;       // 봉제 출근 인원
  cntAbsentSewPerson?: number;       // 봉제 결근 인원
  cntSewgenPerson?: number;          // 봉제 일반 인원
  cntSewgenRate?: number;            // 전월대비 총 인원
  cntAttendSewgenPerson?: number;    // 봉제 일반 출근 인원
  cntAbsentSewgenPerson?: number;    // 봉제 일반 결근 인원
  cntKnitPerson?: number;            // 니팅 인원
  cntKnitRate?: number;              // 전월대비 니팅 인원
  cntAttendKnitPerson?: number;      // 니팅 출근 인원
  cntAbsentKnitPerson?: number;      // 니팅 결근 인원
  cntDyePerson?: number;             // 염색 인원
  cntDyeRate?: number;               // 전월대비 염색 인원
  cntAttendDyePerson?: number;       // 염색 출근 인원
  cntAbsentDyePerson?: number;       // 염색 결근 인원
  cntYarnPerson?: number;            // 원사 인원
  cntYarnRate?: number;              // 전월대비 원사 인원
  cntAttendYarnPerson?: number;      // 원사 출근 인원
  cntAbsentYarnPerson?: number;      // 원사 결근 인원
  cntGenPerson?: number;             // 관리자 인원
  cntGenRate?: number;               // 전월대비 관리자 인원
  cntAttendGenPerson?: number;       // 일반 출근 인원
  cntAbsentGenPerson?: number;       // 일반 결근 인원
};
export type FactoryDashboardDailySewingRes = {
  cdCompany?: string;              // 회사 코드
  cdBizarea?: string;              // 사업장 코드
  dtsWork?: string;                // 작업일자
  cntLine?: number;                // 전체라인수
  cntLineUse?: number;             // 사용라인수
  cntLineOutput?: number;          // 생산라인수
  ratCntLine?: number;             // 라인가동율(%)
  hourWork?: number;               // 당일 작업시간
  qtyDay?: number;                 // 당일 생산수량
  amtDay?: number;                 // 당일 생산금액
  hourWorkDayPrev?: number;        // 전일 작업시간
  qtyDayPrev?: number;             // 전일 생산수량
  amtDayPrev?: number;             // 전일 생산금액
  dayWork?: number;                // 작업일수
  hourOverTime?: number;           // 연장근로시간
  qtyDayPerson?: number;           // 1인당 당일 생산수량
  amtDayPerson?: number;           // 1인당 당일 생산금액
  qtyDayLine?: number;             // 라인당 당일 생산수량
  amtDayLine?: number;             // 라인당 당일 생산금액
  qtyMonthLine?: number;           // 라인당 월 생산수량
  amtMonthLine?: number;           // 라인당 월 생산금액
  amtHourDayPerson?: number;       // 시간당 1인당 당일 생산금액
  amtHourMonthPerson?: number;     // 시간당 1인당 월 생산금액
  qtyMonthTarget?: number;         // 월 생산수량 목표
  qtyMonthActual?: number;         // 월 생산수량 실적
  amtMonthTarget?: number;         // 월 생산금액 목표
  amtMonthActual?: number;         // 월 생산금액 실적
  hourWorkMmPrev?: number;         // 전월 작업시간
  qtyMmPrev?: number;              // 전월 생산수량
  amtMmPrev?: number;              // 전월 생산금액
  cntMmPrev?: number;              // 전월 작업일수
  hourOverTimeMmPrev?: number;     // 전월 연장근로시간(OT)
  hourWorkMmCurr?: number;         // 당월 작업시간
  qtyMmCurr?: number;              // 당월 생산수량
  amtMmCurr?: number;              // 당월 생산금액
  cntMmCurr?: number;              // 당월 작업일수
  hourOverTimeMmCurr?: number;     // 당월 연장근로시간(OT)
};

export type FactoryDashboardDailyKnittingRes = {
  cdCompany?: string;                // 회사 코드
  cdBizarea?: string;                // 사업장 코드
  dtsWork?: string;                  // 작업 일자 / 월(YYYYMM)
  sw?: string;                       // 구분(D: 일, M: 월)
  cntDay?: number;                       // 구분(D: 일, M: 월)
  qtyDay?: number;                   // 일 생산 수량
  amtDay?: number;                   // 일 생산 금액
  qtyMonthTarget?: number;           // 월 생산 목표 수량
  qtyMonthActual?: number;           // 월 생산 실적 수량
  amtMonthTarget?: number;           // 월 생산 목표 금액
  amtMonthActual?: number;           // 월 생산 실적 금액
  qtyMachineKeep?: number;           // Machine 보유 수량
  qtyMachineUse?: number;            // Machine 사용 수량
  ratMachine?: number;               // Machine 사용률
  qtySingleKeep?: number;            // Single 보유 수량
  qtySingleUse?: number;             // Single 사용 수량
  cdSingle?: string;                 // Single 코드
  ratSingleKeep?: number;            // Single 보유 비율
  ratSingleUse?: number;             // Single 사용 비율
  qtyFrenchTerryKeep?: number;       // French Terry 보유 수량
  qtyFrenchTerryUse?: number;        // French Terry 사용 수량
  cdFrenchTerry?: string;            // French Terry 코드
  ratFrenchTerryKeep?: number;       // French Terry 보유 비율
  ratFrenchTerryUse?: number;        // French Terry 사용 비율
  qtyRibKeep?: number;               // Rib 보유 수량
  qtyRibUse?: number;                // Rib 사용 수량
  cdRib?: string;                    // Rib 코드
  ratRibKeep?: number;               // Rib 보유 비율
  ratRibUse?: number;                // Rib 사용 비율
  qtyDoubleKeep?: number;            // Double 보유 수량
  qtyDoubleUse?: number;             // Double 사용 수량
  cdDouble?: string;                 // Double 코드
  ratDoubleKeep?: number;            // Double 보유 비율
  ratDoubleUse?: number;             // Double 사용 비율
  qtyJacquardDoubleKeep?: number;    // Jacquard Double 보유 수량
  qtyJacquardDoubleUse?: number;     // Jacquard Double 사용 수량
  cdJacquardDouble?: string;         // Jacquard Double 코드
  ratJacquardDoubleKeep?: number;    // Jacquard Double 보유 비율
  ratJacquardDoubleUse?: number;     // Jacquard Double 사용 비율
  qtyJacquardSingleKeep?: number;    // Jacquard Single 보유 수량
  qtyJacquardSingleUse?: number;     // Jacquard Single 사용 수량
  cdJacquardSingle?: string;         // Jacquard Single 코드
  ratJacquardSingleKeep?: number;    // Jacquard Single 보유 비율
  ratJacquardSingleUse?: number;     // Jacquard Single 사용 비율
  qtyJacquardZurryKeep?: number;     // Jacquard Zurry 보유 수량
  qtyJacquardZurryUse?: number;      // Jacquard Zurry 사용 수량
  cdJacquardZurry?: string;          // Jacquard Zurry 코드
  ratJacquardZurryKeep?: number;     // Jacquard Zurry 보유 비율
  ratJacquardZurryUse?: number;      // Jacquard Zurry 사용 비율
  qtyEngStriperKeep?: number;        // Eng Striper 보유 수량
  qtyEngStriperUse?: number;         // Eng Striper 사용 수량
  cdEngStriper?: string;             // Eng Striper 코드
  ratEngStriperKeep?: number;        // Eng Striper 보유 비율
  ratEngStriperUse?: number;         // Eng Striper 사용 비율
  qtySmallDoubleKeep?: number;       // Small Double 보유 수량
  qtySmallDoubleUse?: number;        // Small Double 사용 수량
  cdSmallDouble?: string;            // Small Double 코드
  ratSmallDoubleKeep?: number;       // Small Double 보유 비율
  ratSmallDoubleUse?: number;        // Small Double 사용 비율
  qtySmallSingleKeep?: number;       // Small Single 보유 수량
  qtySmallSingleUse?: number;        // Small Single 사용 수량
  cdSmallSingle?: string;            // Small Single 코드
  ratSmallSingleKeep?: number;       // Small Single 보유 비율
  ratSmallSingleUse?: number;        // Small Single 사용 비율
  qtyVelourKeep?: number;            // Velour 보유 수량
  qtyVelourUse?: number;             // Velour 사용 수량
  cdVelourUse?: string;              // Velour 코드 (쿼리 alias 그대로)
  ratVelourKeep?: number;            // Velour 보유 비율
  ratVelourUse?: number;             // Velour 사용 비율
  qtyRaschelKeep?: number;           // Raschel 보유 수량
  qtyRashelUse?: number;             // Raschel 사용 수량 (쿼리 alias 그대로)
  cdRashel?: string;                 // Raschel 코드 (쿼리 alias 그대로)
  ratRaschelKeep?: number;           // Raschel 보유 비율
  ratRaschelUse?: number;            // Raschel 사용 비율
};

export type FactoryDashboardDailyDyeingRes = {
  cdCompany?: string;                    // 회사 코드
  cdBizarea?: string;                    // 사업장 코드
  dtsWork?: string;                      // 작업일자 / 월(YYYYMMDD 또는 YYYYMM)
  sw?: string;                           // 구분(D:일, M:월)
  cntDay?: number;                       // 집계 일수
  qtyDay?: number;                       // 일 생산 수량
  amtDay?: number;                       // 일 생산 금액
  qtyMonthTarget?: number;               // 월 생산 목표 수량
  qtyMonthActual?: number;               // 월 생산 실적 수량
  ratQtyMonth?: number;                  // 월 생산 수량 달성률
  amtMonthTarget?: number;               // 월 생산 목표 금액
  amtMonthActual?: number;               // 월 생산 실적 금액
  ratAmtMonth?: number;                  // 월 생산 금액 달성률
  qtyMachineKeep?: number;               // 전체 기계 보유 수량
  qtyMachineUse?: number;                // 전체 기계 사용 수량
  ratMachine?: number;                   // 전체 기계 사용 비율
  cdNormalPress499?: string;             // 상압 499 코드
  cdNormalPress999?: string;             // 상압 999 코드
  cdNormalPress1000?: string;            // 상압 1000 코드
  cdNormalHighPress499?: string;         // 상고압 499 코드
  cdNormalHighPress999?: string;         // 상고압 999 코드
  cdNormalHighPress1000?: string;        // 상고압 1000 코드
  cdHighPress499?: string;               // 고압 499 코드
  cdHighPress999?: string;               // 고압 999 코드
  cdHighPress1000?: string;              // 고압 1000 코드
  cdSample?: string;                     // 샘플 코드
  qtyNormalPress499?: number;            // 상압 499 보유 수량
  qtyNormalPress999?: number;            // 상압 999 보유 수량
  qtyNormalPress1000?: number;           // 상압 1000 보유 수량
  qtyNormalHighPress499?: number;        // 상고압 499 보유 수량
  qtyNormalHighPress999?: number;        // 상고압 999 보유 수량
  qtyNormalHighPress1000?: number;       // 상고압 1000 보유 수량
  qtyHighPress499?: number;              // 고압 499 보유 수량
  qtyHighPress999?: number;              // 고압 999 보유 수량
  qtyHighPress1000?: number;             // 고압 1000 보유 수량
  qtySample?: number;                    // 샘플 보유 수량
  qtyNormalPress499Use?: number;         // 상압 499 사용 수량
  qtyNormalPress999Use?: number;         // 상압 999 사용 수량
  qtyNormalPress1000Use?: number;        // 상압 1000 사용 수량
  qtyNormalHighPress499Use?: number;     // 상고압 499 사용 수량
  qtyNormalHighPress999Use?: number;     // 상고압 999 사용 수량
  qtyNormalHighPress1000Use?: number;    // 상고압 1000 사용 수량
  qtyHighPress499Use?: number;           // 고압 499 사용 수량
  qtyHighPress999Use?: number;           // 고압 999 사용 수량
  qtyHighPress1000Use?: number;          // 고압 1000 사용 수량
  qtySampleUse?: number;                 // 샘플 사용 수량
  ratNormalPress499?: number;            // 상압 499 보유 비율
  ratNormalPress999?: number;            // 상압 999 보유 비율
  ratNormalPress1000?: number;           // 상압 1000 보유 비율
  ratNormalHighPress499?: number;        // 상고압 499 보유 비율
  ratNormalHighPress999?: number;        // 상고압 999 보유 비율
  ratNormalHighPress1000?: number;       // 상고압 1000 보유 비율
  ratHighPress499?: number;              // 고압 499 보유 비율
  ratHighPress999?: number;              // 고압 999 보유 비율
  ratHighPress1000?: number;             // 고압 1000 보유 비율
  ratQtySample?: number;                 // 샘플 보유 비율
  ratNormalPress499Use?: number;         // 상압 499 사용 비율
  ratNormalPress999Use?: number;         // 상압 999 사용 비율
  ratNormalPress1000Use?: number;        // 상압 1000 사용 비율
  ratNormalHighPress499Use?: number;     // 상고압 499 사용 비율
  ratNormalHighPress999Use?: number;     // 상고압 999 사용 비율
  ratNormalHighPress1000Use?: number;    // 상고압 1000 사용 비율
  ratHighPress499Use?: number;           // 고압 499 사용 비율
  ratHighPress999Use?: number;           // 고압 999 사용 비율
  ratHighPress1000Use?: number;          // 고압 1000 사용 비율
  ratSampleUse?: number;                 // 샘플 사용 비율
};

export interface FactorySewingActualChartReq {
  cdCompany?: string;   // 사업장 코드
  cdBizarea?: string;   // 사업장 코드
  cdFty?: string;       // 공장 코드
  dtsWk?: string;       // 작업 일시
  bep?: number;      // BEP
}

export type FactorySewingActualChartRes = {
  cdBizarea?: string;   // 사업장 코드
  cdFty?: string;       // 공장 코드
  dtsWk?: string;       // 작업 일시
  totLn?: number;      // 총 라인 수
  sewLn?: string;     // 봉제 라인
  mpw4?: number;      // MPW4
  tgtProd?: number;  // 목표 생산량
  actProd?: number;  // 실적 생산량
  earnAmt?: number;  // 수익 금액
  rtEff?: number;    // 효율
  bep?: number;      // BEP
};


export const getFactoryDashboardPersonList = createAsyncThunk<AxiosResponse, FactoryDashboardReq>(
  "factory/dashboard/person/list",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;

    try {
      const res = await api.create("/factory/dashboard/person/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFactoryDashboardSewingList = createAsyncThunk<AxiosResponse, FactoryDashboardReq>(
  "factory/dashboard/sewing/list",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;

    try {
      const res = await api.create("/factory/dashboard/sewing/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFactoryDashboardKnittingList = createAsyncThunk<AxiosResponse, FactoryDashboardReq>(
  "factory/dashboard/knitting/list",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;

    try {
      const res = await api.create("/factory/dashboard/knitting/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFactoryDashboardDyeingList = createAsyncThunk<AxiosResponse, FactoryDashboardReq>(
  "factory/dashboard/dyeing/list",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;

    try {
      const res = await api.create("/factory/dashboard/dyeing/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFactorySewingActualChartList = createAsyncThunk<AxiosResponse, FactorySewingActualChartReq>(
  "factory/sewing/actual/chart",
  async (arg, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;

    try {
      const res = await api.create("/factory/sewing/actual/chart", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
