import React, { useRef, useEffect, forwardRef, useState, useMemo } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useRowSelect,
  useGlobalFilter,
  useAsyncDebounce,
  useExpanded,
  useBlockLayout,
  useResizeColumns,
} from "react-table";
import classNames from "classnames";

// components
import Pagination from "../Pagination";
import { DeptListRes, UserListRes } from "../../redux/system/SystemUserSlice";
import { SalesActivitySumListRes } from "../../redux/sales/SalesActivitySlice";

interface GlobalFilterProps {
  preGlobalFilteredRows: any;
  globalFilter: any;
  setGlobalFilter: any;
  searchBoxClass: any;
}

// Define a default UI for filtering
const GlobalFilter = ({ preGlobalFilteredRows, globalFilter, setGlobalFilter, searchBoxClass }: GlobalFilterProps) => {
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
};

interface IndeterminateCheckboxProps {
  indeterminate: any;
  children?: React.ReactNode;
}

const IndeterminateCheckbox = forwardRef<HTMLInputElement, IndeterminateCheckboxProps>(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef: any = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            ref={resolvedRef}
            {...rest}
            onClick={(e) => e.stopPropagation()}
          />
          <label htmlFor="form-check-input" className="form-check-label"></label>
        </div>
      </>
    );
  }
);

interface TableProps {
  isSearchable?: boolean;
  isSortable?: boolean;
  pagination?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
  sizePerPageList?: {
    text: string;
    value: number;
  }[];
  columns: {
    Header: string;
    accessor: string;
    sort?: boolean;
    Cell?: any;
    className?: string;
  }[];
  data: any[];
  pageSize?: any;
  searchBoxClass?: string;
  tableClass?: string;
  theadClass?: string;
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onClose?: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onCheckboxChange?: (row: SalesActivitySumListRes, e: React.ChangeEvent<HTMLInputElement>) => void;
  checkedRow?: SalesActivitySumListRes | null;
  selectedRow?: any | null; // 선택된 행 상태
  errorMsg?: string; // ErrorMsg 리스트를 불렀을떄 값이 없으면
}

