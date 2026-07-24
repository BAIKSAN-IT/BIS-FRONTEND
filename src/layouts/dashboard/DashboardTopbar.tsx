import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AppDispatch, RootState } from "../../redux/store";
import { formatDate, formatDateType2, getVtnTime, isEmpty } from "../../utils/CommonUtil";
import pankoWebGnbWht from "../../assets/images/logo/panko_web_gnb_white.png";

const LogoArea = styled.div`
  font-size: 25px;
  color: white;
  display: flex;
  cursor: pointer;
  align-items: center;
  margin-left: 15px;
  position: relative;
`;

const SelectArea = styled.div`
  font-size: 20px;
  color: white;
  display: flex;
  align-items: center;
`;

const LineArea = styled.div`
  font-size: 30px;
  color: white;
  display: flex;
  align-items: center;
  margin-right: 15px;
  position: relative;
`;

const TitleArea = styled.div`
  font-size: 30px;
  color: white;
  margin-right: 10px;
  cursor: pointer;
`;

const TopLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: steelblue;
`;

const PageCntArea = styled.div`
  font-size: 30px;
  color: white;
  display: flex;
  align-items: center;

  & > button {
    background: none;
    border: none;
    color: white;
    font-size: 25px;
    cursor: pointer;
  }
`;

const PageFixArea = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  color: white;
  cursor: pointer;
  margin-right: 10px;

  & > label {
    cursor: pointer;
  }

  input[type="checkbox"] {
    margin-left: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.label<RadioButtonProps>`
  color: ${(props) => (props.active ? "#ffa07a" : "#ffffff")};
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

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
    background-color: #ffa07a;
    border-color: #ffa07a;
  }
`;

const DatePickerOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 90%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 100;
`;

const DatePickerContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 450px;
  position: relative;
`;

const DatePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
`;

const DatePickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
  margin-top: 10px;
`;

const DayHeader = styled.div<{ isSunday: boolean }>`
  font-weight: bold;
  color: ${(props) => (props.isSunday ? "red" : "#555")};
  padding: 4px 0;
`;

const DatePickerDay = styled.div<{ isSelected: boolean; isSunday: boolean }>`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => (props.isSelected ? "#007bff" : "#f0f0f0")};
  color: ${(props) => (props.isSelected ? "white" : props.isSunday ? "red" : "#333")};
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => (props.isSelected ? "#0056b3" : "#ddd")};
  }
`;

const YearMonthSelectArea = styled.div`
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  position: relative;
  width: 80px;
  cursor: pointer;

  & > select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  & > div {
    flex: 1;
    white-space: nowrap;
    text-align: center;
  }
