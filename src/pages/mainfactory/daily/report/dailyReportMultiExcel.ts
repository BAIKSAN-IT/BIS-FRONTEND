/* lb */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* components*/
import { DailyReportListRes } from "@redux/mainfactory/daily/DailyStatusSlice";

/**
 * 공통 스타일 상수들 (타입 문제 방지를 위해 any 사용)
 */
const borderThin: any = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const alignCenter: any = {
  vertical: "middle",
  horizontal: "center",
};

const alignLeft: any = {
  vertical: "middle",
  horizontal: "left",
};

const alignCenterWrap: any = {
  vertical: "middle",
  horizontal: "center",
  wrapText: true,
};

const fontDefault: any = {
  name: "맑은 고딕",
  size: 10,
};

const fontTitle: any = {
  name: "맑은 고딕",
  size: 12,
  bold: true,
  color: { argb: "FF004B97" }, // rgb(0,75,151)
};

// 배경색
const fillHead: any = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEFE2B3" }, // #efe2b3
};

const fillSubHead: any = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF6EDD2" }, // #f6edd2
};

const fillTotal: any = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF5D4D4" }, // #f5d4d4
};

const fillRate: any = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF799" }, // #fff799
};

const fillTotalHead: any = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEFDFB3" }, // #efdfb3
};

/** 숫자/퍼센트 포맷 */
const fmtNumber = (v: any): string | "-" => {
  if (v === null || v === undefined || v === "") return "-";
  const num = Number(v);
  if (!isFinite(num) || num === 0) return "-";
  // 소수점 반올림 + 천단위 콤마
  return Math.round(num).toLocaleString();
};

const fmtPercent = (v: any): string | "-" => {
  if (v === null || v === undefined || v === "") return "-";
  const num = Number(v);
  if (!isFinite(num) || num === 0) return "-";
  // 소수 둘째자리 반올림
  return `${num.toFixed(2)}%`;
};

/**
 * 엑셀 셀 스타일 적용 헬퍼
 */
function styleCell(
  cell: ExcelJS.Cell,
  options?: {
    bold?: boolean;
    fill?: any;
    border?: any;
    align?: any;
    font?: any;
  }
) {
  cell.style = cell.style || {};
  if (options?.border) cell.border = options.border;
  if (options?.fill) cell.fill = options.fill;
  if (options?.align) cell.alignment = options.align;
  if (options?.font) cell.font = options.font;
  if (options?.bold) {
    cell.font = { ...(cell.font || {}), bold: true };
  }
}

/* ===========================================================
   DailyReportList 공통 헬퍼 (모든 Department 공통 사용)
=========================================================== */
type FactoryKey = "vina" | "tamthang" | "bago" | "total";
type FactoryIdx = 1 | 2 | 3 | 4;
type AmtIdx = 1 | 2 | 3;
type AmtKey = `amt${FactoryIdx}${AmtIdx}`;

const FACTORY_IDX_BY_KEY: Record<FactoryKey, FactoryIdx> = {
  vina: 1,
  tamthang: 2,
  bago: 3,
  total: 4,
};

const factoryKeys: FactoryKey[] = ["vina", "tamthang", "bago", "total"];
const factoryNames = ["PANKO VINA", "PANKO TAMTHANG", "PANKO BAGO", "Total"];
const perFactoryCols = 6; // 공장당 6칸 (Quantity 3 + Amount 3)
const colStart = (factoryIndex: number) => 3 + factoryIndex * perFactoryCols;

const makeKey = (factory: FactoryKey, idx: AmtIdx): AmtKey => {
  const f = FACTORY_IDX_BY_KEY[factory];
  return `amt${f}${idx}` as AmtKey;
};

/** noRow 기준 인덱스 */
const indexByNoRow = (rows: DailyReportListRes[]) => {
  const by: Record<string, DailyReportListRes | undefined> = {};
  rows.forEach((r) => {
    if (r.noRow) by[r.noRow] = r;
  });
  return by;
};

