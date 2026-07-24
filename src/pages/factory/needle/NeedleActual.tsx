import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty} from "@utils/CommonUtil";
import {getNeedleActual} from "@redux/factory/factoryNeedleSlice";
import {NEEDLE_COLUMNS, NEEDLE_COLUMNS_TYPE} from "@constants/factory/folding/needle";
import CustomTableFoldingGrid from "@components/CustomTableFoldingGrid";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
  }
`;

const NeedleActual = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [cuttingList, setCuttingList] = useState<NEEDLE_COLUMNS_TYPE[]>([]);

  useEffect(() => {
    let params = {
      titleName: "NEEDLE & HANG TAG ACTUAL",
      pageLimitCnt: 15,
    };
    setHeaderLayoutInfo(params);
  }, []);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    let params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(val.selectedDate),
      noStyle: '',
    };

    dispatch(getNeedleActual(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Needle(HangTag)_Stock_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setCuttingList(payload.data);
            setHeaderLayoutInfo({firstLoading: false});
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setCuttingList([]);
          setHeaderLayoutInfo({firstLoading: false});
        }
      }
    });
  };

  return (
    <>
      <GlobalStyle/>

      <Card style={{marginTop: "2px"}}>
        <Row>
          <div className="hps-popup-wrapper">
            <CustomTableFoldingGrid
              columns={NEEDLE_COLUMNS}
              data={cuttingList}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-grid"
              theadClass="table-gray-grid"
              tbodyClass="hourlyList"
            />
          </div>
        </Row>
      </Card>
    </>
  );
});

export default NeedleActual;
