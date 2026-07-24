import React from "react";
import { SrsRequestRow } from "@redux/srs/srsSlice";

type SrsWorkTableProps = {
  rows: SrsRequestRow[];
  selectedId: string | null;
  onSelect: (row: SrsRequestRow) => void;
  onOpenDetail: (row: SrsRequestRow) => void;
  onOpenRequest: () => void;
  loginEmpNo: string;
  onRateSatisfaction: (row: SrsRequestRow, score: number) => Promise<void>;
  ratingSaving: boolean;
  loading: boolean;
};

const statusClassMap: Record<string, string> = {
  "00": "pending",
  "10": "progress",
  "20": "done",
};

const SrsWorkTable = ({
  rows,
  selectedId,
  onSelect,
  onOpenDetail,
  onOpenRequest,
  loginEmpNo,
  onRateSatisfaction,
  ratingSaving,
  loading,
}: SrsWorkTableProps) => {
  const selectedRow = rows.find((row) => row.id === selectedId);
  const [ratingTarget, setRatingTarget] = React.useState<SrsRequestRow | null>(null);
  const [ratingScore, setRatingScore] = React.useState(10);

  const openRating = (row: SrsRequestRow) => {
    setRatingTarget(row);
    setRatingScore(10);
  };

  const closeRating = () => {
    if (ratingSaving) return;
    setRatingTarget(null);
  };

  const submitRating = async () => {
    if (!ratingTarget) return;
    await onRateSatisfaction(ratingTarget, ratingScore);
    setRatingTarget(null);
  };

  const normalize = (value: string) => (value || "").trim().toLowerCase();

  const canRate = (row: SrsRequestRow) => {
    const statusText = (row.status || "").trim();
    const hasDoneDate = !!row.doneDate && row.doneDate !== "-" && row.doneDate !== "9999.12.31";
    const isDone = row.statusCode === "20" || statusText === "처리완료" || statusText === "20" || hasDoneDate;
    const numericScore = Number((row.satisfaction || "").replace(/[^0-9.]/g, ""));
    const isUnrated =
      !row.satisfaction ||
      row.satisfaction === "-" ||
      row.satisfaction === "0" ||
      (!Number.isNaN(numericScore) && numericScore <= 0);

    const login = normalize(loginEmpNo);
    const reqEmp = normalize(row.reqEmpNo);
    const isRequester = !!login && (!reqEmp || login === reqEmp);

    return isDone && isUnrated && isRequester;
  };

  return (
    <section className="srs-work-panel" aria-label="SRS 요청 목록">
      <div className="srs-section-title">
        <div>
          <p>업무목록</p>
          <h2>요청 처리현황</h2>
        </div>
        <div className="srs-action-group">
          <button type="button" onClick={onOpenRequest}>
            {selectedRow ? "요청수정" : "요청하기"}
          </button>
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
              <th>요청처리자</th>
              <th>상태</th>
              <th>만족도</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={14} className="align-left">
                  요청 목록을 불러오는 중입니다.
                </td>
              </tr>
            ) : rows.length === 0 ? (
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
                  <td>
                    {canRate(row) ? (
                      <button
                        type="button"
                        className="srs-rate-trigger"
                        onClick={(event) => {
                          event.stopPropagation();
                          openRating(row);
                        }}
                      >
                        평가하기
                      </button>
                    ) : (
                      row.satisfaction
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {ratingTarget ? (
        <div className="srs-modal-backdrop" onClick={closeRating}>
          <section className="srs-rating-modal" onClick={(event) => event.stopPropagation()}>
            <header className="srs-rating-header">
              <div>
                <p>만족도 평가</p>
                <h3>별점 선택</h3>
              </div>
              <button type="button" className="secondary" onClick={closeRating} disabled={ratingSaving}>
                닫기
              </button>
            </header>

            <div className="srs-rating-body">
              <p className="srs-rating-guide">{ratingTarget.content || "요청 건"} 처리 만족도를 선택해 주세요.</p>
              <div className="srs-rating-stars">
                {Array.from({ length: 5 }, (_, index) => {
                  const current = index + 1;
                  const fullActive = ratingScore >= current * 2;
                  const halfActive = !fullActive && ratingScore === current * 2 - 1;
                  return (
                    <button
                      key={current}
                      type="button"
                      className={`srs-star-button ${fullActive ? "active" : halfActive ? "half" : ""}`}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const clickX = event.clientX - rect.left;
                        const isHalf = clickX < rect.width / 2;
                        setRatingScore(isHalf ? current * 2 - 1 : current * 2);
                      }}
                      disabled={ratingSaving}
                      aria-label={`${current}별 선택 (왼쪽 반개 / 오른쪽 한개)`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <p className="srs-rating-score">선택 점수: {ratingScore} / 10</p>
              <div className="srs-rating-actions">
                <button type="button" className="secondary" disabled={ratingSaving} onClick={closeRating}>
                  취소
                </button>
                <button type="button" disabled={ratingSaving} onClick={() => void submitRating()}>
                  {ratingSaving ? "저장중..." : "평가 저장"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
};

export default SrsWorkTable;
