import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosResponse } from "axios";
import { api } from "../../helpers/api/apiCore";

interface State {
  loading: boolean;
  error: string | null;
  uploadedFileUrls: string[];
}

const initialState: State = {
  loading: false,
  error: null,
  uploadedFileUrls: [],
};

/* 영업활동 SEQ 저장 REQ */
interface SalesActivitySeqReq {
  cdCompany: string; // 회사코드
  setDate: string; //오늘날짜
}

/* 영업활동 SEQ 저장 RES */
interface SalesActivitySeqRes {
  setSeq: number;
  docuNo: string;
  setDocu: string;
}

/* 영업활동 Plan 저장 */
interface SalesActivityPlanReq {
  cdCompany: string; // 회사코드
  dtPlan: string; //계획일자
  seqPlan: string; //계획순번
  purpose: string; //목적
  company: string; //회사명
  attend: string; //참석자
  startTm: string; //시작시간
  endTm: string; //종료시간
  levShare: string; //업무공유
  noEmp: string; //사원번호
  cdDept: string; //부서번호
  idInsert: string; //등록일자
  noticeYn: string; //등록일자
}

// 전체 영업 활동 저장 요청 DTO
interface SalesActivitySaveReq {
  saveActivityList: SaveSalesActivityListReq[]; // 영업 활동 데이터 목록
  saveActivityOrderList: SaveSalesActivityOrderListReq[]; // 영업 활동 오더 데이터 목록
  saveActivityFileList: SaveSalesActivityFileListReq[]; // 영업 활동 파일 데이터 목록
  saveActivityAttendList: SaveSalesActivityAttendListReq[]; // 영업 활동 참석 데이터 목록
  saveActivityCostList: SaveSalesActivityCostListReq[]; // 영업 활동 비용 데이터 목록
  saveActivityContentsList: SaveSalesActivityContentsListReq[]; // 영업 활동 Contents 목록
}

// 영업 활동 데이터
interface SaveSalesActivityListReq {
  cdCompany: string; // 회사 코드
  noDocuSeq: string; // 문서 시퀀스
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  levDocu?: number; // 문서 레벨
  dtMeeting: string; // 회의 일자 (예: 20250312)
  dtInput: string; // 입력 일자 (예: 20250312)
  cdWork: string; // 업무 구분
  cdDetail: string; // 상세 분류
  cdActivity: string; // 활동 코드
  nmWork: string; // 업무 코드명
  nmDetail: string; // 상세 코드명
  nmActivity: string; // 활동 코드명
  purpose: string; // 목적
  keywords: string; // 키워드
  levShare: string; // 공유 레벨
  agenda: string; // 의제
  results: string; // 결과
  progress: string; // 진행 상태
  gwStatus: string; // GW 상태
  dtApproval: string; //
  nmApproval: string; //
  noEmp: string; // USER ID
  nmEmp: string; // USER ID
  cdDept: string; // 부서코드
  nmDept: string; // 부서코드
  contents: string; // GW 상태
  ynFlag: string; // 상태 플래그
  idInsert: string; // 등록자 ID
  dtInsert: string; // 등록일자 (ISO 문자열 권장)
  idUpdate: string; // 수정자 ID
  dtUpdate: string; // 수정일자 (ISO 문자열 권장)
}

// 영업 활동 오더 데이터
interface SaveSalesActivityOrderListReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  seqOrder: number; // 주문 순번
  cdBuyer: string; // 구매자 코드
  nmBuyer: string; // 구매자명
  cdBrand: string; // 브랜드 코드
  nmBrand: string; // 브랜드명
  cdItem: string; // 품목 코드
  nmItem: string; // 품목명
  seqStyle: number; // 스타일 순번
  noStyle: string; // 스타일 번호
  quantity: number; // 수량
  amount: number; // 금액
  ynFlag: string; // 상태 플래그
  remarks: string; // 비고
}

// 영업 활동 파일 데이터
interface SaveSalesActivityFileListReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  seqFile: number; // 파일 순번
  ynDel: string; // 삭제 여부
  ynFlag: string; // 구분
  nmFile: string; // 파일명
}

// 영업 활동 참석 데이터
interface SaveSalesActivityAttendListReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  seqAttend: number; // 참석 순번
  noEmp: string; // 사원 번호
  nmEmp: string; // 사원명
  cdDept: string; // 부서 코드
  empVendor: string; // 관계사 사원명
  deptVendor: string; // 관계사 부서
  positionVendor: string; // 관계사 직책
  telNoVendor: string; // 관계사 연락처
  nmVendor: string; // 관계사 회사명
  ynFlag: string; // 상태 플래그
  remarks: string; // 비고
}

