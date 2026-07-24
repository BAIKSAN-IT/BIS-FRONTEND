import React, {memo, useEffect, useState} from "react";
import {Card, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

import ButtonComponent from "@components/common/ButtonComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import BuyerPopupComponent from "@components/modal/BuyerPopupComponent";
import BrandPopupComponent from "@components/modal/BrandPopupComponent";

import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {InputRefMap} from "@utils/useInputRefs";
import {PagingUserListRes} from "@redux/system/SystemUserSlice";
import {
  CommonNeoeCodeRes,
  getCommonNeoeCodeDtlList,
  PisBrandListRes,
  PisBuyerListRes,
} from "@redux/common/commonSlice";
import type {RecapForm} from "./RecapListView";
import {Payload} from "@constants/common/common";
import {isEmpty} from "@utils/CommonUtil";
import IconComponent from "@components/common/IconComponent";

interface Props {
  recapForm: RecapForm;
  setRecapForm: React.Dispatch<React.SetStateAction<RecapForm>>;
  refs: InputRefMap<"userNm" | "cdDept" | "nmDept">;
  onEnterSearch?: () => void;
}

const SearchRecapListView = memo(({recapForm, setRecapForm, refs, onEnterSearch}: Props) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const {systemProgram, user} = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
    user: state.Auth.user,
  }));

  // 1. 각 코드 목록에 대한 상태
  const [yearList, setYearList] = useState<CommonNeoeCodeRes[]>([]);
  const [seasonList, setSeasonList] = useState<CommonNeoeCodeRes[]>([]);

  const [openSelect, setOpenSelect] = useState<string | null>(null); // 특정 select box ID만 관리
  const [isShowUserPopup, setIsShowUserPopup] = useState(false);
  const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);
  const [isShowBrandPopup, setIsShowBrandPopup] = useState(false);

  const canSearch = systemProgram?.some((p) => p.find === "1" && p.pageUrl === location.pathname) ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;
    onEnterSearch?.(); // 부모 컴포넌트에서 start/end로만 조회
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.form?.requestSubmit?.();
  };

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
    dispatch(getCommonNeoeCodeDtlList({...searchYearParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setYearList(payload.data);
      } else {
        setYearList([]);
      }
    });
  };

  const fetchSeasonList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchSeasonParams})).then((res: any) => {
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
          <form onSubmit={handleSubmit}>
            <Row>
              {/* 조회기간만 사용 — dtsDate는 API 미전송 */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">DATE</label>
                  <InputGroup>
                    <FormControl
                      type="date"
                      name="startDate"
                      value={recapForm.startDate || ""}
                      className="form-control text-center fg-control"
                      autoComplete="off"
                      onChange={(e) => setRecapForm((p) => ({...p, startDate: e.target.value}))}
                      onKeyDown={handleKeyDown}
                    />
                    <FormControl
                      type="date"
                      name="endDate"
                      value={recapForm.endDate || ""}
                      className="form-control text-center fg-control"
                      autoComplete="off"
                      min={recapForm.startDate || ""}
                      onChange={(e) => setRecapForm((p) => ({...p, endDate: e.target.value}))}
                      onKeyDown={handleKeyDown}
                    />
                  </InputGroup>
                </div>
              </Col>

              {/* Manager */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">MANAGER</label>
                  <FormControl
                    name="userNm"
                    ref={refs["userNm"]}
                    value={recapForm.userNm || ""}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    onChange={(e) => setRecapForm((p) => ({...p, userNm: e.target.value}))}
                    onKeyDown={handleKeyDown}
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
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">BUYER</label>
                  <FormControl
                    value={recapForm.nmBuyer || ""}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    onChange={(e) => setRecapForm((p) => ({...p, nmBuyer: e.target.value}))}
                    onKeyDown={handleKeyDown}
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
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">BRAND</label>
                  <FormControl
                    value={recapForm.nmBrand || ""}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    onChange={(e) => setRecapForm((p) => ({...p, nmBrand: e.target.value}))}
                    onKeyDown={handleKeyDown}
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
              <Col md={3} style={{transform: "translateY(-18px)"}}>
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
                      <option value=""></option>
                      {yearList.map((item, index) => (
                        <option key={index} value={item.nmSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>

              {/* Season */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
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
                      <option value=""></option>
                      {seasonList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>
              {/* Topic */}
              <Col md={6} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">TOPIC</label>
                  <input
                    type="text"
                    name="topic"
                    value={recapForm.topic || ""}
                    className="form-control text-left fg-control"
                    autoComplete="off"
                    onChange={(e) => setRecapForm((p) => ({...p, topic: e.target.value}))}
                  />
                </div>
              </Col>

              {/* Remark */}
              <Col md={6} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">REMARK</label>
                  <input
                    type="text"
                    value={recapForm.remark || ""}
                    className="form-control text-left fg-control"
                    autoComplete="off"
                    onChange={(e) => setRecapForm((p) => ({...p, remark: e.target.value}))}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </Col>
            </Row>

            {/* 엔터로 제출되도록 숨김 버튼 */}
            <button type="submit" style={{display: "none"}} aria-hidden="true"/>
          </form>
        </Card.Body>
      </Card>

      {/* 팝업들 */}
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

      <BuyerPopupComponent
        isShowBuyerPopup={isShowBuyerPopup}
        setIsShowBuyerPopup={setIsShowBuyerPopup}
        onClose={() => setIsShowBuyerPopup(false)}
        onBuyerDoubleClickSelect={(b: PisBuyerListRes) => {
          setRecapForm((p) => ({...p, cdBuyer: b.cdBuyer, nmBuyer: b.nmBuyer}));
        }}
      />

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

export default SearchRecapListView;
