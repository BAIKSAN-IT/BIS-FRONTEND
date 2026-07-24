import React, {memo, useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card} from "react-bootstrap";

import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import useInputRefs from "@utils/useInputRefs";
import SearchFactoryDashboard from "./SearchFactoryDashboard";
import FactoryDashboardPerson from "./person/FactoryDashboardPerson";
import FactoryDashboardSewing from "@pages/mainfactory/dashboard/sewing/FactoryDashboardSewing";
import FactoryDashboardKnitting from "@pages/mainfactory/dashboard/knitting/FactoryDashboardKnitting";

import {
  FactoryDashboardDailyDyeingRes,
  FactoryDashboardDailyKnittingRes,
  FactoryDashboardDailyPersonRes,
  FactoryDashboardDailySewingRes,
  FactoryDashboardTab, getFactoryDashboardDyeingList,
  getFactoryDashboardKnittingList,
  getFactoryDashboardPersonList,
  getFactoryDashboardSewingList,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";
import FactoryDashboardDyeing from "@pages/mainfactory/dashboard/dyeing/FactoryDashboardDyeing";

const FactoryDashboard = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const {refs, getValues} = useInputRefs(["dtsWork"]);

  const [selectedTab, setSelectedTab] = useState<FactoryDashboardTab>("PERSON");

  const [personRows, setPersonRows] = useState<FactoryDashboardDailyPersonRes[]>([]);
  const [sewingRows, setSewingRows] = useState<FactoryDashboardDailySewingRes[]>([]);
  const [knittingRows, setKnittingRows] = useState<FactoryDashboardDailyKnittingRes[]>([]);
  const [dyeingRows, setDyeingRows] = useState<FactoryDashboardDailyDyeingRes[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 공통 검색 파라미터 생성
   */
  const getSearchParams = useCallback(() => {
    const {dtsWork} = getValues();

    const searchDate = dtsWork
      ? formatDateToYYYYMMDD(new Date(dtsWork))
      : formatDateToYYYYMMDD(new Date());

    return {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: selectedTab === "KNITTING" || selectedTab === "DYEING" ? "5000" : userEnvInfo.cdBizarea || "",
      dtsWork: searchDate,
    };
  }, [getValues, userEnvInfo.cdBizarea, userEnvInfo.cdCompany]);

  /**
   * payload.data 안전 추출
   */
  const getPayloadData = useCallback((res: any) => {
    const payload = res?.payload as Payload | any;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
  }, []);

  /**
   * 탭별 API 호출
   */
  const fetchDashboardListByTab = useCallback(
    async (tab: FactoryDashboardTab) => {
      const params = getSearchParams();

      setLoading(true);

      try {
        switch (tab) {
          case "PERSON": {
            const res = await dispatch(getFactoryDashboardPersonList(params));
            const data = getPayloadData(res) as FactoryDashboardDailyPersonRes[];
            setPersonRows(data);
            break;
          }

          case "SEWING": {
            const res = await dispatch(getFactoryDashboardSewingList(params));
            const data = getPayloadData(res) as FactoryDashboardDailySewingRes[];
            setSewingRows(data);
            break;
          }

          case "KNITTING": {
            const res = await dispatch(getFactoryDashboardKnittingList(params));
            const data = getPayloadData(res) as FactoryDashboardDailyKnittingRes[];
            setKnittingRows(data);
            break;
          }

          case "DYEING": {
            const res = await dispatch(getFactoryDashboardDyeingList(params));
            const data = getPayloadData(res) as FactoryDashboardDailyDyeingRes[];
            setDyeingRows(data);
            break;
          }

          default:
            break;
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, getPayloadData, getSearchParams]
  );

  /**
   * 검색 버튼 클릭 시 현재 탭 기준으로 조회
   */
  const handleSearch = useCallback(async () => {
    await fetchDashboardListByTab(selectedTab);
  }, [fetchDashboardListByTab, selectedTab]);

  /**
   * 탭 변경
   */
  const handleTabChange = useCallback((tab: FactoryDashboardTab) => {
    setSelectedTab(tab);
  }, []);

  /**
   * 처음 진입 / 탭 변경 시 자동 조회
   */
  useEffect(() => {
    fetchDashboardListByTab(selectedTab);
  }, [selectedTab, userEnvInfo]);

  return (
    <>
      <EisPageTitleBar
        pageNm="FACTORY"
        pageUrl="/factory/sewing/actual/chart"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {
            label: "DASHBOARD",
            path: "/factory/sewing/actual/chart",
            active: true,
          },
        ]}
      />

      <SearchFactoryDashboard
        refs={refs}
        onSearchButtonClick={handleSearch}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)", overflow: "auto"}}>
          {loading && (
            <div className="p-3 text-center">Loading...</div>
          )}

          {!loading && selectedTab === "PERSON" && (
            <FactoryDashboardPerson
              refs={refs}
              rows={personRows}
              selectedTab={selectedTab}
            />
          )}

          {!loading && selectedTab === "SEWING" && (
            <FactoryDashboardSewing
              refs={refs}
              rows={sewingRows}
              selectedTab={selectedTab}
            />
          )}

          {!loading && selectedTab === "KNITTING" && (
            <FactoryDashboardKnitting
              refs={refs}
              rows={knittingRows}
              selectedTab={selectedTab}
            />
          )}

          {!loading && selectedTab === "DYEING" && (
            <FactoryDashboardDyeing
              refs={refs}
              rows={dyeingRows}
              selectedTab={selectedTab}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
});

export default FactoryDashboard;
