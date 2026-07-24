import React, { useEffect, useRef, useState } from "react";
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
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;
  position: relative;
  width: 200px;

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
    overflow: hidden;
    white-space: nowrap;
  }

  & > div > span {
    display: inline-block;
    color: #ffa07a;
    font-weight: bold;
  }

  & > div.animate > span {
    animation: marquee 10s linear infinite;
  }

  @keyframes marquee {
    from {
      transform: translateX(10%);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;

const TimerArea = styled.div`
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;

  & > span {
    color: #ffa07a;
  }
`;

const PageFixArea = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  color: white;
  cursor: pointer;

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

const PageCntArea = styled.div`
  font-size: 15px;
  color: white;
  display: flex;
  align-items: center;
  margin-right: 15px;

  & > button {
    background: none;
    border: none;
    color: white;
    font-size: 25px;
    cursor: pointer;
  }
`;

const TopLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: steelblue;
`;

const BuyerName = styled.span`
  white-space: nowrap;
  display: inline-block;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.label<RadioButtonProps>`
  color: ${(props) => (props.active ? "#ffa07a" : "#ffffff")};
  font-size: 15px;
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

const TitleArea = styled.div`
  font-size: 20px;
  color: white;
  cursor: pointer;
`;

const DatePickerOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 90%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
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

interface RadioButtonProps {
  active: boolean;
}

interface TabletTopbarProps {
  btnHandler: (type: string, data?: any) => void;
  totalCnt: number;
  limitCnt: number;
  isLoading: boolean;
  titleName?: string;
  isStyle?: boolean;
  type?: string;
}

// Main Component
const FactoryTopbar: React.FC<TabletTopbarProps> = ({
  btnHandler,
  totalCnt,
  limitCnt,
  isLoading,
  titleName,
  isStyle,
  type,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const { user, buyerList } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    buyerList: state.Common.buyerList,
  }));

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(getVtnTime()));
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPage, setLimitPage] = useState(0);
  const [pageTotalCnt, setPageTotalCnt] = useState(0);
  const [reloadTime] = useState(60 * 3);
  const [seconds, setSeconds] = useState(reloadTime);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState<string>("");
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");

  const [selectedValue, setSelectedValue] = useState<string>("style");

  const selectAreaRef = useRef<HTMLDivElement>(null);

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date(getVtnTime()).getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date(getVtnTime()).getFullYear());

  const [isYearPickerOpen, setYearPickerOpen] = useState(false);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const exceptionURL = ["/factory/sewing/input", "/factory/knitting/list", "/factory/knitting/machine", "/factory/machine/sewing/machine"];
  const scrollURL = ["/factory/packing/actual"];

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    const param = {
      selectedDate,
      currentBuyer,
      currentPage,
      limitPage,
      firstLoading,
      excel: "N",
    };

    if (limitPage > 0) {
      btnHandler("1", param);
    }
  };

  // 버튼 클릭 핸들러
  const handleExcelButtonClick = () => {
    const param = {
      selectedDate,
      currentBuyer,
      currentPage,
      limitPage,
      firstLoading,
      excel: "Y",
    };
    btnHandler("1", param);
  };

  // 컴포넌트 마운트 시 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatDate(new Date(getVtnTime()), "3"));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // 초기 로딩 시 매초 데이터 갱신
  useEffect(() => {
    if (firstLoading) {
      const interval = setInterval(handleButtonClick, 2000);
      // setTimeout(() => {
      //   clearInterval(interval);
      // }, 5000);
      return () => clearInterval(interval);
    }
  }, [firstLoading]);

  // 총 페이지 수 계산
  useEffect(() => {
    setPageTotalCnt(Math.ceil(totalCnt / limitPage) ?? 0);
  }, [totalCnt]);

  useEffect(() => {
    if (titleName) {
      setTitle(titleName);
    }
  }, [titleName]);

  useEffect(() => {
    if (limitCnt) {
      setLimitPage(limitCnt);
    }
  }, [limitCnt]);

  // 로딩 상태 업데이트
  useEffect(() => {
    setFirstLoading(isLoading);
  }, [isLoading]);

  // 바이어 및 날짜 변경 시 페이지 및 타이머 초기화
  useEffect(() => {
    if (!isEmpty(currentBuyer) || !isEmpty(selectedDate)) {
      setSeconds(reloadTime);
      if (currentPage === 1) {
        handleButtonClick();
      } else {
        setCurrentPage(1);
      }
    }
  }, [currentBuyer, selectedDate, limitPage]);

  // 색상/스타일 기준 변경 핸들러
  useEffect(() => {
    if (isStyle) {
      navigate(selectedValue === "style" ? "/factory/cutting/actual/style" : "/factory/cutting/actual/color");
    }
  }, [selectedValue, isStyle]);

  useEffect(() => {
    if (isStyle) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        handleButtonClick();
      }
    }
  }, [type]);

  // 현재 페이지 변경 시 데이터 갱신 및 타이머 초기화
  useEffect(() => {
    if (currentPage > 0) {
      handleButtonClick();
      setSeconds(reloadTime); // 타이머 초기화
    }
  }, [currentPage]);

  // 타이머 기능 및 페이지 자동 전환
  useEffect(() => {
    const timerId = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          setCurrentPage((prevPage) => {
            if (!isTimerPaused) {
              if (pageTotalCnt > 1) {
                const nextPage = prevPage === pageTotalCnt ? 1 : prevPage + 1;
                return nextPage;
              } else {
                handleButtonClick();
                return prevPage;
              }
            } else {
              handleButtonClick();
              return prevPage;
            }
          });
          return reloadTime;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isTimerPaused, seconds, pageTotalCnt]);

  // 바이어 리스트 초기 값 설정
  useEffect(() => {
    if (buyerList.length > 0) {
      setCurrentBuyer(buyerList[0]?.cdBuyer ?? "");
    }
  }, [buyerList]);

  // 바이어 선택 영역 애니메이션 설정
  useEffect(() => {
    const buyerNameElement = selectAreaRef.current?.querySelector("span");
    if (buyerNameElement) {
      const parentWidth = selectAreaRef.current?.offsetWidth || 0;
      const textWidth = buyerNameElement.scrollWidth;
      selectAreaRef.current?.classList.toggle("animate", textWidth > parentWidth);
    }
  }, [currentBuyer, buyerList]);

  // 달력 초기 값 업데이트
  useEffect(() => {
    if (!isDatePickerOpen) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
    }
  }, [isDatePickerOpen]);

  // 메인 화면 이동
  const goHome = () => {
    navigate("/factory/home");
  };

  // 날짜 변경 이벤트
  const onDateChange = (date: string) => {
    if (!isEmpty(date)) {
      setSelectedDate(new Date(date));
    }
  };

  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTimerPaused(event.target.checked);
  };

  // 바이어 선택 변경 핸들러
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentBuyer(event.target.value);
  };

  // 페이지 감소 핸들러
  const handlePrevPage = () => {
    if (pageTotalCnt > 0) {
      setCurrentPage((prevPage) => (prevPage === 1 ? pageTotalCnt : prevPage - 1));
    }
  };

  // 페이지 증가 핸들러
  const handleNextPage = () => {
    if (pageTotalCnt > 0) {
      setCurrentPage((prevPage) => (prevPage === pageTotalCnt ? 1 : prevPage + 1));
    }
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

      <TimerArea>
        <span>{String(seconds).padStart(2, "0")} SEC</span>
      </TimerArea>

      <TitleArea onClick={handleButtonClick}>{title}</TitleArea>

      {isStyle && (
        <Container>
          <Label active={selectedValue === "style"}>
            <RadioButton
              active={selectedValue === "style"}
              value="style"
              checked={selectedValue === "style"}
              onChange={() => setSelectedValue("style")}
            />
            Style
          </Label>
          <Label active={selectedValue === "color"}>
            <RadioButton
              active={selectedValue === "color"}
              value="color"
              checked={selectedValue === "color"}
              onChange={() => setSelectedValue("color")}
            />
            Color
          </Label>
        </Container>
      )}

      {!exceptionURL.includes(location.pathname) && !scrollURL.includes(location.pathname) && (
        <SelectArea>
          BUYER : &nbsp;
          <div ref={selectAreaRef}>
            <BuyerName>{buyerList.find((buyer) => buyer.cdBuyer === currentBuyer)?.nmBuyer}</BuyerName>
          </div>
          <select name="select" onChange={handleSelectChange} value={currentBuyer}>
            {buyerList.map((item, idx) => (
              <option key={idx} value={item?.cdBuyer}>
                {item.nmBuyer}
              </option>
            ))}
          </select>
        </SelectArea>
      )}

      {!scrollURL.includes(location.pathname) && (
        <>
          <PageFixArea>
            <label htmlFor="pageCheckbox">Fix</label>
            <input type="checkbox" id="pageCheckbox" name="pageCheckbox" onChange={handleCheckboxChange} />
          </PageFixArea>

          <PageCntArea>
            <button onClick={handlePrevPage}>
              <i className="ti-arrow-circle-left" />
            </button>
            <span>{`${currentPage} of ${pageTotalCnt}`}</span>
            <button onClick={handleNextPage}>
              <i className="ti-arrow-circle-right" />
            </button>
          </PageCntArea>
        </>
      )}
    </TopLayer>
  );
};

export default FactoryTopbar;
