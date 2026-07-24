/* ===============================
 * 공통 유틸 (ES5-safe)
 * =============================== */

import React from "react";

export const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
export const toRate = (part: any, total: any) => {
  const p = toNum(part);
  const t = toNum(total);
  if (t <= 0) return 0;
  return Math.round((p / t) * 1000) / 10;
};

export const normalizeDate = (value: any) =>
  String(value ?? "")
    .replaceAll("-", "")
    .replaceAll(".", "")
    .replaceAll("/", "")
    .slice(0, 8);

export const normalizeMonthDate = (value: any) => {
  const onlyNum = String(value || "").replace(/[^0-9]/g, "");
  if (onlyNum.length >= 8) return onlyNum.slice(0, 8);
  if (onlyNum.length >= 6) return `${onlyNum.slice(0, 6)}01`;
  return "";
};

export const formatMonthHeader = (yyyymmdd: string, isCurrent = false) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "";

  const yy = yyyymmdd.slice(2, 4);
  const mm = yyyymmdd.slice(4, 6);
  const dd = yyyymmdd.slice(6, 8);

  if (isCurrent) return `${yy}.${mm}.${dd}`;
  return `${yy}.${mm}`;
};
export const yyyymmddToDate = (s: string) => {
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, add: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + add);
  return nd;
};

export const dateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

export const formatLabelTwoLinesEN = (yyyymmdd: string) => {
  const dt = yyyymmddToDate(yyyymmdd);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const wk = new Intl.DateTimeFormat("en-US", {weekday: "short"})
    .format(dt)
    .toUpperCase(); // MON, TUE...
  return [`${mm}.${dd}`, wk];
};
export const formatNumberWithComma = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  // 소수 있으면 그대로, 정수면 정수 콤마
  // (필요하면 소수 자리 고정 로직 추가 가능)
  return n.toLocaleString("en-US");
};

export const formatNumberWithCommaFixed = (v: any, digits: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export function buildDateWindow(endYYYYMMDD: string, days: number) {
  const end = yyyymmddToDate(endYYYYMMDD);
  const start = addDays(end, -(days - 1));
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(dateToYYYYMMDD(addDays(start, i)));
  return out;
}

export const formatNumberOrEmpty = (value?: number | string) => {
  const num = Number(value || 0);
  return num === 0 ? "" : num.toLocaleString();
};

export const formatPercentOrEmpty = (value?: number) => {
  const num = Number(value || 0);
  if (num === 0) return "";
  return num === 100 ? `${num.toFixed(0)}` : `${num.toFixed(1)}`;
};
export const calcRate = (value: number, base: number) => {
  if (!base) return 0;
  return Number(((value / base) * 100).toFixed(1));
};
export const normalizeText = (v: any) => String(v ?? "").trim();

export const formatNumber = (value?: number | string, digit = 0) => {
  const num = Number(value || 0);
  if (num === 0) return "";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
};

export const formatPercent = (value?: number | string, digit = 1) => {
  const num = Number(value || 0);
  if (num === 0) return "";
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  })}`;
};

export const formatDateHeaderLabel = (yyyymmdd: string, index: number) => {
  const v = normalizeMonthDate(yyyymmdd);
  if (v.length !== 8) return "-";

  const yy = v.slice(2, 4);
  const mm = v.slice(4, 6);
  const dd = v.slice(6, 8);

  return index === 0 ? `${yy}.${mm}.${dd}` : `${yy}.${mm}`;
};
