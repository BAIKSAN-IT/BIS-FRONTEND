import React, { memo } from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { GroupInfoReq, GroupListReq } from "../../../../redux/system/SystemGroupSlice";

interface Props {
  searchParams: GroupListReq;
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string;
      groupId: string;
      groupName: string;
    }>
  >;
  onSearchButtonClick: () => void;
}

const SearchAuthGroupRegister = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: "groupId" | "groupName", value: string) => {
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
      {/* GroupId 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">GroupId</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.groupId || ""}
            onChange={(e) => handleInputChange("groupId", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>
      {/* GroupName 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">GroupName</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.groupName || ""}
            onChange={(e) => handleInputChange("groupName", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>
      {/*<Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">UserId</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.userId || ""}
            onChange={(e) => handleInputChange("userId", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">UserNm</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.userNm || ""}
            onChange={(e) => handleInputChange("userNm", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>*/}
    </Row>
  );
});

export default SearchAuthGroupRegister;
