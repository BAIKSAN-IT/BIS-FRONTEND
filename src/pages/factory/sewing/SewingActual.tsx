import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Col, Row} from "react-bootstrap";
import CustomTableGrid from "@components/CustomTableGrid";
import {formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty, timeFormat} from "@utils/CommonUtil";
import LineDashboard from "./LineDashboard";
import BarChartFactory from "./chart/BarChartFactory";
import PieChartFactory from "./chart/PieChartFactory";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {
  HOURLY_PRODUCTION_QTY,
  SEWING_ACTUAL_COLUMNS,
  SEWING_ACTUAL_DEFECT_TYPE,
  SEWING_ACTUAL_TYPE,
  SEWING_TIME_TYPE,
} from "@constants/factory/sewing/sewingActual";
import {getSewingActual, getSewingActualDefect} from "@redux/factory/factorySewingSlice";
import {getTimeList} from "@redux/tablet/tabletSlice";
import {HourlyBox, TitleEnterCell} from "@utils/CommonUtilJsx";

// Global Style
export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
  }
`;

const SewingActual = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {line, userEnvInfo} = useSelector((state: RootState) => ({
    line: state.Tablet.line,
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [sewingActualList, setSewingActualList] = useState<SEWING_ACTUAL_TYPE[]>([]);
  const [sewingActualColumns, setSewingActualColumns] = useState<any>([]);
  const [workTime, setWorkTime] = useState<SEWING_TIME_TYPE[]>([]);
  const [workTmIdx, setWorkTmIdx] = useState(11);

  const [lineInfo, setLineInfo] = useState({
    stLine: "1",
    edLine: "3",
  });

  const [sewingActualGroups, setSewingActualGroups] = useState<SEWING_ACTUAL_TYPE[][]>([[], [], []]);
  const [sewingDefectGroups, setSewingDefectGroups] = useState<SEWING_ACTUAL_DEFECT_TYPE[][]>([[], [], []]);

  const ranges = [
    {min: 1, max: 3},
    {min: 4, max: 6},
    {min: 7, max: 9},
    {min: 10, max: 12},
    {min: 13, max: 15},
    {min: 16, max: 18},
    {min: 19, max: 21},
    {min: 22, max: 24},
  ];

  useEffect(() => {
    if (!isEmpty(userEnvInfo)) {
      const params = {
        ...userEnvInfo,
        processGbn: "0005",
      };

      dispatch(getTimeList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setWorkTime(payload.data);
        } else {
          setWorkTime(HOURLY_PRODUCTION_QTY);
        }
      });
    }
  }, [userEnvInfo]);

  useEffect(() => {
    const getLineRange = (sewLn: number) => {
      const range = ranges.find((range) => sewLn >= range.min && sewLn <= range.max);
      return range ? {stLn: range.min.toString(), edLn: range.max.toString()} : {stLn: "1", edLn: "3"};
    };

    const {stLn, edLn} = getLineRange(Number(line?.sewLn));
    setLineInfo({stLine: stLn, edLine: edLn});

    setHeaderLayoutInfo({
      titleName: "HOURLY PRODUCTION STATUS",
      lnInfo: {stLn, edLn, lnNm: "Line", isShow: true},
    });
  }, [line]);

  useEffect(() => {
    const hourlyColumns = workTime.slice(0, workTmIdx).map((item, idx) => ({
      Header: () => <TitleEnterCell header={timeFormat(item.endTime)}/>,
      accessor: "qtSew" + (idx + 1),
      className: "text-center",
      Cell: ({row}: { row: any }) => <HourlyBox row={row} columnName={"qtSew" + (idx + 1)}/>,
    }));

    const updateSewingActualColumns = SEWING_ACTUAL_COLUMNS.map((column) =>
      column.Header === "HOURLY PRODUCTION QTY" ? {...column, columns: hourlyColumns} : column
    );

    setSewingActualColumns(updateSewingActualColumns);
  }, [workTmIdx]);

  const setSewingActualData = (actualData?: SEWING_ACTUAL_TYPE[]) => {
    const actualGroups = [[], [], []] as SEWING_ACTUAL_TYPE[][];

    if (actualData) {
      actualData.forEach((item) => {
        const groupIndex = (Number(item.sewLn) - 1) % 3;
        actualGroups[groupIndex].push(item);
      });
    }

    setSewingActualGroups(actualGroups);
  };

  const setSewingDefectData = (defectData?: SEWING_ACTUAL_DEFECT_TYPE[]) => {
    const defectGroups = [[], [], []] as SEWING_ACTUAL_DEFECT_TYPE[][];

    if (defectData) {
      defectData.forEach((item) => {
        const groupIndex = (Number(item.sewLn) - 1) % 3;
        defectGroups[groupIndex].push(item);
      });
    }

    setSewingDefectGroups(defectGroups);
  };

  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    let {stLine: stDt, edLine: edDt} = lineInfo;

    if (val.selectedIdx > 0 && val.selectedIdx <= ranges.length) {
      const selectedRange = ranges[val.selectedIdx - 1];
      stDt = selectedRange.min.toString();
      edDt = selectedRange.max.toString();

      setHeaderLayoutInfo({
        lnInfo: {stLn: stDt, edLn: edDt, lnNm: "Line", isShow: true},
      });
    }

    let params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(val.selectedDate),
      excel: val.excel,
      stLine: stDt,
      edLine: edDt,
    };

    dispatch(getSewingActual(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        if (val.excel === "Y") {
          const currentDate = getVtnTime(val.selectedDate)
            .replace(/[-:T\s]/g, "")
            .slice(0, 14);
          const fileName = `Sewing_Actual_${currentDate}`;
          generateExcel(payload.data, fileName);
        } else {
          setSewingActualList(payload.data);
          setSewingActualData(payload.data);
          setHeaderLayoutInfo({firstLoading: false});

          const maxDtsWkObject = payload.data.reduce(
            (max: SEWING_ACTUAL_TYPE, obj: SEWING_ACTUAL_TYPE) => (Number(obj.tmWk) > Number(max.tmWk) ? obj : max),
            payload.data[0]
          );

          setWorkTmIdx(Math.round(maxDtsWkObject.tmWk));
        }
      } else {
        setSewingActualList([]);
        setSewingActualData();
        setHeaderLayoutInfo({firstLoading: false});
      }
    });

    if (val.excel === "N") {
      dispatch(getSewingActualDefect(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setSewingDefectData(payload.data);
        } else {
          setSewingDefectData();
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
            <CustomTableGrid
              columns={sewingActualColumns}
              data={sewingActualList}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height-grid"
              theadClass="table-gray-grid"
              tbodyClass="hourlyList"
            />
          </div>
        </Row>

        <Row>
          {sewingActualGroups.map((item, idx) => (
            <Col lg={4} key={idx}>
              <LineDashboard actual={item} defect={sewingDefectGroups[idx]}/>
            </Col>
          ))}
        </Row>

        <Row>
          {sewingDefectGroups.map((item, idx) => (
            <Col lg={4} style={{display: "flex"}} key={idx}>
              <Col xl={3}>
                <BarChartFactory defect={item}/>
              </Col>

              <Col xl={9}>
                <PieChartFactory defect={item}/>
              </Col>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
});

export default SewingActual;
