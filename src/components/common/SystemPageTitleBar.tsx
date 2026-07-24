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
  breadCrumbItems: Array<BreadcrumbItems>;
  onSearchButtonClick?: () => void;
  onNewButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
  onSaveButtonClick?: () => void;
  onExcelDownloadClick?: () => void;
  onExt1ButtonClick?: () => void;
  onPrintButtonClick?: () => void;
}

const SystemPageTitleBar = memo(
  ({
    pageTitle,
    breadCrumbItems,
    onSearchButtonClick,
    onNewButtonClick,
    onDeleteButtonClick,
    onSaveButtonClick,
    onExcelDownloadClick,
    onExt1ButtonClick,
    onPrintButtonClick,
  }: Props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));

    // 현재 페이지의 권한 정보 찾기
    const currentProgram = systemProgram.find((program) => program.pageUrl === location.pathname);

    // 권한 체크 ( 1: 권한있음 0: 권한없음 )
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
                  <Breadcrumb.Item onClick={() => navigate("/userregister")} style={{ cursor: "pointer" }}>
                    System
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

            <div className="system-title-right m-1">
              {/* 조회 버튼 */}
              {hasPermission("find") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="ti-search"
                  txt={t("common.search.btn")}
                  onClick={onSearchButtonClick}
                />
              )}
              {/* 신규 등록 버튼 */}
              {hasPermission("newEntry") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-file"
                  txt={t("common.new.btn")}
                  onClick={onNewButtonClick}
                />
              )}
              {/* 저장 버튼 */}
              <ButtonComponent
                type="button"
                className="system-page-title-button"
                iClassName="mdi mdi-file-plus"
                txt={t("common.save.btn")}
                onClick={onSaveButtonClick}
              />
              {/* 🗑삭제 버튼 */}
              {hasPermission("del") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-delete"
                  txt={t("common.delete.btn")}
                  onClick={onDeleteButtonClick}
                />
              )}
              {/* 승인버튼 으로 사용 */}
              {hasPermission("extBtn1") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-file-plus"
                  txt={t("common.ext1.btn")}
                  onClick={onExt1ButtonClick}
                />
              )}
              {/* 엑셀 다운로드 버튼 */}
              {hasPermission("excelDown") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-microsoft-excel"
                  txt={t("common.excel.btn")}
                  onClick={onExcelDownloadClick}
                />
              )}
              {/* 🖨출력 버튼 */}
              {hasPermission("prt") && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button"
                  iClassName="mdi mdi-printer"
                  txt={t("common.print.btn")}
                  onClick={onPrintButtonClick}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>
    );
  }
);

export default SystemPageTitleBar;
