import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import LightboxPreview from "@components/LightboxPreview";

export interface SrsServerFile {
  name: string;
  ynFlag?: string;
}

type RequestPreviewFn = (arg: { seqArticle: string; fileName: string; bust?: boolean }) => Promise<Blob | null>;
type RequestDownloadFn = (arg: { seqArticle: string; fileName: string }) => Promise<Blob | null>;

type LocalFile = File & {
  preview?: string | null;
  downloadUrl?: string;
  formattedSize?: string;
};

type SpreadsheetPreviewState = {
  open: boolean;
  name: string;
  sheetName: string;
  rows: string[][];
  loading: boolean;
  error: string;
};

type FramePreviewState = {
  open: boolean;
  name: string;
  src: string;
  loading: boolean;
  error: string;
};

type TextPreviewState = {
  open: boolean;
  name: string;
  text: string;
  loading: boolean;
  error: string;
};

type Props = {
  seqArticle: string;
  serverFiles: SrsServerFile[];
  requestPreview?: RequestPreviewFn;
  requestDownload?: RequestDownloadFn;
  onMarkDelete?: (name: string) => void;
  onLocalRemove?: (name: string) => void;
  onFileUpload?: (files: File[]) => void;
  onFileDownload?: (name: string) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  isDisabled?: boolean;
  emitMode?: "all" | "delta";
  externalFiles?: File[];
};

const EXCEL_PREVIEW_MAX_ROWS = 50;
const EXCEL_PREVIEW_MAX_COLS = 20;

const createEmptySpreadsheetPreview = (): SpreadsheetPreviewState => ({
  open: false,
  name: "",
  sheetName: "",
  rows: [],
  loading: false,
  error: "",
});

const createEmptyFramePreview = (): FramePreviewState => ({
  open: false,
  name: "",
  src: "",
  loading: false,
  error: "",
});

const createEmptyTextPreview = (): TextPreviewState => ({
  open: false,
  name: "",
  text: "",
  loading: false,
  error: "",
});

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const displayName = (name: string) => name.split("/").pop() || name;
const normalizeName = (name: string) => displayName(name).toLowerCase();
const getExtension = (name: string) => {
  const match = displayName(name).match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
};

const isImageName = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
const isSpreadsheetName = (name: string) => /\.(xlsx|xls|csv)$/i.test(name);
const isPdfName = (name: string) => /\.pdf$/i.test(name);
const isWordName = (name: string) => /\.(docx?|odt)$/i.test(name);
const isHangulName = (name: string) => /\.(hwp|hwpx)$/i.test(name);
const isPowerPointName = (name: string) => /\.(pptx?|odp)$/i.test(name);
const isTextName = (name: string) => /\.(txt|md|log|json|xml)$/i.test(name);
const isOfficeLikeName = (name: string) => isWordName(name) || isHangulName(name) || isPowerPointName(name);

const getFileTypeText = (name: string) => {
  const ext = getExtension(name);
  if (isImageName(name)) return "이미지";
  if (isSpreadsheetName(name)) return "엑셀";
  if (isPdfName(name)) return "PDF";
  if (isWordName(name)) return "워드";
  if (isHangulName(name)) return "한글";
  if (isPowerPointName(name)) return "PPT";
  if (isTextName(name)) return "텍스트";
  if (ext === "zip" || ext === "7z" || ext === "rar") return "압축파일";
  return "파일";
};

