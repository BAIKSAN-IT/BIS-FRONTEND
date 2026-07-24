import React from "react";
import { SrsRequestRow } from "@redux/srs/srsSlice";

type SrsRequestTableProps = {
  rows: SrsRequestRow[];
  selectedId: string | null;
  onSelect: (row: SrsRequestRow) => void;
  onOpenDetail: (row: SrsRequestRow) => void;
};

const statusClassMap: Record<string, string> = {
  "00": "pending",
  "10": "progress",
  "20": "done",
};

const SrsRequestTable = ({ rows, selectedId, onSelect, onOpenDetail }: SrsRequestTableProps) => {
  const selectedRow = rows.find((row) => row.id === selectedId);

  return (
    <section className="srs-work-panel" aria-label="SRS 요청 목록">
      <div className="srs-section-title">
        <div>
          <p>업무목록</p>
          <h2>요청 처리현황</h2>
        </div>
        <div className="srs-action-group">
          <span>{rows.length}건</span>
          <button type="button" disabled={!selectedRow} onClick={() => selectedRow && onOpenDetail(selectedRow)}>
            상세보기
          </button>
        </div>
      </div>

      <div className="srs-table-wrap">
        <table className="srs-work-table">
          <thead>
            <tr>
              <th>선택</th>
              <th>등록일자</th>
              <th>완료일자</th>
              <th>요청부서</th>
              <th>요청자</th>
              <th>처리기한</th>
              <th>요청구분</th>
              <th>구분상세</th>
              <th>요청타입</th>
              <th>요청내용</th>
              <th>예정일자</th>
              <th>담당자</th>
              <th>상태</th>
              <th>만족도</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="align-left">
                  조회된 요청이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={selectedId === row.id ? "selected" : ""}
                  onClick={() => onSelect(row)}
                  onDoubleClick={() => onOpenDetail(row)}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${row.content} 선택`}
                      checked={selectedId === row.id}
                      onChange={() => onSelect(row)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td>{row.regDate}</td>
                  <td>{row.doneDate}</td>
                  <td>{row.dept}</td>
                  <td>{row.requester}</td>
                  <td>{row.deadline}</td>
                  <td>{row.category}</td>
                  <td>{row.type}</td>
                  <td>{row.detailType}</td>
                  <td className="align-left">{row.content}</td>
                  <td>{row.expectDate}</td>
                  <td>{row.manager}</td>
                  <td>
                    <span className={`srs-status ${statusClassMap[row.statusCode] || "default"}`}>{row.status}</span>
                  </td>
                  <td>{row.satisfaction}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export type { SrsRequestRow };
export default SrsRequestTable;
