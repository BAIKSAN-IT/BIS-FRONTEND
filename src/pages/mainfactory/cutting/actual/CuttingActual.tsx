import React, {memo, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";

import SearchCuttingActual from "./SearchCuttingActual";
import {CuttingActualColorTableColumns} from "./CuttingActualColorTableColumns";
import CommonTable from "@components/table/CommonTable";

import {getCuttingActualColor, getCuttingActualStyle,} from "@redux/factory/factoryCuttingSlice";

import useInputRefs from "@utils/useInputRefs";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";

import {CUTTING_STYLE_COLUMNS_TYPE,} from "@constants/factory/cutting/cuttingActualStyle";
import {CuttingActualStyleTableColumns} from "@pages/mainfactory/cutting/actual/CuttingActualStyleTableColumns";
import Swal from "sweetalert2";

const CuttingActual = memo(() => {
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
  const dispatch = useDispatch<AppDispatch>();
  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const {refs, getValues} = useInputRefs(["dtsExfty", "noStyle"]);

  /** STYLE / COLOR */
  const [viewMode, setViewMode] = useState<"STYLE" | "COLOR">("STYLE");

  /** 조회 방식 (0: DATE, 1: STYLE) */
  const [swFind, setSwFind] = useState<string>('0');

  /** API 결과 */
  const [styleList, setStyleList] = useState<CUTTING_STYLE_COLUMNS_TYPE[]>([]);
  const [colorList, setColorList] = useState<CUTTING_STYLE_COLUMNS_TYPE[]>([]);

  /** 공통 조회 */
  const fetchData = () => {
    const {dtsExfty, noStyle} = getValues();
    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (!userEnvInfo.cdFty) {
      showAlert("Factory를 선택해 주세요.");
      return;
    }
    if (swFind === '1' && !noStyle?.trim()) {
      showAlert("STYLE을 입력해 주세요.");
      return;
    }

    const targetDate = dtsExfty
      ? formatDateToYYYYMMDD(new Date(dtsExfty))
      : formatDateToYYYYMMDD(new Date());

    const params = {
      cdCompany: userEnvInfo.cdCompany ?? "",
      cdBizarea: userEnvInfo.cdBizarea ?? "",
      cdFty: userEnvInfo.cdFty ?? "",
      dtsExfty: swFind === '0' ? targetDate : '',
      excel: "N",
      currentBuyer: "00",
      currentPage: "1",
      limitPage: "10000",
      noStyle: noStyle,
      swFind: swFind,
    };
    /** STYLE */
    if(viewMode === 'STYLE'){
      dispatch(getCuttingActualStyle(params)).then((res) => {
        const payload = res.payload as Payload;
        setStyleList(Array.isArray(payload?.data) ? payload.data : []);
        setColorList([]);
      });
    }else{
      /** COLOR */
      dispatch(getCuttingActualColor(params)).then((res) => {
        const payload = res.payload as Payload;
        setColorList(Array.isArray(payload?.data) ? payload.data : []);
        setStyleList([]);
      });
    }
  };

  /** 최초 진입 + 공장 변경 시 */
  useEffect(() => {
    if (userEnvInfo.cdBizarea && userEnvInfo.cdFty) {
      fetchData();
    }
  }, [userEnvInfo.cdBizarea, userEnvInfo.cdFty]);

  /** 테이블 컬럼 */
  const columns = useMemo(() => viewMode === "STYLE" ? CuttingActualStyleTableColumns() : CuttingActualColorTableColumns(), [viewMode]);

  /** 라디오 버튼에 따른 데이터 선택 */
  const tableData = useMemo(() => {
    return viewMode === "STYLE" ? styleList : colorList;
  }, [viewMode, styleList, colorList]);
  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/cuttingActual"
        onSearchButtonClick={fetchData}
        breadCrumbItems={[
          {label: "Cutting Actual", path: "/cuttingActual", active: true},
        ]}
      />

      <SearchCuttingActual
        refs={refs}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearchButtonClick={fetchData}
        swFind={swFind}
        setSwFind={setSwFind}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)'}}>
                  <CommonTable
                    columns={columns}
                    data={tableData}
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

export default CuttingActual;
