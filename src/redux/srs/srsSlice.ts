import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@helpers/api/apiCore";
import axios, { AxiosError } from "axios";

export type SrsStatusCode = "00" | "10" | "20" | string;
export type SrsTabId = "service" | "notice" | "faq" | "deptStatus" | "statistics";

export type SrsFilterState = {
  reqDeptCd: string;
  reqEmpNo: string;
  searchScope: "LOGIN" | "ALL";
  cdStatus: string;
  dtReqFrom: string;
  dtReqTo: string;
  category1: string;
  category2: string;
  category3: string;
  keyword: string;
  includeAllRequests: boolean;
};

export type SrsRequestRow = {
  id: string;
  noReq: string;
  noService: string;
  reqDeptCd: string;
  reqEmpNo: string;
  resEmpNo: string;
  regDate: string;
  doneDate: string;
  dept: string;
  requester: string;
  deadline: string;
  category: string;
  type: string;
  detailType: string;
  categoryCode: string;
  typeCode: string;
  detailTypeCode: string;
  content: string;
  expectDate: string;
  manager: string;
  status: string;
  statusCode: string;
  satisfaction: string;
  requestContent: string;
  serviceContent: string;
};

export type SrsMetricGroup = {
  title: string;
  tone: "blue" | "orange" | "gray";
  items: Array<{
    label: string;
    value: string;
    accent?: boolean;
  }>;
};

export type SrsDepartmentRow = {
  dept: string;
  total: number;
  waiting: number;
  progress: number;
  done: number;
  rate: number;
};

export type SrsStatisticsSummary = {
  total: number;
  pending: number;
  progress: number;
  done: number;
  avgScore: number;
  requestedAvgScore: number;
  receivedAvgScore: number;
  departmentRows: SrsDepartmentRow[];
  categoryRows: Array<{ label: string; count: number; rate: number }>;
  statusRows: Array<{ label: string; count: number; rate: number }>;
  monthlyRows: Array<{ label: string; count: number }>;
};

export type SrsRequestListReq = {
  cdCompany: string;
  loginEmpNo: string;
  loginDeptCd: string;
  reqDeptCd: string;
  reqEmpNo: string;
  searchScope: string;
  cdStatus: string;
  dtReqFrom: string;
  dtReqTo: string;
  category1: string;
  category2: string;
  category3: string;
  keyword: string;
  includeAllRequests: "Y" | "N";
};

export type SrsRequestListRes = {
  cdCompany: string;
  noReq: string;
  noService: string;
  regDate: string;
  doneDate: string;
  dept: string;
  requester: string;
  deadline: string;
  category1: string;
  category1Nm: string;
  category2: string;
  category2Nm: string;
  category3: string;
  category3Nm: string;
  category: string;
  type: string;
  detailType: string;
  content: string;
  expectDate: string;
  manager: string;
  status: string;
  statusNm: string;
  satisfaction: string;
  reqDeptCd: string;
  reqEmpNo: string;
  resDeptCd: string;
  resEmpNo: string;
  subject: string;
  requestContent: string;
  serviceContent: string;
  dtInsert: string;
  dtAccept: string;
  dtEnd: string;
};

export type SrsDeptRequesterReq = {
  cdCompany: string;
  deptId: string;
};

export type SrsDeptListReq = {
  cdCompany: string;
};

export type SrsDeptRes = {
  cdCompany: string;
  deptId: string;
  deptNm: string;
  bizArea: string;
};

export type SrsDeptRequesterRes = {
  cdCompany: string;
  deptId: string;
  userId: string;
  userNm: string;
};

export type SrsRequestDetailReq = {
  cdCompany: string;
  noReq: string;
};

export type SrsRequestInfoRes = {
  cdCompany: string;
  noReq: string;
  reqDeptCd: string;
  reqDeptNm: string;
  reqEmpNo: string;
  reqEmpNm: string;
  resDeptCd: string;
  resDeptNm: string;
  resEmpNo: string;
  resEmpNm: string;
  category1: string;
  category1Nm: string;
  category2: string;
  category2Nm: string;
  category3: string;
  category3Nm: string;
  subject: string;
  content: string;
  cdDay: string;
  cdStatus: string;
  cdStatusNm: string;
  dtWrk: string;
  dtAccept: string;
  dtEnd: string;
  score: number | null;
  noReqPrev: string;
  subjectPrev: string;
  dtInsert: string;
  idInsert: string;
  dtUpdate: string;
  idUpdate: string;
};

