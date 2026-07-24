import React, { useEffect, useState } from "react";
import { useTable, useSortBy, useRowSelect, PluginHook } from "react-table";
import classNames from "classnames";
import { FaAngleRight } from "react-icons/fa";
import { isEmpty } from "../utils/CommonUtil";

interface TableProps {
  isSortable?: boolean;
  isSelectable?: boolean;
  columns: {
    Header: string | (() => JSX.Element);
    accessor: string;
    sort?: boolean;
    Cell?: any;
    className?: string;
  }[];
  data: any[];
  tableClass?: string;
  theadClass?: string;
  tbodyClass?: string;
  tableHeightClass?: string;
  onRowSelectionChange?: () => void;
}

const CustomTableFoldingGrid = (props: TableProps) => {
  const {
    isSortable = false,
    isSelectable = false,
    columns,
    data,
    tableClass,
    theadClass,
    tbodyClass,
    tableHeightClass,
    onRowSelectionChange,
  } = props;

  // sw === 0 부모, sw === 1 자식
  const [visibleRows, setVisibleRows] = useState(
    data.filter((row) => row.sw === "0")
  );
  const [expandedNumClr, setExpandedNumClr] = useState<string | null>(null);

  const plugins: PluginHook<object>[] = [];
  if (isSortable) plugins.push(useSortBy);
  if (isSelectable) plugins.push(useRowSelect);

  const dataTable = useTable(
    {
      columns,
      data: visibleRows,
    },
    ...plugins
  );

  useEffect(() => {
    setVisibleRows(data.filter((row) => row.sw === "0"));
  }, [data]);

  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange();
    }
  }, [dataTable.selectedFlatRows, onRowSelectionChange]);

  const handleRowClick = (row: any) => {
    const clickedNumClr = row.original.numClr;

    if (expandedNumClr === clickedNumClr) {
      setVisibleRows(data.filter((r) => r.sw === "0"));
      setExpandedNumClr(null);
    } else {
      setVisibleRows(
        data.filter((r) => r.sw === "0" || r.numClr === clickedNumClr)
      );
      setExpandedNumClr(clickedNumClr);
    }
  };

  return (
    <>
      <div className={classNames("table-responsive", tableHeightClass)}>
        <table
          {...dataTable.getTableProps()}
          className={classNames("table table-centered react-table", tableClass)}
        >
          <thead className={theadClass}>
            {(dataTable.headerGroups || []).map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {/* 부모 행일 때 아이콘 표시 */}
                {/* <th /> */}
                {(headerGroup.headers || []).map((column: any) =>
                  !isEmpty(column.render("Header")) ? (
                    <th
                      rowSpan={column.rowSpan}
                      {...column.getHeaderProps(
                        column.sort && column.getSortByToggleProps()
                      )}
                      id={column.division}
                    >
                      {column.render("Header")}
                    </th>
                  ) : null
                )}
              </tr>
            ))}
          </thead>

          <tbody className={tbodyClass} {...dataTable.getTableBodyProps()}>
            {(dataTable.rows || []).map((row: any, i: number) => {
              dataTable.prepareRow(row);

              const isChildRow = row?.original?.sw === "1";
              const isExpanded = expandedNumClr === row?.original?.numClr;

              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => handleRowClick(row)}
                  className={classNames(row.original.className, {
                    "child-row": isChildRow,
                    "parent-row": !isChildRow,
                    "expanded-row": isChildRow && isExpanded,
                  })}
                >
                  {/* 부모 행일 때 아이콘 표시 */}
                  {/* <td>
                    {!isChildRow && (
                      <FaAngleRight
                        className="toggle-icon"
                        style={{
                          transform:
                            expandedNumClr === row.original.numClr
                              ? "rotate(90deg)"
                              : "",
                        }}
                      />
                    )}
                  </td> */}
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

export default CustomTableFoldingGrid;
