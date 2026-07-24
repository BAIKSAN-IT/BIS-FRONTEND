import "../../../assets/scss/custom/pages/_tabletMain.scss";
import React, {useEffect, useState} from "react";
import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import {Navigate, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useTranslation} from "react-i18next";
import cookie from "react-cookies";

import {AppDispatch, RootState} from "@redux/store";
import { VerticalForm, FormInput } from "../../../components";

import AuthLayout from "./AuthLayout";
import generateSHA256Hash from "@utils/generateSHA256Hash";
import {getVtnTime, isEmpty, setFullscreen} from "@utils/CommonUtil";

import {createGlobalStyle} from "styled-components";
import {setInitUserEnvInfo, setUserEnvInfo} from "@redux/tablet/tabletSlice";
import {loginUser, logoutUser, restoreAuthSession} from "@redux/common/authSlice";
import {LANGUAGE_SELECT_LIST} from "@constants/common/factory";
import {Payload} from "@constants/common/common";
import {api, setAuthorization} from "@helpers/api/apiCore";

export const GlobalStyle = createGlobalStyle`
  #root {
    height: 100%;
    min-height: 700px;
  }

  .account-pages {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .align_center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    // height: 100%;
  }
`;

// 로그인 정보 타입 정의
interface UserData {
  userId: string;
  userPassword: string;
  userSe: string;
  companyType: string;
  userType: string;
  saveUserInfo: boolean;
  language: string;
  loginType: string; // tablet : 01, factory : 02
}

