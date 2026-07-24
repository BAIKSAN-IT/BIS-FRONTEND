import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle, styled } from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import home from "../../assets/images/tablet/home_btn.png";
import { isEmpty } from "../../utils/CommonUtil";
import {
  getLineList,
  getTimeList,
  setLineInfo,
} from "../../redux/tablet/tabletSlice";
import { FactoryLineData, Payload } from "../../constants/common/common";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
  }

  @media (max-width: 1024px) {
    body {
      min-height: 600px;
    }
  }

  @media (min-width: 200px) and (max-width: 1000px) {
    body {
      min-height: 800px;
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

    .title_bar {
      text-align: left;
      margin-left: 10px;
      font-size: 35px;
      font-weight: bold;
      color: black;
      margin-bottom: 15px;
    }
  }
`;

const MainBtnArea = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  font-size: 40px;
  font-weight: bold;
  align-items: center;
  text-align: center;
  display: flex;
  height: 70px;
  border-radius: 10px;
  justify-content: center;
  margin-bottom: 10px;
  color: white;
  cursor: pointer;

  span {
    text-align: center;
  }
`;

const TopArea = styled.div`
  border-radius: 20px;
  background-color: aquamarine;
  right: 8%;
  top: 3%;
  position: absolute;
  cursor: pointer;
`;

const LogoutBtnArea = styled.img`
  max-width: 55px;
  max-height: 55px;
`;

const LineSelection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, factoryLineList, userEnvInfo } = useSelector(
    (state: RootState) => ({
      user: state.Auth.user,
      factoryLineList: state.Tablet.factoryLineList,
      userEnvInfo: state.Tablet.userEnvInfo,
    })
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [nextPath, setNextPath] = useState<string>("/factory");

  useEffect(() => {
    const next = searchParams.get("next");
    const processGbn = searchParams.get("processGbn");
    const selectLine = searchParams.get("selectLine");

    if (!isEmpty(userEnvInfo) && !isEmpty(processGbn)) {
      let params = {
        ...userEnvInfo,
        processGbn: processGbn as string,
      };
      dispatch(getLineList(params)).then((res) => {
        const payload = res.payload as Payload;

        if (
          payload.status === 200 &&
          !isEmpty(payload?.data) &&
          !isEmpty(selectLine)
        ) {
          const line = payload?.data.find(
            (item: FactoryLineData) => item.sewLn === selectLine
          );

          if (!isEmpty(line)) {
            dispatch(setLineInfo(line));
            if (next) {
              navigate(next);
            }
          }
        }
      });
      dispatch(getTimeList(params));
    }

    if (next && !isEmpty(next)) {
      setNextPath(next);
    }
  }, [searchParams]);

  // 서브메뉴 이동
  const goMenu = (line: FactoryLineData) => {
    dispatch(setLineInfo(line));
    navigate(nextPath);
  };

  const goHome = () => {
    navigate("/factory/home");
  };

  // 반복되는 컴포넌트를 렌더링하는 함수
  const renderButtonWithSubMenu = (
    index: number,
    bgColor: string,
    line: FactoryLineData
  ) => {
    return (
      <div style={{ width: "20%" }} key={index}>
        <MainBtnArea bgColor={bgColor} onClick={() => goMenu(line)}>
          <span>{line.sewNm}</span>
        </MainBtnArea>
      </div>
    );
  };

  return (
    <>
      <GlobalStyle />
      <TopArea>
        <LogoutBtnArea src={home} onClick={goHome} alt="Home 버튼" />
      </TopArea>

      <div className="container">
        <div className="row" style={{ zIndex: "1", position: "sticky" }}>
          {factoryLineList.map((line, idx) => {
            if (line) {
              return renderButtonWithSubMenu(idx, "teal", line);
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
};

export default LineSelection;
