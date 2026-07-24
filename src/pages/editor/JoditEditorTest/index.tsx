// src/pages/news/NaverNewsFinder.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";
import { getNaverNewsList, NewsItem, NewsRes } from "../../../redux/news/NewsSlice";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Container,
  Form,
  InputGroup,
  Pagination,
  Placeholder,
  Row,
  Spinner,
} from "react-bootstrap";

const SHOW_DEBUG = false;

// ====== 유틸 ======
const truncate = (txt: string, n = 140) => (txt.length > n ? txt.slice(0, n) + "…" : txt);
const formatKST = (d: string) => {
  try {
    const date = new Date(d);
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return d;
  }
};
const makePages = (current: number, total: number) => {
  const pages = new Set<number>();
  const push = (p: number) => p >= 1 && p <= total && pages.add(p);
  [current - 2, current - 1, current, current + 1, current + 2].forEach(push);
  push(1);
  push(2);
  push(total - 1);
  push(total);
  return Array.from(pages).sort((a, b) => a - b);
};
const SINCE_OPTIONS = [
  { key: "all", label: "전체" },
  { key: "1d", label: "24시간" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
] as const;

const toPlainText = (html: string) => {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || "").trim();
  }
  return html
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
};

export default function NaverNewsFinder() {
  const dispatch = useDispatch<AppDispatch>();

  // 검색 상태
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date" | "sim">("date");
  const [display, setDisplay] = useState(20);
  const [page, setPage] = useState(1);
  const [since, setSince] = useState<(typeof SINCE_OPTIONS)[number]["key"]>("all");

  // 데이터 상태
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRequestKey = useRef(0);

  const start = useMemo(() => (page - 1) * display + 1, [page, display]);
  const totalPages = useMemo(() => {
    const cappedTotal = Math.min(total, 1000);
    return Math.max(1, Math.ceil(cappedTotal / display));
  }, [total, display]);

  const filteredItems = useMemo(() => {
    if (since === "all") return items;
    const now = Date.now();
    const ms = since === "1d" ? 24 * 3600e3 : since === "7d" ? 7 * 24 * 3600e3 : 30 * 24 * 3600e3;
    return items.filter((it) => now - new Date(it.pubDate).getTime() <= ms);
  }, [items, since]);

  // API 호출
  const loadNews = async () => {
    if (!q.trim()) {
      setItems([]);
      setTotal(0);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const reqKey = ++lastRequestKey.current;
    try {
      const res = await dispatch(getNaverNewsList({ query: q, display, start, sort })).unwrap(); // AxiosResponse<NewsRes>
      if (lastRequestKey.current === reqKey) {
        const data: NewsRes = res.data;
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (e: any) {
      if (lastRequestKey.current === reqKey) setError(e?.message || "요청 중 오류가 발생했습니다.");
    } finally {
      if (lastRequestKey.current === reqKey) setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(); /* eslint-disable-next-line */
  }, [q, display, start, sort]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      setQ(query);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 회색 페이지 배경 + 카드도 연회색 + 보더 강제 */}
      <style>{`
        .news-page { background:#edf0f2; min-height:100vh; } /* page bg gray */
        .news-hero { background:#e7eaee; }                   /* header gray (살짝 진한) */
        .news-card {
          background:#f8f9fa !important;                     /* card bg light gray */
          border:1px solid #cfd6de !important;               /* visible gray border */
          border-radius:12px !important;
        }
        .news-card:hover {
          border-color:#adb5bd !important;
          box-shadow:0 4px 12px rgba(0,0,0,.05);
          transform:translateY(-1px);
          transition:all .15s ease;
        }
      `}</style>

      <div className="news-page">
        <Card className="border-0 rounded-4 shadow-sm">
          {/* 컴팩트 헤더 */}
          <div className="news-hero border-bottom rounded-top-4">
            <Container className="py-3">
              <h1 className="fw-bold h4 mb-1 text-dark">네이버 뉴스 검색</h1>
              <p className="text-secondary mb-3 small">키워드/정렬/페이지 크기를 바꿔가며 빠르게 탐색해 보세요.</p>

              {/* 검색 바 */}
              <Row className="g-2 align-items-stretch">
                <Col md>
                  <InputGroup>
                    <Form.Control
                      value={query}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)}
                      onKeyDown={onKeyDown}
                      placeholder="예: 반도체, 코스피, 삼성전자"
                      aria-label="검색어"
                      size="sm"
                    />
                    {query && (
                      <Button variant="outline-secondary" size="sm" onClick={() => setQuery("")} title="지우기">
                        ×
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col xs="auto" className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="fw-semibold"
                    onClick={() => {
                      setPage(1);
                      setQ(query);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    검색
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setQ("");
                      setItems([]);
                      setTotal(0);
                      setPage(1);
                      setError(null);
                    }}
                  >
                    초기화
                  </Button>
                </Col>
              </Row>

              {/* 옵션 바 */}
              <Row className="g-3 mt-2">
                <Col xs={12} md="auto">
                  <Form.Label className="me-2 mb-0 small">정렬</Form.Label>
                  <Form.Select
                    value={sort}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setPage(1);
                      setSort(e.currentTarget.value as "date" | "sim");
                    }}
                    size="sm"
                    style={{ display: "inline-block", width: 120 }}
                  >
                    <option value="date">최신순</option>
                    <option value="sim">정확도순</option>
                  </Form.Select>
                </Col>

                <Col xs={12} md="auto">
                  <Form.Label className="me-2 mb-0 small">페이지당</Form.Label>
                  <Form.Select
                    value={display}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setPage(1);
                      setDisplay(Number(e.currentTarget.value));
                    }}
                    size="sm"
                    style={{ display: "inline-block", width: 100 }}
                  >
                    {[10, 20, 30, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}개
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} md="auto">
                  <Form.Label className="me-2 mb-0 small">기간</Form.Label>
                  <Form.Select
                    value={since}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSince(e.currentTarget.value as any)}
                    size="sm"
                    style={{ display: "inline-block", width: 120 }}
                  >
                    {SINCE_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Container>
          </div>

          {/* 본문 */}
          <Container className="py-3">
            {/* 상태 바 */}
            <Row className="align-items-center mb-3">
              <Col>
                {q ? (
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Badge bg="light" text="dark">
                      “{q}”
                    </Badge>
                    <span className="small text-muted">
                      검색 결과: <span className="fw-semibold text-dark">{total.toLocaleString()}</span>건
                      <span className="ms-1">(최대 1,000건 페이징)</span>
                    </span>
                  </div>
                ) : (
                  <div className="text-muted small">키워드를 입력하고 검색을 눌러주세요.</div>
                )}
              </Col>
              <Col xs="auto">
                {loading && (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Spinner animation="border" size="sm" /> 조회 중…
                  </div>
                )}
              </Col>
            </Row>

            {/* 에러 */}
            <Collapse in={!!error}>
              <div>
                {error && (
                  <Alert variant="danger" className="mb-3 py-2 px-3">
                    오류: {error}
                  </Alert>
                )}
              </div>
            </Collapse>

            {/* 목록 + 스켈레톤 */}
            <Row className="g-2">
              {loading &&
                Array.from({ length: Math.min(display, 8) }).map((_, i) => (
                  <Col xs={12} key={`ph-${i}`}>
                    <Card className="shadow-sm rounded-4 news-card">
                      <Card.Body className="py-3">
                        <Placeholder as={Card.Title} animation="wave">
                          <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as={Card.Text} animation="wave">
                          <Placeholder xs={12} /> <Placeholder xs={10} /> <Placeholder xs={6} />
                        </Placeholder>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}

              {!loading &&
                !error &&
                filteredItems.map((it, idx) => (
                  <Col xs={12} key={idx}>
                    <Card className="shadow-sm h-100 rounded-4 news-card">
                      <Card.Body className="py-3">
                        <Card.Title className="mb-1 h6">
                          <a
                            href={it.link}
                            target="_blank"
                            rel="noreferrer"
                            className="link-dark link-underline-opacity-0 link-underline-opacity-75-hover"
                          >
                            {toPlainText(it.title)}
                          </a>
                        </Card.Title>
                        <Card.Text className="text-muted mb-2 small">{truncate(toPlainText(it.description))}</Card.Text>
                        <div className="d-flex align-items-center gap-2 flex-wrap small text-muted">
                          <Badge bg="secondary" className="bg-opacity-25 text-dark">
                            {formatKST(it.pubDate)}
                          </Badge>
                          <a
                            className="link-secondary"
                            href={it.originallink || it.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            원문 보기
                          </a>
                          <span>·</span>
                          <a className="link-secondary" href={it.link} target="_blank" rel="noreferrer">
                            네이버 보기
                          </a>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}

              {!loading && !error && q && filteredItems.length === 0 && (
                <Col xs={12}>
                  <Alert variant="light" className="text-center text-muted">
                    표시할 결과가 없습니다.
                  </Alert>
                </Col>
              )}
            </Row>

            {/* 페이지네이션 */}
            {q && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={page <= 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                  {makePages(page, totalPages).map((p, i, arr) => {
                    const prev = i > 0 ? arr[i - 1] : undefined;
                    const gap = prev ? p - prev : 0;
                    return (
                      <React.Fragment key={p}>
                        {gap > 1 && <Pagination.Ellipsis disabled />}
                        <Pagination.Item
                          active={p === page}
                          onClick={() => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          {p}
                        </Pagination.Item>
                      </React.Fragment>
                    );
                  })}
                  <Pagination.Next
                    disabled={page >= totalPages}
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </Pagination>
              </div>
            )}
          </Container>
        </Card>
      </div>
    </>
  );
}
