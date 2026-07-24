import React, {forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState,} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import {compactToDashed, ymdDashedToCompact} from "@utils/CommonUtil";

export type SixMonthOrderStatusSearchHandle = {
  getValues: () => {
    periodYear: string;
    dtBegin: string;
  };
};

interface Props {
  periodYear: string;
  periodWeek: string;
  dtBegin: string;
  dtEnd: string;
  onChangeBaseDate: () => void;
  viewMode?: "BOTH" | "PCS" | "AMOUNT"
  setViewMode?: (value: (((prevState: ("BOTH" | "PCS" | "AMOUNT")) => ("BOTH" | "PCS" | "AMOUNT")) | "BOTH" | "PCS" | "AMOUNT")) => void
};

const normalizeToDashed = (v: string) => {
  const s = (v ?? "").trim();
  if (!s) return "";
  if (s.includes("-")) return s.substring(0, 10);
  return compactToDashed(s.substring(0, 8));
};

const SearchSixMonthStatus = memo(
  forwardRef<SixMonthOrderStatusSearchHandle, Props>(
    ({periodYear, periodWeek, dtBegin, dtEnd, onChangeBaseDate, viewMode, setViewMode}, ref) => {
      /** 서버 기준 표시용 */
      const [viewBegin, setViewBegin] = useState("");
      const [viewEnd, setViewEnd] = useState("");

      /** 실제 기준 Date 값 */
      const [baseDate, setBaseDate] = useState("");

      /** hidden date input ref */
      const dateInputRef = useRef<HTMLInputElement>(null);

      /** 서버 값 반영 */
      useEffect(() => {
        const b = normalizeToDashed(dtBegin);
        const e = normalizeToDashed(dtEnd);
        setViewBegin(b);
        setViewEnd(e);
        setBaseDate(b);
      }, [dtBegin, dtEnd]);

      useEffect(() => {
        if (!baseDate) return;
        onChangeBaseDate();
      }, [baseDate]);

      useImperativeHandle(ref, () => ({
        getValues: () => ({
          periodYear: baseDate.substring(0, 4),
          dtBegin: ymdDashedToCompact(baseDate),
        }),
      }));

      const weeklyText = useMemo(() => {
        if (!periodYear || !periodWeek) return "";
        return `${periodYear} ${periodWeek}번째 주`;
      }, [periodYear, periodWeek]);

      /** WEEKLY 클릭 → date picker open */
      const openDatePicker = () => {
        if (!dateInputRef.current) return;

        const input = dateInputRef.current as HTMLInputElement & {
          showPicker?: () => void;
        };

        if (input.showPicker) {
          input.showPicker();
        } else {
          input.click();
        }
      };

      return (
        <Card className="form-grid mt-n2" style={{height: 50}}>
          <Card.Body>
            <Row>
              {/* WEEKLY */}
              <Col md={3}>
                <div className="fg-row mt-n2">
                  <label className="fg-label">WEEKLY</label>

                  <div style={{position: "relative"}}>
                    <FormControl
                      className="form-control fg-control text-center"
                      type="text"
                      value={weeklyText}
                      readOnly
                      onClick={openDatePicker}
                      style={{
                        cursor: "pointer",
                        paddingRight: "30px", // 아이콘 공간 확보
                      }}
                    />

                    <span
                      onClick={openDatePicker}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: 14,
                        opacity: 0.7,
                      }}
                    >
                      📅
                    </span>
                  </div>

                  {/* hidden date input */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                      width: 0,
                      height: 0,
                    }}
                  />
                </div>
              </Col>

              {/* 서버 기준 기간 */}
              <Col md={3}>
                <div className="fg-row d-flex mt-n2">
                  <FormControl
                    className="form-control fg-control text-center"
                    type="date"
                    value={viewBegin}
                    readOnly
                  />
                  ~
                  <FormControl
                    className="form-control fg-control text-center"
                    type="date"
                    value={viewEnd}
                    readOnly
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="fg-row d-flex gap-3 mt-n1">
                  {["BOTH", "PCS", "AMOUNT"].map((v) => (
                    <label key={v}>
                      <input
                        type="radio"
                        checked={viewMode === v}
                        onChange={() => setViewMode ? setViewMode(v as any) : ''}
                      />{" "}
                      {v === "BOTH" ? "PCS + AMOUNT" : v}
                    </label>
                  ))}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      );
    }
  )
);

export default SearchSixMonthStatus;
