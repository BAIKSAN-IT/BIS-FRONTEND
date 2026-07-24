import React from "react";
import { SrsBoardFileItem, SrsNoticeItem } from "@redux/srs/srsSlice";

type SrsNoticeDetailModalProps = {
  open: boolean;
  row: SrsNoticeItem | null;
  files: SrsBoardFileItem[];
  loadingFiles: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPreviewFile: (filePath: string) => void;
  onDownloadFile: (filePath: string) => void;
};

const SrsNoticeDetailModal = ({
  open,
  row,
  files,
  loadingFiles,
  isAdmin,
  onClose,
  onEdit,
  onPreviewFile,
  onDownloadFile,
}: SrsNoticeDetailModalProps) => {
  if (!open || !row) return null;

  return (
    <div className="srs-modal-backdrop">
      <div className="srs-board-modal srs-notice-detail-modal" role="dialog" aria-modal="true" aria-label="공지사항 상세">
        <div className="srs-detail-header">
          <div>
            <p>공지사항</p>
            <h2>상세보기</h2>
          </div>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <section className="srs-notice-detail-body">
          <div className="srs-notice-detail-meta">
            <span className="category">{row.category || "공지"}</span>
            <span>{formatDate(row.dtStart || row.dtInsert)}</span>
          </div>
          <h3>{row.title || "-"}</h3>
          <div className="srs-board-content" dangerouslySetInnerHTML={{ __html: row.content || "-" }} />

          <div className="srs-board-file-area">
            <div className="srs-board-file-head">
              <div>
                <strong>첨부파일</strong>
                <p>{loadingFiles ? "첨부파일을 불러오는 중입니다." : "미리보기 또는 다운로드를 선택하세요."}</p>
              </div>
            </div>
            <div className="srs-board-file-list">
              {files.map((file) => (
                <div className="srs-board-file-row" key={`${file.noBoard}-${file.seqFile}`}>
                  <span>{displayFileName(file.nmFile)}</span>
                  <div>
                    <button type="button" onClick={() => onPreviewFile(file.nmFile)}>
                      미리보기
                    </button>
                    <button type="button" onClick={() => onDownloadFile(file.nmFile)}>
                      다운로드
                    </button>
                  </div>
                </div>
              ))}
              {!loadingFiles && files.length === 0 ? <p className="srs-empty-text">첨부파일이 없습니다.</p> : null}
            </div>
          </div>
        </section>

        <div className="srs-detail-actions srs-board-modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            닫기
          </button>
          {isAdmin ? (
            <button type="button" onClick={onEdit}>
              수정
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const formatDate = (value: string) => (value && value.length >= 8 ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}` : "-");
const displayFileName = (value: string) => value.split("/").pop() || value;

export default SrsNoticeDetailModal;