import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import SalesActivityDashboardChart from "./SalesActivityDashboardChart";
import SalesActivityDashboardTotal from "./SalesActivityDashboardTotal";
import SalesPageTitleBar from "../../../components/common/SalesPageTitleBar";
import SearchSalesActivityDashboard from "./SearchSalesActivityDashboard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { getSalesActivityDashboardList, SalesActivityDashboardRes } from "../../../redux/sales/SalesActivitySlice";
import { isEmpty } from "../../../utils/CommonUtil";
import { DateUtils } from "../../../utils/dateUtils";
import { Payload } from "../../../constants/common/common";

// 엑셀 관련
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SalesActivityDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [salesActivityDashboardList, setSalesActivityDashboardList] = useState<SalesActivityDashboardRes[]>([]);
  const [searchParams, setSearchParams] = useState({
    cdCompany: userEnvInfo.cdCompany || "",
    startYm: DateUtils.oneMonthAgo.slice(0, 7),
    endYm: DateUtils.today.slice(0, 7),
  });

  const fetchSalesActivityDashboardList = (params = searchParams) => {
    const converted = {
      cdCompany: userEnvInfo.cdCompany || "",
      startYm: params.startYm.replace(/-/g, "").slice(0, 6),
      endYm: params.endYm.replace(/-/g, "").slice(0, 6),
    };
    dispatch(getSalesActivityDashboardList(converted)).then((res) => {
      const payload = res.payload as Payload;
      setSalesActivityDashboardList(payload.status === 200 && !isEmpty(payload.data) ? payload.data : []);
    });
  };

  useEffect(() => {
    fetchSalesActivityDashboardList();
  }, []);

  const onSearchButtonClick = () => {
    fetchSalesActivityDashboardList();
  };

  const onExcelDownloadClick = () => {
    // 가로: 부서명, 업무명, 건수, 총계 등 기본 정보 펼침
    const excelData = salesActivityDashboardList.flatMap((item) =>
      (item.saleDashboardListRes ?? []).map((row) => ({
        부서명: item.deptNm,
        업무명: row.nmWork,
        건수: row.cntWork,
        총계: row.cntDept,
      }))
    );

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "영업활동");

    // 파일 저장
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `영업활동Dashboard_${DateUtils.today}.xlsx`);
  };

  // 도넛용 부서별 데이터 (TOTAL 제외)
  const deptOnlyList = salesActivityDashboardList.filter((item) => item.deptNm !== "TOTAL");
  const totalDeptLabels = deptOnlyList.map((item) => item.deptNm);
  const totalDeptSeries = deptOnlyList.map((item) => {
    // cntDept 중 가장 큰 값 사용(대표값)
    const maxCntDept = Math.max(...(item.saleDashboardListRes ?? []).map((row) => Number(row.cntDept ?? 0)));
    return isFinite(maxCntDept) ? maxCntDept : 0;
  });

  // 막대용 부서별 모든 업무를 Stack Bar로 보여주기
  // 1. 전체 업무명 추출(중복 제거)
  const allWorkNames = Array.from(
    new Set(deptOnlyList.flatMap((item) => (item.saleDashboardListRes ?? []).map((row) => row.nmWork)))
  );

  // 2. 부서명 라벨
  const barLabels = totalDeptLabels;

  // 3. 각 업무별 부서별 데이터 생성 (Stack Bar용)
  const barSeries = allWorkNames.map((workName) => ({
    name: workName,
    data: deptOnlyList.map((item) => {
      const found = (item.saleDashboardListRes ?? []).find((row) => row.nmWork === workName);
      return found ? Number(found.cntWork) : 0;
    }),
  }));

  return (
    <>
      <SalesPageTitleBar
        pageNm="Sales"
        pageUrl="/salesActivityDashboard"
        breadCrumbItems={[
          { label: "SalesPlus", path: "/salesActivityDashboard" },
          { label: "Dashboard", path: "/salesActivityDashboard", active: true },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
      />
      <SearchSalesActivityDashboard
        onSearchButtonClick={onSearchButtonClick}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      <Card>
        <Card.Body>
          <Row>
            {/* 전체 표 */}
            <Col xl={6} md={6}>
              <SalesActivityDashboardTotal data={salesActivityDashboardList} />
            </Col>
            {/* TOTAL 차트(부서 도넛 + stack bar) */}
            <Col xl={6} md={6}>
              {deptOnlyList.length > 0 && (
                <SalesActivityDashboardChart
                  type="dept-total"
                  donutLabels={totalDeptLabels}
                  donutSeries={totalDeptSeries}
                  barLabels={barLabels}
                  barSeries={barSeries}
                  chartTitle="TOTAL"
                />
              )}
            </Col>
            {/* 부서별 도넛 */}
            {deptOnlyList.map((item) => (
              <Col xl={3} md={12} key={item.deptNm}>
                <SalesActivityDashboardChart data={item} type="dept" chartTitle={item.deptNm} />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default SalesActivityDashboard;
