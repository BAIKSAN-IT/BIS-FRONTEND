import React, { memo, useState } from "react";
import { Col, FormControl, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/* redux */
import { RootState } from "../../../redux/store";

/* utils */
import { DateUtils } from "../../../utils/dateUtils";

interface Props {
  onSearchButtonClick: () => void;
  searchParams: {
    cdCompany: string;
    startYm: string;
    endYm: string;
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string;
      startYm: string;
      endYm: string;
    }>
  >;
}

const SearchSalesActivityDashboard = memo(({ searchParams, setSearchParams, onSearchButtonClick }: Props) => {
  const location = useLocation();

  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname) &&
      e.key === "Enter"
    ) {
      onSearchButtonClick();
    }
  };
  return (
    <>
      <Row>
        <Col md={4}>
          <div className="d-flex align-items-center mt-n2 mb-2">
            <label className="custom-sewing-search-label">DATE</label>
            <div className="d-flex">
              <FormControl
                type="month"
                value={searchParams.startYm || ""} // value는 2025-05
                name="startYm"
                className="custom-sewing-search-input"
                onKeyPress={handleKeyPress}
                onChange={(e) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    startYm: e.target.value,
                  }));
                }}
              />
              <FormControl
                type="month"
                value={searchParams.endYm || ""}
                name="endYm"
                className="custom-sewing-search-input"
                onKeyPress={handleKeyPress}
                onChange={(e) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    endYm: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
});

export default SearchSalesActivityDashboard;
