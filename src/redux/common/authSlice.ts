import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api, clearRefreshCookie, setAuthorization, setRefreshCookie } from "@helpers/api/apiCore";
import { isEmpty } from "@utils/CommonUtil";
import { AxiosError, AxiosResponse } from "axios";

interface UserData {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
  loginId: string;
  loginPwd: string;
  userGubunCd: string;
  loginLockYn: string;
  userId: string;
  lastLoginDate: string;
  pwdChangeDate: string;
  userNm: string;
  companyId: string;
  deptId: string;
  deptNm: string;
  telNo: string;
  faxNo: string;
  mobileNo: string;
  emailAddr: string;
  posCd: string;
  posNm: string;
  siteUserYn: string;
  siteCd: string;
  siteNm: string;
  gwLoginYn: string;
  ekgrp: string;
  kostl: string;
  cdBizarea: string;
  cdFty: string;
  nmBizarea: string;
  nmFty: string;
  cdFtyAll?: string;
}

interface Permission {
  idUser: string;
  cdBizarea: string;
  cdFty: string;
  pageCode: string;
  pageName: string;
  cdLn: string;
  authOpen: string;
  authSearch: string;
  authSave: string;
  authDelete: string;
  authPrint: string;
  authExcel: string;
}

interface UserRoleGroup {
  roles: string[];
}

interface LoginUserInfo {
  userId: string;
  userPassword: string;
  userSe: string;
  companyType: string;
  userType: string;
  loginType: string;
}

interface ChangePass {
  userId: string;
  userName: string;
  password: string;
  newPassword: string;
  cfmPassword: string;
}

interface UserInfoParam {
  userId?: string;
  loginType?: string;
}

interface AuthState {
  user: UserData | null;
  isFirstLogin: boolean;
  token: string | null;
  permission: Permission[] | null;
  selecetPermission: Permission | null;
  refreshToken: string | null;
  userRoleGroup: UserRoleGroup | null;
  isLogined: boolean;
  isUser: boolean;
  loading: boolean;
  userLoggedIn: boolean;
  userSignUp: boolean;
  resetPasswordSuccess: boolean;
  passwordReset: boolean;
  error: string | null;
}

interface ErrorData {
  errorCode: string;
  errorMessage: string;
}

export const loginUser = createAsyncThunk<AxiosResponse, LoginUserInfo>("user/login", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await api.create("/user/login", arg);
    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const getUserInfo = createAsyncThunk<AxiosResponse, UserInfoParam>("user/info", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;

  try {
    const res = await api.create("/user/info", arg);
    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

export const changePass = createAsyncThunk<AxiosResponse, ChangePass>("/user/changePass", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await api.create("/user/changePass", arg);
    return res;
  } catch (err) {
    return rejectWithValue((err as AxiosError).response?.data);
  }
});

const initialSession = api.getLoggedInUser();
const LAST_PRIVATE_PATH_KEY = "pis_last_private_path";
const initialSessionUser = initialSession?.user ?? initialSession ?? null;
const initialToken = initialSession?.token ?? initialSessionUser?.token ?? null;
const initialRefreshToken = initialSession?.refreshToken ?? initialSessionUser?.refreshToken ?? null;
const initialPermission = initialSessionUser?.permission ?? null;

if (initialToken) {
  setAuthorization(initialToken);
}

const initialState: AuthState = {
  user: initialSessionUser,
  isFirstLogin: true,
  token: initialToken,
  refreshToken: initialRefreshToken,
  permission: initialPermission,
  selecetPermission: null,
  userRoleGroup: null,
  isLogined: !!initialSessionUser,
  isUser: !!initialSessionUser,
  loading: false,
  resetPasswordSuccess: false,
  passwordReset: false,
  userLoggedIn: !!initialSessionUser,
  userSignUp: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState() {
      window.sessionStorage.removeItem("loginId");
      return initialState;
    },
    logoutUser(state) {
      state.user = null;
      state.userLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.permission = null;
      state.selecetPermission = null;
      state.userRoleGroup = null;
      state.isUser = false;
      state.isLogined = false;

      api.setLoggedInUser(null);
      setAuthorization(null);
      clearRefreshCookie();
      window.sessionStorage.removeItem(LAST_PRIVATE_PATH_KEY);
    },
    setIsFirstLogin(state, action: PayloadAction<boolean>) {
      state.isFirstLogin = action.payload;
    },
    setPermission(state, action: PayloadAction<Permission>) {
      state.selecetPermission = action.payload;
    },
    restoreAuthSession(state, action: PayloadAction<any>) {
      const session = action.payload;
      const sessionUser = session?.user ?? session;

      if (!sessionUser) return;

      state.user = sessionUser;
      state.token = session?.token ?? sessionUser.token ?? null;
      state.refreshToken = session?.refreshToken ?? sessionUser.refreshToken ?? null;
      state.permission = sessionUser.permission ?? state.permission;
      state.isLogined = true;
      state.isUser = true;
      state.userLoggedIn = true;
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          if (!isEmpty(action.payload.data)) {
            const permission = action.payload.data.user.permission;

            const loginId = action.payload.data.user.loginId;

            //if (!isEmpty(permission)) {   -- 기존 : 프로그램 사용권한이 없어도 login이 안되는 문제가 있어, Login id로 변경하여 login인 가능하도록 수정함.
            if (!isEmpty(loginId)) {
              api.setLoggedInUser(action.payload.data);

              state.isLogined = true;
              state.isUser = true;
              state.user = action.payload.data.user;
              state.token = action.payload.data.user.token;
              state.permission = permission;
              state.userLoggedIn = true;

              setRefreshCookie(action.payload.data.user.refreshToken);
              setAuthorization(action.payload.data.token);
              state.error = null;
            } else {
              state.error = "The account does not have access permission";
            }
          }
        }
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorData).errorMessage ?? "Failed to login";
      })
      .addCase(getUserInfo.pending, (state) => {})
      .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<AxiosResponse>) => {
        if (action.payload.status === 200) {
          if (!isEmpty(action.payload.data)) {
            const userData = action.payload.data.user;

            state.user = {
              ...state.user,
              ...Object.keys(userData).reduce((acc, key) => {
                const typedKey = key;
                if (userData[typedKey] !== null && userData[typedKey] !== undefined) {
                  acc[typedKey] = userData[typedKey];
                }
                return acc;
              }, {} as any),
            };

            const permission = action.payload.data.user.permission;
            if (!isEmpty(permission)) {
              state.permission = permission;
            } else {
              return initialState;
            }
          } else {
            return initialState;
          }
        }
      })
      .addCase(getUserInfo.rejected, (state, action) => {});
  },
});

export const { resetState, logoutUser, setIsFirstLogin, setPermission, restoreAuthSession, resetAuth } = authSlice.actions;

export default authSlice.reducer;
