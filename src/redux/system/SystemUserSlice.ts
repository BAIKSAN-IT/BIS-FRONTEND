import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
};

interface UserIdCheckReq {
  userId: string;
}
interface UpdateChangePwdReq {
  loginId: string; // 사용자 ID
  loginPwd: string; // 패스워드
  modId: string; // 수정자
}
/* 사용자 정보 저장 및 업데이트 Req */
interface SaveUserInfoReq {
  userId: string; // 사용자 ID
  deptId: string; // 부서 ID
  userNm: string; // 사용자명
  loginPwd: string; // 패스워드
  loginPwd1: string; // 패스워드
  userNmEng: string; // 사용자명(영문)
  telNo: string; // 전화번호
  faxNo: string; // 팩스번호
  mobileNo: string; // 휴대폰번호
  emailAddr: string; // 메일주소
  useStateCd: string; // 사용여부
  companyId: string; // 회사 ID
  siteCd: string; // 현장코드
  regId: string; // 등록자 ID
  modId: string; // 수정자 ID
  noEmp: string; // EMP_NO
  cdPartner: string; // 거래처코드
  emailAddr1: string; // E-MAIL ADDR1
  dtsStart: string; // START DATE
  dtsEnd: string; // END DATE
  userSw: string; // USER 구분
  guestYn: string; // GUEST 구분
  guestNmPartner: string; // GUEST 거래처명
  guestNmDept: string; // GUEST 부서명
  guestNmPos: string; // GUEST 직책
  remark: string; // REMARK
}

/* 사용자 리스트 조회 Req */
interface UserListReq {
  userId: string; // 사용자ID
  userNm: string; // 사용자 명
  pageNo: number; // 페이지 번호
  pageCount: number; // 순서
  dtsDate: string; // START DATE
  guestYn: string; // GUEST 구분
  useYn: string; // 사용 여부
}

/* 사용자 리스트 조회 Res */
interface UserListRes {
  userId: string; // 사용자ID
  deptId: string; // 부서ID
  userNm: string; // 사용자 명
  userNmEng: string; // 사용자 명(영문)
  cdBizarea: string; // 사업장 코드
  nmBizarea: string; // 사업장 명
  nmDept: string; // 부서명
  telNo: string; // 전화번호
  mobileNo: string; // 휴대폰번호
  faxNo: string; // 팩스번호
  emailAddr: string; // 이메일 주소
  useStateCd: string; // 사용 여부
  emailAddr1: string; // 이메일주소1
  companyId: string; // companyId
  siteCd: string; // 현장코드
  cdCompany: string; // 회사 코드
  noEmp: string; // EMP_NO
  cdPartner: string; // 거래처코드
  dtsStart: string; // START DATE
  dtsEnd: string; // END DATE (예: 99991231)
  userSw: string; // USER 구분
  guestYn: string; // GUEST 구분
  guestNmPartner: string; // GUEST 거래처명
  guestNmDept: string; // GUEST 부서명
  guestNmPos: string; // GUEST 직책
  remark: string; // REMARK
  pageNum: number; // 페이지 번호
  rowNum: number; // 순서
  maxRow: number; // 최대 행 수
}

/* 페이징 사용자 리스트 조회 Req */
interface PagingUserListReq {
  userId: string; // 사용자ID
  userNm: string; // 사용자 명
  pageNo: number; // 페이지 번호
  pageCount: number; // 순서
  dtsDate: string; // START DATE
  guestYn: string; // GUEST 구분
  useYn: string; // 사용 여부
  deptId: string; // 부서 ID
}

/* 페이징 사용자 리스트 조회 Res */
interface PagingUserListRes {
  userId: string;
  deptId: string;
  userNm: string;
  userNmEng: string;
  companyId: string;
  telNo: string;
  mobileNo: string;
  faxNo: string;
  emailAddr: string;
  useStateCd: string;
  cdCompany: string;
  noEmp: string;
  cdPartner: string;
  emailAddr1: string;
  siteCd: string;
  dtsStart: string;
  dtsEnd: string;
  userSw: string;
  guestYn: string;
  guestNmPartner: string;
  guestNmDept: string;
  guestNmPos: string;
  remark: string;
  cdBizarea: string;
  nmBizarea: string;
  cdDept: string;
  nmDept: string;
  useNm: string;
  rowNum: number;
  totalCount: number;
  pageNum: number;
}

/* 사원 번호 정보 조회 조회 Req */
interface EmpListReq {
  noEmp: string; //사원 번호
  cdBizarea: string; //사업장 코드
  cdDept: string; //부서 코드
  pageNo: number; //pageNo
  limit: number; //limit
}

/* 사원 번호 정보 조회 조회 Res */
interface EmpListRes {
  noEmp: string; // 사원 번호
  loginPwd: string; // 로그인 비밀번호
  cdCompany: string; // 회사 코드
  nmKor: string; // 사용자 명(한글)
  nmEng: string; // 사용자 명(영문)
  cdBizarea: string; // 사업장 코드
  cdDept: string; // 부서 코드
  nmDept: string; // 부서 명
  noTel: string; // 전화 번호
  noTelEmer: string; // 비상 전화 번호
  noEmail: string; // 이메일 주소
  totalCount: number; // 전체 건수
  rowNum: number; // 행 번호
}

/* 부서 정보 조회 조회 Req */
interface DeptListReq {
  nmDept: string;
  cdDept: string;
}

/* 부서 정보 조회 조회 Res */
interface DeptListRes {
  cdDept: string;
  cdCompany: string;
  nmDept: string;
  cdBizarea: string;
  rowNum: number;
}

