import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import axios, { AxiosError, AxiosResponse } from "axios";
import { FactorySewingHeaderInfo, HeaderInfo } from "../../constants/common/common";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

interface SaveSewingQrSystemReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 중분류코드
  astCode: string; // QR코드
  astSw: string; // SW구분
  astSeq: string; // 순번
  dtsJob: string; // 작업일자
  model: string; // 모델명
  serialno: string; // 시리얼번호
  cdTypMachine: string; // 기계유형코드
  astMcode: string; // 기계대분류코드
  astScode1: string; // 기계중분류1
  astScode2: string; // 기계중분류2
  astScode3: string; // 기계중분류3
  astScode4: string; // 기계중분류4
  astScode5: string; // 기계중분류5
  astScode6: string; // 기계기타정보
  astScode7: string; // 기계중분류7
  cdFty: string; // Factory 코드
  cdLine: number; // 라인번호
  cdPosition: string; // 포지션번호
  prYymm: string; // 생산년월
  status: string; // 상태코드
  dtsStart: string; // 시작일자
  cdComp: string; // 구입처코드
  dtsPurchase: string; // 구매일자
  cdCrncyP: string; // 구매화폐
  amAmtP: string; // 구입금액
  dtsRentS: string; // 임차시작일
  dtsRentE: string; // 임차종료일
  dtsRentR: string; // 반납일자
  cdCrncyR: string; // 임차화폐
  amAmtR: string; // 임차금액
  dcRmk: string; // 비고
  idInsert: string; // 등록자
  imgPath: string; // 파일경로
  imgFname: string; // 파일명
  idUser: string; // 사용자 ID
  nmUser: string; // 사용자 명
  cdDept: string; // 부서명
  nmDept: string; // 부서코드
}

interface SaveSewingQrSystemBrokenReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 사업장코드
  astCode: string; // 자산코드
  astSw: string; // 자산상태 (예: 'B1' - 고장)
  astSeq: string | null; // 일련번호 (신규 시 null)
  dtsJob: string; // 고장일자 (YYYYMMDD)
  descBroken: string; // 고장내역
  dtsReturn: string; // 회수일자 (YYYYMMDD)
  locReturn: string; // 반납위치
  idInsert: string; // 등록자 ID
  cdReturn: string; // 회수여부
}

interface SaveSewingQrSystemRepairReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 사업장코드
  astCode: string; // 자산코드
  astSeq: string | null; // 일련번호 (신규 시 null)
  dtsFix: string; // 수리일자 (YYYYMMDD)
  nmCompany: string; // 수리업체명
  nmPerson: string; // 수리담당자
  amtFix: number; // 수리금액
  descFix: string; // 수리내역
  ynFix: string; // 완료여부 ('Y' 또는 'N')
  idInsert: string; // 등록자 ID
}

interface SaveSewingQrSystemDisposalReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 사업장코드
  astCode: string; // 자산코드
  astSw: string; // 자산상태 (예: 'D1' - 폐기, 'S1' - 매각 등)
  dtsTrash: string; // 폐기일자 (YYYYMMDD)
  descTrash: string; // 폐기사유
  nmCompany: string; // 폐기업체
  nmPerson: string; // 폐기담당자
  amtTrash: number; // 폐기금액
  idInsert: string; // 등록자 ID
}

interface SewingQrSystemReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 작업장코드
  cdQr: string; // Qr코드
}

interface SewingQrSystemRes {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 작업장코드
  astCode: string; // 자산코드
  model: string; // 모델명
  serialNo: string; // 시리얼번호
  cdTypMachine: string; // 기계유형코드
  astMcode: string; // 대분류코드
  nmAstMcode: string; // 대분류명
  astScode1: string; // 기계타입 코드
  nmAstScode1: string; // 기계타입 명
  astScode2: string; // 이동방식 코드
  nmAstScode2: string; // 이동방식 명
  astScode3: string; // 헤더 코드
  nmAstScode3: string; // 헤더 명
  astScode4: string; // 바늘/실 코드
  nmAstScode4: string; // 바늘/실 명
  astScode5: string; // 사절 코드
  nmAstScode5: string; // 사절 명
  astScode6: string; // 기타코드6
  astScode7: string; // 브랜드 코드
  nmAstScode7: string; // 브랜드 명
  cdFty: string; // 공장코드
  nmFty: string; // 공장 명
  cdLine: string; // 라인코드
  nmSew: string; // 라인명
  cdPosition: string; // 브랜드 명
  prYymm: string; // 구입년월
  status: string; // 상태 코드
  nmStatus: string; // 상태 명
  dtsStart: string; // 사용시작일시
  cdComp: string; // 구입처 코드
  nmComp: string; // 구입처 명
  dtsPurchase: string; // 구입일자
  cdCrncyP: string; // 구입통화코드
  nmSysdef: string; // 구입통화명
  amAmtP: string; // 구입금액
  dtsRentS: string; // 임차시작일
  dtsRentE: string; // 임차종료일
  dtsRentR: string; // 렌탈반납일
  cdCrncyR: string; // 렌탈통화코드
  nmCrncyR: string; // 렌탈통화명
  amAmtR: string; // 렌탈금액
  imgPath: string; // 파일경로
  imgFname: string; // 파일명
  dcRmk: string; // 비고
  idUser: string; // 사용자 ID
  nmUser: string; // 사용자 명
  cdDept: string; // 부서명
  nmDept: string; // 부서코드
}
interface SewingQrSystemHistoryListRes {
  seq: number; // 순번
  dtsJob: string; // 기준일자 (YYYY-MM-DD)
  astSw: string; // 구분코드
  nmAstSw: string; // 구분명
  cdFty: string; // Factory 코드
  nmFty: string; // Factory 명
  cdLine: string; // 라인 코드
  nmLine: string; // 라인 명
  cdPosition: string; // 설치 위치 코드
  status: string; // 제품 상태 코드
  nmStatus: string; // 제품 상태명
  locReturn: string; // 반품처
  dtsReturn: string; // 반품일자 (YYYY-MM-DD)
  nmCompany: string; // 수리/폐기 업체명
  nmPerson: string; // 수리/폐기 담당자
  amt: number; // 금액
  ynFix: string; // 수리완료 여부 ("Y" | "N")
  remark: string; // 참고사항
  cdCompany: string; // 회사 코드
  cdBizarea: string; // 사업장 코드
  astSeq: string; // 자산 일련번호
  idUser: string; // 사용자 ID
  nmUser: string; // 사용자 명
  cdDept: string; // 부서명
  nmDept: string; // 부서코드
  cdReturn: string; // 회수여부
  amAmtP: string; // 변경금액
}

