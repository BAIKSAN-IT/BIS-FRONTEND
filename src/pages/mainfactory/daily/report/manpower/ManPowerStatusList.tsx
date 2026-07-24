// src/pages/mainfactory/daily/status/manpower/ManPowerStatusList.tsx
import React, { memo } from "react";

/* redux */
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/* components */
import { FactoryDef } from "../DailyReport";

export interface Props {
  factories: FactoryDef[];
  data: DailyReportListRes[] | [];
  leftItemWidth?: number;
  unitWidth?: number;
}

/** 공장키 → amt 컬럼 인덱스 */
type FactoryKey = "vina" | "tamthang" | "bago" | "total";
const FIDX: Record<FactoryKey, 1 | 2 | 3 | 4> = { vina: 1, tamthang: 2, bago: 3, total: 4 };
type AmtKey = `amt${1 | 2 | 3 | 4}${1 | 2 | 3}`;
const keyOf = (f: FactoryKey, i: 1 | 2 | 3): AmtKey => `amt${FIDX[f]}${i}` as AmtKey;

/** noRow 코드 매핑 (사용자 규칙) */
const CODE = {
  TOTAL: "01",
  SEWING_GENERAL: "03",
  KNITTING: "04",
  DYEING: "05",
  YARN_DYEING: "06",
  GENERAL: "07",
} as const;

/** 테이블 표시 순서 */
const ROWS: { type: "data" | "calc"; label: string; noRow?: string }[] = [
  { type: "data", label: "Total", noRow: CODE.TOTAL },
  { type: "calc", label: "Sewing" }, // ← 계산행
  { type: "data", label: "Sewing General", noRow: CODE.SEWING_GENERAL },
  { type: "data", label: "Knitting", noRow: CODE.KNITTING },
  { type: "data", label: "Dyeing", noRow: CODE.DYEING },
  { type: "data", label: "Yarn-Dyeing", noRow: CODE.YARN_DYEING },
  { type: "data", label: "General", noRow: CODE.GENERAL },
];

const n = (v: any) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const nz = (v: any) => Number(v ?? 0);

/** 표시 규칙:
 * - null/undefined/"" → 빈칸
 * - 숫자 0 → "-"
 * - 숫자 → Number/percent 포맷
 */
const formatCell = (v: number | null, percent = false) => {
  if (v === null || v === undefined || v === ("" as any)) return "";
  if (!isFinite(Number(v))) return "";
  if (Number(v) === 0) return "-";
  return percent ? `${Number(v).toFixed(2)}%` : Number(v).toLocaleString();
};

const absRate = (total: number | null, attend: number | null): number | null => {
  if (total === null || attend === null) return null;
  if (total === 0) return 0; // 표시단에서 "-" 로 보임
  return ((total - attend) / total) * 100;
};

const ManPowerStatusList: React.FC<Props> = memo(({ factories, data, leftItemWidth = 120, unitWidth = 40 }) => {
  const rows = Array.isArray(data) ? (data as DailyReportListRes[]) : [];
  const byNoRow = rows.reduce<Record<string, DailyReportListRes | undefined>>((a, r) => {
    if (r?.noRow) a[r.noRow] = r;
    return a;
  }, {});

  /** Sewing(계산행): 01 - (03 + 04 + 05 + 06 + 07) */
  const calcSewing = (f: FactoryKey) => {
    const T = n(byNoRow[CODE.TOTAL]?.[keyOf(f, 1) as keyof DailyReportListRes]);
    const A = n(byNoRow[CODE.TOTAL]?.[keyOf(f, 2) as keyof DailyReportListRes]);

    const partsT =
      nz(byNoRow[CODE.SEWING_GENERAL]?.[keyOf(f, 1) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.KNITTING]?.[keyOf(f, 1) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.DYEING]?.[keyOf(f, 1) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.YARN_DYEING]?.[keyOf(f, 1) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.GENERAL]?.[keyOf(f, 1) as keyof DailyReportListRes]);

    const partsA =
      nz(byNoRow[CODE.SEWING_GENERAL]?.[keyOf(f, 2) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.KNITTING]?.[keyOf(f, 2) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.DYEING]?.[keyOf(f, 2) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.YARN_DYEING]?.[keyOf(f, 2) as keyof DailyReportListRes]) +
      nz(byNoRow[CODE.GENERAL]?.[keyOf(f, 2) as keyof DailyReportListRes]);

    const t = T === null ? null : T - partsT;
    const a = A === null ? null : A - partsA;
    return { t, a, r: absRate(t, a) };
  };

  return (
    <div className="mp-wrap">
      <style>{`
          .mp-wrap { overflow:auto; }
          .mp-table { border-collapse:separate; border-spacing:0; width:max-content; font-size:11px; }
          .mp-table th, .mp-table td { border:1px solid #bbb; padding:0px 10px; text-align:center; white-space:nowrap; height:25px; line-height:1.25; }

          .mp-head { background:#efe2b3; font-weight:700; }
          .mp-subhead { background:##efe2b3; font-weight:600; }
          .mp-left-head { background:#efe2b3; font-weight:700; }
          .mp-left-cell { background:#fff; text-align:left; padding-left:8px; } /* 좌측 라벨은 흰색 유지 */
          .mp-total { background:#f5d4d4; }                                   /* Total 블록 분홍 */
          .mp-sticky { position:sticky; left:0; z-index:3; background:#efe2b3; }
          .mp-left-head.mp-sticky { z-index:4; }

        `}</style>
      <table className="mp-table">
        <thead>
          <tr className="mp-head">
            {/* Department 헤더 2행 병합 */}
            <th
              className="mp-left-head mp-sticky"
              rowSpan={2}
              style={{ minWidth: leftItemWidth, maxWidth: leftItemWidth }}
            >
              DEPARTMENT
            </th>
            {factories.map((f) => (
              <th
                key={f.key}
                className={"mp-subhead" + (f.isTotal ? " mp-total" : "")}
                colSpan={3}
                style={{
                  minWidth: unitWidth * 3,
                }}
              >
                {f.label}
              </th>
            ))}
          </tr>
          <tr className="mp-head">
            {factories.map((f) => (
              <React.Fragment key={`sub-${f.key}`}>
                <th className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth }}>
                  Total
                </th>
                <th className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth }}>
                  Attendance
                </th>
                <th className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth }}>
                  Absenteeism&nbsp;Rate
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              {/* 좌측 셀은 항상 흰색 */}
              <td
                className="mp-left-cell mp-sticky"
                style={{ minWidth: leftItemWidth, maxWidth: leftItemWidth, fontWeight: "700" }}
              >
                {row.label}
              </td>

              {factories.map((f) => {
                let total: number | null = null;
                let attend: number | null = null;
                let rate: number | null = null;

                if (row.type === "calc") {
                  const s = calcSewing(f.key as FactoryKey);
                  total = s.t;
                  attend = s.a;
                  rate = s.r;
                } else {
                  const raw = byNoRow[row.noRow as string];
                  total = n(raw?.[keyOf(f.key as FactoryKey, 1) as keyof DailyReportListRes]);
                  attend = n(raw?.[keyOf(f.key as FactoryKey, 2) as keyof DailyReportListRes]);
                  rate = absRate(total, attend);
                }

                return (
                  <React.Fragment key={`${row.label}-${f.key}`}>
                    <td className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth }}>
                      {formatCell(total, false)}
                    </td>
                    <td className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth }}>
                      {formatCell(attend, false)}
                    </td>
                    <td className={f.isTotal ? "mp-total" : ""} style={{ minWidth: unitWidth, color: "red" }}>
                      {formatCell(rate, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ManPowerStatusList;
