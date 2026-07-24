import React, { memo } from "react";

/* lb */
import moment from "moment";

/* Component */
import HyperDatepicker from "../Datepicker";
import ButtonComponent from "./ButtonComponent";

interface Props {
  pageTitle?: string; // 페이지 제목
  selectedDate: Date; // 선택된 날짜
  onDateChange: (date: Date) => void; // 날짜 변경 핸들러
  onRefreshButton: () => void;
}

const PageTitleBar = memo(({ pageTitle, selectedDate, onDateChange, onRefreshButton }: Props) => {
  // moment로 selectedDate를 처리하기
  const momentSelectedDate = moment(selectedDate);

  // 전날과 다음날로 날짜를 변경하는 함수
  const changeDate = (direction: "previous" | "next") => {
    const newDate = momentSelectedDate.clone();
    if (direction === "previous") {
      newDate.subtract(1, "days"); // 전날로 변경
    } else if (direction === "next") {
      newDate.add(1, "days"); // 다음날로 변경
    }
    onDateChange(newDate.toDate()); // Date 객체로 전달
  };

  return (
    <div className="page-title-box">
      <div className="page-title-right">
        <form className="d-flex align-items-center mb-3">
          <div className="input-group input-group-sm">
            <HyperDatepicker
              value={momentSelectedDate.toDate()} // moment 객체를 Date 객체로 변환하여 전달
              inputClass="border"
              onChange={(date) => {
                if (date) onDateChange(moment(date).toDate()); // moment로 변환 후 Date 객체로 전달
              }}
            />
          </div>
          <span>
            <ButtonComponent
              type={"button"}
              className={"btn btn-blue btn-sm ms-1"}
              iClassName={"mdi mdi-arrow-left"}
              txt={""}
              onClick={() => changeDate("previous")} // 전날로 변경
            />
          </span>
          <span>
            <ButtonComponent
              type={"button"}
              className={"btn btn-blue btn-sm ms-1"}
              iClassName={"mdi mdi-arrow-right"}
              txt={""}
              onClick={() => changeDate("next")} // 다음날로 변경
            />
          </span>
          {/* 새로고침 버튼 */}
          <ButtonComponent
            type={"button"}
            className={"btn btn-blue btn-sm ms-2"}
            iClassName={"mdi mdi-autorenew"}
            txt={""}
            onClick={() => onRefreshButton()}
          />
        </form>
      </div>
      {/* PageTitle */}
      <h4 className="page-title">{pageTitle || ""}</h4>
    </div>
  );
});

export default PageTitleBar;
