import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@redux/store";
import { previewRndFile } from "@redux/rnd/RndSlice";
import { RndArticleFileRes } from "@redux/rnd/inventorySlice";

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

/** 파일 표시명 추출 */
const fileDisplayName = (f: RndArticleFileRes | any) =>
  f?.imgFileNameOrg || f?.imgFileName || f?.nmFile || f?.fileName || "";

/** 이미지 확장자 판별 */
const isImg = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

/** seqArticle별 첫 번째 이미지 파일명 맵 생성 */
const buildFirstImageMap = (files?: RndArticleFileRes[]) => {
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
      <>
        {url ? (
          <img
            src={url}
            alt=""
            style={{
              width: 80,
              height: 50,
              borderRadius: 4,
              cursor: touchDevice ? "pointer" : "zoom-in",
            }}
            onError={() => setUrl("")}
            title={touchDevice ? "Tap to preview" : "Hover to preview"}
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
            title="No image"
          >
            NoImg
          </div>
        )}

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
                  boxShadow: touchDevice ? "0 12px 32px rgba(0,0,0,0.4)" : "none",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: touchDevice ? "#fff" : "transparent",
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
                    pointerEvents: "none",
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
                    title="Close"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}
      </>
    );
  },
  (prev, next) => prev.seqArticle === next.seqArticle && prev.fileName === next.fileName
);

/** ===== 컬럼 팩토리 (EIS 규격) ===== */
export const FabricInventoryListTableColumns = (fileList?: RndArticleFileRes[]): EisTableColumn[] => {
  const firstImageBySeq = buildFirstImageMap(fileList);

  const base: EisTableColumn[] = [
    {
      Header: "INFORMATION",
      columns: [
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
          Header: "HANGER#",
          accessor: "cdHanger",
          minWidth: 40,
          width: 110,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "INPUT",
          accessor: "qtyQr",
          minWidth: 20,
          width: 50,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "SEND",
          accessor: "qtySend",
          minWidth: 20,
          width: 50,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "RETURN",
          accessor: "qtyReturn",
          minWidth: 20,
          width: 60,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "JUNK",
          accessor: "qtyJunk",
          minWidth: 20,
          width: 50,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "STOCK",
          accessor: "qtyStock",
          minWidth: 20,
          width: 50,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        /*{
          Header: "CONFIRM Y/N",
          accessor: "nmYnConfirm",
          minWidth: 80,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },*/
        { Header: "STYLE#", accessor: "noSample", minWidth: 80, width: 200, maxWidth: 1000, sort: true, type: "text" },
        {
          Header: "LOT#",
          accessor: "noLot",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "COMPOSITION",
          accessor: "composition",
          minWidth: 80,
          width: 350,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "FABRIC DIVISION",
          accessor: "nmFabricDivision",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "PRODUCT TYPE",
          accessor: "nmProductType",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "FABRIC TYPE",
          accessor: "nmFabricType",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "KNIT CATEGORY",
          accessor: "nmFabricCategory",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "STRUCTURE",
          accessor: "nmFabricStructure",
          minWidth: 40,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
      ],
    },
    {
      Header: "KNITTING INFORMATION",
      columns: [
        {
          Header: "MACHINE INCH",
          accessor: "widthInch",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "GAUGE",
          accessor: "fabricGauge",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "NEEDLE",
          accessor: "nuNidcnt",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
      ],
    },
    {
      Header: "WEIGHT",
      columns: [
        {
          Header: "WGTGSM",
          accessor: "wgtGsm",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "WGTYDM",
          accessor: "wgtYdm",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
      ],
    },
    {
      Header: "PRICE",
      columns: [
        {
          Header: "CURRENCY",
          accessor: "cdCurrency",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "PRICE/YDS",
          accessor: "pricePerYard",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "PRICE/KG",
          accessor: "pricePerWight",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
        {
          Header: "PRICE/METER",
          accessor: "pricePerMeter",
          minWidth: 80,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
        },
      ],
    },
    {
      Header: "Q’LTY CONCERN",
      columns: [
        {
          Header: "INTERNAL ISSUE",
          accessor: "internalNotify",
          minWidth: 80,
          width: 180,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
      ],
    },
  ];

  return base;
};

export default FabricInventoryListTableColumns;
