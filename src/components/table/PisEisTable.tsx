// src/components/table/PisEisTable.tsx
import React, {Dispatch, memo, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {
  useAsyncDebounce,
  useExpanded,
  useGlobalFilter,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import classNames from "classnames";
import {useVirtualizer} from "@tanstack/react-virtual";

/* ===== 외부에서 재사용할 수 있게 타입 노출 ===== */
export interface RndArticleModel {
  seqArticle?: string | number;
  seqNo?: string | number;

  [k: string]: any;
}

export interface RndArticleRecapRes extends RndArticleModel {
}

export interface RndArticleFavoriteRes extends RndArticleModel {
}

export interface CorporationPlListRes extends RndArticleModel {
}

export interface TableColumn {
  Header: string;
  accessor?: string;
  id?: string;
  colSpan?: number;
  columns?: TableColumn[];
  sort?: boolean;
  Cell?: any;
  className?: string; // ✅ 가운데정렬 등 클래스 지정
  editable?: boolean;
  type?: "text" | "select" | "checkbox";
  options?: any;
  isOptionsNull?: boolean;

  number?: boolean;
  numberMode?: "int" | "decimal";
  isSearchBtn?: boolean;
  disabled?: boolean;

  minWidth?: number;
  width?: number | string;
  maxWidth?: number;

  /** ✅ 고정 여부 */
  leftSticky?: boolean;
  rightSticky?: boolean;

  /** ✅ 그룹 끝(세로경계선 표시용) */
  groupEnd?: boolean;
}

interface TableProps {
  disabled?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  pagination?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
  isOnlySelected?: boolean;
  sizePerPageList?: { text: string; value: number }[];

  columns: TableColumn[];
  data: any[];
  pageSize?: number;

  searchBoxClass?: string;
  tableClass?: string;
  theadClass?: string;

  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onClose?: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;

  onCheckboxChange?: (row: RndArticleModel, e: React.ChangeEvent<HTMLInputElement>) => void;
  checkedRow?: RndArticleModel | null;
  checkedRows?: RndArticleModel[] | RndArticleRecapRes[] | RndArticleFavoriteRes[];
  selectedRow?: RndArticleModel | RndArticleRecapRes | RndArticleFavoriteRes | CorporationPlListRes | any | null;

  errorMsg?: string;

  updateData?: (rowIndex: number, columnId: string, value: string) => void;
  setIsShowOurUserPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowCompanyPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowStylePopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowBuyerPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowBrandPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowItemPopup?: Dispatch<SetStateAction<boolean>>;
  setCurrentOrderRowIndex?: Dispatch<SetStateAction<number>>;
  setCurrentAttendRowIndex?: Dispatch<SetStateAction<number>>;

  /** 고정 컬럼이 있으면 자동으로 가상 스크롤 비활성 */
  virtualize?: boolean;
  highlightCodes?: string[];
  highlightInvalidRow?: boolean;

  /* 바 스타일 조절 */
  barHeightStyle?: string;

}

/* ===== Z-INDEX 계층 ===== */
const Z = {
  base: 1,
  stickyCell: 10,
  stickyHeader: 25,
  stickyGroup: 40,
} as const;
const renderSafeCell = (cell: any) => {
  // react-table 기본 렌더 결과
  const rendered =
    typeof cell?.render === "function" ? cell.render("Cell") : cell?.value;

  if (rendered === null || rendered === undefined) return "";

  // JSX Element
  if (React.isValidElement(rendered)) return rendered;

  // primitive
  const t = typeof rendered;
  if (t === "string" || t === "number" || t === "boolean") {
    return String(rendered);
  }

  // Date
  if (rendered instanceof Date) {
    return rendered.toISOString();
  }

  // Array
  if (Array.isArray(rendered)) {
    return rendered
      .map((v) => {
        if (v == null) return "";
        if (React.isValidElement(v)) return "";
        if (typeof v === "object") {
          try {
            return JSON.stringify(v);
          } catch {
            return "";
          }
        }
        return String(v);
      })
      .join(", ");
  }

  // Object
  try {
    return JSON.stringify(rendered);
  } catch {
    return String(rendered);
  }
};

/* ===== 유틸 ===== */
function flattenLeafColumns(columns: TableColumn[], acc: (TableColumn & { id?: string })[] = []) {
  columns.forEach((col) => {
    if (col.columns && col.columns.length) flattenLeafColumns(col.columns, acc);
    else acc.push(col);
  });
  return acc;
}

function colWidth(col: TableColumn) {
  if (typeof col.width === "number") return col.width;
  if (typeof col.minWidth === "number") return col.minWidth;
  return 120;
}

function computeStickyMeta(flatCols: TableColumn[]) {
  const leftCols = flatCols.filter((c) => c.leftSticky);
  const rightCols = flatCols.filter((c) => c.rightSticky);
  return {hasSticky: leftCols.length > 0 || rightCols.length > 0};
}

/** 선택 행 비교용 키 생성(부모-자식 트리 키) */
function getRowKeyFromData(d: any) {
  return `${d?.tpGrpLv ?? ""}|${d?.cdAcctGrp ?? ""}|${d?.cdHacctGrp ?? ""}`;
}

/** selectedRow 비교 */
function isSelectedRow(rowOriginal: any, selectedRow: any) {
  const selK = selectedRow?.__k;
  if (selK != null && selK !== "") return selK === getRowKeyFromData(rowOriginal);
  if (selectedRow?.seqNo != null && rowOriginal?.seqNo != null) {
    return String(selectedRow.seqNo) === String(rowOriginal.seqNo);
  }
  return false;
}

/** 그룹 헤더가 좌측 고정 자식을 갖는지 + 그중 제일 왼쪽 leaf의 offset(실측) */
function findFirstLeftStickyLeafOffset(
  col: TableColumn,
  measuredLeftOffsets: Map<string | undefined, number>
): number | null {
  if (!col.columns || col.columns.length === 0) {
    if (col.leftSticky) return measuredLeftOffsets.get(col.id || col.accessor) ?? 0;
    return null;
  }
  for (const child of col.columns) {
    const off = findFirstLeftStickyLeafOffset(child, measuredLeftOffsets);
    if (off !== null) return off;
  }
  return null;
}

/* ===== 체크박스 ===== */
const IndeterminateCheckbox: React.FC<{
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (e: any) => void;
}> = ({checked, indeterminate, onChange}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current && typeof indeterminate === "boolean") {
      ref.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);
  return (
    <div className="form-check m-0 d-flex justify-content-center">
      <input ref={ref} type="checkbox" className="form-check-input" checked={!!checked} onChange={onChange}/>
      <label className="form-check-label"/>
    </div>
  );
};

/* ===== GlobalFilter ===== */
const GlobalFilter = memo(
  ({
     preGlobalFilteredRows,
     globalFilter,
     setGlobalFilter,
     searchBoxClass,
   }: {
    preGlobalFilteredRows: any;
    globalFilter: any;
    setGlobalFilter: any;
    searchBoxClass?: string;
  }) => {
    const count = preGlobalFilteredRows?.length ?? 0;
    const [value, setValue] = useState<any>(globalFilter);
    const onChange = useAsyncDebounce((val: string) => setGlobalFilter(val || undefined), 200);
    return (
      <div className={classNames(searchBoxClass)}>
        <span className="d-flex align-items-center">
          Search :{" "}
          <input
            type="search"
            value={value || ""}
            onChange={(e: any) => {
              setValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`${count} records...`}
            className="form-control w-auto ms-1"
          />
        </span>
      </div>
    );
  }
);

/* ===== EditableCell ===== */
const EditableCell = memo(
  ({
     value: initialValue,
     header,
     row,
     column,
     updateData,
     isSearchBtn = false,
     isOnlySelected = false,
     disabled = false,
     setIsShowOurUserPopup,
     setIsShowCompanyPopup,
     setIsShowStylePopup,
     setIsShowBuyerPopup,
     setIsShowBrandPopup,
     setIsShowItemPopup,
     setCurrentOrderRowIndex,
     setCurrentAttendRowIndex,
   }: {
    value: string;
    header: any;
    row: { index: number; original: any };
    column: TableColumn & { id: string };
    disabled?: boolean;
    updateData?: (rowIndex: number, columnId: string, value: string) => void;
    isSearchBtn?: boolean;
    isOnlySelected?: boolean;
    setIsShowOurUserPopup?: Dispatch<SetStateAction<boolean>>;
    setIsShowCompanyPopup?: Dispatch<SetStateAction<boolean>>;
    setIsShowStylePopup?: Dispatch<SetStateAction<boolean>>;
    setIsShowBuyerPopup?: Dispatch<SetStateAction<boolean>>;
    setIsShowBrandPopup?: Dispatch<SetStateAction<boolean>>;
    setIsShowItemPopup?: Dispatch<SetStateAction<boolean>>;
    setCurrentOrderRowIndex?: Dispatch<SetStateAction<number>>;
    setCurrentAttendRowIndex?: Dispatch<SetStateAction<number>>;
  }) => {
    const [value, setValue] = useState<string>(initialValue ?? "");
    const lastValue = useRef<string>(initialValue ?? "");
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setValue(initialValue ?? "");
      lastValue.current = initialValue ?? "";
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let newValue = e.target.value;

      if (column.number) {
        const mode = column.numberMode ?? "int";
        const allowNeg = false;
        newValue = newValue.replace(/,/g, "");
        const intRe = allowNeg ? /^-?\d*$/ : /^\d*$/;
        const decRe = allowNeg ? /^-?\d*(\.\d*)?$/ : /^\d*(\.\d*)?$/;
        const re = mode === "decimal" ? decRe : intRe;
        if (!re.test(newValue)) return;
      }

      setValue(newValue);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        if (newValue !== lastValue.current) {
          lastValue.current = newValue;
          updateData?.(row.index, column.id, newValue);
        }
      }, 250);
    };

    const formatNumberPreserveDecimals = (raw: string) => {
      if (raw === "") return "";
      if (!/^-?\d*(\.\d*)?$/.test(raw)) return raw;
      const [i, f] = raw.split(".");
      const intFormatted = i === "" || i === "-" ? i : Number(i).toLocaleString();
      return f != null ? `${intFormatted}.${f}` : intFormatted;
    };

    const handleBlur = () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      if (column.number) {
        const mode = column.numberMode ?? "int";
        const raw = String(value).replace(/,/g, "");
        const display =
          mode === "decimal" ? formatNumberPreserveDecimals(raw) : raw === "" ? "" : Number(raw).toLocaleString();
        setValue(display);
        if (raw !== lastValue.current) {
          lastValue.current = raw;
          updateData?.(row.index, column.id, raw);
        }
        return;
      }

      if (value !== lastValue.current) {
        lastValue.current = value;
        updateData?.(row.index, column.id, value);
      }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked ? "1" : "0";
      setValue(newValue);
      updateData?.(row.index, column.id, newValue);
    };

    const handleUserPopup = () => {
      setCurrentOrderRowIndex?.(row.index);
      setCurrentAttendRowIndex?.(row.index);
      if (setIsShowOurUserPopup && header === "성명") setIsShowOurUserPopup(true);
      if (setIsShowCompanyPopup && header === "회사명") setIsShowCompanyPopup(true);
      if (setIsShowStylePopup && header === "Style") setIsShowStylePopup(true);
      if (setIsShowBuyerPopup && header === "Buyer") setIsShowBuyerPopup(true);
      if (setIsShowBrandPopup && header === "BRAND") setIsShowBrandPopup(true);
      if (setIsShowItemPopup && header === "ITEM") setIsShowItemPopup(true);
    };

    if (column.type === "checkbox") {
      return (
        <input
          className="system-form-check-input"
          type="checkbox"
          checked={value === "1"}
          onChange={handleCheckboxChange}
          disabled={disabled}
        />
      );
    }

    if (column.type === "select" && column.options) {
      return (
        <select
          className={"input-pis-table-custom text-center"}
          value={value ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        >
          {column.isOptionsNull && <option value={""}></option>}
          {column.options.map((opt: any, index: number) => (
            <option key={index} value={opt.cdSysdef}>
              {opt.nmSysdef}
            </option>
          ))}
        </select>
      );
    }
    const resolveAlign = () => {
      const cls = (column.className ?? "").toLowerCase();
      if (cls.includes("text-center")) return "center";
      if (cls.includes("text-end") || cls.includes("text-right")) return "right";
      return column.number ? "right" : "left";
    };
    const align = resolveAlign();

    // ---- 중략 ----

    return (
      <div style={{display: "flex", alignItems: "center"}}>
        {!isOnlySelected ? (
          <input
            className="input-pis-table-custom"
            type="text"
            inputMode={column.number ? (column.numberMode === "decimal" ? "decimal" : "numeric") : undefined}
            value={
              column.number
                ? column.numberMode === "decimal"
                  ? formatNumberPreserveDecimals(String(value))
                  : String(value) !== "" && /^\d+$/.test(String(value))
                    ? Number(value).toLocaleString()
                    : String(value)
                : String(value)
            }
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            style={{width: "100%", textAlign: align}}
          />
        ) : (
          <span
            style={{
              width: "100%",
              display: "inline-block",
              textAlign: align,
            }}
          >
            {column.number && value && !isNaN(Number(value)) ? Number(value).toLocaleString() : value}
          </span>
        )}

        {isSearchBtn && (
          <button
            type="button"
            className="fg-btn btn btn-light btn-sm ms-1"
            onClick={handleUserPopup}
            title="Search"
          >
            <i className="ti ti-search"/>
          </button>
        )}
      </div>
    );
  }
);

