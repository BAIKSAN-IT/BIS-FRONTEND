import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle, styled } from "styled-components";
import { useNavigate } from "react-router-dom";

/* Redux */
import { AppDispatch, RootState } from "@redux/store";
import { logoutUser, setPermission } from "@redux/common/authSlice";
import {
  getBizareaList,
  getFactoryList,
  resetFactoryLineInfo,
  resetFactoryWorkerInfo, resetInitEnvList,
  setUserEnvInfo,
} from "@redux/tablet/tabletSlice";

/* Utils */
import { setExitFullscreen } from "@utils/CommonUtil";
import { factoryMenuType } from "@utils/factoryUtils";
import type { FactoryMenuType } from "@utils/factoryUtils";

/* Component*/
import { FormInput } from "../../components";

/* Image */
import power from "@assets/images/tablet/power_btn.png";

const GlobalStyle = createGlobalStyle`
  html, body {
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
      top: 3%;
      right: 5%;
    }
  }
`;

const SelectArea = styled.div`
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;
`;

const LogoutBtnArea = styled.img<{ btnStat: boolean }>`
  max-width: 80px;
  max-height: 80px;
  display: ${(props) => (props.btnStat ? "none" : "block")};
`;

const MainBtnArea = styled.div<{ bgColor: string; btnStat: boolean }>`
  background-color: ${(props) => props.bgColor};
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 60px;
  border-radius: 20px;
  margin-bottom: ${(props) => (props.btnStat ? "10px" : "15px")};
  color: white;
  cursor: pointer;

  img {
    max-width: 60px;
    max-height: 60px;
    margin: 0 40px 0 15%;
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

  const { permission } = useSelector((state: RootState) => ({
    permission: state.Auth.permission,
  }));

  const [btnStat, setBtnStat] = useState<boolean[]>(Array(factoryMenuType.length).fill(false));
  const { factoryList, initFactoryList, initBizareaList } = useSelector((state: RootState) => ({
    factoryList: state.Tablet.factoryList,
    initFactoryList: state.Tablet.initFactoryList,
    initBizareaList: state.Tablet.initBizareaList,
  }));
  const { userEnvInfo,initUserEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
    initUserEnvInfo: state.Tablet.initUserEnvInfo,
  }));
  // 사용자별 화면 표출 권한 설정
  const [isShowBizareaVisible, setIsShowBizareaVisible] = useState<boolean>(false);
  const [isShowFactoryVisible, setIsShowFactoryVisible] = useState<boolean>(false);
  const btnRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    dispatch(resetFactoryLineInfo());
    dispatch(resetFactoryWorkerInfo());
  }, [dispatch]);

  // 사용자별 화면 표출 권한 설정
  useEffect(() => {
    if(initUserEnvInfo.cdBizarea && initUserEnvInfo.cdFty && initUserEnvInfo.cdFtyAll){
      setIsShowBizareaVisible(false);
      setIsShowFactoryVisible(false);
    }else if(initUserEnvInfo.cdBizarea){
      dispatch(getBizareaList({ cdCompany: userEnvInfo.cdCompany }));
      setIsShowBizareaVisible(false);
      setIsShowFactoryVisible(true);
    }else{
      dispatch(getBizareaList({ cdCompany: userEnvInfo.cdCompany }));
      setIsShowBizareaVisible(true);
      setIsShowFactoryVisible(true);
    }
  }, []);

  useEffect(() => {
    if (initBizareaList.length > 0 && !userEnvInfo.cdBizarea) {
      const first = initBizareaList[0];
      dispatch(setUserEnvInfo({
        ...userEnvInfo,
        cdBizarea: first.code,
        nmBizarea: first.name,
      }));
    }
  }, [initBizareaList]);

  useEffect(() => {
    if (userEnvInfo.cdBizarea) {
      dispatch(getFactoryList({
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
      }));
    }
  }, [userEnvInfo.cdBizarea]);

  useEffect(() => {
    if (factoryList.length > 0 && !userEnvInfo.cdFty) {
      const first = factoryList[0];

      dispatch(setUserEnvInfo({
        ...userEnvInfo,
        cdFty: first.code,
        nmFty: first.name,
      }));
    }
  }, [factoryList]);
  const handleLogout = async () => {
    await setExitFullscreen();
    let envParams = {
      cdCompany: "",
      cdBizarea: "",
      cdFty: "",
      cdFtyAll: '',
      nmBizarea: '',
      nmFty: '',
    };
    dispatch(setUserEnvInfo(envParams));
    dispatch(resetInitEnvList());
    dispatch(logoutUser());
  };

  const btnShowHide = (idx: number) => {
    setBtnStat((s) => s.map((v, i) => (i === idx ? !v : false)));
  };

  const goSubMenu = (menuCode: string, path?: string) => {
    if (!path) return;
    const accept = permission?.find((p) => p.pageCode === menuCode);
    if (accept?.authOpen === "Y") {
      dispatch(setPermission(accept));
      navigate(path);
    } else {
      window.ui.modal.open("accessNotAllowedPopup");
    }
  };
  const renderButtonWithSubMenu = (
    index: number,
    { bgColor, menuCode, menuName, imageSrc, subMenus }: FactoryMenuType
  ) => {
    const cnt = subMenus.length;
    const onlyOne = cnt === 1;
    const many = cnt > 1;

    const onMainClick = () => {
      if (onlyOne) {
        // subMenu 1개 → 바로 이동
        const sm = subMenus[0];
        goSubMenu(sm.menuCode, sm.path);
      } else if (many) {
        // subMenu 2개 이상 → 토글
        btnShowHide(index);
      } else {
        // subMenu 0개 → main 메뉴 자체 경로가 필요하면 여기에 handleNavigate 호출
      }
    };
    return (
      <div className="col-lg-6" key={`${menuCode}-${index}`}>
        <MainBtnArea bgColor={bgColor} btnStat={btnStat[index]} onClick={onMainClick}>
          <img src={imageSrc} alt="" />
          <span>{menuName}</span>
        </MainBtnArea>

        {many && (
          <SubBtnArea style={{ display: btnStat[index] ? "block" : "none" }}>
            {subMenus.map((sm, index) => (
              <SubMenuItem
                key={`${menuCode}-${index}`}
                backColor={sm.backColor}
                ref={(el: any) => (btnRefs.current[sm.menuCode] = el)}
                onClick={() => goSubMenu(sm.menuCode, sm.path)}
              >
                <img src={sm.img} alt="" />
                <span>{sm.subMenuName}</span>
              </SubMenuItem>
            ))}
          </SubBtnArea>
        )}
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
            /*btnStat={btnStat.some((item) => item)}*/
            btnStat={false}
            onClick={handleLogout}
          />
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Bizarea SELECT */}
          {isShowBizareaVisible && (
            <SelectArea style={{ flexDirection: "column" }}>
              <FormInput
                name="bizarea"
                type="select"
                className="form-select"
                style={{
                  border: "none",
                  backgroundColor: "unset",
                  color: "lightskyblue",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
                value={userEnvInfo.cdBizarea || ""}
                onChange={(e: any) => {
                  const cdBizarea = e.target.value;
                  const envParams = {
                    cdCompany: userEnvInfo.cdCompany || "",
                    cdBizarea: cdBizarea,
                    cdFty: "",
                    nmBizarea: initBizareaList.find((x: any) => x.code === cdBizarea)?.name || "",
                    nmFty: "",
                  };
                  dispatch(setUserEnvInfo(envParams));
                  dispatch(
                    getFactoryList({
                      cdCompany: userEnvInfo.cdCompany,
                      cdBizarea: cdBizarea,
                      cdFty: "",
                      cdFtyAll: "",
                    })
                  );
                }}
              >
                {initBizareaList.map((item, idx) => (
                  <option key={idx} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </FormInput>
            </SelectArea>
          )}

          {/* Factory SELECT */}
          {isShowFactoryVisible && (
            <SelectArea style={{ flexDirection: "column" }}>
              <FormInput
                name="factory"
                type="select"
                className="form-select"
                style={{
                  border: "none",
                  backgroundColor: "unset",
                  color: "lightsalmon",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
                value={userEnvInfo.cdFty || ""}
                onChange={(e: any) => {
                  const cdFty = e.target.value;
                  const nmFty = initFactoryList.find((x) => x.code === cdFty)?.name || "";

                  dispatch(
                    setUserEnvInfo({
                      ...userEnvInfo,
                      cdFty: cdFty,
                      nmFty: nmFty,
                    })
                  );
                }}
              >
                {factoryList.map((item, idx) => (
                  <option key={idx} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </FormInput>
            </SelectArea>
          )}

        </div>
        {/* 로그인 시 진입 화면 (메뉴) */}
        <div className="row" style={{ position: "sticky" }}>
          {factoryMenuType.map((item, idx) => renderButtonWithSubMenu(idx, item))}
        </div>
      </div>
    </>
  );
};

export default Home;
