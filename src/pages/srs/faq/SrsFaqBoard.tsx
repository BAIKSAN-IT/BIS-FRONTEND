/*
import React, { useEffect, useMemo, useState } from "react";
import { SrsFaqItem } from "@redux/srs/srsSlice";
import SrsRichTextEditor from "../service/SrsRichTextEditor";

export type SrsFaqSubmitValue = {
  noFaq: string;
  category: string;
  question: string;
  answer: string;
  sortSeq: number;
  ynUse: "Y" | "N";
  ynDel: "Y" | "N";
};

type SrsFaqBoardProps = {
  rows: SrsFaqItem[];
  isAdmin: boolean;
  loading: boolean;
  saving: boolean;
  onSave: (value: SrsFaqSubmitValue) => Promise<void>;
};

const emptyFaq: SrsFaqSubmitValue = {
  noFaq: "",
  category: "일반",
  question: "",
  answer: "",
  sortSeq: 0,
  ynUse: "Y",
  ynDel: "N",
};

const SrsFaqBoard = ({ rows, isAdmin, loading, saving, onSave }: SrsFaqBoardProps) => {
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SrsFaqSubmitValue>(emptyFaq);
  const [formError, setFormError] = useState("");

  const filteredRows = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    if (!lowerKeyword) return rows;
    return rows.filter((row) =>
      [row.category, row.question, stripHtml(row.answer || "")].some((value) => (value || "").toLowerCase().includes(lowerKeyword))
    );
  }, [keyword, rows]);

  useEffect(() => {
    if (!modalOpen) {
      setFormError("");
    }
  }, [modalOpen]);

  const openCreateModal = () => {
    setForm({ ...emptyFaq, sortSeq: rows.length + 1 });
    setModalOpen(true);
  };

  const openEditModal = (row: SrsFaqItem) => {
    setForm({
      noFaq: row.noFaq || "",
      category: row.category || "일반",
      question: row.question || "",
      answer: row.answer || "",
      sortSeq: Number(row.sortSeq || 0),
      ynUse: row.ynUse === "N" ? "N" : "Y",
      ynDel: row.ynDel === "Y" ? "Y" : "N",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.question.trim()) {
      setFormError("FAQ 질문을 입력해 주세요.");
      return;
    }
    setFormError("");
    await onSave(form);
    setModalOpen(false);
  };

  return (
    <section className="srs-notice-panel" aria-label="SRS 자주 묻는 질문">
      <div className="srs-section-title">
        <div>
          <p>자주 묻는 질문</p>
          <h2>자주 묻는 질문</h2>
        </div>
        {isAdmin ? <button type="button" onClick={openCreateModal}>FAQ 등록</button> : null}
      </div>

      <div className="srs-board-toolbar">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="질문, 답변, 분류로 검색"
          aria-label="FAQ 검색"
        />
        <span>{loading ? "불러오는 중..." : `${filteredRows.length}건`}</span>
      </div>

      <div className="srs-faq-list">
        {filteredRows.map((faq) => (
          <article key={faq.noFaq} className={`srs-faq-item ${faq.ynUse === "N" ? "disabled" : ""}`}>
            <span>{faq.category || "일반"}</span>
            <strong>{faq.question}</strong>
            <div className="srs-board-content" dangerouslySetInnerHTML={{ __html: faq.answer || "-" }} />
            {isAdmin ? (
              <div className="srs-board-card-actions">
                {faq.ynUse === "N" ? <em>숨김</em> : null}
                <button type="button" onClick={() => openEditModal(faq)}>수정</button>
              </div>
            ) : null}
          </article>
        ))}
        {!loading && filteredRows.length === 0 ? <p className="srs-empty-text">등록된 FAQ가 없습니다.</p> : null}
      </div>

      {modalOpen ? (
        <div className="srs-modal-backdrop">
          <div className="srs-board-modal" role="dialog" aria-modal="true" aria-label="FAQ 등록 수정">
            <div className="srs-detail-header">
              <div>
                <p>{form.noFaq ? "FAQ 수정" : "FAQ 등록"}</p>
                <h2>{form.noFaq ? "FAQ 수정" : "새 FAQ"}</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>닫기</button>
            </div>

            <div className="srs-board-form-grid">
              <label>
                분류
                <input value={form.category} onChange={(event) => setFormValue("category", event.target.value)} />
              </label>
              <label>
                정렬
                <input
                  type="number"
                  value={form.sortSeq}
                  onChange={(event) => setFormValue("sortSeq", Number(event.target.value || 0))}
                />
              </label>
              <label className="wide">
                질문
                <input value={form.question} onChange={(event) => setFormValue("question", event.target.value)} />
              </label>
            </div>

            <div className="srs-board-editor">
              <span>답변</span>
              <SrsRichTextEditor value={form.answer} height={280} onChange={(value) => setFormValue("answer", value)} />
            </div>

            <div className="srs-board-options">
              <label>
                <input
                  type="checkbox"
                  checked={form.ynUse === "Y"}
                  onChange={(event) => setFormValue("ynUse", event.target.checked ? "Y" : "N")}
                />
                사용
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.ynDel === "Y"}
                  onChange={(event) => setFormValue("ynDel", event.target.checked ? "Y" : "N")}
                />
                삭제 처리
              </label>
            </div>

            {formError ? <div className="srs-alert-error">{formError}</div> : null}

            <div className="srs-detail-actions srs-board-modal-actions">
              <button type="button" className="secondary" onClick={() => setModalOpen(false)}>취소</button>
              <button type="button" disabled={saving} onClick={() => void handleSubmit()}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );

  function setFormValue<K extends keyof SrsFaqSubmitValue>(key: K, value: SrsFaqSubmitValue[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

export default SrsFaqBoard;
*/

