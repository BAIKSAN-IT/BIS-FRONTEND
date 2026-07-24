import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

/* component */
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import SearchSewingActual from "./SearchSewingActual";

/* constants */
import {HEADER_PROPS, Payload} from "@constants/common/common";

/* utils */
import {formatDateToYYYYMMDD, isEmpty} from "@utils/CommonUtil";
import useInputRefs from "@utils/useInputRefs";

/* redux */
import {AppDispatch, RootState} from "@redux/store";
import {getBuyerInfo} from "@redux/common/commonSlice";
import {
  getHpsPopUpList,
  getHpsPopUpMax,
  SewingHpsPopUpMaxRes,
  SewingHpsPopUpReq,
  SewingHpsPopUpRes
} from "@redux/factory/factorySewingSlice";
import CommonTable from "@components/table/CommonTable";
import {SewingActualTableColumn} from "@pages/mainfactory/sewing/actual/SewingActualTableColumn";

import Swal from "sweetalert2";

const MainSewingActual = forwardRef((props: HEADER_PROPS, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const showAlert = (msg: string) => {
    Swal.fire({
      text: msg,
      confirmButtonText: "OK",
      customClass: {popup: "small-swal-popup", confirmButton: "small-swal-button"},
    });
  };
  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [isDateButtonClick, setIsDateButtonClick] = useState<boolean>(false);
  const [hpsHeadData, setHpsHeadData] = useState<SewingHpsPopUpRes[]>([]);
  const [hpsDetailData, setHpsDetailData] = useState<SewingHpsPopUpRes[]>([]);
  const [sewingHpsPopUpMax, setSewingHpsPopUpMax] =
    useState<SewingHpsPopUpMaxRes | null>(null);
  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  const {refs, getValues} = useInputRefs(["dtsWk"]);

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  useEffect(() => {
    setHeaderLayoutInfo({
      titleName: "HOURLY PRODUCTION STATUS",
      isStyle: false,
      type: "style",
      pageLimitCnt: 50,
    });
    dispatch(getBuyerInfo());
  }, []);

  useEffect(() => {
    setHeaderLayoutInfo({pageTotalCnt});
  }, [pageTotalCnt]);

  const setHeaderLayoutInfo = (data: any) => {
    props?.sendDataToParent?.(data);
  };

  const handleSearch = () => {
    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (!userEnvInfo.cdFty) {
      showAlert("Factory를 선택해 주세요.");
      return;
    }
    const {dtsWk} = getValues();

    const params: SewingHpsPopUpReq = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(new Date(dtsWk)),
      bep: 127,
      rat: 70,
      gubun: "H",
    };

    /*if(params.cdBizarea == '') showAlert('법인을 선택해주세요.')
    if(params.cdFty == '') showAlert('공장을 선택해주세요.')*/

    dispatch(getHpsPopUpMax(params)).then((res) => {
      const payload = res.payload as Payload;
      setSewingHpsPopUpMax(
        payload.status === 200 && !isEmpty(payload.data)
          ? payload.data
          : null
      );
    });

    dispatch(getHpsPopUpList(params)).then((res) => {
      const payload = res.payload as Payload;
      setHpsHeadData(
        payload.status === 200 && !isEmpty(payload.data)
          ? payload.data
          : []
      );
    });

    dispatch(getHpsPopUpList({...params, gubun: "D"})).then((res) => {
      const payload = res.payload as Payload;
      setHpsDetailData(
        payload.status === 200 && !isEmpty(payload.data)
          ? payload.data
          : []
      );
    });
  };

  const reloadDetail = async (dtsWk: string) => {
    const params: SewingHpsPopUpReq = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk,
      bep: 127,
      rat: 70,
      gubun: "D",
    };

    const res = await dispatch(getHpsPopUpList(params));
    const payload = res.payload as Payload;

    setHpsDetailData(
      payload.status === 200 && !isEmpty(payload.data)
        ? payload.data
        : []
    );
  };
  useEffect(() => {
    if (userEnvInfo.cdBizarea && userEnvInfo.cdFty) {
      handleSearch();
      setIsDateButtonClick(false);
    }
  }, [userEnvInfo.cdBizarea, userEnvInfo.cdFty, isDateButtonClick]);
  return (
    <>
      <EisPageTitleBar
        pageNm="Factory"
        pageUrl="/dailyProduction"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Sewing Actual", path: "/dailyProduction", active: true},
        ]}
      />

      <SearchSewingActual
        refs={refs}
        onSearchButtonClick={handleSearch}
        hpsHeadData={hpsHeadData}
        sewingHpsPopUpMax={sewingHpsPopUpMax}
        setIsDateButtonClick={setIsDateButtonClick}
      />
      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)'}}>
                  <CommonTable
                    columns={SewingActualTableColumn(hpsDetailData, reloadDetail)}
                    data={hpsDetailData}
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

export default MainSewingActual;