// 영업 활동 비용 데이터
interface SaveSalesActivityCostListReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  seqCost: number; // 비용 순번
  cdCost: string; // 비용 항목명
  nmCost: string; // 비용 항목명
  amtCost: number; // 비용 금액
  ynFlag: string; // 상태 플래그
  remarks: string; // 비고
}
// 영업 Contents 데이터
interface SaveSalesActivityContentsListReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  contents: string; // contents
}

/* 영업 활동 목록 조회 Req */
interface salesActivitySumListSumReq {
  cdCompany: string; // 회사 코드
  keywords: string; // 키워드
  nmVendor: string; //관계사
  descAttend: string; //참여자
  nmEmp: string; // 담당자 명
  cdDept: string; // 부서 코드
  nmDept: string; // 부서 명
  dtMeetFrom: string; // 상담기간 FROM
  dtMeetTo: string; // 상담기간 TO
  nmWork: string; // 업무구분
  nmDetail: string; // 상세분류
  progress: string; // 진행상태
  gwStatus: string; // 진행상태
  noDocuSeq: string; // 문서번호
  purpose: string; // 상담목적
  nmBuyer: string; // Buyer
  nmBrand: string; // BRAND
  nmItem: string; // ITEM
  dtInputFrom: string; // 작성일자 TO
  dtInputTo: string; // 작성일자 TO
  nmActivity: string; // 상담유형
  nmNameVendor: string; //연락처
  pLang: string; //
}

/* 영업 활동 목록 조회 Res */
interface SalesActivitySumListRes {
  cdCompany: string; // 회사 코드
  lvlFig: string; // 최초
  noDocuSeq: string; // 문서 번호-순번
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  levDocu: number; // 문서 레벨
  dtMeeting: string; // 회의 날짜
  dtInput: string; // 입력 날짜
  cdWork: string; // 업무 코드
  cdDetail: string; // 상세 코드
  cdActivity: string; // 활동 코드
  nmWork: string; // 업무 명
  nmDetail: string; // 상세 코드 명
  nmActivity: string; // 활동 코드 명
  purpose: string; // 목적
  keywords: string; // 키워드
  levShare: string; // 공유 레벨
  agenda: string; // 의제
  results: string; // 결과
  progress: string; // 진행 상태
  gwStatus: string; // 결재 상태
  dtApproval: string; // 승인 날짜
  nmApproval: string; // 승인자 이름
  nmBuyer: string; // BUYER
  nmBrand: string; // BRAND
  nmItem: string; // ITEM
  quantity: string; // QTY
  amount: string; // 금액
  nmName: string; // NAME
  nmEmp: string; // 담당자
  nmDept: string; // 부서명
  nmNameVendor: string; // NAME VENDOR
  nmVendor: string; // VENDOR NAME
  contents: string; // 내용
  descAttend: string; // 참석자
  descOrder: string; // 스타일
  descCost: string; // 비용
  descFile: string; // 파일명
  idInsert: string; // 등록자 ID
  dtInsert: string; // 등록일
  idUpdate: string; // 수정자 ID
  dtUpdate: string; // 수정일
  pageNum: string;
}

/* 영업 활동 목록 조회 req */
interface SalesActivityReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
}

interface SalesActivityAllListRes {
  activityList: SalesActivityRes[];
  activityAttendList: SalesActivityAttendListRes[];
  activityContentsList: SalesActivityContentsListRes[];
  activityCostList: SalesActivityCostListRes[];
  activityFileList: SalesActivityFileListRes[];
  activityOrderList: SalesActivityOrderListRes[];
}

/* 영업 활동 목록 조회 res */
interface SalesActivityRes {
  cdCompany: string; // 회사 코드
  noDocuSeq: string; // 문서 시퀀스
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
  levDocu: number; // 문서 레벨
  dtMeeting: string; // 회의 날짜
  dtInput: string; // 입력 날짜
  cdWork: string; // 업무 코드
  cdDetail: string; // 상세 코드
  cdActivity: string; // 활동 코드
  nmWork: string; // 업무 코드명
  nmDetail: string; // 상세 코드명
  nmActivity: string; // 활동 코드명
  purpose: string; // 상담목적
  keywords: string; // 키워드
  levShare: string; // 공유 레벨
  agenda: string; // 의제
  results: string; // 결과
  progress: string; // 진행 상태
  gwStatus: string; // 결재 상태
  dtApproval: string; // 승인 날짜
  nmApproval: string; // 승인자 이름
  noEmp: string; // 사원번호
  nmEmp: string; // 사원명
  cdDept: string; // 부서 코드
  nmDept: string; // 부서명
  contents: string; //
  ynFlag: string; //
  idInsert: string; // 등록자 ID
  dtInsert: string; // 등록일시
  idUpdate: string; // 수정자 ID
  dtUpdate: string; // 수정일시
}

