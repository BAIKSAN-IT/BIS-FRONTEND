import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";

/* Component */
import PageTitleBar from "@components/common/PageTitleBar";

/* Redux */
import {AppDispatch, RootState} from "@redux/store";
import {getSewingActual} from "@redux/eis/sewing/SewingSlice";
import {getLineList, getTimeList} from "@redux/tablet/tabletSlice";

/* Contants */
import CustomTableGrid from "@components/CustomTableGrid";
import {
  HOURLY_PRODUCTION_QTY,
  SEWING_ACTUAL_COLUMNS,
  SEWING_ACTUAL_TYPE,
  SEWING_TIME_TYPE,
} from "@constants/factory/sewing/sewingActual";
import {HEADER_PROPS, Payload} from "@constants/common/common";

/* Utils */
import {formatDate, formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty, timeFormat,} from "@utils/CommonUtil";
import {HourlyBox, TitleEnterCell} from "@utils/CommonUtilJsx";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
  }
`;

const SewingStatus = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "F5") {
      event.preventDefault(); // 기본 새로고침 방지
      return;
    }
  };

  /*
   * handle date change
   */
  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [sewingActualList, setSewingActualList] = useState<SEWING_ACTUAL_TYPE[]>([]);
  const [sewingActualColumns, setSewingActualColumns] = useState<any>([]);
  const [workTime, setWorkTime] = useState<SEWING_TIME_TYPE[]>([]);
  const [workTmIdx, setWorkTmIdx] = useState(11);

  const [lineInfo, setLineInfo] = useState({
    stLine: "1",
    edLine: "24",
  });

  useEffect(() => {
    if (!isEmpty(userEnvInfo)) {
      const params = {
        ...userEnvInfo,
        processGbn: "0005",
      };

      dispatch(getLineList(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200 && !isEmpty(payload.data)) {
          const lineDt = payload.data;

          setLineInfo({
            stLine: lineDt[0].sewLn,
            edLine: lineDt[lineDt.length - 1].sewLn,
          });
        } else {
          setLineInfo({
            stLine: "1",
            edLine: "24",
          });
        }
      });

      dispatch(getTimeList(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200 && !isEmpty(payload.data)) {
          setWorkTime(payload.data);
        } else {
          setWorkTime(HOURLY_PRODUCTION_QTY);
        }
      });

      let sparams = {
        cdCompany: userEnvInfo.cdCompany || "",
        cdBizarea: userEnvInfo.cdBizarea || "",
        cdFty: userEnvInfo.cdFty || "",
        dtsWk: formatDate(selectedDate, "4"),
        stLine: lineInfo.stLine,
        edLine: lineInfo.edLine,
      };

      dispatch(getSewingActual(sparams)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200 && !isEmpty(payload.data)) {
          setSewingActualList(payload.data);
          setHeaderLayoutInfo({firstLoading: false});

          const maxDtsWkObject = payload.data.reduce(
            (max: SEWING_ACTUAL_TYPE, obj: SEWING_ACTUAL_TYPE) => (Number(obj.tmWk) > Number(max.tmWk) ? obj : max),
            payload.data[0]
          );
          setWorkTmIdx(Math.round(maxDtsWkObject.tmWk));
        } else {
          setSewingActualList([]);
          setHeaderLayoutInfo({firstLoading: false});
        }
      });
    }
  }, [selectedDate, userEnvInfo]);

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
      stLine: lineInfo.stLine,
      edLine: lineInfo.edLine,
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
          setHeaderLayoutInfo({firstLoading: false});

          const maxDtsWkObject = payload.data.reduce(
            (max: SEWING_ACTUAL_TYPE, obj: SEWING_ACTUAL_TYPE) => (Number(obj.tmWk) > Number(max.tmWk) ? obj : max),
            payload.data[0]
          );

          setWorkTmIdx(Math.round(maxDtsWkObject.tmWk));
        }
      } else {
        setSewingActualList([]);
        setHeaderLayoutInfo({firstLoading: false});
      }
    });
  };
  /* PageTitleBar에서 새로고침 버튼 클릭 시*/
  const onRefreshButtonClick = useCallback(() => {
    handleSearch({selectedDate, excel: "", currentPage: "0", limitPage: "10000"});
  }, [selectedDate]);
  return (
    <>
      <Row>
        <Col>
          {/* DatePicker, Refresh, PageTitle Component*/}
          <PageTitleBar
            pageTitle={"Sewing Status"}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onRefreshButton={onRefreshButtonClick}
          />
        </Col>
      </Row>
      {/*<Statistics />*/}
      <>
        <GlobalStyle/>
        <Card style={{marginTop: "2px"}}>
          <Row>
            <div className="hps-popup-wrapper">
              <CustomTableGrid
                columns={sewingActualColumns}
                data={sewingActualList}
                isSortable={true}
                tableClass="table-striped dt-responsive nowrap w-100 body-height-grid font-12 fixed-layout-table"
                theadClass="table-gray-grid-eis"
                tbodyClass="hourlyList"
              />
            </div>
          </Row>
        </Card>
      </>
    </>
  );
});

export default SewingStatus;
