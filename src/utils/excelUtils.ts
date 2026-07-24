// utils/excelUtils.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Workbook } from "exceljs";
import config from "../config";

/** ✅ 엑셀용 컬럼 타입: accessor는 선택(Optional) */
export interface ExcelColumn {
  Header: string;
  accessor?: string;
  columns?: ExcelColumn[];
  // (옵션) width 같은 값을 나중에 쓰고 싶으면 여기에 추가해도 됨: width?: number;
}

/** leaf(실데이터 열)만 뽑기 */
function flattenLeaves(cols: ExcelColumn[]): ExcelColumn[] {
  const out: ExcelColumn[] = [];
  const dfs = (c: ExcelColumn) => {
    if (c.columns && c.columns.length) c.columns.forEach(dfs);
    else out.push(c);
  };
  cols.forEach(dfs);
  return out;
}

/** 컬럼 트리의 최대 깊이 계산 */
function getDepth(cols: ExcelColumn[]): number {
  let max = 0;
  const dfs = (c: ExcelColumn, d: number) => {
    if (c.columns && c.columns.length) c.columns.forEach((ch) => dfs(ch, d + 1));
    else max = Math.max(max, d);
  };
  cols.forEach((c) => dfs(c, 1));
  return max || 1;
}

/** 해당 노드가 커버하는 leaf 개수(colSpan) */
function countLeaves(c: ExcelColumn): number {
  if (!c.columns || !c.columns.length) return 1;
  return c.columns.reduce((acc, ch) => acc + countLeaves(ch), 0);
}

/** 헤더 매트릭스 생성 및 병합 정보 계산 */
function buildHeaderMatrix(columns: ExcelColumn[]) {
  const depth = getDepth(columns);
  const leaves = flattenLeaves(columns); // 총 leaf 수 = 총 컬럼 수
  const matrix: (string | null)[][] = Array.from({ length: depth }, () => Array(leaves.length).fill(null));

  type Merge = { r1: number; c1: number; r2: number; c2: number };
  const merges: Merge[] = [];

  let curCol = 0; // 현재 채우는 leaf의 열 인덱스(0-based)

  const place = (col: ExcelColumn, level: number) => {
    const colSpan = countLeaves(col);
    const r1 = level - 1; // 0-based row
    const c1 = curCol; // 0-based col 시작
    // 셀 텍스트 채우기(좌상단)
    matrix[r1][c1] = col.Header;

    if (col.columns && col.columns.length) {
      // 그룹 노드: colSpan 만큼 가로 병합
      if (colSpan > 1) merges.push({ r1, c1, r2: r1, c2: c1 + colSpan - 1 });
      // 자식 배치
      col.columns.forEach((ch) => place(ch, level + 1));
    } else {
      // leaf: 아래로 남은 깊이만큼 세로 병합(rowSpan)
      const rowSpan = depth - level;
      if (rowSpan > 0) merges.push({ r1, c1, r2: r1 + rowSpan, c2: c1 });
      // 다음 leaf 열로 이동
      curCol += 1;
    }
  };

  columns.forEach((c) => place(c, 1));

  return { depth, leaves, matrix, merges };
}

// ───────────────────────────────
// 단순 엑셀 다운로드 (그룹 헤더 병합 지원)
// ───────────────────────────────
export function downloadExcel<T>(columns: ExcelColumn[], data: T[], fileName = "export.xlsx") {
  const { leaves, matrix } = buildHeaderMatrix(columns);

  // 헤더 영역(여러 줄) + 데이터 영역으로 AOA 구성
  const headerRows = matrix.map((row) => row.map((v) => v ?? ""));
  const dataRows = (data as any[]).map((row) => leaves.map((leaf) => (leaf.accessor ? row[leaf.accessor] ?? "" : "")));
  const aoa = [...headerRows, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}

// ───────────────────────────────
// 이미지 포함 엑셀 다운로드 (그룹 헤더 병합 + 스타일/보더)
// ───────────────────────────────
export async function downloadExcelWithImages<T extends { [key: string]: any }>(
  columns: ExcelColumn[],
  data: T[],
  token: string,
  fileName = "export.xlsx",
  imgWidth: number = 120,
  imgHeight: number = 70
) {
  const workbook = new Workbook();
  const ws = workbook.addWorksheet("Sheet1");

  // 1) 헤더 매트릭스 생성(병합 정보 포함)
  const { depth, leaves, matrix, merges } = buildHeaderMatrix(columns);

  // 2) 헤더 행 추가 + 병합 적용 + 스타일
  for (let r = 0; r < depth; r++) {
    const excelRow = ws.addRow(matrix[r].map((v) => v ?? ""));
    excelRow.height = 25;
    excelRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
      cell.font = { bold: true, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });
  }

  // 병합 좌표 적용(ExcelJS는 1-based)
  merges.forEach(({ r1, c1, r2, c2 }) => {
    ws.mergeCells(r1 + 1, c1 + 1, r2 + 1, c2 + 1);
  });

  // 3) 데이터 행
  data.forEach((row) => {
    const excelRow = ws.addRow(leaves.map((leaf) => (leaf.accessor ? row[leaf.accessor] ?? "" : "")));
    excelRow.alignment = { vertical: "middle", horizontal: "center" };
    excelRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });
  });

  // 4) 열 너비(간단 기본값)
  leaves.forEach((_, i) => {
    ws.getColumn(i + 1).width = 15;
  });

  // 5) 이미지 삽입(선택)
  //  - 이미지가 첫 번째 컬럼(열 1) 위치에 들어가도록 했지만,
  //    필요하면 특정 accessor 위치를 찾아서 col을 바꿔도 됩니다.
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex] as any;
    const excelRowIndex = depth + rowIndex + 1; // 헤더 depth만큼 아래

    // 높이 약간 키움(옵션)
    ws.getRow(excelRowIndex).height = imgHeight * 0.75;

    if (row.imgUrl) {
      try {
        const res = await fetch(row.imgUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("이미지 요청 실패:", row.imgUrl, res.status);
          continue;
        }
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const ext = row.imgUrl.toLowerCase().includes(".jpg") ? "jpeg" : "png";

        const imageId = workbook.addImage({ buffer, extension: ext });
        ws.addImage(imageId, {
          tl: { col: 0, row: excelRowIndex - 1 }, // col:0 => 1열(Excel 1-based로는 A열)
          ext: { width: imgWidth, height: imgHeight },
          editAs: "oneCell",
        });
      } catch (err) {
        console.error("이미지 다운로드 실패:", row.imgUrl, err);
      }
    }
  }

  // 6) 저장
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
}
