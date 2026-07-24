import React, {memo, useEffect, useState} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";

import ButtonComponent from "@components/common/ButtonComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import {InputRefMap} from "@utils/useInputRefs";
import {PagingUserListRes} from "@redux/system/SystemUserSlice";

import type {ReturnForm} from "./ReturnListRegisterView";

interface Props {
  returnForm: ReturnForm;
  setReturnForm: React.Dispatch<React.SetStateAction<ReturnForm>>;
  refs: InputRefMap<"userNm" | "cdDept" | "nmDept">;
  selectedRow: any;
}

const ReturnTopRegister = memo(({returnForm, setReturnForm, refs, selectedRow}: Props) => {
  const [isEditing, setIsEditing] = useState(false); //수정모드
  const [isShowUserPopup, setIsShowUserPopup] = useState(false);

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
    setReturnForm((prev) => ({
      ...prev,
      dtsDate: selectedRow.dtsDate || prev.dtsDate || formatDateForInput(new Date().toISOString().split("T")[0]),
      dtsSeq: selectedRow.dtsSeq || prev.dtsSeq, // 🔥 기존값 유지
      qrcode: selectedRow.qrcode || prev.qrcode,
      seqArticle: selectedRow.seqArticle || prev.seqArticle,
      cdWorker: selectedRow.cdWorker || prev.cdWorker,
      userNm: selectedRow.userNm || prev.userNm,
      remark: selectedRow.remark || prev.remark,
    }));
  }, [selectedRow, isEditing]);

  return (
    <>
      <Card className="form-grid mt-n3" style={{border: "1px solid #ddd", height: "45px"}}>
        <Card.Body>
          <Row>
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label required">RETURN DATE</label>
                <FormControl
                  name="dtsDate"
                  value={formatDateForInput(returnForm.dtsDate)}
                  type="date"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setReturnForm((p) => ({...p, dtsDate: formatDateForSave(e.target.value)}))}
                />
              </div>
            </Col>
            {/* Manager (담당자) */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label required">MANAGER</label>
                <FormControl
                  name="userNm"
                  ref={refs["userNm"]}
                  value={returnForm.userNm || ""}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={(e) => setReturnForm((p) => ({...p, userNm: e.target.value}))}
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

            {/* Remark */}
            <Col md={6} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">REMARK</label>
                <input
                  type="text"
                  name="remark"
                  value={returnForm.remark || ""}
                  className="form-control text-left fg-control"
                  autoComplete="off"
                  onChange={(e) => setReturnForm((p) => ({...p, remark: e.target.value}))}
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
          setReturnForm((p) => ({
            ...p,
            userNm: u.userNm,
            cdWorker: (u as any).userId || p.cdWorker,
          }));
        }}
        cdDept={refs["cdDept"]?.current?.value || ""}
        nmDept={refs["nmDept"]?.current?.value || ""}
      />
    </>
  );
});

export default ReturnTopRegister;
