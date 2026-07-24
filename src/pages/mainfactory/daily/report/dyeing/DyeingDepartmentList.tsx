import React, { memo } from "react";

/* components */
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/* utils */
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

const DyeingDepartmentList: React.FC<Props> = memo(
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

    const rows04 = Array.isArray(data) ? (data as DailyReportListRes[]) : [];
    const byNoRow = indexByNoRow(rows04);

    return (
      <div className="sdm-wrap">
        <table className="sdm-table">
          <thead>
            <tr className="sdm-head">
              {/* 헤더만 2칸 병합 */}
              <th
                className="sdm-item sdm-sticky-0"
                colSpan={2}
                style={{ ...stickyLeftStyle(0), minWidth: L0 + (L1 - L0), maxWidth: L0 + (L1 - L0) }}
              >
                ITEM
              </th>
              {factories.map(thFactory)}
            </tr>
          </thead>

          <tbody>
            {/* ---------- Pre person / hour (noRow=07, idx=1/2) ---------- */}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={2}
                style={{ ...stickyLeftStyle(0), minWidth: L0, maxWidth: L0 }}
              >
                Performance
              </td>
              <td
                className="sdm-subhead sdm-sticky-1"
                rowSpan={2}
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                Daily
              </td>
              {factories.map((f) => (
                <React.Fragment key={`pph-head-${f.key}`}>
                  {thUnit("Quantity (KG)", 3, f.isTotal)}
                  {thUnit("Amount (USD)", 3, f.isTotal)}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              {factories.map((f) => {
                const d = getOne(byNoRow, "01", 1, f.key as FactoryKey);
                const m = getOne(byNoRow, "01", 2, f.key as FactoryKey);
                return (
                  <React.Fragment key={`pph-val-${f.key}`}>
                    <td className={cellCls(f.isTotal)} colSpan={3}>
                      {val(d)}
                    </td>
                    <td className={cellCls(f.isTotal)} colSpan={3}>
                      {val(m)}
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
                style={{ ...stickyLeftStyle(0), minWidth: L0, maxWidth: L0 }}
              >
                Monthly
                <br />
                Achievement
                <br />
                Rate
              </td>

              {/* Quantity (PCS) — 소스 테이블에 없으니 '-' */}
              <td
                className="sdm-subhead sdm-sticky-1"
                rowSpan={2}
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                Quantity(KG)
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
              {factories.map((f) => (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "02", f.key as FactoryKey)[0])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "02", f.key as FactoryKey)[1])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                    {val(getTriple(byNoRow, "02", f.key as FactoryKey)[2], true)}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                Amount(USD)
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "03", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/*----------------Machine Operating Rate------------------*/}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={2}
                colSpan={2}
                style={{ ...stickyLeftStyle(0), minWidth: L1, maxWidth: L1 }}
              >
                Machine Operating Rate
              </td>
              {factories.map((f) => (
                <React.Fragment key={`lines-head-${f.key}`}>
                  {thUnit("Total", 2, f.isTotal)}
                  {thUnit("Operation", 2, f.isTotal)}
                  {thUnit("Operating Rate", 2, f.isTotal)}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              {factories.map((f) => {
                const [l1, l2, l3] = getTriple(byNoRow, "04", f.key as FactoryKey);
                return (
                  <React.Fragment key={`lines-val-${f.key}`}>
                    <td className={cellCls(f.isTotal)} colSpan={2}>
                      {val(l1)}
                    </td>
                    <td className={cellCls(f.isTotal)} colSpan={2}>
                      {val(l2)}
                    </td>
                    <td className={cellCls(f.isTotal)} colSpan={2} style={{ color: "red" }}>
                      {val(l3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/* ---------- Normal Pressure ---------- */}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={4}
                style={{ ...stickyLeftStyle(0), minWidth: L0, maxWidth: L0 }}
              >
                Normal
                <br />
                Pressure
              </td>

              {/* Quantity (PCS) — 소스 테이블에 없으니 '-' */}
              <td
                className="sdm-subhead sdm-sticky-1"
                rowSpan={2}
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                ~499
              </td>
            </tr>

            <tr>
              {factories.map((f) => (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "05", f.key as FactoryKey)[0])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "05", f.key as FactoryKey)[1])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                    {val(getTriple(byNoRow, "05", f.key as FactoryKey)[2], true)}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                500~999
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "06", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                1000~
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "07", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/* ---------- Normal & High pressure ---------- */}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={4}
                style={{ ...stickyLeftStyle(0), minWidth: L0, maxWidth: L0 }}
              >
                Normal
                <br />
                &High
                <br />
                pressure
              </td>

              {/* Quantity (PCS) — 소스 테이블에 없으니 '-' */}
              <td
                className="sdm-subhead sdm-sticky-1"
                rowSpan={2}
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                ~499
              </td>
            </tr>

            <tr>
              {factories.map((f) => (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "08", f.key as FactoryKey)[0])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "08", f.key as FactoryKey)[1])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                    {val(getTriple(byNoRow, "08", f.key as FactoryKey)[2], true)}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                500~999
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "09", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                1000~
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "10", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/* ---------- High pressure ---------- */}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={4}
                style={{ ...stickyLeftStyle(0), minWidth: L0, maxWidth: L0 }}
              >
                High
                <br />
                pressure
              </td>

              {/* Quantity (PCS) — 소스 테이블에 없으니 '-' */}
              <td
                className="sdm-subhead sdm-sticky-1"
                rowSpan={2}
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                ~499
              </td>
            </tr>

            <tr>
              {factories.map((f) => (
                <React.Fragment key={`mar-qty-${f.key}`}>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "11", f.key as FactoryKey)[0])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)}>
                    {val(getTriple(byNoRow, "11", f.key as FactoryKey)[1])}
                  </td>
                  <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                    {val(getTriple(byNoRow, "11", f.key as FactoryKey)[2], true)}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                500~999
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "12", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            <tr>
              <td
                className="sdm-subhead sdm-sticky-1"
                style={{ ...stickyLeftStyle(L0), minWidth: L1 - L0, maxWidth: L1 - L0 }}
              >
                1000~
              </td>
              {factories.map((f) => {
                const [a1, a2, a3] = getTriple(byNoRow, "13", f.key as FactoryKey); // target/actual/rate
                return (
                  <React.Fragment key={`mar-amt-${f.key}`}>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a1)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)}>
                      {val(a2)}
                    </td>
                    <td colSpan={2} className={cellCls(f.isTotal)} style={{ color: "red" }}>
                      {val(a3, true)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/*----------------Sample------------------*/}
            <tr>
              <td
                className="sdm-item sdm-sticky-0"
                rowSpan={2}
                colSpan={2}
                style={{ ...stickyLeftStyle(0), minWidth: L1, maxWidth: L1 }}
              >
                Sample
              </td>
            </tr>
            <tr>
              {factories.map((f) => {
                const [l1, l2, l3] = getTriple(byNoRow, "14", f.key as FactoryKey);
                return (
                  <React.Fragment key={`lines-val-${f.key}`}>
                    <td className={cellCls(f.isTotal)} colSpan={2}>
                      {val(l1)}
                    </td>
                    <td className={cellCls(f.isTotal)} colSpan={2}>
                      {val(l2)}
                    </td>
                    <td className={cellCls(f.isTotal)} colSpan={2} style={{ color: "red" }}>
                      {val(l3, true)}
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

export default DyeingDepartmentList;
