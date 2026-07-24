import React, { memo } from "react";
import { Col, InputGroup, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { UserHistoryListReq } from "@redux/user/UserHistorySlice";

interface Props {
  searchParams: UserHistoryListReq;
  setSearchParams: React.Dispatch<React.SetStateAction<UserHistoryListReq>>;
  onSearchButtonClick: () => void;
}

const SearchUserHistory = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  const handleChange = (field: keyof UserHistoryListReq, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
      if (e.key === "Enter") {
        onSearchButtonClick();
      }
    }
  };

  return (
    <Row className="g-2">
      <Col xs={12} lg={12} xxl={4}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">DATE</label>
          <InputGroup className="history-date-input-group">
            <input
              type="date"
              className="form-control"
              style={{ height: "27px", fontSize: "10px" }}
              value={searchParams.fromDt || ""}
              onChange={(e) => handleChange("fromDt", e.target.value)}
            />
            <InputGroup.Text className="history-date-separator">~</InputGroup.Text>
            <input
              type="date"
              className="form-control"
              style={{ height: "27px", fontSize: "10px" }}
              value={searchParams.toDt || ""}
              onChange={(e) => handleChange("toDt", e.target.value)}
            />
          </InputGroup>
        </div>
      </Col>
      <Col xs={12} lg={6} xxl={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">Login ID</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.loginId || ""}
            onChange={(e) => handleChange("loginId", e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </Col>
      <Col xs={12} lg={6} xxl={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">User ID</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.userId || ""}
            onChange={(e) => handleChange("userId", e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </Col>
      <Col xs={12} lg={6} xxl={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">User Name</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.userNm || ""}
            onChange={(e) => handleChange("userNm", e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </Col>
      <Col xs={12} lg={6} xxl={2}>
        <div className="d-flex align-items-center mb-2">
          <label className="search-custom-label-class">Login IP</label>
          <input
            type="text"
            className="form-control ml-2"
            style={{ height: "27px", fontSize: "10px" }}
            value={searchParams.loginIp || ""}
            onChange={(e) => handleChange("loginIp", e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </Col>
    </Row>
  );
});

export default SearchUserHistory;
