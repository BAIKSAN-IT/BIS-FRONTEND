import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {Card} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Swal from "sweetalert2";
import {AppDispatch, RootState} from "@redux/store";

import PisRndTable from "@components/table/PisRndTable";
import RecapListTableColumns from "./RecapListTableColumns";
import {RecapListViewTableColumns} from "./RecapListViewTableColumns";
import SearchRecapListView from "./SearchRecapListView";
import DragHandleComponent from "@components/common/DragHandleComponent";

import {
  addToRecapBasket,
  clearRecap,
  clearRecapView,
  getRndArticleRecapAllList,
  getRndArticleRecapListView,
  mergeRecapFiles,
  RndArticleFileRes,
  RndArticleRecapListViewRes,
  RndArticleRecapRes,
} from "@redux/rnd/RecapSlice";

import {SaveRndArticleFileReq} from "@redux/rnd/RndSlice";
import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import {useDragResize} from "@/utils/useDragResize";
import PisVirtualTable from "@components/table/PisVirtualTable";

/** 유틸 */
const toISODate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const todayStr = toISODate(new Date());
const oneMonthAgoStr = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return toISODate(d);
})();
const toYmd = (s?: string) => (s ? s.replace(/-/g, "") : "");

export type RecapForm = {
  dtsDate: string;
  startDate: string;
  endDate: string;
  cdWorker: string;
  userNm: string;
  cdDept: string;
  nmDept: string;
  cdBuyer: string;
  nmBuyer: string;
  cdBrand: string;
  nmBrand: string;
  cdSeason: string;
  dtsYear: string;
  topic: string;
  remark: string;
  remarkDetail: string;
};

export type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const normalizeRange = (s?: string, e?: string) => {
  const start = s && s.trim() ? s : oneMonthAgoStr;
  const end = e && e.trim() ? e : todayStr;
  return start <= end ? {start, end} : {start: end, end: start};
};

