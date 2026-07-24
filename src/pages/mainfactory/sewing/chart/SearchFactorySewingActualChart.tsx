import React, {memo, useCallback, useEffect, useState} from "react";
import {Card, Col, Form, FormControl, Row} from "react-bootstrap";
import {DateUtils} from "@utils/dateUtils";
import {InputRefMap} from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";
import {ChartMode} from "./FactorySewingActualChart";

interface Props {
  refs: InputRefMap<"dtsWk">,
  onSearchButtonClick?: () => void,
  mode?: ChartMode,
  onModeChange?: (m: any) => void
}

const SearchFactorySewingActualChart = memo(
  ({refs, onSearchButtonClick, mode, onModeChange}: Props) => {
    const today = DateUtils.today;
    const [selectedDate, setSelectedDate] = useState(today);

    /** 최초 날짜 세팅 */
    useEffect(() => {
      if (refs?.dtsWk?.current) {
        refs.dtsWk.current.value = today;
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
      refs.dtsWk.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate]);

    const onNextDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, 1);
      setSelectedDate(newDate);
      refs.dtsWk.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate]);
    const handleModeChange = (m: ChartMode) => {
      if (onModeChange) {
        onModeChange(m);
      }
    };
    return (
      <Card className="form-grid mt-n2" style={{height: 50}}>
        <Card.Body>
          <Row>
            {/* DATE */}
            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">DATE</label>
                <div className="d-flex align-items-center">
                  <FormControl
                    type="date"
                    ref={refs["dtsWk"]}
                    value={selectedDate}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      refs.dtsWk.current!.value = e.target.value;
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
              <div className="fg-row mt-n2">
                <label className="fg-label">OPTION</label>
                <div className="d-flex align-items-center">
                  <Form.Check
                    className={'ms-1'}
                    inline
                    type="radio"
                    name="chartMode"
                    id="chartMode-prod"
                    label="PRODUCTION QTY"
                    checked={mode === "PROD"}
                    style={{fontSize: '13px'}}
                    onChange={() => handleModeChange("PROD")}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="chartMode"
                    id="chartMode-line"
                    label="LINE COUNT"
                    checked={mode === "LINE"}
                    style={{fontSize: '13px'}}
                    onChange={() => handleModeChange("LINE")}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="chartMode"
                    id="chartMode-amount"
                    label="EARNING AMOUNT"
                    checked={mode === "AMOUNT"}
                    style={{fontSize: '13px'}}
                    onChange={() => handleModeChange("AMOUNT")}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="chartMode"
                    id="chartMode-sewer"
                    label="SEWER"
                    checked={mode === "SEWER"}
                    style={{fontSize: '13px'}}
                    onChange={() => handleModeChange("SEWER")}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
);

export default SearchFactorySewingActualChart;
