import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";

import SearchMainPacking from "./SearchMainPacking";
import CommonTable from "@components/table/CommonTable";
import useInputRefs from "@utils/useInputRefs";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";
import {MainPackingTableColumns} from "@pages/mainfactory/packing/MainPackingTableColumns";

import Swal from "sweetalert2";
import {PACKING_COLUMNS_TYPE} from "@constants/factory/packing/packing";
import {getPackingActual} from "@redux/factory/factoryPackingSlice";

const MainPacking = memo(() => {
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

  const {refs, getValues} = useInputRefs(["dtsWk", "noStyle"]);
  const [isDateButtonClick, setIsDateButtonClick] = useState<boolean>(false);
  const [mainPackingList, setMainPackingList] = useState<PACKING_COLUMNS_TYPE[]>([]);

  /** 화면에 실제로 보여줄 데이터 */
  const [visibleList, setVisibleList] = useState<PACKING_COLUMNS_TYPE[]>([]);

  /** 펼쳐진 부모 키 (예: numClr) */
  const [expandedNumClr, setExpandedNumClr] = useState<string | null>(null);


  const handleSearch = useCallback(() => {
    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (!userEnvInfo.cdFty) {
      showAlert("Factory를 선택해 주세요.");
      return;
    }
    const {dtsWk, noStyle} = getValues();

    const targetDate = dtsWk
      ? formatDateToYYYYMMDD(new Date(dtsWk))
      : formatDateToYYYYMMDD(new Date());

    const params = {
      cdCompany: userEnvInfo.cdCompany ?? "",
      cdBizarea: userEnvInfo.cdBizarea ?? "",
      cdFty: userEnvInfo.cdFty ?? "",
      dtsWk: targetDate,
      excel: 'N',
      noStyle: noStyle,
    };

    dispatch(getPackingActual(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        const raw = payload.data;

        setMainPackingList(raw);

        // 최초: 부모만 + className 부여
        setVisibleList(
          raw
            .filter((r: any) => r.sw === "0")
            .map((r: any) => ({
              ...r,
              className: "parent-row",
            }))
        );

        setExpandedNumClr(null);
      } else {
        setMainPackingList([]);
        setVisibleList([]);
      }
    });
  }, [dispatch, userEnvInfo]);

  const handleRowClick = useCallback(
    (row: PACKING_COLUMNS_TYPE) => {

      // 부모 클릭
      if (row.sw === "0") {
        if (expandedNumClr === row.numClr) {
          // 접기
          setVisibleList(
            mainPackingList
              .filter(r => r.sw === "0")
              .map(r => ({
                ...r,
                className:
                  r.numClr === row.numClr
                    ? "parent-row row-selected"
                    : "parent-row",
              }))
          );
          setExpandedNumClr(null);
        } else {
          // 펼치기
          setVisibleList(
            mainPackingList
              .filter(r => r.sw === "0" || r.numClr === row.numClr)
              .map(r => ({
                ...r,
                className:
                  r.numClr === row.numClr
                    ? r.sw === "0"
                      ? "parent-row row-selected"
                      : "child-row row-selected"
                    : r.sw === "1"
                      ? "child-row"
                      : "parent-row",
              }))
          );
          setExpandedNumClr(row.numClr);
        }
      }
    },
    [mainPackingList, expandedNumClr]
  );

  useEffect(() => {
    if (userEnvInfo.cdBizarea && userEnvInfo.cdFty) {
      handleSearch();
      setIsDateButtonClick(false);
    }
  }, [userEnvInfo.cdBizarea, userEnvInfo.cdFty, isDateButtonClick]);

  const columns = useMemo(() => MainPackingTableColumns(), []);
  return (
    <>
      <EisPageTitleBar
        pageNm="Factory"
        pageUrl="/packing"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Packing Actual", path: "/packing", active: true},
        ]}
      />

      <SearchMainPacking
        refs={refs}
        onSearchButtonClick={handleSearch}
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
                    data={visibleList ?? []}
                    theadClass="text-center font-12"
                    tableClass="table-custom-main-factory-background text-center font-10"
                    onRowClick={handleRowClick}
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

export default MainPacking;
