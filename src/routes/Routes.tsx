import React, { useEffect, useMemo, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addVisitedPage, updatePageLabels } from "../redux/common/visitedPagesSlice";
import { LayoutTypes } from "../constants/layout";
import { AppDispatch, RootState } from "../redux/store";

import DefaultLayout from "../layouts/Default";
import VerticalLayout from "../layouts/Vertical";
import DefaultBar from "../layouts/DefaultBar";
import DetachedLayout from "../layouts/Detached";
import HorizontalLayout from "../layouts/Horizontal/";
import TwoColumnLayout from "../layouts/TwoColumn/";

import {
  authProtectedFlattenRoutes,
  etcProtectedFlattenRoutes,
  factoryProtectedFlattenRoutes,
  publicProtectedFlattenRoutes,
  srsProtectedFlattenRoutes,
  tabletProtectedFlattenRoutes,
} from "./index";

import { api } from "../helpers/api/apiCore";
import { isEmpty } from "../utils/CommonUtil";
import TabletLayout from "../layouts/tablet/TabletLayout";
import FactoryLayout from "../layouts/factory/FactoryLayout";
import { ProgramListRes } from "../redux/system/SystemProgramSlice";
import ReportViewerWrapper from "../components/report/ReportViewerWrapper";
import AuthGuard from "@components/guard/AuthGuard";
import { saveMenuHistory } from "@redux/menu/MenuiHIstorySlice";
import { setUserEnvInfo } from "@redux/tablet/tabletSlice";

interface IRoutesProps {}

const LAST_PRIVATE_PATH_KEY = "pis_last_private_path";

