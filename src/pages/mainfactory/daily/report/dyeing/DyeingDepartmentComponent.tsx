import React, { memo } from "react";
import { Card, Col, Row } from "react-bootstrap";
/* redux */
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/* components */
import { factories } from "../DailyReport";
import DyeingDepartmentList from "./DyeingDepartmentList";

interface Props {
  dailyReportList: DailyReportListRes[] | [];
}

const DyeingDepartmentComponent = memo(({ dailyReportList }: Props) => {
  const filteredList = dailyReportList?.filter((r) => r.cdPart === "04") || [];
  return (
    <>
      {/* 리스트 */}
      <Card className="mt-n3">
        <Card.Body style={{ height: "490px" }}>
          <Row className="align-items-stretch d-flex flex-wrap">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1">
                <div className="mt-n3" style={{ fontWeight: 700, margin: "0px 0 4px", fontSize: 12, color: "#004b97" }}>
                  4. Dyeing Department
                </div>
                  <DyeingDepartmentList
                    factories={factories}
                    data={filteredList || []}
                    leftItemWidth={80}
                    leftSubWidth={85}
                    unitWidth={52}
                  />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});
export default DyeingDepartmentComponent;
