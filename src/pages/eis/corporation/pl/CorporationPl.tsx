// src/pages/eis/corporation/pl/CorporationPl.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/* components */
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import SearchCorporationPl, { CorporationPlSearchHandle } from "./SearchCorporationPl";
import { CorporationPlTableColumns } from "./CorporationPlTableColumns";
import PisEisTable from "@components/table/PisEisTable";

/* redux */
import { AppDispatch, RootState } from "@redux/store";
import { CorporationPlListRes, getCorporationPlList } from "@redux/eis/corporation/CorporationSlice";

/* utils */
import { isEmpty } from "@utils/CommonUtil";
import { downloadExcelWithImages } from "@utils/excelUtils";

/* constants */
import { Payload } from "@constants/common/common";

/** 올해 1월~현재 월(YYYYMM) 유틸 */
function getThisYearRangeYYYYMM() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return { fromYYYYMM: `${y}01`, toYYYYMM: `${y}${m}` };
}

/** 행 고유키(펼침/하이라이트에 사용) */
const rowKey = (r: CorporationPlListRes) => `${r.tpGrpLv ?? ""}|${r.cdAcctGrp ?? ""}|${r.cdHacctGrp ?? ""}`;

/** parent → child 조건 (일반화) */
const isChildOf = (parent: CorporationPlListRes, child: CorporationPlListRes) => {
  const p = Number(parent.tpGrpLv);
  const c = Number(child.tpGrpLv);
  if (!Number.isFinite(p) || !Number.isFinite(c)) return false;
  return c === p + 1 && String(child.cdHacctGrp) === String(parent.cdAcctGrp);
};

