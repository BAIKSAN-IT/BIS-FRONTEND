// src/components/table/PisVirtualTable.tsx
import React, {Dispatch, memo, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState,} from "react";
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
  className?: string;
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

  leftSticky?: boolean;
  rightSticky?: boolean;

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

  onCheckboxChange?: (row: any, e: React.ChangeEvent<HTMLInputElement>) => void;
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

  virtualize?: boolean;
  highlightCodes?: string[];
  highlightInvalidRow?: boolean;

  barHeightStyle?: string;
}

/* ===== Z-INDEX 계층 ===== */
const Z = {
  base: 1,
  stickyCell: 10,
  stickyHeader: 25,
  stickyGroup: 40,
} as const;

/* ===== 안전 렌더 ===== */
const renderSafeCell = (cell: any) => {
  const rendered = typeof cell?.render === "function" ? cell.render("Cell") : cell?.value;
  if (rendered === null || rendered === undefined) return "";
  if (React.isValidElement(rendered)) return rendered;

  const t = typeof rendered;
  if (t === "string" || t === "number" || t === "boolean") return String(rendered);
  if (rendered instanceof Date) return rendered.toISOString();

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

  try {
    return JSON.stringify(rendered);
  } catch {
    return String(rendered);
  }
};

/* ===== 유틸 ===== */
function flattenLeafColumns(columns: any[], acc: any[] = []) {
  columns.forEach((col) => {
    if (col.columns && col.columns.length) flattenLeafColumns(col.columns, acc);
    else acc.push(col);
  });
  return acc;
}

function colWidthPx(col: any) {
  // react-table resize 플러그인 사용 시 totalWidth가 생깁니다(가장 신뢰)
  const w = col?.totalWidth ?? col?.width ?? col?.minWidth ?? 120;
  if (typeof w === "number") return w;

  // string("120px") 같은 값이 들어오면 px만 뽑아서 고정(가능한 number로 쓰는 걸 추천)
  if (typeof w === "string") {
    const m = w.match(/(\d+(\.\d+)?)/);
    if (m) return Math.round(Number(m[1]));
  }
  return 120;
}

function computeStickyMeta(flatCols: any[]) {
  const leftCols = flatCols.filter((c) => c.leftSticky);
  const rightCols = flatCols.filter((c) => c.rightSticky);
  return {hasSticky: leftCols.length > 0 || rightCols.length > 0};
}

function getRowKeyFromData(d: any) {
  return `${d?.tpGrpLv ?? ""}|${d?.cdAcctGrp ?? ""}|${d?.cdHacctGrp ?? ""}`;
}

function isSelectedRow(rowOriginal: any, selectedRow: any) {
  const selK = selectedRow?.__k;
  if (selK != null && selK !== "") return selK === getRowKeyFromData(rowOriginal);
  if (selectedRow?.seqNo != null && rowOriginal?.seqNo != null) {
    return String(selectedRow.seqNo) === String(rowOriginal.seqNo);
  }
  return false;
}

