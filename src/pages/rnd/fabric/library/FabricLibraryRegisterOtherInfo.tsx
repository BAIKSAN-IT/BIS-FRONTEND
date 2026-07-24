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

const FabricLibraryRegisterOtherInfo = memo(({ articleList, setArticleList }: Props) => {
  const handleArticleChange = (field: keyof SaveRndArticleReq, value: string) => {
    setArticleList((prev) => {
      const updatedItem = { ...prev[0], [field]: value };
      return [updatedItem]; // 새로운 배열로 만들어서 memo 감지되도록
    });
  };

  const handleIncreaseQtyKeep = () => {
    setArticleList((prev) => {
      const currentQty = Number(prev[0]?.qtyKeep) || 0;
      const updatedItem = { ...prev[0], qtyKeep: currentQty + 1 };
      return [updatedItem];
    });
  };
  return (
    <>
      <Card
        style={{
          border: "1px solid #ddd",
          transform: "translateY(-20px)",
          height: "60px",
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
              fontSize: "12px",
            }}
          >
            Others Information
          </div>
          <Row>
            {/* Keep+ 버튼 */}
            {/* Supplier Article# */}
            <Col md={4}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">Garment Style#</label>
                <input
                  type="text"
                  name={"garmentSample"}
                  className="form-control"
                  style={{ height: "27px", fontSize: "10px" }}
                  autoComplete="off"
                  value={articleList[0]?.garmentSample}
                  onChange={(e) => handleArticleChange("garmentSample", e.target.value)}
                />
              </div>
            </Col>
            {/* Supplier Article# */}
            <Col md={5}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">Garment Desc.</label>
                <input
                  type="text"
                  name={"styleDesc"}
                  className="form-control"
                  style={{ height: "27px", fontSize: "10px" }}
                  autoComplete="off"
                  value={articleList[0]?.styleDesc || ""}
                  onChange={(e) => handleArticleChange("styleDesc", e.target.value)}
                />
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-2 w-100">
                <label className="search-custom-fabric-input-label-class" style={{ width: "100px" }}>
                  Keep Qty
                </label>
                <div className="input-group" style={{ height: "27px", fontSize: "10px" }}>
                  <input
                    type="text"
                    name="qtyKeep"
                    value={articleList[0]?.qtyKeep || 0}
                    className="form-control text-end"
                    autoComplete="off"
                    style={{ fontSize: "10px", height: "27px" }}
                    onChange={(e) => handleArticleChange("qtyKeep", e.target.value)}
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    style={{ fontSize: "10px", height: "27px" }}
                    onClick={handleIncreaseQtyKeep}
                  >
                    Keep+
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterOtherInfo;
