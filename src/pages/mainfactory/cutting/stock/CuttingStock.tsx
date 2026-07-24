import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";

import SearchCuttingStock from "./SearchCuttingStock";
import {CuttingStockTableColumns} from "./CuttingStockTableColumns";
import {CUTTING_COLUMNS_TYPE} from "@constants/factory/cutting/cuttingStock";
import {getCuttingStock} from "@redux/factory/factoryCuttingSlice";
import CommonTable from "@components/table/CommonTable";
import useInputRefs from "@utils/useInputRefs";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";
import Swal from "sweetalert2";
const CuttingStock = memo(() => {
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

  const {refs, getValues} = useInputRefs(["dtsExfty","noStyle"]);
  const [isDateButtonClick, setIsDateButtonClick] = useState<boolean>(false);
  const [cuttingList, setCuttingList] = useState<CUTTING_COLUMNS_TYPE[]>([]);
  const [viewMode, setViewMode] =
    useState<"ALL" | "END" | "PROCESSING">("ALL");

  const handleSearch = useCallback(() => {
    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (!userEnvInfo.cdFty) {
      showAlert("Factory를 선택해 주세요.");
      return;
    }
    const { dtsExfty, noStyle } = getValues();

    const targetDate = dtsExfty
      ? formatDateToYYYYMMDD(new Date(dtsExfty))
      : formatDateToYYYYMMDD(new Date());

    const params = {
      cdCompany: userEnvInfo.cdCompany ?? "",
      cdBizarea: userEnvInfo.cdBizarea ?? "",
      cdFty: userEnvInfo.cdFty ?? "",
      dtsExfty: targetDate,
      excel: "N",
      currentBuyer: "00",
      currentPage: "1",
      limitPage: "10000",
      noStyle: noStyle,
    };

    dispatch(getCuttingStock(params)).then((res) => {
      const payload = res.payload as Payload;

      const updatedData = payload.data.map((item: CUTTING_COLUMNS_TYPE, index: number) => ({
        ...item,
        no: index + 1,
        className: item.cutStatus !== "END" ? "row-ing" : "",
      }));

      setCuttingList(updatedData);
    });
  }, [dispatch, userEnvInfo]);

  const columns = useMemo(
    () => CuttingStockTableColumns(),
    [viewMode]
  );
  const filteredData = useMemo(() => {
    if (viewMode === "ALL") return cuttingList;

    if (viewMode === "END") {
      return cuttingList.filter(
        (row) => row.cutStatus === "END"
      );
    }

    if (viewMode === "PROCESSING") {
      return cuttingList.filter(
        (row) => row.cutStatus !== "END"
      );
    }

    return cuttingList;
  }, [cuttingList, viewMode]);

  useEffect(() => {
    if (userEnvInfo.cdBizarea && userEnvInfo.cdFty) {
      handleSearch();
      setIsDateButtonClick(false);
    }
  }, [userEnvInfo.cdBizarea, userEnvInfo.cdFty, isDateButtonClick]);
  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/cuttingStock"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Cutting Stock", path: "/cuttingStock", active: true},
        ]}
      />

      <SearchCuttingStock
        refs={refs}
        onSearchButtonClick={handleSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsDateButtonClick={setIsDateButtonClick}
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

export default CuttingStock;
