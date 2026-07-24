import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Card, Modal, Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import LightboxPreview from "../components/LightboxPreview";

interface LocalFile extends File {
  preview?: string | null;
  formattedSize?: string;
  downloadUrl?: string;
}

export interface ServerFile {
  name: string;
  ynFlag?: string;
}

type RequestPreviewFn = (arg: { seqArticle: string; fileName: string; bust?: boolean }) => Promise<Blob | null>;
type RequestDownloadFn = (arg: { seqArticle: string; fileName: string }) => Promise<Blob | null>;

interface Props {
  seqArticle: string;
  serverFiles: ServerFile[];
  requestPreview?: RequestPreviewFn;
  requestDownload?: RequestDownloadFn;
  onMarkDelete?: (name: string) => void;
  onLocalRemove?: (name: string) => void;
  onFileUpload?: (files: File[]) => void;
  onFileDownload?: (name: string) => void;
  showPreview?: boolean;
  isDisabled?: boolean;
  allowDelete?: boolean;
  allowUpload?: boolean;
  emitMode?: "all" | "delta";
  cardRepeat?: string;
  externalFiles?: File[];
}

const MAX_FILES = 3;
const EXCEL_PREVIEW_MAX_ROWS = 50;
const EXCEL_PREVIEW_MAX_COLS = 20;

type SpreadsheetPreviewState = {
  open: boolean;
  name: string;
  sheetName: string;
  rows: string[][];
  loading: boolean;
  error: string;
};

type PdfPreviewState = {
  open: boolean;
  name: string;
  src: string;
  loading: boolean;
  error: string;
};

const createEmptySpreadsheetPreview = (): SpreadsheetPreviewState => ({
  open: false,
  name: "",
  sheetName: "",
  rows: [],
  loading: false,
  error: "",
});

const createEmptyPdfPreview = (): PdfPreviewState => ({
  open: false,
  name: "",
  src: "",
  loading: false,
  error: "",
});

const getFileBadge = (name: string) => {
  if (/\.(xlsx|xls|csv)$/i.test(name)) {
    return {
      label: "XLS",
      subLabel: "Spreadsheet",
      icon: "▦",
      background: "linear-gradient(135deg, #0f9d58 0%, #34a853 100%)",
      color: "#ffffff",
      shadow: "0 14px 28px rgba(15, 157, 88, 0.28)",
      title: "클릭하여 엑셀 미리보기",
      interactive: true,
    };
  }

  if (/\.pdf$/i.test(name)) {
    return {
      label: "PDF",
      subLabel: "Document",
      icon: "▤",
      background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      color: "#ffffff",
      shadow: "0 14px 28px rgba(239, 68, 68, 0.24)",
      title: "클릭하여 PDF 미리보기",
      interactive: true,
    };
  }

  return {
    label: "FILE",
    subLabel: "Download",
    icon: "▣",
    background: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
    color: "#ffffff",
    shadow: "0 14px 28px rgba(100, 116, 139, 0.22)",
    title: "다운로드 버튼으로 저장",
    interactive: false,
  };
};

