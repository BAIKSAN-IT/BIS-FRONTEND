import React, { useRef } from "react";

export type SrsAttachmentItem = {
  id: string;
  name: string;
  displayName?: string;
  sizeText?: string;
};

type SrsAttachmentBoardProps = {
  title: string;
  files: SrsAttachmentItem[];
  emptyText: string;
  helperText?: string;
  addLabel?: string;
  onAddFiles?: (files: File[]) => void;
  onPreview?: (name: string) => void;
  onDownload?: (name: string) => void;
  onRemove?: (name: string) => void;
  previewLabel?: string;
  downloadLabel?: string;
  removeLabel?: string;
};

const SrsAttachmentBoard = ({
  title,
  files,
  emptyText,
  helperText,
  addLabel = "파일 선택",
  onAddFiles,
  onPreview,
  onDownload,
  onRemove,
  previewLabel = "미리보기",
  downloadLabel = "다운로드",
  removeLabel = "삭제",
}: SrsAttachmentBoardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length > 0) {
      onAddFiles?.(nextFiles);
    }
    event.target.value = "";
  };

  return (
    <section className="srs-attachment-board">
      <div className="srs-attachment-head">
        <div>
          <strong>{title}</strong>
          {helperText ? <p>{helperText}</p> : null}
        </div>
        {onAddFiles ? (
          <>
            <input ref={inputRef} type="file" multiple hidden onChange={handleSelect} />
            <button type="button" className="srs-attachment-add" onClick={() => inputRef.current?.click()}>
              {addLabel}
            </button>
          </>
        ) : null}
      </div>

      {onAddFiles ? (
        <button type="button" className="srs-upload-dropzone" onClick={() => inputRef.current?.click()}>
          <span className="srs-upload-dropzone-icon">+</span>
          <span>파일을 선택하거나 여기를 눌러 업로드하세요.</span>
        </button>
      ) : null}

      {files.length === 0 ? (
        <div className="srs-attachment-empty">{emptyText}</div>
      ) : (
        <div className="srs-attachment-grid">
          {files.map((file) => {
            const ext = getExtensionLabel(file.name);
            return (
              <article key={file.id} className="srs-attachment-card">
                <div className="srs-attachment-type">{ext}</div>
                <div className="srs-attachment-meta">
                    <strong title={file.displayName || file.name}>{file.displayName || file.name}</strong>
                  <span>{file.sizeText || "등록 파일"}</span>
                </div>
                <div className="srs-attachment-actions">
                  {onPreview ? (
                    <button type="button" className="secondary" onClick={() => onPreview(file.name)}>
                      {previewLabel}
                    </button>
                  ) : null}
                  {onDownload ? (
                    <button type="button" className="secondary" onClick={() => onDownload(file.name)}>
                      {downloadLabel}
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button type="button" className="secondary" onClick={() => onRemove(file.name)}>
                      {removeLabel}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const getExtensionLabel = (name: string) => {
  const ext = name.split(".").pop()?.toUpperCase() || "FILE";
  return ext.length > 4 ? ext.slice(0, 4) : ext;
};

export default SrsAttachmentBoard;