const getTriple = (
  byNoRow: Record<string, DailyReportListRes | undefined>,
  noRow: string,
  factory: FactoryKey
): [number | null, number | null, number | null] => {
  const row = byNoRow[noRow];
  if (!row) return [null, null, null];
  return [
    (row as any)[makeKey(factory, 1)] ?? null,
    (row as any)[makeKey(factory, 2)] ?? null,
    (row as any)[makeKey(factory, 3)] ?? null,
  ];
};

const getOne = (
  byNoRow: Record<string, DailyReportListRes | undefined>,
  noRow: string,
  idx: AmtIdx,
  factory: FactoryKey
): number | null => {
  const row = byNoRow[noRow];
  if (!row) return null;
  return (row as any)[makeKey(factory, idx)] ?? null;
};

/** 공통 셀 헬퍼 */
function setCell(
  ws: ExcelJS.Worksheet,
  r: number,
  c: number,
  value: any,
  opts?: { rowSpan?: number; colSpan?: number; fill?: any; align?: any; bold?: boolean }
) {
  const rowSpan = opts?.rowSpan ?? 1;
  const colSpan = opts?.colSpan ?? 1;
  if (rowSpan > 1 || colSpan > 1) {
    ws.mergeCells(r, c, r + rowSpan - 1, c + colSpan - 1);
  }
  const cell = ws.getCell(r, c);
  cell.value = value;
  styleCell(cell, {
    border: borderThin,
    fill: opts?.fill,
    align: opts?.align ?? alignCenter,
    font: fontDefault,
    bold: opts?.bold,
  });
}

/** 공통 숫자 헬퍼 */
function setNumber(
  ws: ExcelJS.Worksheet,
  r: number,
  c: number,
  v: any,
  opts?: { rowSpan?: number; colSpan?: number; isPercent?: boolean; isTotal?: boolean; fillRate?: boolean }
) {
  const val = opts?.isPercent ? fmtPercent(v) : fmtNumber(v);
  setCell(ws, r, c, val, {
    rowSpan: opts?.rowSpan,
    colSpan: opts?.colSpan,
    fill: opts?.fillRate ? fillRate : opts?.isTotal ? fillTotal : undefined,
    align: alignCenter,
  });
}

/** 공통: Item + 공장 헤더 1줄 */
function writeFactoryHead(ws: ExcelJS.Worksheet, rowIdx: number): number {
  const maxCol = 2 + factoryKeys.length * perFactoryCols; // 26
  const headRow = ws.getRow(rowIdx);
  for (let i = 1; i <= maxCol; i++) {
    const cell = headRow.getCell(i);
    styleCell(cell, {
      border: borderThin,
      fill: i > maxCol - perFactoryCols ? fillTotalHead : fillHead,
      align: alignCenter,
      font: fontDefault,
    });
  }

  setCell(ws, rowIdx, 1, "Item", { colSpan: 2, fill: fillHead, align: alignCenter, bold: true });

  factoryNames.forEach((name, idx) => {
    const c0 = colStart(idx);
    setCell(ws, rowIdx, c0, name, {
      colSpan: perFactoryCols,
      fill: idx === 3 ? fillTotalHead : fillHead,
      align: alignCenter,
      bold: true,
    });
  });

  return rowIdx + 1;
}