`;

const SelectBox = styled.select`
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #6c5ce7;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: #4b39d3;
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  }
`;
interface RadioButtonProps {
  active: boolean;
}

interface LineInfoProps {
  stLn: string;
  edLn: string;
  lnNm: string;
  isShow: boolean;
}

interface DashboardTopbarProps {
  btnHandler: (type: string, data?: any) => void;
  titleName?: string;
  isLoading: boolean;
  lnInfo?: LineInfoProps;
  isQc?: boolean;
  type?: string;
}

const DashboardTopbar: React.FC<DashboardTopbarProps> = ({ btnHandler, titleName, isLoading, lnInfo, isQc, type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const { user, line, factoryLineList } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    line: state.Tablet.line,
    factoryLineList: state.Tablet.factoryLineList,
  }));

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(getVtnTime()));
  const [currentTime, setCurrentTime] = useState<string>();
  const [reloadTime] = useState(60 * 3);
  const [seconds, setSeconds] = useState(reloadTime);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [isEndLine, setIsEndLine] = useState<string>("Y");
  const [selectedLine, setSelectedLine] = useState<string>(lnInfo?.lnNm || "");
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [maxIdx, setMaxIdx] = useState<number>(1);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date(getVtnTime()).getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date(getVtnTime()).getFullYear());

  const [isYearPickerOpen, setYearPickerOpen] = useState(false);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState("Line");

  const selectAreaHideUrl = [
    "/factory/sewing/total/actual",
    "/factory/sewing/hps/list",
    "/factory/sewing/hps/shopFloor",
    "/factory/sewing/inputline",
    "/factory/finish/qc/finishqcline",
    "/factory/folding/actual",
    "/factory/machine/sewing/management",
    "/factory/knitting/machine",
    "/factory/machine/sewing/machine",
  ];

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    const param = {
      selectedDate,
      firstLoading,
      selectedIdx,
      isEndLine,
      excel: "N",
    };
    btnHandler("1", param);
  };

  // 버튼 클릭 핸들러
  const handleExcelButtonClick = () => {
    const param = {
      selectedDate,
      firstLoading,
      selectedIdx,
      isEndLine,
      excel: "Y",
    };
    btnHandler("1", param);
  };

  // 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date(getVtnTime());
      setCurrentTime(formatDate(now, "3"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Qc 종류 변경 이벤트
  useEffect(() => {
    handleButtonClick();
    setSeconds(reloadTime);
  }, [isEndLine]);

  // Sewing 및 Iron 페이지에 따른 Index 설정
  useEffect(() => {
    const ironURL = ["IRON ACTUAL"];
    const sewURL = ["HOURLY PRODUCTION STATUS"];

    if (titleName) {
      const sewLn = Number(line?.sewLn);
      if (ironURL.includes(titleName)) {
        setSelectedIdx(getIronLineRange(sewLn));
        setMaxIdx(4);
      } else if (sewURL.includes(titleName)) {
        setSelectedIdx(getSewingLineRange(sewLn));
        setMaxIdx(8);
      }
    }
  }, [titleName, line]);

  // Line Name 변경
  useEffect(() => {
    if (lnInfo?.lnNm) {
      setSelectedLine(lnInfo?.lnNm);
    }
  }, [lnInfo?.lnNm]);

  // 필수정보 체크 후 이동

  /*
  useEffect(() => {
    const exceptionURL = [
      "/factory/finish/qc",
      "/factory/finish/qc/chart",
      "/factory/sewing/total/actual",
      "/factory/sewing/inputline",
      "/factory/finish/qc/finishqcline",
      "/factory/folding/actual",
    ];

    if (isEmpty(line) || isEmpty(factoryLineList)) {
      if (!exceptionURL.includes(location.pathname)) {
        navigate("/factory/home");
      }
    }
  }, [line, factoryLineList, navigate, location]);
  */

  useEffect(() => {
    if (!isEmpty(type)) {
      handleButtonClick();
    }
  }, [type]);

  // 초기 로딩 시 매초 데이터 갱신
  useEffect(() => {
    if (firstLoading) {
      const interval = setInterval(handleButtonClick, 1000);
      setTimeout(() => {
        clearInterval(interval);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [firstLoading]);

  // 날짜 변경 시 타이머 초기화
  useEffect(() => {
    if (!isEmpty(selectedDate)) {
      setSeconds(reloadTime);
      handleButtonClick();
    }
  }, [selectedDate]);

  // 페이지 변경 시 타이머 초기화
  useEffect(() => {
    if (!isEmpty(selectedIdx)) {
      setSeconds(reloadTime);
      handleButtonClick();
    }
  }, [selectedIdx]);

  // 타이머 및 페이지 갱신 로직
  useEffect(() => {
    const timerId = setInterval(() => {
      setSeconds((prevSeconds) => (prevSeconds > 0 ? prevSeconds - 1 : prevSeconds));
    }, 1000);

    // 타이머가 0이 되었을 때의 로직
    const handleTimerEnd = () => {
      setSeconds(reloadTime);

      const nonPagingURL = ["QC DEFECT STATUS"];
      const isPaging = nonPagingURL.includes(titleName ?? "");

      if (isPaging) {
        handleButtonClick();
      } else {
        if (!isTimerPaused) {
          setSelectedIdx((prevSelectedIdx) => (prevSelectedIdx === maxIdx ? 1 : prevSelectedIdx + 1));
        } else {
          handleButtonClick();
        }
      }
    };

    if (seconds === 0) {
      handleTimerEnd();
    }

    return () => clearInterval(timerId);
  }, [seconds, isTimerPaused, titleName]);

  // Qc page전환 이벤트
  useEffect(() => {
    const qcURL = ["QC DEFECT STATUS"];
    const isQcFinish = qcURL.includes(titleName ?? "");

    if (isQcFinish) {
      if (selectedOption === "Line") {
        navigate("/factory/finish/qc");
      } else {
        navigate("/factory/finish/qc/chart");
      }
    }
  }, [selectedOption, titleName]);

  // 로딩 상태 업데이트
  useEffect(() => {
    setFirstLoading(isLoading);
  }, [isLoading]);

  // 달력 초기 값 업데이트
  useEffect(() => {
    if (!isDatePickerOpen) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
    }
  }, [isDatePickerOpen]);

  // Sewing Page Index 설정 함수
  const getSewingLineRange = (sewLn: number) => {
    if (sewLn >= 1 && sewLn <= 3) return 1;
    if (sewLn >= 4 && sewLn <= 6) return 2;
    if (sewLn >= 7 && sewLn <= 9) return 3;
    if (sewLn >= 10 && sewLn <= 12) return 4;
    if (sewLn >= 13 && sewLn <= 15) return 5;
    if (sewLn >= 16 && sewLn <= 18) return 6;
    if (sewLn >= 19 && sewLn <= 21) return 7;
    if (sewLn >= 22 && sewLn <= 24) return 8;
    return 1;
  };

  // Iron Page Index 설정 함수
  const getIronLineRange = (sewLn: number) => {
    if (sewLn >= 1 && sewLn <= 9) return 1;
    if (sewLn >= 10 && sewLn <= 18) return 2;
    if (sewLn >= 19 && sewLn <= 26) return 3;
    if (sewLn >= 27 && sewLn <= 30) return 4;
    return 1;
  };

  // 메인화면 이동
  const goHome = () => {
    navigate("/factory/home");
  };

  // 날짜 변경 이벤트
  const onDateChange = (date: string) => {
    if (!isEmpty(date)) {
      setSelectedDate(new Date(date));
    }
  };

  // 페이지 감소 핸들러
  const handlePrevPage = () => {
    setSelectedIdx((prevSelectedIdx) => (prevSelectedIdx === 1 ? maxIdx : prevSelectedIdx - 1));
  };

  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTimerPaused(event.target.checked);
  };

  // 페이지 증가 핸들러
  const handleNextPage = () => {
    setSelectedIdx((prevSelectedIdx) => (prevSelectedIdx === maxIdx ? 1 : prevSelectedIdx + 1));
  };

  // 달력 클릭 이벤트
  const showDatePicker = () => {
    setDatePickerOpen(!isDatePickerOpen);
  };

  // 달력 닫기 이벤트
  const closeDatePicker = () => {
    setDatePickerOpen(false);
  };

  // 달력 선택 이벤트
  const handleDateSelect = (date: string) => {
    onDateChange(date);
    closeDatePicker();
  };

  // 이전 달 선택
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prevYear) => prevYear - 1);
    } else {
      setCurrentMonth((prevMonth) => prevMonth - 1);
    }
  };

  // 다음 달 선택
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prevYear) => prevYear + 1);
    } else {
      setCurrentMonth((prevMonth) => prevMonth + 1);
    }
  };

  // 연도 클릭 시 셀렉트 박스 열기/닫기
  const toggleYearPicker = () => {
    setYearPickerOpen(!isYearPickerOpen);
    setMonthPickerOpen(false);
  };

  // 월 클릭 시 셀렉트 박스 열기/닫기
  const toggleMonthPicker = () => {
    setMonthPickerOpen(!isMonthPickerOpen);
    setYearPickerOpen(false);
  };

  // 연도 변경 핸들러
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearPickerOpen(false);
    setCurrentYear(Number(e.target.value));
  };

  // 월 변경 핸들러
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthPickerOpen(false);
    setCurrentMonth(Number(e.target.value));
  };

  // 달력 render
  const renderDatePicker = () => {
    const days = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayHeaders = dayNames.map((day, index) => (
      <DayHeader key={day} isSunday={index === 0}>
        {day}
      </DayHeader>
    ));

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const date = new Date(currentYear, currentMonth, i);
      const isSelected = formatDateType2(selectedDate) === dateStr;
      const isSunday = date.getDay() === 0;

      days.push(
        <DatePickerDay key={i} isSelected={isSelected} isSunday={isSunday} onClick={() => handleDateSelect(dateStr)}>
          {i}
        </DatePickerDay>
      );
    }

    return (
      <DatePickerOverlay onClick={closeDatePicker}>
        <DatePickerContainer onClick={(e: any) => e.stopPropagation()}>
          <DatePickerHeader>
            <button onClick={handlePreviousMonth}>{"<"}</button>

            <YearMonthSelectArea onClick={toggleYearPicker}>
              <div>{currentYear}</div>
              <select value={currentYear} onChange={handleYearChange} onClick={(e) => e.stopPropagation()}>
                {Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </YearMonthSelectArea>

            <span>-</span>

            <YearMonthSelectArea onClick={toggleMonthPicker}>
              <div>{String(currentMonth + 1).padStart(2, "0")}</div>
              <select value={currentMonth} onChange={handleMonthChange} onClick={(e) => e.stopPropagation()}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </YearMonthSelectArea>

            <button onClick={handleNextMonth}>{">"}</button>
          </DatePickerHeader>
          <DatePickerGrid>
            {dayHeaders}
            {days}
          </DatePickerGrid>
        </DatePickerContainer>
      </DatePickerOverlay>
    );
  };

  return (
    <TopLayer>
      <LogoArea>
        <span className="logo-lg" onClick={goHome}>
          <img src={pankoWebGnbWht} alt="logo" height="25" />
        </span>
        <input
          type="text"
          name="date"
          placeholder="YYYY-MM-DD"
          value={formatDateType2(selectedDate)}
          onClick={showDatePicker}
          readOnly
          style={{
            border: "none",
            background: "none",
            color: "white",
            textAlign: "center",
            fontSize: "25px",
            cursor: "pointer",
            width: "180px",
          }}
        />
        {isDatePickerOpen && renderDatePicker()}
        {currentTime}
      </LogoArea>

      {/* <button onClick={handleExcelButtonClick}>excel</button> */}

      {isQc && (
        <Container>
          <Label active={selectedOption === "Line"}>
            <RadioButton
              active={selectedOption === "Line"}
              value="Line"
              checked={selectedOption === "Line"}
              onChange={() => setSelectedOption("Line")}
            />
            Line
          </Label>
          <Label active={selectedOption === "Total"}>
            <RadioButton
              active={selectedOption === "Total"}
              value="Total"
              checked={selectedOption === "Total"}
              onChange={() => setSelectedOption("Total")}
            />
            Total
          </Label>
        </Container>
      )}

      <SelectArea>
        <span style={{ color: "lightsalmon" }}>{String(seconds).padStart(2, "0")} SEC</span>
      </SelectArea>

      <TitleArea onClick={handleButtonClick}>{titleName}</TitleArea>

      {isQc ? (
        <Container>
          <Label active={isEndLine === "Y"}>
            <RadioButton
              active={isEndLine === "Y"}
              value="Y"
              checked={isEndLine === "Y"}
              onChange={() => setIsEndLine("Y")}
            />
            QC 1
          </Label>
          <Label active={isEndLine === "N"}>
            <RadioButton
              active={isEndLine === "N"}
              value="N"
              checked={isEndLine === "N"}
              onChange={() => setIsEndLine("N")}
            />
            QC 2
          </Label>
        </Container>
      ) : (
        !selectAreaHideUrl.includes(location.pathname) && (
          <PageFixArea>
            <label htmlFor="pageCheckbox">Fix</label>
            <input type="checkbox" id="pageCheckbox" name="pageCheckbox" onChange={handleCheckboxChange} />
          </PageFixArea>
        )
      )}

      {!selectAreaHideUrl.includes(location.pathname) && (
        <LineArea>
          {lnInfo?.isShow && (
            <>
              <PageCntArea>
                <button onClick={handlePrevPage}>
                  <i className="ti-arrow-circle-left" />
                </button>
              </PageCntArea>
              <div>
                <span>{`${selectedLine} ${factoryLineList[Number(lnInfo?.stLn) - 1]?.sewNm} TO ${
                  factoryLineList[Number(lnInfo?.edLn) - 1]?.sewNm
                }`}</span>
              </div>
              <PageCntArea>
                <button onClick={handleNextPage}>
                  <i className="ti-arrow-circle-right" />
                </button>
              </PageCntArea>
            </>
          )}
        </LineArea>
      )}
    </TopLayer>
  );
};

export default DashboardTopbar;
