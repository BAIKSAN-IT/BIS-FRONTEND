import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@redux/store";
import { previewRndFile, SaveRndArticleFileReq } from "@redux/rnd/RndSlice";
import { useInView } from "react-intersection-observer";
/** ===== EIS 규격 컬럼 타입 (PisEisTable과 호환) ===== */
type EisTableColumn = {
  Header: string;
  accessor?: string;
  id?: string;
  columns?: EisTableColumn[];
  sort?: boolean;
  className?: string;

  /** 편집/입력 관련 (EditableCell 호환) */
  editable?: boolean;
  type?: "text" | "select" | "checkbox";
  options?: any;
  isOptionsNull?: boolean;

  /** 숫자 표기/검증용 플래그 */
  number?: boolean;
  numberMode?: "int" | "decimal";

  /** 레이아웃 */
  minWidth?: number;
  width?: number;
  maxWidth?: number;

  /** 기타 */
  isSearchBtn?: boolean;
  disabled?: boolean;

  /** 고정 컬럼(있으면 PisEisTable이 sticky 처리) */
  leftSticky?: boolean;
  rightSticky?: boolean;

  /** 그룹 경계선 */
  groupEnd?: boolean;

  /** react-table 셀 렌더러 */
  Cell?: any;
};

/* 날짜 변환 */
const formatYYYYMMDD = (v?: string | number) => {
  if (!v) return "";
  const s = String(v);
  if (s.length !== 8) return s; // 예외 방어
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

/** 파일 표시명 추출 */
const fileDisplayName = (f: SaveRndArticleFileReq | any) =>
  f?.imgFileNameOrg || f?.imgFileName || f?.nmFile || f?.fileName || "";

/** 이미지 확장자 판별 */
const isImg = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

/** seqArticle별 첫 번째 이미지 파일명 맵 생성 */
const buildFirstImageMap = (files?: SaveRndArticleFileReq[]) => {
  const map: Record<string, string> = {};
  if (!files?.length) return map;

  const sorted = [...files]
    .filter((f) => (f as any).ynFlag !== "D" && isImg(fileDisplayName(f)))
    .sort((a: any, b: any) => (Number(a.seq) || 0) - (Number(b.seq) || 0));

  for (const f of sorted) {
    const key = String((f as any).seqArticle || "");
    if (key && map[key] == null) map[key] = fileDisplayName(f);
  }
  return map;
};

// objectURL 캐시
const THUMB_URL_CACHE = new Map<string, string>();

const isTouch = () =>
  typeof window !== "undefined" && ("ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0);

/** 썸네일 셀 */
const ThumbCell: React.FC<{ seqArticle: string; fileName?: string }> = React.memo(
  ({ seqArticle, fileName }) => {

    const dispatch = useDispatch<AppDispatch>();

    const [url, setUrl] = useState<string>("");
    const [open, setOpen] = useState(false);

    const closeTimer = useRef<number | null>(null);
    const touchDevice = useMemo(isTouch, []);

    useEffect(() => {
      if (!seqArticle || !fileName) {
        if (url !== "") setUrl("");
        return;
      }
      const key = `${seqArticle}__${fileName}`;

      const cached = THUMB_URL_CACHE.get(key);
      if (cached) {
        if (url !== cached) setUrl(cached);
        return;
      }

      let cancelled = false;
      (async () => {
        try {
          const res: any = await dispatch(previewRndFile({ seqArticle, fileName })).unwrap();
          const blob: Blob =
            res?.data instanceof Blob
              ? res.data
              : new Blob([res?.data ?? new Uint8Array()], {
                type: res?.headers?.["content-type"] || "image/*",
              });
          if (blob.size === 0) {
            if (!cancelled) setUrl("");
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          THUMB_URL_CACHE.set(key, objectUrl);
          setUrl(objectUrl);
        } catch {
          if (!cancelled) setUrl("");
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [seqArticle, fileName, dispatch]);

    /* Hover Preview */
    const clearCloseTimer = () => {
      if (closeTimer.current != null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };

    const handleEnter = () => {
      if (touchDevice) return;
      clearCloseTimer();
      setOpen(true);
    };

    const handleLeave = () => {
      if (touchDevice) return;
      clearCloseTimer();

      closeTimer.current = window.setTimeout(() => {
        setOpen(false);
        closeTimer.current = null;
      }, 120);
    };

    const handleTap = () => {
      if (!touchDevice) return;
      setOpen((v) => !v);
    };

    return (
      <div>
        {/* 썸네일 */}
        {url ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            style={{
              width: 80,
              height: 50,
              borderRadius: 4,
              cursor: touchDevice ? "pointer" : "zoom-in",
            }}
            onError={() => setUrl("")}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={handleTap}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 50,
              borderRadius: 4,
              background: "#E2E8F0",
              color: "#4A5568",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            NoImg
          </div>
        )}

        {/* 미리보기 */}
        {open &&
          url &&
          createPortal(
            <div
              aria-modal
              role="dialog"
              onClick={() => touchDevice && setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: touchDevice ? "rgba(0,0,0,0.45)" : "transparent",
                zIndex: 2147483647,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: touchDevice ? "auto" : "none",
              }}
            >
              <div
                onClick={(e) => touchDevice && e.stopPropagation()}
                style={{
                  position: "relative",
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <img
                  src={url}
                  alt="preview"
                  style={{
                    display: "block",
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    objectFit: "contain",
                  }}
                />

                {touchDevice && (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      border: "none",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  },

  (prev, next) =>
    prev.seqArticle === next.seqArticle &&
    prev.fileName === next.fileName
);
/** ===== 컬럼 팩토리 (EIS 규격) ===== */
export const FabricLibraryListTableColumns = (fileList?: SaveRndArticleFileReq[]): EisTableColumn[] => {
  const firstImageBySeq = buildFirstImageMap(fileList);

  const base: EisTableColumn[] = [
    {
      Header: "INFORMATION",
      columns: [
        {
          Header: "NO",
          id: "seqNo",
          accessor: "seqNo",
          minWidth: 10,
          width: 40,
          maxWidth: 300,
          sort: false,
          type: "text",
          className: "text-center",
        },
        // IMG (썸네일) — accessor는 seqArticle, id는 별도로 thumbnail
        {
          Header: "IMG",
          id: "thumbnail",
          accessor: "seqArticle",
          minWidth: 80,
          width: 80,
          maxWidth: 300,
          sort: false,
          type: "text",
          className: "text-center",
          Cell: ({ row }: any) => {
            const seq = String(row.original.seqArticle || "");
            const fileName = firstImageBySeq[seq];
            return <ThumbCell seqArticle={seq} fileName={fileName} />;
          },
        },
        {
          Header: "DATE",
          accessor: "dtHanger",
          id: "dtHanger",
          minWidth: 80,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
          Cell: ({ value }: any) => formatYYYYMMDD(value),
        },
        {
          Header: "BUYER",
          accessor: "nmBuyer",
          id: "nmBuyer",
          minWidth: 80,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SEASON",
          accessor: "nmSeason",
          id: "nmSeason",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "HANGER#",
          accessor: "cdHanger",
          id: "cdHanger",
          minWidth: 80,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "FABRIC TYPE",
          accessor: "nmFabricStructure",
          id: "nmFabricStructure",
          minWidth: 80,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SECOND FABRIC TYPE",
          accessor: "fabricSecondStructure",
          id: "fabricSecondStructure",
          minWidth: 80,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "YARN DETAIL",
          accessor: "nmFabric",
          id: "nmFabric",
          minWidth: 40,
          width: 180,
          maxWidth: 2000,
          sort: true,
          type: "text",
        },
        {
          Header: "COMPOSITION",
          accessor: "composition",
          id: "composition",
          minWidth: 80,
          width: 180,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "WEIGHT(G/SQM)",
          accessor: "wgtGsm",
          id: "wgtGsm",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "WIDTH(INCH)",
          accessor: "fabricInch",
          id: "fabricInch",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "COLOR",
          accessor: "nmColor",
          id: "nmColor",
          minWidth: 80,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SUPPLIER",
          accessor: "nmSupplier",
          id: "nmSupplier",
          minWidth: 80,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        { Header: "STYLE#", id: "noSample",accessor: "noSample", minWidth: 80, width: 120, maxWidth: 1000, sort: true, type: "text" },
        {
          Header: "LOT#",
          accessor: "noLot",
          id: "noLot",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "PRICE/YD",
          accessor: "pricePerYard",
          id: "pricePerYard",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
        },
        {
          Header: "PRICE/KG",
          accessor: "pricePerWight",
          id: "pricePerWight",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
        },
        {
          Header: "PRICE/MT",
          accessor: "pricePerMeter",
          id: "pricePerMeter",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
        },
        {
          Header: "REMARK",
          accessor: "remark",
          id: "remark",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SAMPLE#",
          accessor: "2",
          id: "2",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "STYLE DESCRIPTION#",
          accessor: "styleDesc",
          id: "styleDesc",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SAMPLE IMAGE",
          accessor: "1",
          id: "1",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "INTERNAL ISSUE",
          accessor: "internalNotify",
          id: "internalNotify",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "GAUGE",
          accessor: "fabricGauge",
          id: "fabricGauge",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
        },
      ],
    },
  ];

  return base;
};

export default FabricLibraryListTableColumns;
