import React, {memo} from "react";
import {Card, Col, Row} from "react-bootstrap";

/* components */
import {factories} from "../DailyReport";
import TotalStatusList from "./TotalStatusList";

/* redux */
import {DailyReportListRes} from "@redux/mainfactory/daily/DailyStatusSlice";

interface Props {
  dailyReportList: DailyReportListRes[] | [];
}

const TotalStatusComponent = memo(({dailyReportList}: Props) => {
  const filteredList = dailyReportList?.filter((r) => r.cdPart === "06") || [];
  return (
    <>
      {/* 리스트 */}
      <Card className="mt-n3">
        <Card.Body style={{height: "155px"}}>
          <Row className="align-items-stretch d-flex flex-wrap">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1">
                <div className="mt-n3" style={{fontWeight: 700, margin: "0px 0 4px", fontSize: 12, color: "#004b97"}}>
                  6. Total (Sewing, Knitting, Dyeing, Yarn dyeing)
                </div>
                  <TotalStatusList
                    factories={factories}
                    data={filteredList || []}
                    leftItemWidth={165}
                    unitWidth={312}
                  />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default TotalStatusComponent;
