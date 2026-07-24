import React, {memo} from "react";
import {Card, Col, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import

/* redux */
import {SaveRndArticleReq} from "@redux/rnd/RndSlice";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
}

const FabricLibraryRegisterKnittingInfo = memo(({articleList, setArticleList}: Props) => {

  const handleArticleChange = (field: keyof SaveRndArticleReq, value: string) => {
    setArticleList((prev) => {
      const updatedItem = {...prev[0], [field]: value};
      return [updatedItem]; // 새로운 배열로 만들어서 memo 감지되도록
    });
  };
  return (
    <>
      {/* Knitting */}
      <Card style={{transform: "translateY(-30px)", height: "60px", width: "50%"}}>
        <Card.Body>
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "10px",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            KNITTING
          </div>
          <Row>
            {/* Machine inch 입력 필드 */}
            <Col md={4} style={{}}>
              <div className="d-flex align-items-center mb-2 position-relative">
                <label className="search-custom-fabric-input-label-class">MACHINE</label>
                <input
                  type="text"
                  name="widthInch"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px", paddingRight: "28px"}}
                  autoComplete="off"
                  value={articleList[0]?.widthInch || 0}
                  onChange={(e) => handleArticleChange("widthInch", e.target.value)}
                />

                {/* 숫자 뒤에 붙어 보이는 "INCH" */}
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "8px",
                    transform: "translateY(-50%)",
                    fontSize: "10px",
                    color: "#777",
                    pointerEvents: "none",
                  }}
                >
    Inch
  </span>
              </div>
            </Col>
            {/* Gauge 입력 필드 */}
            <Col md={4} style={{}}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">GAUGE</label>
                <input
                  type="text"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px"}}
                  autoComplete="off"
                  value={articleList[0]?.fabricGauge || ""}
                  onChange={(e) => handleArticleChange("fabricGauge", e.target.value)}
                />
              </div>
            </Col>
            {/* 침수 입력 필드 */}
            <Col md={4} style={{}}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">NEEDLE</label>
                <input
                  type="text"
                  name="nuNidcnt"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px"}}
                  autoComplete="off"
                  value={articleList[0]?.nuNidcnt || 0}
                  onChange={(e) => handleArticleChange("nuNidcnt", e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterKnittingInfo;
