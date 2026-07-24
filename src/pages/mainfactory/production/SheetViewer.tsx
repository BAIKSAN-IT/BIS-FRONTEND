// src/pages/google/SheetViewer.tsx — v2 (Print Preview Window + Strict Ctrl+Wheel Zoom)
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  UrlMap,
  GidMap,
  IdMap,
  buildEmbedUrlFromAny,
  withCacheBust,
  openEdit,
  extractEditId,
  loadUrls,
  saveUrls,
  loadGids,
  saveGids,
  loadIds,
  saveIds,
  resolveFactoryKeyByCdFty,
} from "@utils/googleSheets";
import GvizSheet from "./GvizSheet";
import { useSelector } from "react-redux";
import type { RootState } from "@redux/store";

type Props = {
  namespace: string; // "vina" | "bago" | "pktt"
  defaultUrls: UrlMap; // pubhtml or /d/e/... URL
  editUrls?: UrlMap; // “수정(원본 열기)” URL
  editIds?: IdMap; // (선택) GViz용 spreadsheet id
  startEmpty?: boolean; // cdFty 없거나 미매핑이면 빈 화면
};

const REFRESH_SEC = 300;
const clamp = (z: number) => Math.min(2, Math.max(0.1, z));

export default function SheetViewer({ namespace, defaultUrls, editUrls, editIds, startEmpty = false }: Props) {
  // Redux
  const { userEnvInfo } = useSelector((s: RootState) => ({ userEnvInfo: s.Tablet.userEnvInfo }));
  const cdFty = userEnvInfo?.cdFty;

  const factoryKeys = useMemo(() => Object.keys(defaultUrls), [defaultUrls]);

  // 저장/로드
  const [urls, setUrls] = useState<UrlMap>(() => loadUrls(namespace, defaultUrls));
  const [gids, setGids] = useState<GidMap>(() => loadGids(namespace, factoryKeys));
  const [ids, setIds] = useState<IdMap>(() => {
    const base = loadIds(namespace, factoryKeys);
    return editIds ? { ...base, ...editIds } : base;
  });

  // 활성키: cdFty 없거나 미매핑이면 빈 화면
  const computeInitialKey = useCallback(() => {
    const hasCd = !!cdFty && String(cdFty).trim() !== "";
    if (!hasCd) return "";
    const byCode = resolveFactoryKeyByCdFty(namespace, cdFty);
    return byCode || "";
  }, [namespace, cdFty]);

  const [active, setActive] = useState<string>(computeInitialKey);

  // 리셋
  useEffect(() => {
    const keys = Object.keys(defaultUrls);
    setUrls(loadUrls(namespace, defaultUrls));
    setGids(loadGids(namespace, keys));
    const base = loadIds(namespace, keys);
    setIds(editIds ? { ...base, ...editIds } : base);
    setActive(computeInitialKey());
  }, [namespace, defaultUrls, editIds, cdFty, startEmpty, computeInitialKey]);

  // 저장
  useEffect(() => saveUrls(namespace, urls), [namespace, urls]);
  useEffect(() => saveGids(namespace, gids), [namespace, gids]);
  useEffect(() => saveIds(namespace, ids), [namespace, ids]);

  // 현재 리소스
  const rawUrl = active ? urls[active] || "" : "";
  const gid = active ? (gids[active] as number | string) ?? 0 : 0;
  const rawIdOrUrl = active ? ids[active] || "" : "";
  const ssId = rawIdOrUrl ? extractEditId(rawIdOrUrl) || "" : "";
  const editUrl = active ? editUrls?.[active] || (rawIdOrUrl.startsWith("http") ? rawIdOrUrl : undefined) : undefined;
  const hasUrl = !!rawUrl;

  // 임베드 URL (pubhtml)
  const embedBaseUrl = useMemo(
    () => (hasUrl ? buildEmbedUrlFromAny(rawUrl, { gid, widget: true, headers: true, single: false }) : ""),
    [rawUrl, gid, hasUrl]
  );

  /** ── 줌: Ctrl + 휠 (페이지 줌/스크롤 완전 차단) ── */
  const [zoom, setZoom] = useState<number>(0.9);
  const [ctrlZoom, setCtrlZoom] = useState(false);
  const ctrlDownRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseInRef = useRef(false);
  const prevOverscrollRef = useRef<string>("");

  const enableCtrlZoom = useCallback(() => {
    if (ctrlDownRef.current) return;
    ctrlDownRef.current = true;
    setCtrlZoom(true);
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "auto"; // 휠 100% 가로채기
      overlayRef.current.style.cursor = "zoom-in";
    }
    prevOverscrollRef.current = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "none"; // 스크롤 체인 방지
  }, []);

  const disableCtrlZoom = useCallback(() => {
    if (!ctrlDownRef.current) return;
    ctrlDownRef.current = false;
    setCtrlZoom(false);
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "none";
      overlayRef.current.style.cursor = "default";
    }
    document.body.style.overscrollBehavior = prevOverscrollRef.current || "";
  }, []);

  // 컨테이너 안에 마우스가 있을 때만 Ctrl+휠로 페이지 줌이 발생하지 않도록 전역 wheel 캡처
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!mouseInRef.current) return; // 뷰어 영역 밖이면 무시
      if (e.ctrlKey) {
        // 브라우저 기본 줌 차단
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel as any, true);
    };
  }, []);

  // 키보드: Ctrl 눌린 동안만 줌 활성화. (Ctrl+"+/-/0" 단축키도 뷰어 안에서는 차단)
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

    const onDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if ((e.key || "") === "Control") enableCtrlZoom();

      if (mouseInRef.current && e.ctrlKey) {
        const k = (e.key || "").toLowerCase();
        if (["+", "=", "-"].includes(k)) {
          e.preventDefault();
          if (k === "+" || k === "=") setZoom((z) => clamp(z * 1.06));
          if (k === "-") setZoom((z) => clamp(z * 0.94));
        } else if (k === "0") {
          e.preventDefault();
          setZoom(1);
        }
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if ((e.key || "") === "Control") disableCtrlZoom();
    };

    window.addEventListener("keydown", onDown, { capture: true });
    window.addEventListener("keyup", onUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onDown as any, true);
      window.removeEventListener("keyup", onUp as any, true);
      disableCtrlZoom();
    };
  }, [enableCtrlZoom, disableCtrlZoom]);

  /** ── iframe 더블버퍼 ── */
  const fadeMs = 260,
    settleMs = 700;
  const [topIdx, setTopIdx] = useState<0 | 1>(0);
  const [srcs, setSrcs] = useState<[string, string]>(() => [
    embedBaseUrl ? withCacheBust(embedBaseUrl, Date.now()) : "",
    "",
  ]);
  const topIdxRef = useRef<0 | 1>(0);
  const srcsRef = useRef<[string, string]>(["", ""]);
  const busyRef = useRef(false);
  const pendingIdxRef = useRef<0 | 1 | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const [curtainOn, setCurtainOn] = useState(false);

  // 보이는 iframe 참조
  const iframeRefs = useRef<[HTMLIFrameElement | null, HTMLIFrameElement | null]>([null, null]);

  useEffect(() => {
    topIdxRef.current = topIdx;
  }, [topIdx]);
  useEffect(() => {
    srcsRef.current = srcs;
  }, [srcs]);

  useEffect(() => {
    if (!embedBaseUrl) {
      setSrcs(["", ""]);
      setTopIdx(0);
      setCurtainOn(false);
      busyRef.current = false;
      pendingIdxRef.current = null;
      pendingUrlRef.current = null;
      return;
    }
    const first = withCacheBust(embedBaseUrl, Date.now());
    setSrcs([first, "about:blank"]);
    setTopIdx(0);
    setCurtainOn(false);
    busyRef.current = false;
    pendingIdxRef.current = null;
    pendingUrlRef.current = null;
  }, [embedBaseUrl]);

  const requestRefresh = useCallback(() => {
    if (!embedBaseUrl || busyRef.current) return;
    const hidden = (topIdxRef.current ^ 1) as 0 | 1;
    const nextUrl = withCacheBust(embedBaseUrl, Date.now());
    pendingIdxRef.current = hidden;
    pendingUrlRef.current = nextUrl;
    setSrcs((curr) => {
      const next = [...curr] as [string, string];
      next[hidden] = nextUrl;
      return next;
    });
  }, [embedBaseUrl]);

  useEffect(() => {
    if (!hasUrl) return;
    if (ssId) return;
    const h = setInterval(requestRefresh, REFRESH_SEC * 1000);
    return () => clearInterval(h);
  }, [requestRefresh, ssId, hasUrl]);

  const onHiddenLoad = (loadedIdx: 0 | 1) => {
    if (busyRef.current) return;
    if (pendingIdxRef.current !== loadedIdx) return;
    const expectedUrl = pendingUrlRef.current;
    if (!expectedUrl) return;
    if (srcsRef.current[loadedIdx] !== expectedUrl) return;

    busyRef.current = true;
    const prevTop = topIdxRef.current;
    const newTop = loadedIdx;

    setTimeout(() => {
      setCurtainOn(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTopIdx(newTop);
          setTimeout(() => {
            setCurtainOn(false);
            setTimeout(() => {
              setSrcs((curr) => {
                const next = [...curr] as [string, string];
                next[prevTop] = "about:blank";
                return next;
              });
              pendingIdxRef.current = null;
              pendingUrlRef.current = null;
              busyRef.current = false;
            }, 120);
          }, fadeMs);
        });
      });
    }, settleMs);
  };

  const handleOpenEdit = () => {
    if (!hasUrl) return;
    if (editUrl) {
      window.open(editUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (ssId) {
      openEdit(ssId, gid);
      return;
    }
    if (extractEditId(rawUrl)) {
      openEdit(rawUrl, gid);
      return;
    }
    window.open(rawUrl, "_blank", "noopener,noreferrer");
  };

  /** ── 결과 출력: 새 창(프록시) 열고 자동 프린트 ── */
  const handleOpenPrintWindow = () => {
    if (!hasUrl || !embedBaseUrl) return;
    const openUrl = withCacheBust(embedBaseUrl, Date.now());
    window.open(openUrl, "_blank", "popup,width=1280,height=860,noopener,noreferrer");
  };

  const useGviz = !!ssId && hasUrl;

  // ===== Styles =====
  const baseFrameStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    border: 0,
    display: "block",
    transform: `scale(${zoom})`,
    transformOrigin: "0 0",
    width: `${100 / Math.max(zoom, 0.0001)}%`,
    height: `${100 / Math.max(zoom, 0.0001)}%`,
    background: "#fff",
    transition: "transform 120ms ease-out",
    willChange: "transform",
    backfaceVisibility: "hidden",
  };
  const styleOf = (idx: 0 | 1): React.CSSProperties => ({
    ...baseFrameStyle,
    zIndex: idx === topIdx ? 2 : 1,
    pointerEvents: ctrlZoom ? "none" : idx === topIdx ? "auto" : "none", // Ctrl 줌 중에는 iframe 히트테스트 차단
  });

  const reason =
    !cdFty || String(cdFty).trim() === ""
      ? "공장을 선택해주세요."
      : !resolveFactoryKeyByCdFty(namespace, cdFty)
      ? "해당 공장에 연결된 시트가 없습니다."
      : !hasUrl
      ? "선택된 공장의 시트 URL이 설정되어 있지 않습니다."
      : "";

  // 컨테이너에서 마우스 진입/이탈
  const onEnter = () => (mouseInRef.current = true);
  const onLeave = () => (mouseInRef.current = false);

  // 컨테이너 백업 핸들러: Ctrl 중이면 스크롤/줌 모두 차단
  const onContainerWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!ctrlDownRef.current) return;
    e.preventDefault();
    e.stopPropagation();
  };

  // 오버레이 onWheel: Ctrl 중 휠 → 줌
  const onOverlayWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!ctrlDownRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    setZoom((z) => clamp(z * factor));
  };

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateRows: "auto 1fr", gap: 8, padding: 12, minHeight: 0 }}>
      {/* 상단: 수정 + 결과 출력 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={handleOpenEdit} className="system-page-title-button" disabled={!hasUrl}>
          수정(원본 열기)
        </button>
      </div>

      {/* 본문 */}
      <div
        ref={containerRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onWheel={onContainerWheel}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
          outline: "none",
          overscrollBehavior: "contain",
          minHeight: 0,
        }}
      >
        {!active || !hasUrl ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 14,
              padding: 16,
              textAlign: "center",
            }}
          >
            {reason || "시트를 표시할 공장이 아직 선택되지 않았습니다."}
          </div>
        ) : useGviz ? (
          <GvizSheet
            spreadsheetId={ssId}
            gid={gid}
            height="100%"
            zoom={zoom}
            intervalSec={REFRESH_SEC}
            onZoomChange={setZoom}
            zoomMode={ctrlZoom}
          />
        ) : (
          <>
            <iframe
              ref={(el) => (iframeRefs.current[0] = el)}
              src={srcs[0] || "about:blank"}
              title="GoogleSheetEmbed-0"
              style={styleOf(0)}
              onLoad={() => onHiddenLoad(0)}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <iframe
              ref={(el) => (iframeRefs.current[1] = el)}
              src={srcs[1] || "about:blank"}
              title="GoogleSheetEmbed-1"
              style={styleOf(1)}
              onLoad={() => onHiddenLoad(1)}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#0b0f19",
                opacity: curtainOn ? 0.2 : 0,
                transition: `opacity ${fadeMs}ms ease`,
                pointerEvents: "none",
                zIndex: 998,
              }}
            />
          </>
        )}

        {/* Ctrl-줌 오버레이 (휠 100% 가로채기) */}
        <div
          ref={overlayRef}
          onWheel={onOverlayWheel}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: ctrlZoom ? "auto" : "none",
            background: "transparent",
            zIndex: 9999,
            touchAction: "none",
          }}
          aria-hidden
          title={ctrlZoom ? "Ctrl+휠로 확대/축소 — Ctrl을 떼면 해제" : undefined}
        />
      </div>
    </div>
  );
}
