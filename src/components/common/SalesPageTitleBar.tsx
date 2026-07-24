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
  isSalesActivity?: boolean; // SalesActivity 여부
  isDisabled?: boolean; // Disabled 여부
  isShowEApproval?: boolean; // 전자결제 여부
  breadCrumbItems: Array<BreadcrumbItems>;
  onSearchButtonClick?: () => void;
  onNewButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
  onSaveButtonClick?: () => void;
  onExcelDownloadClick?: () => void;
  onPrintButtonClick?: () => void;
  onEApprovalButtonClick?: () => void;
}

const SalesPageTitleBar = memo(
  ({
    pageNm = "",
    pageUrl = "",
    isSalesActivity = true,
    isDisabled = false,
    isShowEApproval = false,
    breadCrumbItems,
    onSearchButtonClick,
    onNewButtonClick,
    onDeleteButtonClick,
    onSaveButtonClick,
    onExcelDownloadClick,
    onPrintButtonClick,
    onEApprovalButtonClick,
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
              {/* isSalesActivity가 true일 때만 조회, 신규, 삭제, 출력, 엑셀 버튼 표시 */}
              {isSalesActivity && (
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
                  {isShowEApproval && (
                    <ButtonComponent
                      type="button"
                      className="system-page-title-button"
                      txt={t("전자결제")}
                      onClick={onEApprovalButtonClick}
                    />
                  )}
                </>
              )}
              {/* isSalesActivity가 false일 때만 저장 버튼 표시 */}
              {!isDisabled && !isSalesActivity && hasPermission("sav") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-file-plus"
                  txt={t("common.save.btn")}
                  onClick={onSaveButtonClick}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>
    );
  }
);

export default SalesPageTitleBar;
