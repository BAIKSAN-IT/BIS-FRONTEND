import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

/* components */
import SearchFabricDashboard from "./SearchFabricDashboard";
import RndPageTitleBar from "@components/common/RndPageTitleBar";

/* utils */
import { DateUtils } from "@utils/dateUtils";

/* redux */
import { RndArticleDashboardReq } from "@redux/rnd/dashboardSlice";
import { AppDispatch, RootState } from "@redux/store";

const FabricDashboard = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    token: state.Auth.token,
  }));

  const defaultReq: RndArticleDashboardReq = {
    cdCompany: user?.userId || "1000",
    startDate: DateUtils.oneMonthAgo.replace(/-/g, ""),
    endDate: DateUtils.today.replace(/-/g, ""),
  };

  // 검색 파라미터: 검색 버튼 누를 때만 갱신
  const [searchParams, setSearchParams] = useState<RndArticleDashboardReq>(defaultReq);

  /*const [corporationPlList, setCorporationPlList] = useState<CorporationPlListRes[]>([]); // 원본 데이터*/
  const [showAll, setShowAll] = useState<boolean>(false); //  전체보기 토글 (버튼)

  /*const fetchCorporationPlList = useCallback(
      (params = searchParams) => {
        return dispatch(getCorporationPlList(params)).then((res) => {
          const payload = res.payload as Payload;
          const list: CorporationPlListRes[] = payload.status === 200 && !isEmpty(payload.data) ? payload.data : [];
          setCorporationPlList(list);
          setShowAll(false); // 조회할 때는 기본 레벨 모드로 리셋
        });
      },
      [dispatch, searchParams]
    );

    useEffect(() => {
      fetchCorporationPlList(searchParams);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);*/

  const onSearchButtonClick = () => {
    /*const vals = searchFormRef.current?.getValues();
        if (!vals) return;

        const next = {
          ...searchParams,
          ...vals,
          startDate: vals.startDate || fromYYYYMM,
          endDate: vals.endDate || toYYYYMM,
        };
        setSearchParams(next);
        fetchCorporationPlList(next);*/
  };

  /*const onExcelDownloadClick = () => {
      const columns = CorporationPlTableColumns({
        searchParams,
        expandedKeys,
        childIndexMap,
        showAll,
      });
      downloadExcelWithImages(columns, corporationPlList, token, "Corporation Profit & Loss.xlsx", 120, 70);
    };*/

  return (
    <>
      <RndPageTitleBar
        pageNm="RND"
        pageUrl="/dashboard"
        breadCrumbItems={[{ label: "DASHBOARD", path: "/dashboard", active: true }]}
        onSearchButtonClick={onSearchButtonClick}
        onExcelDownloadClick={() => {}}
        onPrintButtonClick={() => window.print()}
      />

      <SearchFabricDashboard
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearchButtonClick={onSearchButtonClick}
        showAll={showAll}
      />

      {/*<Card style={{ transform: "translateY(-18px)" }}>
        <Card.Body style={{ minHeight: "calc(75vh - 45px)" }}>
          <Row className="align-items-stretch d-flex flex-wrap">
            <Col xs={12} className="d-flex flex-column">
            </Col>
          </Row>
        </Card.Body>
      </Card>*/}
    </>
  );
});

export default FabricDashboard;
