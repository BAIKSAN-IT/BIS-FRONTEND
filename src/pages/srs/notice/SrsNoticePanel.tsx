import React, { useMemo, useState } from "react";
import FilePreviewUploader from "@components/FilePreviewUploader";
import { SrsBoardFileItem, SrsNoticeItem } from "@redux/srs/srsSlice";
import SrsRichTextEditor from "../service/SrsRichTextEditor";

export type SrsNoticeSubmitValue = {
  noNotice: string;
  category: string;
  title: string;
  content: string;
  ynTop: "Y" | "N";
  ynPopup: "Y" | "N";
  dtStart: string;
  dtEnd: string;
  ynUse: "Y" | "N";
  ynDel: "Y" | "N";
  existingFiles: SrsBoardFileItem[];
  deletedSeqFiles: number[];
  newFiles: File[];
};

type SrsNoticePanelProps = {
  rows: SrsNoticeItem[];
  files: SrsBoardFileItem[];
  isAdmin: boolean;
  loading: boolean;
  saving: boolean;
  fileLoading: boolean;
  fileSaving: boolean;
  onLoadFiles: (noNotice: string) => Promise<SrsBoardFileItem[]>;
  requestPreview?: (arg: { seqArticle: string; fileName: string; bust?: boolean }) => Promise<Blob | null>;
  requestDownload?: (arg: { seqArticle: string; fileName: string }) => Promise<Blob | null>;
  onPreviewFile: (filePath: string) => void;
  onDownloadFile: (filePath: string) => void;
  onSave: (value: SrsNoticeSubmitValue) => Promise<void>;
};

type NoticeViewMode = "list" | "detail" | "edit";

const createEmptyNotice = (): SrsNoticeSubmitValue => ({
  noNotice: "",
  category: "공지",
  title: "",
  content: "",
  ynTop: "N",
  ynPopup: "N",
  dtStart: "",
  dtEnd: "",
  ynUse: "Y",
  ynDel: "N",
  existingFiles: [],
  deletedSeqFiles: [],
  newFiles: [],
});

const mapRowToForm = (row: SrsNoticeItem): SrsNoticeSubmitValue => ({
  noNotice: row.noNotice || "",
  category: row.category || "공지",
  title: row.title || "",
  content: row.content || "",
  ynTop: row.ynTop === "Y" ? "Y" : "N",
  ynPopup: row.ynPopup === "Y" ? "Y" : "N",
  dtStart: toDateInput(row.dtStart),
  dtEnd: toDateInput(row.dtEnd),
  ynUse: row.ynUse === "N" ? "N" : "Y",
  ynDel: row.ynDel === "Y" ? "Y" : "N",
  existingFiles: [],
  deletedSeqFiles: [],
  newFiles: [],
});

