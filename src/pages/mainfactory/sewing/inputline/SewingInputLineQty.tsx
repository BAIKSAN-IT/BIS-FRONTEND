import React, {memo, useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";
import {formatDateToYYYYMMDD, isEmpty} from "@utils/CommonUtil";

import {HOURLY_SEWINGINPUT_QTY, SEWING_ACTUAL_TYPE, SEWING_TIME_TYPE,} from "@constants/factory/sewing/sewingInputLine";

import {getSewingInputLine} from "@redux/factory/factorySewingSlice";
import {getLineList, getTimeList} from "@redux/tablet/tabletSlice";

import SearchSewingInputLineQty from "./SearchSewingInputLineQty";
import CommonTable from "@components/table/CommonTable";
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import useInputRefs from "@utils/useInputRefs";
import {SewingInputLineQtyTableColumns} from "@pages/mainfactory/sewing/inputline/SewingInputLineQtyTableColumns";
import Swal from "sweetalert2";

const SewingInputLineQty = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };
  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  /** ================= 상태 ================= */
  const {refs, getValues} = useInputRefs(["dtsWk", "noStyle"]);
  const [list, setList] = useState<SEWING_ACTUAL_TYPE[]>([]);
  const [workTime, setWorkTime] = useState<SEWING_TIME_TYPE[]>([]);

  const [lineInfo, setLineInfo] = useState({
    stLine: "1",
    edLine: "22",
  });

  /** ================= 초기 Line / Time 조회 ================= */
  useEffect(() => {
    if (isEmpty(userEnvInfo)) return;

    const params = {
      ...userEnvInfo,
      processGbn: "0005",
    };

    // Line
    dispatch(getLineList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setLineInfo({
          stLine: payload.data[0].sewLn,
          edLine: payload.data[payload.data.length - 1].sewLn,
        });
      }
    });

    // Time
    dispatch(getTimeList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setWorkTime(payload.data);
      } else {
        setWorkTime(HOURLY_SEWINGINPUT_QTY);
      }
    });
  }, [userEnvInfo]);

  /** ================= 조회 ================= */
  const handleSearch = useCallback(
    () => {
      const {dtsWk, noStyle} = getValues();

      const targetDate = dtsWk
        ? formatDateToYYYYMMDD(new Date(dtsWk))
        : formatDateToYYYYMMDD(new Date());

      const params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        dtsWk: targetDate,
        stLine: lineInfo.stLine,
        edLine: lineInfo.edLine,
        noStyle: noStyle,
      };

      dispatch(getSewingInputLine(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setList(payload.data);
        } else {
          setList([]);
        }
      });
    },
    [dispatch, userEnvInfo, lineInfo]
  );

  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/sewingInputLine"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Sewing Input Line", path: "/sewingInputLine", active: true},
        ]}
      />
      <SearchSewingInputLineQty refs={refs} onSearchButtonClick={handleSearch}/>

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)'}}>
                  <CommonTable
                    columns={SewingInputLineQtyTableColumns()}
                    data={list}
                    theadClass="text-center font-12"
                    tableClass="table-custom-main-factory-background text-center font-10"
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

export default SewingInputLineQty;
