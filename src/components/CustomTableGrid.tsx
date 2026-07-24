import React, { useRef, useEffect, forwardRef, useState } from "react";
import {
  useTable,
  useSortBy,
  useRowSelect,
  useGlobalFilter,
  useAsyncDebounce,
  PluginHook,
} from "react-table";
import classNames from "classnames";
import { isEmpty } from "@utils/CommonUtil";

interface GlobalFilterProps {
  preGlobalFilteredRows: any;
  globalFilter: any;
  setGlobalFilter: any;
  searchBoxClass: any;
}

// Define a default UI for filtering
const GlobalFilter = ({
                        preGlobalFilteredRows,
                        globalFilter,
                        setGlobalFilter,
                        searchBoxClass,
                      }: GlobalFilterProps) => {
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
  indeterminate?: boolean; // Optional property
  children?: React.ReactNode;
}

const IndeterminateCheckbox = forwardRef<
  HTMLInputElement,
  IndeterminateCheckboxProps
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef<HTMLInputElement>(null);
  const resolvedRef: any = ref || defaultRef;

  useEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate || false;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <div
        className="form-check"
        style={{
          justifyContent: "center",
          display: "flex",
        }}
      >
        <input
          type="checkbox"
          className="form-check-input"
          ref={resolvedRef}
          {...rest}
        />
        <label htmlFor="form-check-input" className="form-check-label"></label>
      </div>
    </>
  );
});

interface TableProps {
  isSearchable?: boolean;
  isSortable?: boolean;
  isSelectable?: boolean;
  selectShow?: boolean;
  isMultiple?: boolean;
  columns: any[];
  data: any[];
  searchBoxClass?: string;
  tableClass?: string;
  theadClass?: string;
  tbodyClass?: string;
  tableHeightClass?: string;
  onRowSelectionChange?: () => void;
}

const CustomTableGrid = (props: TableProps) => {
  const {
    isSearchable = false,
    isSortable = false,
    isSelectable = false,
    selectShow = false,
    isMultiple = false,
    columns,
    data,
    searchBoxClass,
    tableClass,
    theadClass,
    tbodyClass,
    tableHeightClass,
    onRowSelectionChange,
  } = props;

  const plugins: PluginHook<object>[] = [];
  if (isSearchable) plugins.push(useGlobalFilter);
  if (isSortable) plugins.push(useSortBy);
  if (isSelectable) plugins.push(useRowSelect);

  const dataTable = useTable(
    {
      columns,
      data,
    },
    ...plugins,
    (hooks) => {
      if (isSelectable) {
        hooks.visibleColumns.push((columns) => [
          {
            id: "selection",
            division: `${selectShow ? "" : "chk_hide"}`,
            Header: ({ getToggleAllRowsSelectedProps }) =>
              getToggleAllRowsSelectedProps ? (
                <div>
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                </div>
              ) : null,
            Cell: ({ row }) =>
              row.getToggleRowSelectedProps ? (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ) : null,
          },
          ...columns,
        ]);
      }
    }
  );

  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange();
    }
  }, [dataTable.selectedFlatRows, onRowSelectionChange]);

  const handleRowClick = (row: any) => {
    if (isSelectable) {
      if (isMultiple) {
        row.toggleRowSelected();
      } else {
        if (row.isSelected) {
          row.toggleRowSelected(false);
        } else {
          dataTable.rows.forEach((r) => r.toggleRowSelected(false));
          row.toggleRowSelected(true);
        }
      }
    }
  };

  return (
    <>
      {isSearchable && (
        <GlobalFilter
          preGlobalFilteredRows={dataTable.preGlobalFilteredRows}
          globalFilter={dataTable.state.globalFilter}
          setGlobalFilter={dataTable.setGlobalFilter}
          searchBoxClass={searchBoxClass}
        />
      )}

      {/* sticky header 동작에 반드시 필요한 wrapper */}
      <div className={classNames("table-responsive", tableHeightClass)}>
        <table
          {...dataTable.getTableProps()}
          className={classNames("table table-centered react-table", tableClass)}
        >
          {/* 헤더 sticky class 적용 */}
          <thead className={`${theadClass}`}>
          {dataTable.headerGroups.map((headerGroup: any) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) =>
                !isEmpty(column.render("Header")) ? (
                  <th
                    rowSpan={column.rowSpan}
                    {...column.getHeaderProps(
                      column.sort && column.getSortByToggleProps()
                    )}
                    id={column.division}
                    className={
                      typeof column.className === "function"
                        ? ""     // TH 는 함수 className 절대 실행하면 안 됨
                        : column.className
                    }
                  >
                    {column.render("Header")}
                  </th>
                ) : null
              )}
            </tr>
          ))}
          </thead>

          <tbody className={tbodyClass} {...dataTable.getTableBodyProps()}>
          {dataTable.rows.map((row: any) => {
            dataTable.prepareRow(row);
            return (
              <tr {...row.getRowProps()} onClick={() => handleRowClick(row)}>
                {row.cells.map((cell: any) => (
                  <td
                    {...cell.getCellProps([
                      {
                        className:
                          typeof cell.column.className === "function"
                            ? cell.column.className(cell.row)  // ← 실행
                            : cell.column.className,           // 문자열 그대로
                        id: cell.column.division,
                      },
                    ])}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CustomTableGrid;
