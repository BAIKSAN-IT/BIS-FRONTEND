import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@redux/store";
import { SrsTabId } from "@redux/srs/srsSlice";

const tabs: Array<{ id: SrsTabId; label: string }> = [
  { id: "service", label: "서비스" },
  { id: "notice", label: "공지" },
  { id: "faq", label: "자주 묻는 질문" },
  { id: "deptStatus", label: "부서현황" },
  { id: "statistics", label: "통계" },
];

type SrsTopBarProps = {
  activeTab: SrsTabId;
  onTabChange: (tab: SrsTabId) => void;
};

const SrsTopBar = ({ activeTab, onTabChange }: SrsTopBarProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.Auth.user);
  const userName = user?.userNm || user?.loginId || user?.userId || "사용자";
  const deptName = user?.deptNm || user?.nmBizarea || "PANKO";

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <header className="srs-topbar">
      <div className="srs-topbar-main">
        <div>
          <p className="srs-eyebrow">서비스 요청 시스템</p>
        </div>

        <div className="srs-user-panel">
          <div className="srs-user-avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="srs-user-meta">
            <span>{userName}</span>
            <small>{deptName}</small>
          </div>
          <a className="srs-remote-button" href="https://helpu.kr/panko" target="_blank" rel="noreferrer">
            원격지원
          </a>
          <button type="button" className="srs-back-button" onClick={handleBack}>
            PIS 홈
          </button>
        </div>
      </div>

      <nav className="srs-tabs" aria-label="SRS 메뉴">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`srs-tab ${tab.id === activeTab ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default SrsTopBar;
