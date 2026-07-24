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

interface Props {
  searchParams: UserListReq;
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      userId: string;
      userNm: string;
      pageNo: number;
      pageCount: number;
      guestYn: string;
      dtsDate: string;
      useYn: string;
    }>
  >;
  onSearchButtonClick: () => void;
}

const SearchUserRegister = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));
  useEffect(() => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      dtsDate: "", // 초기 상태에서 "전체" 옵션 선택
    }));
  }, [setSearchParams]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: "userId" | "userNm", value: string) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  // 게스트 여부 선택 핸들러
  const handleGuestYnChange = (value: string) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      guestYn: value,
    }));
  };

  // 재직 상태 선택 핸들러
  const handleUserStatusChange = (value: string) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      useYn: value,
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
          <label className="search-custom-label-class">ID</label>
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

      {/* Name 입력 필드 */}
      <Col md={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">Name</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.userNm || ""}
            onChange={(e) => handleInputChange("userNm", e.target.value || "")}
            onKeyPress={handleKeyPress}
          />
        </div>
      </Col>

      {/* 게스트 여부 선택 */}
      <Col md={2}>
        <div className="system-form-group d-flex align-items-center justify-content-between">
          <label className="label-custom custom-label-class">{t("register.search.guestYn")}</label>
          <div className={"position-relative w-100"}>
            <select
              className="form-control text-center"
              value={searchParams.guestYn || ""}
              onChange={(e) => handleGuestYnChange(e.target.value)}
            >
              <option value="">전체</option>
              <option value="Y">게스트</option>
              <option value="N">일반</option>
            </select>
            <IconComponent
              className={"mdi mdi-chevron-down position-absolute"}
              style={{
                fontSize: "20px", // 아이콘 크기 변경
                right: "10px", // 오른쪽 정렬
                top: "50%", // 세로 중앙 정렬
                transform: "translateY(-50%)", // 정확한 중앙 정렬
              }}
            />
          </div>
        </div>
      </Col>

      {/* 재직 상태 선택 */}
      <Col md={2}>
        <div className="system-form-group d-flex align-items-center justify-content-between">
          <label className="label-custom custom-label-class">{t("register.search.employmentStatus")}</label>
          <div className={"position-relative w-100"}>
            <select
              className="form-control text-center"
              value={searchParams.useYn || ""}
              onChange={(e) => handleUserStatusChange(e.target.value)}
            >
              <option value="">전체</option>
              <option value="Y">재직중</option>
              <option value="N">퇴사자</option>
            </select>
            <IconComponent
              className={"mdi mdi-chevron-down position-absolute"}
              style={{
                fontSize: "20px", // 아이콘 크기 변경
                right: "10px", // 오른쪽 정렬
                top: "50%", // 세로 중앙 정렬
                transform: "translateY(-50%)", // 정확한 중앙 정렬
              }}
            />
          </div>
        </div>
      </Col>
    </Row>
  );
});

export default SearchUserRegister;
