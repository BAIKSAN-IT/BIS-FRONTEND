import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";

import { AppDispatch, RootState } from "../redux/store";
import { LayoutTypes, SideBarTypes } from "../constants/layout";

// components
import TopbarSearch from "../components/TopbarSearch";
import MaximizeScreen from "../components/MaximizeScreen";
import BizAreaDropdown from "../components/BizAreaDropdown";
import FactoryDropdown from "../components/FactoryDropdown";
// import SearchDropdown from '../components/SearchDropdown';
import LanguageDropdown from "../components/LanguageDropdown";
import NotificationDropdown from "../components/NotificationDropdown";
import ProfileDropdown from "../components/ProfileDropdown";

import profilePic from "../assets/images/users/user-1.jpg";
import avatar4 from "../assets/images/users/user-4.jpg";
import pankoWebGnb from "../assets/images/logo/panko_web_gnb.png";
import { useViewport } from "../hooks/useViewPort";
import { changeSidebarType, showRightSidebar } from "../redux/common/layoutSlice";
import VisitedPages from "./VisitedPage";

export interface NotificationItem {
  id: number;
  text: string;
  subText: string;
  icon?: string;
  avatar?: string;
  bgColor?: string;
}

// get the notifications
const Notifications: NotificationItem[] = [
  {
    id: 1,
    text: "Cristina Pride",
    subText: "Hi, How are you? What about our next meeting",
    avatar: profilePic,
  },
  {
    id: 2,
    text: "Caleb Flakelar commented on Admin",
    subText: "1 min ago",
    icon: "mdi mdi-comment-account-outline",
    bgColor: "primary",
  },
  {
    id: 3,
    text: "Karen Robinson",
    subText: "Wow ! this admin looks good and awesome design",
    avatar: avatar4,
  },
  {
    id: 4,
    text: "New user registered.",
    subText: "5 hours ago",
    icon: "mdi mdi-account-plus",
    bgColor: "warning",
  },
  {
    id: 5,
    text: "Caleb Flakelar commented on Admin",
    subText: "1 min ago",
    icon: "mdi mdi-comment-account-outline",
    bgColor: "info",
  },
  {
    id: 6,
    text: "Carlos Crouch liked Admin",
    subText: "13 days ago",
    icon: "mdi mdi-heart",
    bgColor: "secondary",
  },
];

// get the profilemenu
const ProfileMenus = [
  {
    label: "My Account",
    icon: "fe-user",
    redirectTo: "#",
  },
  {
    label: "Settings",
    icon: "fe-settings",
    redirectTo: "/auth/SettingInfo",
  },
  {
    label: "Lock Screen",
    icon: "fe-lock",
    redirectTo: "/auth/lock-screen",
  },
  {
    label: "Logout",
    icon: "fe-log-out",
    redirectTo: "/auth/logout",
  },
];

const otherOptions = [
  {
    id: 1,
    label: "New Projects",
    icon: "fe-briefcase",
  },
  {
    id: 2,
    label: "Create Users",
    icon: "fe-user",
  },
  {
    id: 3,
    label: "Revenue Report",
    icon: "fe-bar-chart-line-",
  },
  {
    id: 4,
    label: "Settings",
    icon: "fe-settings",
  },
  {
    id: 4,
    label: "Help & Support",
    icon: "fe-headphones",
  },
  {
    id: 5,
    label: "Help & Support",
    icon: "fe-headphones",
  },
  {
    id: 6,
    label: "Help & Support",
    icon: "fe-headphones",
  },
];

// get mega-menu options
const MegaMenuOptions = [
  {
    id: 1,
    title: "UI Components",
    menuItems: [
      "Widgets",
      "Nestable List",
      "Range Sliders",
      "Masonry Items",
      "Sweet Alerts",
      "Treeview Page",
      "Tour Page",
    ],
  },
  {
    id: 2,
    title: "Applications",
    menuItems: ["eCommerce Pages", "CRM Pages", "Email", "Calendar", "Team Contacts", "Task Board", "Email Templates"],
  },
  {
    id: 3,
    title: "Extra Pages",
    menuItems: [
      "Left Sidebar with User",
      "Menu Collapsed",
      "Small Left Sidebar",
      "New Header Style",
      "Search Result",
      "Gallery Pages",
      "Maintenance & Coming Soon",
    ],
  },
];