function findFirstLeftStickyLeafOffset(col: any, measuredLeftOffsets: Map<string, number>): number | null {
  if (!col.columns || col.columns.length === 0) {
    if (col.leftSticky) return measuredLeftOffsets.get(String(col.id || col.accessor || "")) ?? 0;
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
      <input
        ref={ref}
        type="checkbox"
        className="form-check-input"
        checked={!!checked}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
      />
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
    value: any;
    header: any;
    row: { index: number; original: any };
    column: TableColumn & { id?: string };
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
    const colId = String(column.id || column.accessor || "");
    const [value, setValue] = useState<string>(initialValue ?? "");
    const lastValue = useRef<string>(initialValue ?? "");
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      const v = initialValue ?? "";
      setValue(v);
      lastValue.current = v;
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
          updateData?.(row.index, colId, newValue);
        }
      }, 200);
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
          updateData?.(row.index, colId, raw);
        }
        return;
      }

      if (value !== lastValue.current) {
        lastValue.current = value;
        updateData?.(row.index, colId, value);
      }
    };

    const checkboxRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (column.type === "checkbox" && checkboxRef.current) {
        checkboxRef.current.checked = String(initialValue ?? "") === "1";
      }
    }, [initialValue, column.type]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked ? "1" : "0";
      updateData?.(row.index, colId, newValue);
    };

    const selectRef = useRef<HTMLSelectElement>(null);
    useEffect(() => {
      if (column.type === "select" && selectRef.current) {
        selectRef.current.value = String(initialValue ?? "");
      }
    }, [initialValue, column.type]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateData?.(row.index, colId, e.target.value);
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
          ref={checkboxRef}
          className="system-form-check-input"
          type="checkbox"
          defaultChecked={String(initialValue ?? "") === "1"}
          onChange={handleCheckboxChange}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    if (column.type === "select" && column.options) {
      return (
        <select
          ref={selectRef}
          className="input-pis-table-custom text-center"
          defaultValue={String(initialValue ?? "")}
          onChange={handleSelectChange}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        >
          {column.isOptionsNull && <option value=""/>}
          {column.options.map((opt: any, index: number) => (
            <option key={opt?.cdSysdef ?? index} value={opt?.cdSysdef ?? ""}>
              {opt?.nmSysdef ?? ""}
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

    return (
      <div style={{display: "flex", alignItems: "center", width: "100%"}}>
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
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={{width: "100%", display: "inline-block", textAlign: align}}>
            {column.number && value && !isNaN(Number(value)) ? Number(value).toLocaleString() : value}
          </span>
        )}

        {isSearchBtn && (
          <button
            type="button"
            className="fg-btn btn btn-light btn-sm ms-1"
            onClick={(e) => {
              e.stopPropagation();
              handleUserPopup();
            }}
            title="Search"
          >
            <i className="ti ti-search"/>
          </button>
        )}
      </div>
    );
  },
  (p, n) => p.value === n.value && p.disabled === n.disabled && p.isOnlySelected === n.isOnlySelected
);

/* ===== 메인 테이블 ===== */
const PisVirtualTable: React.FC<TableProps> = memo((props) => {
  const {
    isSearchable = false,
    isSortable = false,
    pagination = false,
    isSelectable = false,
    isExpandable = false,
    isOnlySelected,
    onScroll,
    onCheckboxChange,
    checkedRow,
    checkedRows,
    virtualize = false,
    barHeightStyle,
  } = props;

  const defaultColumn = useMemo(
    () => ({
      Cell: (cellProps: any) => (
        <EditableCell
          {...cellProps}
          isOnlySelected={isOnlySelected}
          isSearchBtn={cellProps?.column?.isSearchBtn}
          disabled={cellProps?.column?.disabled}
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
    [
      isOnlySelected,
      props.updateData,
      props.setIsShowOurUserPopup,
      props.setIsShowCompanyPopup,
      props.setIsShowStylePopup,
      props.setIsShowBuyerPopup,
      props.setIsShowBrandPopup,
      props.setIsShowItemPopup,
      props.setCurrentOrderRowIndex,
      props.setCurrentAttendRowIndex,
    ]
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
                width: 20,
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
              width: 20,
              Cell: ({row}: any) => (
                <div className="text-center">
                  <IndeterminateCheckbox
                    {...(row as any).getToggleRowSelectedProps({
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
  const flatLeafCols: any[] = useMemo(() => flattenLeafColumns(props.columns || []), [props.columns]);
  const {hasSticky} = useMemo(() => computeStickyMeta(flatLeafCols), [flatLeafCols]);

  // sticky 있으면 virtual 강제 OFF
  const useVirtual = virtualize && !hasSticky;

  /** ===== 헤더 줄 높이 실측 ===== */
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
  const headerLeafCellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const [measuredLeftOffsets, setMeasuredLeftOffsets] = useState<Map<string, number>>(new Map());
  const [measuredRightOffsets, setMeasuredRightOffsets] = useState<Map<string, number>>(new Map());

  useLayoutEffect(() => {
    const left = new Map<string, number>();
    const right = new Map<string, number>();

    let accLeft = 0;
    for (const col of flatLeafCols) {
      if (!col.leftSticky) continue;
      const key = String(col.id || col.accessor || "");
      const el = headerLeafCellRefs.current.get(key);
      const w = el?.getBoundingClientRect().width ?? colWidthPx(col);
      left.set(key, accLeft);
      accLeft += w;
    }

    let accRight = 0;
    for (let i = flatLeafCols.length - 1; i >= 0; i--) {
      const col = flatLeafCols[i];
      if (!col.rightSticky) continue;
      const key = String(col.id || col.accessor || "");
      const el = headerLeafCellRefs.current.get(key);
      const w = el?.getBoundingClientRect().width ?? colWidthPx(col);
      right.set(key, accRight);
      accRight += w;
    }

    setMeasuredLeftOffsets(left);
    setMeasuredRightOffsets(right);
  }, [flatLeafCols, headerRowTops]);

  const BORDER_COLOR = "#cbd5e1";

  const getHeaderStickyStyle = (col: any, rowIndex: number): React.CSSProperties => {
    const key = String(col.id || col.accessor || "");
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
      const w = (function sumLeftStickyWidth(c: any): number {
        if (!c.columns || c.columns.length === 0) return c.leftSticky ? colWidthPx(c) : 0;
        return c.columns.reduce((acc: number, x: any) => acc + sumLeftStickyWidth(x), 0);
      })(col);
      if (w > 0) {
        style.minWidth = w;
        style.width = w;
        style.maxWidth = w;
      }
    }

    if (col.leftSticky && !col.columns) style.borderRight = `1px solid ${BORDER_COLOR}`;
    if (col.rightSticky && !col.columns) style.borderLeft = `1px solid ${BORDER_COLOR}`;
    if (!col.leftSticky && !col.rightSticky && !col.columns && col.groupEnd) {
      style.borderRight = `1px solid ${BORDER_COLOR}`;
    }

    return style;
  };

  const getCellStickyStyle = (col: any): React.CSSProperties => {
    const key = String(col.id || col.accessor || "");
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
  const ROW_H = 32;
  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? rows.length : 0,
    getScrollElement: () => tableWrapRef.current,
    estimateSize: () => ROW_H,
    overscan: 12, // 살짝 올려서 스크롤 시 깜빡임/덜컥 줄임
  });

  const virtualItems = useVirtual ? rowVirtualizer.getVirtualItems() : [];
  const totalSize = useVirtual ? rowVirtualizer.getTotalSize() : 0;
  const paddingTop = useVirtual && virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = useVirtual && virtualItems.length ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

  /** ===== 여기부터가 안정화 핵심: colgroup + fixed layout ===== */
  const rtLeafCols = useMemo(() => {
    const vc = (tableInstance as any).visibleColumns ?? [];
    return flattenLeafColumns(vc);
  }, [(tableInstance as any).visibleColumns, (tableInstance as any).state?.columnResizing]);

  const leafWidths = useMemo(() => rtLeafCols.map((c: any) => colWidthPx(c)), [rtLeafCols]);
  const tableWidthPx = useMemo(() => leafWidths.reduce((a, b) => a + b, 0), [leafWidths]);

  const colSpanCount = (tableInstance as any).visibleColumns?.length ?? rtLeafCols.length;

  const containerH = barHeightStyle ? barHeightStyle : "calc(-100px + 85vh)";

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

      <div className="eis-table-container" style={{height: containerH}}>
        <div
          className="table-responsive"
          onScroll={onScroll}
          ref={tableWrapRef}
          style={{
            overflowX: "auto",
            overflowY: "auto",
            height: containerH, // 바깥/안쪽 높이 통일
            // 스크롤바 생김/없음으로 인한 폭 변화 완화(지원 브라우저에서)
            /*scrollbarGutter: "stable both-edges" as any,*/
          }}
        >
          <table
            {...tableInstance.getTableProps()}
            className={classNames("table table-centered eis-react-table", props.tableClass)}
            style={{
              tableLayout: "fixed",          // 핵심 1: auto-layout 차단
              width: tableWidthPx,           // 핵심 2: 총합 px로 고정(가로스크롤 안정)
              minWidth: tableWidthPx,
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            {/* 핵심 3: colgroup로 leaf 폭 강제 */}
            <colgroup>
              {rtLeafCols.map((c: any, i: number) => (
                <col key={String(c.id || c.accessor || i)} style={{width: leafWidths[i]}}/>
              ))}
            </colgroup>

            <thead className={props.theadClass}>
            {(tableInstance as any).headerGroups.map((hg: any, rowIdx: number) => (
              <tr
                {...hg.getHeaderGroupProps()}
                ref={(el) => {
                  if (el) headerRowRefs.current[rowIdx] = el;
                }}
              >
                {hg.headers.map((column: any) => {
                  const hasGhostChild = column.columns && column.columns.some((c: any) => c.Header === "");
                  if (hasGhostChild && rowIdx > 0) return null;
                  const rowSpan = hasGhostChild ? 2 : 1;

                  return (
                    <th
                      rowSpan={rowSpan}
                      {...column.getHeaderProps(column.sort && (column as any).getSortByToggleProps?.())}
                      ref={(el) => {
                        if (el && !(column.columns && column.columns.length)) {
                          const key = String(column.id || column.accessor || "");
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
                        background: "#bbdaf6",
                        backgroundClip: "padding-box",
                        // ❗ width/minWidth/maxWidth는 이제 colgroup가 “진짜”로 잡아주므로
                        // 여기서 강제할 필요가 줄어듭니다(남겨도 되지만 중복됨).
                      }}
                    >
                      {column.render("Header")}
                      {(column as any).getResizerProps && (
                        <div
                          {...(column as any).getResizerProps()}
                          className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                          onClick={(event: any) => event.stopPropagation()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            </thead>

            {!useVirtual && (
              <tbody {...(tableInstance as any).getTableBodyProps()}>
              {rows.map((row: any, idx: number) => {
                (tableInstance as any).prepareRow(row);
                const selected = isSelectedRow(row.original, props.selectedRow);

                const zebraEven = "#f7f7f7";
                const zebraOdd = "#ffffff";
                const highlightBg = "#D9F6EE";
                const selectedBg = "#d9ebf9";
                const zebra = idx % 2 === 0 ? zebraEven : zebraOdd;

                const isTotalRow =
                  row.original?.group1 === 0 &&
                  row.original?.group2 === 0 &&
                  row.original?.group3 === 0 &&
                  row.original?.group4 === 0 &&
                  row.original?.group5 === 1 &&
                  row.original?.group6 === 0;

                const isSubTotalRow =
                  row.original?.group1 === 0 &&
                  row.original?.group2 === 1 &&
                  row.original?.group3 === 0 &&
                  row.original?.group4 === 0 &&
                  row.original?.group5 === 0 &&
                  row.original?.group6 === 0;

                const isGrandTotalRow = row.original?.hDept === "999999999";

                const rowBgColor = (() => {
                  const highlightList = props.highlightCodes ?? [];
                  const code = String(row.original?.cdAcctGrp ?? "");

                  if (isTotalRow) return "#BBDAF6";
                  if (isSubTotalRow) return "#D9F6EE";
                  if (isGrandTotalRow) return "#BBDAF6";

                  if (highlightList.includes(code)) return highlightBg;
                  if (selected) return selectedBg;
                  return zebra;
                })();

                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => props.onRowClick?.(row.original)}
                    onDoubleClick={() => {
                      props.onRowDoubleClick?.(row.original);
                      props.onClose?.();
                    }}
                    className={classNames(
                      {"pis-row-selected": selected},
                      {"font-900": isTotalRow || isSubTotalRow || isGrandTotalRow}
                    )}
                    style={{
                      cursor: props.onRowClick || props.onRowDoubleClick ? "pointer" : "default",
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
                          ...getCellStickyStyle(cell.column),
                        }}
                      >
                        <div
                          className="eis-cell-inner"
                          style={{
                            position: "relative",
                            zIndex: Z.base + 1,
                            height: "100%",
                            width: "100%",
                            backgroundClip: "padding-box",
                            background: rowBgColor,
                            overflow: "hidden",
                            padding: "4px 4px",
                            boxSizing: "border-box",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: cell.column.number
                              ? "flex-end"
                              : cell.column.className?.includes("text-center")
                                ? "center"
                                : "flex-start",
                          }}
                        >
                          {cell.column.editable || cell.column.type === "checkbox" || cell.column.type === "select" ? (
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

            {useVirtual && (
              <tbody {...(tableInstance as any).getTableBodyProps()}>
              {paddingTop > 0 && (
                <tr>
                  <td colSpan={colSpanCount} style={{height: paddingTop, padding: 0, border: "none"}}/>
                </tr>
              )}

              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                (tableInstance as any).prepareRow(row);
                const selected = isSelectedRow(row.original, props.selectedRow);

                const zebraEven = "#f7f7f7";
                const zebraOdd = "#ffffff";
                const highlightBg = "#D9F6EE";
                const selectedBg = "#d9ebf9";
                const zebra = virtualRow.index % 2 === 0 ? zebraEven : zebraOdd;

                const isTotalRow =
                  row.original?.group1 === 0 &&
                  row.original?.group2 === 0 &&
                  row.original?.group3 === 0 &&
                  row.original?.group4 === 0 &&
                  row.original?.group5 === 1 &&
                  row.original?.group6 === 0;

                const isSubTotalRow =
                  row.original?.group1 === 0 &&
                  row.original?.group2 === 1 &&
                  row.original?.group3 === 0 &&
                  row.original?.group4 === 0 &&
                  row.original?.group5 === 0 &&
                  row.original?.group6 === 0;

                const isGrandTotalRow = row.original?.hDept === "999999999";

                const rowBgColor = (() => {
                  const highlightList = props.highlightCodes ?? [];
                  const code = String(row.original?.cdAcctGrp ?? "");

                  if (isTotalRow) return "#BBDAF6";
                  if (isSubTotalRow) return "#D9F6EE";
                  if (isGrandTotalRow) return "#BBDAF6";

                  if (highlightList.includes(code)) return highlightBg;
                  if (selected) return selectedBg;
                  return zebra;
                })();

                return (
                  <tr
                    {...row.getRowProps()}
                    key={row.id}
                    onClick={() => props.onRowClick?.(row.original)}
                    onDoubleClick={() => {
                      props.onRowDoubleClick?.(row.original);
                      props.onClose?.();
                    }}
                    className={classNames(
                      {"pis-row-selected": selected},
                      {"font-900": isTotalRow || isSubTotalRow || isGrandTotalRow}
                    )}
                    style={{
                      cursor: props.onRowClick || props.onRowDoubleClick ? "pointer" : "default",
                      backgroundColor: rowBgColor,
                      height: ROW_H,
                    }}
                  >
                    {row.cells.map((cell: any) => (
                      <td
                        key={cell.column.id || cell.column.accessor}
                        colSpan={cell.column.colSpan ? cell.column.colSpan : 1}
                        {...cell.getCellProps()}
                        className={cell.column.className}
                        style={{
                          position: "relative",
                          padding: 0,
                          ...getCellStickyStyle(cell.column),
                        }}
                      >
                        <div
                          className="eis-cell-inner"
                          style={{
                            position: "relative",
                            zIndex: Z.base + 1,
                            height: "100%",
                            width: "100%",
                            backgroundClip: "padding-box",
                            background: rowBgColor,
                            overflow: "hidden",
                            padding: "4px 4px",
                            boxSizing: "border-box",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: cell.column.number
                              ? "flex-end"
                              : cell.column.className?.includes("text-center")
                                ? "center"
                                : "flex-start",
                          }}
                        >
                          {cell.column.editable || cell.column.type === "checkbox" || cell.column.type === "select" ? (
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

              {paddingBottom > 0 && (
                <tr>
                  <td colSpan={colSpanCount} style={{height: paddingBottom, padding: 0, border: "none"}}/>
                </tr>
              )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
});

export default PisVirtualTable;
