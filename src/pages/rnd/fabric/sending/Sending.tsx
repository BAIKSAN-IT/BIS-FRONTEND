import React, { useEffect, useMemo, useRef, useState } from "react";
import SendingHeader from "./SendingHeader";

import FabricList from "./FabricList";
import SendingListRegisterView from "./SendingListRegisterView";
import SendingListView from "./SendingListView";

const RECAP_LABEL_MAP: Record<string, string> = {
  all: "FABRIC LIST",
  sending: "SENDING",
  sendingListView: "SENDING LIST",
};

type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const Sending: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("sending");

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
      <SendingHeader
        pageNm="RND"
        pageUrl=""
        breadCrumbItems={[
          { label: "SENDING", path: "/fabric/Sending" },
          { label: bcActiveLabel, path: "/fabric/Sending", active: true },
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
      {currentTab === "sending" && (
        <SendingListRegisterView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
      {currentTab === "sendingListView" && (
        <SendingListView ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />
      )}
    </>
  );
};

export default Sending;
