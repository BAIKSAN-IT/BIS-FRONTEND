import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { CommonPisCodeDetailRes, getCommonCodeDetailList } from "@redux/common/commonSlice";
import { fetchSrsDeptList, SrsDeptRes, SrsRequestFileRes, SrsRequestInfoRes } from "@redux/srs/srsSlice";
import { AppDispatch } from "@redux/store";
import SrsRichTextEditor from "./SrsRichTextEditor";
import SrsFileListUploader, { SrsServerFile } from "./SrsFileListUploader";

type RequestModalSubmit = {
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
};

type Option = {
  label: string;
  value: string;
};

type SrsRequestModalProps = {
  open: boolean;
  mode: "create" | "edit";
  companyId: string;
  defaultManagerName: string;
  defaultManagerEmpNo: string;
  initialRequest: SrsRequestInfoRes | null;
  existingFiles: SrsRequestFileRes[];
  saving: boolean;
  uploading: boolean;
  uploadProgress: number;
  onClose: () => void;
  onDownloadFile: (filePath: string) => void;
  requestPreview?: (arg: { seqArticle: string; fileName: string; bust?: boolean }) => Promise<Blob | null>;
  requestDownload?: (arg: { seqArticle: string; fileName: string }) => Promise<Blob | null>;
  onSubmit: (payload: RequestModalSubmit) => Promise<void>;
};

