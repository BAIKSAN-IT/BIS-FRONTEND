import React, {memo, useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";

import {dataExtraction, formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty, timeFormat,} from "@utils/CommonUtil";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import {getIronActual} from "@redux/factory/factoryIronSlice";
import useInputRefs from "@utils/useInputRefs";

import SearchMainIronActual from "./SearchMainIronActual";
import {createLineColumn, defaultCreateLineColumn, MAIN_IRON_COLUMNS,} from "./MainIronActualTableColumn";
import CommonTable from "@components/table/CommonTable";

import Swal from "sweetalert2";

type IRON_ROW = Record<string, any>;

const workerCnt = 2;

const MainIronActual = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };
  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const {refs, getValues} = useInputRefs(["dtsWk", "noStyle"]);

  /** Search 상태 */
  const [selectedIdx, setSelectedIdx] = useState<number>(1); // 1~4
  const [excelFlag, setExcelFlag] = useState<"Y" | "N">("N");

  /** Table 상태 */
  const [ironHeader, setIronHeader] = useState<any[]>([]);
  const [ironList, setIronList] = useState<IRON_ROW[]>([]);
  const [lineInfo, setLineInfo] = useState({stLine: "1", edLine: "9"});
  const [lineCnt, setLineCnt] = useState(9);

  /** colSpanStat (기존과 동일하게 동적으로 변경됨) */
  const [colSpanStat, setColSpanStat] = useState<boolean[]>(new Array(9 * workerCnt).fill(false));

  useLayoutEffect(() => {
    setColSpanStat(new Array(lineCnt * workerCnt).fill(false));
  }, [lineCnt]);

  /** 초기 헤더(빈 상태) 세팅 */
  useEffect(() => {
    resetHeadData(lineInfo.stLine, lineInfo.edLine);
  }, []);

  /** selectedIdx에 따른 라인 범위 (기존 IronActual handleSearch와 동일) */
  const getRangeBySelectedIdx = useCallback((idx: number) => {
    if (idx === 1) return {stLine: "1", edLine: "9"};
    if (idx === 2) return {stLine: "10", edLine: "18"};
    if (idx === 3) return {stLine: "19", edLine: "26"};
    if (idx === 4) return {stLine: "27", edLine: "30"};
    return {stLine: "1", edLine: "9"};
  }, []);

  /** 헤더 리셋 */
  const resetHeadData = (stLine: string, edLine: string) => {
    const lines: any[] = [];
    for (let i = Number(stLine); i <= Number(edLine); i++) {
      lines.push({
        Header: `Station #${i}`,
        columns: defaultCreateLineColumn(i, workerCnt),
        accessor: "",
      });
    }
    setIronHeader(lines);
    setIronList([]);
  };

  /** 라인 Header 생성 (payload 기반) */
  const setLineHeaderData = (data: any[], colSpan: boolean[]) => {
    const lineData = dataExtraction(data[0], "line").filter((item) => item.value !== 0);
    const userData = dataExtraction(data[0], "user");

    const computedLineCnt = lineData.length / workerCnt;
    setLineCnt(computedLineCnt);

    const lines: any[] = [];
    for (let i = 0; i < computedLineCnt; i++) {
      lines.push({
        Header: `Station #${lineData[i * workerCnt]?.value}`,
        columns: createLineColumn(userData, i, workerCnt, colSpan),
        accessor: "",
      });
    }

    setIronHeader(lines);
  };

  /**
   * ✅ Body 생성 (기존 IronActual setLineBodyData를 그대로 이식)
   * - Buyer/Style/Qty/Target 행 포함
   * - del / colSpan 처리 포함
   * - Total 행 포함
   */
  const setLineBodyData = (data: any[]) => {
    const lineBody: IRON_ROW[] = [];
    const totals: Record<string, number> = {};
    const deleteIdx: number[] = [];

    // colSpanStat는 style row에서 결정되므로 여기서 새로 만든 뒤 state로 반영
    const colSpan = new Array(colSpanStat.length).fill(false);

    /** 1) Buyer / Style / Qty / Target row */
    const styleData = dataExtraction(data[0], "style");
    const styleItem: IRON_ROW = {division: "Buyer<br/>Style<br/>Qty<br/>Target"};

    styleData.forEach((item: any, idx: number) => {
      const amtKey = `amt${idx + 1}`;
      const targetKey = `target${idx + 1}`;

      styleItem[amtKey] = item.value;
      styleItem[targetKey] = item.value;

      // 기존 colSpan 로직 유지
      if (idx % 2 === 0 && idx + 1 < styleData.length) {
        const nextItem = styleData[idx + 1];
        if (item.value && !nextItem.value) {
          deleteIdx.push(idx + 2);
          colSpan[idx] = true;
        }
      }
    });

    // del 처리(기존 동일)
    for (const idx of deleteIdx) {
      styleItem[`amt${idx}`] = "del";
      styleItem[`target${idx}`] = styleItem[`target${idx - 1}`];
    }

    lineBody.push(styleItem);

    /** 2) time rows */
    for (const dt of data) {
      const tmData = dataExtraction(dt, "tm");
      const amtData = dataExtraction(dt, "amt");

      const row: IRON_ROW = {division: timeFormat(tmData[0]?.value)};

      amtData.forEach((item: any, idx: number) => {
        const amtKey = `amt${idx + 1}`;
        const targetKey = `target${idx + 1}`;

        row[amtKey] = item.value;
        row[targetKey] = styleItem[targetKey];

        if (!totals[amtKey]) totals[amtKey] = 0;
        totals[amtKey] += parseFloat(item.value) || 0;
      });

      lineBody.push(row);
    }

    /** 3) total row */
    const totalItem: IRON_ROW = {division: "Total"};
    for (let i = 1; i <= Object.keys(totals).length; i++) {
      totalItem[`amt${i}`] = totals[`amt${i}`];
    }
    lineBody.push(totalItem);

    // state 반영
    setColSpanStat(colSpan);
    setIronList(lineBody);

    // Header도 colSpan 반영해서 다시 생성해야 하므로 payload를 받아 여기서 같이 호출할 수 있게 반환
    return colSpan;
  };

  /** 조회 */
  const handleSearch = useCallback(() => {
    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }
    if (!userEnvInfo.cdFty) {
      showAlert("Factory를 선택해 주세요.");
      return;
    }
    const {dtsWk, noStyle} = getValues();
    if (!dtsWk || isEmpty(userEnvInfo)) return;

    const {stLine, edLine} = getRangeBySelectedIdx(selectedIdx);
    setLineInfo({stLine, edLine});

    const params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(new Date(dtsWk)),
      excel: excelFlag,
      stLine,
      edLine,
      // 스타일 필터가 SP에 없다면 무시될 수 있음 (요청대로 ref로 연결만 유지)
      noStyle: noStyle ?? "",
    };

    // excelFlag는 Search에서 눌렀을 때만 Y로 들어오게 되어 있음
    dispatch(getIronActual(params as any)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status !== 200 || isEmpty(payload.data)) {
        resetHeadData(stLine, edLine);
        return;
      }

      // Excel
      if (excelFlag === "Y") {
        const currentDate = getVtnTime(new Date(dtsWk))
          .replace(/[-:T\s]/g, "")
          .slice(0, 14);
        generateExcel(payload.data, `Iron_Actual_${currentDate}`);
        return;
      }

      // Body 먼저 만들고 (여기서 colSpan 계산)
      const colSpan = setLineBodyData(payload.data);

      // Header 생성 (colSpan 반영)
      setLineHeaderData(payload.data, colSpan);
    });
  }, [dispatch, userEnvInfo, selectedIdx, excelFlag, getValues]);

  useEffect(() => {
    if (userEnvInfo.cdBizarea && userEnvInfo.cdFty) {
      handleSearch();
    }
  }, [userEnvInfo.cdBizarea, userEnvInfo.cdFty]);

  /** Grid 컬럼 조합 */
  const gridColumns = useMemo(() => {
    return [...MAIN_IRON_COLUMNS, ...ironHeader];
  }, [ironHeader]);

  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/ironActual"
        onSearchButtonClick={() => {
          setExcelFlag("N");
          handleSearch();
        }}
        breadCrumbItems={[{label: "Iron Actual", path: "/ironActual", active: true}]}
      />

      <SearchMainIronActual
        refs={refs}
        onSearchButtonClick={handleSearch}
        setExcelFlag={setExcelFlag}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)'}}>
                  <CommonTable
                    columns={gridColumns}
                    data={ironList}
                    theadClass="text-center font-12"
                    tableClass="table-custom-main-factory-background text-center font-10"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default MainIronActual;
