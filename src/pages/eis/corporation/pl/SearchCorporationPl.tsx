import React, { forwardRef, memo, useImperativeHandle } from "react";
import { Card, Col, FormControl, Row, Button } from "react-bootstrap";

/* utils */
import useFormRefs, { toYYYYMM } from "@utils/useFormRefs";

export type CorporationPlSearchHandle = {
  getValues: () => {
    dtsSyymm: string;
    dtsEyymm: string;
    cdCurrency: string;
    cdBizarea: string;
  };
};

interface Props {
  initialParams: {
    cdCompany: string;
    cdBizarea: string; // "1000,3000,5000,7000"
    dtsSyymm: string; // YYYYMM
    dtsEyymm: string; // YYYYMM
    cdCurrency: string; // "", "LOCAL", "USD", "KRW"
  };
  /**  추가: KRW 옆 전체보기 토글 표시/액션 */
  showAll?: boolean;
  onToggleShowAll?: () => void;
}

const SearchCorporationPl = memo(
  forwardRef<CorporationPlSearchHandle, Props>(({ initialParams, showAll = false, onToggleShowAll }, ref) => {
    const { inputRefs, radioGroupRefs, checkboxGroupRefs, getValues } = useFormRefs<
      "dtsSyymm" | "dtsEyymm",
      never,
      never,
      "cdCurrency",
      "cdBizarea"
    >({
      inputFields: ["dtsSyymm", "dtsEyymm"],
      radioGroups: { cdCurrency: { name: "currency" } },
      checkboxGroups: ["cdBizarea"],
      transforms: {
        dtsSyymm: toYYYYMM,
        dtsEyymm: toYYYYMM,
      },
    });

    useImperativeHandle(ref, () => ({
      getValues: () => {
        const v = getValues();
        return {
          dtsSyymm: v.dtsSyymm || initialParams.dtsSyymm,
          dtsEyymm: v.dtsEyymm || initialParams.dtsEyymm,
          cdCurrency: v.cdCurrency || initialParams.cdCurrency || "LOCAL",
          cdBizarea: v.cdBizarea || initialParams.cdBizarea,
        };
      },
    }));

    const bizareaOptions = [
      { code: "1000", label: "팬코본사" },
      { code: "3000", label: "VINA" },
      { code: "5000", label: "TAMTHANG" },
      { code: "7000", label: "BAGO" },
    ];

    return (
      <Card className="form-grid mt-n2" style={{ height: 50 }}>
        <Card.Body>
          <Row>
            {/* 날짜(YYYYMM) */}
            <Col md={4}>
              <div className="fg-row mt-n2">
                <label className="fg-label">DATE</label>
                <div className="d-flex">
                  <FormControl
                    type="month"
                    ref={inputRefs.dtsSyymm}
                    defaultValue={
                      initialParams.dtsSyymm
                        ? `${initialParams.dtsSyymm.slice(0, 4)}-${initialParams.dtsSyymm.slice(4, 6)}`
                        : ""
                    }
                    className="custom-sewing-search-input"
                  />
                  <FormControl
                    type="month"
                    ref={inputRefs.dtsEyymm}
                    defaultValue={
                      initialParams.dtsEyymm
                        ? `${initialParams.dtsEyymm.slice(0, 4)}-${initialParams.dtsEyymm.slice(4, 6)}`
                        : ""
                    }
                    className="custom-sewing-search-input"
                  />
                </div>
              </div>
            </Col>

            {/* Bizarea 체크박스 */}
            <Col md={4}>
              <div className="fg-row mt-n2">
                <label className="fg-label">Bizarea</label>
                <div ref={checkboxGroupRefs.cdBizarea} className="d-flex flex-wrap">
                  {bizareaOptions.map((biz) => (
                    <div key={biz.code} className="form-check form-check-inline">
                      <input
                        type="checkbox"
                        id={`biz-${biz.code}`}
                        value={biz.code}
                        defaultChecked={(initialParams.cdBizarea || "").split(",").includes(biz.code)}
                        className="form-check-input"
                      />
                      <label htmlFor={`biz-${biz.code}`} className="form-check-label">
                        {biz.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Currency 라디오 + KRW 옆 전체보기 버튼 */}
            <Col md={4}>
              <div className="fg-row mt-n2">
                <label className="fg-label">Currency</label>
                <div ref={radioGroupRefs.cdCurrency} className="d-flex flex-wrap align-items-center">
                  {["LOCAL", "USD", "KRW"].map((cur) => (
                    <div key={cur} className="form-check form-check-inline">
                      <input
                        type="radio"
                        id={`currency-${cur}`}
                        name="currency"
                        value={cur}
                        defaultChecked={(initialParams.cdCurrency || "LOCAL") === cur}
                        className="form-check-input"
                      />
                      <label htmlFor={`currency-${cur}`} className="form-check-label">
                        {cur}
                      </label>
                    </div>
                  ))}
                  {/*  KRW 옆에 붙는 전체보기 토글 버튼 */}
                  <Button
                    size="sm"
                    variant={showAll ? "secondary" : "outline-secondary"}
                    className="ms-2"
                    onClick={onToggleShowAll}
                    title={showAll ? "레벨별 보기로 전환" : "모든 레벨 한 번에 보기"}
                  >
                    {showAll ? "레벨보기" : "전체보기"}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  })
);

export default SearchCorporationPl;
