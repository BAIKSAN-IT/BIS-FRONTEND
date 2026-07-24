import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";

/* components */
import RndPageTitleBar from "@components/common/RndPageTitleBar";
import SearchFabricLibrary from "./SearchFabricLibrary";
import {FabricLibraryListTableColumns} from "./FabricLibraryListTableColumns";
import FabricLibraryRegister from "./FabricLibraryRegister";
import {openReportPopup} from "@components/report/openReportPopup";

/* redux */
import {AppDispatch, RootState} from "@redux/store";
import {
  deleteArticleInfo,
  getRndArticleAllList,
  RndArticleAllListRes,
  RndArticleModel,
  RndArticleReq,
  RndArticleSaveReq,
  saveRndArticle,
  SaveRndArticleCompositionReq,
  SaveRndArticleFileReq,
  SaveRndArticleProcessReq,
  SaveRndArticleReq,
  SaveRndArticleStyleReq,
  SaveRndArticleYarnReq,
  uploadRndFile,
} from "@redux/rnd/RndSlice";
import {exportRndArticleReport} from "@redux/reports/ReportsSlice";

/* utils  */
import {isEmpty} from "@utils/CommonUtil";
import {DateUtils} from "@utils/dateUtils";
import useReportPopupBridge from "@utils/useReportPopupBridge";
import {downloadExcelWithImages} from "@utils/excelUtils";
import useInputRefs from "@utils/useInputRefs";

/* constants */
import {Payload} from "@constants/common/common";

/* lb */
import Swal from "sweetalert2";

/* config */
import config from "../../../../config";
import IconComponent from "@components/common/IconComponent";
import ColumnSelectPopup from "@pages/rnd/fabric/library/ColumnSelectPopup";
import PisVirtualTable from "@components/table/PisVirtualTable";

type QueuedFileMeta = {
  name: string;
  size: number;
  lastModified: number;
  type: string;
};

type RegisterSnapshot = {
  articleList: any[];
  yarnList: any[];
  processList: any[];
  compositionList: any[];
  fileList: any[];
  styleList: any[];
  queuedFiles: QueuedFileMeta[];
};

const normalizeScalar = (value: any): any => {
  if (value === undefined || value === null) return "";
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim();
  return value;
};

const normalizeComparable = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparable(item));
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const result: Record<string, any> = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        result[key] = normalizeComparable(value[key]);
      });
    return result;
  }

  return normalizeScalar(value);
};

const stableStringify = (value: any): string => {
  return JSON.stringify(normalizeComparable(value));
};

const normalizeAndSortList = <T,>(list: T[] = []) => {
  return [...(list || [])]
    .map((item) => normalizeComparable(item))
    .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
};

const makeQueuedFileMeta = (files: File[] = []): QueuedFileMeta[] => {
  return [...files]
    .map((file) => ({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      type: file.type,
    }))
    .sort((a, b) =>
      `${a.name}_${a.size}_${a.lastModified}_${a.type}`.localeCompare(
        `${b.name}_${b.size}_${b.lastModified}_${b.type}`
      )
    );
};

const createRegisterSnapshot = ({
                                  articleList = [],
                                  yarnList = [],
                                  processList = [],
                                  compositionList = [],
                                  fileList = [],
                                  styleList = [],
                                  queuedFiles = [],
                                }: {
  articleList?: SaveRndArticleReq[];
  yarnList?: SaveRndArticleYarnReq[];
  processList?: SaveRndArticleProcessReq[];
  compositionList?: SaveRndArticleCompositionReq[];
  fileList?: SaveRndArticleFileReq[];
  styleList?: SaveRndArticleStyleReq[];
  queuedFiles?: File[];
} = {}): RegisterSnapshot => {
  return {
    articleList: normalizeAndSortList(articleList),
    yarnList: normalizeAndSortList(yarnList),
    processList: normalizeAndSortList(processList),
    compositionList: normalizeAndSortList(compositionList),
    fileList: normalizeAndSortList(fileList),
    styleList: normalizeAndSortList(styleList),
    queuedFiles: makeQueuedFileMeta(queuedFiles),
  };
};

