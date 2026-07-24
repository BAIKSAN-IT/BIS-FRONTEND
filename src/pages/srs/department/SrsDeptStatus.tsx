import React from "react";

const deptRows = [
  { dept: "개발팀", total: 5, waiting: 1, progress: 2, done: 2, rate: "40%" },
  { dept: "영업1팀", total: 3, waiting: 0, progress: 1, done: 2, rate: "67%" },
  { dept: "인사팀", total: 2, waiting: 1, progress: 0, done: 1, rate: "50%" },
  { dept: "생산기획", total: 4, waiting: 0, progress: 1, done: 3, rate: "75%" },
];

const SrsDeptStatus = () => {
  return (
    <section className="srs-dept-panel" aria-label="Department request status">
      <div className="srs-section-title">
        <div>
          <p>Department</p>
          <h2>부서 처리 현황</h2>
        </div>
        <span>이번 달 기준</span>
      </div>

      <div className="srs-dept-summary">
        <div>
          <span>전체 요청</span>
          <strong>14</strong>
        </div>
        <div>
          <span>처리 중</span>
          <strong>4</strong>
        </div>
        <div>
          <span>처리 완료</span>
          <strong>8</strong>
        </div>
        <div>
          <span>완료율</span>
          <strong>57%</strong>
        </div>
      </div>

      <div className="srs-table-wrap">
        <table className="srs-dept-table">
          <thead>
            <tr>
              <th>부서</th>
              <th>전체</th>
              <th>접수 대기</th>
              <th>처리 중</th>
              <th>처리 완료</th>
              <th>완료율</th>
            </tr>
          </thead>
          <tbody>
            {deptRows.map((row) => (
              <tr key={row.dept}>
                <td>{row.dept}</td>
                <td>{row.total}</td>
                <td>{row.waiting}</td>
                <td>{row.progress}</td>
                <td>{row.done}</td>
                <td>
                  <div className="srs-rate-cell">
                    <span style={{ width: row.rate }} />
                    <strong>{row.rate}</strong>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SrsDeptStatus;