interface TopbarProps {
  hideLogo?: boolean;
  navCssClasses?: string;
  openLeftMenuCallBack?: () => void;
  topbarDark?: boolean;
}

const Topbar = ({ hideLogo, navCssClasses, openLeftMenuCallBack, topbarDark }: TopbarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useViewport();

  const navbarCssClasses: string = navCssClasses || "";
  const containerCssClasses: string = !hideLogo ? "container-fluid" : "";

  const { layoutType, leftSideBarType } = useSelector((state: RootState) => ({
    layoutType: state.Layout.layoutType,
    leftSideBarType: state.Layout.leftSideBarType,
  }));

  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  //  const { bizarea } = useSelector((state: RootState) => ({
  //bizarea: state.Auth.selecetPermission?.cdBizarea,
  //}));

  const { factory } = useSelector((state: RootState) => ({
    factory: state.Auth.selecetPermission?.cdFty,
  }));

  const prevSidebarTypeRef = useRef<SideBarTypes | null>(null);

  /**
   * Toggle the leftmenu when having mobile screen
   */
  const handleLeftMenuCallBack = () => {
    if (width < 1140) {
      if (leftSideBarType === "full") {
        showLeftSideBarBackdrop();
        document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
      } else {
        dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_FULL));
      }
    } else if (leftSideBarType === "condensed") {
      dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_DEFAULT));
    } else if (leftSideBarType === "full") {
      showLeftSideBarBackdrop();
      document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
    } else if (leftSideBarType === "fullscreen") {
      dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_DEFAULT));
      // showLeftSideBarBackdrop();
      document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
    } else {
      dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_CONDENSED));
    }
  };

  // create backdrop for leftsidebar
  function showLeftSideBarBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "custom-backdrop";
    backdrop.className = "offcanvas-backdrop fade show";
    // backdrop.style.zIndex = '999'
    document.body.appendChild(backdrop);

    if (document.getElementsByTagName("html")[0]?.getAttribute("dir") !== "rtl") {
      document.body.style.overflow = "hidden";
      if (width > 1140) {
        document.body.style.paddingRight = "15px";
      }
    }

    backdrop.addEventListener("click", function (e) {
      document.getElementsByTagName("html")[0].classList.remove("sidebar-enable");
      dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_FULL));
      hideLeftSideBarBackdrop();
    });
  }

  function hideLeftSideBarBackdrop() {
    var backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "visible";
    }
  }

  /**
   * Toggles the right sidebar
   */
  const handleRightSideBar = () => {
    dispatch(showRightSidebar());
  };

  /**
   * Toggles the left sidebar width
   */
  // const toggleLeftSidebarWidth = () => {
  //   if (leftSideBarType === 'default' || leftSideBarType === 'compact')
  //     dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_CONDENSED));
  //   if (leftSideBarType === 'condensed') dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_DEFAULT));
  // };

  return (
    <React.Fragment>
      <div className={`navbar-custom ${navbarCssClasses}`}>
        <Row>
          <div className={`topbar ${containerCssClasses}`}>
            <Col lg={8} style={{ display: "flex", alignItems: "center", flexGrow: 0 }}>
              <div className="topbar-menu d-flex align-items-center gap-1" style={{ flexGrow: 0 }}>
                {/*{!hideLogo && (
                  <div className="logo-box">
                    <Link to="/" className="logo logo-dark text-center">
                      <span className="logo-sm">
                        <img src={pankoWebGnb} alt="" height="22" />
                      </span>
                      <span className="logo-lg">
                        <img
                          src={layoutType === LayoutTypes.LAYOUT_TWO_COLUMN ? pankoWebGnb : pankoWebGnb}
                          alt=""
                          height="20"
                        />
                      </span>
                    </Link>
                    <Link to="/" className="logo logo-light text-center">
                      <span className="logo-sm">
                        <img src={pankoWebGnb} alt="" height="22" />
                      </span>
                      <span className="logo-lg">
                        <img
                          src={layoutType === LayoutTypes.LAYOUT_TWO_COLUMN ? pankoWebGnb : pankoWebGnb}
                          alt=""
                          height="20"
                        />
                      </span>
                    </Link>
                  </div>
                )}*/}
                <button className="button-toggle-menu" onClick={handleLeftMenuCallBack}>
                  <i className="mdi mdi-menu" />
                </button>
                {/*<div className="dropdown d-none d-xl-block">
              <CreateNew otherOptions={otherOptions} />
            </div>
            <div className="dropdown dropdown-mega d-none d-xl-block">
              <MegaMenu subMenus={MegaMenuOptions} />
            </div>*/}
                {/* 검색 기록 저장 */}
                <VisitedPages />
              </div>
            </Col>
            <Col lg={4} style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              <ul className="topbar-menu d-flex align-items-center" style={{ flex: "none" }}>
                <li className="app-search">
                  {/* 검색 화면 */}
                  <TopbarSearch />
                </li>
                {/* <li className="dropdown d-inline-block d-lg-none">
              <SearchDropdown />
            </li> */}
                <li className="dropdown d-none d-lg-inline-block">
                  <MaximizeScreen
                    onFullscreenChange={(isFs) => {
                      if (isFs) {
                        // 전체화면 진입: 이전 상태 저장 + 기존 메뉴 토글 이벤트 실행
                        prevSidebarTypeRef.current = leftSideBarType;
                        handleLeftMenuCallBack();
                      } else {
                        // 전체화면 해제: 메뉴도 같이 ‘풀기’ (이전 상태 복원 + 오버레이 정리)
                        if (prevSidebarTypeRef.current) {
                          dispatch(changeSidebarType(prevSidebarTypeRef.current));
                        } else {
                          // 이전 상태가 없다면 기본값으로
                          dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_DEFAULT));
                        }
                        document.getElementsByTagName("html")[0].classList.remove("sidebar-enable");
                        hideLeftSideBarBackdrop(); // 생성돼 있으면 제거
                      }
                    }}
                  />
                </li>
                <Col>
                  <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                    <div className="dropdown">
                      <Link
                        to="/srs/service"
                        className="nav-link waves-effect waves-light dropdown-toggle"
                        id="dropdown-srs"
                        aria-expanded="false"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ top: "0px" }}
                      >
                        <i className="fe-headphones noti-icon font-22"></i>
                      </Link>
                    </div>
                  </li>
                  <p
                    style={{
                      width: "100%",
                      marginTop: "-21px",
                      color: "lightsalmon",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "9.5px",
                      height: "1px",
                    }}
                  >
                    SRS
                  </p>
                </Col>
                <Col>
                  <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                    <BizAreaDropdown />
                  </li>
                  <p
                    style={{
                      width: "100%",
                      marginTop: "-21px",
                      color: "lightsalmon",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "9.5px",
                      height: "1px",
                    }}
                  >
                    {userEnvInfo.nmBizarea}
                  </p>
                </Col>
                <Col>
                  <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                    <FactoryDropdown />
                  </li>
                  <p
                    style={{
                      width: "100%",
                      marginTop: "-21px",
                      color: "lightsalmon",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "9.5px",
                      height: "1px",
                    }}
                  >
                    {userEnvInfo.nmFty}
                  </p>
                </Col>
                <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                  <LanguageDropdown />
                </li>
                <li className="dropdown notification-list">
                  <NotificationDropdown notifications={Notifications} />
                </li>
                <li className="dropdown">
                  <ProfileDropdown
                    profilePic={profilePic}
                    menuItems={ProfileMenus}
                    username={user?.userNm as string}
                    userTitle={"Founder"}
                  />
                </li>
                {/* <li>
              <button
                className="nav-link dropdown-toggle right-bar-toggle waves-effect waves-light btn btn-link shadow-none"
                onClick={handleRightSideBar}
              >
                <i className="fe-settings noti-icon font-22"></i>
              </button>
            </li> */}
              </ul>
            </Col>
          </div>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default Topbar;



