import React, { memo, useState } from "react";
import { Button, Card, Col, FormControl, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { InputRefMap } from "../../../../utils/useInputRefs";
import { SaveRndArticleReq } from "../../../../redux/rnd/RndSlice";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
}

const FabricLibraryRegisterRemarkInfo = memo(({ articleList, setArticleList }: Props) => {
  const handleArticleChange = (field: keyof SaveRndArticleReq, value: string) => {
    setArticleList((prev) => {
      const updatedItem = { ...prev[0], [field]: value };
      return [updatedItem]; // 새로운 배열로 만들어서 memo 감지되도록
    });
  };

  return (
    <>
      <Card
        style={{
          border: "1px solid #ddd",
          transform: "translateY(-20px)",
          height: "140px",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <Card.Body>
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "10px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            REMARK
          </div>
          <Row>
            {/* Q'lty Concern 입력 필드 */}
            <Col md={12}>
              <div className="system-form-group d-flex align-items-center">
                <label className="remark-custom-label-class" style={{ height: "50px" }}>
                  Q'LTY CONCERN
                </label>
                <FormControl
                  as="textarea"
                  name="buyerNotify"
                  className="textarea-form-control"
                  autoComplete="off"
                  placeholder={"바이어에게 open 하는 내용"}
                  value={articleList[0]?.buyerNotify}
                  onChange={(e) => handleArticleChange("buyerNotify", e.target.value)}
                  style={{ height: "50px" }}
                />
              </div>
            </Col>
            {/* Internal Issue 입력 필드 */}
            <Col md={12}>
              <div className="system-form-group d-flex align-items-center">
                <label className="remark-custom-label-class" style={{ height: "50px" }}>
                  INTERNAL ISSUE
                </label>
                <FormControl
                  as="textarea"
                  name="internalNotify"
                  className="textarea-form-control"
                  autoComplete="off"
                  placeholder={"내부에 공유 하는 내용"}
                  value={articleList[0]?.internalNotify}
                  onChange={(e) => handleArticleChange("internalNotify", e.target.value)}
                  style={{ height: "50px" }}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterRemarkInfo;
