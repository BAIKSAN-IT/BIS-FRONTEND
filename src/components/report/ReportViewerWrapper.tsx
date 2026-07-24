import React, { useEffect, useState, useCallback } from "react";
import ReportViewer from "./ReportViewer";

const ReportViewerWrapper = () => {
  const [blobUrl, setBlobUrl] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});

  // opener에게 "READY" 알림
  useEffect(() => {
    try {
      window.opener?.postMessage({ type: "REPORT_VIEWER_READY" }, window.location.origin);
    } catch (e) {
      // opener가 없을 수도 있으므로 무시
    }
  }, []);

  //  부모로부터 DATA 수신
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, blobUrl, params } = event.data || {};
      if (type === "REPORT_VIEWER_DATA" && blobUrl) {
        setBlobUrl(blobUrl);
        setParams(params || {});
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return <ReportViewer blobUrl={blobUrl} params={params} />;
};

export default ReportViewerWrapper;
