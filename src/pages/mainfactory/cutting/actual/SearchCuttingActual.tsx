import React, {memo, useCallback, useEffect, useState} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import {DateUtils} from "@utils/dateUtils";
import {InputRefMap} from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";

interface Props {
  refs: InputRefMap<"dtsExfty" | "noStyle">;
  viewMode: "STYLE" | "COLOR";
  setViewMode: (v: "STYLE" | "COLOR") => void;
  onSearchButtonClick?: () => void;
  swFind: string;
  setSwFind: (v: string) => void;
}

const SearchCuttingActual = memo(
  ({refs, viewMode, setViewMode, onSearchButtonClick, swFind, setSwFind}: Props) => {
    const today = DateUtils.today;
    const [selectedDate, setSelectedDate] = useState(today);

    /** 최초 날짜 세팅 */
    useEffect(() => {
      if (refs.dtsExfty?.current) {
        refs.dtsExfty.current.value = today;
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
      refs.dtsExfty.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate]);

    const onNextDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, 1);
      setSelectedDate(newDate);
      refs.dtsExfty.current!.value = newDate;
      onSearchButtonClick?.();
    }, [selectedDate]);

    return (
      <Card className="form-grid mt-n2" style={{height: 50}}>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">DATE</label>
                <div className="d-flex align-items-center">
                  <FormControl
                    type="date"
                    ref={refs["dtsExfty"]}
                    value={selectedDate}
                    onKeyDown={handleKeyDown}
                    className={'form-control fg-control text-center'}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      refs.dtsExfty.current!.value = e.target.value;
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

            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">STYLE</label>
                <div className="d-flex">
                  <FormControl
                    ref={refs["noStyle"]}
                    name="noStyle"
                    className={`form-control custom-sewing-search-input`}
                  />
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">OPTION</label>
                <div className="d-flex ms-1 gap-1" style={{fontSize: 'clamp(9px, 0.65vw, 18px)'}}>
                  <label>
                    <input
                      type="radio"
                      checked={swFind === '0'}
                      onChange={() => setSwFind('0')}
                      style={{transform: 'translateY(2px)'}}
                    />{" "}
                    DATE
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={swFind === '1'}
                      onChange={() => setSwFind('1')}
                      style={{transform: 'translateY(2px)'}}
                    />{" "}
                    STYLE
                  </label>
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">STYLE/COLOR</label>
                <div className="d-flex ms-1 gap-1" style={{fontSize: 'clamp(9px, 0.65vw, 18px)'}}>
                  {["STYLE", "COLOR(SIZE)"].map((v) => (
                    <label key={v}>
                      <input
                        type="radio"
                        checked={viewMode === v}
                        onChange={() => setViewMode(v as any)}
                        style={{transform: 'translateY(2px)'}}
                      />{" "}
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </Col>

          </Row>
        </Card.Body>
      </Card>
    );
  }
);

export default SearchCuttingActual;
