import React, { memo, useEffect, useState } from "react";
import { Card, Col, Form, FormControl, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

import ButtonComponent from "../../../../components/common/ButtonComponent";
import UserPopupComponent from "../../../../components/modal/UserPopupComponent";
import BuyerPopupComponent from "../../../../components/modal/BuyerPopupComponent";
import BrandPopupComponent from "../../../../components/modal/BrandPopupComponent";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { InputRefMap } from "../../../../utils/useInputRefs";
import { PagingUserListRes } from "../../../../redux/system/SystemUserSlice";
import {
  CommonNeoeCodeRes,
  getCommonNeoeCodeDtlList,
  PisBrandListRes,
  PisBuyerListRes,
} from "../../../../redux/common/commonSlice";
import type { RecapForm } from "./RecapListRegisterView";
import { RndArticleRecapRes } from "../../../../redux/rnd/RecapSlice";
import IconComponent from "../../../../components/common/IconComponent";
import { Payload } from "../../../../constants/common/common";
import { isEmpty } from "../../../../utils/CommonUtil";

interface Props {
  recapForm: RecapForm;
  setRecapForm: React.Dispatch<React.SetStateAction<RecapForm>>;
  refs: InputRefMap<"userNm" | "cdDept" | "nmDept">;
  selectedRow: RndArticleRecapRes | null;
}

const years = (count = 10) => {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => String(y - i));
};