export type SrsRequestFileRes = {
  cdCompany: string;
  noReq: string;
  seqFile: number;
  ynDel: string;
  nmFile: string;
};

export type SrsServiceInfoRes = {
  cdCompany: string;
  noReq: string;
  noService: string;
  resDeptCd: string;
  resDeptNm: string;
  resEmpNo: string;
  resEmpNm: string;
  category1: string;
  category1Nm: string;
  category2: string;
  category2Nm: string;
  category3: string;
  category3Nm: string;
  content: string;
  cdDay: string;
  cdStatus: string;
  cdStatusNm: string;
  dtAccept: string;
  dtEnd: string;
  dtInsert: string;
  idInsert: string;
  dtUpdate: string;
  idUpdate: string;
};

export type SrsServiceFileRes = {
  cdCompany: string;
  noReq: string;
  noService: string;
  seqFile: number;
  ynDel: string;
  nmFile: string;
};

export type SrsRequestDetailRes = {
  requestInfo: SrsRequestInfoRes | null;
  requestFileList: SrsRequestFileRes[];
  serviceList: SrsServiceInfoRes[];
  serviceFileList: SrsServiceFileRes[];
};

export type SaveSrsRequestPayload = {
  srsRequestList: Array<{
    cdCompany: string;
    noReq: string;
    reqDeptCd: string;
    reqEmpNo: string;
    resDeptCd: string;
    resEmpNo: string;
    category1: string;
    category2: string;
    category3: string;
    subject: string;
    content: string;
    cdDay: string;
    cdStatus: string;
    dtWrk: string;
    dtAccept: string;
    dtEnd: string;
    score: number;
    noReqPrev: string;
    subjectPrev: string;
    dtInsert: string;
    idInsert: string;
  }>;
  srsRequestFileList: Array<{
    cdCompany: string;
    noReq: string;
    seqFile: number;
    ynDel: string;
    nmFile: string;
    dtInsert: string;
    idInsert: string;
  }>;
};

export type SaveSrsServicePayload = {
  srsServiceList: Array<{
    cdCompany: string;
    noReq: string;
    noService: string;
    resDeptCd: string;
    resEmpNo: string;
    category1: string;
    category2: string;
    category3: string;
    content: string;
    cdDay: string;
    cdStatus: string;
    dtAccept: string;
    dtEnd: string;
    dtInsert: string;
    idInsert: string;
  }>;
  srsServiceFileList: Array<{
    cdCompany: string;
    noReq: string;
    noService: string;
    seqFile: number;
    ynDel: string;
    nmFile: string;
    dtInsert: string;
    idInsert: string;
  }>;
};

export type SrsUploadFileRes = {
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  previewUrl: string;
  downloadUrl: string;
};

export type SrsBoardListReq = {
  cdCompany: string;
  category?: string;
  keyword?: string;
  includeHidden?: "Y" | "N";
};

export type SrsNoticeItem = {
  cdCompany: string;
  noNotice: string;
  category: string;
  title: string;
  content: string;
  ynTop: "Y" | "N" | string;
  ynPopup: "Y" | "N" | string;
  dtStart: string;
  dtEnd: string;
  viewCnt: number;
  ynUse: "Y" | "N" | string;
  ynDel: "Y" | "N" | string;
  idInsert: string;
  dtInsert: string;
  idUpdate: string;
  dtUpdate: string;
};

export type SrsBoardFileItem = {
  cdCompany: string;
  boardType: string;
  noBoard: string;
  seqFile: number;
  ynDel: "Y" | "N" | string;
  nmFile: string;
  idInsert: string;
  dtInsert: string;
  idUpdate: string;
  dtUpdate: string;
};

export type SrsBoardFileListReq = {
  cdCompany: string;
  boardType: "NOTICE" | "FAQ" | string;
  noBoard: string;
};

export type SaveSrsBoardFilesPayload = {
  cdCompany: string;
  boardType: "NOTICE" | "FAQ" | string;
  noBoard: string;
  loginDeptCd: string;
  loginEmpNo: string;
  fileList: Array<{
    seqFile: number;
    ynDel: "Y" | "N";
    nmFile: string;
  }>;
};