interface DeleteSewingQrSystemHistoryListReq {
  cdCompany: string; // 회사코드
  cdBizarea: string; // 중분류코드
  astCode: string; // QR코드
  astSeq: string; // 순번
}
interface UploadQrImageReq {
  file: File;
  cdCompany: string;
  cdBizarea: string;
  cdQr: string;
}

interface UploadQrImageRes {
  imgPath: string;
  imgFname: string;
}
// 변경
export const saveSewingQrSystem = createAsyncThunk<AxiosResponse, SaveSewingQrSystemReq>(
  "factory/qr/saveSewingQrSystem",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/saveSewingQrSystem", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

// 고장
export const saveSewingQrSystemBroken = createAsyncThunk<AxiosResponse, SaveSewingQrSystemBrokenReq>(
  "factory/qr/saveSewingQrSystemBroken",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/saveSewingQrSystemBroken", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

// 수리
export const saveSewingQrSystemRepair = createAsyncThunk<AxiosResponse, SaveSewingQrSystemRepairReq>(
  "factory/qr/saveSewingQrSystemRepair",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/saveSewingQrSystemRepair", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

// 폐기
export const saveSewingQrSystemDisposal = createAsyncThunk<AxiosResponse, SaveSewingQrSystemDisposalReq>(
  "factory/qr/saveSewingQrSystemDisposal",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/saveSewingQrSystemDisposal", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingQrSystemInfo = createAsyncThunk<AxiosResponse, SewingQrSystemReq>(
  "factory/qr/getSewingQrSystemInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/getSewingQrSystemInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingQrSystemHistoryList = createAsyncThunk<AxiosResponse, SewingQrSystemReq>(
  "factory/qr/getSewingQrSystemHistoryList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/getSewingQrSystemHistoryList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteSewingQrSystemHistory = createAsyncThunk<AxiosResponse, DeleteSewingQrSystemHistoryListReq>(
  "factory/qr/deleteSewingQrSystemHistory",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/deleteSewingQrSystemHistory", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteSewingQrSystemDisposal = createAsyncThunk<AxiosResponse, DeleteSewingQrSystemHistoryListReq>(
  "factory/qr/deleteSewingQrSystemDisposal",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/deleteSewingQrSystemDisposal", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteSewingQrSystemBroken = createAsyncThunk<AxiosResponse, DeleteSewingQrSystemHistoryListReq>(
  "factory/qr/deleteSewingQrSystemBroken",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/deleteSewingQrSystemBroken", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
export const deleteSewingQrSystemRepair = createAsyncThunk<AxiosResponse, DeleteSewingQrSystemHistoryListReq>(
  "factory/qr/deleteSewingQrSystemRepair",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/factory/qr/deleteSewingQrSystemRepair", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getSewingMachine = createAsyncThunk<AxiosResponse, HeaderInfo>(
  "factory/qr/sewing/status/machine",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("factory/qr/sewing/status/machine", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
export const uploadQrImage = createAsyncThunk<UploadQrImageRes, UploadQrImageReq>(
  "factory/qr/uploadQrImage",
  async ({ file, cdCompany, cdBizarea, cdQr }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cdCompany", cdCompany);
      formData.append("cdBizarea", cdBizarea);
      formData.append("cdQr", cdQr);

      const response = await axios.post("/factory/qr/uploadQrImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Upload failed");
    }
  }
);
/* 파일 삭제 API */
export const deleteQrImage = createAsyncThunk<
  AxiosResponse,
  { cdCompany: string; cdBizarea: string; imgPath: string; imgFname: string; cdQr: string }
>("factory/qr/deleteSewingQrSystemHistory", async ({ cdCompany, cdBizarea, imgPath, imgFname, cdQr }, thunkAPI) => {
  try {
    const res = await api.create("/factory/qr/deleteQrImage", { cdCompany, cdBizarea, imgPath, imgFname, cdQr });
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
  }
});

export type {
  SewingQrSystemReq,
  SewingQrSystemRes,
  SewingQrSystemHistoryListRes,
  SaveSewingQrSystemReq,
  SaveSewingQrSystemBrokenReq,
  SaveSewingQrSystemRepairReq,
  SaveSewingQrSystemDisposalReq,
  DeleteSewingQrSystemHistoryListReq,
};
