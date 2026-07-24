import React, { useEffect, useMemo, useRef, useState } from "react";
import FavoriteHeader from "./FavoriteHeader";

import FabricList from "./FabricList";
import FavoriteList from "./FavoriteList";

const RECAP_LABEL_MAP: Record<string, string> = {
  all: "FABRIC LIST",
  favorite: "FAVORITE",
};

type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const Favorite: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("favorite");

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
      <FavoriteHeader
        pageNm="RND"
        pageUrl=""
        breadCrumbItems={[
          { label: "FAVORITE", path: "/fabric/favorite" },
          { label: bcActiveLabel, path: "/fabric/favorite", active: true },
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

      {currentTab === "favorite" && <FavoriteList ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />}
      {currentTab === "all" && <FabricList ref={childRef as React.MutableRefObject<RecapChildAPI | null>} />}
    </>
  );
};

export default Favorite;
