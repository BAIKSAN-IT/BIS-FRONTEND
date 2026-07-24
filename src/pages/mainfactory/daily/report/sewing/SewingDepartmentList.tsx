import React, { memo } from "react";
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";
import { FactoryDef } from "../DailyReport";

export interface Props {
  factories: FactoryDef[];
  data: DailyReportListRes[] | [];
  leftItemWidth?: number; // 첫 고정열 폭
  leftSubWidth?: number; // 두번째 고정열 폭
  unitWidth?: number; // 공장 영역 1 unit 폭(공장 = 6 unit)
}

/** 숫자/퍼센트 포맷 */
const fmt = {
  // 숫자: 0이면 '-', 그 외는 반올림(Math.round) 후 천단위 구분
  n: (v: any) => {
    const num = Number(v);
    if (v === null || v === undefined || v === "" || isNaN(num)) return "-";
    const rounded = Math.round(num);
    return rounded === 0 ? "-" : rounded.toLocaleString();
  },

  // 퍼센트: 0이면 '-', 그 외는 소수 2자리 반올림
  p: (v: any) => {
    const num = Number(v);
    if (v === null || v === undefined || v === "" || isNaN(num) || num === 0) return "-";
    return `${num.toFixed(2)}%`;
  },
};

const amount = {
  n: (v: any) => {
    const num = Number(v);
    if (v === null || v === undefined || v === "" || isNaN(num) || num === 0) return "-";
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },
  p: (v: any) => {
    const num = Number(v);
    if (v === null || v === undefined || v === "" || isNaN(num) || num === 0) return "-";
    return `${num.toFixed(2)}%`; // percent도 2자리
  },
};

const cellCls = (isTotal?: boolean) => "sdm-td" + (isTotal ? " sdm-total" : "");

const getCellStyle = (colSpan: number, unitWidth: number): React.CSSProperties => ({
  width: `${colSpan * unitWidth}px`,
  minWidth: `${colSpan * unitWidth}px`,
  maxWidth: `${colSpan * unitWidth}px`,
});

const thUnit = (label: string, span = 1, isTotal?: boolean, unitWidth = 46) => (
  <th className={cellCls(isTotal) + " sdm-subhead"} colSpan={span} style={getCellStyle(span, unitWidth)}>
    {label}
  </th>
);

/** 공장키 → amt의 공장 인덱스(1~4) */
type FactoryKey = "vina" | "tamthang" | "bago" | "total";
const FACTORY_IDX_BY_KEY: Record<FactoryKey, 1 | 2 | 3 | 4> = {
  vina: 1,
  tamthang: 2,
  bago: 3,
  total: 4,
};

type AmtKey = `amt${1 | 2 | 3 | 4}${1 | 2 | 3}`;
const makeKey = (factory: FactoryKey, idx: 1 | 2 | 3): AmtKey => {
  const f = FACTORY_IDX_BY_KEY[factory];
  return `amt${f}${idx}` as AmtKey;
};

/** 원본 배열에서 noRow별로 빠르게 찾을 수 있게 맵 구성 */
const indexByNoRow = (rows: DailyReportListRes[] | []) => {
  const by: Record<string, DailyReportListRes | undefined> = {};
  (rows || []).forEach((r) => {
    if (r?.noRow) by[r.noRow] = r;
  });
  return by;
};

const val = (v: any, isPercent = false) => (isPercent ? fmt.p(v) : fmt.n(v));
const amountVal = (v: any, isPercent = false) => (isPercent ? amount.p(v) : amount.n(v));
/** noRow에서 (1,2,3) 세 값을 가져오는 헬퍼 */
const getTriple = (
  byNoRow: Record<string, DailyReportListRes | undefined>,
  noRow: string | null,
  factory: FactoryKey
): [number | null, number | null, number | null] => {
  if (!noRow) return [null, null, null];
  const row = byNoRow[noRow];
  if (!row) return [null, null, null];
  return [
    (row as any)[makeKey(factory, 1)] ?? null,
    (row as any)[makeKey(factory, 2)] ?? null,
    (row as any)[makeKey(factory, 3)] ?? null,
  ];
};

/** noRow에서 단일 인덱스 값을 가져오는 헬퍼 */
const getOne = (
  byNoRow: Record<string, DailyReportListRes | undefined>,
  noRow: string | null,
  idx: 1 | 2 | 3,
  factory: FactoryKey
): number | null => {
  if (!noRow) return null;
  const row = byNoRow[noRow];
  if (!row) return null;
  return (row as any)[makeKey(factory, idx)] ?? null;
};

