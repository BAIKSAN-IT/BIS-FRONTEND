// ReportViewer.tsx (API 호출 제거 버전)
import React, { useCallback, useEffect } from "react";
import pdfIcon from "../../../src/assets/images/pdfIcon.png";
import excelIcon from "../../../src/assets/images/excelIcon.png";
import wordIcon from "../../../src/assets/images/wordIcon.png";
import ButtonComponent from "../common/ButtonComponent";
import { useTranslation } from "react-i18next";

interface ReportViewerProps {
  blobUrl: string; // 부모가 전달한 PDF 미리보기 blob URL
  params: Record<string, any>; // 부모가 전달한 컨텍스트(보고서 타입/검색조건 등)
}

type DocType = "pdf" | "excel" | "word";

const ORIGIN = window.location.origin;

const ReportViewer: React.FC<ReportViewerProps> = ({ blobUrl, params }) => {
  const { t } = useTranslation();

  // 부모가 보내준 "다운로드 URL" 수신 → 이 창에서 실제 다운로드 실행
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== ORIGIN) return;
      const { type, url, filename } = e.data || {};
      if (type === "REPORT_DOWNLOAD_URL" && url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "report";
        document.body.appendChild(a);
        a.click();
        a.remove();
        // URL.revokeObjectURL(url)는 부모가 적절한 타이밍에 처리
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // 다운로드 “요청”만 부모(opener)에게 보냄 (부모가 API 호출/Blob 생성/URL 회신)
  const requestDownload = useCallback(
    (docType: DocType) => {
      if (!window.opener) {
        alert("다운로드 요청을 보낼 부모 창이 없습니다.");
        return;
      }
      window.opener.postMessage({ type: "REPORT_DOWNLOAD_REQUEST", docType, context: params }, ORIGIN);
    },
    [params]
  );

  // 미리보기는 PDF만
  const isPdf = (params?.docType ?? "pdf") === "pdf";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 버튼 영역 */}
      <div className="print-modal-div-button-class">
        <button onClick={() => requestDownload("pdf")} className="print-modal-down-button" title="PDF 다운로드">
          <img src={pdfIcon} alt="PDF" className="print-modal-pdf-icon" />
        </button>

        <button onClick={() => requestDownload("excel")} className="print-modal-down-button" title="Excel 다운로드">
          <img src={excelIcon} alt="Excel" className="print-modal-excel-icon" />
        </button>

        <button onClick={() => requestDownload("word")} className="print-modal-down-button" title="Word 다운로드">
          <img src={wordIcon} alt="Word" className="print-modal-word-icon" />
        </button>

        <ButtonComponent
          type="button"
          className="print-modal-close-button"
          iClassName="fe-x"
          txt={t("common.close.btn")}
          onClick={() => window.close()}
        />
      </div>

      {/* PDF 미리보기(iframe) */}
      {isPdf ? (
        blobUrl ? (
          <iframe src={blobUrl} title="PDF Viewer" style={{ width: "100%", height: "100%", border: "none" }} />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            로딩 중...
          </div>
        )
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
          선택한 문서는 미리보기가 제공되지 않습니다. (다운로드로 확인하세요)
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
