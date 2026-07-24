import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle, styled } from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import pankoWebGnbWht from "../../assets/images/logo/panko_web_gnb_white.png";
import { FormInput } from "../../components";
import { formatDate, isEmpty } from "../../utils/CommonUtil";
import {
  getLineList,
  getTimeList,
  getWorkerList,
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

  span {
    text-align: center;
  }
`;

const TopLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: steelblue;

  width: 100%;
  position: absolute;
  top: 0;
`;

const LogoArea = styled.div`
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const TopInfoArea = styled.div`
  font-size: 15px;
  color: white;
`;

const TitleArea = styled.div`
  font-size: 20px;
  margin-right: 30px;
  color: white;
  cursor: pointer;
`;

const LineSelection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, selecetPermission, factoryLineList, userEnvInfo } = useSelector(
    (state: RootState) => ({
      user: state.Auth.user,
      selecetPermission: state.Auth.selecetPermission,
      factoryLineList: state.Tablet.factoryLineList,
      userEnvInfo: state.Tablet.userEnvInfo,
    })
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [nextPath, setNextPath] = useState<string>("/tablet");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [Line, setLine] = useState<string | null>();

  useEffect(() => {
    const next = searchParams.get("next");
    const processGbn = searchParams.get("processGbn");
    const nmLine = searchParams.get("nmLine");
    const cdPart = searchParams.get("cdPart");
    const isSelect = searchParams.get("isSelect");

    if (!isEmpty(nmLine)) {
      setLine(nmLine);

      if (!isEmpty(cdPart)) {
        let params = {
          ...userEnvInfo,
          cdPart: cdPart as string,
        };
        dispatch(getWorkerList(params));
      }
    }

    if (!isEmpty(userEnvInfo) && !isEmpty(processGbn)) {
      let params = {
        ...userEnvInfo,
        processGbn: processGbn as string,
      };

      dispatch(getLineList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (!isEmpty(selecetPermission) && !isEmpty(payload?.data)) {
          const line = payload?.data.find(
            (item: FactoryLineData) => item.sewLn === selecetPermission?.cdLn
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

    if (isSelect === "N") {
      if (next) {
        navigate(next);
      }
    } else {
      if (isEmpty(userEnvInfo) || isEmpty(processGbn)) {
        goHome();
      }
    }
  }, [searchParams, selecetPermission]);

  // 서브메뉴 이동
  const goMenu = (line: FactoryLineData) => {
    dispatch(setLineInfo(line));
    navigate(nextPath);
  };

  const goHome = () => {
    navigate("/tablet/home");
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
      <TopLayer>
        <LogoArea>
          <span className="logo-lg" onClick={goHome}>
            <img src={pankoWebGnbWht} alt="" height="25" />
          </span>
          <FormInput
            type="text"
            name="text"
            value={formatDate(selectedDate, "2")}
            style={{
              fontSize: "15px",
              color: "white",
              textAlign: "center",
              background: "none",
              border: "none",
              width: "125px",
            }}
            readOnly
          />
        </LogoArea>
        <TopInfoArea>{user?.userNm}</TopInfoArea>

        <TitleArea>{Line}</TitleArea>
      </TopLayer>

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