const AllRoutes = (props: IRoutesProps) => {
  const tabletLayout = ["/tablet", "/tablet/home", "/tablet/lineSelection"];
  const factoryLayout = ["/factory", "/factory/home", "/factory/lineSelection"];
  const authLayout = ["/dashboard", "/dashboard/home"];

  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { layout } = useSelector((state: RootState) => ({
    layout: state.Layout,
  }));

  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const { user, userLoggedIn } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    userLoggedIn: state.Auth.userLoggedIn,
  }));

  const { systemProgram, language } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
    language: state.systemProgram.language,
  }));

  const session = useMemo(() => api.getLoggedInUser(), [user, userLoggedIn]);
  const sessionUser = session?.user ?? session;
  const isAuthenticated = userLoggedIn || !isEmpty(user) || !isEmpty(sessionUser);
  const sessionEnvInfo = useMemo(
    () =>
      !isEmpty(sessionUser)
        ? {
            cdCompany: "1000",
            cdBizarea: sessionUser.cdBizarea,
            cdFty: sessionUser.cdFty,
            cdFtyAll: sessionUser.cdFtyAll,
            nmBizarea: sessionUser.nmBizarea,
            nmFty: sessionUser.nmFty,
          }
        : {},
    [sessionUser]
  );
  const effectiveUserEnvInfo = !isEmpty(userEnvInfo) ? userEnvInfo : sessionEnvInfo;

  const prevPath = useRef("");

  const getLayout = () => {
    let layoutCls = TwoColumnLayout;

    switch (layout.layoutType) {
      case LayoutTypes.LAYOUT_HORIZONTAL:
        layoutCls = HorizontalLayout;
        break;
      case LayoutTypes.LAYOUT_DETACHED:
        layoutCls = DetachedLayout;
        break;
      case LayoutTypes.LAYOUT_VERTICAL:
        layoutCls = VerticalLayout;
        break;
      default:
        layoutCls = TwoColumnLayout;
        break;
    }

    return layoutCls;
  };

  const Layout = getLayout();

  const isSrsLoginPath = (path?: string) => String(path || "") === "/auth/login/srs";
  const isSrsPagePath = (path?: string) => {
    const p = String(path || "");
    return p === "/srs" || p.startsWith("/srs/");
  };
  const isLoginPath = (path?: string) => String(path || "").startsWith("/auth/login");
  const isLogoutPath = (path?: string) => String(path || "").startsWith("/auth/logout");
  const isAnySrsPath = (path?: string) => isSrsLoginPath(path) || isSrsPagePath(path);

  const srsPublicRoutes = publicProtectedFlattenRoutes.filter((route) =>
    isSrsLoginPath(route.path as string)
  );

  const normalPublicRoutes = publicProtectedFlattenRoutes.filter(
    (route) => !isAnySrsPath(route.path as string)
  );

  const normalAuthProtectedRoutes = authProtectedFlattenRoutes.filter(
    (route) => !isAnySrsPath(route.path as string)
  );

  const normalEtcProtectedRoutes = etcProtectedFlattenRoutes.filter(
    (route) => !isAnySrsPath(route.path as string)
  );

  const normalFactoryProtectedRoutes = factoryProtectedFlattenRoutes.filter(
    (route) => !isAnySrsPath(route.path as string)
  );

  const normalTabletProtectedRoutes = tabletProtectedFlattenRoutes.filter(
    (route) => !isAnySrsPath(route.path as string)
  );

  const onlySrsProtectedRoutes = srsProtectedFlattenRoutes.filter(
    (route) => route.element && isSrsPagePath(route.path as string)
  );

  useEffect(() => {
    if (isLoginPath(location.pathname)) return;
    if (isLogoutPath(location.pathname)) return;
    if (!isAuthenticated) return;

    sessionStorage.setItem(
      LAST_PRIVATE_PATH_KEY,
      `${location.pathname}${location.search}${location.hash}`
    );
  }, [isAuthenticated, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    const excludedPaths = ["/auth/login", "/auth/logout", "/home", "/auth/login/srs"];

    if (!user) return;
    if (excludedPaths.includes(location.pathname)) return;

    const currentProgram = systemProgram.find(
      (program: ProgramListRes) => program.pageUrl === location.pathname
    );

    let pageLabel = "";

    if (currentProgram) {
      switch (language) {
        case "en":
          pageLabel = currentProgram.pageNameEn || currentProgram.pageNameKo;
          break;
        case "vi":
          pageLabel = currentProgram.pageNameVn || currentProgram.pageNameKo;
          break;
        default:
          pageLabel = currentProgram.pageNameKo;
      }
    }

    if (pageLabel !== "") {
      dispatch(
        addVisitedPage({
          path: location.pathname,
          label: pageLabel,
        })
      );
    }

    dispatch(
      saveMenuHistory({
        cdCompany: user.companyId,
        noEmp: user.userId,
        userNm: user.userNm,
        menuCd: currentProgram?.pgmNo ?? "",
        menuNm: pageLabel || location.pathname,
        menuUrl: location.pathname,
        idInsert: user.userId,
      })
    );
  }, [location.pathname, systemProgram, language, dispatch, user]);

  useEffect(() => {
    dispatch(
      updatePageLabels({
        systemProgram,
        language,
      })
    );
  }, [language, systemProgram, dispatch]);

  useEffect(() => {
    if (!isEmpty(userEnvInfo) || isEmpty(sessionEnvInfo)) return;

    dispatch(setUserEnvInfo(sessionEnvInfo));
  }, [dispatch, sessionEnvInfo, userEnvInfo]);

  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/report-viewer"
          element={
            <DefaultBar {...props}>
              <ReportViewerWrapper />
            </DefaultBar>
          }
        />

        {/* SRS LOGIN: ?ˆì´?„ì›ƒ ?†ì´ ?¨ë… ?Œë” */}
        {srsPublicRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={`srs-public-${idx}`} />
        ))}

        {/* ETC ROUTES */}
        {normalEtcProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<DefaultBar {...props}>{route.element}</DefaultBar>}
            key={`etc-${idx}`}
          />
        ))}

        {/* PUBLIC ROUTES */}
        {normalPublicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <DefaultLayout {...props} layout={layout}>
                {route.element}
              </DefaultLayout>
            }
            key={`public-${idx}`}
          />
        ))}

        {/* AUTH PROTECTED ROUTES */}
        {normalAuthProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              api.isUserAuthenticated() === false ? (
                <Navigate
                  to={{
                    pathname: "/auth/login",
                    search: "next=" + route.path,
                  }}
                  replace
                />
              ) : authLayout.includes(route.path as string) ? (
                <DefaultBar {...props}>{route.element}</DefaultBar>
              ) : (
                <Layout {...props}>{route.element}</Layout>
              )
            }
            key={`auth-${idx}`}
          />
        ))}

        {/* FACTORY ROUTES */}
        <Route element={<AuthGuard loginPath="/auth/login/factory" />}>
          {normalFactoryProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                factoryLayout.includes(route.path as string) ? (
                  <DefaultBar {...props}>{route.element}</DefaultBar>
                ) : (
                  <FactoryLayout {...props} path={route.path as string}>
                    {route.element}
                  </FactoryLayout>
                )
              }
              key={`factory-${idx}`}
            />
          ))}
        </Route>

        {/* TABLET ROUTES */}
        {normalTabletProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              isEmpty(api.getLoggedInUser()) ||
              isEmpty(effectiveUserEnvInfo) ||
              !isAuthenticated ? (
                <Navigate
                  to={{
                    pathname: "/auth/login/tablet",
                    search: "next=" + route.path,
                  }}
                  replace
                />
              ) : tabletLayout.includes(route.path as string) ? (
                <DefaultBar {...props}>{route.element}</DefaultBar>
              ) : (
                <TabletLayout {...props}>{route.element}</TabletLayout>
              )
            }
            key={`tablet-${idx}`}
          />
        ))}

        {/* SRS ROUTES */}
        <Route element={<AuthGuard loginPath="/auth/login/srs" />}>
          {onlySrsProtectedRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`srs-${idx}`} />
          ))}
        </Route>

        <Route path="/*" element={"Webpage not found!!"} />
      </Routes>
    </React.Fragment>
  );
};

export default AllRoutes;





