import React, {memo, useCallback, useEffect, useState} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import {DateUtils} from "@utils/dateUtils";
import {InputRefMap} from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";
import SearchFactoryDashboardTab from "@pages/mainfactory/dashboard/SearchFactoryDashboardTab";
import {FactoryDashboardTab} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";

interface Props {
  refs: InputRefMap<"dtsWork">;
  onSearchButtonClick?: () => void;
  selectedTab: FactoryDashboardTab;
  onTabChange: (tab: FactoryDashboardTab) => void;
}

const SearchFactoryDashboard = memo(({
                                       refs,
                                       onSearchButtonClick,
                                       selectedTab,
                                       onTabChange,
                                     }: Props) => {
  const today = DateUtils.today;
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    if (refs?.dtsWork?.current) {
      refs.dtsWork.current.value = today;
    }
  }, [refs, today]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchButtonClick?.();
    }
  };

  const onPrevDay = useCallback(() => {
    const newDate = DateUtils.addDaysDash(selectedDate, -1);
    setSelectedDate(newDate);
    refs.dtsWork.current!.value = newDate;
    onSearchButtonClick?.();
  }, [selectedDate, refs, onSearchButtonClick]);

  const onNextDay = useCallback(() => {
    const newDate = DateUtils.addDaysDash(selectedDate, 1);
    setSelectedDate(newDate);
    refs.dtsWork.current!.value = newDate;
    onSearchButtonClick?.();
  }, [selectedDate, refs, onSearchButtonClick]);

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
                  ref={refs["dtsWork"]}
                  value={selectedDate}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    refs.dtsWork.current!.value = e.target.value;
                  }}
                  className="form-control fg-control text-center"
                />

                <div className="d-flex flex-column">
                  <ArrowButton direction="up" onClick={onPrevDay} arrowWidth={14} arrowHeight={6}/>
                  <ArrowButton direction="down" onClick={onNextDay} arrowWidth={14} arrowHeight={6}/>
                </div>
              </div>
            </div>
          </Col>

          <Col md={9}>
            <SearchFactoryDashboardTab
              selectedTab={selectedTab}
              onTabChange={onTabChange}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

export default SearchFactoryDashboard;