/* 영업 활동 참석자 목록 조회 res */
interface SalesActivityAttendListRes {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
  seqAttend: number; // 참석자 순번
  noEmp: string; // 당사 사원번호
  nmEmp: string; // 당사 사원명
  cdDept: string; // 부서 코드
  nmDept: string; // 부서 명
  empVendor: string; // 관계사 사원명
  deptVendor: string; // 관계사 부서명
  positionVendor: string; // 관계사 직책
  telNoVendor: string; // 관계사 연락처
  nmVendor: string; // 관계사 회사명
  remarks: string; // 참고사항
  ynFlag: string; // 참고사항
}

/* 영업 활동 게시판 목록 조회 res */
interface SalesActivityContentsListRes {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
  contents: string; // 내용
}

/* 영업 활동 비용 목록 조회 res */
interface SalesActivityCostListRes {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
  seqCost: number; // 비용 순번
  cdCost: string; // 비용 항목 코드
  nmCost: string; // 비용 항목 명
  amtCost: number; // 비용 (금액)
  ynFlag: string;
  remarks: string; // 참고사항
}

/* 영업 활동 파일 목록 조회 res */
interface SalesActivityFileListRes {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
  seqFile: number; // FILE 순번
  ynDel: string; // 삭제 여부
  nmFile: string; // 파일명
}

/* 영업 활동 주문 목록 조회 res */
interface SalesActivityOrderListRes {
  cdCompany: string; // 회사 코드
  noDocu: string; // 문서 번호
  seqDocu: string; // 문서 순번
  seqOrder: number; // 주문 순번
  cdBuyer: string; // 구매자 코드
  nmBuyer: string; // 구매자명
  cdBrand: string; // 브랜드 코드
  nmBrand: string; // 브랜드명
  cdItem: string; // 품목 코드
  nmItem: string; // 품목명
  seqStyle: number; // 스타일 순번
  noStyle: string; // 스타일 번호
  quantity: number; // 수량
  amount: number; // 금액
  ynFlag: string; // 상태 플래그
  remarks: string; // 비고
}

/* 영업활동 Plan 목록 Req */
interface SalesActivityPlanListReq {
  cdCompany: string; // 회사코드
  dtPlan: string; //계획일자
  levShare: string; //업무공유
  noEmp: string; //ID
  cdDept: string; //DEPT
}

/* 영업활동 Plan 목록 Res */
interface SalesActivityPlanListRes {
  cdCompany: string; // 회사코드
  dtPlan: string; //계획일자
  sw: string; //구분
  seqPlan: string; //계획순번
  purpose: string; //목적
  company: string; //회사명
  attend: string; //참석자
  startTm: string; //시작시간
  endTm: string; //종료시간
  levShare: string; //업무공유
  noEmp: string; //사원번호
  cdDept: string; //부서번호
  noDocu: string; //문서 번호
  seqDocu: string; //문서 순번
  porpose: string; //시작시간~종료시간+목적+회사명+참석자
  noticeYn: string;
}

/* 영업활동 Dashboard Req */
interface SalesActivityDashboardReq {
  cdCompany: string; // 부서코드
  startYm: string; //조회일자(FROM)
  endYm: string; //조회일자(TO)
}

/* 영업활동 Dashboard Res */
interface SalesActivityDashboardRes {
  deptNm: string; // 부서코드
  nmSysDefList: string; //총 건수
  saleDashboardListRes: SalesActivityDashboardListRes[];
}

/* 영업활동 Dashboard 목록 Res */
interface SalesActivityDashboardListRes {
  cdDept: string; // 부서 코드
  deptNm: string; // 부서 명
  cdWork: string; // 작업 코드
  nmWork: string; // 작업 명
  cntWork: string; // 작업 별 개수
  cntDept: string; // 작업 별 총 개수
  ttl: string; // 총 개수
}

/* 영업 활동 삭제 req */
interface SalesActivityDeleteReq {
  cdCompany: string; // 회사 코드
  noDocu: string; // 영업활동번호
  seqDocu: string; // 추가차수번호
}

