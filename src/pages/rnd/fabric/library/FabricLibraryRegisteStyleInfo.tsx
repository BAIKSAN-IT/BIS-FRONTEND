import React, { memo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import PisRndTable from "../../../../components/table/PisRndTable";
import { FabricLibraryRegisterStyleErpTableColumns } from "./FabricLibraryRegisterStyleErpTableColumns";

/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { SaveRndArticleReq } from "../../../../redux/rnd/RndSlice";

/* lb */
import Swal from "sweetalert2";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
}

const FabricLibraryRegisterStyleErpInfo = memo(({ articleList, setArticleList }: Props) => {

  return (
    <>
      {/* Style Information(ERP) */}
      <Card
        className="compact-card flex-grow-1"
        style={{
          border: "1px solid #ddd",
          height: 253,
          marginTop: -20,
          transition: "height .3s ease",
        }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <span style={{ fontWeight: "bold", fontSize: 14 }}>STYLE (ERP)</span>
          </div>

          <Row className="gx-3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card flex-grow-1 card-gray-border mt-1">
                <div className="fabric-register-table-container">
                  <PisRndTable
                    columns={FabricLibraryRegisterStyleErpTableColumns()}
                    data={["1"]}
                    /*updateData={updateDataProxy}*/
                    theadClass="table-custom-sales-light text-center font-12"
                    tableClass="table-custom-sales-background text-center font-12"
                    isSortable
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterStyleErpInfo;
