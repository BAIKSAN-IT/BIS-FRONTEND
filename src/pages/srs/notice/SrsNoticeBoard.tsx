import React from "react";

const notices = [
  {
    title: "VPN 접속 장애 조치 가이드",
    category: "Network",
    date: "2026.03.18",
    description: "외부망 접속이 불안정할 때 먼저 확인할 항목입니다.",
  },
  {
    title: "신규 계정 권한 신청 기준",
    category: "Account",
    date: "2026.03.11",
    description: "메뉴 권한 요청 시 필요한 승인 정보와 처리 기준입니다.",
  },
  {
    title: "PC 교체 및 부품 증설 접수 안내",
    category: "H/W",
    date: "2026.03.02",
    description: "장비 교체 요청 전 점검해야 할 기본 정보를 정리했습니다.",
  },
];

const SrsNoticeBoard = () => {
  return (
    <section className="srs-notice-panel" aria-label="SRS notices">
      <div className="srs-section-title">
        <div>
          <p>Notice</p>
          <h2>공지 및 가이드</h2>
        </div>
        <button type="button">전체 보기</button>
      </div>

      <div className="srs-notice-grid">
        {notices.map((notice) => (
          <article key={notice.title} className="srs-notice-card">
            <div>
              <span>{notice.category}</span>
              <time>{notice.date}</time>
            </div>
            <h3>{notice.title}</h3>
            <p>{notice.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SrsNoticeBoard;
