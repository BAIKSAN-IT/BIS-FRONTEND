import React, { memo, useEffect, useState } from "react";
import { Col, FormControl, InputGroup, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/* component */
import ButtonComponent from "../../../../components/common/ButtonComponent";
import BuyerPopupComponent from "../../../../components/modal/BuyerPopupComponent";

/* redux */
import { RootState } from "../../../../redux/store";
import { PisBuyerListRes } from "../../../../redux/common/commonSlice";

/* utils */
import { InputRefMap } from "../../../../utils/useInputRefs";
import { DateUtils } from "../../../../utils/dateUtils";

interface Props {
  refs: InputRefMap<"nmBuyer" | "style" | "dtsFromWk" | "dtsToWk">;
  onSearchButtonClick: () => void;
}

const SearchSewingProcess = memo(({ refs, onSearchButtonClick }: Props) => {
  const location = useLocation();
  const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);

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
      <Row className={'form-grid'}>
        <Col md={2} style={{ transform: "translateY(-10px)" }}>
          <div className="fg-row">
            <label className="fg-label">Buyer</label>
            <FormControl
              name="nmBuyer"
              ref={refs["nmBuyer"]}
              className="text-center custom-sewing-search-input"
              autoComplete="off"
              onKeyPress={handleKeyPress}
            />
            <ButtonComponent
              type="button"
              className="fg-btn"
              iClassName="ti-search"
              txt=""
              onClick={() => setIsShowBuyerPopup(true)}
            />
          </div>
        </Col>

        <Col md={2} style={{ transform: "translateY(-10px)" }}>
          <div className="fg-row">
            <label className="fg-label">Style</label>
            <div className="d-flex">
              <FormControl
                ref={refs["style"]}
                name="style"
                className="form-control custom-sewing-search-input"
                autoComplete="off"
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
        </Col>

        <Col md={4} style={{ transform: "translateY(-10px)", marginLeft: "-1%" }}>
          <div className="fg-row">
            <label className="fg-label">DATE</label>
            <div className="d-flex">
              <FormControl
                type="date"
                ref={refs["dtsFromWk"]}
                defaultValue={DateUtils.oneDayAgo}
                name="dtsFromWk"
                className="custom-sewing-search-input"
                onKeyPress={handleKeyPress}
                onChange={(e) => {
                  if (refs["dtsToWk"].current) {
                    refs["dtsToWk"].current.value = e.target.value;
                    refs["dtsToWk"].current.min = e.target.value;
                  }
                }}
              />
              <FormControl
                type="date"
                ref={refs["dtsToWk"]}
                name="dtsToWk"
                className="custom-sewing-search-input"
                onKeyPress={handleKeyPress}
                defaultValue={DateUtils.today}
                min={refs["dtsFromWk"]?.current?.value}
              />
            </div>
          </div>
        </Col>
      </Row>

      <BuyerPopupComponent
        isShowBuyerPopup={isShowBuyerPopup}
        setIsShowBuyerPopup={setIsShowBuyerPopup}
        onClose={() => setIsShowBuyerPopup(false)}
        onBuyerSelect={(rowIndex, item: PisBuyerListRes) => {
          if (refs["nmBuyer"].current) refs["nmBuyer"].current.value = item.nmBuyer;
        }}
      />
    </>
  );
});

export default SearchSewingProcess;
