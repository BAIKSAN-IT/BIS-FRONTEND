// useReportPopupBridge.ts (간단 훅으로 만들어 재사용 권장)
import { useEffect } from "react";
const ORIGIN = window.location.origin;

type OnDownload = (docType: "pdf" | "excel" | "word", context: any) => Promise<{ url: string; filename: string }>;

export default function useReportPopupBridge(
  getInitial: () => { blobUrl: string; params: any },
  onDownload: OnDownload
) {
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.origin !== ORIGIN) return;
      const win = e.source as Window | null;
      if (!win) return;

      const { type, docType, context } = e.data || {};

      // 팝업이 READY면 초기 데이터 전달
      if (type === "REPORT_VIEWER_READY") {
        const { blobUrl, params } = getInitial();
        win.postMessage({ type: "REPORT_VIEWER_DATA", blobUrl, params }, ORIGIN);
        return;
      }

      // 팝업에서 다운로드 요청
      if (type === "REPORT_DOWNLOAD_REQUEST" && docType) {
        try {
          const { url, filename } = await onDownload(docType, context);
          win.postMessage({ type: "REPORT_DOWNLOAD_URL", url, filename }, ORIGIN);
        } catch (err) {
          console.error(err);
          win.postMessage({ type: "REPORT_DOWNLOAD_URL", url: "", filename: "" }, ORIGIN);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [getInitial, onDownload]);
}
