import React, { memo, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/*component */
import IconComponent from "../../../../components/common/IconComponent";
import { UserListReq } from "../../../../redux/system/SystemUserSlice";

/* redux */
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { ProgramMenuListReq } from "../../../../redux/system/SystemProgramSlice";

interface Props {
  searchParams: ProgramMenuListReq;
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string;
      menuLevel: string;
      appName: string;
      pageName: string;
    }>
  >;
  onSearchButtonClick: () => void;
}

const SearchProgramRegister = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: "appName" | "pageName", value: string) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  // Enter 키로 조회 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
      if (e.key === "Enter") {
        onSearchButtonClick();
      }
    }
  };

  return (
    <Row>
      {/* ID 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">AppName</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.appName || ""}
            onChange={(e) => handleInputChange("appName", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>

      {/* Name 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">PageName</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.pageName || ""}
            onChange={(e) => handleInputChange("pageName", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>
    </Row>
  );
});

export default SearchProgramRegister;
