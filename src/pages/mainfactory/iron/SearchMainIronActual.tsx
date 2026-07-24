import React, { memo, useCallback, useEffect, useState } from "react";
import { Card, Col, FormControl, Row } from "react-bootstrap";
import { DateUtils } from "@utils/dateUtils";
import { InputRefMap } from "@utils/useInputRefs";
import ArrowButton from "@components/common/ArrowButton";

interface Props {
  refs: InputRefMap<"dtsWk" | "noStyle">;

  /** 검색 실행 (부모 handleSearch) */
  onSearchButtonClick?: () => void;

  /** 엑셀 여부 */
  setExcelFlag: React.Dispatch<React.SetStateAction<"Y" | "N">>;
}
const SearchMainIronActual = memo(
  ({ refs, onSearchButtonClick, setExcelFlag }: Props) => {
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
        setExcelFlag("N");
        onSearchButtonClick?.();
      }
    };

    const onPrevDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, -1);
      setSelectedDate(newDate);
      refs.dtsWk.current!.value = newDate;
      setExcelFlag("N");
      onSearchButtonClick?.();
    }, [selectedDate]);

    const onNextDay = useCallback(() => {
      const newDate = DateUtils.addDaysDash(selectedDate, 1);
      setSelectedDate(newDate);
      refs.dtsWk.current!.value = newDate;
      setExcelFlag("N");
      onSearchButtonClick?.();
    }, [selectedDate]);

    return (
      <Card className="form-grid mt-n2" style={{ height: 50 }}>
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

                  <div className="d-flex flex-column ms-1">
                    <ArrowButton direction="up" onClick={onPrevDay} arrowWidth={14} arrowHeight={6} />
                    <ArrowButton direction="down" onClick={onNextDay} arrowWidth={14} arrowHeight={6} />
                  </div>
                </div>
              </div>
            </Col>

            {/* STYLE */}
            <Col md={3}>
              <div className="fg-row mt-n2">
                <label className="fg-label">STYLE</label>
                <div className="d-flex">
                  <FormControl
                    ref={refs["noStyle"]}
                    name="noStyle"
                    className="form-control custom-sewing-search-input"
                    autoComplete="off"
                    onKeyDown={handleKeyDown}
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

export default SearchMainIronActual;