const RecapListView = forwardRef<RecapChildAPI, {}>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  /** 좌측/우측 스토어 */
  const listView = useSelector((s: RootState) => s.recap.listView);
  const detailList = useSelector((s: RootState) => s.recap.list);
  const fileList = useSelector((s: RootState) => s.recap.fileList) as RndArticleFileRes[];

  const [selectedViewRow, setSelectedViewRow] = useState<RndArticleRecapListViewRes | null>(null);
  const [selectedDetailRow, setSelectedDetailRow] = useState<RndArticleRecapRes | null>(null);

  /** 드래그 관련 */
  const {leftPct, onStartDrag, onReset, containerRef} = useDragResize("recapSplitPct", 33);

  /** 전체화면 토글 상태 */
  const [fullScreen, setFullScreen] = useState<"left" | "right" | null>(null);

  /** 폼: 기본 1개월 */
  const [recapForm, setRecapForm] = useState<RecapForm>({
    dtsDate: todayStr,
    startDate: oneMonthAgoStr,
    endDate: todayStr,
    cdWorker: user?.userId || "",
    userNm: user?.userNm || "",
    cdDept: user?.deptId || "",
    nmDept: user?.deptNm || "",
    cdBuyer: "",
    nmBuyer: "",
    cdBrand: "",
    nmBrand: "",
    cdSeason: "",
    dtsYear: String(new Date().getFullYear()),
    topic: "",
    remark: "",
    remarkDetail: "",
  });

  const showAlert = (msg: string) => Swal.fire({text: msg, confirmButtonText: "OK"});

  /** 공통 파라미터 */
  const buildCommonParams = useCallback(
    () => ({
      cdCompany: user?.companyId || "1000",
      cdWorker: recapForm.cdWorker || user?.userId || "",
      cdBuyer: recapForm.cdBuyer || undefined,
      nmBuyer: recapForm.nmBuyer || undefined,
      cdBrand: recapForm.cdBrand || undefined,
      nmBrand: recapForm.nmBrand || undefined,
      cdSeason: recapForm.cdSeason || undefined,
      dtsYear: recapForm.dtsYear || undefined,
      topic: recapForm.topic || undefined,
      remark: recapForm.remark || undefined,
    }),
    [recapForm, user?.companyId, user?.userId]
  );

  /** 좌측 조회 */
  const fetchListView = useCallback(async () => {
    dispatch(clearRecapView());
    dispatch(clearRecap());

    const {start, end} = normalizeRange(recapForm.startDate, recapForm.endDate);
    const params = {
      ...buildCommonParams(),
      startDate: toYmd(start),
      endDate: toYmd(end),
    } as const;

    try {
      const res: any = await dispatch(getRndArticleRecapListView(params)).unwrap();
      const arr: RndArticleRecapListViewRes[] = Array.isArray(res?.data)
        ? res.data
        : res?.data?.rndArticleRecapListView ?? [];

      const first = arr[0];
      setSelectedViewRow(first ?? null);

      if (first?.dtsSeq) {
        await fetchDetailBySeq(first.dtsSeq);
      }
    } catch {
      showAlert("리스트 조회 중 오류가 발생했습니다.");
    }
  }, [dispatch, recapForm.startDate, recapForm.endDate, buildCommonParams]);

  /** 우측 상세 조회 */
  const fetchDetailBySeq = useCallback(
    async (dtsSeq: string) => {
      if (!dtsSeq) {
        dispatch(clearRecap());
        return;
      }
      const {start, end} = normalizeRange(recapForm.startDate, recapForm.endDate);
      const params = {
        ...buildCommonParams(),
        dtsSeq,
        startDate: toYmd(start),
        endDate: toYmd(end),
        seq: 0,
        seqArticle: "",
      } as const;

      try {
        const res: any = await dispatch(getRndArticleRecapAllList(params)).unwrap();
        setSelectedDetailRow(null);

        const files = res?.data?.rndArticleFileList ?? [];
        if (files.length) {
          dispatch(mergeRecapFiles(files));
        }
      } catch {
        showAlert("상세 조회 중 오류가 발생했습니다.");
      }
    },
    [dispatch, recapForm.startDate, recapForm.endDate, buildCommonParams]
  );

  /** 초기 자동 조회 */
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchListView();
  }, [fetchListView]);

  /** 좌측/우측 테이블 핸들러 */
  const onLeftRowClick = (row: RndArticleRecapListViewRes) => {
    setSelectedViewRow(row);

    dispatch(clearRecap());

    if (row?.dtsSeq) fetchDetailBySeq(row.dtsSeq);
  };
  const onRightRowDoubleClick = (row: RndArticleRecapRes) => {
    dispatch(addToRecapBasket([row]));

    const seq = String(row.seqArticle ?? row.seqNo ?? "");
    const relatedFiles = fileList.filter((f) => String(f.seqArticle) === seq);
    if (relatedFiles.length > 0) {
      dispatch(mergeRecapFiles(relatedFiles));
    }

    window.postMessage({type: "SWITCH_TAB", tab: "recap"}, "*");
  };

  /** 엑셀 */
  const onExcel = () => {
    if (!detailDataForTable.length) return showAlert("엑셀로 내보낼 항목이 없습니다.");

    const dataForTable = detailDataForTable.map((r, idx) => {
      const seq = String(r.seqArticle ?? r.seqNo ?? idx);
      const file = fileList.find((f) => String(f.seqArticle) === seq);
      const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;
      const imgUrl = fileName
        ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
        : null;
      return {
        ...r,
        seqArticle: seq,
        remark: r.remark ?? r.remarkDetail ?? "",
        imgUrl,
      };
    });

    const fileListForColumns: SaveRndArticleFileReq[] = fileList.map((f) => ({
      cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
      seqArticle: String(f.seqArticle ?? ""),
      seq: Number(f.seq ?? 0),
      imgFileNameOrg: f.imgFileNameOrg ?? "",
      imgFileName: f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
      ynFlag: f.ynFlag ?? "",
    }));

    const columns = RecapListTableColumns(fileListForColumns);
    downloadExcelWithImages(columns, dataForTable, token, "RecapList.xlsx", 120, 70);
  };

  useImperativeHandle(ref, () => ({
    onSearch: fetchListView,
    onNew: () => {
    },
    onSave: () => {
    },
    onDelete: () => {
    },
    onExcel,
    onPrint: () => {
    },
  }));

  /** 컬럼 */
  const leftColumns = useMemo(() => RecapListViewTableColumns(), []);
  const fileListForColumns: SaveRndArticleFileReq[] = useMemo(
    () =>
      fileList.map((f) => ({
        cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
        seqArticle: String(f.seqArticle ?? ""),
        seq: Number(f.seq ?? 0),
        imgFileNameOrg: f.imgFileNameOrg ?? "",
        imgFileName: f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
        ynFlag: f.ynFlag ?? "",
      })),
    [fileList, user?.companyId]
  );
  const rightColumns = useMemo(() => RecapListTableColumns(fileListForColumns), [fileListForColumns, detailList]);

  /** 우측 테이블 데이터 */
  const detailDataForTable = useMemo(
    () =>
      detailList.map((r, idx) => {
        const seq = String(r.seqArticle ?? r.seqNo ?? idx);
        const file = fileList.find((f) => String(f.seqArticle) === seq);
        const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;
        const imgUrl = fileName
          ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
          : null;
        return {
          ...r,
          seqArticle: seq,
          remark: r.remark ?? r.remarkDetail ?? "",
          imgUrl,
        };
      }),
    [detailList, fileList]
  );

  /** 더블클릭 핸들러 */
  const handleLeftDoubleClick = () => {
    setFullScreen((prev) => (prev === "left" ? null : "left"));
  };
  const handleRightDoubleClick = () => {
    setFullScreen((prev) => (prev === "right" ? null : "right"));
  };

  return (
    <>
      <SearchRecapListView
        recapForm={recapForm}
        setRecapForm={setRecapForm}
        refs={{} as any}
        onEnterSearch={fetchListView}
      />

      <div
        ref={containerRef}
        className={"mt-n3"}
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* 좌측 패널 */}
        {fullScreen !== "right" && (
          <div
            style={{
              width: fullScreen === "left" ? "100%" : `${leftPct}%`,
              minWidth: "10%",
              transition: "width 0.2s",
            }}
            onDoubleClick={handleLeftDoubleClick}
          >
            <Card className="align-items-stretch d-flex flex-wrap card flex-grow-1 card-gray-border">
              <Card.Body style={{height: 'calc(-93px + 74vh)'}}>
                <div className="card flex-grow-1 card-gray-border">
                  <div className="eis-table-container" style={{height: 'calc(-95px + 80vh)'}}>
                    <PisVirtualTable
                      columns={leftColumns}
                      data={listView}
                      onRowClick={onLeftRowClick}
                      selectedRow={selectedViewRow as any}
                      theadClass="table-custom-rnd-light text-center font-12"
                      tableClass="table-custom-rnd-background text-center font-12"
                      barHeightStyle={"calc(-100px + 71vh)"}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* 드래그 핸들 (전체화면일 땐 숨김) */}
        {fullScreen === null && (
          <DragHandleComponent
            onStartDrag={onStartDrag}
            onReset={onReset}
            title="드래그해서 폭 조절 (더블클릭: 초기화)"
          />
        )}

        {/* 우측 패널 */}
        {fullScreen !== "left" && (
          <div
            style={{
              flex: 1,
              minWidth: "10%",
              transition: "width 0.2s",
            }}
            onDoubleClick={handleRightDoubleClick}
          >
            <Card className="align-items-stretch d-flex flex-wrap card flex-grow-1 card-gray-border">
              <Card.Body style={{height: 'calc(-93px + 74vh)'}}>
                <div className="card flex-grow-1 card-gray-border">
                  <div className="eis-table-container" style={{height: 'calc(-95px + 80vh)'}}>
                    <PisVirtualTable
                      columns={rightColumns}
                      data={detailDataForTable}
                      onRowClick={(row) => setSelectedDetailRow(row)}
                      onRowDoubleClick={onRightRowDoubleClick}
                      selectedRow={selectedDetailRow}
                      theadClass="table-custom-rnd-light text-center font-12"
                      tableClass="table-custom-rnd-background text-center font-12"
                      isSortable
                      isOnlySelected
                      barHeightStyle={"calc(-100px + 71vh)"}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </>
  );
});

export default RecapListView;
