import React, {memo, useLayoutEffect, useMemo, useRef, useState,} from "react";
import {useResizeColumns, useSortBy, useTable} from "react-table";
import classNames from "classnames";

/* ===============================
 * Column Type
 * =============================== */
export interface CommonTableColumn {
  Header: string | React.ReactNode | (() => JSX.Element);
  accessor?: string;
  id?: string;
  columns?: CommonTableColumn[];

  sort?: boolean;
  Cell?: (props: any) => JSX.Element;

  className?: string | ((row: any) => string);

  /** px 값 (내부적으로 resize는 항상 px) */
  minWidth?: number;
  width?: number;
  maxWidth?: number;

  /** 퍼센트 기반 초기 폭 (선택) */
  percent?: number;

  rowSpan?: number;
}

/* ===============================
 * Props
 * =============================== */
interface CommonTableProps {
  columns: CommonTableColumn[];
  data: any[];

  tableClass?: string;
  theadClass?: string;
  tbodyClass?: string;

  onRowClick?: (row: any) => void;
}

/* ===============================
 * Utils
 * =============================== */
const resolveClassName = (
  className: CommonTableColumn["className"],
  row: any
) => {
  if (!className) return undefined;
  return typeof className === "function" ? className(row) : className;
};

const hasGhostChild = (column: any) =>
  Array.isArray(column?.columns) &&
  column.columns.some(
    (c: any) => c?.Header === "" || c?.Header == null
  );

/* ===============================
 * Container width observer
 * =============================== */
const useContainerWidth = (
  ref: React.RefObject<HTMLElement>
) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWidth(w);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return width;
};

/* ===============================
 * % → px 변환 (재귀)
 * =============================== */
const applyPercentWidth = (
  cols: CommonTableColumn[],
  containerWidth: number
): CommonTableColumn[] => {
  if (!containerWidth) return cols;

  return cols.map((col) => {
    const next = {...col};

    if (typeof col.percent === "number") {
      const px = Math.floor(
        containerWidth * (col.percent / 100)
      );
      next.width = px;
      next.minWidth = col.minWidth ?? Math.floor(px * 0.6);
      next.maxWidth = col.maxWidth ?? Math.floor(px * 1.6);
    }

    if (col.columns) {
      next.columns = applyPercentWidth(
        col.columns,
        containerWidth
      );
    }

    return next;
  });
};

/* ===============================
 * Table
 * =============================== */
const CommonTable: React.FC<CommonTableProps> = memo(
  ({columns, data, tableClass, theadClass, tbodyClass, onRowClick}) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const containerWidth = useContainerWidth(wrapRef);

    /** % → px 반영된 컬럼 */
    const normalizedColumns = useMemo(
      () => applyPercentWidth(columns, containerWidth),
      [columns, containerWidth]
    );

    const tableInstance = useTable(
      {
        columns: normalizedColumns as any,
        data,
        defaultColumn: {
          minWidth: 60,
          width: 120,
          maxWidth: 600,
        },
        autoResetResize: false,
      },
      useSortBy,
      useResizeColumns
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = tableInstance as any;

    return (
      <div
        ref={wrapRef}
        className="table-responsive"
        style={{
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <table
          {...getTableProps()}
          className={classNames(
            "table table-centered table-bordered",
            tableClass
          )}
          style={{
            tableLayout: "fixed",
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          {/* ================= HEADER ================= */}
          <thead
            className={theadClass}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              background: "#cfe8fb",
            }}
          >
          {headerGroups.map((headerGroup: any, rowIdx: number) => (
            <tr key={rowIdx} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any, colIdx: number) => {
                const ghostParent = hasGhostChild(column);

                if (rowIdx > 0) {
                  if (ghostParent) return null;
                  if (column?.Header === "" || column?.Header == null)
                    return null;
                }

                const rowSpan =
                  ghostParent && rowIdx === 0 ? 2 : 1;

                return (
                  <th
                    key={`${rowIdx}-${colIdx}-${column.id ?? column.accessor ?? "col"}`}
                    {...column.getHeaderProps(
                      column.sort
                        ? column.getSortByToggleProps()
                        : undefined
                    )}
                    rowSpan={rowSpan}
                    className={classNames(column.className, {
                      sortable: column.sort,
                    })}
                    style={{
                      background: "#cfe8fb",
                      width: column.totalWidth,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      position: "relative",
                      padding: 0,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "6px 4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {typeof column.render === "function"
                        ? column.render("Header")
                        : column.Header}
                    </div>

                    {column.canResize && (
                      <div
                        {...column.getResizerProps()}
                        className={`resizer ${
                          column.isResizing ? "isResizing" : ""
                        }`}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: "6px",
                          cursor: "col-resize",
                          zIndex: 10,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
          </thead>

          {/* ================= BODY ================= */}
          <tbody {...getTableBodyProps()} className={tbodyClass}>
          {rows.map((row: any, rIdx: number) => {
            prepareRow(row);
            return (
              <tr
                key={rIdx}
                {...row.getRowProps()}
                onClick={() => onRowClick?.(row.original)}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                }}
                className={row.original?.className ?? ""}
              >
                {row.cells.map((cell: any, cIdx: number) => (
                  <td
                    key={cIdx}
                    {...cell.getCellProps()}
                    className={resolveClassName(
                      cell.column.className,
                      row
                    )}
                    style={{
                      width: cell.column.totalWidth,
                      minWidth: cell.column.minWidth,
                      maxWidth: cell.column.maxWidth,
                      boxSizing: "border-box",
                    }}
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
    );
  }
);

export default CommonTable;
