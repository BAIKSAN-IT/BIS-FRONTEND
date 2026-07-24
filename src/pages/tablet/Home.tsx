import React, { useEffect, useRef, useState } from "react";
import { AppDispatch, RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle, styled } from "styled-components";
import { useNavigate } from "react-router-dom";

import power from "../../assets/images/tablet/power_btn.png";
import warehouse from "../../assets/images/tablet/warehouse_btn.png";
import iron from "../../assets/images/tablet/iron_btn.png";
import cutting from "../../assets/images/tablet/cutting_btn.png";
import folding from "../../assets/images/tablet/folding_btn.png";
import sewing from "../../assets/images/tablet/sewing_btn.png";
import packing from "../../assets/images/tablet/packing_btn.png";
import qc from "../../assets/images/tablet/qc_btn.png";
import storaging from "../../assets/images/tablet/storaging_btn.png";
import relaxing from "../../assets/images/tablet/relaxing_btn.png";
import fabric from "../../assets/images/tablet/fabric_btn.png";
import { getUserInfo, logoutUser, setIsFirstLogin, setPermission } from "../../redux/common/authSlice";
import { resetFactoryLineInfo, resetFactoryWorkerInfo, setAutoSaveCnt } from "../../redux/tablet/tabletSlice";
import { isEmpty } from "../../utils/CommonUtil";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
  }

  @media (max-width: 1024px) {
    body {
      min-height: 800px;
    }
  }

  @media (min-width: 200px) and (max-width: 1000px) {
    body {
      min-height: 1200px;
    }
  }

  #root {
    background-color: var(--color-black);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .container {
    text-align: center;

    .card.preview {
      height: 100px;
      border-radius: 20px;
      justify-content: center;
    }

    li {
      list-style-type: none;
    }

    .logoutBtn {
      position: absolute;
      top: 7%;
      right: 10%;
    }
  }
`;

const LogoutBtnArea = styled.img<{ btnStat: boolean }>`
  max-width: 90px;
  max-height: 90px;
  display: ${(props) => (props.btnStat ? "none" : "block")};
`;

const MainBtnArea = styled.div<{ bgColor: string; btnStat: boolean }>`
  background-color: ${(props) => props.bgColor};
  font-size: 30px;
  font-weight: bold;
  align-items: center;
  text-align: center;
  display: flex;
  height: 80px;
  border-radius: 20px;
  justify-content: center;
  margin-bottom: ${(props) => (props.btnStat ? "10px" : "24px")};
  color: white;

  img {
    max-width: 90px;
    max-height: 90px;
    margin-right: 40px;
    margin-left: 15%;
  }

  span {
    flex-grow: 1;
    text-align: right;
    margin-right: 10%;
  }
`;

const SubBtnArea = styled.ul`
  margin-left: 8rem;
  margin-bottom: 0px;
`;

const SubMenuItem = styled.li<{ backColor: string }>`
  background-color: ${(props) => props.backColor};
  font-size: 20px;
  align-items: center;
  display: flex;
  border-radius: 15px;
  justify-content: center;
  margin-bottom: 10px;
  color: white;
  height: 50px;

  img {
    max-width: 45px;
    max-height: 45px;
    margin-left: 5%;
  }

  span {
    flex-grow: 1;
    text-align: right;
    margin-right: 15%;
  }
