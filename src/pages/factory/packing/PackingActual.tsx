import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty} from "@utils/CommonUtil";
import CustomTableFoldingGrid from "@components/CustomTableFoldingGrid";
import {getPackingActual} from "@redux/factory/factoryPackingSlice";
import {PACKING_COLUMNS, PACKING_COLUMNS_TYPE} from "@constants/factory/packing/packing";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
  }
`;

const PackingActual = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [packingList, setPackingList] = useState<PACKING_COLUMNS_TYPE[]>([]);

  useEffect(() => {
    let params = {
      titleName: "PACKING ACTUAL",
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
      excel: val.excel,
    };

    dispatch(getPackingActual(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Packing_Actual_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setPackingList(payload.data);
            setHeaderLayoutInfo({firstLoading: false});
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setPackingList([]);
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
              columns={PACKING_COLUMNS}
              data={packingList}
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

export default PackingActual;