const SrsNoticePanel = ({
  rows,
  files,
  isAdmin,
  loading,
  saving,
  fileLoading,
  fileSaving,
  onLoadFiles,
  requestPreview,
  requestDownload,
  onPreviewFile,
  onDownloadFile,
  onSave,
}: SrsNoticePanelProps) => {
  const [viewMode, setViewMode] = useState<NoticeViewMode>("list");
  const [keyword, setKeyword] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<SrsNoticeItem | null>(null);
  const [form, setForm] = useState<SrsNoticeSubmitValue>(() => createEmptyNotice());
  const [formError, setFormError] = useState("");

  const filteredRows = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    if (!lowerKeyword) return rows;
    return rows.filter((row) =>
      [row.category, row.title, stripHtml(row.content || "")].some((value) =>
        (value || "").toLowerCase().includes(lowerKeyword)
      )
    );
  }, [keyword, rows]);

  const detailFiles = useMemo(() => {
    if (!selectedNotice?.noNotice) return [];
    return files.filter((file) => file.noBoard === selectedNotice.noNotice && file.ynDel !== "Y");
  }, [files, selectedNotice]);

  const visibleEditFiles = useMemo(
    () => form.existingFiles.filter((file) => file.ynDel !== "Y" && !form.deletedSeqFiles.includes(file.seqFile)),
    [form.deletedSeqFiles, form.existingFiles]
  );

  const openDetailPage = async (row: SrsNoticeItem) => {
    setSelectedNotice(row);
    setViewMode("detail");
    try {
      await onLoadFiles(row.noNotice);
    } catch {
      // noop
    }
  };

  const openCreatePage = () => {
    setSelectedNotice(null);
    setForm(createEmptyNotice());
    setFormError("");
    setViewMode("edit");
  };

  const openEditPage = async (row: SrsNoticeItem) => {
    setSelectedNotice(row);
    setForm(mapRowToForm(row));
    setFormError("");
    setViewMode("edit");

    try {
      const loadedFiles = await onLoadFiles(row.noNotice);
      setForm((prev) => ({ ...prev, existingFiles: loadedFiles || [] }));
    } catch {
      setForm((prev) => ({ ...prev, existingFiles: [] }));
      setFormError("첨부파일을 불러오지 못했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;
    if (!form.title.trim()) {
      setFormError("공지 제목을 입력해 주세요.");
      return;
    }

    setFormError("");
    await onSave({
      ...form,
      dtStart: toCompactDate(form.dtStart),
      dtEnd: toCompactDate(form.dtEnd),
    });

    setViewMode("list");
    setSelectedNotice(null);
    setForm(createEmptyNotice());
  };

  const removeNewFileByName = (name: string) => {
    setForm((prev) => ({ ...prev, newFiles: prev.newFiles.filter((file) => file.name !== name) }));
  };

  const markExistingFileDeletedByName = (name: string) => {
    setForm((prev) => {
      const matchedSeqFiles = prev.existingFiles.filter((file) => file.nmFile === name).map((file) => file.seqFile);
      if (matchedSeqFiles.length === 0) return prev;
      return {
        ...prev,
        deletedSeqFiles: Array.from(new Set([...prev.deletedSeqFiles, ...matchedSeqFiles])),
      };
    });
  };

  const setUseValue = (checked: boolean) => {
    setForm((prev) => ({ ...prev, ynUse: checked ? "Y" : "N", ynDel: checked ? "N" : prev.ynDel }));
  };

  const setDeleteValue = (checked: boolean) => {
    setForm((prev) => ({ ...prev, ynDel: checked ? "Y" : "N", ynUse: checked ? "N" : prev.ynUse }));
  };

  const setFormValue = <K extends keyof SrsNoticeSubmitValue>(key: K, value: SrsNoticeSubmitValue[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="srs-notice-panel" aria-label="SRS 공지사항">
      <div className="srs-section-title">
        <div>
          <p>공지</p>
          <h2>공지사항</h2>
        </div>
        {isAdmin && viewMode === "list" ? (
          <button type="button" onClick={openCreatePage}>
            공지 등록
          </button>
        ) : null}
      </div>

      {viewMode === "list" ? (
        <>
          <div className="srs-board-toolbar">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="제목, 내용, 분류로 검색"
              aria-label="공지사항 검색"
            />
            <span>{loading ? "불러오는 중..." : `${filteredRows.length}건`}</span>
          </div>

          <div className="srs-notice-grid">
            {filteredRows.map((notice) => (
              <article
                key={notice.noNotice}
                className={`srs-notice-card ${notice.ynUse === "N" ? "disabled" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => void openDetailPage(notice)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void openDetailPage(notice);
                  }
                }}
              >
                <div>
                  <span>{notice.category || "공지"}</span>
                  <time>{formatDate(notice.dtStart || notice.dtInsert)}</time>
                </div>
                <h3>{notice.title}</h3>
                <div className="srs-board-content" dangerouslySetInnerHTML={{ __html: notice.content || "-" }} />
                <div className="srs-board-card-actions">
                  {notice.ynTop === "Y" ? <em>상단고정</em> : null}
                  {notice.ynUse === "N" ? <em>미사용</em> : null}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void openDetailPage(notice);
                    }}
                  >
                    상세보기
                  </button>
                </div>
              </article>
            ))}
            {!loading && filteredRows.length === 0 ? <p className="srs-empty-text">등록된 공지사항이 없습니다.</p> : null}
          </div>
        </>
      ) : null}

      {viewMode === "detail" ? (
        <section className="srs-notice-page">
          <div className="srs-notice-page-header">
            <div>
              <p>공지사항</p>
              <h2>상세보기</h2>
            </div>
            <div className="srs-detail-actions">
              <button type="button" className="secondary" onClick={() => setViewMode("list")}>
                목록
              </button>
              {isAdmin && selectedNotice ? (
                <button type="button" onClick={() => void openEditPage(selectedNotice)}>
                  수정
                </button>
              ) : null}
            </div>
          </div>

          <div className="srs-notice-detail-meta">
            <span className="category">{selectedNotice?.category || "공지"}</span>
            <span>{formatDate(selectedNotice?.dtStart || selectedNotice?.dtInsert || "")}</span>
          </div>
          <h3 className="srs-notice-detail-title">{selectedNotice?.title || "-"}</h3>
          <div className="srs-board-content" dangerouslySetInnerHTML={{ __html: selectedNotice?.content || "-" }} />

          <div className="srs-board-file-area">
            <div className="srs-board-file-head">
              <div>
                <strong>첨부파일</strong>
                <p>{fileLoading ? "첨부파일을 불러오는 중입니다." : "미리보기 또는 다운로드를 선택하세요."}</p>
              </div>
            </div>

            <FilePreviewUploader
              seqArticle={selectedNotice?.noNotice || "notice-detail"}
              cardRepeat="4"
              isDisabled
              allowDelete={false}
              allowUpload={false}
              serverFiles={detailFiles.map((file) => ({ name: file.nmFile }))}
              requestPreview={requestPreview}
              requestDownload={requestDownload}
              onFileDownload={(name) => onDownloadFile(name)}
            />
            {!fileLoading && detailFiles.length === 0 ? <p className="srs-empty-text">첨부파일이 없습니다.</p> : null}
          </div>
        </section>
      ) : null}

      {viewMode === "edit" ? (
        <section className="srs-notice-page">
          <div className="srs-notice-page-header">
            <div>
              <p>{form.noNotice ? "공지사항" : "공지 등록"}</p>
              <h2>{form.noNotice ? "공지사항 수정" : "새 공지사항"}</h2>
            </div>
            <div className="srs-detail-actions">
              <button type="button" className="secondary" onClick={() => setViewMode(form.noNotice ? "detail" : "list")}>
                취소
              </button>
              <button type="button" disabled={saving || fileSaving} onClick={() => void handleSubmit()}>
                {saving || fileSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>

          <div className="srs-board-form-grid srs-board-form-grid-page">
            <label>
              분류
              <input value={form.category} onChange={(event) => setFormValue("category", event.target.value)} />
            </label>
            <label>
              시작일
              <input type="date" value={form.dtStart} onChange={(event) => setFormValue("dtStart", event.target.value)} />
            </label>
            <label>
              종료일
              <input type="date" value={form.dtEnd} onChange={(event) => setFormValue("dtEnd", event.target.value)} />
            </label>
            <label className="wide">
              제목
              <input value={form.title} onChange={(event) => setFormValue("title", event.target.value)} />
            </label>
          </div>

          <div className="srs-board-editor srs-board-editor-page">
            <span>내용</span>
            <SrsRichTextEditor value={form.content} height={320} onChange={(value) => setFormValue("content", value)} />
          </div>

          <div className="srs-board-file-area">
            <div className="srs-board-file-head">
              <div>
                <strong>첨부파일</strong>
                <p>{fileLoading ? "첨부파일을 불러오는 중입니다." : "드래그&드롭 또는 업로드 버튼으로 파일을 추가하세요."}</p>
              </div>
            </div>

            <FilePreviewUploader
              seqArticle={form.noNotice || "notice-temp"}
              cardRepeat="4"
              emitMode="delta"
              isDisabled={saving || fileSaving}
              allowDelete
              allowUpload
              serverFiles={visibleEditFiles.map((file) => ({ name: file.nmFile }))}
              requestPreview={requestPreview}
              requestDownload={requestDownload}
              onMarkDelete={(name) => markExistingFileDeletedByName(name)}
              onLocalRemove={(name) => removeNewFileByName(name)}
              onFileUpload={(newFiles) =>
                setForm((prev) => ({
                  ...prev,
                  newFiles: [...prev.newFiles, ...newFiles],
                }))
              }
              onFileDownload={(name) => onDownloadFile(name)}
            />

            {!fileLoading && visibleEditFiles.length === 0 && form.newFiles.length === 0 ? (
              <p className="srs-empty-text">첨부파일이 없습니다.</p>
            ) : null}
          </div>

          <div className="srs-board-options">
            <label>
              <input
                type="checkbox"
                checked={form.ynTop === "Y"}
                onChange={(event) => setFormValue("ynTop", event.target.checked ? "Y" : "N")}
              />
              상단 고정
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.ynPopup === "Y"}
                onChange={(event) => setFormValue("ynPopup", event.target.checked ? "Y" : "N")}
              />
              팝업 공지
            </label>
            <label>
              <input type="checkbox" checked={form.ynUse === "Y"} onChange={(event) => setUseValue(event.target.checked)} />
              사용
            </label>
            <label>
              <input type="checkbox" checked={form.ynDel === "Y"} onChange={(event) => setDeleteValue(event.target.checked)} />
              삭제 처리
            </label>
          </div>

          {formError ? <div className="srs-alert-error">{formError}</div> : null}
        </section>
      ) : null}
    </section>
  );
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");
const toCompactDate = (value: string) => value.replace(/-/g, "");
const toDateInput = (value: string) =>
  value && value.length >= 8 ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : "";
const formatDate = (value: string) =>
  value && value.length >= 8 ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}` : "-";
const displayFileName = (value: string) => value.split("/").pop() || value;

export default SrsNoticePanel;
