// src/pages/mainfactory/daily/status/TotalDivisionList.tsx
import React, { memo } from "react";

/* redux */
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/* components */
import { FactoryDef } from "../DailyReport";

export interface Props {
  factories: FactoryDef[];
  data: DailyReportListRes[] | [];
  leftItemWidth?: number; // ManPower 와 동일한 의미
  unitWidth?: number; // ManPower 와 동일한 의미
}

/** 공장키 → amt 컬럼 인덱스 */
type FactoryKey = "vina" | "tamthang" | "bago" | "total";
const FIDX: Record<FactoryKey, 1 | 2 | 3 | 4> = { vina: 1, tamthang: 2, bago: 3, total: 4 };
type AmtKey = `amt${1 | 2 | 3 | 4}${1 | 2 | 3}`;
const keyOf = (f: FactoryKey, i: 1 | 2 | 3 = 1): AmtKey => `amt${FIDX[f]}${i}` as AmtKey;

/** noRow 코드 (백엔드 매핑만 맞추면 됨) */
const CODE = {
  DAILY: "01",
  MONTHLY: "02",
  TARGET: "03",
  RATE: "04",
} as const;

const n = (v: any) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
/** 숫자/퍼센트 포맷 */
const fmt = {
  n: (v: any) =>
    v === null || v === undefined || v === "" || isNaN(Number(v)) || Number(v) === 0
      ? "-"
      : Math.round(Number(v)).toLocaleString(), // ✅ 소수점 첫째자리 반올림
  p: (v: any) =>
    v === null || v === undefined || v === "" || isNaN(Number(v)) || Number(v) === 0 ? "-" : `${Number(v).toFixed(2)}%`,
};

const TotalDivisionList: React.FC<Props> = memo(
  ({
    factories,
    data,
    leftItemWidth = 120, // ManPowerStatusList 기본값과 동일
    unitWidth = 42, // ManPowerStatusList 기본값과 동일
  }) => {
    const rows = Array.isArray(data) ? (data as DailyReportListRes[]) : [];
    const by = rows.reduce<Record<string, DailyReportListRes | undefined>>((a, r) => {
      if (r?.noRow) a[r.noRow] = r;
      return a;
    }, {});

    const sticky = (left: number): React.CSSProperties => ({ position: "sticky", left, zIndex: 3, background: "#fff" });

    const getVal = (noRow: string, f: FactoryKey, idx: 1 | 2 | 3 = 1) =>
      n(by[noRow]?.[keyOf(f, idx) as keyof DailyReportListRes]);

    const ROWS: { label: string; code: string; percent?: boolean; highlight?: boolean }[] = [
      { label: "Daily Amount(USD)", code: CODE.DAILY },
      { label: "Monthly Amount(USD)", code: CODE.MONTHLY },
      { label: "Target Amount(USD)", code: CODE.TARGET },
      { label: "Monthly Achievement Rate", code: CODE.RATE, percent: true, highlight: true },
    ];

    return (
      <div className="tdv-wrap">
        <style>{`
          .tdv-wrap { overflow:auto; }
          .tdv-table { border-collapse:separate; border-spacing:0; width:max-content; font-size:11px; }
          .tdv-table th, .tdv-table td {
            border:1px solid #bbb;
            text-align:center;
            white-space:nowrap;
            height: 25px !important;
            line-height: 1.25 !important;
            padding: 0 6px !important;
          }

          .tdv-head { background:#efdfb3; font-weight:700; }
          .tdv-subhead { background:#efe2b3; font-weight:600; }
          .tdv-left-head { background:#efe2b3; font-weight:700; }
          .tdv-left-cell { background:#fff; text-align:left; padding-left:8px; }
          .tdv-total { background:#f5d4d4; }         /* Total 컬럼 */
          .tdv-rate  { background:#fff799; }         /* Rate 행 하이라이트 */

          .tdv-sticky { position:sticky; left:0; z-index:3; background:#efe2b3; }
          .tdv-left-head.tdv-sticky { z-index:4; }
        `}</style>

        <table className="tdv-table">
          <thead>
            <tr className="tdv-head">
              <th className="tdv-left-head tdv-sticky" style={{ minWidth: leftItemWidth, maxWidth: leftItemWidth }}>
                DIVISION
              </th>
              {factories.map((f) => (
                <th
                  key={f.key}
                  className={"tdv-subhead" + (f.isTotal ? " tdv-total" : "")}
                  style={{ minWidth: unitWidth, maxWidth: unitWidth }}
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ROWS.map((r) => (
              <tr key={r.code} className={r.highlight ? "tdv-rate" : ""}>
                <td
                  className="tdv-left-cell tdv-sticky"
                  style={{ minWidth: leftItemWidth, maxWidth: leftItemWidth, fontWeight: "700" }}
                >
                  {r.label}
                </td>
                {factories.map((f) => {
                  const valDaily = getVal(CODE.DAILY, f.key as FactoryKey);
                  const valMonthly = getVal(CODE.MONTHLY, f.key as FactoryKey);
                  const valTarget = getVal(CODE.TARGET, f.key as FactoryKey);
                  const valRate = valMonthly && valTarget ? (valMonthly / valTarget) * 100 : null; // ✅ 추가된 계산식

                  const v =
                    r.code === CODE.RATE
                      ? valRate // ✅ Monthly / Target 계산 결과
                      : getVal(r.code, f.key as FactoryKey, 1);

                  return (
                    <td
                      key={`${r.code}-${f.key}`}
                      className={f.isTotal ? "tdv-total" : ""}
                      style={{
                        minWidth: unitWidth,
                        color: r.percent ? "red" : undefined, // ← 여기 추가!
                        fontWeight: r.percent ? "700" : undefined, // (선택) 강조
                      }}
                    >
                      {r.percent ? fmt.p(v) : fmt.n(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default TotalDivisionList;
