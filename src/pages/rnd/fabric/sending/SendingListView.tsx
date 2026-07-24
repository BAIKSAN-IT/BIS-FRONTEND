// src/pages/rnd/sending/SendingListView.tsx
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {Card} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import SendingListTableColumns from "./SendingListTableColumns";
import {SendingListViewTableColumns} from "./SendingListViewTableColumns";
import SearchSendingListView from "./SearchSendingListView";
import DragHandleComponent from "@components/common/DragHandleComponent";

import {
  addToSendBasket,
  clearSend,
  clearSendView,
  getRndArticleSendAllList,
  getRndArticleSendListView,
  mergeSendFiles,
  RndArticleFileRes,
  RndArticleSendListViewRes,
  RndArticleSendRes,
  saveRndArticleSend,
} from "@redux/rnd/SendingSlice";

import {SaveRndArticleFileReq} from "@redux/rnd/RndSlice";
import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import {useDragResize} from "@utils/useDragResize";
import Swal from "sweetalert2";
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

export type SendingForm = {
  dtsDate: string;
  startDate: string;
  endDate: string;
  recipient: string;
  cdSending: string;
  cdWorker: string;
  userNm: string;
  cdDept: string;
  nmDept: string;
  cdBuyer: string;
  nmBuyer: string;
  cdBrand: string;
  nmBrand: string;
  cdSeason: string;
  nmSeason: string;
  dtsYear: string;
  topic: string;
  remark: string;
  remarkDetail: string;
};