const CorporationPl = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";
  // ===== 초기 조회기간: 매년 1월 ~ 현재 월 =====
  const { fromYYYYMM, toYYYYMM } = getThisYearRangeYYYYMM();

  // 검색 파라미터: 검색 버튼 누를 때만 갱신
  const [searchParams, setSearchParams] = useState({
    cdCompany: userEnvInfo.cdCompany || "",
    cdBizarea: "1000,3000,5000,7000",
    dtsSyymm: fromYYYYMM, // YYYYMM
    dtsEyymm: toYYYYMM, // YYYYMM
    cdCurrency: "LOCAL",
  });

  // 원본 데이터
  const [corporationPlList, setCorporationPlList] = useState<CorporationPlListRes[]>([]);

  //  펼침 상태(레벨 모드에서만 사용)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  //  선택 하이라이트
  const [selectedKey, setSelectedKey] = useState<string>("");

  //  전체보기 토글 (버튼)
  const [showAll, setShowAll] = useState<boolean>(false);

  // 검색 폼 ref
  const searchFormRef = useRef<CorporationPlSearchHandle>(null);

  const fetchCorporationPlList = useCallback(
    (params = searchParams) => {
      return dispatch(getCorporationPlList(params)).then((res) => {
        const payload = res.payload as Payload;
        const list: CorporationPlListRes[] = payload.status === 200 && !isEmpty(payload.data) ? payload.data : [];
        setCorporationPlList(list);
        // 새 조회 시 초기화: 1레벨만 보이기
        setExpandedKeys(new Set());
        setSelectedKey("");
        setShowAll(false); // 조회할 때는 기본 레벨 모드로 리셋
      });
    },
    [dispatch, searchParams]
  );

  useEffect(() => {
    fetchCorporationPlList(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchClick = () => {
    const vals = searchFormRef.current?.getValues();
    if (!vals) return;

    const next = {
      ...searchParams,
      ...vals,
      dtsSyymm: vals.dtsSyymm || fromYYYYMM,
      dtsEyymm: vals.dtsEyymm || toYYYYMM,
    };
    setSearchParams(next);
    fetchCorporationPlList(next);
  };

  /**  parent → children 인덱스( O(1) 접근 ) */
  const childIndexMap = useMemo(() => {
    const byLv = new Map<number, CorporationPlListRes[]>();
    for (let i = 0; i < corporationPlList.length; i++) {
      const r = corporationPlList[i];
      const lv = Number(r.tpGrpLv) || 0;
      const arr = byLv.get(lv);
      if (arr) arr.push(r);
      else byLv.set(lv, [r]);
    }
    const map = new Map<string, CorporationPlListRes[]>();
    byLv.forEach((parents, lv) => {
      const children = byLv.get(lv + 1) || [];
      for (let i = 0; i < parents.length; i++) {
        const p = parents[i];
        const kids = children.filter((c) => isChildOf(p, c));
        if (kids.length) map.set(rowKey(p), kids);
      }
    });
    return map;
  }, [corporationPlList]);

  /**  화면 표시 리스트 */
  const displayedList = useMemo(() => {
    const result: CorporationPlListRes[] = [];
    if (!corporationPlList.length) return result;

    const tops = corporationPlList.filter((r) => String(r.tpGrpLv) === "1");

    const dfs = (node: CorporationPlListRes) => {
      result.push(node);
      const k = rowKey(node);
      // 전체보기면 항상 하위로 내려감, 아니면 펼친 것만
      if (!showAll && !expandedKeys.has(k)) return;
      const children = childIndexMap.get(k) || [];
      for (let i = 0; i < children.length; i++) {
        dfs(children[i]);
      }
    };

    for (let i = 0; i < tops.length; i++) dfs(tops[i]);
    return result;
  }, [corporationPlList, childIndexMap, expandedKeys, showAll]);

  /**  행 클릭: 레벨 모드에서만 토글; 전체보기 모드에선 하이라이트만 */
  const handleRowClick = useCallback(
    (row: CorporationPlListRes) => {
      const k = rowKey(row);
      setSelectedKey((prev) => (prev === k ? "" : k));
      if (showAll) return; // 전체보기일 땐 접힘 제어하지 않음
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    },
    [showAll]
  );

  const onExcelDownloadClick = () => {
    const columns = CorporationPlTableColumns({
      searchParams,
      expandedKeys,
      childIndexMap,
      showAll,
    });
    downloadExcelWithImages(columns, corporationPlList, token, "Corporation Profit & Loss.xlsx", 120, 70);
  };

  // 변경: searchParams/expandedKeys/childIndexMap/showAll을 컬럼 팩토리에 전달
  const columns = useMemo(
    () =>
      CorporationPlTableColumns({
        searchParams,
        expandedKeys,
        childIndexMap,
        showAll,
      }),
    [searchParams, expandedKeys, childIndexMap, showAll]
  );

  /**  KRW 옆 "전체보기" 토글 눌렀을 때 */
  const handleToggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
    // 레벨 모드 복귀 시 접힘 상태는 유지
  }, []);

  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/corporationpl"
        breadCrumbItems={[{ label: "CorporationPl", path: "/corporationpl", active: true }]}
        onSearchButtonClick={handleSearchClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={() => window.print()}
      />

      <SearchCorporationPl
        ref={searchFormRef}
        initialParams={searchParams}
        showAll={showAll}
        onToggleShowAll={handleToggleShowAll}
      />

      {/* 리스트 */}
      <Card className={'mt-n3'}>
        <Card.Body style={{ minHeight: "calc(79vh - 45px)" }}>
          <Row className="align-items-stretch d-flex flex-wrap">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border mt-n3">
                <div className="eis-table-container">
                  <PisEisTable
                    columns={columns}
                    data={displayedList}
                    selectedRow={{ __k: selectedKey } as any}
                    onRowClick={handleRowClick}
                    updateData={() => {}}
                    theadClass="text-center font-12"
                    tableClass="table-custom-eis-background text-center font-12"
                    isSortable={true}
                    isOnlySelected={true}
                    virtualize={false} // 고정컬럼 환경이면 OFF 유지
                    highlightCodes={["3000000", "4000000", "4999999", "5000000", "6000000"]} //백그라운드 강조
                    barHeightStyle={"calc(-100px + 83vh)"}
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

export default CorporationPl;
