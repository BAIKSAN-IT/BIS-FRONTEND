import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "react-bootstrap";

import { AppDispatch, RootState } from "../../redux/store";
import { FormInput } from "../../components";
import { formatDate, getVtnTime, isEmpty, setFullscreen } from "../../utils/CommonUtil";
import {
  setAutoSaveCnt,
  setHideTopbarPart,
  setLineInfo,
  setWorkerInfo,
  setWorkerList,
  setWorkTime,
  setWorkTimeIdx,
} from "../../redux/tablet/tabletSlice";

import pankoWebGnbWht from "../../assets/images/logo/panko_web_gnb_white.png";
import leftArrow from "../../assets/images/tablet/left-arrow.png";
import rightArrow from "../../assets/images/tablet/right-arrow.png";
import { FactoryLineData, FactoryWorkerData } from "../../constants/common/common";
import TabletTopCommonPopup from "../../pages/tablet/popup/TabletTopCommonPopup";
import KeyboardPopup from "../../components/keyboard/KeyboardPopup";

// Styled Components
const QrArea = styled.div`
  font-size: 30px;
  color: white;
  margin-right: 13px;
`;

const SaveArea = styled.div`
  font-size: 15px;
  color: white;
  margin-right: 13px;
`;

const QrSearchArea = styled.div`
  width: 100%;
`;

const SearchArea = styled.div`
  display: flex;
  padding-top: 2px;
  width: 450px;

  .search-area {
    width: 100%;
    margin-right: 5px;

    & input {
      text-align: center;
    }
  }
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

const SelectArea = styled.div`
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;
`;

const TitleArea = styled.div`
  font-size: 20px;
  color: white;
  cursor: pointer;
  margin-right: 10px;
`;

const TopLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: steelblue;
`;

const BottomLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 15px;
  padding-top: 2px;
`;

const LeftSection = styled.div<{ isQrSearch: boolean }>`
  display: flex;
  align-items: center;
  // width: ${(props) => (props.isQrSearch ? "350px" : "550px")};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const ArrowSection = styled.img`
  max-width: 13px;
  max-height: 13px;
  margin-left: 15px;
`;

interface RadioButtonProps {
  active: boolean;
}

const RadioButton = styled.input.attrs({ type: "radio" })<RadioButtonProps>`
  appearance: none;
  margin: 0 8px 0 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d3d3d3;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:checked {
    background-color: #f1556c;
    border-color: #f1556c;
  }
`;

const Label = styled.label<RadioButtonProps>`
  color: ${(props) => (props.active ? "#f1556c" : "#ffffff")};
  font-size: 20px;
  margin-right: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const TextBox = styled.input`
  padding: 2px;
  font-size: 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 40px;
  text-align: center;
`;

const ButtonType = styled.button`
  padding: 0px 10px;
  font-size: 19px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  margin: 0 5px;
`;

const IncrementButton = styled(ButtonType)`
  border-color: green;
`;

const DecrementButton = styled(ButtonType)`
  border-color: red;
`;

interface LineInfoProps {
  isQrSearch: boolean;
  titleName: string;
  isLineSelect: boolean;
  isTableSelect: boolean;
  selectPass: boolean;
  isInputMode: boolean;
}

interface StInfoProps {
  noStyle: string;
  noPo: string;
  nmClr: string;
}

interface TabletTopbarProps {
  btnHandler: (type: string, val?: any) => void;
  headerInfo?: LineInfoProps;
  stInfo?: StInfoProps;
  reload?: Number;
}

interface SearchData {
  styleNo: string;
  po: string;
  color: string;
}

// 앱 브릿지 함수
declare const Android: {
  hideKeyboard: () => void;
  showKeyboard: () => void;
};