const Login: React.FC = () => {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const getRedirectUrl = () => {
    const next = location.search.startsWith("?next=")
      ? location.search.slice(6)
      : new URLSearchParams(location.search).get("next");
    const lastPath = sessionStorage.getItem("pis_last_private_path");
    const isInvalidPath = (path?: string | null) =>
      !path || path.startsWith("/auth/logout") || path.startsWith("/auth/login");

    if (!isInvalidPath(next)) return next as string;
    if (!isInvalidPath(lastPath)) return lastPath as string;
    return "/factory/home";
  };
  const redirectUrl = getRedirectUrl();

  const {user, userLoggedIn, loading, error} = useSelector((state: RootState) => ({
    user: state.Auth.user,
    loading: state.Auth.loading,
    error: state.Auth.error,
    userLoggedIn: state.Auth.userLoggedIn,
  }));

  const [userInfo, setUserInfo] = useState<UserData>({
    userId: "",
    userPassword: "",
    userSe: "USR",
    companyType: "buyer",
    userType: "buyer",
    saveUserInfo: false,
    language: "en",
    loginType: "02",
  });

  const [ckCheck, setCkCheck] = useState(false);
  const [cookieValue, setCookieValue] = useState<UserData | {}>({});

  // input값 변경 handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target;
    const isCheckbox = type === "checkbox";

    setUserInfo((prevState) => ({
      ...prevState,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  useEffect(() => {
    getCookie("userInfo");
  }, []);

  useEffect(() => {
    const session = api.getLoggedInUser();
    const sessionUser = session?.user ?? session;

    if (!sessionUser) return;

    dispatch(restoreAuthSession(session));

    const token = session?.token ?? sessionUser.token ?? null;
    if (token) {
      setAuthorization(token);
    }
  }, [dispatch]);

  useEffect(() => {
    if (i18n.language !== userInfo.language) {
      i18n.changeLanguage(userInfo.language);
    }
  }, [userInfo.language]);

  // 로그인 정보 쿠키 불러오기
  const getCookie = (cookieName: string) => {
    const cookieValue = cookie.load(cookieName);

    if (!isEmpty(cookieValue)) {
      setCookieValue(cookieValue);
      if (cookieValue.saveUserInfo) {
        setUserInfo((prevState) => ({
          ...prevState,
          userId: cookieValue.userId,
          userPassword: cookieValue.userPassword,
          saveUserInfo: cookieValue.saveUserInfo,
          language: cookieValue.language,
        }));
      } else {
        setUserInfo((prevState) => ({
          ...prevState,
          saveUserInfo: false,
          language: cookieValue.language,
        }));
      }
      setCkCheck(true);
    }
  };

  // 로그인 정보 쿠키 저장
  const setCookie = (name: string) => {
    const value = {
      userId: userInfo.userId,
      userPassword: userInfo.userPassword,
      saveUserInfo: userInfo.saveUserInfo,
      language: userInfo.language,
    };

    const expires = new Date(getVtnTime());
    expires.setDate(expires.getDate() + 7);

    cookie.remove(name, {path: "/"});
    cookie.save(name, value, {
      path: "/",
      expires,
      secure: false,
    });
  };

  const schemaResolver = yupResolver(
    yup.object().shape({
      userId: yup.string().required(t("Please Insert UserId")),
      userPassword: yup.string().required(t("Please Insert Password")),
    })
  );

  // handle form submission
  const onSubmit = async () => {
    try {
      setFullscreen();
      setCookie("userInfo");

      const params = {
        userId: userInfo.userId,
        userPassword: generateSHA256Hash(userInfo.userPassword),
        userSe: userInfo.userSe,
        companyType: userInfo.companyType,
        userType: userInfo.userType,
        loginType: userInfo.loginType,
      };

      const payload = await dispatch(loginUser(params)).unwrap();

      if (payload.status === 200 && !isEmpty(payload.data)) {

        const userDt = payload.data.user;
        const userPm = payload.data.user.permission;

        if (!isEmpty(userDt)) {
          const env = userPm[0];

          const envParams = {
            cdCompany: "1000",
            cdBizarea: userDt.cdBizarea,
            cdFty: userDt.cdFty,
            cdFtyAll: userDt.cdFtyAll,
            nmBizarea: userDt.nmBizarea,
            nmFty: userDt.nmFty,
          };
          dispatch(setUserEnvInfo(envParams));
          dispatch(setInitUserEnvInfo(envParams));
        }
      }
    } catch (err: any) {
      console.error('login error:', err);
    }
  };

  if (userLoggedIn && user !== null) {
    return <Navigate to={redirectUrl} replace />;
  }

  return (
    <>
      <GlobalStyle/>

      <AuthLayout>
        {error && (
          <Alert variant="danger" className="my-2">
            {t(error)}
          </Alert>
        )}

        <VerticalForm<UserData>
          onSubmit={onSubmit}
          resolver={
            ckCheck && !isEmpty(userInfo.userId) && !isEmpty(userInfo.userPassword) ? undefined : schemaResolver
          }
        >
          <FormInput
            label={t("Username")}
            type="text"
            name="userId"
            placeholder={t("Enter your UserId")}
            value={userInfo.userId}
            onChange={(e) => handleInputChange(e)}
            containerClass={"mb-2"}
          />
          <FormInput
            label={t("Password")}
            type="password"
            name="userPassword"
            placeholder={t("Enter your password")}
            value={userInfo.userPassword}
            onChange={(e) => handleInputChange(e)}
            containerClass={"mb-3"}
          />

          <Row>
            <Col style={{width: "50%", display: "inherit", alignItems: "center"}}>
              <FormInput
                label={t("Save Account")}
                type="checkbox"
                name="saveUserInfo"
                checked={userInfo.saveUserInfo}
                onChange={(e) => handleInputChange(e)}
              />
            </Col>

            <Col style={{width: "50%"}}>
              <Row>
                <Col lg={4} className="align_center">
                  <Form.Label>{t("Language")}</Form.Label>
                </Col>
                <Col lg={8}>
                  <FormInput
                    type="select"
                    name="language"
                    value={userInfo.language}
                    onChange={(e) => handleInputChange(e)}
                  >
                    {LANGUAGE_SELECT_LIST.map((item, idx) => {
                      return (
                        <option key={idx} value={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </FormInput>
                </Col>
              </Row>
            </Col>
          </Row>

          <div className="text-center d-grid" style={{marginTop: "10px"}}>
            <Button variant="primary" type="submit" disabled={loading}>
              {t("LOGIN")}
            </Button>
          </div>
        </VerticalForm>
      </AuthLayout>
    </>
  );
};

export default Login;
