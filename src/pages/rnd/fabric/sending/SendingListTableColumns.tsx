import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { previewRndFile, SaveRndArticleFileReq } from "../../../../redux/rnd/RndSlice";

/** 파일 표시명 */
const fileDisplayName = (f: SaveRndArticleFileReq | any) =>
  f?.imgFileNameOrg || f?.imgFileName || f?.nmFile || f?.fileName || "";

/** 이미지 이름인지 */
const isImg = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

/** seqArticle 별 첫 이미지 파일명 */
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

const THUMB_URL_CACHE = new Map<string, string>();
const isTouch = () =>
  typeof window !== "undefined" && ("ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
            NO IMG
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

const SendingListTableColumns = (fileList?: SaveRndArticleFileReq[]) => {
  const firstImageBySeq = buildFirstImageMap(fileList);

  const base: any[] = [
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
          disabled: true,
        },
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
          width: 150,
          maxWidth: 2000,
          sort: true,
          disabled: true,
          type: "text",
          editable: false,
        },
        /*{
          Header: "QR#",
          accessor: "qrcode",
          width: 150,
          maxWidth: 2000,
          sort: true,
          disabled: true,
          type: "text",
          editable: false,
        },*/
        {
          Header: "HANGER(Y/N)",
          accessor: "ynHanger", // 화면/저장 통일 필드
          minWidth: 40,
          width: 120,
          maxWidth: 2000,
          sort: true,
          disabled: false,
          type: "checkbox",
          editable: true,
          options: [
            { value: "0", label: "N" },
            { value: "1", label: "Y" },
          ],
        },
        {
          Header: "SWATCH(Y/N)",
          accessor: "ynSwatch", // 화면/저장 통일 필드
          minWidth: 40,
          width: 120,
          maxWidth: 2000,
          sort: true,
          disabled: false,
          type: "checkbox",
          editable: true,
          options: [
            { value: "0", label: "N" },
            { value: "1", label: "Y" },
          ],
        },
        /*{
          Header: "CONFIRM Y/N",
          accessor: "nmYnConfirm",
          width: 120,
          maxWidth: 2000,
          sort: true,
          disabled: true,
          type: "text",
          editable: false,
        },*/
        {
          Header: "FABRIC TYPE",
          accessor: "nmFabricStructure",
          id: "nmFabricStructure",
          minWidth: 80,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
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
          disabled: true,
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
          disabled: true,
        },
        {
          Header: "COMPOSITION",
          accessor: "composition",
          id: "composition",
          minWidth: 40,
          width: 180,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
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
          disabled: true,
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
          disabled: true,
        },
        {
          Header: "COLOR",
          accessor: "nmColor",
          id: "nmColor",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        {
          Header: "SUPPLIER",
          accessor: "nmSupplier",
          id: "nmSupplier",
          minWidth: 40,
          width: 100,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        { Header: "STYLE#", id: "noSample",accessor: "noSample", minWidth: 80, width: 120, maxWidth: 1000, sort: true, type: "text",disabled: true },
        {
          Header: "LOT#",
          accessor: "noLot",
          id: "noLot",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          className: "text-center",
          disabled: true,
        },
        {
          Header: "PRICE/YD",
          accessor: "pricePerYard",
          id: "pricePerYard",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
          disabled: true,
        },
        {
          Header: "PRICE/KG",
          accessor: "pricePerWight",
          id: "pricePerWight",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
          disabled: true,
        },
        {
          Header: "PRICE/MT",
          accessor: "pricePerMeter",
          id: "pricePerMeter",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
          disabled: true,
        },
        {
          Header: "REMARK",
          accessor: "remark",
          id: "remark",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
        },
        {
          Header: "SAMPLE#",
          accessor: "2",
          id: "2",
          minWidth: 40,
          width: 80,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        {
          Header: "STYLE DESCRIPTION#",
          accessor: "styleDesc",
          id: "styleDesc",
          minWidth: 40,
          width: 90,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        {
          Header: "SAMPLE IMAGE",
          accessor: "1",
          id: "1",
          minWidth: 80,
          width: 90,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        {
          Header: "INTERNAL ISSUE",
          accessor: "internalNotify",
          id: "internalNotify",
          minWidth: 40,
          width: 120,
          maxWidth: 1000,
          sort: true,
          type: "text",
          disabled: true,
        },
        {
          Header: "GAUGE",
          accessor: "fabricGauge",
          id: "fabricGauge",
          minWidth: 30,
          width: 60,
          maxWidth: 1000,
          sort: true,
          type: "text",
          number: true,
          className: "text-end",
          disabled: true,
        },
      ],
    },
    {
      Header: "REMARK DETAIL",
      id: "remarkDetail",
      accessor: "remarkDetail",
      minWidth: 50,
      width: 200,
      maxWidth: 2000,
      sort: true,
      disabled: false,
      type: "text",
      editable: true,
    },
  ];

  return base;
};

export default SendingListTableColumns;
