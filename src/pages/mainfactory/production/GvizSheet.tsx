// src/pages/google/GvizSheet.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildGvizUrl, parseGvizJsonp, gvizToMatrix } from "@utils/googleSheets";

type Props = {
  spreadsheetId: string;
  gid?: number | string;
  height?: number | string; // 기본 "100%"
  zoom: number; // 0.1 ~ 2
  intervalSec?: number; // 자동 갱신(초). 0이면 off
  onZoomChange?: (z: number) => void;
  zoomMode?: boolean; // true면 휠로 줌, false면 스크롤
};

export default function GvizSheet({
  spreadsheetId,
  gid = 0,
  height = "100%",
  zoom,
  intervalSec = 0,
  onZoomChange,
  zoomMode = false,
}: Props) {
  const [cols, setCols] = useState<string[]>([]);
  const [rows, setRows] = useState<(string | number)[][]>([]);
  const prevRef = useRef<(string | number)[][]>([]);
  const verRef = useRef(0);
  const [changed, setChanged] = useState<Set<string>>(new Set());

  const url = useMemo(() => buildGvizUrl(spreadsheetId, gid), [spreadsheetId, gid]);

  async function loadOnce() {
    const res = await fetch(url, { cache: "no-store" });
    const txt = await res.text();
    const json = parseGvizJsonp(txt);
    const { cols, rows } = gvizToMatrix(json);

    const prev = prevRef.current;
    const nowChanged = new Set<string>();
    rows.forEach((r, ri) => {
      r.forEach((v, ci) => {
        const before = prev?.[ri]?.[ci];
        if (before !== v) nowChanged.add(`${ri}:${ci}:${verRef.current + 1}`);
      });
    });
    prevRef.current = rows;
    verRef.current += 1;

    setCols(cols);
    setRows(rows);
    setChanged(nowChanged);
    setTimeout(() => setChanged(new Set()), 650);
  }

  useEffect(() => {
    loadOnce().catch(() => {});
    if (!intervalSec) return;
    const h = setInterval(loadOnce, Math.max(1, intervalSec) * 1000);
    return () => clearInterval(h);
  }, [url, intervalSec]);

  const clamp = (z: number) => Math.min(2, Math.max(0.1, z));
  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!zoomMode) return; // 줌 모드 아닐 땐 기본 스크롤
    e.preventDefault();
    e.stopPropagation();
    const step = 0.05;
    onZoomChange?.(clamp(zoom + (e.deltaY > 0 ? -step : step)));
  };

  return (
    <div
      style={{
        width: "100%",
        height,
        overflow: "auto",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
        position: "relative",
        touchAction: "none",
      }}
      onWheelCapture={onWheelCapture}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          width: `${100 / Math.max(zoom, 0.0001)}%`,
          transition: "transform 120ms ease-out",
        }}
      >
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f9fafb", zIndex: 1 }}>
            <tr>
              {cols.map((c, i) => (
                <th
                  key={i}
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #eee",
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {c || String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((v, ci) => {
                  const key = `${ri}:${ci}:${verRef.current}`;
                  const flash = changed.has(key);
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #eee",
                        whiteSpace: "nowrap",
                        fontSize: 13,
                        background: flash ? "#fff9c4" : "transparent",
                        transition: "background-color 600ms ease",
                      }}
                    >
                      {String(v ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
