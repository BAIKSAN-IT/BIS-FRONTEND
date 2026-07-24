import React, { useEffect, useMemo, useRef, useState } from "react";
import RecapHeader from "./RecapHeader";

import FabricList from "./FabricList";
import RecapListRegisterView from "./RecapListRegisterView";
import RecapListView from "./RecapListView";

const RECAP_LABEL_MAP: Record<string, string> = {
  all: "FABRIC LIST",
  recap: "RECAP",
  recapListView: "RECAP LIST",
};

type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const Recap: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("recap");

  const childRef = useRef<RecapChildAPI | null>(null);

  const bcActiveLabel = useMemo(() => RECAP_LABEL_MAP[currentTab] || "", [currentTab]);

  const onSearch = () => childRef.current?.onSearch?.();
  const onNew = () => childRef.current?.onNew?.();
  const onSave = () => childRef.current?.onSave?.();
  const onDelete = () => childRef.current?.onDelete?.();
  const onExcel = () => childRef.current?.onExcel?.();
  const onPrint = () => childRef.current?.onPrint?.();

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e?.data?.type === "SWITCH_TAB") {
        const nextTab = e.data?.tab as string;
        if (nextTab) {
          setCurrentTab(nextTab);
          // (선택) 레이아웃 리플로우가 필요한 경우
          // setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      <RecapHeader
        pageNm="RND"
        pageUrl=""
        breadCrumbItems={[
          { label: "RECAP", path: "/fabric/recap" },
          { label: bcActiveLabel, path: "/fabric/recap", active: true },
        ]}
        activeTab={currentTab}
        onChangeTab={setCurrentTab}
        onSearchButtonClick={onSearch}
        onNewButtonClick={onNew}
        onSaveButtonClick={onSave}
        onDeleteButtonClick={onDelete}
        onExcelDownloadClick={onExcel}
        onPrintButtonClick={onPrint}
      />

      {currentTab === "all" && <FabricList ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />}
      {currentTab === "recap" && (
        <RecapListRegisterView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
      {currentTab === "recapListView" && (
        <RecapListView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
    </>
  );
};

export default Recap;
