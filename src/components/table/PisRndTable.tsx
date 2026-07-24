import React, {
  Dispatch,
  forwardRef,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useAsyncDebounce,
  useExpanded,
  useFlexLayout,
  useGlobalFilter,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";

/* lb */
import classNames from "classnames";

// components
import Pagination from "../Pagination";

/* redux (타입 용도) */
import { RndArticleModel } from "../../redux/rnd/RndSlice";
import { RndArticleRecapRes } from "../../redux/rnd/RecapSlice";
import { RndArticleFavoriteRes } from "../../redux/rnd/favoriteSlice";

interface GlobalFilterProps {
  preGlobalFilteredRows: any;
  globalFilter: any;
  setGlobalFilter: any;
  searchBoxClass: any;
}

// Define a default UI for filtering
const GlobalFilter = memo(
  ({ preGlobalFilteredRows, globalFilter, setGlobalFilter, searchBoxClass }: GlobalFilterProps) => {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = useState<any>(globalFilter);
    const onChange = useAsyncDebounce((value) => {
      setGlobalFilter(value || undefined);
    }, 200);

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

interface IndeterminateCheckboxProps {
  indeterminate: any;
  children?: React.ReactNode;
}

const IndeterminateCheckbox = memo(
  forwardRef<HTMLInputElement, IndeterminateCheckboxProps>(({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null!);
    const resolvedRef: any = ref || defaultRef;

    useEffect(() => {
      if (resolvedRef?.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <div className="form-check m-0 d-flex justify-content-center">
        <input type="checkbox" className="form-check-input" ref={resolvedRef} {...rest} />
        <label className="form-check-label" />
      </div>
    );
  })
);

interface TableColumn {
  Header: string;
  accessor?: string;
  columns?: TableColumn[];
  sort?: boolean;
  Cell?: any;
  className?: string;
  editable?: boolean;
  type?: string;
  options?: any;
  isOptionsNull?: boolean;
}

interface TableProps {
  disabled?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  pagination?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
  isDisabled?: boolean;
  isOnlySelected?: boolean;
  sizePerPageList?: {
    text: string;
    value: number;
  }[];
  columns: TableColumn[];
  data: any[];
  pageSize?: any;
  searchBoxClass?: string;
  tableClass?: string;
  theadClass?: string;
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onClose?: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;

  /** 선택(체크박스) 관련 */
  onCheckboxChange?: (row: RndArticleModel, e: React.ChangeEvent<HTMLInputElement>) => void;

  /** 기존 단건 선택(레거시) — 유지 */
  checkedRow?: RndArticleModel | null;

  checkedRows?: RndArticleModel[] | RndArticleRecapRes[] | RndArticleFavoriteRes[];
  selectedRow?: RndArticleModel | RndArticleRecapRes | RndArticleFavoriteRes | null;

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
}

interface EditableCellProps {
  value: string;
  header: any;
  row: { index: number };
  column: {
    id: string;
    type?: "text" | "select" | "checkbox";
    options?: any[];
    number?: boolean;
    numberMode?: "int" | "decimal";
  };
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
}

const EditableCell: React.FC<EditableCellProps> = memo(
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

    const handleUserPopup = useCallback(() => {
      setCurrentOrderRowIndex && setCurrentOrderRowIndex(row.index);
      setCurrentAttendRowIndex && setCurrentAttendRowIndex(row.index);
      if (setIsShowOurUserPopup && header === "성명") setIsShowOurUserPopup(true);
      if (setIsShowCompanyPopup && header === "회사명") setIsShowCompanyPopup(true);
      if (setIsShowStylePopup && header === "Style") setIsShowStylePopup(true);
      if (setIsShowBuyerPopup && header === "Buyer") setIsShowBuyerPopup(true);
      if (setIsShowBrandPopup && header === "BRAND") setIsShowBrandPopup(true);
      if (setIsShowItemPopup && header === "ITEM") setIsShowItemPopup(true);
    }, [
      header,
      setIsShowOurUserPopup,
      setIsShowCompanyPopup,
      setIsShowStylePopup,
      setIsShowBuyerPopup,
      setIsShowBrandPopup,
      setIsShowItemPopup,
      setCurrentOrderRowIndex,
      setCurrentAttendRowIndex,
      row.index,
    ]);

    return column.type === "checkbox" ? (
      <input
        className="system-form-check-input"
        type="checkbox"
        checked={value === "1"}
        onChange={handleCheckboxChange}
        disabled={disabled}
      />
    ) : column.type === "select" && column.options ? (
      <select
        className={"input-pis-table-custom text-center"}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      >
        isOptionsNull && ({<option value={""}></option>})
        {column.options.map((opt: any, index) => (
          <option key={index} value={opt.cdSysdef}>
            {opt.nmSysdef}
          </option>
        ))}
      </select>
    ) : (
      <div style={{ display: "flex", alignItems: "center" }}>
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
            style={{ width: "100%", textAlign: column.number ? "right" : "left" }}
          />
        ) : (
          <span style={{ width: "100%", display: "inline-block", textAlign: column.number ? "right" : "left" }}>
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
            <i className="ti ti-search" />
          </button>
        )}
      </div>
    );
  }
);

const PisRndTable = memo((props: TableProps) => {
  const defaultColumn = useMemo(
    () => ({
      Cell: (cellProps: any) => (
        <EditableCell
          {...cellProps}
          isOnlySelected={props.isOnlySelected}
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
      maxWidth: 120,
    }),
    [
      props.isOnlySelected,
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

  const isSearchable = props.isSearchable || false;
  const isSortable = props.isSortable || false;
  const pagination = props.pagination || false;
  const isSelectable = props.isSelectable || false;
  const isExpandable = props.isExpandable || false;
  const isDisabled = props.isDisabled || false;
  const isOnlySelected = props.isOnlySelected;
  const sizePerPageList = props.sizePerPageList || [];
  const onRowClick = props.onRowClick;
  const onRowDoubleClick = props.onRowDoubleClick;
  const onClose = props.onClose;
  const onScroll = props.onScroll;

  const { onCheckboxChange, checkedRow, checkedRows } = props;

  /** 컨트롤드(외부 배열) 모드 여부 — checkedRows가 정의된 경우에만 */
  const isControlledSelection = Array.isArray(checkedRows);

  const plugins: any[] = [];
  if (isSearchable) plugins.push(useGlobalFilter);
  if (isSortable) plugins.push(useSortBy);
  if (isExpandable) plugins.push(useExpanded);
  if (pagination) plugins.push(usePagination);

  /** ⚠내부 선택(useRowSelect)은 컨트롤드 모드가 아닐 때만 활성화 */
  if (isSelectable && !isControlledSelection) plugins.push(useRowSelect);

  plugins.push(useFlexLayout, useResizeColumns);

  const dataTable = useTable(
    {
      columns: props.columns as any,
      data: props.data,
      defaultColumn,
      initialState: { pageSize: props.pageSize || 10 },
      autoResetResize: false,
      autoResetSelectedRows: false,
    },
    ...plugins,
    (hooks) => {
      if (isSelectable) {
        hooks.visibleColumns.push((columns: any[]) => {
          // 컨트롤드 모드: 외부 배열만 신뢰
          if (isControlledSelection) {
            const isRowChecked = (orig: any) =>
              checkedRows!.some((r) => String(r.seqArticle) === String(orig?.seqArticle));

            return [
              {
                id: "selection",
                Header: "",
                width: 36,
                Cell: ({ row }: any) => (
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

          // 레거시(기존) 모드: react-table 내부 선택 상태 + (단건) checkedRow 동시 지원(기존과 동일)
          return [
            {
              id: "selection",
              Header: "",
              width: 36,
              Cell: ({ row }: any) => (
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

      if (isExpandable) {
        hooks.visibleColumns.push((columns: any[]) => [
          {
            id: "expander",
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
              <span {...getToggleAllRowsExpandedProps()}>{isAllRowsExpanded ? "-" : "+"}</span>
            ),
            Cell: ({ row }: any) =>
              row.canExpand ? (
                <span
                  {...row.getToggleRowExpandedProps({
                    style: { paddingLeft: `${row.depth * 2}rem` },
                  })}
                >
                  {row.isExpanded ? "-" : "+"}
                </span>
              ) : null,
          },
          ...columns,
        ]);
      }
    }
  );

  const rows = pagination ? (dataTable as any).page : (dataTable as any).rows;

  return (
    <>
      {isSearchable && (
        <GlobalFilter
          preGlobalFilteredRows={(dataTable as any).preGlobalFilteredRows}
          globalFilter={(dataTable as any).state.globalFilter}
          setGlobalFilter={(dataTable as any).setGlobalFilter}
          searchBoxClass={props.searchBoxClass}
        />
      )}

      <div className="system-table-container">
        <div className="table-responsive" onScroll={onScroll}>
          <table
            {...dataTable.getTableProps()}
            className={classNames("table table-centered sales-react-table", props.tableClass)}
          >
            <thead className={props.theadClass}>
              {(dataTable as any).headerGroups.map((headerGroup: any) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any) => (
                    <th
                      {...column.getHeaderProps(column.sort && column.getSortByToggleProps())}
                      className={classNames({
                        sorting_desc: column.isSortedDesc === true,
                        sorting_asc: column.isSortedDesc === false,
                        sortable: column.sort === true,
                      })}
                      colSpan={column.columns ? column.columns.length : 1}
                      rowSpan={column.columns ? 1 : 2}
                    >
                      {column.render("Header")}
                      <div
                        {...column.getResizerProps?.()}
                        className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...dataTable.getTableBodyProps()} style={props.isDisabled ? { pointerEvents: "none" } : {}}>
              {props.data.length === 0 ? (
                <tr>
                  <td colSpan={props.columns.length} className="text-center table-no-data-message">
                    <strong>{props.errorMsg}</strong>
                  </td>
                </tr>
              ) : (
                rows.map((row: any) => {
                  (dataTable as any).prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      onClick={() => onRowClick?.(row.original)}
                      onDoubleClick={() => {
                        onRowDoubleClick?.(row.original);
                        props.onClose?.();
                      }}
                      style={{
                        cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
                        backgroundColor:
                          props.selectedRow && (props.selectedRow as any).seqNo === row.original.seqNo
                            ? "#d9ebf9"
                            : row.index % 2 === 0
                            ? "#f7f7f7"
                            : "#ffffff",
                      }}
                    >
                      {row.cells.map((cell: any) => (
                        <td {...cell.getCellProps()}>
                          {cell.column.editable || cell.column.type === "checkbox" ? ( // 체크박스는 항상 EditableCell
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
                            <span>{cell.render("Cell")}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="pagination-container">
            <Pagination tableProps={dataTable} sizePerPageList={sizePerPageList} />
          </div>
        )}
      </div>
    </>
  );
});

export default PisRndTable;
