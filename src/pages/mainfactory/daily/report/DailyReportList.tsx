import React, {memo} from "react";
import {Card, Col, Row} from "react-bootstrap";

/* redux */
import {DailyReportListRes} from "@redux/mainfactory/daily/DailyStatusSlice";

/* components */
import SewingDepartmentComponent from "./sewing/SewingDepartmentComponent";
import ManPowerStatusComponent from "./manpower/ManPowerStatusComponent";
import KnittingDepartmentComponent from "./knitting/KnittingDepartmentComponent";
import YarnDyeingDepartmentComponent from "./yarndyeing/YarnDyeingDepartmentComponent";
import TotalStatusComponent from "./total/TotalStatusComponent";
import DyeingDepartmentComponent from "./dyeing/DyeingDepartmentComponent";

interface Props {
  dailyReportList: DailyReportListRes[] | [];
}

const DailyReportList = memo(({dailyReportList}: Props) => {
  return (
    <>
      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n2">
            <Col xs={12} className="d-flex flex-column" style={{height: "calc(76vh - 54px)", overflow: 'auto'}}>
              <ManPowerStatusComponent dailyReportList={dailyReportList}/>
              <SewingDepartmentComponent dailyReportList={dailyReportList}/>
              <KnittingDepartmentComponent dailyReportList={dailyReportList}/>
              <DyeingDepartmentComponent dailyReportList={dailyReportList}/>
              <YarnDyeingDepartmentComponent dailyReportList={dailyReportList}/>
              <TotalStatusComponent dailyReportList={dailyReportList}/>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default DailyReportList;