const FabricLibrary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {t} = useTranslation();
  const user = useSelector((state: RootState) => state.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  /* SweetAlert - 단순 메시지 알림 */
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

  /* SweetAlert - 확인 취소 모달 */
  const confirmAction = (message: string, callback: () => void) => {
    Swal.fire({
      title: "Confirm",
      html: message,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "tight-swal-popup",
        title: "tight-swal-title",
        closeButton: "tight-swal-close",
        confirmButton: "small-swal-button",
        cancelButton: "small-swal-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  const [isFabricLibraryStatus, setIsFabricLibraryStatus] = useState(true); // 현재 페이지 상태
  const [isSaveStatus, setIsSaveStatus] = useState(false); // selected 이후 저장 상태

  const isRegisterInitializing = useRef(false);
  const registerInitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [registerBaseline, setRegisterBaseline] = useState<string>("");

  const clearRegisterInitTimer = () => {
    if (registerInitTimerRef.current) {
      clearTimeout(registerInitTimerRef.current);
      registerInitTimerRef.current = null;
    }
  };

  const buildRegisterSnapshotString = ({
                                         articleList = [],
                                         yarnList = [],
                                         processList = [],
                                         compositionList = [],
                                         fileList = [],
                                         styleList = [],
                                         queuedFiles = [],
                                       }: {
    articleList?: SaveRndArticleReq[];
    yarnList?: SaveRndArticleYarnReq[];
    processList?: SaveRndArticleProcessReq[];
    compositionList?: SaveRndArticleCompositionReq[];
    fileList?: SaveRndArticleFileReq[];
    styleList?: SaveRndArticleStyleReq[];
    queuedFiles?: File[];
  } = {}) => {
    return stableStringify(
      createRegisterSnapshot({
        articleList,
        yarnList,
        processList,
        compositionList,
        fileList,
        styleList,
        queuedFiles,
      })
    );
  };

  const beginRegisterInitialize = () => {
    clearRegisterInitTimer();
    isRegisterInitializing.current = true;
    setRegisterBaseline("");
  };

  const defaultRndArticleReq: RndArticleReq = {
    cdCompany: user?.companyId || "1000",
    startDate: "20240101",
    endDate: DateUtils.today.replace(/-/g, ""),
    seqArticle: "",
    cdHanger: "",
    nmFabric: "",
    cdSupplier: "",
    noSupplierArticle: "",
    productType: "",
    fabricType: "",
    fabricDivision: "",
    fabricCategory: "",
    fabricStructure: "",
    userNm: "",
    cdDept: "",
    nmDept: "",
    noSample: "",
    noLot: "",
    ynConfirm: "",
    cdFabric: "",
    cdComposition: "",
    cdProcess: "",
    cdYarn: "",
    nmYarn: "",
    qrcode: "",
    seq: 0,
    rowQrNum: 0,
  };

  const [searchParams, setSearchParams] = useState<RndArticleReq>(defaultRndArticleReq);
  const {refs, getValues} = useInputRefs([
    "nmFabric",
    "startDate",
    "endDate",
    "cdSupplier",
    "noSupplierArticle",
    "cdHanger",
    "productType",
    "fabricType",
    "fabricDivision",
    "fabricCategory",
    "fabricStructure",
    "userNm",
    "cdDept",
    "nmDept",
    "noSample",
    "noLot",
    "ynConfirm",
    "cdFabric",
    "cdComposition",
    "cdProcess",
    "cdYarn",
    "nmYarn",
    "qrcode",
    "seq",
  ]);
  const [rndArticleAllList, setRndArticleAllList] = useState<RndArticleAllListRes | null>(null);
  const [selectedRow, setSelectedRow] = useState<RndArticleModel | null>(null);
  const [checkedRows, setCheckedRows] = useState<RndArticleModel[]>([]);
  const [articleList, setArticleList] = useState<SaveRndArticleReq[]>([]);
  const [yarnList, setYarnList] = useState<SaveRndArticleYarnReq[]>([]);
  const [processList, setProcessList] = useState<SaveRndArticleProcessReq[]>([]);
  const [compositionList, setCompositionList] = useState<SaveRndArticleCompositionReq[]>([]);
  const [fileList, setFileList] = useState<SaveRndArticleFileReq[]>([]);
  const [styleList, setStyleList] = useState<SaveRndArticleStyleReq[]>([]);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isFabricLibraryStatus) return;
    if (!isRegisterInitializing.current) return;

    clearRegisterInitTimer();

    registerInitTimerRef.current = setTimeout(() => {
      setRegisterBaseline(
        buildRegisterSnapshotString({
          articleList,
          yarnList,
          processList,
          compositionList,
          fileList,
          styleList,
          queuedFiles,
        })
      );
      isRegisterInitializing.current = false;
      registerInitTimerRef.current = null;
    }, 400);

    return () => {
      clearRegisterInitTimer();
    };
  }, [
    isFabricLibraryStatus,
    articleList,
    yarnList,
    processList,
    compositionList,
    fileList,
    styleList,
    queuedFiles,
  ]);

  useEffect(() => {
    return () => {
      clearRegisterInitTimer();
    };
  }, []);

  const isRegisterDirty = useMemo(() => {
    if (isFabricLibraryStatus) return false;
    if (isRegisterInitializing.current) return false;
    if (!registerBaseline) return false;

    const currentSnapshot = buildRegisterSnapshotString({
      articleList,
      yarnList,
      processList,
      compositionList,
      fileList,
      styleList,
      queuedFiles,
    });

    return currentSnapshot !== registerBaseline;
  }, [
    isFabricLibraryStatus,
    registerBaseline,
    articleList,
    yarnList,
    processList,
    compositionList,
    fileList,
    styleList,
    queuedFiles,
  ]);

  const fetchRndArticleAllList = (params = searchParams) => {
    dispatch(getRndArticleAllList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setRndArticleAllList(payload.data);
      } else {
        setRndArticleAllList(null);
      }
    });
  };

  const safeMerge = (current: any, updates: any) => {
    const result: any = {...current};
    Object.keys(updates).forEach((key) => {
      const v = updates[key];
      if (v !== undefined && v !== "") {
        result[key] = v;
      }
    });
    return result;
  };

  const onSearchButtonClick = () => {
    const inputValues = getValues();

    const nextParams = safeMerge(searchParams, {
      ...inputValues,
      startDate: inputValues.startDate?.replaceAll("-", "") ?? searchParams.startDate,
      endDate: inputValues.endDate?.replaceAll("-", "") ?? searchParams.endDate,
      seq: Number(inputValues.seq || searchParams.seq || 0),
    });

    setSearchParams(nextParams);
    fetchRndArticleAllList(nextParams);
  };

  const onNewButtonClick = () => {
    beginRegisterInitialize();

    setIsFabricLibraryStatus(false);
    setIsSaveStatus(false);
    setRndArticleAllList(null);
    setSelectedRow(null);
    setCheckedRows([]);
    setArticleList([]);
    setYarnList([]);
    setProcessList([]);
    setCompositionList([]);
    setStyleList([]);
    setFileList([]);
    setQueuedFiles([]);
  };

  const onSaveButtonClick = async () => {
    if (!articleList.length) return showAlert("저장할 데이터가 없습니다.");
    if (!articleList[0].nmFabric) return showAlert("Fabric Full Name을 확인해주세요.");

    const validList = compositionList.filter((r) => r.ynFlag !== "D");

    const faceSum = validList.reduce((s, r) => s + Number(r.rtComp || 0), 0);
    const backSum = validList.reduce((s, r) => s + Number(r.rtCompBack || 0), 0);

    const hasBack = validList.some((r) => Number(r.rtCompBack || 0) !== 0);

    if (faceSum !== 100) {
      return showAlert("Contents(Composition) FACE Rate(%) 합계가 100이어야 합니다.");
    }

    if (hasBack && faceSum + backSum !== 200) {
      return showAlert("Contents(Composition) FACE+BACK Rate(%) 합계가 200이어야 합니다.");
    }

    const yarnSum = yarnList
      .filter((r) => r.ynFlag !== "D")
      .reduce((s, r) => s + Number(r.cpstRt || 0), 0);

    const doSave = async () => {
      const parentSeq = selectedRow?.seqArticle ?? articleList?.[0]?.seqArticle ?? "";
      const parentFab = selectedRow?.cdFabric ?? articleList?.[0]?.cdFabric ?? "";
      const parentQtyKeepOrg = selectedRow?.qtyKeep ?? articleList?.[0]?.qtyKeep ?? 0;
      const parentCategoryS = articleList?.[0]?.fabricCategoryS ?? "";
      const parentStructureS = articleList?.[0]?.fabricStructureS ?? "";

      const normalizeChild = <T extends {ynFlag?: string; seqArticle?: string; cdFabric?: string}>(
        list: T[]
      ) =>
        list.map((r) => {
          const withSeq = {...r, seqArticle: parentSeq};
          return r.ynFlag === "D" ? withSeq : {...withSeq, cdFabric: parentFab};
        });

      const normalizeFiles = <T extends {ynFlag?: string; seqArticle?: string}>(list: T[]) =>
        list.map((r) => ({...r, seqArticle: parentSeq}));

      const data: RndArticleSaveReq = {
        articleList,
        yarnList: normalizeChild(yarnList),
        processList: normalizeChild(processList),
        compositionList: normalizeChild(compositionList),
        fileList: normalizeFiles(fileList),
        styleList: normalizeChild(styleList),
      };

      try {
        const saveRes = await dispatch(saveRndArticle(data)).unwrap();

        const seqArticleFromRes =
          (saveRes?.data &&
            (saveRes.data.seqArticle || saveRes.data?.articleList?.[0]?.seqArticle)) ||
          articleList?.[0]?.seqArticle ||
          "";

        if (queuedFiles.length > 0 && data.fileList.length > 0) {
          await dispatch(uploadRndFile({seqArticle: seqArticleFromRes, files: queuedFiles})).unwrap();
        }

        const listAction = await dispatch(
          getRndArticleAllList({
            ...searchParams,
            seqArticle: selectedRow?.seqArticle ?? articleList?.[0]?.seqArticle ?? "",
          })
        );

        const payload = listAction.payload as Payload;
        if (payload.status === 200 && payload.data) {
          const dataAll = payload.data as RndArticleAllListRes;
          setRndArticleAllList(dataAll);

          const first = dataAll.rndArticleList?.[0];
          if (first) {
            const seq = first.seqArticle;

            const mapArticleForUI = (item: any) => ({
              ...item,
              fabricCategoryS: parentCategoryS,
              fabricStructureS: parentStructureS,
              qtyKeepOrg: parentQtyKeepOrg,
              cdHangerPrev: "",
            });

            const nextArticleList = (dataAll.rndArticleList || [])
              .filter((x) => x.seqArticle === seq)
              .map(mapArticleForUI);
            const nextYarnList = (dataAll.rndArticleYarnList || []).filter((x) => x.seqArticle === seq);
            const nextProcessList = (dataAll.rndArticleProcessList || []).filter((x) => x.seqArticle === seq);
            const nextCompositionList = (dataAll.rndArticleCompositionList || []).filter((x) => x.seqArticle === seq);
            const nextFileList = (dataAll.rndArticleFileList || []).filter((x) => x.seqArticle === seq);
            const nextStyleList = (dataAll.rndArticleStyleList || []).filter((x) => x.seqArticle === seq);

            beginRegisterInitialize();

            setArticleList(nextArticleList);
            setYarnList(nextYarnList);
            setProcessList(nextProcessList);
            setCompositionList(nextCompositionList);
            setFileList(nextFileList);
            setStyleList(nextStyleList);
            setQueuedFiles([]);

            setSelectedRow(first);
            setCheckedRows([]);
            setSearchParams(defaultRndArticleReq);
            setIsFabricLibraryStatus(false);
            setIsSaveStatus(true);
          } else {
            beginRegisterInitialize();

            setArticleList([]);
            setYarnList([]);
            setProcessList([]);
            setCompositionList([]);
            setFileList([]);
            setStyleList([]);
            setQueuedFiles([]);
            setSelectedRow(null);
            setCheckedRows([]);
            setIsSaveStatus(false);
          }
        } else {
          setRndArticleAllList(null);
        }

        showAlert("저장되었습니다.");
      } catch (err) {
        let message = "저장에 실패했습니다.";

        if (typeof err === "object" && err !== null) {
          const anyErr = err as any;
          message = anyErr?.message ?? anyErr?.response?.data?.message ?? message;
        }
        showAlert(message);
      }
    };

    if (yarnSum !== 100) {
      confirmAction("Yarn Information Composition(100%)이 아닌데 저장하시겠습니까?", () => {
        void doSave();
      });
      return;
    }

    await doSave();
  };

  const onDeleteButtonClick = () => {
    if (checkedRows.length === 0) {
      showAlert(t("체크박스를 선택 후 삭제해주세요. "));
      return;
    }

    if (checkedRows.length > 1) {
      showAlert(t("하나의 Row만 삭제가 가능합니다."));
      return;
    }

    const hasConfirmed = checkedRows.some((r) => r.ynConfirm === "Y");

    if (hasConfirmed) {
      showAlert("완료 상태인 자료는 삭제할 수 없습니다.");
      return;
    }

    confirmAction(t("common.confirm.delete"), handleDeleteConfirm);
  };

  const handleDeleteConfirm = async () => {
    const hasConfirmed = checkedRows.some((r) => r.ynConfirm === "Y");

    if (hasConfirmed) {
      showAlert("완료 상태인 자료는 삭제할 수 없습니다.");
      return;
    }

    try {
      for (const row of checkedRows) {
        await dispatch(
          deleteArticleInfo({
            cdCompany: row.cdCompany,
            seqArticle: row.seqArticle,
          })
        ).unwrap();
      }

      const resetParams = {
        cdCompany: user?.companyId || "1000",
        startDate: "20240101",
        endDate: DateUtils.today.replace(/-/g, ""),
        seqArticle: "",
        cdHanger: "",
        nmFabric: "",
        cdSupplier: "",
        noSupplierArticle: "",
        productType: "",
        fabricType: "",
        fabricDivision: "",
        fabricCategory: "",
        fabricStructure: "",
        userNm: "",
        cdDept: "",
        nmDept: "",
        noSample: "",
        noLot: "",
        ynConfirm: "",
        cdFabric: "",
        cdComposition: "",
        cdProcess: "",
        cdYarn: "",
        nmYarn: "",
        qrcode: "",
        seq: 0,
        rowQrNum: 0,
      };

      fetchRndArticleAllList(resetParams);

      setSelectedRow(null);
      setCheckedRows([]);
      setSearchParams(resetParams);

      showAlert("삭제되었습니다.");
    } catch (err) {
      showAlert(t("common.confirm.deleteUserErrorManager"));
    }
  };

  const onRowDoubleClick = (row: RndArticleModel) => {
    const seq = row.seqArticle;

    const nextArticleList = (
      rndArticleAllList?.rndArticleList?.filter((item) => item.seqArticle === seq) || []
    ).map((item) => ({
      ...item,
      fabricCategoryS: "",
      fabricStructureS: "",
      qtyKeepOrg: item.qtyKeep || 0,
      cdHangerPrev: "",
    }));

    const nextYarnList =
      rndArticleAllList?.rndArticleYarnList?.filter((item) => item.seqArticle === seq) || [];
    const nextProcessList =
      rndArticleAllList?.rndArticleProcessList?.filter((item) => item.seqArticle === seq) || [];
    const nextCompositionList =
      rndArticleAllList?.rndArticleCompositionList?.filter((item) => item.seqArticle === seq) || [];
    const nextFileList =
      rndArticleAllList?.rndArticleFileList?.filter((item) => item.seqArticle === seq) || [];
    const nextStyleList =
      rndArticleAllList?.rndArticleStyleList?.filter((item) => item.seqArticle === seq) || [];

    beginRegisterInitialize();

    setArticleList(nextArticleList);
    setYarnList(nextYarnList);
    setProcessList(nextProcessList);
    setCompositionList(nextCompositionList);
    setFileList(nextFileList);
    setStyleList(nextStyleList);
    setQueuedFiles([]);

    setSelectedRow(row);
    setIsFabricLibraryStatus(false);
    setIsSaveStatus(false);
  };

  const handleCheckboxChange = (
    row: RndArticleModel,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();

    setCheckedRows((prev) => {
      const exists = prev.some((r) => r.seqArticle === row.seqArticle);

      if (exists) {
        return prev.filter((r) => r.seqArticle !== row.seqArticle);
      }

      return [...prev, row];
    });

    setSelectedRow(null);
  };

  useEffect(() => {
    if (isFabricLibraryStatus) fetchRndArticleAllList();
  }, [isFabricLibraryStatus]);

  const [reportPayload, setReportPayload] = useState<{
    blobUrl: string;
    params: any;
  } | null>(null);

  useReportPopupBridge(
    () => reportPayload ?? {blobUrl: "", params: {}},
    async (docType, ctx) => {
      const res = await dispatch(exportRndArticleReport({...ctx.request, docType})).unwrap();

      const mime =
        docType === "pdf"
          ? "application/pdf"
          : docType === "excel"
            ? "application/vnd.ms-excel"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const ext = docType === "pdf" ? "pdf" : docType === "excel" ? "xls" : "docx";

      const blob = new Blob([res.data], {type: mime});
      const url = URL.createObjectURL(blob);
      return {url, filename: `report.${ext}`};
    }
  );

  const onPrintButtonClick = async () => {
    const seqArticleList = isFabricLibraryStatus
      ? checkedRows.map((r) => r.seqArticle).filter(Boolean)
      : selectedRow?.seqArticle
        ? [selectedRow.seqArticle]
        : articleList?.[0]?.seqArticle
          ? [articleList[0].seqArticle]
          : [];

    if (!seqArticleList || seqArticleList.length === 0) {
      showAlert("출력할 항목을 선택(또는 저장)해 주세요.");
      return;
    }

    const hasConfirmed = checkedRows.some((r) => r.ynConfirm === "Y");

    if (hasConfirmed) {
      showAlert("완료 상태인 자료는 삭제할 수 없습니다.");
      return;
    }

    if (searchParams?.rowQrNum > 2) {
      showAlert("QR ROW는 2까지 가능합니다..");
      return;
    }

    try {
      const res = await dispatch(
        exportRndArticleReport({
          ...searchParams,
          seqArticle: "",
          seqArticleList: seqArticleList,
          cdCompany: user?.companyId || "1000",
          rowQrNum: searchParams?.rowQrNum || 0,
          docType: "pdf",
        })
      ).unwrap();

      const blobUrl = URL.createObjectURL(new Blob([res.data], {type: "application/pdf"}));

      setReportPayload({
        blobUrl,
        params: {
          docType: "pdf",
          reportType: "rndArticleReportGenerator",
          request: {
            ...searchParams,
            seqArticle: seqArticleList,
            cdCompany: user?.companyId || "1000",
            rowQrNum: searchParams?.rowQrNum || 0,
          },
        },
      });

      openReportPopup();
    } catch (err: any) {
      showAlert(typeof err === "string" ? err : "저장에 실패했습니다.");
    }
  };

  const onExcelDownloadClick = () => {
    const dataForExcel = (rndArticleAllList?.rndArticleList || []).map((r, idx) => {
      const seq = String(r.seqArticle ?? r.seqNo ?? idx);
      const file = (rndArticleAllList?.rndArticleFileList || []).find(
        (f) => String(f.seqArticle) === seq
      );
      const fileName =
        file?.imgFileName && file.imgFileName.trim() !== ""
          ? file.imgFileName
          : file?.imgFileNameOrg;
      const imgUrl = fileName
        ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
        : null;

      return {...r, seqArticle: seq, imgUrl};
    });

    const fileColumnsSource = (rndArticleAllList?.rndArticleFileList || []).map((f) => ({
      cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
      seqArticle: String(f.seqArticle ?? ""),
      seq: Number(f.seq ?? 0),
      imgFileNameOrg: f.imgFileNameOrg ?? "",
      imgFileName:
        f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
      ynFlag: f.ynFlag ?? "",
    }));
    const columns = FabricLibraryListTableColumns(fileColumnsSource);

    downloadExcelWithImages(columns, dataForExcel, token, "FabricLibrary.xlsx", 120, 70);
  };

  const columns = useMemo(
    () => FabricLibraryListTableColumns(rndArticleAllList?.rndArticleFileList),
    [rndArticleAllList?.rndArticleFileList, checkedRows]
  );

  const [columnPopupOpen, setColumnPopupOpen] = useState(false);

  const ALL_COLUMNS = useMemo(
    () => FabricLibraryListTableColumns(rndArticleAllList?.rndArticleFileList),
    [rndArticleAllList?.rndArticleFileList]
  );

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const ids: string[] = [];
    ALL_COLUMNS.forEach((g) =>
      g.columns?.forEach((c) => {
        if (c.id) ids.push(c.id);
      })
    );
    return ids;
  });

  const filteredColumns = useMemo(() => {
    return ALL_COLUMNS.map((group) => ({
      ...group,
      columns: group.columns?.filter((col) =>
        col.id ? visibleColumnIds.includes(col.id) : true
      ),
    }));
  }, [ALL_COLUMNS, visibleColumnIds, checkedRows]);

  const leafColumnsForPopup = useMemo(() => {
    const result: {id: string; Header: string}[] = [];
    ALL_COLUMNS.forEach((group) =>
      group.columns?.forEach((c) => {
        if (c.id) result.push({id: c.id, Header: c.Header});
      })
    );
    return result;
  }, [ALL_COLUMNS]);

  const resetRegisterState = () => {
    clearRegisterInitTimer();
    isRegisterInitializing.current = false;
    setRegisterBaseline("");

    setIsSaveStatus(false);
    setRndArticleAllList(null);
    setSelectedRow(null);
    setCheckedRows([]);
    setArticleList([]);
    setYarnList([]);
    setProcessList([]);
    setCompositionList([]);
    setFileList([]);
    setStyleList([]);
    setQueuedFiles([]);
  };

  return (
    <>
      <RndPageTitleBar
        pageNm={"RND"}
        pageUrl={"/fabric/library"}
        breadCrumbItems={[
          {label: "FABRIC", path: "/fabric/library"},
          {
            label: isFabricLibraryStatus ? "FABRIC LIST" : "FABRIC REGISTER",
            path: "/fabric/library",
            active: true,
          },
        ]}
        isFabricLibraryStatus={isFabricLibraryStatus}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={onNewButtonClick}
        onSaveButtonClick={onSaveButtonClick}
        onDeleteButtonClick={onDeleteButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={onPrintButtonClick}
      />

      <div className="d-flex mb-1">
        <Button
          variant={!isFabricLibraryStatus ? "primary" : "outline-primary"}
          className={`sales-activity-button ${!isFabricLibraryStatus ? "active-button" : ""}`}
          onClick={() => {
            if (!isFabricLibraryStatus) return;
            onNewButtonClick();
          }}
        >
          FABRIC REGISTER
        </Button>

        <Button
          variant={isFabricLibraryStatus ? "primary" : "outline-primary"}
          className={`sales-activity-button ${isFabricLibraryStatus ? "active-button" : ""}`}
          onClick={() => {
            if (isFabricLibraryStatus) return;

            if (!isRegisterDirty) {
              resetRegisterState();
              setIsFabricLibraryStatus(true);
              return;
            }

            confirmAction(
              "FABRIC LIST로 이동하면 입력된 값이 초기화됩니다.<br>이동하시겠습니까?",
              () => {
                resetRegisterState();
                setIsFabricLibraryStatus(true);
              }
            );
          }}
        >
          FABRIC LIST
        </Button>

        {(!isFabricLibraryStatus || checkedRows.length > 0) && (
          <Row className="form-grid ms-auto">
            <Col md={12} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row" style={{marginBottom: "0px"}}>
                <label style={{fontSize: "12px"}}>QR SPACE ROW</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="rowQrNum"
                    value={searchParams.rowQrNum || ""}
                    className="form-control text-center fg-control"
                    style={{width: "50px"}}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        rowQrNum: Number(e.target.value),
                      }))
                    }
                  >
                    <option value=""></option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  <IconComponent className={`mdi mdi-chevron-down icon-chevron`} />
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>

      {isFabricLibraryStatus ? (
        <>
          <SearchFabricLibrary
            refs={refs}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onSearchButtonClick={onSearchButtonClick}
          />
          <Card className="mt-n4">
            <Card.Body style={{minHeight: "calc(65vh - 51px)"}}>
              <Button
                className={"sales-activity-button"}
                size="sm"
                variant="outline-primary"
                onClick={() => setColumnPopupOpen(true)}
              >
                COLUMNS
              </Button>
              <Row className="align-items-stretch d-flex flex-wrap mt-n2">
                <Col xs={12} className="d-flex flex-column">
                  <div className="card flex-grow-1 card-gray-border">
                    <div className="eis-table-container" style={{height: "calc(-98px + 75vh)"}}>
                      <PisVirtualTable
                        columns={filteredColumns}
                        data={rndArticleAllList?.rndArticleList || []}
                        onRowDoubleClick={onRowDoubleClick}
                        onRowClick={(row: any) => setSelectedRow(row)}
                        onCheckboxChange={handleCheckboxChange}
                        checkedRows={checkedRows}
                        selectedRow={selectedRow}
                        theadClass="table-custom-rnd-light text-center font-12"
                        tableClass="table-custom-rnd-background text-center font-12"
                        isSelectable={true}
                        isSortable={false}
                        isOnlySelected={true}
                        virtualize={true}
                        barHeightStyle={"calc(-100px + 65vh)"}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      ) : (
        <FabricLibraryRegister
          articleList={articleList}
          setArticleList={setArticleList}
          yarnList={yarnList}
          setYarnList={setYarnList}
          processList={processList}
          setProcessList={setProcessList}
          compositionList={compositionList}
          setCompositionList={setCompositionList}
          fileList={fileList}
          setFileList={setFileList}
          styleList={styleList}
          setStyleList={setStyleList}
          onFileUpload={(files: File[]) => {
            setQueuedFiles((prev) => [...prev, ...files]);
          }}
          onFileRemove={(fileName: string) => {
            setQueuedFiles((prev) => prev.filter((f) => f.name !== fileName));
            setFileList((prev) =>
              prev.filter((x) => x.imgFileNameOrg !== fileName && x.imgFileName !== fileName)
            );
          }}
        />
      )}

      <ColumnSelectPopup
        open={columnPopupOpen}
        onClose={() => setColumnPopupOpen(false)}
        columns={leafColumnsForPopup}
        value={visibleColumnIds}
        onChange={setVisibleColumnIds}
      />
    </>
  );
};

export default FabricLibrary;
