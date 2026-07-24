import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import {CUTTING_COLUMNS, CUTTING_COLUMNS_TYPE} from "@constants/factory/cutting/cuttingStock";
import {getBuyerInfo} from "@redux/common/commonSlice";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {getCuttingStock} from "@redux/factory/factoryCuttingSlice";
import {formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty} from "@utils/CommonUtil";
import CuttingCustomTableGrid from "@components/CuttingCustomTableGrid";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

const CuttingStock = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [cuttingList, setCuttingList] = useState<CUTTING_COLUMNS_TYPE[]>([]);

  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  useEffect(() => {
    let params = {
      titleName: "CUTTING STOCK",
      pageLimitCnt: 20,
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
      currentBuyer: val.currentBuyer,
      currentPage: val.currentPage,
      limitPage: val.limitPage,
      noStyle: '',
    };

    dispatch(getCuttingStock(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Cutting_Stock_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setPageTotalCnt(payload.data[0].totalCnt);
            setHeaderLayoutInfo({firstLoading: false});

            const updatedData = payload.data.map((item: CUTTING_COLUMNS_TYPE, index: number) => ({
              ...item,
              no: index + 1,
              className: item.cutStatus !== "END" ? "row-ing" : "",
            }));
            setCuttingList(updatedData);
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setPageTotalCnt(0);
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
            <CuttingCustomTableGrid
              columns={CUTTING_COLUMNS}
              data={cuttingList}
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

export default CuttingStock;