export type SaveSrsNoticePayload = {
  cdCompany: string;
  noNotice: string;
  category: string;
  title: string;
  content: string;
  ynTop: "Y" | "N";
  ynPopup: "Y" | "N";
  dtStart: string;
  dtEnd: string;
  ynUse: "Y" | "N";
  ynDel: "Y" | "N";
  loginDeptCd: string;
  loginEmpNo: string;
};

export type SrsFaqItem = {
  cdCompany: string;
  noFaq: string;
  category: string;
  question: string;
  answer: string;
  sortSeq: number;
  viewCnt: number;
  ynUse: "Y" | "N" | string;
  ynDel: "Y" | "N" | string;
  idInsert: string;
  dtInsert: string;
  idUpdate: string;
  dtUpdate: string;
};

export type SaveSrsFaqPayload = {
  cdCompany: string;
  noFaq: string;
  category: string;
  question: string;
  answer: string;
  sortSeq: number;
  ynUse: "Y" | "N";
  ynDel: "Y" | "N";
  loginDeptCd: string;
  loginEmpNo: string;
};

type SrsState = {
  requestList: SrsRequestListRes[];
  requestDetail: SrsRequestDetailRes | null;
  noticeList: SrsNoticeItem[];
  faqList: SrsFaqItem[];
  boardFileList: SrsBoardFileItem[];
  listLoading: boolean;
  detailLoading: boolean;
  boardLoading: boolean;
  boardFileLoading: boolean;
  requestSaving: boolean;
  serviceSaving: boolean;
  noticeSaving: boolean;
  faqSaving: boolean;
  boardFileSaving: boolean;
  uploadLoading: boolean;
  uploadProgress: number;
  error: string | null;
};

const initialState: SrsState = {
  requestList: [],
  requestDetail: null,
  noticeList: [],
  faqList: [],
  boardFileList: [],
  listLoading: false,
  detailLoading: false,
  boardLoading: false,
  boardFileLoading: false,
  requestSaving: false,
  serviceSaving: false,
  noticeSaving: false,
  faqSaving: false,
  boardFileSaving: false,
  uploadLoading: false,
  uploadProgress: 0,
  error: null,
};

const calculateUploadProgress = (loaded?: number, total?: number) => {
  if (!loaded || !total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ errorMessage?: string }>;
  return axiosError?.response?.data?.errorMessage || fallback;
};

export const fetchSrsRequestList = createAsyncThunk<SrsRequestListRes[], SrsRequestListReq>(
  "srs/requestList",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/requestList", payload);
      return response.data as SrsRequestListRes[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to load request list"));
    }
  }
);

export const fetchSrsDeptRequesters = createAsyncThunk<SrsDeptRequesterRes[], SrsDeptRequesterReq>(
  "srs/deptRequesters",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/requestersByDept", payload);
      return response.data as SrsDeptRequesterRes[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to load department requester list"));
    }
  }
);

export const fetchSrsDeptList = createAsyncThunk<SrsDeptRes[], SrsDeptListReq>(
  "srs/deptList",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/deptList", payload);
      return response.data as SrsDeptRes[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to load department list"));
    }
  }
);

export const fetchSrsRequestDetail = createAsyncThunk<SrsRequestDetailRes, SrsRequestDetailReq>(
  "srs/requestDetail",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/requestDetail", payload);
      return response.data as SrsRequestDetailRes;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to load request detail"));
    }
  }
);

export const saveSrsRequest = createAsyncThunk<number, SaveSrsRequestPayload>(
  "srs/saveRequest",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/saveSrsRequest", payload);
      return response.data as number;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to save request"));
    }
  }
);

export const saveSrsService = createAsyncThunk<number, SaveSrsServicePayload>(
  "srs/saveService",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/saveSrsService", payload);
      return response.data as number;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to save service result"));
    }
  }
);

export const uploadSrsFile = createAsyncThunk<
  SrsUploadFileRes[],
  { deptName: string; userName: string; baseDate?: string; files: File[] }