const SrsFileListUploader = memo(
  ({
    seqArticle,
    serverFiles,
    requestPreview,
    requestDownload,
    onMarkDelete,
    onLocalRemove,
    onFileUpload,
    onFileDownload,
    allowUpload = true,
    allowDelete = true,
    isDisabled = false,
    emitMode = "all",
    externalFiles,
  }: Props) => {
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [previewUrlMap, setPreviewUrlMap] = useState<Record<string, string>>({});
    const [viewer, setViewer] = useState({ open: false, src: "", name: "" });
    const [sheetPreview, setSheetPreview] = useState<SpreadsheetPreviewState>(createEmptySpreadsheetPreview());
    const [framePreview, setFramePreview] = useState<FramePreviewState>(createEmptyFramePreview());
    const [textPreview, setTextPreview] = useState<TextPreviewState>(createEmptyTextPreview());

    const createdUrlsRef = useRef<string[]>([]);
    const previewFnRef = useRef<RequestPreviewFn | undefined>(requestPreview);
    const downloadFnRef = useRef<RequestDownloadFn | undefined>(requestDownload);

    useEffect(() => {
      previewFnRef.current = requestPreview;
      downloadFnRef.current = requestDownload;
    }, [requestDownload, requestPreview]);

    useEffect(() => {
      return () => {
        localFiles.forEach((file) => {
          if (file.preview?.startsWith("blob:")) URL.revokeObjectURL(file.preview);
          if (file.downloadUrl?.startsWith("blob:")) URL.revokeObjectURL(file.downloadUrl);
        });
        createdUrlsRef.current.forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
      };
    }, [localFiles]);

    const activeServerFiles = useMemo(() => serverFiles.filter((file) => file.ynFlag !== "D"), [serverFiles]);

    const items = useMemo(() => {
      const list: Array<{ source: "server" | "local"; name: string; sizeText: string }> = [];
      const seen = new Set<string>();

      activeServerFiles.forEach((file) => {
        const key = normalizeName(file.name);
        if (seen.has(key)) return;
        seen.add(key);
        list.push({ source: "server", name: file.name, sizeText: "" });
      });

      localFiles.forEach((file) => {
        const key = normalizeName(file.name);
        if (seen.has(key)) return;
        seen.add(key);
        list.push({ source: "local", name: file.name, sizeText: file.formattedSize || "" });
      });

      return list;
    }, [activeServerFiles, localFiles]);

    const showAlert = (message: string) => {
      void Swal.fire({
        icon: "warning",
        text: message,
        confirmButtonText: "확인",
      });
    };

    const handleAcceptedFiles = (files: LocalFile[]) => {
      if (isDisabled || files.length === 0) return;

      const existingNames = new Set([...activeServerFiles.map((file) => normalizeName(file.name)), ...localFiles.map((file) => normalizeName(file.name))]);
      const duplicate = files.find((file) => existingNames.has(normalizeName(file.name)));
      if (duplicate) {
        showAlert(`동일한 파일(${duplicate.name})이 이미 등록되어 있습니다.`);
        return;
      }

      const nextFiles = files.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          downloadUrl: URL.createObjectURL(file),
          formattedSize: formatBytes(file.size),
        })
      );

      const merged = [...localFiles, ...nextFiles];
      setLocalFiles(merged);
      onFileUpload?.((emitMode === "delta" ? nextFiles : merged) as File[]);
    };

    useEffect(() => {
      if (!externalFiles || externalFiles.length === 0) return;
      handleAcceptedFiles(externalFiles as LocalFile[]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalFiles]);

    const removeLocalFile = (name: string) => {
      setLocalFiles((prev) => {
        const target = prev.find((file) => file.name === name);
        if (target?.preview?.startsWith("blob:")) URL.revokeObjectURL(target.preview);
        if (target?.downloadUrl?.startsWith("blob:")) URL.revokeObjectURL(target.downloadUrl);
        return prev.filter((file) => file.name !== name);
      });
      onLocalRemove?.(name);
    };

    const loadServerImagePreview = async (name: string, bust?: boolean) => {
      if (!previewFnRef.current || !seqArticle || !isImageName(name)) return null;
      const blob = await previewFnRef.current({ seqArticle, fileName: name, bust });
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      createdUrlsRef.current.push(url);
      setPreviewUrlMap((prev) => ({ ...prev, [name]: url }));
      return url;
    };

    useEffect(() => {
      setPreviewUrlMap({});
      createdUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      createdUrlsRef.current = [];
    }, [seqArticle, activeServerFiles.map((file) => file.name).join("|")]);

    const openImagePreview = async (name: string, localFile?: LocalFile) => {
      let src = localFile?.preview || previewUrlMap[name] || "";
      if (!src) {
        const loaded = await loadServerImagePreview(name, true);
        src = loaded || "";
      }
      if (!src) {
        showAlert("이미지 미리보기를 불러오지 못했습니다.");
        return;
      }
      setViewer({ open: true, src, name: displayName(name) });
    };

    const extractSheetRows = (buffer: ArrayBuffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0] || "";
      const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
      if (!sheet) return { sheetName: "", rows: [] as string[][] };

      const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | null | undefined)[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });

      const rows = rawRows.slice(0, EXCEL_PREVIEW_MAX_ROWS).map((row) =>
        row.slice(0, EXCEL_PREVIEW_MAX_COLS).map((cell) => (cell == null ? "" : String(cell)))
      );

      return { sheetName, rows };
    };

    const openSpreadsheetPreview = async (name: string, localFile?: LocalFile) => {
      setSheetPreview({
        open: true,
        name: displayName(name),
        sheetName: "",
        rows: [],
        loading: true,
        error: "",
      });

      try {
        let buffer: ArrayBuffer | null = null;
        if (localFile) {
          buffer = await localFile.arrayBuffer();
        } else if (downloadFnRef.current) {
          const blob = await downloadFnRef.current({ seqArticle, fileName: name });
          if (blob) buffer = await blob.arrayBuffer();
        }
        if (!buffer) throw new Error("empty");

        const { sheetName, rows } = extractSheetRows(buffer);
        setSheetPreview({
          open: true,
          name: displayName(name),
          sheetName,
          rows,
          loading: false,
          error: rows.length === 0 ? "미리보기 데이터가 없습니다." : "",
        });
      } catch {
        setSheetPreview({
          open: true,
          name: displayName(name),
          sheetName: "",
          rows: [],
          loading: false,
          error: "엑셀 미리보기를 불러오지 못했습니다.",
        });
      }
    };

    const openFramePreview = async (name: string, localFile?: LocalFile) => {
      setFramePreview({
        open: true,
        name: displayName(name),
        src: "",
        loading: true,
        error: "",
      });

      try {
        let src = localFile?.downloadUrl || "";
        if (!src && previewFnRef.current) {
          const blob = await previewFnRef.current({ seqArticle, fileName: name, bust: true });
          if (blob) {
            src = URL.createObjectURL(blob);
            createdUrlsRef.current.push(src);
          }
        }
        if (!src && downloadFnRef.current) {
          const blob = await downloadFnRef.current({ seqArticle, fileName: name });
          if (blob) {
            src = URL.createObjectURL(blob);
            createdUrlsRef.current.push(src);
          }
        }
        if (!src) throw new Error("empty");

        setFramePreview({
          open: true,
          name: displayName(name),
          src,
          loading: false,
          error: "",
        });
      } catch {
        setFramePreview({
          open: true,
          name: displayName(name),
          src: "",
          loading: false,
          error: "문서 미리보기를 불러오지 못했습니다.",
        });
      }
    };

    const openTextPreview = async (name: string, localFile?: LocalFile) => {
      setTextPreview({
        open: true,
        name: displayName(name),
        text: "",
        loading: true,
        error: "",
      });

      try {
        let text = "";
        if (localFile) {
          text = await localFile.text();
        } else if (downloadFnRef.current) {
          const blob = await downloadFnRef.current({ seqArticle, fileName: name });
          if (blob) {
            text = await blob.text();
          }
        }

        if (!text) {
          throw new Error("empty");
        }

        setTextPreview({
          open: true,
          name: displayName(name),
          text,
          loading: false,
          error: "",
        });
      } catch {
        setTextPreview({
          open: true,
          name: displayName(name),
          text: "",
          loading: false,
          error: "텍스트 미리보기를 불러오지 못했습니다.",
        });
      }
    };

    const downloadFile = async (name: string, localFile?: LocalFile) => {
      if (localFile?.downloadUrl) {
        const link = document.createElement("a");
        link.href = localFile.downloadUrl;
        link.download = displayName(name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (downloadFnRef.current) {
        const blob = await downloadFnRef.current({ seqArticle, fileName: name });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = displayName(name);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          return;
        }
      }

      onFileDownload?.(name);
    };

    const handlePreview = async (name: string, source: "server" | "local") => {
      const localFile = source === "local" ? localFiles.find((file) => file.name === name) : undefined;

      if (isImageName(name)) {
        await openImagePreview(name, localFile);
        return;
      }

      if (isSpreadsheetName(name)) {
        await openSpreadsheetPreview(name, localFile);
        return;
      }

      if (isPdfName(name)) {
        await openFramePreview(name, localFile);
        return;
      }

      if (isTextName(name)) {
        await openTextPreview(name, localFile);
        return;
      }

      if (isOfficeLikeName(name)) {
        showAlert("워드, 한글, PPT 파일은 브라우저에서 바로 미리보기 지원이 어려워 다운로드 후 확인이 필요합니다.");
        return;
      }

      showAlert("해당 파일 형식은 미리보기를 지원하지 않습니다.");
    };

    return (
      <>
        <div className="srs-file-list-uploader">
          {allowUpload ? (
            <Dropzone multiple onDrop={(accepted) => handleAcceptedFiles(accepted as LocalFile[])} disabled={isDisabled}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                  {...getRootProps()}
                  className={`srs-file-dropzone ${isDragActive ? "dragging" : ""} ${isDisabled ? "disabled" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="srs-file-dropzone__icon">+</div>
                  <div className="srs-file-dropzone__text">
                    <strong>파일업로드</strong>
                    <span>파일을 드래그하거나 클릭해서 여러 개를 한 번에 추가하세요.</span>
                  </div>
                </div>
              )}
            </Dropzone>
          ) : null}

          <div className="srs-file-list-table-wrap">
            <table className="srs-file-list-table">
              <thead>
                <tr>
                  <th>파일명</th>
                  <th style={{ width: "120px" }}>크기</th>
                  <th style={{ width: "270px" }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">
                      등록된 파일이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const localFile = item.source === "local" ? localFiles.find((file) => file.name === item.name) : undefined;
                    return (
                      <tr key={`${item.source}-${item.name}`}>
                        <td className="file-name" title={displayName(item.name)}>
                          <div className="srs-file-name-wrap">
                            <span className={`srs-file-type-badge ${getFileTypeText(item.name)}`}>{getFileTypeText(item.name)}</span>
                            <span className="srs-file-name-text">{displayName(item.name)}</span>
                          </div>
                        </td>
                        <td>{item.sizeText || "-"}</td>
                        <td>
                          <div className="srs-file-actions">
                            <button type="button" onClick={() => void handlePreview(item.name, item.source)}>
                              미리보기
                            </button>
                            <button type="button" onClick={() => void downloadFile(item.name, localFile)}>
                              다운로드
                            </button>
                            {allowDelete ? (
                              <button
                                type="button"
                                className="danger"
                                onClick={() => (item.source === "local" ? removeLocalFile(item.name) : onMarkDelete?.(item.name))}
                              >
                                삭제
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <LightboxPreview open={viewer.open} src={viewer.src} name={viewer.name} onClose={() => setViewer({ open: false, src: "", name: "" })} />

        <Modal show={sheetPreview.open} onHide={() => setSheetPreview(createEmptySpreadsheetPreview())} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>{sheetPreview.name || "엑셀 미리보기"}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
            {sheetPreview.loading ? (
              <div className="srs-file-preview-empty">엑셀을 불러오는 중입니다...</div>
            ) : sheetPreview.error ? (
              <div className="srs-file-preview-empty">{sheetPreview.error}</div>
            ) : (
              <>
                <div className="srs-sheet-header">
                  <span>SHEET</span>
                  <strong>{sheetPreview.sheetName || "-"}</strong>
                </div>
                <Table bordered hover responsive size="sm">
                  <tbody>
                    {sheetPreview.rows.map((row, rowIndex) => (
                      <tr key={`sheet-row-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`sheet-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </Modal.Body>
        </Modal>

        <Modal show={framePreview.open} onHide={() => setFramePreview(createEmptyFramePreview())} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>{framePreview.name || "문서 미리보기"}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ minHeight: "70vh", background: "#f5f7fb" }}>
            {framePreview.loading ? (
              <div className="srs-file-preview-empty">문서를 불러오는 중입니다...</div>
            ) : framePreview.error ? (
              <div className="srs-file-preview-empty">{framePreview.error}</div>
            ) : framePreview.src ? (
              <iframe title={framePreview.name} src={framePreview.src} style={{ width: "100%", minHeight: "68vh", border: 0 }} />
            ) : (
              <div className="srs-file-preview-empty">브라우저에서 미리보기를 지원하지 않는 문서입니다.</div>
            )}
          </Modal.Body>
        </Modal>

        <Modal show={textPreview.open} onHide={() => setTextPreview(createEmptyTextPreview())} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{textPreview.name || "텍스트 미리보기"}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflow: "auto", background: "#f8fafc" }}>
            {textPreview.loading ? (
              <div className="srs-file-preview-empty">텍스트를 불러오는 중입니다...</div>
            ) : textPreview.error ? (
              <div className="srs-file-preview-empty">{textPreview.error}</div>
            ) : (
              <pre className="srs-text-preview">{textPreview.text}</pre>
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
);

SrsFileListUploader.displayName = "SrsFileListUploader";

export default SrsFileListUploader;
