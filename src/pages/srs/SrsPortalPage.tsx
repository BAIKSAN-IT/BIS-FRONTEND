import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import Swal from "sweetalert2";
import { CommonPisCodeDetailRes, getCommonCodeDetailList } from "@redux/common/commonSlice";
import {
  clearSrsDetail,
  downloadSrsFile,
  fetchSrsBoardFileList,
  fetchSrsDeptList,
  fetchSrsDeptRequesters,
  fetchSrsFaqList,
  fetchSrsNoticeList,
  fetchSrsRequestDetail,
  fetchSrsRequestList,
  saveSrsFaq,
  saveSrsBoardFiles,
  saveSrsNotice,
  saveSrsRequest,
  saveSrsService,
  previewSrsFile,
  SrsDepartmentRow,
  SrsBoardFileItem,
  SrsDeptRes,
  SrsFilterState,
  SrsMetricGroup,
  SrsRequestDetailRes,
  SrsRequestFileRes,
  SrsRequestListReq,
  SrsRequestListRes,
  SrsRequestRow,
  SaveSrsRequestPayload,
  SrsStatisticsSummary,
  SrsTabId,
  uploadSrsFile,
} from "@redux/srs/srsSlice";
import "@assets/scss/SrsStyle.css";
import SrsDeptStatusPanel from "./department/SrsDeptStatusPanel";
import SrsFaqBoard, { SrsFaqSubmitValue } from "./faq/SrsFaqBoard";
import SrsFilterForm from "./service/SrsFilterForm";
import SrsHeader from "./components/SrsHeader";
import SrsNoticePanel, { SrsNoticeSubmitValue } from "./notice/SrsNoticePanel";
import SrsRequestDetailDialog from "./service/SrsRequestDetailDialog";
import SrsRequestModal from "./service/SrsRequestModal";
import SrsSidebarPanel from "./components/SrsSidebarPanel";
import SrsStatisticsPanel from "./statistics/SrsStatisticsPanel";
import SrsWorkTable from "./service/SrsWorkTable";

type Option = {
  label: string;
  value: string;
};

const SrsPortalPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.Auth.user);
  const {
    requestList,
    requestDetail,
    noticeList,
    faqList,
    boardFileList,
    listLoading,
    detailLoading,
    boardLoading,
    boardFileLoading,
    requestSaving,
    serviceSaving,
    noticeSaving,
    faqSaving,
    boardFileSaving,
    uploadLoading,
    uploadProgress,
    error,
  } = useSelector((state: RootState) => state.Srs);

  const [activeTab, setActiveTab] = useState<SrsTabId>("service");
  const [filters, setFilters] = useState<SrsFilterState>(() => createInitialFilters());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<SrsRequestRow | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalMode, setRequestModalMode] = useState<"create" | "edit">("create");
  const [editingNoReq, setEditingNoReq] = useState("");
  const [localError, setLocalError] = useState("");
  const [deptFilterOptions, setDeptFilterOptions] = useState<Array<{ label: string; value: string }>>([{ label: "전체", value: "" }]);
  const [deptEmployeeOptions, setDeptEmployeeOptions] = useState<Array<{ label: string; value: string }>>([{ label: "전체", value: "" }]);
  const [serviceProcessorOptions, setServiceProcessorOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [serviceProcessorLoading, setServiceProcessorLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Option[]>([{ label: "전체", value: "" }]);
  const [requestKindOptions, setRequestKindOptions] = useState<Option[]>([{ label: "전체", value: "" }]);
  const [requestDetailOptions, setRequestDetailOptions] = useState<Option[]>([{ label: "전체", value: "" }]);
  const [requestTypeOptions, setRequestTypeOptions] = useState<Option[]>([{ label: "전체", value: "" }]);
  const [deadlineOptions, setDeadlineOptions] = useState<Option[]>([{ label: "전체", value: "" }]);
  const [requestDetailLabelMap, setRequestDetailLabelMap] = useState<Record<string, string>>({});

  const authUser = (user || {}) as Record<string, any>;
  const companyId = user?.companyId || "1000";
  const loginEmpNo = authUser.noEmp || authUser.userId || authUser.loginId || "";
  const deptCode = authUser.deptId || authUser.cdDept || "";
  const deptName = user?.deptNm || "미확인 부서";
  const requesterName = user?.userNm || user?.loginId || user?.userId || "사용자";
  const isSrsAdmin = deptCode === "115103040";
  const optionLabelMaps = useMemo(
    () => ({
      status: toOptionMap(statusOptions),
      category1: toOptionMap(requestKindOptions),
      category2: toOptionMap(requestDetailOptions),
      category3: toOptionMap(requestTypeOptions),
      deadline: toOptionMap(deadlineOptions),
    }),
    [deadlineOptions, requestDetailOptions, requestKindOptions, requestTypeOptions, statusOptions]
  );
  const rows = useMemo(() => requestList.map((item) => mapRow(item, optionLabelMaps, requestDetailLabelMap)), [optionLabelMaps, requestDetailLabelMap, requestList]);
  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedId) || null, [rows, selectedId]);
  const editingRequestInfo = useMemo(() => {
    if (!requestDetail?.requestInfo) return null;
    return requestDetail.requestInfo.noReq === editingNoReq ? requestDetail.requestInfo : null;
  }, [editingNoReq, requestDetail]);
  const editingRequestFiles = useMemo(() => {
    if (!editingRequestInfo) return [];
    return requestDetail?.requestFileList || [];
  }, [editingRequestInfo, requestDetail]);

  useEffect(() => {
    if (!loginEmpNo) return;
    void handleSearch();
  }, [loginEmpNo]);

  useEffect(() => {
    if (!loginEmpNo) return;
    const includeHidden = isSrsAdmin ? "Y" : "N";
    void dispatch(fetchSrsNoticeList({ cdCompany: companyId, includeHidden }));
    void dispatch(fetchSrsFaqList({ cdCompany: companyId, includeHidden }));
  }, [companyId, dispatch, isSrsAdmin, loginEmpNo]);

  useEffect(() => {
    if (!loginEmpNo) return;

    const loadDeptFilters = async () => {
      try {
        const depts = await dispatch(fetchSrsDeptList({ cdCompany: companyId })).unwrap();
        const mapped = (depts || [])
          .filter((item: SrsDeptRes) => item.deptId && item.deptNm)
          .map((item: SrsDeptRes) => ({ label: String(item.deptNm), value: String(item.deptId) }));
        const unique = Array.from(new Map(mapped.map((item) => [item.value, item])).values());
        setDeptFilterOptions([{ label: "전체", value: "" }, ...unique]);
      } catch {
        setDeptFilterOptions([{ label: "전체", value: "" }]);
      }
    };

    void loadDeptFilters();
  }, [companyId, dispatch, loginEmpNo]);

  useEffect(() => {
    if (!loginEmpNo) return;

    const loadCommonCodeOptions = async () => {
      const [statusList, kindList, typeList, deadlineList] = await Promise.all([
        fetchCommonCodeOptions(dispatch, companyId, "SP0006"),
        fetchCommonCodeOptions(dispatch, companyId, "SP0007"),
        fetchCommonCodeOptions(dispatch, companyId, "SP0009"),
        fetchCommonCodeOptions(dispatch, companyId, "SP0010"),
      ]);

      setStatusOptions([{ label: "전체", value: "" }, ...statusList]);
      setRequestKindOptions([{ label: "전체", value: "" }, ...kindList]);
      setRequestTypeOptions([{ label: "전체", value: "" }, ...typeList]);
      setDeadlineOptions([{ label: "전체", value: "" }, ...deadlineList]);

      const detailEntries = await Promise.all(
        kindList.map(async (item) => {
          const detailList = await fetchCommonCodeOptions(dispatch, companyId, "SP0008", item.value);
          return detailList.map((detail) => ({
            key: `${item.value}::${detail.value}`,
            label: detail.label,
          }));
        })
      );

      const nextDetailMap = detailEntries.flat().reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.label;
        return acc;
      }, {});
      setRequestDetailLabelMap(nextDetailMap);
    };

    void loadCommonCodeOptions();
  }, [companyId, dispatch, loginEmpNo]);

  useEffect(() => {
    const loadDetailCodes = async () => {
      if (!filters.category1) {
        setRequestDetailOptions([{ label: "전체", value: "" }]);
        if (filters.category2) {
          setFilters((prev) => ({ ...prev, category2: "" }));
        }
        return;
      }

      const detailList = await fetchCommonCodeOptions(dispatch, companyId, "SP0008", filters.category1);
      const nextOptions = [{ label: "전체", value: "" }, ...detailList];
      setRequestDetailOptions(nextOptions);

      if (filters.category2 && !nextOptions.some((item) => item.value === filters.category2)) {
        setFilters((prev) => ({ ...prev, category2: "" }));
      }
    };

    void loadDetailCodes();
  }, [companyId, dispatch, filters.category1]);

  const handleChangeFilter = (name: keyof SrsFilterState, value: string | boolean) => {
    setFilters((prev) => {
      if (name === "reqDeptCd") {
        return { ...prev, reqDeptCd: String(value), reqEmpNo: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  useEffect(() => {
    const loadDeptUsers = async () => {
      if (!filters.reqDeptCd) {
        setDeptEmployeeOptions([{ label: "전체", value: "" }]);
        return;
      }

      try {
        const users = await dispatch(fetchSrsDeptRequesters({ cdCompany: companyId, deptId: filters.reqDeptCd })).unwrap();
        const mapped = users
          .filter((item) => item.userId && item.userNm)
          .map((item) => ({ label: String(item.userNm), value: String(item.userId) }));

        const unique = Array.from(new Map(mapped.map((item) => [item.value, item])).values());
        setDeptEmployeeOptions([{ label: "전체", value: "" }, ...unique]);
      } catch {
        setDeptEmployeeOptions([{ label: "전체", value: "" }]);
      }
    };

    void loadDeptUsers();
  }, [companyId, dispatch, filters.reqDeptCd]);

  useEffect(() => {
    const requestInfo = requestDetail?.requestInfo;
    if (!requestInfo?.resDeptCd || !detailRow) {
      setServiceProcessorOptions([]);
      setServiceProcessorLoading(false);
      return;
    }

    const loadProcessors = async () => {
      setServiceProcessorLoading(true);
      try {
        const users = await dispatch(
          fetchSrsDeptRequesters({
            cdCompany: companyId,
            deptId: requestInfo.resDeptCd,
          })
        ).unwrap();

        const mapped = users
          .filter((item) => item.userId && item.userNm)
          .map((item) => ({ label: String(item.userNm), value: String(item.userId) }));

        const unique = Array.from(new Map(mapped.map((item) => [item.value, item])).values());

        if (requestInfo.resEmpNo && !unique.some((item) => item.value === requestInfo.resEmpNo)) {
          unique.unshift({
            value: requestInfo.resEmpNo,
            label: requestInfo.resEmpNm || requestInfo.resEmpNo,
          });
        }

        setServiceProcessorOptions(unique);
      } catch {
        if (requestInfo.resEmpNo) {
          setServiceProcessorOptions([
            {
              value: requestInfo.resEmpNo,
              label: requestInfo.resEmpNm || requestInfo.resEmpNo,
            },
          ]);
        } else {
          setServiceProcessorOptions([]);
        }
      } finally {
        setServiceProcessorLoading(false);
      }
    };

    void loadProcessors();
  }, [companyId, detailRow, dispatch, requestDetail?.requestInfo]);

  const handleSearch = async () => {
    setLocalError("");

    try {
      const payload: SrsRequestListReq = {
        cdCompany: companyId,
        loginEmpNo,
        loginDeptCd: deptCode,
        reqDeptCd: filters.reqDeptCd,
        reqEmpNo: filters.reqEmpNo,
        searchScope: filters.searchScope,
        cdStatus: filters.cdStatus,
        dtReqFrom: toCompactDate(filters.dtReqFrom),
        dtReqTo: toCompactDate(filters.dtReqTo),
        category1: filters.category1,
        category2: filters.category2,
        category3: filters.category3,
        keyword: filters.keyword.trim(),
        includeAllRequests: filters.includeAllRequests ? "Y" : "N",
      };

      const result = await dispatch(fetchSrsRequestList(payload)).unwrap();
      const nextRows = result.map((item) => mapRow(item, optionLabelMaps, requestDetailLabelMap));
      if (selectedId && !nextRows.some((row) => row.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (errorValue) {
      setLocalError(String(errorValue || "SRS 요청 목록을 불러오지 못했습니다."));
      setSelectedId(null);
    }
  };

  const loadDetail = async (row: SrsRequestRow) => {
    try {
      return await dispatch(fetchSrsRequestDetail({ cdCompany: companyId, noReq: row.noReq })).unwrap();
    } catch (errorValue) {
      setLocalError(String(errorValue || "상세 정보를 불러오지 못했습니다."));
      return null;
    }
  };

  const handleOpenDetail = async (row: SrsRequestRow) => {
    setSelectedId(row.id);
    setDetailRow(row);
    setLocalError("");
    await loadDetail(row);
  };

  const handleOpenRequestModal = async () => {
    setLocalError("");

    if (!selectedRow) {
      dispatch(clearSrsDetail());
      setEditingNoReq("");
      setRequestModalMode("create");
      setRequestModalOpen(true);
      return;
    }

    const detail = await loadDetail(selectedRow);
    if (!detail?.requestInfo) {
      return;
    }

    setSelectedId(selectedRow.id);
    setEditingNoReq(selectedRow.noReq);
    setRequestModalMode("edit");
    setRequestModalOpen(true);
  };

  const handlePreviewFile = async (filePath: string) => {
    if (!filePath) {
      setLocalError("파일 미리보기에 필요한 경로 정보가 없습니다.");
      return;
    }

    try {
      const blob = await dispatch(previewSrsFile({ filePath, bust: true })).unwrap();
      if (!blob) {
        setLocalError("미리보기 파일을 다시 불러와 주세요.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const previewWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!previewWindow) {
        setLocalError("팝업이 차단되어 미리보기를 열 수 없습니다.");
        window.URL.revokeObjectURL(url);
        return;
      }

      previewWindow.location.href = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (errorValue) {
      setLocalError(String(errorValue || "파일 미리보기에 실패했습니다."));
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    if (!filePath) {
      setLocalError("다운로드할 파일 정보가 없습니다.");
      return;
    }

    try {
      const blob = await dispatch(downloadSrsFile({ filePath })).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = displayFileName(filePath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (errorValue) {
      setLocalError(String(errorValue || "파일 다운로드에 실패했습니다."));
    }
  };

  const requestPreviewBlob = async ({
    fileName,
    bust,
  }: {
    seqArticle: string;
    fileName: string;
    bust?: boolean;
  }): Promise<Blob | null> => {
    if (!fileName) return null;
    try {
      return await dispatch(previewSrsFile({ filePath: fileName, bust })).unwrap();
    } catch {
      return null;
    }
  };

  const requestDownloadBlob = async ({
    fileName,
  }: {
    seqArticle: string;
    fileName: string;
  }): Promise<Blob | null> => {
    if (!fileName) return null;
    try {
      return await dispatch(downloadSrsFile({ filePath: fileName })).unwrap();
    } catch {
      return null;
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const findRecentRequestNoReq = async (form: {
    reqDeptCd: string;
    subject: string;
    category1: string;
    category2: string;
    category3: string;
  }) => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await dispatch(
        fetchSrsRequestList({
          cdCompany: companyId,
          loginEmpNo,
          loginDeptCd: deptCode,
          reqDeptCd: form.reqDeptCd || "",
          reqEmpNo: "",
          searchScope: "LOGIN",
          cdStatus: "",
          dtReqFrom: monthStartCompact(),
          dtReqTo: compactToday(),
          category1: form.category1 || "",
          category2: form.category2 || "",
          category3: form.category3 || "",
          keyword: form.subject || "",
          includeAllRequests: "N",
        })
      ).unwrap();

      const matched = [...(result || [])]
        .filter((item) => {
          const sameSubject = (item.subject || "") === (form.subject || "");
          const sameDept = (item.reqDeptCd || "") === (form.reqDeptCd || "");
          const sameRequester = (item.reqEmpNo || "") === loginEmpNo;
          const sameCategory =
            (item.category1 || "") === (form.category1 || "") &&
            (item.category2 || "") === (form.category2 || "") &&
            (item.category3 || "") === (form.category3 || "");
          return sameSubject && sameDept && sameRequester && sameCategory;
        })
        .sort((left, right) => String(right.dtInsert || right.regDate || "").localeCompare(String(left.dtInsert || left.regDate || "")));

      if (matched[0]?.noReq) {
        return matched[0].noReq;
      }

      await sleep(500);
    }

    return "";
  };

  const handleSaveRequest = async (form: {
    noReq: string;
    reqDeptCd: string;
    reqDeptNm: string;
    reqEmpNo: string;
    reqEmpNm: string;
    resEmpNo: string;
    resEmpNm: string;
    subject: string;
    category1: string;
    category2: string;
    category3: string;
    urgency: string;
    dtWrk: string;
    content: string;
    cdStatus: string;
    existingFiles: SrsRequestFileRes[];
    deletedSeqFiles: number[];
    newFiles: File[];
  }) => {
    setLocalError("");

    try {
      if (!(await validateUploadFiles(form.newFiles))) return;
      let uploadedFiles: Array<{ filePath: string; storedFileName: string }> = [];
      const now = nowCompactDateTime();
      const requestInfo = editingRequestInfo;
      const isCreate = !(form.noReq || "").trim();

      if (form.newFiles.length > 0) {
        uploadedFiles = await dispatch(
          uploadSrsFile({
            deptName,
            userName: requesterName,
            baseDate: compactToday(),
            files: form.newFiles,
          })
        ).unwrap();
      }

      let resolvedNoReq = form.noReq || "";

      if (isCreate) {
        await dispatch(
          saveSrsRequest({
            srsRequestList: [
              {
                cdCompany: companyId,
                noReq: "",
                reqDeptCd: form.reqDeptCd || requestInfo?.reqDeptCd || deptCode,
                reqEmpNo: form.reqEmpNo || requestInfo?.reqEmpNo || loginEmpNo,
                resDeptCd: form.reqDeptCd || requestInfo?.resDeptCd || deptCode,
                resEmpNo: "",
                category1: form.category1,
                category2: form.category2,
                category3: form.category3,
                subject: form.subject,
                content: form.content,
                cdDay: form.urgency,
                cdStatus: form.cdStatus || requestInfo?.cdStatus || "00",
                dtWrk: toCompactDate(form.dtWrk),
                dtAccept: requestInfo?.dtAccept || "",
                dtEnd: requestInfo?.dtEnd || "",
                score: requestInfo?.score || 0,
                noReqPrev: requestInfo?.noReqPrev || "",
                subjectPrev: requestInfo?.subjectPrev || requestInfo?.subject || "",
                dtInsert: now,
                idInsert: loginEmpNo,
              },
            ],
            srsRequestFileList: [],
          })
        ).unwrap();

        resolvedNoReq = await findRecentRequestNoReq({
          reqDeptCd: form.reqDeptCd || requestInfo?.reqDeptCd || deptCode,
          subject: form.subject,
          category1: form.category1,
          category2: form.category2,
          category3: form.category3,
        });

        if (!resolvedNoReq) {
          throw new Error("요청은 저장되었지만 요청번호를 확인하지 못했습니다. 새로고침 후 다시 확인해주세요.");
        }
      }

      if (!isCreate || uploadedFiles.length > 0 || form.deletedSeqFiles.length > 0) {
        await dispatch(
          saveSrsRequest({
            srsRequestList: isCreate
              ? []
              : [
                  {
                    cdCompany: companyId,
                    noReq: resolvedNoReq,
                    reqDeptCd: form.reqDeptCd || requestInfo?.reqDeptCd || deptCode,
                    reqEmpNo: form.reqEmpNo || requestInfo?.reqEmpNo || loginEmpNo,
                    resDeptCd: form.reqDeptCd || requestInfo?.resDeptCd || deptCode,
                    resEmpNo: form.resEmpNo || requestInfo?.resEmpNo || "",
                    category1: form.category1,
                    category2: form.category2,
                    category3: form.category3,
                    subject: form.subject,
                    content: form.content,
                    cdDay: form.urgency,
                    cdStatus: form.cdStatus || requestInfo?.cdStatus || "00",
                    dtWrk: toCompactDate(form.dtWrk),
                    dtAccept: requestInfo?.dtAccept || "",
                    dtEnd: requestInfo?.dtEnd || "",
                    score: requestInfo?.score || 0,
                    noReqPrev: requestInfo?.noReqPrev || "",
                    subjectPrev: requestInfo?.subjectPrev || requestInfo?.subject || "",
                    dtInsert: now,
                    idInsert: loginEmpNo,
                  },
                ],
            srsRequestFileList: [
              ...form.existingFiles.map((file) => ({
                cdCompany: companyId,
                noReq: resolvedNoReq,
                seqFile: file.seqFile,
                ynDel: form.deletedSeqFiles.includes(file.seqFile) ? "Y" : "N",
                nmFile: file.nmFile,
                dtInsert: now,
                idInsert: loginEmpNo,
              })),
              ...uploadedFiles.map((file) => ({
                cdCompany: companyId,
                noReq: resolvedNoReq,
                seqFile: 0,
                ynDel: "N",
                nmFile: file.filePath || file.storedFileName,
                dtInsert: now,
                idInsert: loginEmpNo,
              })),
            ],
          })
        ).unwrap();
      }

      setRequestModalOpen(false);
      setEditingNoReq("");
      await handleSearch();
    } catch (errorValue) {
      setLocalError(String(errorValue || "관리자에게 문의 해주세요."));
    }
  };

  const handleRateSatisfaction = async (row: SrsRequestRow, score: number) => {
    if (!row?.noReq) {
      setLocalError("평가할 요청 번호가 없습니다.");
      return;
    }

    try {
      const detail = await dispatch(fetchSrsRequestDetail({ cdCompany: companyId, noReq: row.noReq })).unwrap();
      const info = detail?.requestInfo;
      if (!info) {
        setLocalError("평가 대상 상세 정보를 찾을 수 없습니다.");
        return;
      }

      const now = nowCompactDateTime();
      const payload: SaveSrsRequestPayload = {
        srsRequestList: [
          {
            cdCompany: info.cdCompany || companyId,
            noReq: info.noReq || row.noReq,
            reqDeptCd: info.reqDeptCd || row.reqDeptCd || deptCode,
            reqEmpNo: info.reqEmpNo || row.reqEmpNo || loginEmpNo,
            resDeptCd: info.resDeptCd || "",
            resEmpNo: info.resEmpNo || "",
            category1: info.category1 || "",
            category2: info.category2 || "",
            category3: info.category3 || "",
            subject: info.subject || row.content || "",
            content: info.content || row.requestContent || row.content || "",
            cdDay: info.cdDay || "15",
            cdStatus: info.cdStatus || row.statusCode || "20",
            dtWrk: info.dtWrk || toCompactDate(row.regDate || "") || compactToday(),
            dtAccept: info.dtAccept || "",
            dtEnd: info.dtEnd || toCompactDate(row.doneDate || ""),
            score,
            noReqPrev: info.noReqPrev || "",
            subjectPrev: info.subjectPrev || "",
            dtInsert: now,
            idInsert: loginEmpNo,
          },
        ],
        srsRequestFileList: [],
      };

      await dispatch(saveSrsRequest(payload)).unwrap();
      await handleSearch();
      if (selectedRow?.noReq === row.noReq) {
        await loadDetail(selectedRow);
      }
    } catch (errorValue) {
      setLocalError(String(errorValue || "만족도 평가 저장에 실패했습니다."));
    }
  };

  const handleSaveService = async (form: {
    content: string;
    statusCode: string;
    doneDate: string;
    files: File[];
    processorEmpNo: string;
  }) => {
    if (!requestDetail?.requestInfo) return;

    setLocalError("");

    try {
      if (!(await validateUploadFiles(form.files))) return;
      let uploadedFiles: Array<{ filePath: string; storedFileName: string }> = [];

      if (form.files.length > 0) {
        uploadedFiles = await dispatch(
          uploadSrsFile({
            deptName,
            userName: requesterName,
            baseDate: compactToday(),
            files: form.files,
          })
        ).unwrap();
      }

      const requestInfo = requestDetail.requestInfo;
      const now = nowCompactDateTime();

      await dispatch(
        saveSrsService({
          srsServiceList: [
            {
              cdCompany: companyId,
              noReq: requestInfo.noReq,
              noService: "",
              resDeptCd: requestInfo.resDeptCd || deptCode,
              resEmpNo: form.processorEmpNo || requestInfo.resEmpNo || loginEmpNo,
              category1: requestInfo.category1 || "",
              category2: requestInfo.category2 || "",
              category3: requestInfo.category3 || "",
              content: form.content,
              cdDay: requestInfo.cdDay || "15",
              cdStatus: form.statusCode,
              dtAccept: requestInfo.dtAccept || compactToday(),
              dtEnd: toCompactDate(form.doneDate),
              dtInsert: now,
              idInsert: loginEmpNo,
            },
          ],
          srsServiceFileList: uploadedFiles.map((file) => ({
            cdCompany: companyId,
            noReq: requestInfo.noReq,
            noService: "",
            seqFile: 0,
            ynDel: "N",
            nmFile: file.filePath || file.storedFileName,
            dtInsert: now,
            idInsert: loginEmpNo,
          })),
        })
      ).unwrap();

      if (detailRow) {
        await handleOpenDetail(detailRow);
      }
      await handleSearch();
    } catch (errorValue) {
      setLocalError(String(errorValue || "서비스 결과 저장에 실패했습니다."));
    }
  };

  const handleLoadNoticeFiles = async (noNotice: string) => {
    if (!noNotice) return [];
    return await dispatch(fetchSrsBoardFileList({ cdCompany: companyId, boardType: "NOTICE", noBoard: noNotice })).unwrap();
  };

  const handleSaveNotice = async (form: SrsNoticeSubmitValue) => {
    if (!isSrsAdmin) {
      setLocalError("공지사항 등록 및 수정 권한이 없습니다.");
      return;
    }

    setLocalError("");
    try {
      if (!(await validateUploadFiles(form.newFiles))) return;
      let uploadedFiles: Array<{ filePath: string; storedFileName: string }> = [];
      if (form.newFiles.length > 0) {
        uploadedFiles = await dispatch(
          uploadSrsFile({
            deptName,
            userName: requesterName,
            baseDate: compactToday(),
            files: form.newFiles,
          })
        ).unwrap();
      }

      const noNotice = await dispatch(
        saveSrsNotice({
          ...form,
          cdCompany: companyId,
          loginDeptCd: deptCode,
          loginEmpNo,
        })
      ).unwrap();

      const fileList = [
        ...form.existingFiles.map((file: SrsBoardFileItem) => ({
          seqFile: file.seqFile,
          ynDel: form.deletedSeqFiles.includes(file.seqFile) ? ("Y" as const) : ("N" as const),
          nmFile: file.nmFile,
        })),
        ...uploadedFiles.map((file) => ({
          seqFile: 0,
          ynDel: "N" as const,
          nmFile: file.filePath || file.storedFileName,
        })),
      ];

      if (fileList.length > 0) {
        await dispatch(
          saveSrsBoardFiles({
            cdCompany: companyId,
            boardType: "NOTICE",
            noBoard: noNotice || form.noNotice,
            loginDeptCd: deptCode,
            loginEmpNo,
            fileList,
          })
        ).unwrap();
      }

      await dispatch(fetchSrsNoticeList({ cdCompany: companyId, includeHidden: "Y" })).unwrap();
      if (noNotice || form.noNotice) {
        await handleLoadNoticeFiles(noNotice || form.noNotice);
      }
    } catch (errorValue) {
      setLocalError(String(errorValue || "공지사항 저장에 실패했습니다."));
      throw errorValue;
    }
  };

  const handleSaveFaq = async (form: SrsFaqSubmitValue) => {
    if (!isSrsAdmin) {
      setLocalError("FAQ 등록 및 수정 권한이 없습니다.");
      return;
    }

    setLocalError("");
    try {
      await dispatch(
        saveSrsFaq({
          ...form,
          cdCompany: companyId,
          loginDeptCd: deptCode,
          loginEmpNo,
        })
      ).unwrap();
      await dispatch(fetchSrsFaqList({ cdCompany: companyId, includeHidden: "Y" })).unwrap();
    } catch (errorValue) {
      setLocalError(String(errorValue || "관리자에게 문의해주세요."));
      throw errorValue;
    }
  };

  const statistics = buildStatistics(rows, loginEmpNo);
  const metricGroups = buildMetricGroups(rows, loginEmpNo);
  const departmentOptions = deptFilterOptions;
  const employeeOptions = deptEmployeeOptions;
  const pageError = localError || error || "";
  return (
    <div className="srs-page">
      <SrsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="srs-shell">
        <SrsSidebarPanel
          groups={metricGroups}
          processedCount={String(statistics.done)}
          totalCount={String(statistics.total)}
          requestedAverage={formatAverageValue(statistics.requestedAvgScore)}
          receivedAverage={formatAverageValue(statistics.receivedAvgScore)}
        />

        <main className="srs-main" aria-label="SRS 작업공간">
          {pageError ? <div className="srs-alert-error">{pageError}</div> : null}

          {activeTab === "service" ? (
            <>
              <SrsFilterForm
                filters={filters}
                departmentOptions={departmentOptions}
                employeeOptions={employeeOptions}
                statusOptions={statusOptions}
                category1Options={requestKindOptions}
                category2Options={requestDetailOptions}
                category3Options={requestTypeOptions}
                onChange={handleChangeFilter}
                onSearch={() => void handleSearch()}
                loading={listLoading}
              />
              <SrsWorkTable
                rows={rows}
                selectedId={selectedId}
                onSelect={(row) => setSelectedId((current) => (current === row.id ? null : row.id))}
                onOpenDetail={(row) => void handleOpenDetail(row)}
                onOpenRequest={() => void handleOpenRequestModal()}
                loginEmpNo={loginEmpNo}
                onRateSatisfaction={handleRateSatisfaction}
                ratingSaving={requestSaving}
                loading={listLoading}
              />
            </>
          ) : null}

          {activeTab === "notice" ? (
            <SrsNoticePanel
              rows={noticeList}
              files={boardFileList}
              isAdmin={isSrsAdmin}
              loading={boardLoading}
              saving={noticeSaving}
              fileLoading={boardFileLoading}
              fileSaving={boardFileSaving || uploadLoading}
              onLoadFiles={handleLoadNoticeFiles}
              requestPreview={requestPreviewBlob}
              requestDownload={requestDownloadBlob}
              onPreviewFile={handlePreviewFile}
              onDownloadFile={(filePath) => void handleDownloadFile(filePath)}
              onSave={handleSaveNotice}
            />
          ) : null}
          {activeTab === "faq" ? (
            <SrsFaqBoard
              rows={faqList}
              isAdmin={isSrsAdmin}
              loading={boardLoading}
              saving={faqSaving}
              onSave={handleSaveFaq}
            />
          ) : null}
          {activeTab === "deptStatus" ? <SrsDeptStatusPanel rows={statistics.departmentRows} /> : null}
          {activeTab === "statistics" ? <SrsStatisticsPanel statistics={statistics} /> : null}
        </main>
      </div>

      <SrsRequestModal
        open={requestModalOpen}
        mode={requestModalMode}
        companyId={companyId}
        defaultManagerName={requesterName}
        defaultManagerEmpNo={loginEmpNo}
        initialRequest={requestModalMode === "edit" ? editingRequestInfo : null}
        existingFiles={requestModalMode === "edit" ? editingRequestFiles : []}
        saving={requestSaving}
        uploading={uploadLoading}
        uploadProgress={uploadProgress}
        onClose={() => {
          setRequestModalOpen(false);
          setEditingNoReq("");
        }}
        requestPreview={requestPreviewBlob}
        requestDownload={requestDownloadBlob}
        onDownloadFile={(filePath) => void handleDownloadFile(filePath)}
        onSubmit={handleSaveRequest}
      />

      <SrsRequestDetailDialog
        row={detailRow}
        detail={requestDetail as SrsRequestDetailRes | null}
        loading={detailLoading}
        saving={serviceSaving}
        uploading={uploadLoading}
        uploadProgress={uploadProgress}
        loginEmpNo={loginEmpNo}
        loginDeptCd={deptCode}
        processorOptions={serviceProcessorOptions}
        processorLoading={serviceProcessorLoading}
        onClose={() => {
          setDetailRow(null);
          dispatch(clearSrsDetail());
        }}
        requestPreview={requestPreviewBlob}
        requestDownload={requestDownloadBlob}
        onDownloadFile={(filePath) => void handleDownloadFile(filePath)}
        onSaveService={handleSaveService}
        statusOptions={statusOptions.filter((item) => item.value !== "")}
        resolveStatusLabel={(value) => optionLabelMaps.status[value] || value}
        resolveCategory1Label={(value) => optionLabelMaps.category1[value] || value}
        resolveCategory2Label={(parentCode, value) => requestDetailLabelMap[`${parentCode}::${value}`] || optionLabelMaps.category2[value] || value}
        resolveCategory3Label={(value) => optionLabelMaps.category3[value] || value}
        resolveDeadlineLabel={(value) => optionLabelMaps.deadline[value] || formatDeadline(value)}
      />
    </div>
  );
};

const MAX_SRS_UPLOAD_BYTES = 450 * 1024 * 1024;
const WARN_SRS_UPLOAD_BYTES = 100 * 1024 * 1024;

const validateUploadFiles = async (files: File[]) => {
  if (!files || files.length === 0) return true;

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const largestFile = files.reduce<File | null>((largest, file) => (!largest || file.size > largest.size ? file : largest), null);

  if (largestFile && largestFile.size > MAX_SRS_UPLOAD_BYTES) {
    await Swal.fire({
      icon: "warning",
      title: "파일 용량 초과",
      text: `${largestFile.name} 파일이 업로드 허용 용량을 초과했습니다. 450MB 이하 파일만 업로드할 수 있습니다.`,
      confirmButtonText: "확인",
    });
    return false;
  }

  if (totalBytes > MAX_SRS_UPLOAD_BYTES) {
    await Swal.fire({
      icon: "warning",
      title: "첨부 용량 초과",
      text: "첨부파일 총 용량이 450MB를 초과했습니다. 파일을 줄여서 다시 시도해주세요.",
      confirmButtonText: "확인",
    });
    return false;
  }

  if (largestFile && largestFile.size > WARN_SRS_UPLOAD_BYTES) {
    const { isConfirmed } = await Swal.fire({
      icon: "info",
      title: "대용량 파일 업로드",
      text: `${largestFile.name} 파일 용량이 커서 업로드에 시간이 오래 걸릴 수 있습니다. 계속 진행할까요?`,
      confirmButtonText: "계속",
      cancelButtonText: "취소",
      showCancelButton: true,
    });
    return isConfirmed;
  }

  return true;
};

const createInitialFilters = (): SrsFilterState => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDate = new Date(year, month + 1, 0).getDate();
  const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;

  return {
    reqDeptCd: "",
    reqEmpNo: "",
    searchScope: "LOGIN",
    cdStatus: "",
    dtReqFrom: firstDay,
    dtReqTo: lastDay,
    category1: "",
    category2: "",
    category3: "",
    keyword: "",
    includeAllRequests: false,
  };
};

const mapRow = (
  item: SrsRequestListRes,
  labelMaps: {
    status: Record<string, string>;
    category1: Record<string, string>;
    category2: Record<string, string>;
    category3: Record<string, string>;
    deadline: Record<string, string>;
  },
  requestDetailMap: Record<string, string>
): SrsRequestRow => {
  const rawDeadline = item.deadline || "";
  const rawCategory1 = item.category1 || item.category || "";
  const rawCategory2 = item.category2 || item.type || "";
  const rawCategory3 = item.category3 || item.detailType || "";
  const rawStatus = item.status || "";
  const isUnassignedProcessor = (!item.resEmpNo || (!item.noService && !!item.reqEmpNo && item.reqEmpNo === item.resEmpNo));
  const displayManager = isUnassignedProcessor ? "미배정" : item.manager || "미배정";

  return ({
  id: `${item.noReq}-${item.noService || "0"}`,
  noReq: item.noReq,
  noService: item.noService || "",
  reqDeptCd: item.reqDeptCd || "",
  reqEmpNo: item.reqEmpNo || "",
  resEmpNo: item.resEmpNo || "",
  regDate: formatDisplayDate(item.regDate || item.dtInsert),
  doneDate: formatDisplayDate(item.doneDate || item.dtEnd),
  dept: item.dept || "-",
  requester: item.requester || "-",
  deadline: rawDeadline ? resolveDisplayLabel("", rawDeadline, item.deadline, labelMaps.deadline[rawDeadline]) || formatDeadline(rawDeadline) : "-",
  category: resolveDisplayLabel(item.category1Nm, rawCategory1, item.category, labelMaps.category1[rawCategory1]) || "-",
  type:
    resolveDisplayLabel(
      item.category2Nm,
      rawCategory2,
      item.type,
      requestDetailMap[`${rawCategory1}::${rawCategory2}`] || labelMaps.category2[rawCategory2]
    ) || "-",
  detailType: resolveDisplayLabel(item.category3Nm, rawCategory3, item.detailType, labelMaps.category3[rawCategory3]) || "-",
  categoryCode: rawCategory1,
  typeCode: rawCategory2,
  detailTypeCode: rawCategory3,
  content: item.content || item.subject || "-",
  expectDate: formatDisplayDate(item.expectDate || item.dtAccept),
  manager: displayManager,
  status: resolveDisplayLabel(item.statusNm, rawStatus, item.status, labelMaps.status[rawStatus]) || "-",
  statusCode: rawStatus,
  satisfaction: formatSatisfaction(item.satisfaction),
  requestContent: item.requestContent || "",
  serviceContent: item.serviceContent || "",
  });
};

const formatSatisfaction = (value: string) => {
  const score = Number(value);
  return Number.isFinite(score) && score > 0 ? `${score}점` : "-";
};

const formatDeadline = (value: string) => {
  if (!value) return "-";
  return /^[0-9]+$/.test(value) ? `${value}일` : value;
};

const formatDisplayDate = (value: string) => {
  if (!value || value.length < 8) return "-";
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
};

const toCompactDate = (value: string) => value.replace(/-/g, "");

const compactToday = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
};

const monthStartCompact = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}01`;
};

const nowCompactDateTime = () => {
  const now = new Date();
  return `${compactToday()}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
};

const buildMetricGroups = (rows: SrsRequestRow[], loginEmpNo: string): SrsMetricGroup[] => {
  const total = rows.length;
  const pending = rows.filter(isWaitingRow).length;
  const progress = rows.filter(isProgressRow).length;
  const done = rows.filter(isDoneRow).length;
  const waitingScore = rows.filter((row) => isDoneRow(row) && row.satisfaction === "-").length;
  const myRows = rows.filter((row) => row.reqEmpNo === loginEmpNo || row.manager.includes(loginEmpNo));
  const deptRows = aggregateDepartmentRows(rows);

  return [
    {
      title: "전체 요청 현황",
      tone: "blue",
      items: [
        { label: "전체", value: String(total) },
        { label: "접수대기", value: String(pending), accent: pending > 0 },
        { label: "처리중", value: String(progress), accent: progress > 0 },
        { label: "처리완료", value: String(done) },
        { label: "평가대기", value: String(waitingScore), accent: waitingScore > 0 },
      ],
    },
    {
      title: "내 요청 및 처리",
      tone: "orange",
      items: [
        { label: "관련건수", value: String(myRows.length), accent: myRows.length > 0 },
        { label: "접수대기", value: String(myRows.filter(isWaitingRow).length) },
        { label: "처리중", value: String(myRows.filter(isProgressRow).length), accent: true },
        { label: "처리완료", value: String(myRows.filter(isDoneRow).length) },
      ],
    },
    {
      title: "부서별 요청 비율",
      tone: "gray",
      items: deptRows.slice(0, 6).map((row, index) => ({
        label: row.dept,
        value: `${row.total}건 (${row.rate}%)`,
        accent: index === 0,
      })),
    },
  ];
};

const buildStatistics = (rows: SrsRequestRow[], loginEmpNo: string): SrsStatisticsSummary => {
  const total = rows.length;
  const pending = rows.filter(isWaitingRow).length;
  const progress = rows.filter(isProgressRow).length;
  const done = rows.filter(isDoneRow).length;
  const scores = rows
    .map((row) => Number(row.satisfaction.replace("점", "")))
    .filter((score) => Number.isFinite(score) && score > 0);
  const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  const requestedAvgScore = calculateAverageScore(rows.filter((row) => row.reqEmpNo === loginEmpNo));
  const receivedAvgScore = calculateAverageScore(rows.filter((row) => row.resEmpNo === loginEmpNo));

  return {
    total,
    pending,
    progress,
    done,
    avgScore,
    requestedAvgScore,
    receivedAvgScore,
    departmentRows: aggregateDepartmentRows(rows),
    categoryRows: aggregateRateRows(rows.map((row) => row.category), total),
    statusRows: aggregateRateRows(rows.map((row) => row.status || "-"), total),
    monthlyRows: aggregateMonthlyRows(rows),
  };
};

const calculateAverageScore = (rows: SrsRequestRow[]) => {
  const scores = rows
    .map((row) => Number(row.satisfaction.replace("점", "")))
    .filter((score) => Number.isFinite(score) && score > 0);
  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
};

const formatAverageValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "평균 -";
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return `평균 ${text}`;
};

const isWaitingRow = (row: SrsRequestRow) => {
  const statusText = String(row.status || "").trim();
  return row.statusCode === "00" || statusText === "접수대기" || statusText === "00";
};

const isProgressRow = (row: SrsRequestRow) => {
  const statusText = String(row.status || "").trim();
  return row.statusCode === "10" || statusText === "처리중" || statusText === "10";
};

const isDoneRow = (row: SrsRequestRow) => {
  const statusText = String(row.status || "").trim();
  const hasDoneDate = !!row.doneDate && row.doneDate !== "-" && row.doneDate !== "9999.12.31";
  return row.statusCode === "20" || statusText === "처리완료" || statusText === "20" || hasDoneDate;
};

const aggregateDepartmentRows = (rows: SrsRequestRow[]): SrsDepartmentRow[] => {
  const bucket = new Map<string, SrsDepartmentRow>();
  rows.forEach((row) => {
    const current = bucket.get(row.dept) || { dept: row.dept, total: 0, waiting: 0, progress: 0, done: 0, rate: 0 };
    current.total += 1;
    if (isWaitingRow(row)) current.waiting += 1;
    if (isProgressRow(row)) current.progress += 1;
    if (isDoneRow(row)) current.done += 1;
    current.rate = current.total > 0 ? Math.round((current.done / current.total) * 100) : 0;
    bucket.set(row.dept, current);
  });

  return Array.from(bucket.values()).sort((a, b) => b.total - a.total);
};

const aggregateRateRows = (values: string[], total: number) => {
  const bucket = new Map<string, number>();
  values.forEach((value) => {
    const key = value || "기타";
    bucket.set(key, (bucket.get(key) || 0) + 1);
  });

  return Array.from(bucket.entries())
    .map(([label, count]) => ({ label, count, rate: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
};

const aggregateMonthlyRows = (rows: SrsRequestRow[]) => {
  const bucket = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.regDate !== "-" ? row.regDate.slice(0, 7) : "기타";
    bucket.set(key, (bucket.get(key) || 0) + 1);
  });

  return Array.from(bucket.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const fetchCommonCodeOptions = async (
  dispatch: AppDispatch,
  companyId: string,
  cdField: string,
  cdFlag1 = ""
): Promise<Option[]> => {
  try {
    const res: any = await dispatch(
      getCommonCodeDetailList({
        cdCompany: companyId,
        cdField,
        cdSysdef: "",
        cdFlag1,
      })
    );

    const payload = res?.payload;
    const list = payload?.status === 200 && Array.isArray(payload?.data) ? (payload.data as CommonPisCodeDetailRes[]) : [];

    return list
      .filter((item) => item.cdSysdef && item.nmSysdef)
      .map((item) => ({
        value: String(item.cdSysdef),
        label: String(item.nmSysdef),
      }));
  } catch {
    return [];
  }
};

const toOptionMap = (options: Option[]) =>
  options.reduce<Record<string, string>>((acc, item) => {
    if (item.value) {
      acc[item.value] = item.label;
    }
    return acc;
  }, {});

const fallbackStatusLabelMap: Record<string, string> = {
  "00": "접수대기",
  "10": "처리중",
  "20": "처리완료",
};

const resolveDisplayLabel = (nameValue: string, rawCode: string, fallbackValue: string, mappedLabel?: string) => {
  if (nameValue && nameValue !== rawCode) {
    return nameValue;
  }
  if (mappedLabel) {
    return mappedLabel;
  }
  if (rawCode && fallbackStatusLabelMap[rawCode]) {
    return fallbackStatusLabelMap[rawCode];
  }
  if (fallbackValue && fallbackValue !== rawCode) {
    return fallbackValue;
  }
  return rawCode || "";
};

const displayFileName = (value: string) => value.split("/").pop() || value;

export default SrsPortalPage;