/* 영업 활동 플랜 삭제 req */
interface SalesActivityPlanDeleteReq {
  cdCompany: string; // 회사 코드
  dtPlan: string; // 영업활동번호
  seqPlan: string; // 추가차수번호
  noticeYn: string; // 추가차수번호
}

/* 영업 활동 SEQ 저장 API */
export const saveSalesActivitySeq = createAsyncThunk<AxiosResponse, SalesActivitySeqReq>(
  "sales/activity/saveSalesActivitySeq",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("/sales/activity/saveSalesActivitySeq", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 활동 저장 API */
export const saveSalesActivityPlan = createAsyncThunk<AxiosResponse, SalesActivityPlanReq>(
  "sales/activity/saveSalesActivityPlan",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("/sales/activity/saveSalesActivityPlan", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 활동 저장 API */
export const saveSalesActivity = createAsyncThunk<AxiosResponse, SalesActivitySaveReq>(
  "sales/activity/saveSalesActivity",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("/sales/activity/saveSalesActivity", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 업로드 API */
export const uploadSalesActivityFile = createAsyncThunk<AxiosResponse<string[]>, { noDocu: string; files: File[] }>(
  "sales/activity/uploadFile",
  async ({ noDocu, files }, thunkAPI) => {
    try {
      const form = new FormData();
      form.append("noDocu", noDocu);
      files.forEach((f) => form.append("files", f)); // Spring @RequestParam("files")
      const res = await api.create("/sales/activity/uploadFile", form);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 다운로드 API */
export const downloadSalesActivityFile = createAsyncThunk<AxiosResponse<Blob>, { noDocu: string; fileName: string }>(
  "sales/activity/downloadFile",
  async ({ noDocu, fileName }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        noDocu,
        fileName,
      });
      const res = await axios.get(`/sales/activity/downloadFile?${params.toString()}`, { responseType: "blob" });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 삭제 API */
export const deleteSalesActivityFile = createAsyncThunk<AxiosResponse, { noDocu: string; fileName: string }>(
  "sales/activity/deleteFile",
  async ({ noDocu, fileName }, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/deleteFile", { noDocu, fileName });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 플랜 저장 API */
export const saveSalesPlan = createAsyncThunk<AxiosResponse, FormData>(
  "sales/activity/plan/saveSalesPlan",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("/sales/activity/plan/saveSalesPlan", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 활동 목록 조회 API */
export const getSalesActivitySumList = createAsyncThunk<AxiosResponse, salesActivitySumListSumReq>(
  "sales/activity/activitySumList",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activitySumList", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 활동 목록 조회 API */
export const getSalesActivityAllList = createAsyncThunk<AxiosResponse, SalesActivityReq>(
  "sales/activity/activityAllList",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityAllList", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 활동 단건 조회 API */
export const getSalesActivityList = createAsyncThunk<AxiosResponse, SalesActivityReq>(
  "sales/activity/activityList",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityList", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 플랜 목록 조회 API */
export const getSalesActivityPlanList = createAsyncThunk<AxiosResponse, SalesActivityPlanListReq>(
  "sales/activity/activityPlanList",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityPlanList", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업 Dashboard 목록 조회 API */
export const getSalesActivityDashboardList = createAsyncThunk<AxiosResponse, SalesActivityDashboardReq>(
  "sales/activity/activityDashboardList",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityDashboardList", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업활동 삭제 API */
export const deleteSalesActivity = createAsyncThunk<AxiosResponse, SalesActivityDeleteReq>(
  "sales/activity/activityDelete",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityDelete", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 영업활동 플랜 삭제 API */
export const deleteSalesActivityPlan = createAsyncThunk<AxiosResponse, SalesActivityPlanDeleteReq>(
  "sales/activity/activityPlanDelete",
  async (arg, thunkAPI) => {
    try {
      const res = await api.create("/sales/activity/activityPlanDelete", arg);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export type {
  SalesActivityPlanReq,
  SalesActivityPlanListReq,
  SalesActivityPlanListRes,
  SalesActivityDashboardRes,
  SalesActivityDashboardListRes,
  SalesActivitySumListRes,
  SalesActivityAllListRes,
  SalesActivityRes,
  SalesActivityAttendListRes,
  SalesActivityCostListRes,
  SalesActivityContentsListRes,
  SalesActivityFileListRes,
  SalesActivityOrderListRes,
  SalesActivitySaveReq,
  SalesActivitySeqRes,
};
