import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import CustomTableGrid from "@components/CustomTableGrid";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {getBuyerInfo} from "@redux/common/commonSlice";
import {formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty} from "@utils/CommonUtil";
import {SEWING_INPUT_COLUMNS, SEWING_INPUT_COLUMNS_TYPE} from "@constants/factory/sewing/sewingInput";
import {getSewingInput} from "@redux/factory/factorySewingSlice";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

const SewingInput = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {line, userEnvInfo} = useSelector((state: RootState) => ({
    line: state.Tablet.line,
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [cuttingActualList, setCuttingActualList] = useState<SEWING_INPUT_COLUMNS_TYPE[]>([]);

  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  useEffect(() => {
    let params = {
      titleName: "SEWING INPUT",
      isStyle: false,
      type: "style",
      pageLimitCnt: 15,
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
    let params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsExfty: formatDateToYYYYMMDD(val.selectedDate),
      excel: val.excel,
      currentPage: val.currentPage,
      limitPage: val.limitPage,
    };

    dispatch(getSewingInput(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        if (val.excel === "Y") {
          const currentDate = getVtnTime(val.selectedDate)
            .replace(/[-:T\s]/g, "")
            .slice(0, 14);
          const fileName = `Sewing_Input_${currentDate}`;
          generateExcel(payload.data, fileName);
        } else {
          setPageTotalCnt(payload.data[0].totalCnt);
          setCuttingActualList(payload.data);
          setHeaderLayoutInfo({firstLoading: false});
        }
      } else {
        setPageTotalCnt(0);
        setCuttingActualList([]);
        setHeaderLayoutInfo({firstLoading: false});
      }
    });
  };

  return (
    <>
      <GlobalStyle/>

      <Card style={{marginTop: "2px"}}>
        <Row>
          <div className="hps-popup-wrapper">
            <CustomTableGrid
              columns={SEWING_INPUT_COLUMNS}
              data={cuttingActualList}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-grid"
              theadClass="table-gray-grid"
              tbodyClass="hourlyList font-20"
            />
          </div>
        </Row>
      </Card>
    </>
  );
});

export default SewingInput;