const RecapTopRegister = memo(({ recapForm, setRecapForm, refs, selectedRow }: Props) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { systemProgram, user } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
    user: state.Auth.user,
  }));

  const [yearList, setYearList] = useState<CommonNeoeCodeRes[]>([]);
  const [seasonList, setSeasonList] = useState<CommonNeoeCodeRes[]>([]);

  const [openSelect, setOpenSelect] = useState<string | null>(null); // 특정 select box ID만 관리

  const [isShowUserPopup, setIsShowUserPopup] = useState(false);
  const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);
  const [isShowBrandPopup, setIsShowBrandPopup] = useState(false);

  // 2. 각 검색 파라미터 상태
  const [searchYearParams, setSearchYearParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA00066",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });
  const [searchSeasonParams, setSearchSeasonParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA00064",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  // 3. 각 코드 목록을 가져오는 별도의 검색 함수
  const fetchYearList = () => {
    dispatch(getCommonNeoeCodeDtlList({ ...searchYearParams })).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setYearList(payload.data);
      } else {
        setYearList([]);
      }
    });
  };

  const fetchSeasonList = () => {
    dispatch(getCommonNeoeCodeDtlList({ ...searchSeasonParams })).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSeasonList(payload.data);
      } else {
        setSeasonList([]);
      }
    });
  };

  // 4. 각 API 호출
  useEffect(() => {
    fetchYearList();
  }, [searchYearParams]);

  useEffect(() => {
    fetchSeasonList();
  }, [searchSeasonParams]);

  const formatDateForInput = (date?: string) => {
    if (!date) return "";
    if (date.includes("-")) return date; // 이미 변환된 경우
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };

  // YYYY-MM-DD → YYYYMMDD
  const formatDateForSave = (date?: string) => {
    if (!date) return "";
    return date.replace(/-/g, "");
  };
  useEffect(() => {
    if (selectedRow) {
      setRecapForm((prev) => ({
        ...prev,
        dtsDate: selectedRow.dtsDate || prev.dtsDate || formatDateForInput(new Date().toISOString().split("T")[0]),
        dtsSeq: selectedRow.dtsSeq || prev.dtsSeq,
        cdBuyer: selectedRow.cdBuyer || prev.cdBuyer,
        nmBuyer: selectedRow.nmBuyer || prev.nmBuyer,
        cdBrand: selectedRow.cdBrand || prev.cdBrand,
        nmBrand: selectedRow.nmBrand || prev.nmBrand,
        cdSeason: selectedRow.cdSeason || prev.cdSeason,
        nmSeason: selectedRow.nmSeason || prev.nmSeason,
        dtsYear: selectedRow.dtsYear || prev.dtsYear,
        cdWorker: selectedRow.cdWorker || prev.cdWorker,
        userNm: selectedRow.userNm || prev.userNm,
        cdDept: selectedRow.cdDept || prev.cdDept,
        nmDept: selectedRow.nmDept || prev.nmDept,
        topic: selectedRow.topic || prev.topic,
        remark: selectedRow.remark || prev.remark,
        remarkDetail: selectedRow.remarkDetail || prev.remarkDetail,
      }));
    }
  }, [selectedRow]);
  return (
    <>
      <Card
        className="form-grid mt-n3"
        style={{
          border: "1px solid #ddd",
          height: "120px",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <Card.Body>
          <Row>
            {/* 기준일자 (dtsDate) */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">INPUT DATE</label>
                <FormControl
                  name="dtsDate"
                  value={formatDateForInput(recapForm.dtsDate)}
                  type="date"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, dtsDate: formatDateForSave(e.target.value) }))}
                />
              </div>
            </Col>

            {/* Manager (담당자) */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">MANAGER</label>
                <FormControl
                  name="userNm"
                  ref={refs["userNm"]}
                  value={recapForm.userNm || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, userNm: e.target.value }))}
                />
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="ti-search"
                  txt=""
                  onClick={() => setIsShowUserPopup(true)}
                />
              </div>
            </Col>

            {/* Buyer */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">BUYER</label>
                <FormControl
                  value={recapForm.nmBuyer || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, nmBuyer: e.target.value }))}
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

            {/* Brand */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">BRAND</label>
                <FormControl
                  value={recapForm.nmBrand || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, nmBrand: e.target.value }))}
                />
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="ti-search"
                  txt=""
                  onClick={() => setIsShowBrandPopup(true)}
                />
              </div>
            </Col>

            {/* Year */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label">YEAR</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="dtsYear"
                    value={recapForm.dtsYear || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) =>
                      setRecapForm((prev) => ({
                        ...prev,
                        dtsYear: e.target.value,
                      }))
                    }
                  >
                    {yearList.map((item, index) => (
                      <option key={index} value={item.nmSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>

            {/* Season */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label">SEASON</label>
                <div className="position-relative w-100">
                  <select
                    name="cdSeason"
                    value={recapForm.cdSeason || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) => {
                      const selectedCd = e.target.value;
                      const season = seasonList.find((s) => s.cdSysdef === selectedCd);

                      setRecapForm((prev) => ({
                        ...prev,
                        cdSeason: selectedCd, // 저장용
                        nmSeason: season?.nmSysdef || "", // 화면 표시용
                      }));
                    }}
                  >
                    {seasonList.map((item, index) => (
                      <option key={index} value={item.cdSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>
            {/* Topic */}
            <Col md={6} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label">TOPIC</label>
                <input
                  type="text"
                  name="topic"
                  value={recapForm.topic || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, topic: e.target.value }))}
                />
              </div>
            </Col>

            {/* Remark */}
            <Col md={6} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label">REMARK</label>
                <input
                  type="text"
                  name="remark"
                  value={recapForm.remark || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setRecapForm((p) => ({ ...p, remark: e.target.value }))}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* 사용자 선택 팝업 */}
      <UserPopupComponent
        cdDept={refs["cdDept"]?.current?.value || ""}
        nmDept={refs["nmDept"]?.current?.value || ""}
        isShowUserPopup={isShowUserPopup}
        setIsShowUserPopup={setIsShowUserPopup}
        onClose={() => setIsShowUserPopup(false)}
        onUserSelect={(u: PagingUserListRes) => {
          if (refs["userNm"].current) refs["userNm"].current.value = u.userNm;
          if (refs["nmDept"].current) refs["nmDept"].current.value = u.nmDept;

          setRecapForm((p) => ({
            ...p,
            userNm: u.userNm,
            cdDept: u.cdDept || p.cdDept,
            nmDept: u.nmDept || p.nmDept,
            cdWorker: (u as any).userId || (u as any).loginId || (u as any).noEmp || p.cdWorker,
          }));
        }}
      />

      {/* 바이어 선택 팝업 */}
      <BuyerPopupComponent
        isShowBuyerPopup={isShowBuyerPopup}
        setIsShowBuyerPopup={setIsShowBuyerPopup}
        onClose={() => setIsShowBuyerPopup(false)}
        onBuyerDoubleClickSelect={(b: PisBuyerListRes) => {
          setRecapForm((p) => ({
            ...p,
            cdBuyer: b.cdBuyer,
            nmBuyer: b.nmBuyer,
          }));
        }}
      />

      {/* 브랜드 선택 팝업 */}
      <BrandPopupComponent
        isShowBrandPopup={isShowBrandPopup}
        setIsShowBrandPopup={setIsShowBrandPopup}
        onClose={() => setIsShowBrandPopup(false)}
        onBrandDoubleClickSelect={(br: PisBrandListRes) => {
          setRecapForm((p) => ({
            ...p,
            cdBrand: br.cdBrand,
            nmBrand: br.nmBrand,
            cdBuyer: br.cdBuyer,
            nmBuyer: br.nmBuyer,
          }));
        }}
        nmBuyer={recapForm.nmBuyer}
      />
    </>
  );
});

export default RecapTopRegister;