const SewingDepartmentList: React.FC<Props> = memo(
  ({ factories, data, leftItemWidth = 160, leftSubWidth = 140, unitWidth = 90 }) => {
    // 공장 하나는 항상 6 unit 폭
    const perFactoryUnits = 6;

    const L0 = leftItemWidth;
    const L1 = leftItemWidth + leftSubWidth;

    const stickyLeftStyle = (left: number) =>
      ({
        position: "sticky",
        left,
        zIndex: 3,
        background: "#efe2b3",
      } as React.CSSProperties);

    const thFactory = (f: FactoryDef) => (
      <th
        key={f.key}
        className={cellCls(f.isTotal)}
        colSpan={perFactoryUnits}
        style={{ minWidth: perFactoryUnits * unitWidth }}
      >
        {f.label}
      </th>
    );

    /** ✅ filteredList(cdPart=02)에서 noRow 매핑 인덱스 생성 */
    const rows02 = Array.isArray(data) ? (data as DailyReportListRes[]) : [];
    const byNoRow = indexByNoRow(rows02);

    return (
      <div className="sdm-wrap">
        <style>{`
         .sdm-wrap { overflow:auto; }
          .sdm-table {
            border-collapse:separate;
            border-spacing:0;
            width:max-content;
            font-size:11px;
          }

          .sdm-table th,
          .sdm-table td {
            border:1px solid #bbb;
            text-align:center;
            white-space:nowrap;
            height: 25px !important;
            line-height: 1.25 !important;
            padding: 0 6px !important;
          }

          .sdm-head { background:#efe2b3; font-weight:700; }
          .sdm-subhead { background:#f6edd2; font-weight:600; }
          .sdm-item { background:#efe2b3; font-weight:700; }
          .sdm-total { background:#f5d4d4; }
          .sdm-lbl { text-align:left; padding-left:6px; } /* ✅ 좌측 여백 축소 */
          .sdm-sticky-0 { position:sticky; left:0; z-index:4; background:#fff; }
          .sdm-sticky-1 { position:sticky; z-index:4; background:#fff; }
        `}</style>

        <table className="sdm-table">
          <thead>
            <tr className="sdm-head">
              {/* 헤더만 2칸 병합 */}
              <th
                className="sdm-item sdm-sticky-0"
                colSpan={2}
                style={{ ...stickyLeftStyle(0), minWidth: L0 + (L1 - L0), maxWidth: L0 + (L1 - L0) }}
              >
                Item
              </th>
              {factories.map(thFactory)}
            </tr>
          </thead>

          <tbody>
          {/* ---------- # of Lines (noRow=01) ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={2}
              colSpan={2}
              style={{...stickyLeftStyle(0), minWidth: L1, maxWidth: L1}}
            >
              # of Lines
            </td>
            {factories.map((f) => (
              <React.Fragment key={`lines-head-${f.key}`}>
                {thUnit("Total", 2, f.isTotal)}
                {thUnit("Operation", 2, f.isTotal)}
                {thUnit("Output", 2, f.isTotal)}
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {factories.map((f) => {
              const [l1, l2, l3] = getTriple(byNoRow, "01", f.key as FactoryKey);
              return (
                <React.Fragment key={`lines-val-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {val(l1)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {val(l2)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {val(l3)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Work Detail (소스 없으면 전부 '-') ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={2}
              colSpan={2}
              style={{...stickyLeftStyle(0), minWidth: L1, maxWidth: L1}}
            >
              Work Detail
            </td>
            {factories.map((f) => (
              <React.Fragment key={`wd-head-${f.key}`}>
                {thUnit("Work days", 2, f.isTotal)}
                {thUnit("Work hour", 2, f.isTotal)}
                {thUnit("Total O/T", 2, f.isTotal)}
              </React.Fragment>
            ))}
          </tr>

          <tr>
            {factories.map((f) => {
              const [l1, l2, l3] = getTriple(byNoRow, "02", f.key as FactoryKey);
              return (
                <React.Fragment key={`wd-val-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {l1 || '-'}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {l2 || '-'}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={2}>
                    {l3 || '-'}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Daily: Performance (noRow=03) ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={3}
              style={{...stickyLeftStyle(0), minWidth: L0, maxWidth: L0}}
            >
              Daily
            </td>
            <td
              className="sdm-subhead sdm-sticky-1"
              rowSpan={2}
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Performance
            </td>
            {factories.map((f) => (
              <React.Fragment key={`perf-head-${f.key}`}>
                {thUnit("Quantity (PCS)", 3, f.isTotal)}
                {thUnit("Amount (USD)", 3, f.isTotal)}
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {factories.map((f) => {
              const qty = getOne(byNoRow, "03", 1, f.key as FactoryKey);
              const amt = getOne(byNoRow, "03", 2, f.key as FactoryKey);
              return (
                <React.Fragment key={`perf-val-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(qty)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(amt)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Daily: Per person (noRow=04 idx=1) ---------- */}
          <tr>
            <td
              className="sdm-subhead sdm-sticky-1"
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Per person
            </td>
            {factories.map((f) => {
              const per = getOne(byNoRow, "04", 1, f.key as FactoryKey);
              const amt = getOne(byNoRow, "04", 2, f.key as FactoryKey);
              return (
                <React.Fragment key={`perf-pp-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(per)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(amt)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Per Line (noRow=02, idx=1/2) ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={2}
              style={{...stickyLeftStyle(0), minWidth: L0, maxWidth: L0}}
            >
              Per Line
            </td>
            <td
              className="sdm-subhead sdm-sticky-1"
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Daily
            </td>
            {factories.map((f) => {
              const v1 = getOne(byNoRow, "05", 1,  f.key as FactoryKey);
              const v2 = getOne(byNoRow, "05", 2,  f.key as FactoryKey);
              return (
                <React.Fragment key={`pl-d-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(v1)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(v2)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
          <tr>
            <td
              className="sdm-subhead sdm-sticky-1"
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Monthly
            </td>
            {factories.map((f) => {
              const v1 = getOne(byNoRow, "06", 1, f.key as FactoryKey);
              const v2 = getOne(byNoRow, "06", 2, f.key as FactoryKey);
              return (
                <React.Fragment key={`pl-m-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(v1)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {val(v2)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Pre person / hour (noRow=07, idx=1/2) ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={2}
              style={{...stickyLeftStyle(0), minWidth: L0, maxWidth: L0}}
            >
              Pre person
              <br/>
              /hour
            </td>
            <td
              className="sdm-subhead sdm-sticky-1"
              rowSpan={2}
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Amount(USD)
            </td>
            {factories.map((f) => (
              <React.Fragment key={`pph-head-${f.key}`}>
                {thUnit("Daily", 3, f.isTotal)}
                {thUnit("Monthly", 3, f.isTotal)}
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {factories.map((f) => {
              const d = getOne(byNoRow, "07", 1, f.key as FactoryKey);
              const m = getOne(byNoRow, "07", 2, f.key as FactoryKey);
              return (
                <React.Fragment key={`pph-val-${f.key}`}>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {amountVal(d)}
                  </td>
                  <td className={cellCls(f.isTotal)} colSpan={3}>
                    {amountVal(m)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          {/* ---------- Monthly Achievement Rate ---------- */}
          <tr>
            <td
              className="sdm-item sdm-sticky-0"
              rowSpan={3}
              style={{...stickyLeftStyle(0), minWidth: L0, maxWidth: L0}}
            >
              Monthly
              <br/>
              Achievement
              <br/>
              Rate
            </td>

            {/* Quantity (PCS) — 소스 테이블에 없으니 '-' */}
            <td
              className="sdm-subhead sdm-sticky-1"
              rowSpan={2}
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Quantity(PCS)
            </td>

            {factories.map((f) => (
              <React.Fragment key={`mar-head-${f.key}`}>
                {thUnit("Target", 2, f.isTotal)}
                {thUnit("Actual", 2, f.isTotal)}
                {thUnit("Achievement Rate", 2, f.isTotal)}
              </React.Fragment>
            ))}
          </tr>

          <tr>
            {factories.map((f) => {
              const [q1, q2, q3] = getTriple(byNoRow, "08", f.key as FactoryKey); // target/actual/rate
              return (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(q1)}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(q2)}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{color: "red"}}>
                    {val(q3, true)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          <tr>
            <td
              className="sdm-subhead sdm-sticky-1"
              style={{...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0}}
            >
              Amount(USD)
            </td>
            {factories.map((f) => {
              const [b1, b2, b3] = getTriple(byNoRow, "09", f.key as FactoryKey); // target/actual/rate
              return (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(b1)}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(b2)}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{color: "red"}}>
                    {val(b3, true)}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default SewingDepartmentList;