const FilePreviewUploader = memo(
  ({
    seqArticle,
    serverFiles = [],
    requestPreview,
    requestDownload,
    onMarkDelete,
    onLocalRemove,
    onFileUpload,
    onFileDownload,
    showPreview = true,
    isDisabled = false,
    allowDelete = true,
    allowUpload = true,
    emitMode = "all",
    cardRepeat = "3",
    externalFiles,
  }: Props) => {
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [previewUrlMap, setPreviewUrlMap] = useState<Record<string, string>>({});
    const [previewLoadingMap, setPreviewLoadingMap] = useState<Record<string, boolean>>({});
    const [viewer, setViewer] = useState({ open: false, src: "", name: "" });
    const [sheetPreview, setSheetPreview] = useState<SpreadsheetPreviewState>(createEmptySpreadsheetPreview());
    const [pdfPreview, setPdfPreview] = useState<PdfPreviewState>(createEmptyPdfPreview());

    const previewFnRef = useRef<RequestPreviewFn | undefined>(requestPreview);
    const downloadFnRef = useRef<RequestDownloadFn | undefined>(requestDownload);
    const createdUrlsRef = useRef<string[]>([]);
    const bustTriedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
      previewFnRef.current = requestPreview;
    }, [requestPreview]);

    useEffect(() => {
      downloadFnRef.current = requestDownload;
    }, [requestDownload]);

    const isImageName = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
    const isSpreadsheetName = (name: string) => /\.(xlsx|xls|csv)$/i.test(name);
    const isPdfName = (name: string) => /\.pdf$/i.test(name);
    const normalize = (name: string) => (name || "").split("/").pop()!.toLowerCase();
    const displayName = (name: string) => name.split("/").pop() || name;

    const showAlert = (message: string) => {
      void Swal.fire({
        text: message,
        confirmButtonText: "OK",
        customClass: {
          popup: "small-swal-popup",
          confirmButton: "small-swal-button",
        },
      });
    };

    const formatBytes = (bytes: number, decimals = 1) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
    };

    const clearObjectUrls = () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        } catch {}
      });
      createdUrlsRef.current = [];
    };

    useEffect(() => {
      return () => {
        localFiles.forEach((file) => {
          if (file.preview?.startsWith("blob:")) URL.revokeObjectURL(file.preview);
          if (file.downloadUrl?.startsWith("blob:")) URL.revokeObjectURL(file.downloadUrl);
        });
        clearObjectUrls();
      };
    }, [localFiles]);

    const serverFileNamesKey = useMemo(
      () =>
        serverFiles
          .filter((file) => file.ynFlag !== "D")
          .map((file) => file.name)
          .sort()
          .join("|"),
      [serverFiles]
    );

    const loadServerPreview = async (name: string, bust?: boolean) => {
      if (!previewFnRef.current || !seqArticle || !isImageName(name)) return null;

      setPreviewLoadingMap((prev) => ({ ...prev, [name]: true }));
      try {
        const blob = await previewFnRef.current({ seqArticle, fileName: name, bust });
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        createdUrlsRef.current.push(url);
        setPreviewUrlMap((prev) => ({ ...prev, [name]: url }));
        return url;
      } catch {
        return null;
      } finally {
        setPreviewLoadingMap((prev) => ({ ...prev, [name]: false }));
      }
    };

    useEffect(() => {
      if (!seqArticle) return;

      setPreviewUrlMap({});
      setPreviewLoadingMap({});
      clearObjectUrls();
      bustTriedRef.current.clear();

      serverFiles
        .filter((file) => file.ynFlag !== "D" && isImageName(file.name))
        .forEach((file) => void loadServerPreview(file.name));
    }, [seqArticle, serverFileNamesKey]);

    const openImagePreview = async (name: string, localPreview: string | null) => {
      if (!showPreview || !isImageName(name)) return;

      let src: string | null = localPreview || previewUrlMap[name] || null;
      if (!src) {
        src = await loadServerPreview(name, true);
      }
      if (!src) return;

      setViewer({ open: true, src, name });
    };

    const extractSheetRows = (buffer: ArrayBuffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0] || "";
      const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

      if (!firstSheet) {
        return { sheetName: "", rows: [] as string[][] };
      }

      const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | null | undefined)[]>(firstSheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });

      const rows = rawRows.slice(0, EXCEL_PREVIEW_MAX_ROWS).map((row) =>
        row.slice(0, EXCEL_PREVIEW_MAX_COLS).map((cell) => (cell == null ? "" : String(cell)))
      );

      return { sheetName: firstSheetName, rows };
    };

    const openSpreadsheetPreview = async (name: string, localFile?: LocalFile) => {
      if (!isSpreadsheetName(name)) return;

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

        if (!buffer) throw new Error("spreadsheet-preview-unavailable");

        const { sheetName, rows } = extractSheetRows(buffer);
        setSheetPreview({
          open: true,
          name: displayName(name),
          sheetName,
          rows,
          loading: false,
          error: rows.length === 0 ? "미리보기할 데이터가 없습니다." : "",
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

    const openPdfPreview = async (name: string, localFile?: LocalFile) => {
      if (!isPdfName(name)) return;

      setPdfPreview({
        open: true,
        name: displayName(name),
        src: "",
        loading: true,
        error: "",
      });

      try {
        let url = localFile?.downloadUrl || "";

        if (!url && downloadFnRef.current) {
          const blob = await downloadFnRef.current({ seqArticle, fileName: name });
          if (blob) {
            url = URL.createObjectURL(blob);
            createdUrlsRef.current.push(url);
          }
        }

        if (!url) throw new Error("pdf-preview-unavailable");

        setPdfPreview({
          open: true,
          name: displayName(name),
          src: url,
          loading: false,
          error: "",
        });
      } catch {
        setPdfPreview({
          open: true,
          name: displayName(name),
          src: "",
          loading: false,
          error: "PDF 미리보기를 불러오지 못했습니다.",
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

    const handleAcceptedFiles = (files: LocalFile[]) => {
      if (isDisabled) return;

      if (files.some((file) => file.name.length > 100)) {
        showAlert("파일명은 100자리를 넘길 수 없습니다.");
        return;
      }

      const activeServerCount = serverFiles.filter((file) => file.ynFlag !== "D").length;
      const nextTotal = activeServerCount + localFiles.length + files.length;
      if (nextTotal > MAX_FILES) {
        showAlert(`파일은 최대 ${MAX_FILES}개까지 업로드할 수 있습니다.`);
        return;
      }

      const existingNames = new Set([
        ...serverFiles.filter((file) => file.ynFlag !== "D").map((file) => normalize(file.name)),
        ...localFiles.map((file) => normalize(file.name)),
      ]);

      if (files.some((file) => existingNames.has(normalize(file.name)))) {
        showAlert("같은 이름의 파일이 이미 등록되어 있습니다.");
        return;
      }

      const newFiles = files.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          downloadUrl: URL.createObjectURL(file),
          formattedSize: formatBytes(file.size),
        })
      );

      const next = [...localFiles, ...newFiles];
      setLocalFiles(next);
      emitMode === "delta" ? onFileUpload?.(newFiles as File[]) : onFileUpload?.(next as File[]);
    };

    const removeLocal = (name: string) => {
      setLocalFiles((prev) => {
        const target = prev.find((file) => file.name === name);
        if (target?.preview?.startsWith("blob:")) URL.revokeObjectURL(target.preview);
        if (target?.downloadUrl?.startsWith("blob:")) URL.revokeObjectURL(target.downloadUrl);
        return prev.filter((file) => file.name !== name);
      });
      onLocalRemove?.(name);
    };

    const itemsToRender = useMemo(() => {
      const seen = new Set<string>();
      const items: Array<{ from: "local" | "server"; name: string }> = [];

      localFiles.forEach((file) => {
        const normalized = normalize(file.name);
        if (seen.has(normalized)) return;
        items.push({ from: "local", name: file.name });
        seen.add(normalized);
      });

      serverFiles.forEach((file) => {
        if (file.ynFlag === "D") return;
        const normalized = normalize(file.name);
        if (seen.has(normalized)) return;
        items.push({ from: "server", name: file.name });
        seen.add(normalized);
      });

      return items;
    }, [localFiles, serverFiles]);

    useEffect(() => {
      if (!externalFiles || externalFiles.length === 0) return;
      handleAcceptedFiles(externalFiles as LocalFile[]);
    }, [externalFiles]);

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cardRepeat}, minmax(0, 1fr))`, gap: 12 }}>
          {itemsToRender.slice(0, MAX_FILES).map(({ from, name }) => {
            const isLocal = from === "local";
            const localFile = isLocal
              ? localFiles.find((file) => file.name.toLowerCase() === name.toLowerCase())
              : undefined;
            const isImage = isImageName(name);
            const badge = getFileBadge(name);
            const src = isLocal ? localFile?.preview || "" : previewUrlMap[name] || "";
            const previewLoading = previewLoadingMap[name];

            return (
              <Card
                key={`${from}-${name}`}
                style={{
                  position: "relative",
                  height: 148,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #D8E0EA",
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                }}
              >
                {allowDelete ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      isLocal ? removeLocal(name) : onMarkDelete?.(name);
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 26,
                      height: 26,
                      border: "none",
                      borderRadius: 13,
                      background: "rgba(255,255,255,0.95)",
                      color: "#334155",
                      fontSize: 16,
                      lineHeight: "26px",
                      textAlign: "center",
                      cursor: "pointer",
                      zIndex: 3,
                      boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                    }}
                    title="삭제"
                  >
                    ×
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void downloadFile(name, localFile);
                  }}
                  title="다운로드"
                  style={{
                    position: "absolute",
                    left: 8,
                    bottom: 8,
                    border: "none",
                    borderRadius: 999,
                    padding: "5px 10px",
                    background: "rgba(15,23,42,0.76)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    zIndex: 3,
                  }}
                >
                  Download
                </button>

                {isImage ? (
                  <button
                    type="button"
                    onClick={() => void openImagePreview(name, localFile?.preview ?? null)}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      padding: 0,
                      background: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "zoom-in",
                    }}
                    title="클릭하여 이미지 미리보기"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={displayName(name)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={async () => {
                          if (isLocal || !seqArticle || bustTriedRef.current.has(name)) return;
                          bustTriedRef.current.add(name);
                          await loadServerPreview(name, true);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          color: "#64748B",
                          fontSize: 12,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 16,
                            background: "linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                          }}
                        >
                          IMG
                        </div>
                        <span>{previewLoading ? "이미지 불러오는 중..." : "클릭하여 확대 보기"}</span>
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpreadsheetName(name)) {
                        void openSpreadsheetPreview(name, localFile);
                      } else if (isPdfName(name)) {
                        void openPdfPreview(name, localFile);
                      }
                    }}
                    style={{
                      width: 102,
                      height: 102,
                      border: "none",
                      borderRadius: 22,
                      padding: 0,
                      background: badge.background,
                      color: badge.color,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: badge.shadow,
                      userSelect: "none",
                      cursor: badge.interactive ? "zoom-in" : "default",
                    }}
                    title={badge.title}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.92 }}>{badge.icon}</span>
                    <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 6 }}>{badge.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.88, marginTop: 4 }}>{badge.subLabel}</span>
                  </button>
                )}

                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "6px 10px 34px",
                    background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.82) 100%)",
                    color: "#fff",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    pointerEvents: "none",
                  }}
                  title={displayName(name)}
                >
                  {displayName(name)}
                </div>
                {localFile?.formattedSize ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      padding: "3px 7px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.94)",
                      color: "#475569",
                      fontSize: 10,
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                    title={localFile.formattedSize}
                  >
                    {localFile.formattedSize}
                  </div>
                ) : null}
              </Card>
            );
          })}

          {allowUpload
            ? Array.from({ length: Math.max(0, MAX_FILES - itemsToRender.length) }).map((_, index) => (
                <Dropzone
                  key={`empty-${index}`}
                  multiple={false}
                  onDrop={(accepted) => {
                    handleAcceptedFiles(accepted as LocalFile[]);
                  }}
                  disabled={isDisabled}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      style={{
                        border: "2px dashed #CBD5E1",
                        borderRadius: 14,
                        height: 108,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDragActive ? "#F8FAFC" : "#fff",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                      title="클릭하거나 드래그해서 파일 업로드"
                    >
                      <input {...getInputProps()} />
                      <div
                        style={{
                          width: 102,
                          height: 102,
                          borderRadius: 22,
                          background: "linear-gradient(135deg, #edf2f7 0%, #dbe7f4 100%)",
                          color: "#64748B",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.25)",
                          userSelect: "none",
                        }}
                      >
                        <span style={{ fontSize: 24, lineHeight: 1 }}>＋</span>
                        <span style={{ marginTop: 8, fontSize: 12, fontWeight: 800 }}>UPLOAD</span>
                      </div>
                    </div>
                  )}
                </Dropzone>
              ))
            : null}
        </div>

        <LightboxPreview
          open={viewer.open}
          src={viewer.src}
          name={viewer.name}
          onClose={() => setViewer({ open: false, src: "", name: "" })}
        />

        <Modal show={sheetPreview.open} onHide={() => setSheetPreview(createEmptySpreadsheetPreview())} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>{sheetPreview.name || "엑셀 미리보기"}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
            {sheetPreview.loading ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "#64748B" }}>엑셀을 불러오는 중입니다...</div>
            ) : sheetPreview.error ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "#64748B" }}>{sheetPreview.error}</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 52,
                      height: 28,
                      padding: "0 10px",
                      borderRadius: 999,
                      background: "#DCFCE7",
                      color: "#166534",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    SHEET
                  </span>
                  <span style={{ color: "#0F172A", fontSize: 14, fontWeight: 700 }}>
                    {sheetPreview.sheetName || "첫 번째 시트"}
                  </span>
                </div>
                <div style={{ color: "#64748B", fontSize: 12, marginBottom: 12 }}>
                  최대 {EXCEL_PREVIEW_MAX_ROWS}행, {EXCEL_PREVIEW_MAX_COLS}열까지 표시합니다.
                </div>
                <Table bordered hover size="sm" responsive style={{ marginBottom: 0 }}>
                  <tbody>
                    {sheetPreview.rows.map((row, rowIndex) => (
                      <tr key={`preview-row-${rowIndex}`}>
                        {row.map((cell, colIndex) => (
                          <td
                            key={`preview-cell-${rowIndex}-${colIndex}`}
                            style={{
                              minWidth: 120,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              backgroundColor: rowIndex === 0 ? "#F8FAFC" : "#fff",
                              fontWeight: rowIndex === 0 ? 700 : 400,
                            }}
                          >
                            {cell || "\u00A0"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </Modal.Body>
        </Modal>

        <Modal show={pdfPreview.open} onHide={() => setPdfPreview(createEmptyPdfPreview())} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>{pdfPreview.name || "PDF 미리보기"}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "75vh", padding: 0, background: "#F8FAFC" }}>
            {pdfPreview.loading ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "#64748B" }}>PDF를 불러오는 중입니다...</div>
            ) : pdfPreview.error ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "#64748B" }}>{pdfPreview.error}</div>
            ) : (
              <iframe title={pdfPreview.name} src={pdfPreview.src} style={{ width: "100%", height: "100%", border: "none" }} />
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
);

export default FilePreviewUploader;
