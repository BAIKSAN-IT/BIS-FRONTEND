import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";
import { BuyerInfo, CodeParam } from "../../constants/common/common";

interface State {
  buyerList: Array<BuyerInfo>;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  buyerList: [],
  loading: false,
  error: null,
};

/* 코드 조회 API Req*/
interface CommonPisCodeReq {
  cdCompany: string; // 회사코드(1000)
  cdField: string; // 대분류코드
}

interface CommonSaveEapprovalReq {
  cdKey1: string; // 회사코드
  cdKey2: string; // 업종코드
  cdKey3: string; // 타이틀
  nmTitle: string; // 문서 제목
  dcHtml: string; // 문서 내용 (HTML)
  cdJobclass: string; // 업무구분 코드
  idUser: string; // 등록자 ID
  nwTitle: string; // NAVER WORKS 전송용 제목
}

interface CommonEApprovalReq {
  noDocu: string;
}

interface CommonEApprovalRes {
  cdApproval: string;
  cdStatus: string;
  acctNoDocu: string;
}
/* 코드 조회 API Res*/
interface CommonPisCodeRes {
  cdCompany: string; // 회사코드(1000)
  cdField: string; // 대분류코드
  nmField: string; // 대분류명(KO)
  nmFieldEn: string; // 대분류명(EN)
  nmFieldJp: string; // 대분류명(JP)
  nmFieldCh: string; // 대분류명(CH)
  nmFieldL1: string; // 대분류명확장1
  nmFieldL2: string; // 대분류명확장2
  nmFieldL3: string; // 대분류명확장3
  nmFieldL4: string; // 대분류명확장4
  nmFieldL5: string; // 대분류명확장5
  fgSyscode: string; // SYSTEM코드여부
  remark: string; // 참고사항
  idInsert: string; // 등록자 ID
  dtsInsert: string; // 등록일시
  idUpdate: string; // 수정자 ID
  dtsUpdate: string; // 수정일시
}

/* 코드 상세 조회 API Req*/
interface CommonPisCodeDetailReq {
  cdCompany: string;
  cdField: string;
  cdSysdef: string;
  cdFlag1: string;
}

/* 코드 상세 조회 API Res*/
interface CommonPisCodeDetailRes {
  cdCompany: string;
  cdField: string;
  cdSysdef: string;
  nmSysdef: string;
  nmSysdefEn: string;
  nmSysdefL1: string;
  nmSysdefL2: string;
  nmSysdefL3: string;
  nmSysdefL4: string;
  nmSysdefL5: string;
  cdHigh: string;
  cdUsrdef: string;
  nmUsrdef: string;
  nmUsrdefEn: string;
  nmUsrdefL1: string;
  nmUsrdefL2: string;
  fgSyscode: string;
  cdFlag1: string;
  cdFlag2: string;
  cdFlag3: string;
  noOrder: string;
  useYn: string;
  remark: string;
  idInsert: string;
  dtsInsert: string;
  idUpdate: string;
  dtsUpdate: string;
}

/* 스타일 목록 req */
interface PisStyleListReq {
  cdCompany: string; // 회사 코드
  noStyle: string; // 스타일 번호
  nmBuyer: string; // 구매자명
  nmBrand: string; // 브랜드명
  nmItem: string; // 품목명
  lang: string; // 언어
}

/* 스타일 목록 res */
interface PisStyleListRes {
  seqStyle: number; // 스타일 순번
  noStyle: string; // 스타일 번호
  noStyleO: string; // 원래 스타일 번호
  nmStyle: string; // 스타일 이름
  cdItem: string; // 품목 코드
  nmItem: string; // 품목명
  cdBuyer: string; // 구매자 코드
  nmBuyer: string; // 구매자명
  cdBrand: string; // 브랜드 코드
  nmBrand: string; // 브랜드명
  qtOrd: number; // 주문 수량
  amOrd: number; // 주문 금액
}

/* 브랜드 목록 Req */
interface PisBrandListReq {
  cdCompany: string; //회사코드
  nmBrand: string; //브랜드명
  nmBuyer: string; //바이어명
  lang: string; //언어
}

