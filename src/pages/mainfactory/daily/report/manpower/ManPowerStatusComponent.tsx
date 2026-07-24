import React, { memo } from "react";
import { Card, Col, Row } from "react-bootstrap";

/* redux */
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/* components */
import { factories } from "../DailyReport";
import ManPowerStatusList from "./ManPowerStatusList";

interface Props {
  dailyReportList: DailyReportListRes[] | [];
}

const ManPowerStatusComponent = memo(({ dailyReportList }: Props) => {
  const filteredList = dailyReportList?.filter((r) => r.cdPart === "01") || [];
  return (
    <>
      {/* 리스트 */}
      <Card>
        <Card.Body style={{ height: "260px" }}>
          <Row className="align-items-stretch d-flex flex-wrap">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1">
                <div className="mt-n3" style={{ fontWeight: 700, margin: "0px 0 4px", fontSize: 12, color: "#004b97" }}>
                  1. Man Power Status (widthout meternity leave) Department
                </div>
                  <ManPowerStatusList
                    factories={factories}
                    data={filteredList || []}
                    leftItemWidth={165}
                    unitWidth={98.5}
                  />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default ManPowerStatusComponent;