>("srs/uploadFile", async ({ deptName, userName, baseDate, files }, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append("deptName", deptName);
    formData.append("userName", userName);
    if (baseDate) {
      formData.append("baseDate", baseDate);
    }
    files.forEach((file) => formData.append("files", file));

    const response = await axios.post("/srs/uploadFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 0,
      onUploadProgress: (progressEvent) => {
        thunkAPI.dispatch(setSrsUploadProgress(calculateUploadProgress(progressEvent.loaded, progressEvent.total)));
      },
    });
    return response.data as SrsUploadFileRes[];
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to upload files"));
  }
});

export const downloadSrsFile = createAsyncThunk<Blob, { filePath: string }>(
  "srs/downloadFile",
  async ({ filePath }, thunkAPI) => {
    try {
      const response = await axios.get(`/srs/downloadFile`, {
        params: { filePath },
        responseType: "blob",
      });
      return response.data as Blob;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to download file"));
    }
  }
);

export const previewSrsFile = createAsyncThunk<Blob | null, { filePath: string; bust?: boolean }>(
  "srs/previewFile",
  async ({ filePath, bust }, thunkAPI) => {
    try {
      const response = await axios.get(`/srs/preview`, {
        params: {
          filePath,
          ...(bust ? { _: Date.now() } : {}),
        },
        responseType: "blob",
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      });

      if (response.status === 304) {
        return null;
      }

      return response.data as Blob;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to preview file"));
    }
  }
);

export const fetchSrsNoticeList = createAsyncThunk<SrsNoticeItem[], SrsBoardListReq>(
  "srs/noticeList",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/noticeList", payload);
      return response.data as SrsNoticeItem[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "공지사항을 불러오지 못했습니다."));
    }
  }
);

export const saveSrsNotice = createAsyncThunk<string, SaveSrsNoticePayload>(
  "srs/saveNotice",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/saveNotice", payload);
      return String(response.data || "");
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "공지사항 저장에 실패했습니다."));
    }
  }
);

export const fetchSrsBoardFileList = createAsyncThunk<SrsBoardFileItem[], SrsBoardFileListReq>(
  "srs/boardFileList",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/boardFileList", payload);
      return response.data as SrsBoardFileItem[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "첨부파일을 불러오지 못했습니다."));
    }
  }
);

export const saveSrsBoardFiles = createAsyncThunk<number, SaveSrsBoardFilesPayload>(
  "srs/saveBoardFiles",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/saveBoardFiles", payload);
      return response.data as number;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "첨부파일 저장에 실패했습니다."));
    }
  }
);

export const fetchSrsFaqList = createAsyncThunk<SrsFaqItem[], SrsBoardListReq>(
  "srs/faqList",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/faqList", payload);
      return response.data as SrsFaqItem[];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "FAQ를 불러오지 못했습니다."));
    }
  }
);

export const saveSrsFaq = createAsyncThunk<string, SaveSrsFaqPayload>(
  "srs/saveFaq",
  async (payload, thunkAPI) => {
    try {
      const response = await api.create("/srs/saveFaq", payload);
      return String(response.data || "");
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "FAQ 저장에 실패했습니다."));
    }
  }
);