// Main Component
const TabletTopbar: React.FC<TabletTopbarProps> = ({ btnHandler, headerInfo, stInfo, reload }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [searchParams, setSearchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedValue, setSelectedValue] = useState<string>("input");

  const {
    user,
    line,
    selecetPermission,
    worker,
    autoSaveCnt,
    isPass,
    nmPass,
    factoryLineList,
    factoryWorkerList,
    factoryTotalWorkerList,
    factoryTimeList,
    hideTopbarPart,
  } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    line: state.Tablet.line,
    selecetPermission: state.Auth.selecetPermission,
    worker: state.Tablet.worker,
    autoSaveCnt: state.Tablet.autoSaveCnt,
    isPass: state.Tablet.isPass,
    nmPass: state.Tablet.nmPass,
    factoryLineList: state.Tablet.factoryLineList,
    factoryWorkerList: state.Tablet.factoryWorkerList,
    factoryTotalWorkerList: state.Tablet.factoryTotalWorkerList,
    factoryTimeList: state.Tablet.factoryTimeList,
    hideTopbarPart: state.Tablet.hideTopbarPart,
  }));

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(getVtnTime()));
  const [currentTime, setCurrentTime] = useState<string>();
  const [selectIdx, setSelectIdx] = useState<number>(0);

  const [searchArea, setSearchArea] = useState<SearchData>({
    styleNo: "",
    po: "",
    color: "",
  });

  const [inputName, setInputName] = useState<"styleNo" | "po" | "color">("styleNo");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [headerTypeList] = useState(["FoldingActual"]);
  const [saveCntFlag] = useState(["SewingActual", "FinishQc", "FoldingActual"]);
  const [titleTypeList] = useState(["NeedleActual", "FoldingActual"]);

  const [remainingTime, setRemainingTime] = useState(5 * 60);

  const handleInputFocus = (name: "styleNo" | "po" | "color") => {
    setInputName(name);
    setKeyboardVisible(true);
  };

  const handleKeyPopPress = (key: string) => {
    if (key === "Enter") {
      setKeyboardVisible(false);
    } else if (key === "Delete") {
      setSearchArea((prevState) => ({
        ...prevState,
        [inputName]: prevState[inputName].slice(0, -1),
      }));
    } else {
      setSearchArea((prevState) => ({
        ...prevState,
        [inputName]: prevState[inputName] + key,
      }));
    }
  };

  // sewing,qc,folding 마운트 시점
  useEffect(() => {
    if (saveCntFlag.includes(headerInfo?.titleName ?? "")) {
      let timer: NodeJS.Timeout;
      let interval: NodeJS.Timeout;

      const resetTimer = () => {
        if (timer) clearTimeout(timer);
        if (interval) clearInterval(interval);

        setRemainingTime(5 * 60);

        timer = setTimeout(() => {
          btnHandler("3");
          startInterval();
        }, 5 * 60 * 1000);
      };

      const startInterval = () => {
        interval = setInterval(() => {
          btnHandler("3");
          setRemainingTime(5 * 60);
        }, 5 * 60 * 1000);
      };

      // 남은 시간 감소
      const decreaseTime = () => {
        setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      };

      // 1초마다 남은 시간 감소 인터벌
      const timeInterval = setInterval(decreaseTime, 1000);

      // 사용자 활동 감지 및 타이머 리셋
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);

      // 초기 타이머 설정
      resetTimer();

      // 컴포넌트 언마운트 시 타이머, 인터벌, 이벤트 리스너 리셋
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
        clearInterval(timeInterval);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("click", resetTimer);
      };
    }
  }, [headerInfo?.titleName]);

  // 마운트 시점
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date(getVtnTime());
      setCurrentTime(formatDate(now, "3"));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(stInfo)) {
      setSearchArea({
        styleNo: stInfo?.noStyle ?? "",
        po: stInfo?.noPo ?? "",
        color: stInfo?.nmClr ?? "",
      });
    }
  }, [stInfo]);

  useEffect(() => {
    if (Number(reload) > 0) {
      searchQrCode();
    }
  }, [reload]);

  // QR focus event
  useEffect(() => {
    if (inputRef.current && headerInfo?.isQrSearch) {
      const inputElement = inputRef.current;
      handleBlur();
      if (inputElement) {
        inputElement.addEventListener("blur", handleBlur);
      }

      return () => {
        if (inputElement) {
          inputElement.removeEventListener("blur", handleBlur);
        }
      };
    }
  }, [inputRef, headerInfo]);

  // 필수정보 체크 후 이동
  useEffect(() => {
    const isSelect = searchParams.get("isSelect");

    if ((isEmpty(line) || isEmpty(factoryLineList)) && isSelect !== "N") {
      navigate("/tablet/home");
    }
  }, [line, factoryLineList, navigate]);

  // 시간정보 저장
  useEffect(() => {
    if (!isEmpty(selectedDate)) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}${month}${day}`;
      dispatch(setWorkTime(formattedDate));
    }
  }, [selectedDate]);

  // 작업 시간 정보 저장
  useEffect(() => {
    if (!isEmpty(selectedDate)) {
      dispatch(setWorkTimeIdx(selectIdx));
    }
  }, [selectIdx]);

  // 시간 변경에 따른 작업시간 조정
  useEffect(() => {
    if (!isEmpty(currentTime) && !isEmpty(factoryTimeList)) {
      const now = currentTime?.replace(":", "");

      if (now) {
        const selectTimeIdx = factoryTimeList.findIndex((timeData) => {
          const startTime = timeData.startTime ? timeData.startTime : null;
          const endTime = timeData.endTime ? timeData.endTime : null;

          return startTime && endTime && startTime <= now && endTime > now;
        });
        if (selectTimeIdx > -1) {
          setSelectIdx(selectTimeIdx);
        } else {
          const overTimeIdx = factoryTimeList.findIndex((timeData) => {
            const endTime = timeData.endTime ? timeData.endTime : null;
            return endTime && endTime > now;
          });

          if (overTimeIdx > -1) {
            setSelectIdx(overTimeIdx);
          }
        }
      }
    }
  }, [currentTime, factoryTimeList]);

  useEffect(() => {
    if (headerInfo?.isInputMode) {
      btnHandler("4", selectedValue);
    }
  }, [headerInfo?.isInputMode, selectedValue]);

  // qr input영역 focus
  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.focus();

      // hideKeyboard();
    }
  };

  // Qr 영역 Enter 이벤트
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      searchQrCode();
    }
  };

  // qr코드 조회
  const setSearchQrCode = (qr: string) => {
    if (inputRef.current) {
      inputRef.current.value = qr;
    }
    searchQrCode();
  };

  // 시간을 분:초 형식으로 변환하는 함수
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // qr코드 조회 및 작업자 ID 스캔 시
  const searchQrCode = () => {
    const inputValue = inputRef.current?.value;

    // F, 숫자 2자리, 대문자 1자리, 숫자 6자리 정규식
    const qrCodePattern = /^F\d{2}[A-Z]\d{6}$/;
    if (qrCodePattern.test(inputValue ?? "")) {
      const workerCd = inputValue?.slice(-6);
      const foundItem = factoryTotalWorkerList.find((item) => item.cdUser === workerCd) as FactoryWorkerData;

      const newWorkerList = [...factoryWorkerList, foundItem];

      if (inputValue) {
        inputRef.current.value = "";
      }
      if (newWorkerList) {
        dispatch(setWorkerList(newWorkerList));
      }
      if (foundItem) {
        dispatch(setWorkerInfo(foundItem));
      }
    } else {
      if (inputValue) {
        btnHandler("1", inputValue);
        inputRef.current.value = "";
      } else if (headerTypeList.includes(headerInfo?.titleName ?? "")) {
        btnHandler("1");
      } else {
        if (!headerInfo?.isQrSearch) {
          setKeyboardVisible(false);
          const param = {
            ...searchArea,
            dtsWk: formatDate(selectedDate, "2").replaceAll("-", ""),
          };
          btnHandler("1", param);
          setSearchArea({
            styleNo: "",
            po: "",
            color: "",
          });
        }
      }
    }
  };

  // 앱 브릿지 함수
  const hideKeyboard = () => {
    if (typeof Android !== "undefined" && Android != null) {
      Android?.hideKeyboard();
    }
  };

  // 앱 브릿지 함수
  const showKeyboard = () => {
    if (typeof Android !== "undefined" && Android != null) {
      Android?.showKeyboard();
    }
  };

  // 메인화면 이동
  const goHome = () => {
    navigate("/tablet/home");
  };

  // input mode 변경
  const changeInputMode = (mode: string) => {
    resetSearchArea();
    setSelectedValue(mode);
  };

  // 날짜 변경 이벤트
  const onDateChange = (date: string) => {
    if (!isEmpty(date)) {
      setSelectedDate(new Date(date));
    }
  };

  // 시간 format 변경
  const getTimeFormat = (date: string | undefined) => {
    if (!date) {
      return "";
    }
    return `${date.slice(0, 2)}:${date.slice(2, 4)}`;
  };

  // 작업 시간 변경
  const timeSelect = (type: "1" | "2") => {
    setSelectIdx((prevIdx) =>
      type === "1" ? Math.max(prevIdx - 1, 0) : Math.min(prevIdx + 1, factoryTimeList.length - 1)
    );
  };

  // 라인 변경 이벤트
  const changeLine = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedLine = e.target.value;
    const foundItem = factoryLineList.find((item) => item.sewLn === selectedLine) as FactoryLineData;

    dispatch(setLineInfo(foundItem));
  };

  // 작업자 변경 이벤트
  const changeWorker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedLine = e.target.value;
    const foundItem = factoryWorkerList.find((item) => item.cdUser === selectedLine) as FactoryWorkerData;

    dispatch(setWorkerInfo(foundItem));
  };

  // inputValue change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setSearchArea((prevState) => ({
      ...prevState,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const setSaveCnt = (type: string) => {
    if (type === "1") {
      dispatch(setAutoSaveCnt(Math.max((autoSaveCnt ?? 1) - 1, 1)));
    } else if (type === "2") {
      dispatch(setAutoSaveCnt((autoSaveCnt ?? 0) + 1));
    }
  };

  const resetSearchArea = () => {
    setSearchArea({
      styleNo: "",
      po: "",
      color: "",
    });
  };

  /* INPUT MODIFY 모드를 감추기위함. (vinafd 일떄만) */
  useEffect(() => {
    if (user?.userId.startsWith("vinafd")) dispatch(setHideTopbarPart(true));
    else dispatch(setHideTopbarPart(false));
  }, []);
  return (
    <div className="navbar-custom-tablet">
      <TopLayer>
        <LogoArea>
          <span className="logo-lg" onClick={goHome}>
            <img src={pankoWebGnbWht} alt="" height="25" />
          </span>
          <FormInput
            type="date"
            name="date"
            value={formatDate(selectedDate, "2")}
            onChange={(e: any) => onDateChange(e.target.value)}
            style={{
              border: "none",
              background: "none",
              color: "white",
              textAlign: "center",
            }}
          />
        </LogoArea>

        <TopInfoArea>{formatTime(remainingTime)}</TopInfoArea>
        <TopInfoArea>{user?.userNm}</TopInfoArea>
        {(headerInfo?.isLineSelect || headerInfo?.isTableSelect) && (
          <>
            {!isEmpty(factoryWorkerList) && (
              <SelectArea>
                WORKER:
                <FormInput
                  name="select"
                  type="select"
                  className="form-select"
                  style={{
                    border: "none",
                    backgroundColor: "unset",
                    color: "lightsalmon",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                  onChange={(e: any) => changeWorker(e)}
                  value={worker?.cdUser}
                >
                  {factoryWorkerList.map((item, idx) => (
                    <option key={item.cdUser} value={item?.cdUser}>
                      {item.nmSuser}
                    </option>
                  ))}
                </FormInput>
              </SelectArea>
            )}

            {!titleTypeList.includes(headerInfo?.titleName) && (
              <SelectArea>
                {headerInfo?.isLineSelect && "LINE: "}
                {headerInfo?.isTableSelect && "TABLE: "}

                <FormInput
                  name="select"
                  type="select"
                  className="form-select"
                  style={{
                    border: "none",
                    backgroundColor: "unset",
                    color: "lightsalmon",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                  onChange={(e: any) => changeLine(e)}
                  value={line?.sewLn}
                  disabled={!isEmpty(selecetPermission?.cdLn) ? true : false}
                >
                  {factoryLineList.map((item, idx) => (
                    <option key={item.sewLn} value={item?.sewLn}>
                      {item.sewNm}
                    </option>
                  ))}
                </FormInput>
              </SelectArea>
            )}

            <SelectArea>
              {currentTime}&nbsp;&nbsp;|&nbsp;&nbsp;
              <span style={{ color: "lightsalmon" }}>
                {`${getTimeFormat(factoryTimeList[selectIdx]?.startTime)} - ${getTimeFormat(
                  factoryTimeList[selectIdx]?.endTime
                )}`}
              </span>
              <ArrowSection src={leftArrow} alt="left Arrow" onClick={() => timeSelect("1")} />
              <ArrowSection src={rightArrow} alt="left Arrow" onClick={() => timeSelect("2")} />
            </SelectArea>
          </>
        )}
        <TitleArea onClick={setFullscreen}>{headerInfo?.titleName}</TitleArea>
      </TopLayer>

      <BottomLayer>
        <LeftSection isQrSearch={headerInfo?.isQrSearch ? true : false}>
          {headerInfo?.isQrSearch ? (
            <>
              <QrArea>QR</QrArea>
              <QrSearchArea>
                <div className="input-group">
                  <input
                    type="text"
                    ref={inputRef}
                    id="qr_area"
                    className="form-control"
                    inputMode="none"
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="btn waves-light btn-blue"
                    onClick={() => window.ui.modal.open("headerKeyPad")}
                  >
                    <i className="fa fa-search me-3"></i>
                  </button>
                </div>
              </QrSearchArea>
            </>
          ) : !headerTypeList.includes(headerInfo?.titleName ?? "") ? (
            <>
              <SearchArea>
                <div className="search-area">
                  <div className="input-group">
                    <input
                      type="text"
                      id="styleNo"
                      name="styleNo"
                      placeholder="STYLE NO"
                      className="form-control"
                      value={searchArea.styleNo}
                      inputMode="none"
                      onFocus={() => handleInputFocus("styleNo")}
                      onChange={(e: any) => handleInputChange(e)}
                    />
                    <button
                      type="button"
                      className="btn waves-light btn-blue"
                      onClick={() => handleInputFocus("styleNo")}
                    >
                      <i className="fa fa-search me-1"></i>
                    </button>
                  </div>
                </div>
                <div className="search-area">
                  <div className="input-group">
                    <input
                      type="text"
                      id="po"
                      name="po"
                      placeholder="PO#"
                      className="form-control"
                      value={searchArea.po}
                      inputMode="none"
                      onFocus={() => handleInputFocus("po")}
                      onChange={(e: any) => handleInputChange(e)}
                    />
                    <button type="button" className="btn waves-light btn-blue" onClick={() => handleInputFocus("po")}>
                      <i className="fa fa-search me-1"></i>
                    </button>
                  </div>
                </div>
                <div className="search-area">
                  <div className="input-group">
                    <input
                      type="text"
                      id="color"
                      name="color"
                      placeholder="COLOR#"
                      className="form-control"
                      value={searchArea.color}
                      inputMode="none"
                      onFocus={() => handleInputFocus("color")}
                      onChange={(e: any) => handleInputChange(e)}
                    />
                    <button
                      type="button"
                      className="btn waves-light btn-blue"
                      onClick={() => handleInputFocus("color")}
                    >
                      <i className="fa fa-search me-1"></i>
                    </button>
                  </div>
                </div>
              </SearchArea>
              <Button
                variant="success"
                className="waves-effect waves-light btn btn-success"
                style={{ marginTop: "2px" }}
                onClick={() => resetSearchArea()}
              >
                {t("CLEAR")}
              </Button>
            </>
          ) : (
            <></>
          )}
        </LeftSection>

        {headerInfo?.selectPass && (
          <FormInput
            type="text"
            name="text"
            value={nmPass}
            style={{
              fontSize: "25px",
              color: "#f1556c",
              fontWeight: "bold",
              textAlign: "center",
              background: "none",
              border: "none",
              width: "170px",
            }}
            readOnly
          />
        )}

        {headerInfo?.isInputMode && !hideTopbarPart && (
          <Container>
            <Label active={selectedValue === "input"}>
              <RadioButton
                active={selectedValue === "input"}
                value="input"
                checked={selectedValue === "input"}
                onChange={() => changeInputMode("input")}
              />
              INPUT
            </Label>
            <Label active={selectedValue === "modify"}>
              <RadioButton
                active={selectedValue === "modify"}
                value="modify"
                checked={selectedValue === "modify"}
                onChange={() => changeInputMode("modify")}
              />
              MODIFY
            </Label>
          </Container>
        )}

        <RightSection>
          {saveCntFlag.includes(headerInfo?.titleName ?? "") && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <SaveArea>SAVE</SaveArea>
              <DecrementButton onClick={() => setSaveCnt("1")}>-</DecrementButton>
              <TextBox type="text" value={autoSaveCnt} readOnly />
              <IncrementButton onClick={() => setSaveCnt("2")}>+</IncrementButton>
            </div>
          )}

          {headerTypeList.includes(headerInfo?.titleName ?? "") && (
            <Button
              variant="success"
              className="waves-effect waves-light btn btn-success"
              style={{ marginRight: "10px", padding: "15px 15px" }}
              onClick={() => btnHandler("5")}
            >
              &nbsp;&nbsp;{t("CLEAR")}&nbsp;&nbsp;
              <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
                <i className="mdi mdi-alert-circle-outline"></i>
              </span>
            </Button>
          )}
          <Button
            variant="success"
            className="waves-effect waves-light btn btn-success"
            style={{ marginRight: "10px", padding: "15px 15px" }}
            onClick={() => searchQrCode()}
          >
            {t("SEARCH")}
            <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
              <i className="mdi mdi-alert-circle-outline"></i>
            </span>
          </Button>
          <Button
            variant="danger"
            className="waves-effect waves-light btn btn-danger"
            style={{ marginRight: "10px", padding: "15px 15px" }}
            onClick={() => btnHandler("2")}
          >
            {t("DELETE")}
            <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
              <i className="mdi mdi-close-circle-outline"></i>
            </span>
          </Button>
          <Button
            variant="success"
            className="waves-effect waves-light btn btn-success"
            style={{ marginRight: "10px", padding: "15px 15px" }}
            onClick={() => btnHandler("3")}
          >
            &nbsp;&nbsp;{t("SAVE")}&nbsp;&nbsp;
            <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
              <i className="mdi mdi-check-all"></i>
            </span>
          </Button>
        </RightSection>
      </BottomLayer>

      <TabletTopCommonPopup setSearchValue={setSearchQrCode} />

      <KeyboardPopup
        visible={keyboardVisible}
        isUpper={true}
        onKeyPress={handleKeyPopPress}
        onHide={() => setKeyboardVisible(false)}
      />
    </div>
  );
};

export default TabletTopbar;
