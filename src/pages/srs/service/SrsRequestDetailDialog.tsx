import React, {useEffect, useMemo, useRef, useState} from "react";
import Swal from "sweetalert2";
import {SrsRequestDetailRes, SrsRequestRow} from "@redux/srs/srsSlice";
import SrsRichTextEditor from "./SrsRichTextEditor";
import SrsFileListUploader, {SrsServerFile} from "./SrsFileListUploader";

type ProcessorOption = {
  label: string;
  value: string;
};

type StatusOption = {
  label: string;
  value: string;
};

type SrsRequestDetailDialogProps = {
  row: SrsRequestRow | null;
  detail: SrsRequestDetailRes | null;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  uploadProgress: number;
  loginEmpNo: string;
  loginDeptCd: string;
  processorOptions: ProcessorOption[];
  processorLoading: boolean;
  statusOptions: StatusOption[];
  resolveStatusLabel: (value: string) => string;
  resolveCategory1Label: (value: string) => string;
  resolveCategory2Label: (parentCode: string, value: string) => string;
  resolveCategory3Label: (value: string) => string;
  resolveDeadlineLabel: (value: string) => string;
  onClose: () => void;
  onDownloadFile: (filePath: string) => void;
  requestPreview?: (arg: { seqArticle: string; fileName: string; bust?: boolean }) => Promise<Blob | null>;
  requestDownload?: (arg: { seqArticle: string; fileName: string }) => Promise<Blob | null>;
  onSaveService: (payload: {
    content: string;
    statusCode: string;
    doneDate: string;
    files: File[];
    processorEmpNo: string;
  }) => Promise<void>;
};