const SrsRequestModal = ({
  open,
  mode,
  companyId,
  defaultManagerName,
  defaultManagerEmpNo,
  initialRequest,
  existingFiles,
  saving,
  uploading,
  uploadProgress,
  onClose,
  onDownloadFile,
  requestPreview,
  requestDownload,
  onSubmit,
}: SrsRequestModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [requestDeptCd, setRequestDeptCd] = useState("");
  const [requestDeptNm, setRequestDeptNm] = useState("");
  const [deptKeyword, setDeptKeyword] = useState("");
  const [requesterEmpNo, setRequesterEmpNo] = useState("");
  const [requesterEmpNm, setRequesterEmpNm] = useState("");
  const [subject, setSubject] = useState("");
  const [category1, setCategory1] = useState("");
  const [category2, setCategory2] = useState("");
  const [category3, setCategory3] = useState("");
  const [category1Options, setCategory1Options] = useState<Option[]>([]);
  const [category2Options, setCategory2Options] = useState<Option[]>([]);
  const [category3Options, setCategory3Options] = useState<Option[]>([]);
  const [urgencyOptions, setUrgencyOptions] = useState<Option[]>([]);
  const [urgency, setUrgency] = useState("15");
  const [dtWrk, setDtWrk] = useState("");
  const [content, setContent] = useState("");
  const [statusCode, setStatusCode] = useState("00");
  const [deletedSeqFiles, setDeletedSeqFiles] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deptOptions, setDeptOptions] = useState<SrsDeptRes[]>([]);
  const [showDeptOptions, setShowDeptOptions] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const deptInputRef = useRef<HTMLInputElement | null>(null);
  const urgencySelectRef = useRef<HTMLSelectElement | null>(null);
  const dtWrkInputRef = useRef<HTMLInputElement | null>(null);
  const category1Ref = useRef<HTMLSelectElement | null>(null);
  const category2Ref = useRef<HTMLSelectElement | null>(null);
  const category3Ref = useRef<HTMLSelectElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const editorWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadBaseCodes = async () => {
      const [kindList, typeList, deadlineList] = await Promise.all([
        fetchCommonCodeOptions(dispatch, companyId, "SP0007"),
        fetchCommonCodeOptions(dispatch, companyId, "SP0009"),
        fetchCommonCodeOptions(dispatch, companyId, "SP0010"),
      ]);
      setCategory1Options(kindList);
      setCategory3Options(typeList);
      setUrgencyOptions(deadlineList);
    };

    void loadBaseCodes();
  }, [companyId, dispatch, open]);

  useEffect(() => {
    if (!open || !category1) {
      setCategory2Options([]);
      if (!category1) setCategory2("");
      return;
    }

    const loadDetailCodes = async () => {
      const detailList = await fetchCommonCodeOptions(dispatch, companyId, "SP0008", category1);
      setCategory2Options(detailList);
      if (category2 && !detailList.some((item) => item.value === category2)) {
        setCategory2("");
      }
    };

    void loadDetailCodes();
  }, [category1, category2, companyId, dispatch, open]);

  useEffect(() => {
    if (!open) return;

    setRequestDeptCd(initialRequest?.reqDeptCd || "");
    setRequestDeptNm(initialRequest?.reqDeptNm || "");
    setDeptKeyword(initialRequest?.reqDeptNm || "");
    setRequesterEmpNo(initialRequest?.reqEmpNo || defaultManagerEmpNo);
    setRequesterEmpNm(initialRequest?.reqEmpNm || defaultManagerName);
    setSubject(initialRequest?.subject || "");
    setCategory1(initialRequest?.category1 || "");
    setCategory2(initialRequest?.category2 || "");
    setCategory3(initialRequest?.category3 || "");
    setUrgency(initialRequest?.cdDay || "15");
    setDtWrk(mode === "create" ? todayPlusDaysInput(7) : formatDateForInput(initialRequest?.dtWrk || "") || todayPlusDaysInput(7));
    setContent(initialRequest?.content || "");
    setStatusCode(initialRequest?.cdStatus || "00");
    setDeletedSeqFiles([]);
    setNewFiles([]);
    setShowDeptOptions(false);
  }, [defaultManagerEmpNo, defaultManagerName, initialRequest, mode, open]);

  useEffect(() => {
    if (!open) return;

    const loadDeptList = async () => {
      setLookupLoading(true);
      try {
        const items = await dispatch(fetchSrsDeptList({ cdCompany: companyId })).unwrap();
        setDeptOptions(items || []);
      } finally {
        setLookupLoading(false);
      }
    };

    void loadDeptList();
  }, [companyId, dispatch, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDeptOptions(false);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const filteredDeptOptions = useMemo(() => {
    const keyword = deptKeyword.trim();
    if (!keyword) return deptOptions;
    return deptOptions.filter((dept) => (dept.deptNm || "").includes(keyword));
  }, [deptKeyword, deptOptions]);

  const visibleExistingFiles = useMemo(
    () => existingFiles.filter((file) => !deletedSeqFiles.includes(file.seqFile)),
    [deletedSeqFiles, existingFiles]
  );

  const serverFiles = useMemo<SrsServerFile[]>(
    () =>
      existingFiles.map((file) => ({
        name: file.nmFile,
        ynFlag: deletedSeqFiles.includes(file.seqFile) ? "D" : "N",
      })),
    [deletedSeqFiles, existingFiles]
  );

  const noReq = initialRequest?.noReq || "";
  const isCompletedRequest = mode === "edit" && (initialRequest?.cdStatus || "") === "20";

  const focusEditor = () => {
    const target = editorWrapRef.current?.querySelector(".jodit-wysiwyg") as HTMLElement | null;
    target?.focus();
  };

  const showRequiredAlert = async (fieldName: string, focus: () => void) => {
    await Swal.fire({
      icon: "warning",
      title: "필수값 확인",
      text: `${fieldName}은(는) 필수값입니다.`,
      confirmButtonText: "확인",
    });
    focus();
  };

  const validateAndSubmit = async () => {
    if (isCompletedRequest) {
      await Swal.fire({
        icon: "warning",
        title: "수정 불가",
        text: "처리완료된 요청은 더 이상 수정할 수 없습니다.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!requestDeptCd) return showRequiredAlert("요청부서", () => deptInputRef.current?.focus());
    if (!urgency) return showRequiredAlert("처리기한", () => urgencySelectRef.current?.focus());
    if (!dtWrk) return showRequiredAlert("희망완료일", () => dtWrkInputRef.current?.focus());
    if (!category1) return showRequiredAlert("요청구분", () => category1Ref.current?.focus());
    if (!category2) return showRequiredAlert("구분상세", () => category2Ref.current?.focus());
    if (!category3) return showRequiredAlert("요청타입", () => category3Ref.current?.focus());
    if (!subject.trim()) return showRequiredAlert("요청제목", () => subjectRef.current?.focus());
    if (isEditorContentEmpty(content)) return showRequiredAlert("요청내용", focusEditor);

    await onSubmit({
      noReq,
      reqDeptCd: requestDeptCd,
      reqDeptNm: requestDeptNm,
      reqEmpNo: requesterEmpNo || defaultManagerEmpNo,
      reqEmpNm: requesterEmpNm || defaultManagerName,
      resEmpNo: initialRequest?.resEmpNo || "",
      resEmpNm: initialRequest?.resEmpNm || "",
      subject,
      category1,
      category2,
      category3,
      urgency,
      dtWrk,
      content,
      cdStatus: statusCode,
      existingFiles,
      deletedSeqFiles,
      newFiles,
    });
  };

  if (!open) return null;

  return (
    <div
      className="srs-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="SRS 요청 등록"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setShowDeptOptions(false);
          onClose();
        }
      }}
    >
      <section className="srs-detail-modal srs-request-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="srs-detail-header">
          <div>
            <p>{mode === "edit" ? "요청 수정" : "신규 요청"}</p>
            <h2>{mode === "edit" ? "선택된 요청 수정" : "새 요청 등록"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="요청창 닫기">
            닫기
          </button>
        </div>

        <div className="srs-form-grid srs-request-form-grid">
          <label>
            요청부서
            <div className="srs-picker-stack">
              <div className="srs-picker-field srs-picker-field-wide">
                <input
                  ref={deptInputRef}
                  type="text"
                  className="srs-picker-input"
                  value={deptKeyword}
                  placeholder="요청 부서를 선택하세요"
                  readOnly={isCompletedRequest}
                  onFocus={() => {
                    if (isCompletedRequest) return;
                    setShowDeptOptions(true);
                  }}
                  onChange={(event) => {
                    if (isCompletedRequest) return;
                    setDeptKeyword(event.target.value);
                    setRequestDeptCd("");
                    setRequestDeptNm("");
                    setShowDeptOptions(true);
                  }}
                />
              </div>
              {showDeptOptions ? (
                <div className="srs-lookup-panel">
                  {lookupLoading ? <div className="srs-lookup-empty">부서 목록을 불러오는 중입니다.</div> : null}
                  {!lookupLoading && filteredDeptOptions.length === 0 ? <div className="srs-lookup-empty">일치하는 부서가 없습니다.</div> : null}
                  {!lookupLoading
                    ? filteredDeptOptions.map((dept) => (
                        <button
                          type="button"
                          key={`${dept.deptId}-${dept.deptNm}`}
                          className="srs-lookup-item"
                          disabled={isCompletedRequest}
                          onClick={() => {
                            setRequestDeptCd(dept.deptId || "");
                            setRequestDeptNm(dept.deptNm || "");
                            setDeptKeyword(dept.deptNm || "");
                            setShowDeptOptions(false);
                          }}
                        >
                          <strong>{dept.deptNm}</strong>
                        </button>
                      ))
                    : null}
                </div>
              ) : null}
            </div>
          </label>

          <label>
            처리기한
            <select ref={urgencySelectRef} value={urgency} disabled={isCompletedRequest} onChange={(event) => setUrgency(event.target.value)}>
              <option value="">선택하세요</option>
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            희망완료일
            <input ref={dtWrkInputRef} type="date" value={dtWrk} readOnly={isCompletedRequest} onChange={(event) => setDtWrk(event.target.value)} />
          </label>

          <label>
            요청구분
            <select ref={category1Ref} value={category1} disabled={isCompletedRequest} onChange={(event) => setCategory1(event.target.value)}>
              <option value="">선택하세요</option>
              {category1Options.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            구분상세
            <select ref={category2Ref} value={category2} disabled={!category1 || isCompletedRequest} onChange={(event) => setCategory2(event.target.value)}>
              <option value="">{category1 ? "선택하세요" : "요청구분을 먼저 선택하세요"}</option>
              {category2Options.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            요청타입
            <select ref={category3Ref} value={category3} disabled={isCompletedRequest} onChange={(event) => setCategory3(event.target.value)}>
              <option value="">선택하세요</option>
              {category3Options.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="wide">
            요청제목
            <input ref={subjectRef} type="text" value={subject} readOnly={isCompletedRequest} onChange={(event) => setSubject(event.target.value)} />
          </label>

          <label className="wide">
            요청내용
            <div ref={editorWrapRef}>
              <SrsRichTextEditor value={content} onChange={setContent} height={320} readOnly={isCompletedRequest} />
            </div>
          </label>
        </div>

        <div className="srs-attachment-layout">
          <SrsFileListUploader
            seqArticle={noReq || "NEW"}
            serverFiles={serverFiles}
            requestPreview={requestPreview}
            requestDownload={requestDownload}
            onMarkDelete={(name) => {
              const target = visibleExistingFiles.find((file) => file.nmFile === name);
              if (target) {
                setDeletedSeqFiles((prev) => [...prev, target.seqFile]);
              }
            }}
            onLocalRemove={(name) => {
              setNewFiles((prev) => prev.filter((file) => file.name !== name));
            }}
            onFileUpload={(files) => setNewFiles(files)}
            onFileDownload={(name) => onDownloadFile(name)}
            allowUpload={!isCompletedRequest}
            allowDelete={!isCompletedRequest}
            isDisabled={isCompletedRequest}
            emitMode="all"
            externalFiles={[]}
          />
        </div>

        <div className="srs-detail-actions">
          <button type="button" className="secondary" onClick={onClose}>
            닫기
          </button>
          {!isCompletedRequest ? (
            <button type="button" disabled={saving || uploading} onClick={() => void validateAndSubmit()}>
              {saving ? "저장중..." : mode === "edit" ? "요청 수정" : "요청 등록"}
            </button>
          ) : null}
        </div>
        {uploading ? (
          <div className="srs-upload-progress">
            <div className="srs-upload-progress__top">
              <strong>파일 업로드 중</strong>
              <span>{uploadProgress}%</span>
            </div>
            <div className="srs-upload-progress__bar">
              <div className="srs-upload-progress__fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
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

const formatDateForInput = (value: string) => {
  if (!value || value.length < 8) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

const todayPlusDaysInput = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isEditorContentEmpty = (html: string) => {
  if (!html) return true;
  const normalized = html.replace(/<br\s*\/?>/gi, "").replace(/&nbsp;/gi, "").replace(/<[^>]*>/g, "").trim();
  return normalized.length === 0;
};

export default SrsRequestModal;
