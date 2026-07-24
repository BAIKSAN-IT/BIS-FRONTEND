import React, { memo } from "react";
import { Button, Card, Col, FormControl, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/* redux */
import { RootState } from "@redux/store";

interface Props {
  onSearchButtonClick: () => void;
  searchParams: {
    cdCompany?: string; // 회사 코드
    startDate?: string; // YYYYMMDD (하이픈 없음)
    endDate?: string; // YYYYMMDD (하이픈 없음)
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany?: string;
      startDate?: string;
      endDate?: string;
    }>
  >;
  showAll?: boolean;
}

const SearchFabricDashboard = memo(({ onSearchButtonClick, searchParams, setSearchParams, showAll }: Props) => {
  const location = useLocation();
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  // Enter 키로 조회 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
      if (e.key === "Enter") {
        onSearchButtonClick();
      }
    }
  };
  return (
    <Card className="form-grid" style={{ height: 50 }}>
      <Card.Body>
        <Row>
          {/* 날짜(YYYYMM) */}
          <Col md={4} style={{ transform: "translateY(-10px)" }}>
            <div className="fg-row">
              <label className="fg-label">DATE</label>
              <div className="d-flex">
                <FormControl type="date" className="custom-sewing-search-input" />
                <FormControl type="date" className="custom-sewing-search-input" />
              </div>
            </div>
          </Col>

          {/* Currency 라디오 + KRW 옆 전체보기 버튼 */}
          <Col md={4} style={{ transform: "translateY(-10px)" }}>
            <div className="fg-row">
              {/*  KRW 옆에 붙는 전체보기 토글 버튼 */}
              <Button
                size="sm"
                variant={showAll ? "secondary" : "outline-secondary"}
                className="ms-2"
                onClick={() => {}}
                title={showAll ? "레벨별 보기로 전환" : "모든 레벨 한 번에 보기"}
              >
                {showAll ? "레벨보기" : "전체보기"}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

export default SearchFabricDashboard;
