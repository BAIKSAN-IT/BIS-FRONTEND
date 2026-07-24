import React, { useEffect, useMemo, useRef, useState } from "react";
import ReturnHeader from "./ReturnHeader";
import ReturnListRegisterView from "./ReturnListRegisterView";
import ReturnListView from "./ReturnListView";

const RECAP_LABEL_MAP: Record<string, string> = {
  return: "RETURN",
  returnListView: "RETURN LIST",
};

type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const Return: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("return");

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
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      <ReturnHeader
        pageNm="RND"
        pageUrl=""
        breadCrumbItems={[
          { label: "RETURN", path: "/fabric/return" },
          { label: bcActiveLabel, path: "/fabric/return", active: true },
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
      {currentTab === "return" && (
        <ReturnListRegisterView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
      {currentTab === "returnListView" && (
        <ReturnListView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
    </>
  );
};

export default Return;
