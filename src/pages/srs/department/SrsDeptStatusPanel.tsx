import React from "react";
import { SrsDepartmentRow } from "@redux/srs/srsSlice";

type SrsDeptStatusPanelProps = {
  rows: SrsDepartmentRow[];
};

const SrsDeptStatusPanel = ({ rows }: SrsDeptStatusPanelProps) => {
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const progress = rows.reduce((sum, row) => sum + row.progress, 0);
  const done = rows.reduce((sum, row) => sum + row.done, 0);
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section className="srs-dept-panel" aria-label="부서별 요청 현황">
      <div className="srs-section-title">
        <div>
          <p>부서현황</p>
          <h2>부서별 처리현황</h2>
        </div>
        <span>부서별 완료율과 진행 현황</span>
      </div>

      <div className="srs-dept-summary">
        <div>
          <span>전체 요청</span>
          <strong>{total}</strong>
        </div>
        <div>
          <span>처리중</span>
          <strong>{progress}</strong>
        </div>
        <div>
          <span>처리완료</span>
          <strong>{done}</strong>
        </div>
        <div>
          <span>완료율</span>
          <strong>{rate}%</strong>
        </div>
      </div>

      <div className="srs-table-wrap">
        <table className="srs-dept-table">
          <thead>
            <tr>
              <th>부서</th>
              <th>전체</th>
              <th>접수대기</th>
              <th>처리중</th>
              <th>처리완료</th>
              <th>완료율</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>통계 데이터가 없습니다.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.dept}>
                  <td>{row.dept}</td>
                  <td>{row.total}</td>
                  <td>{row.waiting}</td>
                  <td>{row.progress}</td>
                  <td>{row.done}</td>
                  <td>
                    <div className="srs-rate-cell">
                      <span style={{ width: `${row.rate}%` }} />
                      <strong>{row.rate}%</strong>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SrsDeptStatusPanel;