const srsSlice = createSlice({
  name: "srs",
  initialState,
  reducers: {
    clearSrsError(state) {
      state.error = null;
    },
    clearSrsDetail(state) {
      state.requestDetail = null;
    },
    setSrsUploadProgress(state, action: PayloadAction<number>) {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSrsRequestList.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchSrsRequestList.fulfilled, (state, action: PayloadAction<SrsRequestListRes[]>) => {
        state.listLoading = false;
        state.requestList = action.payload || [];
      })
      .addCase(fetchSrsRequestList.rejected, (state, action) => {
        state.listLoading = false;
        state.requestList = [];
        state.error = (action.payload as string) || "Failed to load request list";
      })
      .addCase(fetchSrsRequestDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchSrsRequestDetail.fulfilled, (state, action: PayloadAction<SrsRequestDetailRes>) => {
        state.detailLoading = false;
        state.requestDetail = action.payload;
      })
      .addCase(fetchSrsRequestDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.requestDetail = null;
        state.error = (action.payload as string) || "Failed to load request detail";
      })
      .addCase(saveSrsRequest.pending, (state) => {
        state.requestSaving = true;
        state.error = null;
      })
      .addCase(saveSrsRequest.fulfilled, (state) => {
        state.requestSaving = false;
      })
      .addCase(saveSrsRequest.rejected, (state, action) => {
        state.requestSaving = false;
        state.error = (action.payload as string) || "Failed to save request";
      })
      .addCase(saveSrsService.pending, (state) => {
        state.serviceSaving = true;
        state.error = null;
      })
      .addCase(saveSrsService.fulfilled, (state) => {
        state.serviceSaving = false;
      })
      .addCase(saveSrsService.rejected, (state, action) => {
        state.serviceSaving = false;
        state.error = (action.payload as string) || "Failed to save service result";
      })
      .addCase(uploadSrsFile.pending, (state) => {
        state.uploadLoading = true;
        state.uploadProgress = 0;
      })
      .addCase(uploadSrsFile.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadSrsFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadProgress = 0;
        state.error = (action.payload as string) || "Failed to upload files";
      })
      .addCase(fetchSrsNoticeList.pending, (state) => {
        state.boardLoading = true;
        state.error = null;
      })
      .addCase(fetchSrsNoticeList.fulfilled, (state, action: PayloadAction<SrsNoticeItem[]>) => {
        state.boardLoading = false;
        state.noticeList = action.payload || [];
      })
      .addCase(fetchSrsNoticeList.rejected, (state, action) => {
        state.boardLoading = false;
        state.noticeList = [];
        state.error = (action.payload as string) || "공지사항을 불러오지 못했습니다.";
      })
      .addCase(saveSrsNotice.pending, (state) => {
        state.noticeSaving = true;
        state.error = null;
      })
      .addCase(saveSrsNotice.fulfilled, (state) => {
        state.noticeSaving = false;
      })
      .addCase(saveSrsNotice.rejected, (state, action) => {
        state.noticeSaving = false;
        state.error = (action.payload as string) || "공지사항 저장에 실패했습니다.";
      })
      .addCase(fetchSrsBoardFileList.pending, (state) => {
        state.boardFileLoading = true;
        state.error = null;
      })
      .addCase(fetchSrsBoardFileList.fulfilled, (state, action: PayloadAction<SrsBoardFileItem[]>) => {
        state.boardFileLoading = false;
        state.boardFileList = action.payload || [];
      })
      .addCase(fetchSrsBoardFileList.rejected, (state, action) => {
        state.boardFileLoading = false;
        state.boardFileList = [];
        state.error = (action.payload as string) || "첨부파일을 불러오지 못했습니다.";
      })
      .addCase(saveSrsBoardFiles.pending, (state) => {
        state.boardFileSaving = true;
        state.error = null;
      })
      .addCase(saveSrsBoardFiles.fulfilled, (state) => {
        state.boardFileSaving = false;
      })
      .addCase(saveSrsBoardFiles.rejected, (state, action) => {
        state.boardFileSaving = false;
        state.error = (action.payload as string) || "첨부파일 저장에 실패했습니다.";
      })
      .addCase(fetchSrsFaqList.pending, (state) => {
        state.boardLoading = true;
        state.error = null;
      })
      .addCase(fetchSrsFaqList.fulfilled, (state, action: PayloadAction<SrsFaqItem[]>) => {
        state.boardLoading = false;
        state.faqList = action.payload || [];
      })
      .addCase(fetchSrsFaqList.rejected, (state, action) => {
        state.boardLoading = false;
        state.faqList = [];
        state.error = (action.payload as string) || "FAQ를 불러오지 못했습니다.";
      })
      .addCase(saveSrsFaq.pending, (state) => {
        state.faqSaving = true;
        state.error = null;
      })
      .addCase(saveSrsFaq.fulfilled, (state) => {
        state.faqSaving = false;
      })
      .addCase(saveSrsFaq.rejected, (state, action) => {
        state.faqSaving = false;
        state.error = (action.payload as string) || "FAQ 저장에 실패했습니다.";
      });
  },
});

export const buildSrsPreviewUrl = (filePath: string) => {
  const baseUrl = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  return `${baseUrl}/srs/preview?filePath=${encodeURIComponent(filePath)}`;
};

export const buildSrsDownloadUrl = (filePath: string) => {
  const baseUrl = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  return `${baseUrl}/srs/downloadFile?filePath=${encodeURIComponent(filePath)}`;
};

export const { clearSrsError, clearSrsDetail, setSrsUploadProgress } = srsSlice.actions;
export default srsSlice.reducer;


