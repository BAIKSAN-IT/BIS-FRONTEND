import React, {memo, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

/* redux */
import {AppDispatch, RootState} from "@redux/store";
import {DailyReportListReq, DailyReportListRes, getDailyReportList,} from "@redux/mainfactory/daily/DailyStatusSlice";

/* component */
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import DailyReportList from "./DailyReportList";
import {exportDailyReportMultiExcel} from "./dailyReportMultiExcel";
import SearchDailyReport from "./SearchDailyReport";

/* utils */
import {isEmpty} from "@utils/CommonUtil";
import {DateUtils} from "@utils/dateUtils";

/* constants*/
import {Payload} from "@constants/common/common";

export interface FactoryDef {
  key: string; // 'vina' | 'tamthang' | 'bago' | 'total' 등
  label: string; // 화면 표시명
  isTotal?: boolean; // 총합 컬럼 강조
}

/* ===== 공장 정보 ===== */
export const factories: FactoryDef[] = [
  {key: "vina", label: "PANKO VINA"},
  {key: "tamthang", label: "PANKO TAMTHANG"},
  {key: "bago", label: "PANKO BAGO"},
  {key: "total", label: "TOTAL", isTotal: true},
];

const DailyReport = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const {user} = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const defaultDailyReportListReq: DailyReportListReq = {
    cdCompany: user?.companyId || "",
    yyyymmdd: DateUtils.today.replace(/-/g, ""), // YYYYMMDD
  };
  const [searchParams, setSearchParams] = useState<DailyReportListReq>(defaultDailyReportListReq);
  const [isDateButtonClick, setIsDateButtonClick] = useState<boolean>(false);

  const [dailyReportList, setDailyReportList] = useState<DailyReportListRes[]>([]);

  const fetchDailyReportList = (params = searchParams) => {
    dispatch(getDailyReportList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setDailyReportList(payload.data);
      } else {
        setDailyReportList([]);
      }
    });
  };

  const onSearchButtonClick = () => {
    fetchDailyReportList(searchParams);
  };
  const onExcelDownload = () => {
    exportDailyReportMultiExcel(dailyReportList);
  };

  // 날짜 변경될 때 자동 재조회
  useEffect(() => {
    fetchDailyReportList(searchParams);
    setIsDateButtonClick(false);
  }, [isDateButtonClick]);

  return (
    <>
      <EisPageTitleBar
        pageNm="FACTORY"
        pageUrl="/dailyReport"
        breadCrumbItems={[{label: "DAILY REPORT", path: "/dailyReport", active: true}]}
        onSearchButtonClick={() => fetchDailyReportList(searchParams)}
        onExcelDownloadClick={onExcelDownload}
      />
      {/* 검색 */}
      <SearchDailyReport
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearchButtonClick={onSearchButtonClick}
        setIsDateButtonClick={setIsDateButtonClick}
      />
      {/* 일일 현황 리스트 */}
      <DailyReportList dailyReportList={dailyReportList}/>
    </>
  );
});

export default DailyReport;
