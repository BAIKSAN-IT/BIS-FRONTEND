import React, { memo } from "react";
import { Breadcrumb, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

/* Component */
import ButtonComponent from "./ButtonComponent";

/* redux */
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface BreadcrumbItems {
  label: string;
  path: string;
  active?: boolean;
}

interface Props {
  pageTitle?: string; // 페이지 제목
  pageNm?: string;
  pageUrl?: string; // 페이지 경로
  isFabricLibraryStatus?: boolean;
  breadCrumbItems: Array<BreadcrumbItems>;
  onSearchButtonClick?: () => void;
  onNewButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
  onSaveButtonClick?: () => void;
  onExcelDownloadClick?: () => void;
  onPrintButtonClick?: () => void;
  activeTab?: string; // 현재 탭
}

const RndPageTitleBar = memo(
  ({
    pageNm = "",
    pageUrl = "",
    isFabricLibraryStatus = true,
    breadCrumbItems,
    onSearchButtonClick,
    onNewButtonClick,
    onDeleteButtonClick,
    onSaveButtonClick,
    onExcelDownloadClick,
    onPrintButtonClick,
    activeTab,
  }: Props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));

    // 현재 페이지의 권한 정보 찾기
    const currentProgram = systemProgram.find((program) => program.pageUrl === location.pathname);

    // 권한 체크 ( 1: 권한 있음 0: 권한 없음 )
    const hasPermission = (key: string) => {
      return currentProgram ? (currentProgram as any)[key] === "1" : false;
    };

    return (
      <Row className="mb-2">
        <Col>
          <div className="system-title-box">
            <div className="system-title-left mb-1">
              <Breadcrumb className="m-1" style={{ fontSize: "11px" }}>
                <Breadcrumb.Item onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                  <i className="icon-home" />
                </Breadcrumb.Item>

                {breadCrumbItems.length > 0 && (
                  <Breadcrumb.Item onClick={() => navigate(pageUrl)} style={{ cursor: "pointer" }}>
                    {pageNm}
                  </Breadcrumb.Item>
                )}

                {breadCrumbItems.map((item, index) => (
                  <Breadcrumb.Item
                    key={index}
                    onClick={() => !item.active && navigate(item.path)}
                    active={item.active}
                    style={{ cursor: item.active ? "default" : "pointer" }}
                  >
                    {item.label}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </div>

            {/* 버튼 영역 */}
            <div className="system-title-right m-1">
              {activeTab ? (
                // activeTab이 있는 경우 → 기존 버튼들은 전혀 안 보이게 하고, 탭별로 분기
                <>
                  {(activeTab === "all" ||
                    activeTab === "recapListView" ||
                    activeTab === "sendingListView" ||
                    activeTab === "returnListView") && (
                    <>
                      {hasPermission("find") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="ti-search"
                          txt={t("common.search.btn")}
                          onClick={onSearchButtonClick}
                        />
                      )}
                      {hasPermission("del") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-delete"
                          txt={t("common.delete.btn")}
                          onClick={onDeleteButtonClick}
                        />
                      )}
                      {hasPermission("excelDown") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-microsoft-excel"
                          txt={t("common.excel.btn")}
                          onClick={onExcelDownloadClick}
                        />
                      )}
                      {hasPermission("prt") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-printer"
                          txt={t("common.print.btn")}
                          onClick={onPrintButtonClick}
                        />
                      )}
                    </>
                  )}

                  {(activeTab === "recap" ||
                    activeTab === "favorite" ||
                    activeTab === "sending" ||
                    activeTab === "return") && (
                    <>
                      {hasPermission("newEntry") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-file"
                          txt={t("common.new.btn")}
                          onClick={onNewButtonClick}
                        />
                      )}
                      {hasPermission("sav") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-file-plus"
                          txt={t("common.save.btn")}
                          onClick={onSaveButtonClick}
                        />
                      )}
                      {hasPermission("del") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-delete"
                          txt={t("common.delete.btn")}
                          onClick={onDeleteButtonClick}
                        />
                      )}
                      {hasPermission("excelDown") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-microsoft-excel"
                          txt={t("common.excel.btn")}
                          onClick={onExcelDownloadClick}
                        />
                      )}
                      {hasPermission("prt") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-printer"
                          txt={t("common.print.btn")}
                          onClick={onPrintButtonClick}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                // activeTab이 없을 때만 기존 버튼 로직 실행
                <>
                  {isFabricLibraryStatus && (
                    <>
                      {hasPermission("find") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="ti-search"
                          txt={t("common.search.btn")}
                          onClick={onSearchButtonClick}
                        />
                      )}
                      {hasPermission("newEntry") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-file"
                          txt={t("common.new.btn")}
                          onClick={onNewButtonClick}
                        />
                      )}
                      {hasPermission("del") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-delete"
                          txt={t("common.delete.btn")}
                          onClick={onDeleteButtonClick}
                        />
                      )}
                      {hasPermission("prt") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-printer"
                          txt={t("common.print.btn")}
                          onClick={onPrintButtonClick}
                        />
                      )}
                      {hasPermission("excelDown") && (
                        <ButtonComponent
                          type="button"
                          className="system-page-title-button"
                          iClassName="mdi mdi-microsoft-excel"
                          txt={t("common.excel.btn")}
                          onClick={onExcelDownloadClick}
                        />
                      )}
                    </>
                  )}
                  {!isFabricLibraryStatus && hasPermission("prt") && (
                    <ButtonComponent
                      type="button"
                      className="system-page-title-button"
                      iClassName="mdi mdi-printer"
                      txt={t("common.print.btn")}
                      onClick={onPrintButtonClick}
                    />
                  )}
                  {!isFabricLibraryStatus && hasPermission("sav") && (
                    <ButtonComponent
                      type="button"
                      className="system-page-title-button"
                      iClassName="mdi mdi-file-plus"
                      txt={t("common.save.btn")}
                      onClick={onSaveButtonClick}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    );
  }
);

export default RndPageTitleBar;
