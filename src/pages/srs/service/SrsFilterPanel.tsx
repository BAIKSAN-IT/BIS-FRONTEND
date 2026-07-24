import React from "react";

const SrsFilterPanel = () => {
  return (
    <section className="srs-filter-panel" aria-label="SRS search filters">
      <div className="srs-section-title">
        <div>
          <p>Search</p>
          <h2>서비스 요청 조회</h2>
        </div>
        <button type="button">검색</button>
      </div>

      <div className="srs-filter-grid">
        <label>
          요청 부서
          <select>
            <option>전체</option>
            <option>영업1팀</option>
            <option>인사팀</option>
            <option>생산기획</option>
          </select>
        </label>

        <label>
          요청자
          <select>
            <option>LOGIN 사용자</option>
            <option>전체 사용자</option>
          </select>
        </label>

        <label>
          진행 상태
          <select>
            <option>전체</option>
            <option>접수 대기</option>
            <option>처리 중</option>
            <option>처리 완료</option>
          </select>
        </label>

        <label>
          요청 시작일
          <input type="date" defaultValue="2026-03-01" />
        </label>

        <label>
          요청 종료일
          <input type="date" defaultValue="2026-03-31" />
        </label>

        <label>
          업무 분류
          <select>
            <option>전체</option>
            <option>H/W</option>
            <option>S/W</option>
            <option>Network</option>
          </select>
        </label>

        <label>
          업무 구분
          <select>
            <option>전체</option>
            <option>컴퓨터 문의</option>
            <option>계정 권한</option>
            <option>접속 장애</option>
          </select>
        </label>

        <label>
          상세 업무
          <select>
            <option>전체</option>
            <option>메모리</option>
            <option>접근 권한</option>
            <option>VPN</option>
          </select>
        </label>
      </div>

      <div className="srs-keyword-row">
        <label>
          <input type="checkbox" />
          전체 요청 포함
        </label>
        <input type="text" placeholder="요청 내용, 담당자, 부서명으로 검색" />
      </div>
    </section>
  );
};

export default SrsFilterPanel;
