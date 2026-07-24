import React, {forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {defaultCreateLineColumn, IRON_COLUMNS, IRON_COLUMNS_TYPE} from "@constants/factory/iron/iron";
import {dataExtraction, formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty, timeFormat,} from "@utils/CommonUtil";
import {getIronActual} from "@redux/factory/factoryIronSlice";
import {IronActualColumn} from "@utils/CommonUtilJsx";
import IronCustomTableGrid from "@components/IronCustomTableGrid";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

let colSpanStat = new Array(9).fill(false);

const IronActual = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {line, userEnvInfo} = useSelector((state: RootState) => ({
    line: state.Tablet.line,
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [ironHeader, setIronHeader] = useState<any>([]);
  const [ironActualList, setIronActualList] = useState<IRON_COLUMNS_TYPE[]>([]);
  const [lineInfo, setLineInfo] = useState({
    stLine: "1",
    edLine: "9",
  });
  const [lineCnt, setLineCnt] = useState(9);
  const [workerCnt] = useState(2);

  useLayoutEffect(() => {
    colSpanStat = new Array(lineCnt * workerCnt).fill(false);
  }, []);

  useEffect(() => {
    resetHeadData();
  }, []);

  useEffect(() => {
    const getLineRange = (sewLn: number) => {
      if (sewLn >= 1 && sewLn <= 9) {
        return {stLn: "1", edLn: "9"};
      } else if (sewLn >= 10 && sewLn <= 18) {
        return {stLn: "7", edLn: "12"};
      } else if (sewLn >= 19 && sewLn <= 26) {
        return {stLn: "13", edLn: "18"};
      } else if (sewLn >= 27 && sewLn <= 30) {
        return {stLn: "19", edLn: "26"};
      }
      return {stLn: "1", edLn: "9"};
    };

    const sewLn = Number(line?.sewLn);
    const {stLn, edLn} = getLineRange(sewLn);
    setLineInfo({stLine: stLn, edLine: edLn});

    const params = {
      titleName: "IRON ACTUAL",
      lnInfo: {stLn: stLn, edLn: edLn, lnNm: "Station", isShow: true},
    };

    setHeaderLayoutInfo(params);
  }, [line]);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // Head Data 리셋
  const resetHeadData = (stDt?: string, edDt?: string) => {
    const lines = [];
    for (
      let i = Number(!isEmpty(stDt) ? stDt : lineInfo.stLine);
      i <= Number(!isEmpty(edDt) ? edDt : lineInfo.edLine);
      i++
    ) {
      lines.push({
        Header: `Station #${i}`,
        columns: defaultCreateLineColumn(i, workerCnt),
        accessor: "",
      });
    }
    setIronHeader(lines);
    setIronActualList([]);
  };

  // 라인 Header 데이터 만들기
  const setLineHeaderData = (data: any) => {
    const lineData = dataExtraction(data[0], "line").filter((item) => item.value !== 0);
    const userData = dataExtraction(data[0], "user");

    setLineCnt(lineData.length / workerCnt);

    const lines = [];
    for (let i = 0; i < lineData.length / workerCnt; i++) {
      lines.push({
        Header: `Station #${lineData[i * workerCnt]?.value}`,
        columns: createLineColumn(userData, i),
        accessor: "",
      });
    }

    setIronHeader(lines);
  };

  // 라인 Body 데이터 만들기
  const setLineBodyData = (data: any) => {
    const lineBody = [] as IRON_COLUMNS_TYPE[];
    const totals: any = {};
    const deleteIdx: any = [];

    const styleData = dataExtraction(data[0], "style");
    const styleItem: any = {division: "Buyer<br/>Style<br/>Qty<br/>Target"};
    styleData.forEach((item, idx) => {
      const amtKey = `amt${idx + 1}`;
      const targetKey = `target${idx + 1}`;
      styleItem[amtKey] = item.value;
      styleItem[targetKey] = item.value;

      if (idx % 2 === 0 && idx + 1 < styleData.length) {
        const nextItem = styleData[idx + 1];

        if (item.value && !nextItem.value) {
          deleteIdx.push(idx + 2);
          colSpanStat[idx] = true;
        }
      }
    });

    for (const idx of deleteIdx) {
      styleItem[`amt${idx}`] = "del";
      styleItem[`target${idx}`] = styleItem[`target${idx - 1}`];
    }

    lineBody.push(styleItem);

    for (const dt of data) {
      const tmData = dataExtraction(dt, "tm");
      const amtData = dataExtraction(dt, "amt");

      const lineItem: any = {
        division: timeFormat(tmData[0]?.value),
      };

      amtData.forEach((item, idx) => {
        const amtKey = `amt${idx + 1}`;
        const targetKey = `target${idx + 1}`;
        lineItem[amtKey] = item.value;
        lineItem[targetKey] = styleItem[targetKey];

        // 총합 계산
        if (!totals[amtKey]) {
          totals[amtKey] = 0;
        }
        totals[amtKey] += parseFloat(item.value) || 0;
      });

      lineBody.push(lineItem);
    }

    const totalItem: any = {division: "Total"};
    for (let i = 1; i <= Object.keys(totals).length; i++) {
      totalItem[`amt${i}`] = totals[`amt${i}`];
      // totalItem[`target${i}`] = styleItem[`target${i}`];
    }
    lineBody.push(totalItem);

    setIronActualList(lineBody);
  };

  // 헤더 컬럼 생성
  const createLineColumn = (data: any, idx: any) => {
    const columns = [];

    for (let i = idx * workerCnt; i < idx * workerCnt + workerCnt; i++) {
      columns.push({
        Header: !isEmpty(data[i]?.value) ? data[i]?.value : "-",
        accessor: `amt${i + 1}`,
        className: "text-center width-50",
        Cell: ({row}: { row: any }) => <IronActualColumn row={row} columnName={`amt${i + 1}`}/>,
        colSpan: colSpanStat[i] ? workerCnt : 1,
      });
    }

    return columns;
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    colSpanStat = new Array(colSpanStat.length).fill(false);

    let stDt = lineInfo?.stLine;
    let edDt = lineInfo?.edLine;
    if (val.selectedIdx > 0) {
      if (val.selectedIdx === 1) {
        stDt = "1";
        edDt = "9";
      } else if (val.selectedIdx === 2) {
        stDt = "10";
        edDt = "18";
      } else if (val.selectedIdx === 3) {
        stDt = "19";
        edDt = "26";
      } else if (val.selectedIdx === 4) {
        stDt = "27";
        edDt = "30";
      }

      setHeaderLayoutInfo({
        lnInfo: {stLn: stDt, edLn: edDt, lnNm: "Station", isShow: true},
      });

      let params = {
        cdCompany: userEnvInfo.cdCompany || "",
        cdBizarea: userEnvInfo.cdBizarea || "",
        cdFty: userEnvInfo.cdFty || "",
        dtsWk: formatDateToYYYYMMDD(val.selectedDate),
        excel: val.excel,
        stLine: stDt,
        edLine: edDt,
      };

      dispatch(getIronActual(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200) {
          if (!isEmpty(payload.data)) {
            if (val.excel === "Y") {
              const currentDate = getVtnTime(val.selectedDate)
                .replace(/[-:T\s]/g, "")
                .slice(0, 14);
              const fileName = `Iron_Actual_${currentDate}`;
              generateExcel(payload.data, fileName);
            } else {
              setLineBodyData(payload.data);
              setLineHeaderData(payload.data);
              setHeaderLayoutInfo({firstLoading: false});
            }
          }
        } else {
          if (payload.errorCode === "100") {
            resetHeadData(stDt, edDt);
            setHeaderLayoutInfo({firstLoading: false});
          }
        }
      });
    }
  };

  return (
    <>
      <GlobalStyle/>

      <Card style={{marginTop: "2px"}}>
        <Row>
          <div className="hps-popup-wrapper">
            <IronCustomTableGrid
              columns={[...IRON_COLUMNS, ...ironHeader]}
              data={ironActualList}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-iron-grid"
              theadClass="table-gray-grid"
            />
          </div>
        </Row>
      </Card>
    </>
  );
});

export default IronActual;
