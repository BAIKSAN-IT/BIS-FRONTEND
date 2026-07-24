import React, { memo, useEffect, useState } from "react";
import { Card, Col, FormControl, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import ButtonComponent from "@components/common/ButtonComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import BuyerPopupComponent from "@components/modal/BuyerPopupComponent";
import BrandPopupComponent from "@components/modal/BrandPopupComponent";

import { AppDispatch, RootState } from "@redux/store";
import { InputRefMap } from "@utils/useInputRefs";
import { PagingUserListRes } from "@redux/system/SystemUserSlice";
import {
  CommonNeoeCodeRes,
  getCommonNeoeCodeDtlList,
  PisBuyerListRes,
  PisBrandListRes,
} from "@redux/common/commonSlice";
import IconComponent from "@components/common/IconComponent";
import { Payload } from "@constants/common/common";
import { isEmpty } from "@utils/CommonUtil";

import type { SendingForm } from "./SendingListRegisterView";

interface Props {
  sendingForm: SendingForm;
  setSendingForm: React.Dispatch<React.SetStateAction<SendingForm>>;
  refs: InputRefMap<"userNm" | "cdDept" | "nmDept">;
  selectedRow: any;
}

const SendingTopRegister = memo(({ sendingForm, setSendingForm, refs, selectedRow }: Props) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const [yearList, setYearList] = useState<CommonNeoeCodeRes[]>([]);
  const [seasonList, setSeasonList] = useState<CommonNeoeCodeRes[]>([]);
  const [sendList, setSendList] = useState<CommonNeoeCodeRes[]>([]);

  const [isEditing, setIsEditing] = useState(false); //수정모드
  const [isShowUserPopup, setIsShowUserPopup] = useState(false);
  const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);
  const [isShowBrandPopup, setIsShowBrandPopup] = useState(false);

  const [openSelect, setOpenSelect] = useState<string | null>(null);

  // ===============================
  // Code 조회 (년도 / 시즌)
  // ===============================
  const fetchYearList = () => {
    dispatch(
      getCommonNeoeCodeDtlList({
        cdCompany: user?.companyId || "",
        cdField: "CZ_CA00066",
        cdSysdef: "",
        cdFlag1: "",
        fg1Syscode: "",
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) setYearList(payload.data);
      else setYearList([]);
    });
  };

  const fetchSeasonList = () => {
    dispatch(
      getCommonNeoeCodeDtlList({
        cdCompany: user?.companyId || "",
        cdField: "CZ_CA00064",
        cdSysdef: "",
        cdFlag1: "",
        fg1Syscode: "",
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) setSeasonList(payload.data);
      else setSeasonList([]);
    });
  };

  const fetchSendList = () => {
    dispatch(
      getCommonNeoeCodeDtlList({
        cdCompany: user?.companyId || "",
        cdField: "CZ_RD00001",
        cdSysdef: "",
        cdFlag1: "",
        fg1Syscode: "",
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) setSendList(payload.data);
      else setSendList([]);
    });
  };

  useEffect(() => {
    fetchYearList();
    fetchSeasonList();
    fetchSendList();
  }, []);

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
    if (!selectedRow || isEditing) return;
    setSendingForm((prev) => ({
      ...prev,
      dtsDate: selectedRow.dtsDate || prev.dtsDate || formatDateForInput(new Date().toISOString().split("T")[0]),
      dtsSeq: selectedRow.dtsSeq || prev.dtsSeq, // 🔥 기존값 유지
      qrcode: selectedRow.qrcode || prev.qrcode,
      seqArticle: selectedRow.seqArticle || prev.seqArticle,
      cdSending: selectedRow.cdSending || prev.cdSending,
      recipient: selectedRow.recipient || prev.recipient,
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
  }, [selectedRow, isEditing]);

  // ===============================
  // Render
  // ===============================
  return (
    <>
      <Card className="form-grid mt-n3" style={{ border: "1px solid #ddd", height: "120px" }}>
        <Card.Body>
          <Row>
            {/* 기준일자 (dtsDate) */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">SEND DATE</label>
                <FormControl
                  name="dtsDate"
                  value={formatDateForInput(sendingForm.dtsDate)}
                  type="date"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, dtsDate: formatDateForSave(e.target.value) }))}
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
                  value={sendingForm.userNm || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, userNm: e.target.value }))}
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
                  value={sendingForm.nmBuyer || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, nmBuyer: e.target.value }))}
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
                  value={sendingForm.nmBrand || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, nmBrand: e.target.value }))}
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
                <label className="fg-label required">YEAR</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="dtsYear"
                    value={sendingForm.dtsYear || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) =>
                      setSendingForm((prev) => ({
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
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>

            {/* Season */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">SEASON</label>
                <div className="position-relative w-100">
                  <select
                    name="cdSeason"
                    value={sendingForm.cdSeason || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) => {
                      const selectedCd = e.target.value;
                      const season = seasonList.find((s) => s.cdSysdef === selectedCd);

                      setSendingForm((prev) => ({
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
            {/* Recipient */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">RECIPIENT</label>
                <input
                  type="text"
                  name="recipient"
                  value={sendingForm.recipient || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, recipient: e.target.value }))}
                />
              </div>
            </Col>
            {/* Send */}
            <Col md={3} style={{ transform: "translateY(-18px)" }}>
              <div className="fg-row">
                <label className="fg-label required">SEND</label>
                <div className="position-relative w-100">
                  <select
                    name="cdSending"
                    value={sendingForm.cdSending || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) => {
                      const selectedCd = e.target.value;
                      const send = sendList.find((s) => s.cdSysdef === selectedCd);

                      setSendingForm((prev) => ({
                        ...prev,
                        cdSending: selectedCd, // 저장용
                        nmSending: send?.nmSysdef || "", // 화면 표시용
                      }));
                    }}
                  >
                    {sendList.map((item, index) => (
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
                  value={sendingForm.topic || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, topic: e.target.value }))}
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
                  value={sendingForm.remark || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setSendingForm((p) => ({ ...p, remark: e.target.value }))}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 팝업 영역 */}
      <UserPopupComponent
        isShowUserPopup={isShowUserPopup}
        setIsShowUserPopup={setIsShowUserPopup}
        onClose={() => setIsShowUserPopup(false)}
        onUserSelect={(u: PagingUserListRes) => {
          setSendingForm((p) => ({
            ...p,
            userNm: u.userNm,
            cdDept: u.cdDept || p.cdDept,
            nmDept: u.nmDept || p.nmDept,
            cdWorker: (u as any).userId || p.cdWorker,
          }));
        }}
        cdDept={refs["cdDept"]?.current?.value || ""}
        nmDept={refs["nmDept"]?.current?.value || ""}
      />

      <BuyerPopupComponent
        isShowBuyerPopup={isShowBuyerPopup}
        setIsShowBuyerPopup={setIsShowBuyerPopup}
        onClose={() => setIsShowBuyerPopup(false)}
        onBuyerDoubleClickSelect={(b: PisBuyerListRes) => {
          setSendingForm((p) => ({ ...p, cdBuyer: b.cdBuyer, nmBuyer: b.nmBuyer }));
        }}
      />

      <BrandPopupComponent
        isShowBrandPopup={isShowBrandPopup}
        setIsShowBrandPopup={setIsShowBrandPopup}
        onClose={() => setIsShowBrandPopup(false)}
        onBrandDoubleClickSelect={(br: PisBrandListRes) => {
          setSendingForm((p) => ({
            ...p,
            cdBrand: br.cdBrand,
            nmBrand: br.nmBrand,
            cdBuyer: br.cdBuyer,
            nmBuyer: br.nmBuyer,
          }));
        }}
        nmBuyer={sendingForm.nmBuyer}
      />
    </>
  );
});

export default SendingTopRegister;
