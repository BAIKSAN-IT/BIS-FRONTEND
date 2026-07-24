import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import cookie from "react-cookies";
import Swal from "sweetalert2";
import * as yup from "yup";

/* Utils */
import { getVtnTime, isEmpty } from "../../utils/CommonUtil";

/* Redux */
import { AppDispatch, RootState } from "../../redux/store";
import { setUserEnvInfo } from "../../redux/tablet/tabletSlice";
import { loginUser } from "../../redux/common/authSlice";
import { initializeVisitedPages } from "../../redux/common/visitedPagesSlice";
import { getProgramList, setLanguage, setProgramList } from "../../redux/system/SystemProgramSlice";
import { api, setAuthorization } from "../../helpers/api/apiCore";

/* Component */
import { FormInput } from "../../components/";
import AuthLayout from "./AuthLayout";

/* Common */
import { Payload } from "../../constants/common/common";
import { LANGUAGE_SELECT_LIST } from "../../constants/common/factory";

/* ======================================================== */
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

/* ======================================================== */

const BottomLink = () => {
  const { t } = useTranslation();
  return (
    <Row className="mt-3">
      <Col className="text-center">
        <p>
          <Link to={"/auth/forget-password"} className="text-white-50 ms-1">
            {t("Forgot your password?")}
          </Link>
        </p>
      </Col>
    </Row>
  );
};

const Login = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userLoggedIn, language, loading, error } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    loading: state.Auth.loading,
    error: state.Auth.error,
    userLoggedIn: state.Auth.userLoggedIn,
    language: state.systemProgram.language,
  }));

  /* 유효성 검사 */
  const schemaResolver = yupResolver(
    yup.object().shape({
      userId: yup.string().required(t("Please enter Username")),
      userPassword: yup.string().required(t("Please enter Password")),
    })
  );

  const [programListLoaded, setProgramListLoaded] = useState(false);
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

  const formRef = useRef<{ reset: (values?: any) => void }>(null);

  /* SweetAlert 메시지 */
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };

  /* 쿠키 불러오기 */
  useEffect(() => {
    const cookieValue = cookie.load("userInfo");

    if (cookieValue && cookieValue.saveUserInfo) {
      setUserInfo((prev) => ({
        ...prev,
        userId: cookieValue.userId || "",
        userPassword: cookieValue.userPassword || "",
        saveUserInfo: cookieValue.saveUserInfo,
        language: cookieValue.language || "ko",
      }));
      dispatch(setLanguage(cookieValue.language || "ko"));
      i18n.changeLanguage(cookieValue.language || "ko");
    } else {
      setUserInfo((prev) => ({
        ...prev,
        userId: "",
        userPassword: "",
        saveUserInfo: false,
        language: "ko",
      }));
    }
  }, []);

  /* 쿠키 저장 */
  const setCookie = (name: string, data: UserData) => {
    const expires = new Date(getVtnTime());
    expires.setDate(expires.getDate() + 7);

    if (data.saveUserInfo) {
      cookie.save(name, data, { path: "/", expires, secure: false });
    } else {
      cookie.remove(name, { path: "/" });
    }
  };

  /* input 변경 */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    setUserInfo((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  /* 로그인 submit */
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
        }

        dispatch(
          getProgramList({
            cdUserId: userDt?.userId || "",
            groupId: "",
            cdCompany: userDt?.cdCompany || "",
          })
        )
          .then((res) => {
            const programPayload = res.payload as Payload;

            if (programPayload.status === 200 && programPayload.data.length > 0) {
              dispatch(setProgramList(programPayload.data));
              setProgramListLoaded(true);
            } else {
              showAlert(t("common.confirm.programListNotFound"));
              setProgramListLoaded(false);
            }
          })
          .catch(() => {
            showAlert(t("common.confirm.managerCheck"));
            setProgramListLoaded(false);
          });

        dispatch(initializeVisitedPages(userDt?.userId));
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

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
    return "/";
  };
  const redirectUrl = getRedirectUrl();

  useEffect(() => {
    const session = api.getLoggedInUser();
    const sessionUser = session?.user ?? session;

    if (!sessionUser) return;

    const token = session?.token ?? sessionUser.token ?? null;
    if (token) {
      setAuthorization(token);
    }

    setProgramListLoaded(true);
  }, []);

  return (
    <>
      {(userLoggedIn || user) && programListLoaded && <Navigate to={redirectUrl} />}

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
            label={t("Username")}
            type="text"
            name="userId"
            placeholder={t("Enter your UserId")}
            value={userInfo.userId}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            containerClass="mb-2"
          />

          <FormInput
            label={t("Password")}
            type="password"
            name="userPassword"
            placeholder={t("Enter your password")}
            value={userInfo.userPassword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            containerClass="mb-3"
          />

          <Row>
            <Col style={{ width: "50%", display: "inherit", alignItems: "center" }}>
              <FormInput
                label={t("Save Account")}
                type="checkbox"
                name="saveUserInfo"
                checked={userInfo.saveUserInfo}
                onChange={handleInputChange}
              />
            </Col>

            <Col style={{ width: "60%" }}>
              <Row>
                <Col lg={4} className="align_center mt-1">
                  <Form.Label>{t("Language")}</Form.Label>
                </Col>
                <Col lg={8}>
                  <Form.Select
                    name="language"
                    value={userInfo.language}
                    onChange={(e: any) => {
                      const selectedLanguage = e.target.value;
                      handleInputChange(e);
                      dispatch(setLanguage(selectedLanguage));
                      i18n.changeLanguage(selectedLanguage);
                    }}
                    className="form-select"
                  >
                    {LANGUAGE_SELECT_LIST.map((item, idx) => (
                      <option key={idx} value={item.value}>
                        {t(item.label)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>

          <div className="text-center d-grid" style={{ marginTop: "10px" }}>
            <Button variant="primary" type="submit" className="btn btn-primary">
              {t("LOGIN")}
            </Button>
          </div>
        </Form>
      </AuthLayout>
    </>
  );
};

export default Login;
