import React, { memo } from "react";
import { Button } from "react-bootstrap";
import classNames from "classnames";
import RndPageTitleBar from "../../../../components/common/RndPageTitleBar";

type BreadCrumbItem = { label: string; path: string; active?: boolean };

interface Props {
  pageNm: string;
  pageUrl: string;
  breadCrumbItems: BreadCrumbItem[];
  activeTab: string;
  onChangeTab: (tab: string) => void;

  onSearchButtonClick?: () => void;
  onNewButtonClick?: () => void;
  onSaveButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
  onExcelDownloadClick?: () => void;
  onPrintButtonClick?: () => void;
}

const TABS = [
  { key: "recap", label: "RECAP" },
  { key: "recapListView", label: "RECAP LIST" },
  { key: "all", label: "FABRIC LIST" },
];

const RecapHeader = memo(
  ({
    pageNm,
    pageUrl,
    breadCrumbItems,
    activeTab,
    onChangeTab,
    onSearchButtonClick,
    onNewButtonClick,
    onSaveButtonClick,
    onDeleteButtonClick,
    onExcelDownloadClick,
    onPrintButtonClick,
  }: Props) => {
    return (
      <>
        <RndPageTitleBar
          pageNm={pageNm}
          pageUrl={pageUrl}
          breadCrumbItems={breadCrumbItems}
          isFabricLibraryStatus={true}
          onSearchButtonClick={onSearchButtonClick}
          onNewButtonClick={onNewButtonClick}
          onSaveButtonClick={onSaveButtonClick}
          onDeleteButtonClick={onDeleteButtonClick}
          onExcelDownloadClick={onExcelDownloadClick}
          onPrintButtonClick={onPrintButtonClick}
          activeTab={activeTab}
        />
        <div className="d-flex justify-content-start mb-1">
          {TABS.map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={activeTab === t.key ? "primary" : "outline-primary"}
              className={classNames("sales-activity-button", { "active-button": activeTab === t.key })}
              onClick={() => onChangeTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </>
    );
  }
);

export default RecapHeader;
