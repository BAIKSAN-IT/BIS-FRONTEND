import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Col, Row} from "react-bootstrap";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {QC_COLUMNS, QC_COLUMNS_TYPE} from "@constants/factory/qc/qc";
import {dataExtraction, formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty} from "@utils/CommonUtil";
import IronCustomTableGrid from "@components/IronCustomTableGrid";
import BarChartFactoryQc from "./chart/BarChartFactoryQc";
import {getQcActual} from "@redux/factory/factoryQcSlice";
import {QcCommaColumn, QcNumberPercentColumn, TitleEnterCell} from "@utils/CommonUtilJsx";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

const FinishQc = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {line, userEnvInfo} = useSelector((state: RootState) => ({
    line: state.Tablet.line,
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [qcHeader, setQcHeader] = useState<any>(QC_COLUMNS);
  const [qcActualList, setQcActualList] = useState<QC_COLUMNS_TYPE[]>([]);
  const [inspectList, setInspectList] = useState<QC_COLUMNS_TYPE[]>([]);

  const [lineCnt, setLineCnt] = useState(24);

  useEffect(() => {
    const params = {
      titleName: "QC DEFECT STATUS",
      lnInfo: {isShow: false},
      isQc: true,
      type: "qc",
    };

    setHeaderLayoutInfo(params);
  }, [line]);

  useEffect(() => {
    const dynamicColumns = [
      {
        Header: () => <TitleEnterCell header="Defects<br/>Description"/>,
        accessor: "nmDefect",
        className: "text-center",
      },
      ...Array.from({length: lineCnt}, (_, i) => ({
        Header: () => <TitleEnterCell header={`Line<br/>${i + 1}`}/>,
        accessor: `qtDefect${i < 9 ? "0" + (i + 1) : i + 1}`,
        className: "text-center",
        Cell: ({row}: { row: any }) => (
          <QcCommaColumn row={row} columnName={`qtDefect${i < 9 ? "0" + (i + 1) : i + 1}`}/>
        ),
      })),
      {
        Header: () => <TitleEnterCell header="TOTAL<br/>DEFECTIVE<br/>QTY"/>,
        accessor: "qtTtlDefect",
        className: "text-center",
      },
      {
        Header: () => <TitleEnterCell header="TOTAL<br/>DEFECTIVE<br/>%"/>,
        accessor: "qtTtlRate",
        className: "text-center",
        Cell: ({row}: { row: any }) => <QcNumberPercentColumn row={row} columnName="qtTtlRate"/>,
      },
    ];

    setQcHeader(dynamicColumns);
  }, [lineCnt]);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // 라인 Body 데이터 만들기
  const setLineBodyData = (data: any) => {
    const lineBody = [] as QC_COLUMNS_TYPE[];
    const totals: any = {};
    let totalInsp = 0;

    // 1. inspect 계산
    const qtInspData = dataExtraction(data[0], "qtInsp");
    const inspItem: any = {
      nmDefect: "Total Inspected Qty",
    };

    qtInspData.forEach((item, idx) => {
      const qtDefectKey = `qtDefect${idx < 9 ? "0" + (idx + 1) : idx + 1}`;
      inspItem[qtDefectKey] = Number(item.value) ?? 0;

      totalInsp += Number(item.value);
    });

    inspItem["qtTtlDefect"] = totalInsp;
    lineBody.push(inspItem);

    // 2. 총합 계산
    for (const dt of data) {
      const qtDefectData = dataExtraction(dt, "qtDefect");
      qtDefectData.forEach((item, idx) => {
        const qtDefectKey = `qtDefect${idx < 9 ? "0" + (idx + 1) : idx + 1}`;
        if (!totals[qtDefectKey]) {
          totals[qtDefectKey] = 0;
        }
        totals[qtDefectKey] += parseFloat(item.value) || 0;
      });
    }
    const totalItem: any = {nmDefect: "Line By Line Defects Qty"};
    for (let i = 0; i < Object.keys(totals).length; i++) {
      const qtDefectKey = `qtDefect${i < 9 ? "0" + (i + 1) : i + 1}`;
      totalItem[qtDefectKey] = totals[qtDefectKey];
    }

    const qtTtlData = dataExtraction(data[0], "qtTtl");
    const qtTtl = qtTtlData.find((item) => item.key === "qtTtl");
    totalItem["qtTtlDefect"] = qtTtl?.value;
    lineBody.push(totalItem);

    // 3. 총합 / 인스펙트 계산
    const rateItem: any = {nmDefect: "Defects (%)"};
    for (let i = 0; i < Object.keys(totals).length; i++) {
      const qtDefectKey = `qtDefect${i < 9 ? "0" + (i + 1) : i + 1}`;
      const total = totals[qtDefectKey] ?? 0;
      const insp = inspItem[qtDefectKey] ?? 0;
      const rate = insp > 0 ? (total / insp) * 100 : 0;
      const formattedVal = rate.toLocaleString("ko-KR", {
        maximumFractionDigits: 2,
      });
      rateItem[qtDefectKey] = `${formattedVal}%`;
    }

    const totalRate = totalInsp > 0 ? (parseFloat(totalItem["qtTtlDefect"]) / totalInsp) * 100 : 0;
    const formattedVal = totalRate.toLocaleString("ko-KR", {
      maximumFractionDigits: 2,
    });
    rateItem["qtTtlDefect"] = `${formattedVal}%`;
    lineBody.push(rateItem);

    setInspectList(lineBody);
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    let params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(val.selectedDate),
      excel: val.excel,
      isEndLine: val.isEndLine,
    };

    dispatch(getQcActual(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Qc_Defect_Status_(${val.isEndLine === "Y" ? "QC1" : "QC2"})_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setQcActualList(payload.data);
            setLineBodyData(payload.data);
            setLineCnt(payload.data[0].maxLn ?? 24);
            setHeaderLayoutInfo({firstLoading: false});
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setQcActualList([]);
          setInspectList([]);
          setHeaderLayoutInfo({firstLoading: false});
          setLineCnt(24);
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
            <IronCustomTableGrid
              columns={qcHeader}
              data={[...qcActualList, ...inspectList]}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-qc-grid"
              theadClass="table-gray-grid"
            />
          </div>
        </Row>

        {!isEmpty(inspectList) && (
          <Row>
            <Col>
              <BarChartFactoryQc inspectList={inspectList}/>
            </Col>
          </Row>
        )}
      </Card>
    </>
  );
});

export default FinishQc;
