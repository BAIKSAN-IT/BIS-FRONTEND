import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {AppDispatch, RootState} from "@redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {createGlobalStyle} from "styled-components";
import {Card, Row} from "react-bootstrap";
import CustomTableGrid from "@components/CustomTableGrid";
import {formatDateToYYYYMMDD, isEmpty, timeFormat} from "@utils/CommonUtil";
import {HEADER_PROPS, Payload} from "@constants/common/common";
import {
  FINISH_QC_TYPE,
  FINISHQC_ACTUAL_COLUMNS,
  HOURLY_FINISHQC_QTY,
  SEWING_TIME_TYPE,
} from "@constants/factory/qc/finishQcLine";

import {getQcActualLine} from "@redux/factory/factoryQcSlice";
import {getLineList, getTimeList} from "@redux/tablet/tabletSlice";
import {HourlyBox, TitleEnterCell} from "@utils/CommonUtilJsx";

// Global Style
export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
  }
`;

const SewingTotalActual = forwardRef((props: HEADER_PROPS, ref) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [sewingActualList, setSewingActualList] = useState<FINISH_QC_TYPE[]>([]);
  const [sewingActualColumns, setSewingActualColumns] = useState<any>([]);
  const [workTime, setWorkTime] = useState<SEWING_TIME_TYPE[]>([]);
  const [workTmIdx, setWorkTmIdx] = useState(11);

  const [lineInfo, setLineInfo] = useState({
    stLine: "1",
    edLine: "22",
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
            edLine: "22",
          });
        }
      });

      dispatch(getTimeList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setWorkTime(payload.data);
        } else {
          setWorkTime(HOURLY_FINISHQC_QTY);
        }
      });
    }
  }, [userEnvInfo]);

  useEffect(() => {
    setHeaderLayoutInfo({
      titleName: "HOURLY FINISH QC STATUS",
      lnInfo: {
        stLn: "1",
        edLn: "22",
        lnNm: "Line",
        isShow: true,
      },
    });
  }, [lineInfo]);

  useEffect(() => {
    const hourlyColumns = workTime.slice(0, workTmIdx).map((item, idx) => ({
      Header: () => <TitleEnterCell header={timeFormat(item.endTime)}/>,
      accessor: "qtSew" + (idx + 1),
      className: "text-center",
      Cell: ({row}: { row: any }) => <HourlyBox row={row} columnName={"qtSew" + (idx + 1)}/>,
    }));

    const updateSewingActualColumns = FINISHQC_ACTUAL_COLUMNS.map((column) =>
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
      stLine: lineInfo.stLine,
      edLine: lineInfo.edLine,
    };

    dispatch(getQcActualLine(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSewingActualList(payload.data);
        setHeaderLayoutInfo({firstLoading: false});
        //const maxDtsWkObject = payload.data.reduce(
        //          (max: SEWING_ACTUAL_TYPE, obj: SEWING_ACTUAL_TYPE) =>
        //          Number(obj.tmWk) > Number(max.tmWk) ? obj : max,
        //payload.data[0]
        //);
        //setWorkTmIdx(Math.round(maxDtsWkObject.tmWk));
      } else {
        setSewingActualList([]);
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
              columns={sewingActualColumns}
              data={sewingActualList}
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

export default SewingTotalActual;