/* ===== 메인 테이블 ===== */
const PisEisTable: React.FC<TableProps> = memo((props) => {
  const {
    isSearchable = false,
    isSortable = false,
    pagination = false,
    isSelectable = false,
    isExpandable = false,
    isOnlySelected,
    sizePerPageList = [],
    onRowClick,
    onRowDoubleClick,
    onClose,
    onScroll,
    onCheckboxChange,
    checkedRow,
    checkedRows,
    virtualize = false,
    highlightCodes,
    barHeightStyle,
  } = props;

  const defaultColumn = useMemo(
    () => ({
      Cell: (cellProps: any) => (
        <EditableCell
          {...cellProps}
          isOnlySelected={isOnlySelected}
          isSearchBtn={cellProps.column.isSearchBtn}
          disabled={cellProps.column.disabled}
          updateData={props.updateData}
          setIsShowOurUserPopup={props.setIsShowOurUserPopup}
          setIsShowCompanyPopup={props.setIsShowCompanyPopup}
          setIsShowStylePopup={props.setIsShowStylePopup}
          setIsShowBuyerPopup={props.setIsShowBuyerPopup}
          setIsShowBrandPopup={props.setIsShowBrandPopup}
          setIsShowItemPopup={props.setIsShowItemPopup}
          setCurrentOrderRowIndex={props.setCurrentOrderRowIndex}
          setCurrentAttendRowIndex={props.setCurrentAttendRowIndex}
        />
      ),
      minWidth: 30,
      width: 30,
      maxWidth: 600,
    }),
    [isOnlySelected, props.updateData]
  );

  const isControlledSelection = Array.isArray(checkedRows);
  const plugins: any[] = [];
  if (isSearchable) plugins.push(useGlobalFilter);
  if (isSortable) plugins.push(useSortBy);
  if (isExpandable) plugins.push(useExpanded);
  if (pagination) plugins.push(usePagination);
  if (isSelectable && !isControlledSelection) plugins.push(useRowSelect);
  plugins.push(useResizeColumns);

  const tableInstance = useTable(
    {
      columns: props.columns as any,
      data: props.data,
      defaultColumn,
      initialState: {pageSize: props.pageSize || 10},
      autoResetResize: false,
      autoResetSelectedRows: false,
    },
    ...plugins,
    (hooks) => {
      if (isSelectable) {
        hooks.visibleColumns.push((columns: any[]) => {
          if (isControlledSelection) {
            const isRowChecked = (orig: any) =>
              (checkedRows || []).some((r) => String((r as any).seqArticle) === String(orig?.seqArticle));
            return [
              {
                id: "selection",
                Header: "",
                width: 36,
                Cell: ({row}: any) => (
                  <div className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isRowChecked(row.original)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onCheckboxChange?.(row.original, e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ),
              },
              ...columns,
            ];
          }
          return [
            {
              id: "selection",
              Header: "",
              width: 36,
              Cell: ({row}: any) => (
                <div className="text-center">
                  <IndeterminateCheckbox
                    {...row.getToggleRowSelectedProps({
                      onChange: (e: any) => {
                        e.stopPropagation();
                        onCheckboxChange?.(row.original, e);
                      },
                    })}
                    checked={checkedRow?.seqArticle === row.original.seqArticle}
                  />
                </div>
              ),
            },
            ...columns,
          ];
        });
      }
    }
  );

  const rows = pagination ? (tableInstance as any).page : (tableInstance as any).rows;

  /** ===== sticky 대상/leaf ===== */
  const flatLeafCols: TableColumn[] = useMemo(() => flattenLeafColumns(props.columns || []), [props.columns]);
  const {hasSticky} = useMemo(() => computeStickyMeta(flatLeafCols), [flatLeafCols]);
  const useVirtual = virtualize && !hasSticky;

  /** ===== 헤더 줄 높이 실측 (겹침 방지) ===== */
  const headerRowRefs = useRef<HTMLTableRowElement[]>([]);
  const [headerRowTops, setHeaderRowTops] = useState<number[]>([]);
  useLayoutEffect(() => {
    const heights = headerRowRefs.current.map((tr) => (tr ? tr.getBoundingClientRect().height : 0));
    const tops: number[] = [];
    let acc = 0;
    for (let i = 0; i < heights.length; i++) {
      tops.push(acc);
      acc += heights[i];
    }
    setHeaderRowTops(tops);
  }, [props.columns]);

  /** ===== 실측 기반 sticky offset ===== */
  const headerLeafCellRefs = useRef<Map<string | undefined, HTMLTableCellElement>>(new Map());
  const [measuredLeftOffsets, setMeasuredLeftOffsets] = useState<Map<string | undefined, number>>(new Map());
  const [measuredRightOffsets, setMeasuredRightOffsets] = useState<Map<string | undefined, number>>(new Map());

  useLayoutEffect(() => {
    const left = new Map<string | undefined, number>();
    const right = new Map<string | undefined, number>();

    // 좌측: leaf 순서대로 누적
    let accLeft = 0;
    for (const col of flatLeafCols) {
      if (!col.leftSticky) continue;
      const key = col.id || col.accessor;
      const el = headerLeafCellRefs.current.get(key);
      const w = el?.getBoundingClientRect().width ?? colWidth(col);
      left.set(key, accLeft);
      accLeft += w;
    }

    // 우측: 뒤에서부터 누적
    let accRight = 0;
    for (let i = flatLeafCols.length - 1; i >= 0; i--) {
      const col = flatLeafCols[i];
      if (!col.rightSticky) continue;
      const key = col.id || col.accessor;
      const el = headerLeafCellRefs.current.get(key);
      const w = el?.getBoundingClientRect().width ?? colWidth(col);
      right.set(key, accRight);
      accRight += w;
    }

    setMeasuredLeftOffsets(left);
    setMeasuredRightOffsets(right);
  }, [flatLeafCols, headerRowTops]);

  /* ===== 경계선 색 ===== */
  const BORDER_COLOR = "#cbd5e1";

  /* ===== 헤더 sticky 스타일 ===== */
  const getHeaderStickyStyle = (col: any, rowIndex: number): React.CSSProperties => {
    const key = col.id || col.accessor;
    const style: React.CSSProperties = {
      position: "sticky",
      top: headerRowTops[rowIndex] ?? 0,
      background: "#bbdaf6",
      zIndex: Z.stickyHeader,
      overflow: "hidden",
      backgroundClip: "padding-box",
    };

    if (col.leftSticky) {
      style.left = measuredLeftOffsets.get(key) || 0;
      style.zIndex = Z.stickyHeader;
    }
    if (col.rightSticky) {
      style.right = measuredRightOffsets.get(key) || 0;
      style.zIndex = Z.stickyHeader;
    }

    const groupLeft = findFirstLeftStickyLeafOffset(col, measuredLeftOffsets);
    if (groupLeft !== null) {
      style.left = groupLeft;
      style.right = undefined;
      style.zIndex = Z.stickyGroup;
      style.borderRight = `1px solid ${BORDER_COLOR}`;
      const w = (function sumLeftStickyWidth(c: TableColumn): number {
        if (!c.columns || c.columns.length === 0) return c.leftSticky ? colWidth(c) : 0;
        return c.columns.reduce((acc, x) => acc + sumLeftStickyWidth(x), 0);
      })(col);
      if (w > 0) {
        style.minWidth = w;
        style.width = w;
        style.maxWidth = w;
      }
    }

    if (col.leftSticky && !col.columns) {
      style.borderRight = `1px solid ${BORDER_COLOR}`;
    }
    if (col.rightSticky && !col.columns) {
      style.borderLeft = `1px solid ${BORDER_COLOR}`;
    }

    if (!col.leftSticky && !col.rightSticky && !col.columns && col.groupEnd) {
      style.borderRight = `1px solid ${BORDER_COLOR}`;
    }

    return style;
  };

  /* ===== 본문 셀 sticky 스타일 ===== */
  const getCellStickyStyle = (col: any): React.CSSProperties => {
    const key = col.id || col.accessor;
    const style: React.CSSProperties = {};
    if (col.leftSticky) {
      style.position = "sticky";
      style.left = measuredLeftOffsets.get(key) || 0;
      style.zIndex = Z.stickyCell;
      style.overflow = "hidden";
      style.backgroundClip = "padding-box";
      style.borderRight = `1px solid ${BORDER_COLOR}`;
    }
    if (col.rightSticky) {
      style.position = "sticky";
      style.right = measuredRightOffsets.get(key) || 0;
      style.zIndex = Z.stickyCell;
      style.overflow = "hidden";
      style.backgroundClip = "padding-box";
      style.borderLeft = `1px solid ${BORDER_COLOR}`;
    }
    if (!col.leftSticky && !col.rightSticky && col.groupEnd) {
      style.borderRight = `1px solid ${BORDER_COLOR}`;
    }
    return style;
  };

  /** ===== 컨테이너 ===== */
  const tableWrapRef = useRef<HTMLDivElement>(null);

  /** ===== 가상 스크롤러 ===== */
  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? rows.length : 0,
    getScrollElement: () => tableWrapRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  return (
    <>
      {isSearchable && (
        <GlobalFilter
          preGlobalFilteredRows={(tableInstance as any).preGlobalFilteredRows}
          globalFilter={(tableInstance as any).state.globalFilter}
          setGlobalFilter={(tableInstance as any).setGlobalFilter}
          searchBoxClass={props.searchBoxClass}
        />
      )}

      <div
        className="eis-table-container"
        style={{height: `${barHeightStyle ? barHeightStyle : "calc(-100px + 85vh)"}`}}
      >
        <div
          className="table-responsive"
          onScroll={onScroll}
          ref={tableWrapRef}
          style={{
            overflowX: "auto",
            overflowY: "auto",
            height: "calc(-100px + 90vh)",
          }}
        >
          <table
            {...tableInstance.getTableProps()}
            className={classNames("table table-centered eis-react-table", props.tableClass)}
            style={{
              width: "max-content",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            {/* ===== 헤더 ===== */}
            <thead className={props.theadClass}>
            {(tableInstance as any).headerGroups.map((hg: any, rowIdx: number) => (
              <tr
                {...hg.getHeaderGroupProps()}
                ref={(el) => {
                  if (el) headerRowRefs.current[rowIdx] = el;
                }}
              >
                {hg.headers.map((column: any) => {

                  // 1) 자식 중에 빈 헤더("")가 있으면, 부모를 첫 행에만 rowSpan=2로 렌더링
                  const hasGhostChild = column.columns && column.columns.some((c: any) => c.Header === "");

                  if (hasGhostChild && rowIdx > 0) {
                    // 두 번째 행 이후에는 부모 안 그린다 (첫 행에서 rowSpan으로 이미 차지함)
                    return null;
                  }

                  const rowSpan = hasGhostChild ? 2 : 1;

                  return (
                    <th
                      rowSpan={rowSpan}
                      {...column.getHeaderProps(column.sort && column.getSortByToggleProps())}
                      ref={(el) => {
                        if (el && !(column.columns && column.columns.length)) {
                          const key = column.id || column.accessor;
                          headerLeafCellRefs.current.set(key, el as HTMLTableCellElement);
                        }
                      }}
                      className={classNames(column.className, {
                        sorting_desc: column.isSortedDesc === true,
                        sorting_asc: column.isSortedDesc === false,
                        sortable: column.sort === true,
                      })}
                      style={{
                        position: "relative",
                        zIndex: Z.base,
                        ...getHeaderStickyStyle(column, rowIdx),
                        minWidth: column.minWidth,
                        width: column.width,
                        maxWidth: column.maxWidth,
                        background: "#bbdaf6",
                        backgroundClip: "padding-box",
                      }}
                    >
                      {column.render("Header")}
                      {column.getResizerProps && (
                        <div
                          {...column.getResizerProps()}
                          className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                          onClick={(event) => event.stopPropagation()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            </thead>

            {/* ===== 바디 (비가상) ===== */}
            {!useVirtual && (
              <tbody {...(tableInstance as any).getTableBodyProps()}>
              {rows.map((row: any, idx: number) => {
                (tableInstance as any).prepareRow(row);
                const selected = isSelectedRow(row.original, props.selectedRow);
                const zebraEven = "#f7f7f7"; // 짝수행
                const zebraOdd = "#ffffff"; // 홀수행
                const highlightBg = "#D9F6EE"; // 두 번째 이미지 같은 연한 민트
                const selectedBg = "#d9ebf9";

                const zebra = idx % 2 === 0 ? zebraEven : zebraOdd;
                const isTotalRow = row.original?.group1 === 0 && row.original?.group2 === 0 && row.original?.group3 === 0 && row.original?.group4 === 0 && row.original?.group5 === 1 && row.original?.group6 === 0;
                const isSubTotalRow = row.original?.group1 === 0 && row.original?.group2 === 1 && row.original?.group3 === 0 && row.original?.group4 === 0 && row.original?.group5 === 0 && row.original?.group6 === 0;
                const isGrandTotalRow = row.original?.hDept === "999999999";

                const rowBgColor = (() => {
                  const highlightList = props.highlightCodes ?? [];
                  const code = String(row.original?.cdAcctGrp ?? "");


                  if (isTotalRow) return "#BBDAF6"; //total
                  if (isSubTotalRow) return "#D9F6EE"; //subTotal
                  if (isGrandTotalRow) return "#BBDAF6"; //grand total

                  if (highlightList.includes(code)) return highlightBg;
                  if (selected) return selectedBg;
                  return zebra;
                })();
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => onRowClick?.(row.original)}
                    onDoubleClick={() => {
                      onRowDoubleClick?.(row.original);
                      onClose?.();
                    }}
                    className={classNames(
                      {"pis-row-selected": selected},
                      {"font-900": isTotalRow},
                      {"font-900": isSubTotalRow},
                      {"font-900": isGrandTotalRow}
                    )}
                    style={{
                      cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
                      backgroundColor: rowBgColor,
                    }}
                  >
                    {row.cells.map((cell: any) => (
                      <td
                        colSpan={cell.column.colSpan ? cell.column.colSpan : 1}
                        {...cell.getCellProps()}
                        className={cell.column.className}
                        style={{
                          position: "relative",
                          padding: 0,
                          minWidth: cell.column.minWidth,
                          width: cell.column.width,
                          maxWidth: cell.column.maxWidth,
                          ...getCellStickyStyle(cell.column),
                        }}
                      >
                        {/* 실제로 겹침을 가리는 레이어 */}
                        <div
                          className="eis-cell-inner"
                          style={{
                            position: "relative",
                            zIndex: Z.base + 1,
                            height: "100%",
                            width: "100%",
                            backgroundClip: "padding-box",
                            background: rowBgColor,      // 행 배경색과 동일
                            overflow: "hidden",
                            padding: "4px 4px",      // ← 여기서 오른쪽/왼쪽 여백 조절
                            boxSizing: "border-box",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: cell.column.number ? "flex-end" :
                              (cell.column.className?.includes("text-center") ? "center" : "flex-start"),
                          }}
                        >
                          {cell.column.editable || cell.column.type === "checkbox" ? (
                            <EditableCell
                              value={cell.value}
                              header={cell.column.Header}
                              row={row}
                              column={cell.column}
                              updateData={props.updateData}
                              isSearchBtn={cell.column.isSearchBtn}
                              disabled={cell.column.disabled}
                              isOnlySelected={props.isOnlySelected}
                              setIsShowOurUserPopup={props.setIsShowOurUserPopup}
                              setIsShowCompanyPopup={props.setIsShowCompanyPopup}
                              setIsShowStylePopup={props.setIsShowStylePopup}
                              setIsShowBuyerPopup={props.setIsShowBuyerPopup}
                              setIsShowBrandPopup={props.setIsShowBrandPopup}
                              setIsShowItemPopup={props.setIsShowItemPopup}
                              setCurrentOrderRowIndex={props.setCurrentOrderRowIndex}
                              setCurrentAttendRowIndex={props.setCurrentAttendRowIndex}
                            />
                          ) : (
                            <span>{renderSafeCell(cell)}</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              </tbody>
            )}

            {/* ===== 바디 (가상) ===== */}
            {useVirtual && (
              <tbody {...(tableInstance as any).getTableBodyProps()}>
              <tr>
                <td colSpan={flatLeafCols.length} style={{padding: 0, border: "none"}}>
                  <div style={{height: `${rowVirtualizer.getTotalSize()}px`, position: "relative"}}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      (tableInstance as any).prepareRow(row);
                      const selected = isSelectedRow(row.original, props.selectedRow);

                      const lv = Number(row.original?.tpGrpLv);
                      const zebra = virtualRow.index % 2 === 0 ? "#f7f7f7" : "#ffffff";

                      return (
                        <div
                          key={row.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                            display: "flex",
                            cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
                            backgroundColor: zebra,
                          }}
                          onClick={() => onRowClick?.(row.original)}
                          onDoubleClick={() => {
                            onRowDoubleClick?.(row.original);
                            onClose?.();
                          }}
                          className={classNames({"pis-row-selected": selected})}
                        >
                          {row.cells.map((cell: any) => {
                            const widthPx =
                              (cell.column.width ?? cell.column.minWidth ?? 120) +
                              (cell.column?.__extraPaddingForVirtual ?? 0);
                            return (
                              <div
                                key={cell.column.id || cell.column.accessor}
                                {...cell.getCellProps()}
                                className={cell.column.className}
                                style={{
                                  flex: `0 0 ${widthPx}px`,
                                  minWidth: widthPx,
                                  maxWidth: cell.column.maxWidth,
                                  zIndex: Z.base,
                                  ...getCellStickyStyle(cell.column),
                                }}
                              >
                                {cell.column.editable || cell.column.type === "checkbox" ? (
                                  <EditableCell
                                    value={cell.value}
                                    header={cell.column.Header}
                                    row={row}
                                    column={cell.column}
                                    updateData={props.updateData}
                                    isSearchBtn={cell.column.isSearchBtn}
                                    disabled={cell.column.disabled}
                                    isOnlySelected={props.isOnlySelected}
                                    setIsShowOurUserPopup={props.setIsShowOurUserPopup}
                                    setIsShowCompanyPopup={props.setIsShowCompanyPopup}
                                    setIsShowStylePopup={props.setIsShowStylePopup}
                                    setIsShowBuyerPopup={props.setIsShowBuyerPopup}
                                    setIsShowBrandPopup={props.setIsShowBrandPopup}
                                    setIsShowItemPopup={props.setIsShowItemPopup}
                                    setCurrentOrderRowIndex={props.setCurrentOrderRowIndex}
                                    setCurrentAttendRowIndex={props.setCurrentAttendRowIndex}
                                  />
                                ) : (
                                  <span>{renderSafeCell(cell)}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* 페이지네이션 UI는 기존 Pagination 컴포넌트 쓰는 프로젝트만 표시하세요.
            없으면 이 블록 제거해도 됩니다. */}
        {/* {pagination && (
          <div className="pagination-container">
            <Pagination tableProps={tableInstance} sizePerPageList={sizePerPageList} />
          </div>
        )} */}
      </div>
    </>
  );
});

export default PisEisTable;
