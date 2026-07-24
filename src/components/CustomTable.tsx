import React, { useRef, useEffect, forwardRef, useState } from "react";
import { useTable, useSortBy, useRowSelect, useGlobalFilter, useAsyncDebounce, PluginHook } from "react-table";
import classNames from "classnames";

interface GlobalFilterProps {
  preGlobalFilteredRows: any;
  globalFilter: any;
  setGlobalFilter: any;
  searchBoxClass: any;
}

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
  indeterminate?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

const IndeterminateCheckbox = forwardRef<HTMLInputElement, IndeterminateCheckboxProps>(
  ({ indeterminate, checked, onChange, ...rest }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef: any = ref || defaultRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate || false;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <div className="form-check" style={{ justifyContent: "center", display: "flex" }}>
        <input
          type="checkbox"
          className="form-check-input"
          ref={resolvedRef}
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        <label htmlFor="form-check-input" className="form-check-label"></label>
      </div>
    );
  }
);

interface TableProps {
  isSearchable?: boolean;
  isSortable?: boolean;
  isSelectable?: boolean;
  selectShow?: boolean;
  isMultiple?: boolean;
  columns: {
    Header: string | (() => JSX.Element);
    accessor: string;
    sort?: boolean;
    Cell?: any;
    className?: string;
  }[];
  data: any[];
  searchBoxClass?: string;
  tableClass?: string;
  theadClass?: string;
  tbodyClass?: string;
  tableHeightClass?: string;
  onRowSelectionChange?: (index: number, columnName: string) => void;
  onHeaderCheckboxChange?: (checked: boolean) => void;
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
}

const CustomTable = (props: TableProps) => {
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
    onRowClick,
    onRowDoubleClick,
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
            Header: ({ onHeaderCheckboxChange }) => {
              const { onChange, ...rest } = onHeaderCheckboxChange?.() || {};
              return (
                <div>
                  <IndeterminateCheckbox
                    {...rest}
                    onChange={(e) => {
                      onChange?.(e);
                      if (props.onHeaderCheckboxChange) {
                        props.onHeaderCheckboxChange(e.target.checked);
                      }
                    }}
                  />
                </div>
              );
            },
            Cell: ({ row }) => {
              return row.getToggleRowSelectedProps ? (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} checked={row.original.isChecked} />
                </div>
              ) : null;
            },
          },
          ...columns,
        ]);
      }
    }
  );

  const handleRowClick = (row: any, rowIndex: number, cellIndex: number) => {
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
      if (onRowSelectionChange) {
        const columnName = columns[cellIndex - 1]?.accessor;
        onRowSelectionChange(rowIndex, columnName);
      }
    }
  };

  const getCellIndex = (target: HTMLElement) => {
    while (target && target.nodeName !== "TD") {
      target = target.parentElement!;
    }
    return (target as HTMLTableCellElement)?.cellIndex;
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

      <div className={classNames("table-responsive", tableHeightClass)}>
        <table {...dataTable.getTableProps()} className={classNames("table table-centered react-table", tableClass)}>
          <thead className={theadClass}>
            {(dataTable.headerGroups || []).map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {(headerGroup.headers || []).map((column: any) => (
                  <th
                    {...column?.getHeaderProps(column?.sort && column?.getSortByToggleProps())}
                    className={classNames({
                      sorting_desc: column.isSortedDesc === true,
                      sorting_asc: column.isSortedDesc === false,
                      sortable: column.sort === true,
                    })}
                    id={column.division}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={tbodyClass} {...dataTable.getTableBodyProps()}>
            {(dataTable.rows || []).map((row: any, i: number) => {
              dataTable.prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={(e) => {
                    const cellIndex = getCellIndex(e.target as HTMLElement);
                    handleRowClick(row, i, cellIndex);

                    if (props.onRowClick) {
                      props.onRowClick(row.original);
                    }
                  }}
                  onDoubleClick={() => {
                    if (props.onRowDoubleClick) props.onRowDoubleClick(row.original);
                  }}
                  style={{
                    backgroundColor: row.original.isChecked ? "#b0c4de" : "transparent",
                  }}
                >
                  {(row.cells || []).map((cell: any) => (
                    <td
                      {...cell.getCellProps([
                        {
                          className: cell.column.className,
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

export default CustomTable;
