import React, {memo, useState} from "react";
import {Card, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";

import ButtonComponent from "@components/common/ButtonComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import {InputRefMap} from "@utils/useInputRefs";
import {PagingUserListRes} from "@redux/system/SystemUserSlice";
import type {ReturnForm} from "./ReturnListView";

interface Props {
  returnForm: ReturnForm;
  setReturnForm: React.Dispatch<React.SetStateAction<ReturnForm>>;
  refs: InputRefMap<"userNm" | "cdDept" | "nmDept">;
  onEnterSearch: () => void;
  ReturnForm?: ReturnForm;
}

const SearchReturnListView = memo(({returnForm, setReturnForm, refs, onEnterSearch}: Props) => {
  // 1. 각 코드 목록에 대한 상태
  const [isShowUserPopup, setIsShowUserPopup] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.form?.requestSubmit?.();
  };

  return (
    <>
      <Card
        className="form-grid mt-n3"
        style={{
          border: "1px solid #ddd",
          height: "45px",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <Card.Body>
          <Row>
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label ">RETURN DATE</label>
                <InputGroup>
                  <FormControl
                    type="date"
                    name="startDate"
                    value={returnForm.startDate || ""}
                    className="form-control text-center fg-control"
                    autoComplete="off"
                    onChange={(e) => setReturnForm((p) => ({...p, startDate: e.target.value}))}
                    onKeyDown={handleKeyDown}
                  />
                  <FormControl
                    type="date"
                    name="endDate"
                    value={returnForm.endDate || ""}
                    className="form-control text-center fg-control"
                    autoComplete="off"
                    min={returnForm.startDate || ""}
                    onChange={(e) => setReturnForm((p) => ({...p, endDate: e.target.value}))}
                    onKeyDown={handleKeyDown}
                  />
                </InputGroup>
              </div>
            </Col>
            {/* Manager (담당자) */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label ">MANAGER</label>
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

          setReturnForm((p) => ({
            ...p,
            userNm: u.userNm,
            cdWorker: (u as any).userId || (u as any).loginId || (u as any).noEmp || p.cdWorker,
          }));
        }}
      />
    </>
  );
});

export default SearchReturnListView;
