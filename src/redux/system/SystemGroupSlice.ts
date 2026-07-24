import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface State {
  loading: boolean;
  error: string | null;
  language: string;
}

const initialState: State = {
  loading: false,
  error: null,
  language: "ko",
};

/* 그룹 저장 및 업데이트 Req */
interface SaveGroupReq {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  groupName: string; // 그룹명
  groupSw: string; // 그룹 사용여부
  remark: string; // 비고
  sysusr: string; // 등록자
  seqNo: number; // 순번
  isNew: boolean; // 신규 여부
}

/* 그룹 유저 저장 및 업데이트 Req */
interface SaveGroupUserReq {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  userId: string; // 사용자 ID
  dtsStart: string; // 시작일시 (YYYYMMDD)
  dtsEnd: string; // 종료일시 (YYYYMMDD)
  idUser: string; // ID
  seqNo: number; // 순번
  isNew: boolean; // 신규 여부
}

/* 그룹 권한 저장 및 업데이트 Req */
interface SaveGroupGrantReq {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  pgmNo: string; // 프로그램 번호
  find: string; // 조회 권한
  newFlag: string; // 신규 권한
  del: string; // 삭제 권한
  sav: string; // 저장 권한
  prt: string; // 출력 권한
  excelDown: string; // 엑셀 다운로드 권한
  excelUp: string; // 엑셀 업로드 권한
  useGrp: string; // 그룹 사용 여부
  copy: string; // 복사 권한
  rowAdd: string; // 행 추가 권한
  rowDel: string; // 행 삭제 권한
  popup: string; // 팝업 권한
  extBtn1: string; // 확장 버튼1 권한
  extBtn2: string; // 확장 버튼2 권한
  extBtn3: string; // 확장 버튼3 권한
  useYn: string; // 사용 여부
  dtsStart: string; // 시작일시 (YYYYMMDD)
  dtsEnd: string; // 종료일시 (YYYYMMDD)
  sysusr: string; // 등록자
  seqNo: number; // 순번
  isNew: boolean; // 신규 여부
}

/* 그룹 조회 Req */
interface GroupInfoReq {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
}

/* 그룹 목록 조회 Req */
interface GroupInfoRes {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  groupName: string; // 그룹명
  groupSw: string; // 그룹 사용 여부
  remark: string; // 비고
  userId: string; // 사용자 ID
  dtsStart: string; // 시작 일시 (YYYYMMDD)
  dtsEnd: string; // 종료 일시 (YYYYMMDD)
  userNm: string; // 사용자명
  deptId: string; // 부서 ID
  nmDept: string; // 부서명
  seqNo: number; // 순번
  isNew: boolean; // 신규 여부
}

/* 그룹 조회 Req */
interface GroupListReq {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  groupName: string; // 그룹명
}

/* 프로그램 목록 조회 Req */
interface GroupListRes {
  cdCompany: string; // 회사 코드
  groupId: string; // 그룹 ID
  groupName: string; // 그룹명
  groupSw: string; // 그룹 사용 여부
  remark: string; // 비고
  seqNo: number; // 순번
  isNew: boolean; // 신규 여부
}

/* 그룹 저장 및 업데이트 API */
export const saveGroup = createAsyncThunk<AxiosResponse, SaveGroupReq>(
  "system/group/saveGroup",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/saveGroup", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹 유저 저장 및 업데이트 API */
export const saveGroupUser = createAsyncThunk<AxiosResponse, SaveGroupUserReq>(
  "system/group/saveGroupUser",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/saveGroupUser", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹 사용자별 권한 저장 및 업데이트 API */
export const saveGroupGrant = createAsyncThunk<AxiosResponse, SaveGroupGrantReq>(
  "system/group/saveGroupGrant",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/saveGroupGrant", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹 목록 조회 API */
export const getGroupList = createAsyncThunk<AxiosResponse, GroupListReq>(
  "system/group/getGroupList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/getGroupList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹별 사용자 목록 조회 API */
export const getGroupInfoList = createAsyncThunk<AxiosResponse, GroupInfoReq>(
  "system/group/getGroupInfoList",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/getGroupInfoList", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹 정보 삭제 API */
export const deleteGroupInfo = createAsyncThunk<AxiosResponse, { cdCompany: string; groupId: string }>(
  "system/group/deleteGroupInfo",
  async ({ cdCompany, groupId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("/system/group/deleteGroupInfo", { cdCompany, groupId });

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 그룹 유저 정보 삭제 API */
export const deleteGroupUserInfo = createAsyncThunk<
  AxiosResponse,
  { cdCompany: string; groupId: string; userId: string }
>("system/group/deleteGroupUserInfo", async ({ cdCompany, groupId, userId }, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/system/group/deleteGroupUserInfo", { cdCompany, groupId, userId });

    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export type {
  GroupListReq,
  GroupListRes,
  GroupInfoRes,
  GroupInfoReq,
  SaveGroupReq,
  SaveGroupUserReq,
  SaveGroupGrantReq,
};
