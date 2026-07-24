import React, { memo, useMemo } from "react";
import HistoryPagination from "./HistoryPagination";

export interface HistoryTableColumn<T> {
  key: keyof T | string;
  header: string;
  width: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

interface Props<T> {
  columns: HistoryTableColumn<T>[];
  data: T[];
  errorMsg?: string;
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const resolveAlignClass = (align?: "left" | "center" | "right") => {
  if (align === "left") return "text-start";
  if (align === "right") return "text-end";
  return "text-center";
};

function HistoryTableInner<T>({
  columns,
  data,
  errorMsg,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
}: Props<T>) {
  const pagedRows = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, pageIndex, pageSize]);

  return (
    <>
      <div className="history-table-scroll">
        <table className="table table-centered history-fixed-table text-center font-10">
          <colgroup>
            {columns.map((column) => (
              <col key={String(column.key)} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead className="text-center font-12">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center table-no-data-message">
                  <strong>{errorMsg}</strong>
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className={resolveAlignClass(column.align)}>
                      <div className="history-fixed-cell">
                        {column.render ? column.render(row, index) : String((row as any)[column.key] ?? "")}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <HistoryPagination
        totalCount={data.length}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
}

const HistoryTable = memo(HistoryTableInner) as typeof HistoryTableInner;

export default HistoryTable;
