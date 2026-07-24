import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";

import SearchMainSewingStatus from "./SearchMainSewingStatus";
import {MainSewingStatusTableColumns} from "./MainSewingStatusTableColumns";
import {CUTTING_COLUMNS_TYPE} from "@constants/factory/cutting/cuttingStock";
import {getCuttingStock} from "@redux/factory/factoryCuttingSlice";
import CommonTable from "@components/table/CommonTable";
import useInputRefs from "@utils/useInputRefs";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";
import Swal from "sweetalert2";
import {getSewingStatusList, SewingStatusReq, SewingStatusRes} from "@redux/mainfactory/sewing/SewingStatusSlice";
const MainSewingStatus = memo(() => {
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

  const {refs, getValues} = useInputRefs(["dtsWk","clrszSumYn",'dtsWkF','nmBuyer','noStyle']);
  const [sewingStatusList, setSewingStatusList] = useState<SewingStatusRes[]>([]);

  const handleSearch = useCallback(() => {
    const { dtsWk,clrszSumYn,dtsWkF,nmBuyer,noStyle } = getValues();

    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (clrszSumYn === '' && nmBuyer === '' && noStyle === '') {
      showAlert("PO 검색 시 BUYER나 STYLE은 필수 입니다.");
      return;
    }

    const targetPrevDate = dtsWkF
      ? formatDateToYYYYMMDD(new Date(dtsWkF))
      : formatDateToYYYYMMDD(new Date());

    const targetDate = dtsWk
      ? formatDateToYYYYMMDD(new Date(dtsWk))
      : formatDateToYYYYMMDD(new Date());

    const params: SewingStatusReq = {
      cdCompany: userEnvInfo.cdCompany ?? "",
      cdBizarea: userEnvInfo.cdBizarea ?? "",
      seqStyle: 0,
      dtsWk: targetDate,
      clrszSumYn: clrszSumYn ?? "SUM",
      cdBizareaB: userEnvInfo.cdCompany ?? "",
      seqStyleLst: "",
      dtsWkF: targetPrevDate, //이전날
      nmBuyer: nmBuyer ?? "",
      cdFty: userEnvInfo.cdFty ?? "",
      planEx: "Y",
      noStyle: noStyle ?? '',
    };

    dispatch(getSewingStatusList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        const updatedData = payload.data.map((item: SewingStatusRes, index: number) => ({
          ...item,
          no: index + 1,
          /*className: item.cutStatus !== "END" ? "row-ing" : "",*/
        }));
        setSewingStatusList(updatedData);
      }else{
        setSewingStatusList([]);
      }
    });
  }, [dispatch, userEnvInfo]);

  const columns = useMemo(
    () => MainSewingStatusTableColumns(),
    []
  );
  const filteredData = useMemo(() => {

    return sewingStatusList;
  }, [sewingStatusList, ]);

  return (
    <>
      <EisPageTitleBar
        pageNm="Factory"
        pageUrl="/sewing/status"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Sewing Status", path: "/sewing/status", active: true},
        ]}
      />

      <SearchMainSewingStatus
        refs={refs}
        onSearchButtonClick={handleSearch}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)'}}>
                  <CommonTable
                    columns={columns}
                    data={filteredData}
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

export default MainSewingStatus;
