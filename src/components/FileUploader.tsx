// FileUploader.tsx
import React, { memo, useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Dropzone from "react-dropzone";

/* lb */
import Swal from "sweetalert2";

interface FileType extends File {
  preview?: string;
  formattedSize?: string;
  downloadUrl?: string;
}

interface Props {
  onFileUpload?: (files: File[]) => void;
  onFileRemove?: (fileName: string) => void;
  onFileDownload?: (fileName: string) => void;
  showPreview?: boolean;
  isDisabled?: boolean;
  initialFiles?: { name: string }[];
  emitMode?: "all" | "delta";
}
const FileUploader = memo(
  ({
    onFileUpload,
    onFileRemove,
    onFileDownload,
    showPreview = true,
    isDisabled = false,
    initialFiles = [],
    emitMode = "all",
  }: Props) => {
    // 1) 확장자별 색상·레이블 맵
    const getFileTypeStyle = (name: string) => {
      const ext = name.split(".").pop()?.toLowerCase() || "";
      const colorMap: Record<string, string> = {
        pdf: "#E53E3E",
        xls: "#2F855A",
        xlsx: "#2F855A",
        ppt: "#E53E3E",
        pptx: "#E53E3E",
        doc: "#3182CE",
        docx: "#3182CE",
      };
      const labelMap: Record<string, string> = {
        pdf: "PDF",
        xls: "XLS",
        xlsx: "XLSX",
        ppt: "PPT",
        pptx: "PPT",
        doc: "DOC",
        docx: "DOC",
      };
      return {
        background: colorMap[ext] || "#718096",
        label: labelMap[ext] || ext.toUpperCase() || "FILE",
      };
    };
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

    const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);

    const formatBytes = (bytes: number, decimals: number = 2) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024,
        dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const handleAcceptedFiles = (files: FileType[]) => {
      if (isDisabled) return;

      // 1. 파일명 길이 체크
      if (files.some((file) => file.name.length > 100)) {
        showAlert("파일명은 100자를 넘길 수 없습니다.");
        return;
      }

      // 2. 파일 개수 체크
      const spaceLeft = 5 - selectedFiles.length;
      if (files.length > spaceLeft) {
        showAlert("파일은 최대 5개까지만 업로드할 수 있습니다.");
        return;
      }

      const duplicateFiles = files.filter((f) => selectedFiles.some((s) => s.name === f.name));

      const handleAddFiles = (finalFiles: FileType[]) => {
        const newFiles = finalFiles.map((f) => {
          const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
          return Object.assign(f, {
            preview,
            downloadUrl: URL.createObjectURL(f),
            formattedSize: formatBytes(f.size),
          });
        });

        const remainingFiles = selectedFiles.filter((existing) => !newFiles.some((f) => f.name === existing.name));

        const all = [...remainingFiles, ...newFiles];
        setSelectedFiles(all);
        if (emitMode === "delta") {
          onFileUpload?.(newFiles as File[]);
        } else {
          onFileUpload?.(all as File[]);
        }
      };

      // 3. 중복 파일 존재 시 확인창
      if (duplicateFiles.length > 0) {
        showAlert("이미 같은 파일이 존재합니다. 파일명을 변경해서 다시 업로드를 해주세요.");
        return;
      } else {
        handleAddFiles(files);
      }
    };

    const removeFile = (idx: number) => {
      if (isDisabled) return;
      const copy = [...selectedFiles];
      copy.splice(idx, 1);
      setSelectedFiles(copy);
      onFileUpload?.(copy);
    };

    useEffect(() => {
      const initialized = initialFiles.map((f) => ({
        name: f.name,
        type: "custom",
        size: 0,
        downloadUrl: "",
        formattedSize: "",
      }));
      setSelectedFiles(initialized as FileType[]);
    }, [initialFiles]);
    return (
      <>
        {/* 1) Dropzone 영역 숨기기 */}
        {!isDisabled && (
          <Dropzone disabled={isDisabled} onDrop={(accepted) => handleAcceptedFiles(accepted as FileType[])}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #ccc",
                  borderRadius: 4,
                  padding: 15,
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 0,
                  height: "6%",
                }}
              >
                <input {...getInputProps()} />
                <i
                  className="dripicons-cloud-upload"
                  style={{ fontSize: 16, color: "#888", transform: "translateY(2px)" }}
                />
                <span style={{ fontSize: 15, color: "#555" }}>
                  Drop files here or click to upload. ({selectedFiles.length}/5)
                </span>
              </div>
            )}
          </Dropzone>
        )}

        {/* 2) Preview 영역 */}
        {showPreview && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 10,
              marginTop: 10,
            }}
          >
            {selectedFiles.map((f, i) => {
              const { background: iconBg, label } = getFileTypeStyle(f.name);

              return (
                <Card
                  key={i}
                  style={{
                    position: "relative",
                    border: "1px solid #ddd",
                    padding: 5,
                    height: 100,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {!isDisabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const fileToRemove = selectedFiles[i];
                        removeFile(i);
                        if (fileToRemove && onFileRemove) onFileRemove(fileToRemove.name);
                      }}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 24,
                        height: 24,
                        padding: 0,
                        border: "none",
                        background: "rgba(0,0,0,0.1)",
                        color: "#333",
                        fontSize: 16,
                        lineHeight: "24px",
                        textAlign: "center",
                        borderRadius: 12,
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                  )}

                  <Row style={{ margin: 0, alignItems: "center", height: "100%" }}>
                    <Col style={{ flex: "0 0 auto" }}>
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.name}
                          style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 4,
                            background: iconBg,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          {label}
                        </div>
                      )}
                    </Col>
                    <Col style={{ paddingLeft: 5, flex: 1, overflow: "hidden" }}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onFileDownload?.(f.name);
                        }}
                        download={f.name}
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "#555",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {f.name}
                      </a>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "#999" }}>{f.formattedSize}</p>
                    </Col>
                  </Row>
                </Card>
              );
            })}

            {/* 빈 슬롯 (최대 5개) */}
            {Array.from({ length: 5 - selectedFiles.length }).map((_, idx) => (
              <div key={"empty" + idx} style={{ border: "1px dashed transparent", height: 100 }} />
            ))}
          </div>
        )}
      </>
    );
  }
);

export default FileUploader;