const SrsRequestDetailDialog = ({
                                  row,
                                  detail,
                                  loading,
                                  saving,
                                  uploading,
                                  uploadProgress,
                                  loginEmpNo,
                                  loginDeptCd,
                                  processorOptions,
                                  processorLoading,
                                  statusOptions,
                                  resolveStatusLabel,
                                  resolveCategory1Label,
                                  resolveCategory2Label,
                                  resolveCategory3Label,
                                  resolveDeadlineLabel,
                                  onClose,
                                  onDownloadFile,
                                  requestPreview,
                                  requestDownload,
                                  onSaveService,
                                }: SrsRequestDetailDialogProps) => {
  const [serviceContent, setServiceContent] = useState("");
  const [statusCode, setStatusCode] = useState("10");
  const [doneDate, setDoneDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [processorEmpNo, setProcessorEmpNo] = useState("");
  const [selectedServiceNo, setSelectedServiceNo] = useState("");
  const editorWrapRef = useRef<HTMLDivElement | null>(null);
  const deniedToastAtRef = useRef(0);
  const requestInfo = detail?.requestInfo;
  const isRequestCompleted = useMemo(() => {
    const requestDoneDate = requestInfo?.dtEnd || "";
    const rowDoneDate = row?.doneDate || "";
    const hasCompletedDate =
      (!!requestDoneDate && requestDoneDate !== "99991231") ||
      (!!rowDoneDate && rowDoneDate !== "-" && rowDoneDate !== "9999.12.31");
    return (
      (requestInfo?.cdStatus || "") === "20" ||
      (row?.statusCode || "") === "20" ||
      (row?.status || "").trim() === "처리완료" ||
      (row?.status || "").trim() === "20" ||
      hasCompletedDate
    );
  }, [requestInfo?.cdStatus, requestInfo?.dtEnd, row?.doneDate, row?.status, row?.statusCode]);
  const canEditService = useMemo(() => {
    if (!requestInfo) return false;
    return (requestInfo.resDeptCd || "") === (loginDeptCd || "");
  }, [requestInfo, loginDeptCd]);
  const visibleServiceList = useMemo(() => {
    const list = detail?.serviceList || [];
    if (canEditService) return list;
    return list.filter((item) => {
      const completedByDate = !!item.dtEnd && item.dtEnd !== "99991231";
      return (item.cdStatus || "") === "20" || completedByDate;
    });
  }, [canEditService, detail?.serviceList]);
  const selectedService = useMemo(() => {
    const list = visibleServiceList;
    if (list.length === 0) return null;
    return list.find((item) => item.noService === selectedServiceNo) || list[0];
  }, [selectedServiceNo, visibleServiceList]);

  useEffect(() => {
    if (!row) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [row, onClose]);

  useEffect(() => {
    const latestService = visibleServiceList[0] || detail?.serviceList?.[0];
    const requestInfo = detail?.requestInfo;
    const shouldClearProcessor = !latestService && requestInfo?.reqEmpNo && requestInfo?.resEmpNo && requestInfo.reqEmpNo === requestInfo.resEmpNo;
    const defaultProcessor =
      (!shouldClearProcessor && (latestService?.resEmpNo || requestInfo?.resEmpNo)) ||
      ((requestInfo?.resDeptCd || "") === (loginDeptCd || "") ? loginEmpNo : "");
    setServiceContent(latestService?.content || "");
    setStatusCode(latestService?.cdStatus || requestInfo?.cdStatus || "10");
    setDoneDate(formatDateForInput(requestInfo?.dtEnd || ""));
    setFiles([]);
    setProcessorEmpNo(defaultProcessor || "");
    setSelectedServiceNo(latestService?.noService || "");
  }, [detail, loginDeptCd, loginEmpNo, visibleServiceList]);

  const displayProcessorName = useMemo(() => {
    if (!requestInfo) return row?.manager || "";
    const hasService = (detail?.serviceList || []).length > 0;
    if (!hasService && requestInfo.reqEmpNo && requestInfo.resEmpNo && requestInfo.reqEmpNo === requestInfo.resEmpNo) {
      return "미배정";
    }
    return requestInfo.resEmpNm || row?.manager || "미배정";
  }, [detail?.serviceList, requestInfo, row?.manager]);

  const mergedProcessorOptions = useMemo(() => {
    const options = [...processorOptions];
    if (!processorEmpNo) return options;
    if (options.some((item) => item.value === processorEmpNo)) return options;
    return [{label: requestInfo?.resEmpNm || processorEmpNo, value: processorEmpNo}, ...options];
  }, [processorEmpNo, processorOptions, requestInfo?.resEmpNm]);

  const requestFileServerList = useMemo<SrsServerFile[]>(
    () => (detail?.requestFileList || []).map((file) => ({name: file.nmFile, ynFlag: "N"})),
    [detail]
  );
  const serviceFileGroups = useMemo(() => {
    const groups = new Map<string, SrsServerFile[]>();
    (detail?.serviceFileList || []).forEach((file) => {
      const key = file.noService || "__NO_SERVICE__";
      const current = groups.get(key) || [];
      current.push({name: file.nmFile, ynFlag: "N"});
      groups.set(key, current);
    });
    return groups;
  }, [detail]);

  const showDeniedToast = () => {
    const now = Date.now();
    if (now - deniedToastAtRef.current < 800) return;
    deniedToastAtRef.current = now;
    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "접근 권한이 없습니다.",
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
    });
  };

  const canViewSelectedService = useMemo(() => {
    if (!selectedService) return false;
    if (canEditService) return true;
    return (selectedService.cdStatus || "") === "20" || isRequestCompleted;
  }, [canEditService, isRequestCompleted, selectedService]);

  const effectiveProcessorEmpNo = useMemo(() => {
    if (processorEmpNo) return processorEmpNo;
    if (canEditService && loginEmpNo) return loginEmpNo;
    return "";
  }, [canEditService, loginEmpNo, processorEmpNo]);

  const focusEditor = () => {
    const target = editorWrapRef.current?.querySelector(".jodit-wysiwyg") as HTMLElement | null;
    target?.focus();
  };

  const validateServiceForm = async () => {
    if (!effectiveProcessorEmpNo) {
      await Swal.fire({icon: "warning", title: "필수값 확인", text: "요청처리자는 필수값입니다.", confirmButtonText: "확인"});
      return false;
    }
    if (statusCode === "20" && !doneDate) {
      await Swal.fire({icon: "warning", title: "필수값 확인", text: "완료일자는 필수값입니다.", confirmButtonText: "확인"});
      return false;
    }
    if (statusCode === "20" && isEditorContentEmpty(serviceContent)) {
      await Swal.fire({icon: "warning", title: "필수값 확인", text: "처리내용은 필수값입니다.", confirmButtonText: "확인"});
      focusEditor();
      return false;
    }
    return true;
  };

  if (!row) return null;

  return (
    <div
      className="srs-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="SRS 요청 상세"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="srs-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="srs-detail-header">
          <div>
            <p>요청 상세</p>
            <h2>{row.content}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>

        {loading ? (
          <div className="srs-empty-box">상세 정보를 불러오는 중입니다.</div>
        ) : !requestInfo ? (
          <div className="srs-empty-box">상세 정보가 없습니다.</div>
        ) : (
          <>
            <div className="srs-detail-grid">
              <label>
                요청부서
                <input type="text" value={requestInfo.reqDeptNm || row.dept} readOnly onFocus={showDeniedToast}/>
              </label>
              <label>
                요청처리자
                <input type="text" value={displayProcessorName} readOnly onFocus={showDeniedToast}/>
              </label>
              <label>
                처리기한
                <input type="text" value={resolveDeadlineLabel(requestInfo.cdDay || "") || row.deadline} readOnly
                       onFocus={showDeniedToast}/>
              </label>
              <label>
                요청구분
                <input type="text"
                       value={requestInfo.category1Nm || resolveCategory1Label(requestInfo.category1 || "") || row.category}
                       readOnly onFocus={showDeniedToast}/>
              </label>
              <label>
                구분상세
                <input
                  type="text"
                  value={
                    requestInfo.category2Nm ||
                    resolveCategory2Label(requestInfo.category1 || row.categoryCode || "", requestInfo.category2 || row.typeCode || "") ||
                    row.type
                  }
                  readOnly
                  onFocus={showDeniedToast}
                />
              </label>
              <label>
                요청타입
                <input type="text"
                       value={requestInfo.category3Nm || resolveCategory3Label(requestInfo.category3 || "") || row.detailType}
                       readOnly onFocus={showDeniedToast}/>
              </label>
              <label className="wide">
                제목
                <input type="text" value={requestInfo.subject || row.content} readOnly onFocus={showDeniedToast}/>
              </label>
              <label className="wide">
                요청내용
                <div onClick={showDeniedToast}>
                  <SrsRichTextEditor value={requestInfo.content || row.requestContent || ""} onChange={() => {
                  }} readOnly height={240}/>
                </div>
              </label>
            </div>

            <div className="srs-detail-preview srs-history-panel">
              <div className="srs-preview-toolbar">
                <span/>
                <span/>
                <span/>
                <strong>첨부파일</strong>
              </div>
              <div className="srs-history-grid" style={{gridTemplateColumns: "1fr"}}>
                <SrsFileListUploader
                  seqArticle={requestInfo.noReq || "REQUEST"}
                  serverFiles={requestFileServerList}
                  requestPreview={requestPreview}
                  requestDownload={requestDownload}
                  onFileDownload={(name) => onDownloadFile(name)}
                  allowUpload={false}
                  allowDelete={false}
                />
              </div>
            </div>

            <div className="srs-detail-preview">
              <div className="srs-preview-toolbar">
                <span/>
                <span/>
                <span/>
                <strong>서비스 결과</strong>
              </div>
              <div className="srs-service-log">
                {visibleServiceList.length === 0 ? (
                  <p>등록된 서비스 결과가 없습니다.</p>
                ) : (
                  <>
                    <div className="srs-service-log-list">
                      {visibleServiceList.map((service, index) => (
                        <button
                          key={`service-tab-${service.noService}-${service.dtInsert}-${index}`}
                          type="button"
                          className={`srs-service-log-item ${selectedService?.noService === service.noService ? "selected" : ""}`}
                          onClick={() => setSelectedServiceNo(service.noService || "")}
                        >
                          <div className="srs-service-log-head">
                            <strong>
                              [{service.noService || "NEW"}] {service.resEmpNm || service.resEmpNo || "미배정"}
                            </strong>
                            <span className="srs-service-log-meta">
                              {buildServiceStatusText(
                                resolveStatusLabel(service.cdStatus || ""),
                                service.cdStatusNm,
                                service.dtEnd,
                                service.dtUpdate,
                                service.dtInsert,
                                service.dtAccept
                              )}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedService && canViewSelectedService ? (
                      <article className="srs-service-log-item srs-service-log-detail">
                        <div className="srs-service-log-editor">
                          <SrsRichTextEditor value={selectedService.content || ""} onChange={() => {
                          }} readOnly height={240}/>
                        </div>
                        {(
                          serviceFileGroups.get(selectedService.noService || "") ||
                          (selectedService.noService ? [] : serviceFileGroups.get("__NO_SERVICE__")) ||
                          []
                        ).length > 0 ? (
                          <div className="srs-service-log-files">
                            <SrsFileListUploader
                              seqArticle={selectedService.noService || requestInfo.noReq || "SERVICE"}
                              serverFiles={
                                serviceFileGroups.get(selectedService.noService || "") ||
                                (selectedService.noService ? [] : serviceFileGroups.get("__NO_SERVICE__")) ||
                                []
                              }
                              requestPreview={requestPreview}
                              requestDownload={requestDownload}
                              onFileDownload={(name) => onDownloadFile(name)}
                              allowUpload={false}
                              allowDelete={false}
                            />
                          </div>
                        ) : null}
                      </article>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {canEditService ? (
              <>
                <div className="srs-detail-grid">
                  <label>
                    상태
                    <select value={statusCode} onChange={(e) => setStatusCode(e.target.value)}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    완료일자
                    <input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)}/>
                  </label>
                  <label>
                    요청처리자
                    <select
                      value={effectiveProcessorEmpNo}
                      onChange={(event) => setProcessorEmpNo(event.target.value)}
                      disabled={processorLoading || mergedProcessorOptions.length === 0}
                    >
                      {mergedProcessorOptions.length === 0 ? <option value="">처리자를 불러오는 중입니다.</option> : null}1
                      {mergedProcessorOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="srs-detail-textarea">
                  처리내용
                  <div ref={editorWrapRef}>
                    <SrsRichTextEditor value={serviceContent} onChange={setServiceContent} height={300}
                                       readOnly={false}/>
                  </div>
                </label>
                <div className="srs-attachment-layout srs-detail-file-area">
                  <SrsFileListUploader
                    seqArticle={requestInfo.noReq || "SERVICE"}
                    serverFiles={[] as SrsServerFile[]}
                    onFileUpload={(nextFiles) => setFiles(nextFiles)}
                    onLocalRemove={(name) => setFiles((prev) => prev.filter((file) => file.name !== name))}
                    onFileDownload={(name) => onDownloadFile(name)}
                    allowUpload
                    emitMode="all"
                    externalFiles={[]}
                  />
                </div>
              </>
            ) : null}

            <div className="srs-detail-actions">
              {canEditService ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!(await validateServiceForm())) return;
                    void onSaveService({
                      content: serviceContent,
                      statusCode,
                      doneDate,
                      files,
                      processorEmpNo: effectiveProcessorEmpNo
                    });
                  }}
                  disabled={saving || uploading}
                >
                  {saving ? "저장중..." : "서비스 결과 저장"}
                </button>
              ) : null}
              <button type="button" className="secondary" onClick={onClose}>
                닫기
              </button>
            </div>
            {canEditService && uploading ? (
              <div className="srs-upload-progress">
                <div className="srs-upload-progress__top">
                  <strong>파일 업로드 중</strong>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="srs-upload-progress__bar">
                  <div className="srs-upload-progress__fill" style={{width: `${uploadProgress}%`}}/>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
};

const formatDateForInput = (value: string) => {
  if (!value || value.length < 8) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

const isEditorContentEmpty = (html: string) => {
  if (!html) return true;
  const normalized = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  return normalized.length === 0;
};

const buildServiceStatusText = (
  statusLabel: string,
  statusName: string,
  doneDate: string,
  updateDate: string,
  insertDate: string,
  acceptDate: string
) => {
  const label = statusName || statusLabel || "접수대기";
  const target = label === "처리완료" ? doneDate || updateDate || insertDate : updateDate || insertDate || acceptDate || doneDate;
  const formatted = formatDateTime(target);
  return formatted ? `${label} ${formatted}` : label;
};

const formatDateTime = (value: string) => {
  if (!value) return "";
  if (value.length >= 12) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)} ${value.slice(8, 10)}:${value.slice(10, 12)}`;
  }
  if (value.length >= 8) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  return value;
};

export default SrsRequestDetailDialog;