export type SendingChildAPI = {
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

const SendingListView = forwardRef<SendingChildAPI, {}>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

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

  /** 좌측/우측 스토어 */
  const listView = useSelector((s: RootState) => s.sending.listView);
  const detailList = useSelector((s: RootState) => s.sending.list);
  const fileList = useSelector((s: RootState) => s.sending.fileList) as RndArticleFileRes[];

  const [selectedViewRow, setSelectedViewRow] = useState<RndArticleSendListViewRes | null>(null);
  const [selectedDetailRow, setSelectedDetailRow] = useState<RndArticleSendRes | null>(null);

  /** 드래그 관련 */
  const {leftPct, onStartDrag, onReset, containerRef} = useDragResize("sendingSplitPct", 33);

  /** 전체화면 토글 상태 */
  const [fullScreen, setFullScreen] = useState<"left" | "right" | null>(null);

  /** 폼: 기본 1개월 */
  const [sendingForm, setSendingForm] = useState<SendingForm>({
    dtsDate: todayStr,
    startDate: oneMonthAgoStr,
    endDate: todayStr,
    recipient: "",
    cdSending: "",
    cdWorker: "",
    userNm: "",
    cdDept: "",
    nmDept: "",
    cdBuyer: "",
    nmBuyer: "",
    cdBrand: "",
    nmBrand: "",
    cdSeason: "",
    nmSeason: "",
    dtsYear: String(new Date().getFullYear()),
    topic: "",
    remark: "",
    remarkDetail: "",
  });

  /** 공통 파라미터 */
  const buildCommonParams = useCallback(
    () => ({
      cdCompany: user?.companyId || "1000",
      cdWorker: sendingForm.cdWorker || user?.userId || "",
      cdBuyer: sendingForm.cdBuyer || undefined,
      nmBuyer: sendingForm.nmBuyer || undefined,
      cdBrand: sendingForm.cdBrand || undefined,
      nmBrand: sendingForm.nmBrand || undefined,
      cdSeason: sendingForm.cdSeason || undefined,
      dtsYear: sendingForm.dtsYear || undefined,
      topic: sendingForm.topic || undefined,
      remark: sendingForm.remark || undefined,
    }),
    [sendingForm, user?.companyId, user?.userId]
  );

  /** 좌측 조회 */
  const fetchListView = useCallback(async () => {
    dispatch(clearSendView());
    dispatch(clearSend());

    const {start, end} = normalizeRange(sendingForm.startDate, sendingForm.endDate);
    const params = {
      ...buildCommonParams(),
      startDate: toYmd(start),
      endDate: toYmd(end),
    } as const;

    try {
      const res: any = await dispatch(getRndArticleSendListView(params)).unwrap();
      const arr: RndArticleSendListViewRes[] = Array.isArray(res?.data)
        ? res.data
        : res?.data?.rndArticleSendListView ?? [];

      const first = arr[0];
      setSelectedViewRow(first ?? null);

      if (first?.dtsSeq) {
        await fetchDetailBySeq(first.dtsSeq);
      }
    } catch {
    }
  }, [dispatch, sendingForm.startDate, sendingForm.endDate, buildCommonParams]);

  /** 우측 상세 조회 */
  const fetchDetailBySeq = useCallback(
    async (dtsSeq: string) => {
      if (!dtsSeq) {
        dispatch(clearSend());
        return;
      }
      const {start, end} = normalizeRange(sendingForm.startDate, sendingForm.endDate);
      const params = {
        ...buildCommonParams(),
        dtsSeq,
        startDate: toYmd(start),
        endDate: toYmd(end),
        seq: 0,
        seqArticle: "",
      } as const;

      try {
        const res: any = await dispatch(getRndArticleSendAllList(params)).unwrap();
        setSelectedDetailRow(null);

        const files = res?.data?.rndArticleFileList ?? [];
        if (files.length) {
          dispatch(mergeSendFiles(files));
        }
      } catch {
      }
    },
    [dispatch, sendingForm.startDate, sendingForm.endDate, buildCommonParams]
  );

  /** 초기 자동 조회 */
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchListView();
  }, [fetchListView]);

  const onDelete = async () => {
    if (!selectedViewRow) {
      showAlert("삭제할 항목이 없습니다.");
      return;
    }

    try {
      const payload = [
        {
          cdCompany: user?.companyId || "1000",
          dtsDate: selectedViewRow?.dtsDate?.replace(/-/g, "") ?? "",
          dtsSeq: selectedViewRow?.dtsSeq ?? "",
          qrcode: "",
          seqArticle: "",
          cdSending: selectedViewRow.cdSending ?? "",
          recipient: selectedViewRow.recipient ?? "",
          cdWorker: selectedViewRow.cdWorker || user?.userId || "",
          remark: selectedViewRow.remark ?? "",
          ynFlag: "D", // 삭제
        },
      ];

      await dispatch(saveRndArticleSend(payload as any)).unwrap();
      setSelectedViewRow(null);
      showAlert("삭제 완료");
      await dispatch(getRndArticleSendAllList(sendingForm)).unwrap();
      await dispatch(getRndArticleSendListView(sendingForm)).unwrap();
    } catch (err) {
      console.error("삭제 오류:", err);
      showAlert("삭제 실패");
    }
  };

  /** 좌측 row 클릭 시 선택 */
  const onLeftRowClick = (row: RndArticleSendListViewRes) => {
    setSelectedViewRow(row);
    if (row?.dtsSeq) fetchDetailBySeq(row.dtsSeq);
  };

  const onRightRowDoubleClick = (row: RndArticleSendRes) => {
    dispatch(addToSendBasket([row]));

    const seq = String(row.seqArticle ?? row.seqNo ?? "");
    const relatedFiles = fileList.filter((f) => String(f.seqArticle) === seq);
    if (relatedFiles.length > 0) {
      dispatch(mergeSendFiles(relatedFiles));
    }

    window.postMessage({type: "SWITCH_TAB", tab: "sending"}, "*");
  };

  const onExcel = () => {
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

    const columns = SendingListTableColumns(fileListForColumns);
    downloadExcelWithImages(columns, dataForTable, token, "SendingList.xlsx", 120, 70);
  };

  useImperativeHandle(ref, () => ({
    onSearch: fetchListView,
    onNew: () => {
    },
    onSave: () => {
    },
    onDelete: onDelete,
    onExcel,
    onPrint: () => {
    },
  }));

  /** 컬럼 */
  const leftColumns = useMemo(() => SendingListViewTableColumns(), []);
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
  const rightColumns = useMemo(() => SendingListTableColumns(fileListForColumns), [fileListForColumns, detailList]);

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
      <SearchSendingListView
        sendingForm={sendingForm}
        setSendingForm={setSendingForm}
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

        {/* 드래그 핸들 */}
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

export default SendingListView;