`;

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isFirstLogin, permission } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    isFirstLogin: state.Auth.isFirstLogin,
    permission: state.Auth.permission,
  }));

  const [btnStat, setBtnStat] = useState<boolean[]>(Array(8).fill(false));
  const btnRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    const params = {
      userId: user?.userId ?? "",
      loginType: "01",
    };
    dispatch(setIsFirstLogin(false));
    dispatch(getUserInfo(params));
    dispatch(resetFactoryLineInfo());
    dispatch(resetFactoryWorkerInfo());
    dispatch(setAutoSaveCnt(0));
  }, []);

  // 로그인 후 계정 권한에 따른 페이지 이동
  useEffect(() => {
    if (user && isFirstLogin) {
      if (user.userId.startsWith("vina")) {
        if (user.userId.startsWith("vinasi")) {
          const perm = permission?.find((item) => item.pageCode === "010501");
          btnRefs.current[perm?.pageCode ?? ""]?.click();
        } else if (user.userId.startsWith("vinasq")) {
          const perm = permission?.find((item) => item.pageCode === "010502");
          btnRefs.current[perm?.pageCode ?? ""]?.click();
        } else if (user.userId.startsWith("vinafd")) {
          const perm = permission?.find((item) => item.pageCode === "010601");
          btnRefs.current[perm?.pageCode ?? ""]?.click();
        } else if (user.userId.startsWith("vinafq")) {
          const perm = permission?.find((item) => item.pageCode === "010702");
          btnRefs.current[perm?.pageCode ?? ""]?.click();
        }
      }
    }
  }, [user, isFirstLogin]);

  // 버튼 클릭 시 서브메뉴 보이기/감추기
  const btnShowHide = (idx: number) => {
    setBtnStat((prevState) => prevState.map((_, i) => (i === idx ? !prevState[i] : false)));
  };

  // 로그아웃 처리
  const userLogout = () => {
    dispatch(logoutUser());
  };

  // 서브메뉴 이동
  const goSubMenu = (menuCode: string, path?: string) => {
    if (path) {
      const accept = permission?.find((item) => item.pageCode === menuCode);

      if (accept?.authOpen === "Y") {
        dispatch(setPermission(accept));
        navigate(path);
      } else {
        window.ui.modal.open("accessNotAllowedPopup");
      }
    }
  };

  // 반복되는 컴포넌트를 렌더링하는 함수
  const renderButtonWithSubMenu = (
    index: number,
    bgColor: string,
    menuName: string,
    imageSrc: string,
    btnUse: boolean,
    subMenus: {
      path: string;
      img: string;
      menuCode: string;
      subMenuName: string;
      backColor: string;
    }[]
  ) => {
    return (
      <div className="col-lg-6" key={index}>
        <MainBtnArea bgColor={bgColor} btnStat={btnStat[index]} onClick={() => (btnUse ? btnShowHide(index) : null)}>
          <img src={imageSrc} alt="" />
          <span>{menuName}</span>
        </MainBtnArea>

        <SubBtnArea className="sub-menu" style={{ display: btnStat[index] ? "block" : "none" }}>
          {subMenus.map((subMenu, subIndex) => (
            <SubMenuItem
              className="menu-item"
              key={subIndex}
              ref={(el: HTMLLIElement) => (btnRefs.current[subMenu.menuCode] = el)}
              onClick={() => goSubMenu(subMenu.menuCode, subMenu.path)}
              backColor={subMenu.backColor}
            >
              <img src={subMenu.img} alt="" />
              <span>{subMenu.subMenuName}</span>
            </SubMenuItem>
          ))}
        </SubBtnArea>
      </div>
    );
  };

  return (
    <>
      <GlobalStyle />

      <div className="container">
        <div className="logoutBtn">
          <LogoutBtnArea
            src={power}
            alt="로그아웃 버튼"
            /*btnStat={btnStat.some((item, idx) => item)}*/
            btnStat={false}
            onClick={userLogout}
          />
        </div>

        <div className="row" style={{ zIndex: 1, position: "sticky" }}>
          {[
            {
              bgColor: "darkseagreen",
              menuName: "WAREHOUSE",
              imageSrc: warehouse,
              btnUse: false,
              subMenus: [
                // {
                //   path: "",
                //   img: warehouse,
                //   menuCode: 0,
                //   subMenuName: "Submenu 1",
                //   backColor: "slateblue",
                // },
              ],
            },
            {
              bgColor: "teal",
              menuName: "IRON",
              imageSrc: iron,
              btnUse: false,
              subMenus: [
                // {
                //   path: "",
                //   img: warehouse,
                //   menuCode: 0,
                //   subMenuName: "INPUT",
                //   backColor: "darkseagreen",
                // },
                // {
                //   path: "",
                //   img: iron,
                //   menuCode: 0,
                //   subMenuName: "Actual",
                //   backColor: "peru",
                // },
              ],
            },
            {
              bgColor: "goldenrod",
              menuName: "CUTTING",
              imageSrc: cutting,
              btnUse: false,
              subMenus: [
                // {
                //   path: "",
                //   img: fabric,
                //   menuCode: 0,
                //   subMenuName: "Actual",
                //   backColor: "coral",
                // },
              ],
            },
            {
              bgColor: "mediumaquamarine",
              menuName: "FOLDING(RFID)",
              imageSrc: folding,
              btnUse: true,
              subMenus: [
                {
                  /*path: "/tablet/folding/actual?processGbn=0005&nmLine=TABLE&cdPart=FOLD",*/
                  path: "/tablet/lineSelection?next=/tablet/folding/actual&processGbn=0005&nmLine=LINE&cdPart=FOLD",
                  img: folding,
                  menuCode: "010601",
                  subMenuName: "Actual",
                  backColor: "peru",
                },
              ],
            },
            {
              bgColor: "peru",
              menuName: "SEWING",
              imageSrc: sewing,
              btnUse: true,
              subMenus: [
                {
                  path: "/tablet/lineSelection?next=/tablet/sewing/input&processGbn=0005&nmLine=LINE&cdPart=SWIN",
                  img: warehouse,
                  menuCode: "010501",
                  subMenuName: "INPUT",
                  backColor: "darkseagreen",
                },
                {
                  path: "/tablet/lineSelection?next=/tablet/sewing/actual&processGbn=0005&nmLine=LINE&cdPart=SWQC",
                  img: sewing,
                  menuCode: "010502",
                  subMenuName: "Actual",
                  backColor: "peru",
                },
              ],
            },
            {
              bgColor: "slateblue",
              menuName: "NEEDLE / HANG TAG",
              imageSrc: folding,
              btnUse: true,
              subMenus: [
                // {
                //   path: "",
                //   img: warehouse,
                //   menuCode: 0,
                //   subMenuName: "INPUT",
                //   backColor: "darkseagreen",
                // },
                {
                  path: "/tablet/needle/actual?processGbn=0005&nmLine=TABLE&cdPart=NEDL&isSelect=N",
                  img: folding,
                  menuCode: "010401",
                  subMenuName: "Actual",
                  backColor: "peru",
                },
              ],
            },
            {
              bgColor: "lightpink",
              menuName: "QC",
              imageSrc: qc,
              btnUse: true,
              subMenus: [
                // {
                //   path: "",
                //   img: storaging,
                //   menuCode: 0,
                //   subMenuName: "Cutting",
                //   backColor: "slateblue",
                // },
                {
                  path: "/tablet/lineSelection?next=/tablet/sewing/actual&processGbn=0005&nmLine=LINE&cdPart=SWQC",
                  img: relaxing,
                  menuCode: "010701",
                  subMenuName: "QC1 (End Line)",
                  backColor: "cadetblue",
                },
                {
                  path: "/tablet/lineSelection?next=/tablet/finish/qc&processGbn=0007&nmLine=LINE&cdPart=FNQC",
                  img: fabric,
                  menuCode: "010702",
                  subMenuName: "QC2 (Finished)",
                  backColor: "coral",
                },
                {
                  path: "",
                  img: packing,
                  menuCode: "010703",
                  subMenuName: "Defect Control",
                  backColor: "lightsteelblue",
                },
              ],
            },
            {
              bgColor: "lightsteelblue",
              menuName: "PACKING",
              imageSrc: packing,
              btnUse: true,
              subMenus: [
                {
                  path: "/tablet/lineSelection?next=/tablet/packing/actual&processGbn=0011&nmLine=TABLE&cdPart=PACK",
                  img: packing,
                  menuCode: "010801",
                  subMenuName: "Actual",
                  backColor: "peru",
                },
              ],
            },
          ].map((item, index) =>
            renderButtonWithSubMenu(index, item.bgColor, item.menuName, item.imageSrc, item.btnUse, item.subMenus)
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
