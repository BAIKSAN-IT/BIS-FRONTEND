import React, {memo, useCallback, useEffect, useState} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import ButtonComponent from "@components/common/ButtonComponent";
import {DateUtils} from "@utils/dateUtils";
import {InputRefMap} from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";

interface Props {
  refs: InputRefMap<"dtsExfty" | "noStyle">;
  viewMode: "ALL" | "END" | "PROCESSING",
  setViewMode: (v: "ALL" | "END" | "PROCESSING") => void,
  setIsDateButtonClick?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
  onSearchButtonClick?: () => void
}
const SearchCuttingStock = memo(
  ({ refs, viewMode, setViewMode, setIsDateButtonClick, onSearchButtonClick }: Props) => {

    const today = DateUtils.today; // "YYYY-MM-DD"
    const [selectedDate, setSelectedDate] = useState<string>(today);

    useEffect(() => {
      if (refs?.dtsExfty?.current) {
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
      setIsDateButtonClick?.(true);
    }, [selectedDate]);

    const onNextDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, 1);
      setSelectedDate(newDate);
      refs.dtsExfty.current!.value = newDate;
      setIsDateButtonClick?.(true);
    }, [selectedDate]);

    return (
      <Card className="form-grid mt-n2" style={{ height: 50 }}>
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
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    refs.dtsExfty.current!.value = e.target.value;
                  }}
                  className="form-control fg-control text-center"
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
                    className="form-control custom-sewing-search-input"
                    autoComplete="off"
                    onKeyPress={handleKeyDown}
                  />
                </div>
              </div>
            </Col>

            <Col md={4}>
              <div className="fg-row d-flex gap-3 mt-n1">
                {["ALL", "END", "PROCESSING"].map((v) => (
                  <label key={v}>
                    <input
                      type="radio"
                      checked={viewMode === v}
                      onChange={() => setViewMode(v as any)}
                    />{" "}
                    {v === "ALL" ? "ALL" : v}
                  </label>
                ))}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
);

export default SearchCuttingStock;
