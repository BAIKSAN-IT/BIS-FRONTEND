import React from "react";

const SrsRequestForm = () => {
  return (
    <section className="srs-form-panel" aria-label="Create service request">
      <div className="srs-section-title">
        <div>
          <p>New request</p>
          <h2>서비스 요청 등록</h2>
        </div>
        <div className="srs-action-group">
          <button type="button" className="secondary">
            임시저장
          </button>
          <button type="button">요청 등록</button>
        </div>
      </div>

      <div className="srs-form-grid">
        <label>
          요청 제목
          <input type="text" placeholder="예: 메모리 증설 요청" />
        </label>

        <label>
          긴급도
          <select defaultValue="normal">
            <option value="normal">일반</option>
            <option value="high">높음</option>
            <option value="urgent">긴급</option>
          </select>
        </label>

        <label>
          업무 분류
          <select>
            <option>H/W</option>
            <option>S/W</option>
            <option>Network</option>
            <option>Account</option>
          </select>
        </label>

        <label>
          희망 완료일
          <input type="date" />
        </label>

        <label className="wide">
          요청 내용
          <textarea placeholder="문제 상황, 필요한 지원, 영향 범위를 입력해 주세요." />
        </label>

        <label className="wide">
          첨부 파일
          <input type="file" />
        </label>
      </div>

      <div className="srs-help-strip">
        <strong>작성 팁</strong>
        <span>화면 캡처, 오류 메시지, 필요한 완료일을 함께 적으면 담당자가 더 빠르게 처리할 수 있습니다.</span>
      </div>
    </section>
  );
};

export default SrsRequestForm;