/* 브랜드 목록 Res */
interface PisBrandListRes {
  cdBrand: string; //브랜드코드
  nmBrand: string; //브랜드명
  cdBuyer: string; //바이어코드
  nmBuyer: string; //바이어명
  rowNum: number; //순번
}

/* 바이어 목록 Req */
interface PisBuyerListReq {
  cdCompany: string; //회사코드
  cdBuyer: string; // 바이어코드
  nmBuyer: string; //바이어명
  lang: string; //언어
}

/* 바이어 목록 Res */
interface PisBuyerListRes {
  cdBuyer: string; //바이어코드
  nmBuyer: string; //바이어명
  rowNum: number; //순번
}

/* 아이템 목록 Req */
interface PisItemListReq {
  cdCompany: string; //회사코드
  cdItem: string; //회사코드
  nmItem: string; //아이템명
  lang: string; //언어
}

/* 아이템 목록 Res */
interface PisItemListRes {
  cdItem: string; //아이템코드
  nmItem: string; //아이템명
  rowNum: number; //순번
}

/*아이템 목록 Req*/
interface CommonNeoeCodeReq {
  cdField: string;
  cdSysdef: string;
  cdCompany: string;
  cdFlag1: string;
  fg1Syscode: string;
}

/* 아이템 목록 Res */
interface CommonNeoeCodeRes {
  cdField: string;
  cdSysdef: string;
  nmSysdef: string;
  useYn: string;
  cdFlag1: string;
  cdFlag2: string;
  cdFlag3: string;
  nmSysdefE: string;
  nmSysdefV: string;
  fg1Syscode: string;
  cdUsrdef: string;
  nmUsrdef: string;
}

export const saveEApprovalHtml = createAsyncThunk<AxiosResponse, CommonSaveEapprovalReq>(
  "common/saveEApprovalHtml",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/saveEApprovalHtml", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getEApproval = createAsyncThunk<AxiosResponse, CommonEApprovalReq>(
  "common/getEApproval",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/getEApproval", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getCommonRejectCode = createAsyncThunk<AxiosResponse, CodeParam>(
  "common/reject/code",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/reject/code", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getCommonNeoeCodeDtlList = createAsyncThunk<AxiosResponse, CommonNeoeCodeReq>(
  "common/neoe/code/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/neoe/code/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndProcessCodeDtlList = createAsyncThunk<AxiosResponse, CommonNeoeCodeReq>(
  "common/neoe/process/code/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/neoe/process/code/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getCommonCodeList = createAsyncThunk<AxiosResponse, CommonPisCodeReq>(
  "common/code/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/code/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getCommonCodeDetailList = createAsyncThunk<AxiosResponse, CommonPisCodeDetailReq>(
  "common/code/detailList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/code/detailList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getStyleList = createAsyncThunk<AxiosResponse, PisStyleListReq>(
  "common/style/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/style/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getBrandList = createAsyncThunk<AxiosResponse, PisBrandListReq>(
  "common/brand/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/brand/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getBuyerList = createAsyncThunk<AxiosResponse, PisBuyerListReq>(
  "common/buyer/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/buyer/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getItemList = createAsyncThunk<AxiosResponse, PisItemListReq>(
  "common/item/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/common/item/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getBuyerInfo = createAsyncThunk<AxiosResponse>("common/buyer/info", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/common/buyer/info", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCommonRejectCode.pending, (state) => {})
      .addCase(getCommonRejectCode.fulfilled, (state, action) => {})
      .addCase(getCommonRejectCode.rejected, (state, action) => {})
      .addCase(getBuyerInfo.pending, (state) => {})
      .addCase(getBuyerInfo.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          state.buyerList = action.payload.data;
          state.loading = false;
          state.error = null;
        }
      })

      .addCase(getBuyerInfo.rejected, (state, action) => {});
  },
});

export const { reset } = commonSlice.actions;

export type {
  CommonEApprovalRes,
  CommonSaveEapprovalReq,
  CommonPisCodeDetailRes,
  CommonPisCodeRes,
  PisBrandListRes,
  PisItemListRes,
  PisStyleListRes,
  PisBuyerListRes,
  CommonNeoeCodeRes,
  PisBrandListReq,
};
export default commonSlice.reducer;
