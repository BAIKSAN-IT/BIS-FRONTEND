import React, {memo, useState, useCallback} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useSelector} from "react-redux";

/* utils */
import {InputRefMap} from "@utils/useInputRefs";
import {DateUtils} from "@utils/dateUtils";
import {SewingHpsPopUpMaxRes, SewingHpsPopUpRes} from "@redux/factory/factorySewingSlice";
import SewingActualSummaryTab from "@pages/mainfactory/sewing/actual/SewingActualSummaryTab";
import ButtonComponent from "@components/common/ButtonComponent";
import ArrowButton from "@components/common/ArrowButton";

interface Props {
  refs: InputRefMap<"dtsWk">;
  onSearchButtonClick: () => void;
  hpsHeadData: SewingHpsPopUpRes[] | [];
  sewingHpsPopUpMax: SewingHpsPopUpMaxRes | null;
  setIsDateButtonClick?: (value: (((prevState: boolean) => boolean) | boolean)) => void;
}

const SearchSewingActual: React.FC<Props> = ({
                                                  refs,
                                                  onSearchButtonClick,
                                                  hpsHeadData,
                                                  sewingHpsPopUpMax,
                                                  setIsDateButtonClick,
                                                }) => {

  const [selectedDate, setSelectedDate] = useState<string>(DateUtils.today);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchButtonClick();
    }
  };

  const onPrevDay = useCallback(() => {
    const newDate = DateUtils.addDaysDash(selectedDate, -1);
    setSelectedDate(newDate);

    if (setIsDateButtonClick) {
      setIsDateButtonClick(true);
    }
  }, [selectedDate, setIsDateButtonClick]);

  const onNextDay = useCallback(() => {
    const newDate = DateUtils.addDaysDash(selectedDate, 1);
    setSelectedDate(newDate);

    if (setIsDateButtonClick) {
      setIsDateButtonClick(true);
    }
  }, [selectedDate, setIsDateButtonClick]);

  return (
    <Card className="form-grid mt-n2" style={{height: 50}}>
      <Card.Body>
        <Row className="form-grid">

          <Col md={3}>
            <div className="fg-row mt-n2">
              <label className="fg-label">DATE</label>

              <div className="d-flex align-items-center">

                <FormControl
                  type="date"
                  ref={refs["dtsWk"]}
                  name="dtsWk"
                  value={selectedDate}
                  className="form-control fg-control text-center"
                  onKeyDown={handleKeyDown}
                  onKeyPress={handleKeyDown}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
                />

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

          <Col md={9}>
            <SewingActualSummaryTab
              hpsHeadData={hpsHeadData}
              sewingHpsPopUpMax={sewingHpsPopUpMax}
            />
          </Col>

        </Row>
      </Card.Body>
    </Card>
  );
};

export default memo(SearchSewingActual);