import React, { useEffect, useMemo, useState } from "react";
import { SrsFaqItem } from "@redux/srs/srsSlice";
import SrsRichTextEditor from "../service/SrsRichTextEditor";

export type SrsFaqSubmitValue = {
  noFaq: string;
  category: string;
  question: string;
  answer: string;
  sortSeq: number;
  ynUse: "Y" | "N";
  ynDel: "Y" | "N";
};

type SrsFaqBoardProps = {
  rows: SrsFaqItem[];
  isAdmin: boolean;
  loading: boolean;
  saving: boolean;
  onSave: (value: SrsFaqSubmitValue) => Promise<void>;
};

const emptyFaq: SrsFaqSubmitValue = {
  noFaq: "",
  category: "일반",
  question: "",
  answer: "",
  sortSeq: 0,
  ynUse: "Y",
  ynDel: "N",
};

const SrsFaqBoard = ({ rows, isAdmin, loading, saving, onSave }: SrsFaqBoardProps) => {
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [openNoFaq, setOpenNoFaq] = useState<string | null>(null);
  const [form, setForm] = useState<SrsFaqSubmitValue>(emptyFaq);
  const [formError, setFormError] = useState("");

  const filteredRows = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    if (!lowerKeyword) return rows;
    return rows.filter((row) =>
      [row.category, row.question, stripHtml(row.answer || "")].some((value) => (value || "").toLowerCase().includes(lowerKeyword))
    );
  }, [keyword, rows]);

  useEffect(() => {
    if (!modalOpen) setFormError("");
  }, [modalOpen]);

  useEffect(() => {
    if (!openNoFaq) return;
    if (filteredRows.some((row) => row.noFaq === openNoFaq)) return;
    setOpenNoFaq(null);
  }, [filteredRows, openNoFaq]);

  const openCreateModal = () => {
    setForm({ ...emptyFaq, sortSeq: rows.length + 1 });
    setModalOpen(true);
  };

  const openEditModal = (row: SrsFaqItem) => {
    setForm({
      noFaq: row.noFaq || "",
      category: row.category || "일반",
      question: row.question || "",
      answer: row.answer || "",
      sortSeq: Number(row.sortSeq || 0),
      ynUse: row.ynUse === "N" ? "N" : "Y",
      ynDel: row.ynDel === "Y" ? "Y" : "N",
    });
    setModalOpen(true);
  };

  const handleToggle = (noFaq: string) => {
    setOpenNoFaq((prev) => (prev === noFaq ? null : noFaq));
  };

  const handleSubmit = async () => {
    if (!form.question.trim()) {
      setFormError("FAQ 질문을 입력해 주세요.");
      return;
    }
    setFormError("");
    await onSave(form);
    setModalOpen(false);
  };

  return (
    <section className="srs-notice-panel" aria-label="SRS 자주 묻는 질문">
      <div className="srs-section-title">
        <div>
          <p>자주 묻는 질문</p>
          <h2>자주 묻는 질문</h2>
        </div>
        {isAdmin ? (
          <button type="button" onClick={openCreateModal}>
            FAQ 등록
          </button>
        ) : null}
      </div>

      <div className="srs-board-toolbar">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="질문, 답변, 분류로 검색" aria-label="FAQ 검색" />
        <span>{loading ? "불러오는 중..." : `${filteredRows.length}건`}</span>
      </div>

      <div className="srs-faq-list">
        {filteredRows.map((faq) => {
          const opened = openNoFaq === faq.noFaq;
          return (
            <article key={faq.noFaq} className={`srs-faq-item ${faq.ynUse === "N" ? "disabled" : ""}`}>
              <button type="button" className="srs-faq-q-button" onClick={() => handleToggle(faq.noFaq)} aria-expanded={opened} aria-controls={`faq-a-${faq.noFaq}`}>
                <span className="srs-faq-mark q">Q</span>
                <span className="srs-faq-question">{faq.question}</span>
                <span className="srs-faq-toggle-icon">{opened ? "−" : "+"}</span>
              </button>

              {opened ? (
                <div className="srs-faq-answer-wrap" id={`faq-a-${faq.noFaq}`}>
                  <div className="srs-faq-answer-head">
                    <span className="srs-faq-mark a">A</span>
                    <span>{faq.category || "일반"}</span>
                  </div>
                  <div className="srs-board-content" dangerouslySetInnerHTML={{ __html: faq.answer || "-" }} />
                </div>
              ) : null}

              {isAdmin ? (
                <div className="srs-board-card-actions">
                  {faq.ynUse === "N" ? <em>미사용</em> : null}
                  <button type="button" onClick={() => openEditModal(faq)}>
                    수정
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
        {!loading && filteredRows.length === 0 ? <p className="srs-empty-text">등록된 FAQ가 없습니다.</p> : null}
      </div>

      {modalOpen ? (
        <div className="srs-modal-backdrop">
          <div className="srs-board-modal" role="dialog" aria-modal="true" aria-label="FAQ 등록 수정">
            <div className="srs-detail-header">
              <div>
                <p>{form.noFaq ? "FAQ 수정" : "FAQ 등록"}</p>
                <h2>{form.noFaq ? "FAQ 수정" : "새 FAQ"}</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>
                닫기
              </button>
            </div>

            <div className="srs-board-form-grid">
              <label>
                분류
                <input value={form.category} onChange={(event) => setFormValue("category", event.target.value)} />
              </label>
              <label>
                정렬
                <input type="number" value={form.sortSeq} onChange={(event) => setFormValue("sortSeq", Number(event.target.value || 0))} />
              </label>
              <label className="wide">
                질문
                <input value={form.question} onChange={(event) => setFormValue("question", event.target.value)} />
              </label>
            </div>

            <div className="srs-board-editor">
              <span>답변</span>
              <SrsRichTextEditor value={form.answer} height={280} onChange={(value) => setFormValue("answer", value)} />
            </div>

            <div className="srs-board-options">
              <label>
                <input type="checkbox" checked={form.ynUse === "Y"} onChange={(event) => setFormValue("ynUse", event.target.checked ? "Y" : "N")} />
                사용
              </label>
              <label>
                <input type="checkbox" checked={form.ynDel === "Y"} onChange={(event) => setFormValue("ynDel", event.target.checked ? "Y" : "N")} />
                삭제 처리
              </label>
            </div>

            {formError ? <div className="srs-alert-error">{formError}</div> : null}

            <div className="srs-detail-actions srs-board-modal-actions">
              <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
                취소
              </button>
              <button type="button" disabled={saving} onClick={() => void handleSubmit()}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );

  function setFormValue<K extends keyof SrsFaqSubmitValue>(key: K, value: SrsFaqSubmitValue[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

export default SrsFaqBoard;
