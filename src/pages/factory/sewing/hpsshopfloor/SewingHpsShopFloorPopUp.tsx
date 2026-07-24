import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";

/* component */
import CustomTableGrid from "@components/CustomTableGrid";

/* constants */
import {HEADER_PROPS, Payload} from "@constants/common/common";

/* utils */
import {formatDateToYYYYMMDD, isEmpty} from "@utils/CommonUtil";

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
import {DateUtils} from "@utils/dateUtils";
import SewingHpsShopFloorPopUpSummaryTab from "@pages/factory/sewing/hpsshopfloor/SewingHpsShopFloorPopUpSummaryTab";
import {SEWING_HPS_SHOP_FLOOR_POPUP_COLUMNS} from "@constants/factory/sewing/sewingHpsShopFloor";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

const SewingHpsShopFloorPopUpFactory = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const defaultSewingHpsPopUpReq: SewingHpsPopUpReq = {
    cdCompany: userEnvInfo?.cdCompany || "",
    cdBizarea: userEnvInfo?.cdBizarea || "",
    cdFty: userEnvInfo?.cdFty || "",
    dtsWk: DateUtils.today.replace(/-/g, ""), // YYYYMMDD
    bep: 127,   // BigDecimal → number
    rat: 70,
    gubun: 'H', // 'H' | 'D' 로 써도 됨
  };
  const [searchSewingHpsPopUpParams, setSearchSewingHpsPopUpParams] = useState<SewingHpsPopUpReq>(defaultSewingHpsPopUpReq);
  const [hpsHeadData, setHpsHeadData] = useState<SewingHpsPopUpRes[]>([]);
  const [hpsDetailData, setHpsDetailData] = useState<SewingHpsPopUpRes[]>([]);

  const [sewingHpsPopUpMax, setSewingHpsPopUpMax] = useState<SewingHpsPopUpMaxRes | null>(null);

  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  useEffect(() => {
    let params = {
      titleName: "HOURLY PRODUCTION STATUS",
      isStyle: false,
      type: "style",
      pageLimitCnt: 50,
    };
    setHeaderLayoutInfo(params);
    dispatch(getBuyerInfo());
  }, []);

  useEffect(() => {
    setHeaderLayoutInfo({pageTotalCnt: pageTotalCnt});
  }, [pageTotalCnt]);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };
  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    const params: SewingHpsPopUpReq = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(val.selectedDate), // 날짜 선택
      bep: 127,
      rat: 70,
      gubun: "H",
    };

    // MAX 값 조회
    dispatch(getHpsPopUpMax({...params})).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSewingHpsPopUpMax(payload.data);
      } else {
        setSewingHpsPopUpMax(null);
      }
    });
    // HEAD 조회
    dispatch(getHpsPopUpList(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        setHpsHeadData(payload.data);
      } else {
        setHpsHeadData([]);
      }
    });

    // DETAIL 조회
    dispatch(getHpsPopUpList({...params, gubun: "D"})).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        setHpsDetailData(payload.data);
      } else {
        setHpsDetailData([]);
      }
    });

  };

  return (
    <>
      <GlobalStyle/>

      <Card style={{marginTop: "2px"}}>
        <SewingHpsShopFloorPopUpSummaryTab hpsHeadData={hpsHeadData} sewingHpsPopUpMax={sewingHpsPopUpMax}/>
        <Row>
          <div className="hps-popup-wrapper">
            <CustomTableGrid
              columns={SEWING_HPS_SHOP_FLOOR_POPUP_COLUMNS(hpsDetailData)}
              data={hpsDetailData || []}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-grid font-14"
              theadClass="table-gray-grid-hps"
              tbodyClass="hourlyList"
            />
          </div>
        </Row>
      </Card>
    </>
  );
});

export default SewingHpsShopFloorPopUpFactory;
