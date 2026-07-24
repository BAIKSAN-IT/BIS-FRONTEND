import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import cookie from "react-cookies";

import { getVtnTime, isEmpty } from "@utils/CommonUtil";

import { AppDispatch, RootState } from "@redux/store";
import { setUserEnvInfo } from "@redux/tablet/tabletSlice";
import { loginUser, restoreAuthSession } from "@redux/common/authSlice";
import { initializeVisitedPages } from "@redux/common/visitedPagesSlice";
import { api, setAuthorization } from "@helpers/api/apiCore";

import { FormInput } from "../../../components/";
import AuthLayout from "@pages/auth/AuthLayout";

import { Payload } from "@constants/common/common";

interface UserData {
  userId: string;
  userPassword: string;
  userSe: string;
  companyType: string;
  userType: string;
  saveUserInfo: boolean;
  language: string;
  loginType: string;
}

const BottomLink = () => {
  return (
    <Row className="mt-3">
      <Col className="text-center">
        <p>
          <Link to="/auth/forget-password" className="text-white-50 ms-1">
            비밀번호를 잊으셨나요?
          </Link>
        </p>
      </Col>
    </Row>
  );
};

const LoginSrs = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { error } = useSelector((state: RootState) => ({
    error: state.Auth.error,
  }));

  const [userInfo, setUserInfo] = useState<UserData>({
    userId: "",
    userPassword: "",
    userSe: "USR",
    companyType: "buyer",
    userType: "buyer",
    saveUserInfo: false,
    language: "ko",
    loginType: "03",
  });

  const getMovePath = () => {
    const next = location.search.startsWith("?next=")
      ? location.search.slice(6)
      : new URLSearchParams(location.search).get("next");

    if (next?.startsWith("/auth/logout") || next?.startsWith("/auth/login")) {
      return "/srs/service";
    }

    if (next && (next === "/srs" || next.startsWith("/srs/"))) {
      return next;
    }

    return "/srs/service";
  };

  useEffect(() => {
    const session = api.getLoggedInUser();
    const sessionUser = session?.user ?? session;

    if (!sessionUser) return;

    dispatch(restoreAuthSession(session));

    const token = session?.token ?? sessionUser.token ?? null;
    if (token) {
      setAuthorization(token);
    }

    navigate(getMovePath(), { replace: true });
  }, [dispatch, navigate, location.search]);

  const setCookie = (name: string, data: UserData) => {
    const expires = new Date(getVtnTime());
    expires.setDate(expires.getDate() + 7);

    if (data.saveUserInfo) {
      cookie.save(name, data, { path: "/", expires, secure: false });
    } else {
      cookie.remove(name, { path: "/" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    setUserInfo((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const onSubmit = () => {
    setCookie("userInfo", userInfo);

    const params = {
      userId: userInfo.userId,
      userPassword: userInfo.userPassword,
      userSe: userInfo.userSe,
      companyType: userInfo.companyType,
      userType: userInfo.userType,
      loginType: userInfo.loginType,
    };

    dispatch(loginUser(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload?.status === 200 && !isEmpty(payload.data)) {
        const userDt = payload.data.user;

        if (!isEmpty(userDt)) {
          const envParams = {
            cdCompany: "1000",
            cdBizarea: userDt.cdBizarea,
            cdFty: userDt.cdFty,
            cdFtyAll: userDt.cdFtyAll,
            nmBizarea: userDt.nmBizarea,
            nmFty: userDt.nmFty,
          };

          dispatch(setUserEnvInfo(envParams));
          dispatch(initializeVisitedPages(userDt?.userId));
        }

        navigate(getMovePath(), { replace: true });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <AuthLayout bottomLinks={<BottomLink />}>
      {error && (
        <Alert variant="danger" className="my-2">
          {t(error)}
        </Alert>
      )}

      <Form
        className="authentication-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <FormInput
          label="아이디"
          type="text"
          name="userId"
          placeholder="아이디를 입력하세요"
          value={userInfo.userId}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          containerClass="mb-2"
        />

        <FormInput
          label="비밀번호"
          type="password"
          name="userPassword"
          placeholder="비밀번호를 입력하세요"
          value={userInfo.userPassword}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          containerClass="mb-3"
        />

        <Row>
          <Col style={{ width: "50%", display: "inherit", alignItems: "center" }}>
            <FormInput
              label="계정 저장"
              type="checkbox"
              name="saveUserInfo"
              checked={userInfo.saveUserInfo}
              onChange={handleInputChange}
            />
          </Col>
        </Row>

        <div className="text-center d-grid" style={{ marginTop: "10px" }}>
          <Button variant="primary" type="submit" className="btn btn-primary">
            로그인
          </Button>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default LoginSrs;
