import React, { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Col, FormControl, Row } from "react-bootstrap";

import { DateUtils } from "@utils/dateUtils";
import { InputRefMap } from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";
import { KNITTING_COLUMNS_TYPE } from "@constants/factory/knitting/knitting";
import KnittingStatusSummaryTab from "@pages/mainfactory/knitting/status/KnittingStatusSummaryTab";

interface Props {
  refs: InputRefMap<"dtsWk">;
  onSearchButtonClick?: () => void;
  knittingList?: KNITTING_COLUMNS_TYPE[] | [];
}

/** SummaryBox랑 높이/톤 맞춘 DATE 박스 */
const DateSummaryBox = styled.div`
  background-color: #bbdaf6;
  border-radius: 9px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  height: 45px;
  width: 100%;

  .date-label {
    font-size: clamp(10px, 0.7vw, 18px);
    font-weight: bold;
    color: #000;
    line-height: 1.1;
    white-space: nowrap;
    margin-right: 6px;
    padding: 4px 6px;
  }

  .date-input {
    font-size: clamp(8px, 0.7vw, 16px);
    height: 35px;
    padding: 0 8px;
    border-radius: 7px;
  }

  .arrow-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const SearchKnittingStatus = memo(
  ({ refs, onSearchButtonClick, knittingList }: Props) => {
    const today = DateUtils.today;
    const [selectedDate, setSelectedDate] = useState(today);

    /** 최초 날짜 세팅 */
    useEffect(() => {
      if (refs.dtsWk?.current) {
        refs.dtsWk.current.value = today;
      }
    }, [refs, today]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSearchButtonClick?.();
    };

    const onPrevDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, -1);
      setSelectedDate(newDate);
      refs.dtsWk.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate, refs, onSearchButtonClick]);

    const onNextDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, 1);
      setSelectedDate(newDate);
      refs.dtsWk.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate, refs, onSearchButtonClick]);

    return (
      <Card className="form-grid mt-n2" style={{height: 50}}>
        <Card.Body style={{ padding: "6px 10px" }}>
          <Row className="align-items-center g-2">
            {/* DATE */}
            <Col md={3}>
              <DateSummaryBox>
                <div className="date-label">DATE</div>

                <FormControl
                  type="date"
                  ref={refs["dtsWk"]}
                  value={selectedDate}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    refs.dtsWk.current!.value = e.target.value;
                  }}
                  className="form-control text-center date-input"
                />

                <div className="d-flex flex-column">
                  <ArrowButton
                    direction="up"
                    onClick={onPrevDay}
                    height={17}
                    arrowWidth={18}
                    arrowHeight={18}
                  />
                  <ArrowButton
                    direction="down"
                    onClick={onNextDay}
                    height={17}
                    arrowWidth={18}
                    arrowHeight={18}
                  />
                </div>
              </DateSummaryBox>
            </Col>

            {/* SUMMARY */}
            <Col md={9} style={{marginLeft: '-9px'}}>
                <KnittingStatusSummaryTab knittingList={knittingList} />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
);

export default SearchKnittingStatus;
