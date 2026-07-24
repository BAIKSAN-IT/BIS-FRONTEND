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
import { CodeListReq } from "../../../../redux/system/SystemCommonSlice";

interface Props {
  searchParams: CodeListReq;
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string;
      nmField: string;
    }>
  >;
  onSearchButtonClick: () => void;
}

const SearchCodeRegister = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: "nmField", value: string) => {
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
      {/* Name 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">CodeName</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.nmField || ""}
            onChange={(e) => handleInputChange("nmField", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>
    </Row>
  );
});

export default SearchCodeRegister;