/* 사업장 정보 조회 조회 Res */
interface BizareaListRes {
  cdBizarea: string;
  cdCompany: string;
  nmBizarea: string;
}

/* 거래처 정보 조회 조회 Req */
interface PartnerListReq {
  lnPartner: string;
  cdPartner: string;
  limit: number;
  page: number;
}

/* 거래처 정보 조회 조회 Res */
interface PartnerListRes {
  cdPartner: string;
  cdCompany: string;
  lnPartner: string;
  totalCount: number;
  rowNum: number;
}

/* FACTORY CODE 정보 조회 조회 Req */
interface FactoryCodeInfoReq {
  cdField: string;
  cdSysdef: string;
  cdCompany: string;
  cdPlag1: string;
}

/* FACTORY CODE 정보 조회 조회 Res */
interface FactoryCodeInfoRes {
  cdSysdef: string;
  cdCompany: string;
  nmUsrdef: string;
  nmSysdef: string;
  cdFlag1: string;
  nmSysdefL5: string;
}

/* 사용자 삭제 버튼 클릭시 발생하는 이벤트 API */
interface UpdateUserStatusReq {
  userId: string;
  modId: string;
  dtsEnd: string;
}

/* 사용자 정보 저장 및 업데이트 API */
export const saveUserInfo = createAsyncThunk<AxiosResponse, SaveUserInfoReq>(
  "system/user/saveUserInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/saveUserInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
/* 사용자 패스워드 변경  API */
export const updateUserPwd = createAsyncThunk<AxiosResponse, UpdateChangePwdReq>(
  "system/user/updateUserPwd",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/updateUserPwd", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
/* 사용자 리스트 조회 API */
export const getUserList = createAsyncThunk<AxiosResponse, UserListReq>(
  "system/user/userList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/userList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 사용자 리스트 조회 API */
export const getPagingUserList = createAsyncThunk<AxiosResponse, PagingUserListReq>(
  "system/user/userList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/pagingUserList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 사원 번호 정보 리스트 조회 API */
export const getEmpList = createAsyncThunk<AxiosResponse, EmpListReq>("system/user/empList", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/system/user/empList", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

/* 사용자 ID 중복 체크  */
export const getUserIdDuplicateCheck = createAsyncThunk<AxiosResponse, UserIdCheckReq>(
  "system/user/userIdDuplicateCheck",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/userIdDuplicateCheck", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 부서 정보 조회 조회 API  */
export const getDeptList = createAsyncThunk<AxiosResponse, DeptListReq>(
  "system/user/deptList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/deptList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 사업장 정보 조회 조회 API  */
export const getBizareaList = createAsyncThunk<AxiosResponse>("system/user/bizareaList", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/system/user/bizareaList", arg);

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

/* 거래처 정보 조회 조회 API  */
export const getPartnerList = createAsyncThunk<AxiosResponse, PartnerListReq>(
  "system/user/partnerList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/partnerList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* FACTORY CODE 정보 조회 조회 API  */
export const getFactoryCodeInfo = createAsyncThunk<AxiosResponse, FactoryCodeInfoReq>(
  "system/user/factoryCodeInfo",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/factoryCodeInfo", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 사용자 삭제 버튼 클릭시 발생하는 이벤트 API */
export const updateUserStatus = createAsyncThunk<AxiosResponse, UpdateUserStatusReq>(
  "system/user/userStatus",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/user/userStatus", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const SystemUserSlice = createSlice({
  name: "systemUser",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveUserInfo.pending, (state) => {})
      .addCase(saveUserInfo.fulfilled, (state, action) => {})
      .addCase(saveUserInfo.rejected, (state, action) => {})
      .addCase(getUserList.pending, (state) => {})
      .addCase(getUserList.fulfilled, (state, action) => {})
      .addCase(getUserList.rejected, (state, action) => {})
      .addCase(getUserIdDuplicateCheck.pending, (state) => {})
      .addCase(getUserIdDuplicateCheck.fulfilled, (state, action) => {})
      .addCase(getUserIdDuplicateCheck.rejected, (state, action) => {})
      .addCase(getDeptList.pending, (state) => {})
      .addCase(getDeptList.fulfilled, (state, action) => {})
      .addCase(getDeptList.rejected, (state, action) => {})
      .addCase(getBizareaList.pending, (state) => {})
      .addCase(getBizareaList.fulfilled, (state, action) => {})
      .addCase(getBizareaList.rejected, (state, action) => {})
      .addCase(getPartnerList.pending, (state) => {})
      .addCase(getPartnerList.fulfilled, (state, action) => {})
      .addCase(getPartnerList.rejected, (state, action) => {})
      .addCase(getFactoryCodeInfo.pending, (state) => {})
      .addCase(getFactoryCodeInfo.fulfilled, (state, action) => {})
      .addCase(getFactoryCodeInfo.rejected, (state, action) => {})
      .addCase(getEmpList.pending, (state) => {})
      .addCase(getEmpList.fulfilled, (state, action) => {})
      .addCase(getEmpList.rejected, (state, action) => {})
      .addCase(updateUserStatus.pending, (state) => {})
      .addCase(updateUserStatus.fulfilled, (state, action) => {})
      .addCase(updateUserStatus.rejected, (state, action) => {});
  },
});

export const { reset } = SystemUserSlice.actions;

export default SystemUserSlice.reducer;

export type {
  UserListRes,
  PagingUserListRes,
  EmpListRes,
  UserListReq,
  BizareaListRes,
  DeptListRes,
  PartnerListRes,
  SaveUserInfoReq,
  UpdateChangePwdReq,
  FactoryCodeInfoReq,
  FactoryCodeInfoRes,
};
