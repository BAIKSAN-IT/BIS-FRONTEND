import React, { memo } from "react";
import { Breadcrumb, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

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
  breadCrumbItems: Array<BreadcrumbItems>;
  onSearchButtonClick?: () => void;
  onNewButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
  onSaveButtonClick?: () => void;
  onExcelDownloadClick?: () => void;
  onPrintButtonClick?: () => void;
  onEApprovalButtonClick?: () => void;
}

const SalesPlanPageTitleBar = memo(({ pageNm = "", pageUrl = "", breadCrumbItems }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

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
        </div>
      </Col>
    </Row>
  );
});

export default SalesPlanPageTitleBar;