/* ===========================================================
   1. Man Power Status Section (cdPart="01")
=========================================================== */
function writeManPowerSection(ws: ExcelJS.Worksheet, startRow: number, dailyReportList: DailyReportListRes[]): number {
  let rowIdx = startRow;

  const rows01 = dailyReportList.filter((r) => r.cdPart === "01");
  const byNoRow = indexByNoRow(rows01);

  // 제목 (다른 섹션과 동일하게 1~26열 merge)
  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "1. Man Power Status (widthout meternity leave) Department";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  // 헤더 1줄
  const head1Row = ws.getRow(rowIdx);
  const head1Values = [
    "Department",
    "PANKO VINA",
    "",
    "",
    "PANKO TAMTHANG",
    "",
    "",
    "PANKO BAGO",
    "",
    "",
    "Total",
    "",
    "",
  ];
  head1Values.forEach((v, i) => {
    const cell = head1Row.getCell(i + 1);
    cell.value = v;
    styleCell(cell, {
      border: borderThin,
      fill: fillHead,
      align: alignCenter,
      font: fontDefault,
    });
  });

  // Department 머지
  ws.mergeCells(rowIdx, 1, rowIdx + 1, 1);

  // 공장 헤더 머지
  ws.mergeCells(rowIdx, 2, rowIdx, 4); // VINA
  ws.mergeCells(rowIdx, 5, rowIdx, 7); // TAMTHANG
  ws.mergeCells(rowIdx, 8, rowIdx, 10); // BAGO
  ws.mergeCells(rowIdx, 11, rowIdx, 13); // Total

  rowIdx++;

  // 헤더 2줄 (세부 컬럼)
  const head2Row = ws.getRow(rowIdx);
  const head2Values = [
    "", // Department
    "Total",
    "Attendance",
    "Absenteeism Rate",
    "Total",
    "Attendance",
    "Absenteeism Rate",
    "Total",
    "Attendance",
    "Absenteeism Rate",
    "Total",
    "Attendance",
    "Absenteeism Rate",
  ];
  head2Values.forEach((v, i) => {
    const cell = head2Row.getCell(i + 1);
    cell.value = v;
    styleCell(cell, {
      border: borderThin,
      fill: i >= 10 ? fillTotal : fillHead, // 마지막 Total 블록 분홍
      align: alignCenter,
      font: fontDefault,
    });
  });

  rowIdx++;

  // cdPart=01 (noRow=01~07) 데이터 매핑
  const depts: { label: string; noRow: string }[] = [
    { label: "Total", noRow: "01" },
    { label: "Sewing", noRow: "02" },
    { label: "Sewing General", noRow: "03" },
    { label: "Knitting", noRow: "04" },
    { label: "Dyeing", noRow: "05" },
    { label: "Yarn-Dyeing", noRow: "06" },
    { label: "General", noRow: "07" },
  ];

  depts.forEach(({ label, noRow }) => {
    const row = ws.getRow(rowIdx);
    // Department
    const deptCell = row.getCell(1);
    deptCell.value = label;
    styleCell(deptCell, {
      border: borderThin,
      align: alignLeft,
      font: fontDefault,
    });

    factoryKeys.forEach((fk, fIdx) => {
      const [total, attend, rate] = getTriple(byNoRow, noRow, fk);
      const baseCol = 2 + fIdx * 3;
      const isTotalFactory = fk === "total";

      setNumber(ws, rowIdx, baseCol + 0, total, { isTotal: isTotalFactory });
      setNumber(ws, rowIdx, baseCol + 1, attend, { isTotal: isTotalFactory });
      setNumber(ws, rowIdx, baseCol + 2, rate, { isTotal: isTotalFactory, isPercent: true });
    });

    row.height = 18;
    rowIdx++;
  });

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   2. Sewing Department (cdPart="02")
=========================================================== */
function writeSewingSection(ws: ExcelJS.Worksheet, startRow: number, dailyReportList: DailyReportListRes[]): number {
  let rowIdx = startRow;

  // 제목
  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "2. Sewing Department";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  const rows02 = dailyReportList.filter((r) => r.cdPart === "02");
  const byNoRow = indexByNoRow(rows02);

  // Item + 공장 헤더
  rowIdx = writeFactoryHead(ws, rowIdx);

  /* # of Lines (noRow="01") */
  const rLinesHead = rowIdx;

  setCell(ws, rLinesHead, 1, "# of Lines", {
    rowSpan: 2,
    colSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;

    setCell(ws, rLinesHead, c0 + 0, "Total", { colSpan: 2, fill, align: alignCenter, bold: true });
    setCell(ws, rLinesHead, c0 + 2, "Operation", { colSpan: 2, fill, align: alignCenter, bold: true });
    setCell(ws, rLinesHead, c0 + 4, "Output", { colSpan: 2, fill, align: alignCenter, bold: true });
  });

  rowIdx++;

  const rLinesVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const [v1, v2, v3] = getTriple(byNoRow, "01", fk);
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    setNumber(ws, rLinesVal, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, rLinesVal, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, rLinesVal, c0 + 4, v3, { colSpan: 2, isTotal });
  });

  rowIdx++;

  /* Work Detail (noRow="02") */
  const rWorkHead = rowIdx;

  setCell(ws, rWorkHead, 1, "Work Detail", {
    rowSpan: 2,
    colSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;

    setCell(ws, rWorkHead, c0 + 0, "Work days", { colSpan: 2, fill, bold: true });
    setCell(ws, rWorkHead, c0 + 2, "Work hour", { colSpan: 2, fill, bold: true });
    setCell(ws, rWorkHead, c0 + 4, "Total O/T", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rWorkVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const [d1, d2, d3] = getTriple(byNoRow, "02", fk);
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    setNumber(ws, rWorkVal, c0 + 0, d1, { colSpan: 2, isTotal });
    setNumber(ws, rWorkVal, c0 + 2, d2, { colSpan: 2, isTotal });
    setNumber(ws, rWorkVal, c0 + 4, d3, { colSpan: 2, isTotal });
  });

  rowIdx++;

  /* Daily - Performance / Per person */
  const rDailyPerfHead = rowIdx;

  setCell(ws, rDailyPerfHead, 1, "Daily", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenter,
    bold: true,
  });
  setCell(ws, rDailyPerfHead, 2, "Performance", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rDailyPerfHead, c0 + 0, "Quantity (PCS)", { colSpan: 3, fill, bold: true });
    setCell(ws, rDailyPerfHead, c0 + 3, "Amount (USD)", { colSpan: 3, fill, bold: true });
  });

  rowIdx++;

  const rDailyPerfVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const qty = getOne(byNoRow, "03", 1, fk);
    const amt = getOne(byNoRow, "03", 2, fk);
    setNumber(ws, rDailyPerfVal, c0 + 0, qty, { colSpan: 3, isTotal });
    setNumber(ws, rDailyPerfVal, c0 + 3, amt, { colSpan: 3, isTotal });
  });

  rowIdx++;

  const rDailyPerPerson = rowIdx;
  setCell(ws, rDailyPerPerson, 2, "Per person", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const v = getOne(byNoRow, "04", 1, fk);
    setNumber(ws, rDailyPerPerson, c0 + 0, v, { colSpan: 3, isTotal });
    setNumber(ws, rDailyPerPerson, c0 + 3, v, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Per Line */
  const rPerLineDaily = rowIdx;
  setCell(ws, rPerLineDaily, 1, "Per Line", {
    rowSpan: 2,
    fill: fillHead,
    align: alignCenter,
    bold: true,
  });
  setCell(ws, rPerLineDaily, 2, "Daily", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const v = getOne(byNoRow, "05", 1, fk);
    setNumber(ws, rPerLineDaily, c0 + 0, v, { colSpan: 3, isTotal });
    setNumber(ws, rPerLineDaily, c0 + 3, v, { colSpan: 3, isTotal });
  });

  rowIdx++;

  const rPerLineMonthly = rowIdx;
  setCell(ws, rPerLineMonthly, 2, "Monthly", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const v = getOne(byNoRow, "06", 2, fk);
    setNumber(ws, rPerLineMonthly, c0 + 0, v, { colSpan: 3, isTotal });
    setNumber(ws, rPerLineMonthly, c0 + 3, v, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Pre person / hour (noRow="07") */
  const rPphHead = rowIdx;
  setCell(ws, rPphHead, 1, "Pre person\n/hour", {
    rowSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rPphHead, 2, "Amount\n(USD)", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rPphHead, c0 + 0, "Daily", { colSpan: 3, fill, bold: true });
    setCell(ws, rPphHead, c0 + 3, "Monthly", { colSpan: 3, fill, bold: true });
  });

  rowIdx++;

  const rPphVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const d = getOne(byNoRow, "07", 1, fk);
    const m = getOne(byNoRow, "07", 2, fk);
    setNumber(ws, rPphVal, c0 + 0, d, { colSpan: 3, isTotal });
    setNumber(ws, rPphVal, c0 + 3, m, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Monthly Achievement Rate (noRow=08,09) */
  const rMarHeadQty = rowIdx;
  setCell(ws, rMarHeadQty, 1, "Monthly\nAchievement\nRate", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rMarHeadQty, 2, "Quantity\n(PCS)", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMarHeadQty, c0 + 0, "Target", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 2, "Actual", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 4, "Achievement Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMarQtyVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "08", fk);
    setNumber(ws, rMarQtyVal, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  const rMarAmtHead = rowIdx;
  setCell(ws, rMarAmtHead, 2, "Amount\n(USD)", {
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "09", fk);
    setNumber(ws, rMarAmtHead, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   3. Knitting Department (cdPart="03")
=========================================================== */
function writeKnittingSection(ws: ExcelJS.Worksheet, startRow: number, dailyReportList: DailyReportListRes[]): number {
  let rowIdx = startRow;

  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "3. Knitting Department";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  const rows03 = dailyReportList.filter((r) => r.cdPart === "03");
  const byNoRow = indexByNoRow(rows03);

  rowIdx = writeFactoryHead(ws, rowIdx);

  /* Performance / Daily (noRow="01") */
  const rPerfHead = rowIdx;
  setCell(ws, rPerfHead, 1, "Performance", {
    rowSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rPerfHead, 2, "Daily", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rPerfHead, c0 + 0, "Quantity (KG)", { colSpan: 3, fill, bold: true });
    setCell(ws, rPerfHead, c0 + 3, "Amount (USD)", { colSpan: 3, fill, bold: true });
  });

  rowIdx++;

  const rPerfVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const q = getOne(byNoRow, "01", 1, fk);
    const a = getOne(byNoRow, "01", 2, fk);
    setNumber(ws, rPerfVal, c0 + 0, q, { colSpan: 3, isTotal });
    setNumber(ws, rPerfVal, c0 + 3, a, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Monthly Achievement Rate (noRow=02,03) */
  const rMarHeadQty = rowIdx;
  setCell(ws, rMarHeadQty, 1, "Monthly\nAchievement\nRate", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rMarHeadQty, 2, "Quantity\n(PCS)", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMarHeadQty, c0 + 0, "Target", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 2, "Actual", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 4, "Achievement Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMarQtyVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "02", fk);
    setNumber(ws, rMarQtyVal, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  const rMarAmtHead = rowIdx;
  setCell(ws, rMarAmtHead, 2, "Amount\n(USD)", {
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "03", fk);
    setNumber(ws, rMarAmtHead, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  /* Machine Operating Rate (noRow="04") */
  const rMorHead = rowIdx;
  setCell(ws, rMorHead, 1, "Machine Operating Rate", {
    rowSpan: 2,
    colSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMorHead, c0 + 0, "Total", { colSpan: 2, fill, bold: true });
    setCell(ws, rMorHead, c0 + 2, "Operation", { colSpan: 2, fill, bold: true });
    setCell(ws, rMorHead, c0 + 4, "Operating Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMorVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [v1, v2, v3] = getTriple(byNoRow, "04", fk);
    setNumber(ws, rMorVal, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, rMorVal, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, rMorVal, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });

  rowIdx++;

  /** 침종 라인 (Single ~ RASCHEL) */
  const machineRows: { label: string; noRow: string }[] = [
    { label: "Single", noRow: "05" },
    { label: "French Terry", noRow: "06" },
    { label: "Rib", noRow: "07" },
    { label: "Double", noRow: "08" },
    { label: "Jacquard - Double", noRow: "09" },
    { label: "Jacquard - Single", noRow: "10" },
    { label: "Jacquard - Zurry", noRow: "11" },
    { label: "Engineering Striper", noRow: "12" },
    { label: "Small Inch_Double", noRow: "13" },
    { label: "Small Inch_Single", noRow: "14" },
    { label: "VELOUR", noRow: "15" },
    { label: "RASCHEL", noRow: "16" },
  ];

  machineRows.forEach(({ label, noRow }) => {
    const rLabel = rowIdx;
    setCell(ws, rLabel, 1, label, {
      rowSpan: 2,
      colSpan: 2,
      fill: fillHead,
      align: alignCenterWrap,
      bold: true,
    });
    rowIdx++;

    const rVal = rowIdx;
    factoryKeys.forEach((fk, idx) => {
      const c0 = colStart(idx);
      const isTotal = fk === "total";
      const [v1, v2, v3] = getTriple(byNoRow, noRow, fk);
      setNumber(ws, rVal, c0 + 0, v1, { colSpan: 2, isTotal });
      setNumber(ws, rVal, c0 + 2, v2, { colSpan: 2, isTotal });
      setNumber(ws, rVal, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
    });
    rowIdx++;
  });

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   4. Dyeing Department (cdPart="04")
=========================================================== */
function writeDyeingSection(ws: ExcelJS.Worksheet, startRow: number, dailyReportList: DailyReportListRes[]): number {
  let rowIdx = startRow;

  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "4. Dyeing Department";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  const rows04 = dailyReportList.filter((r) => r.cdPart === "04");
  const byNoRow = indexByNoRow(rows04);

  rowIdx = writeFactoryHead(ws, rowIdx);

  /* Performance / Daily (noRow="01") */
  const rPerfHead = rowIdx;
  setCell(ws, rPerfHead, 1, "Performance", {
    rowSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rPerfHead, 2, "Daily", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rPerfHead, c0 + 0, "Quantity (KG)", { colSpan: 3, fill, bold: true });
    setCell(ws, rPerfHead, c0 + 3, "Amount (USD)", { colSpan: 3, fill, bold: true });
  });

  rowIdx++;

  const rPerfVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const q = getOne(byNoRow, "01", 1, fk);
    const a = getOne(byNoRow, "01", 2, fk);
    setNumber(ws, rPerfVal, c0 + 0, q, { colSpan: 3, isTotal });
    setNumber(ws, rPerfVal, c0 + 3, a, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Monthly Achievement Rate (noRow=02,03) */
  const rMarHeadQty = rowIdx;
  setCell(ws, rMarHeadQty, 1, "Monthly\nAchievement\nRate", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rMarHeadQty, 2, "Quantity\n(PCS)", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMarHeadQty, c0 + 0, "Target", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 2, "Actual", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 4, "Achievement Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMarQtyVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "02", fk);
    setNumber(ws, rMarQtyVal, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  const rMarAmtHead = rowIdx;
  setCell(ws, rMarAmtHead, 2, "Amount\n(USD)", {
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "03", fk);
    setNumber(ws, rMarAmtHead, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  /* Machine Operating Rate (noRow="04") */
  const rMorHead = rowIdx;
  setCell(ws, rMorHead, 1, "Machine Operating Rate", {
    rowSpan: 2,
    colSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMorHead, c0 + 0, "Total", { colSpan: 2, fill, bold: true });
    setCell(ws, rMorHead, c0 + 2, "Operation", { colSpan: 2, fill, bold: true });
    setCell(ws, rMorHead, c0 + 4, "Operating Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMorVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [v1, v2, v3] = getTriple(byNoRow, "04", fk);
    setNumber(ws, rMorVal, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, rMorVal, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, rMorVal, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });

  rowIdx++;

  /* ---------- Normal Pressure (noRow 05,06,07) : 행 놀지 않게 3줄로 정리 ---------- */
  let r = rowIdx;
  setCell(ws, r, 1, "Normal\nPressure", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  // ~499
  setCell(ws, r, 2, "~499", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "05", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 500~999
  setCell(ws, r, 2, "500~999", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "06", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 1000~
  setCell(ws, r, 2, "1000~", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "07", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;
  rowIdx = r;

  /* ---------- Normal & High pressure (noRow 08,09,10) ---------- */
  r = rowIdx;
  setCell(ws, r, 1, "Normal\n&High\npressure", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  // ~499
  setCell(ws, r, 2, "~499", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "08", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 500~999
  setCell(ws, r, 2, "500~999", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "09", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 1000~
  setCell(ws, r, 2, "1000~", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "10", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;
  rowIdx = r;

  /* ---------- High pressure (noRow 11,12,13) ---------- */
  r = rowIdx;
  setCell(ws, r, 1, "High\npressure", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });

  // ~499
  setCell(ws, r, 2, "~499", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "11", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 500~999
  setCell(ws, r, 2, "500~999", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "12", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;

  // 1000~
  setCell(ws, r, 2, "1000~", {
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "13", fk);
    const isTotal = fk === "total";
    setNumber(ws, r, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, r, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  r++;
  rowIdx = r;

  /* Sample (noRow 14) */
  const rSampleLabel = rowIdx;
  setCell(ws, rSampleLabel, 1, "Sample", {
    rowSpan: 2,
    colSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  rowIdx++;

  const rSampleVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const [v1, v2, v3] = getTriple(byNoRow, "14", fk);
    const isTotal = fk === "total";
    setNumber(ws, rSampleVal, c0 + 0, v1, { colSpan: 2, isTotal });
    setNumber(ws, rSampleVal, c0 + 2, v2, { colSpan: 2, isTotal });
    setNumber(ws, rSampleVal, c0 + 4, v3, { colSpan: 2, isTotal, isPercent: true });
  });
  rowIdx++;

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   5. Yarn-dyeing Department (cdPart="05")
=========================================================== */
function writeYarnDyeingSection(
  ws: ExcelJS.Worksheet,
  startRow: number,
  dailyReportList: DailyReportListRes[]
): number {
  let rowIdx = startRow;

  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "5. Yarn-dyeing Department";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  const rows05 = dailyReportList.filter((r) => r.cdPart === "05");
  const byNoRow = indexByNoRow(rows05);

  rowIdx = writeFactoryHead(ws, rowIdx);

  /* Performance / Daily (noRow="01") */
  const rPerfHead = rowIdx;
  setCell(ws, rPerfHead, 1, "Performance", {
    rowSpan: 2,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rPerfHead, 2, "Daily", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenter,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rPerfHead, c0 + 0, "Quantity (KG)", { colSpan: 3, fill, bold: true });
    setCell(ws, rPerfHead, c0 + 3, "Amount (USD)", { colSpan: 3, fill, bold: true });
  });

  rowIdx++;

  const rPerfVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const q = getOne(byNoRow, "01", 1, fk);
    const a = getOne(byNoRow, "01", 2, fk);
    setNumber(ws, rPerfVal, c0 + 0, q, { colSpan: 3, isTotal });
    setNumber(ws, rPerfVal, c0 + 3, a, { colSpan: 3, isTotal });
  });

  rowIdx++;

  /* Monthly Achievement Rate (noRow=02,03) */
  const rMarHeadQty = rowIdx;
  setCell(ws, rMarHeadQty, 1, "Monthly\nAchievement\nRate", {
    rowSpan: 3,
    fill: fillHead,
    align: alignCenterWrap,
    bold: true,
  });
  setCell(ws, rMarHeadQty, 2, "Quantity\n(PCS)", {
    rowSpan: 2,
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const fill = isTotal ? fillTotalHead : fillSubHead;
    setCell(ws, rMarHeadQty, c0 + 0, "Target", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 2, "Actual", { colSpan: 2, fill, bold: true });
    setCell(ws, rMarHeadQty, c0 + 4, "Achievement Rate", { colSpan: 2, fill, bold: true });
  });

  rowIdx++;

  const rMarQtyVal = rowIdx;
  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "02", fk);
    setNumber(ws, rMarQtyVal, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarQtyVal, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  const rMarAmtHead = rowIdx;
  setCell(ws, rMarAmtHead, 2, "Amount\n(USD)", {
    fill: fillSubHead,
    align: alignCenterWrap,
    bold: true,
  });

  factoryKeys.forEach((fk, idx) => {
    const c0 = colStart(idx);
    const isTotal = fk === "total";
    const [t, a, r] = getTriple(byNoRow, "03", fk);
    setNumber(ws, rMarAmtHead, c0 + 0, t, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 2, a, { colSpan: 2, isTotal });
    setNumber(ws, rMarAmtHead, c0 + 4, r, { colSpan: 2, isTotal, isPercent: true, fillRate: true });
  });

  rowIdx++;

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   6. Total (Sewing, Knitting, Dyeing, Yarn dyeing)
=========================================================== */
function writeTotalSection(ws: ExcelJS.Worksheet, startRow: number): number {
  let rowIdx = startRow;

  // 제목 (폭 맞추기 위해 1~26 merge)
  const titleRow = ws.getRow(rowIdx++);
  const titleCell = titleRow.getCell(1);
  titleCell.value = "6. Total (Sewing, Knitting, Dyeing, Yarn dyeing)";
  styleCell(titleCell, { font: fontTitle, align: alignLeft });
  ws.mergeCells(rowIdx - 1, 1, rowIdx - 1, 26);

  // 헤더
  const headRow = ws.getRow(rowIdx++);
  const headValues = ["Division", "PANKO VINA", "PANKO TAMTHANG", "PANKO BAGO", "Total"];
  headValues.forEach((v, i) => {
    const cell = headRow.getCell(i + 1);
    cell.value = v;
    styleCell(cell, {
      border: borderThin,
      align: alignCenter,
      font: fontDefault,
      fill: i === 0 ? fillSubHead : i === 4 ? fillTotal : fillSubHead,
    });
  });

  // 데이터 (예시 – 포맷만 맞춰 줌)
  const rows: { label: string; values: number[]; isPercent?: boolean }[] = [
    { label: "Daily Amount(USD)", values: [45264, 53719, 5062, 104045] },
    { label: "Monthly Amount(USD)", values: [789320, 1301804, 81397, 2172521] },
    { label: "Target Amount(USD)", values: [1888541, 2252154, 6852, 4147548] },
    { label: "Monthly Achievement Rate", values: [41.8, 57.8, 1187.93, 52.38], isPercent: true },
  ];

  rows.forEach((rowDef, rIdx) => {
    const row = ws.getRow(rowIdx++);
    headValues.forEach((_, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      if (cIdx === 0) {
        cell.value = rowDef.label;
        styleCell(cell, {
          border: borderThin,
          align: alignLeft,
          font: fontDefault,
        });
      } else {
        const v = rowDef.values[cIdx - 1];
        cell.value = rowDef.isPercent ? fmtPercent(v) : fmtNumber(v);
        styleCell(cell, {
          border: borderThin,
          align: alignCenter,
          font: fontDefault,
          fill: rowDef.isPercent ? fillRate : cIdx === 4 ? fillTotal : undefined,
        });
      }
    });
    row.height = 18;
  });

  rowIdx += 1;
  return rowIdx;
}

/* ===========================================================
   메인: 엑셀 다운로드
=========================================================== */
export async function exportDailyReportMultiExcel(dailyReportList: DailyReportListRes[]) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Daily Report", {
    properties: { defaultRowHeight: 18 },
    views: [{ showGridLines: false }],
  });

  // 전체 컬럼 폭 통일 (1~26까지만 사용)
  ws.columns = new Array(26).fill(null).map((_, idx) => {
    if (idx === 0) return { width: 18 }; // Item/Department
    if (idx === 1) return { width: 12 }; // Sub 헤더
    return { width: 12 };
  });

  let rowIdx = 1;

  // 1. Man Power Status
  rowIdx = writeManPowerSection(ws, rowIdx, dailyReportList);

  // 2. Sewing Department (cdPart=02)
  rowIdx = writeSewingSection(ws, rowIdx, dailyReportList);

  // 3. Knitting Department (cdPart=03)
  rowIdx = writeKnittingSection(ws, rowIdx, dailyReportList);

  // 4. Dyeing Department (cdPart=04)
  rowIdx = writeDyeingSection(ws, rowIdx, dailyReportList);

  // 5. Yarn-dyeing Department (cdPart=05)
  rowIdx = writeYarnDyeingSection(ws, rowIdx, dailyReportList);

  // 6. Total
  rowIdx = writeTotalSection(ws, rowIdx);

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");

  saveAs(blob, `Daily_Report_${y}${m}${d}.xlsx`);
}