const PisTable = (props: TableProps) => {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 30,
      maxWidth: 120,
    }),
    []
  );
  const isSearchable = props["isSearchable"] || false;
  const isSortable = props["isSortable"] || false;
  const pagination = props["pagination"] || false;
  const isSelectable = props["isSelectable"] || false;
  const isExpandable = props["isExpandable"] || false;
  const sizePerPageList = props["sizePerPageList"] || [];
  const onRowClick = props["onRowClick"];
  const onRowDoubleClick = props["onRowDoubleClick"];
  const onClose = props["onClose"];
  const onScroll = props["onScroll"];
  const onCheckboxChange = props["onCheckboxChange"];
  const checkedRow = props["checkedRow"];
  const selectedRow = props["selectedRow"];
  const errorMsg = props["errorMsg"]; // 에러 메시지 prop 추가
  let otherProps: any = {};

  if (isSearchable) {
    otherProps["useGlobalFilter"] = useGlobalFilter;
  }
  if (isSortable) {
    otherProps["useSortBy"] = useSortBy;
  }
  if (isExpandable) {
    otherProps["useExpanded"] = useExpanded;
  }
  if (pagination) {
    otherProps["usePagination"] = usePagination;
  }
  if (isSelectable) {
    otherProps["useRowSelect"] = useRowSelect;
  }
  const memoColumns = useMemo(() => props.columns, [props.columns]);
  const memoData = useMemo(() => props.data, [props.data]);
  const dataTable = useTable(
    {
      columns: memoColumns,
      data: memoData,
      defaultColumn,
      initialState: { pageSize: props["pageSize"] || 10 },
      autoResetResize: false,
      autoResetSelectedRows: false,
    },
    otherProps.hasOwnProperty("useGlobalFilter") && otherProps["useGlobalFilter"],
    otherProps.hasOwnProperty("useSortBy") && otherProps["useSortBy"],
    otherProps.hasOwnProperty("useExpanded") && otherProps["useExpanded"],
    otherProps.hasOwnProperty("usePagination") && otherProps["usePagination"],
    otherProps.hasOwnProperty("useRowSelect") && otherProps["useRowSelect"],
    useBlockLayout,
    useResizeColumns,
    (hooks) => {
      isSelectable &&
        hooks.visibleColumns.push((columns: any) => [
          // Let's make a column for selection
          {
            id: "selection",
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Cell: ({ row }: any) => (
              <div className="text-center">
                <IndeterminateCheckbox
                  {...row.getToggleRowSelectedProps({
                    onChange: (e: any) => {
                      e.stopPropagation();
                      props.onCheckboxChange?.(row.original, e);
                    },
                  })}
                  checked={props.checkedRow?.noDocuSeq === row.original.noDocuSeq}
                />
              </div>
            ),
          },
          ...columns,
        ]);

      isExpandable &&
        hooks.visibleColumns.push((columns: any) => [
          // Let's make a column for selection
          {
            // Build our expander column
            id: "expander", // Make sure it has an ID
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }: any) => (
              <span {...getToggleAllRowsExpandedProps()}>{isAllRowsExpanded ? "-" : "+"}</span>
            ),
            Cell: ({ row }) =>
              // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
              // to build the toggle for expanding a row
              row.canExpand ? (
                <span
                  {...row.getToggleRowExpandedProps({
                    style: {
                      // We can even use the row.depth property
                      // and paddingLeft to indicate the depth
                      // of the row
                      paddingLeft: `${row.depth * 2}rem`,
                    },
                  })}
                >
                  {row.isExpanded ? "-" : "+"}
                </span>
              ) : null,
          },
          ...columns,
        ]);
    }
  );

  let rows = pagination ? dataTable.page : dataTable.rows;

  return (
    <>
      {isSearchable && (
        <GlobalFilter
          preGlobalFilteredRows={dataTable.preGlobalFilteredRows}
          globalFilter={dataTable.state.globalFilter}
          setGlobalFilter={dataTable.setGlobalFilter}
          searchBoxClass={props["searchBoxClass"]}
        />
      )}
      <div className="system-table-container">
        <div className="table-responsive" onScroll={onScroll}>
          <table
            {...dataTable.getTableProps()}
            className={classNames("table table-centered react-table", props["tableClass"])}
          >
            <thead className={props["theadClass"]}>
              {(dataTable.headerGroups || []).map((headerGroup: any) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {(headerGroup.headers || []).map((column: any) => (
                    <th
                      {...column.getHeaderProps(column.sort && column.getSortByToggleProps())}
                      className={classNames({
                        sorting_desc: column.isSortedDesc === true,
                        sorting_asc: column.isSortedDesc === false,
                        sortable: column.sort === true,
                      })}
                    >
                      {column.render("Header")}
                      <div
                        {...column.getResizerProps()}
                        className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                        onClick={(event) => event.stopPropagation()} // highlight-line
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...dataTable.getTableBodyProps()}>
              {props.data.length === 0 ? (
                <tr>
                  <td colSpan={props.columns.length} className="text-center table-no-data-message">
                    <strong>{errorMsg}</strong>
                  </td>
                </tr>
              ) : (
                (rows || []).map((row: any) => {
                  dataTable.prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row.original); // onRowClick이 있을 때만 실행
                        }
                      }}
                      onDoubleClick={() => {
                        if (onRowDoubleClick) {
                          onRowDoubleClick(row); // 더블 클릭 이벤트
                        }
                        if (onClose) {
                          onClose(); // 모달 닫기 함수 호출
                        }
                      }}
                      style={{
                        cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
                        backgroundColor:
                          selectedRow && selectedRow.pageNum === row.original.pageNum
                            ? "#d9ebf9" // 선택된 행 배경색
                            : row.index % 2 === 0 // 짝수 행
                            ? "#f7f7f7" // 짝수 행 기본 배경색 (회색)
                            : "#ffffff", // 홀수 행 기본 배경색 (흰색)
                      }}
                    >
                      {(row.cells || []).map((cell: any) => (
                        <td
                          {...cell.getCellProps()}
                          className={classNames(cell.column.className || "text-left")}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign:
                              cell.column.className === "text-center"
                                ? "center"
                                : cell.column.className === "text-right"
                                ? "right"
                                : "left",
                          }}
                        >
                          {cell.render("Cell")}
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
};

export default PisTable;
