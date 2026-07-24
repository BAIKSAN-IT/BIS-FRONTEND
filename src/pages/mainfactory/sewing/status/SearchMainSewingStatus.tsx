import React, {memo, useCallback, useEffect, useState} from "react";
import {Card, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import ButtonComponent from "@components/common/ButtonComponent";
import {DateUtils} from "@utils/dateUtils";
import {InputRefMap} from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";
import {PisBuyerListRes} from "@redux/common/commonSlice";
import BuyerPopupComponent from "@components/modal/BuyerPopupComponent";

interface Props {
  refs: InputRefMap<"dtsWk"|"clrszSumYn"|'dtsWkF'|'nmBuyer'| 'noStyle'>;
  onSearchButtonClick?: () => void
}
const SearchMainSewingStatus = memo(
  ({ refs, onSearchButtonClick }: Props) => {

    const today = DateUtils.today; // "YYYY-MM-DD"
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);
    const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);

    useEffect(() => {
      setFromDate(today);
      setToDate(today);

      refs.dtsWkF.current!.value = today;
      refs.dtsWk.current!.value = today;
      refs.clrszSumYn.current!.value = "SUM";
    }, []);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSearchButtonClick?.();
      }
    };

    const onPrevDay = () => {
      const newFromDate = DateUtils.addDaysDash(fromDate, -1);
      const newToDate = DateUtils.addDaysDash(toDate, -1);
      setFromDate(newFromDate);
      setToDate(newToDate);
      refs.dtsWkF.current!.value = newFromDate;
      refs.dtsWk.current!.value = newToDate;
    };

    const onNextDay = () => {
      const newFromDate = DateUtils.addDaysDash(fromDate, -1);
      const newToDate = DateUtils.addDaysDash(toDate, -1);
      setFromDate(newFromDate);
      setToDate(newToDate);
      refs.dtsWkF.current!.value = newFromDate;
      refs.dtsWk.current!.value = newToDate;
    };

    return (
      <>
        <input
          type="hidden"
          ref={refs.clrszSumYn}
        />
      <Card className="form-grid mt-n2" style={{ height: 50 }}>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="fg-row mt-n2">
                <label className="fg-label">DATE</label>
                <div className="d-flex align-items-center">
                  <InputGroup>
                    <FormControl
                      type="date"
                      name="dtsWkF"
                      ref={refs["dtsWkF"]}
                      value={fromDate}
                      className="form-control text-center fg-control"
                      autoComplete="off"
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        refs.dtsWkF.current!.value = e.target.value;
                      }}
                    />
                    <FormControl
                      type="date"
                      name="dtsWk"
                      ref={refs["dtsWk"]}
                      value={toDate}
                      className="form-control text-center fg-control"
                      autoComplete="off"
                      min={fromDate}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        refs.dtsWk.current!.value = e.target.value;
                      }}
                    />
                  </InputGroup>
                <div className="d-flex flex-column">
                  <ArrowButton
                    direction="up"
                    onClick={onPrevDay}
                    arrowWidth={16}
                    arrowHeight={16}
                  />

                  <ArrowButton
                    direction="down"
                    onClick={onNextDay}
                    arrowWidth={16}
                    arrowHeight={16}
                  />
                </div>
              </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">BUYER</label>
                <FormControl
                  ref={refs["nmBuyer"]}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
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
            <Col md={2}>
              <div className="fg-row mt-n2">
                <label className="fg-label">STYLE</label>
                <div className="d-flex">
                  <FormControl
                    ref={refs["noStyle"]}
                    name="noStyle"
                    className="form-control custom-sewing-search-input"
                    autoComplete="off"
                    onKeyPress={handleKeyDown}
                  />
                </div>
              </div>
            </Col>


            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">STYLE/COLOR</label>

                <div className="d-flex ms-1 gap-1" style={{ fontSize: "clamp(9px, 0.65vw, 18px)" }}>
                  {[
                    { label: "COLOR/SIZE", value: "SUM" },
                    { label: "COLOR", value: "CSUM" },
                    { label: "PO", value: "" },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className="d-flex align-items-center"
                      style={{gap: '2px'}}
                    >
                      <input
                        type="radio"
                        name="clrszSumYn"
                        defaultChecked={item.value === "SUM"}
                        onChange={() => {
                          if (refs.clrszSumYn?.current) {
                            refs.clrszSumYn.current.value = item.value;
                          }
                        }}
                        style={{ transform: "translateY(-1px)" }}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </Col>
            </Row>
        </Card.Body>
      </Card>
      <BuyerPopupComponent
        isShowBuyerPopup={isShowBuyerPopup}
        setIsShowBuyerPopup={setIsShowBuyerPopup}
        onClose={() => setIsShowBuyerPopup(false)}
        onBuyerDoubleClickSelect={(item: PisBuyerListRes) => {
          if (refs["nmBuyer"].current) refs["nmBuyer"].current.value = item.nmBuyer;
        }}
      />
      </>
    );
  }
);

export default SearchMainSewingStatus;
