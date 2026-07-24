import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface Props {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sizePerPageList?: number[];
}

const HistoryPagination = memo(
  ({ totalCount, pageSize, pageIndex, onPageChange, onPageSizeChange, sizePerPageList = [20, 30, 50] }: Props) => {
    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

    const visiblePages = useMemo(() => {
      if (pageCount <= 5) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
      }

      if (pageIndex <= 3) {
        return [1, 2, 3, 4, 5];
      }

      if (pageIndex >= pageCount - 2) {
        return [pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
      }

      return [pageIndex - 2, pageIndex - 1, pageIndex, pageIndex + 1, pageIndex + 2];
    }, [pageCount, pageIndex]);

    const safePageChange = (page: number) => {
      if (page < 1 || page > pageCount || page === pageIndex) return;
      onPageChange(page);
    };

    return (
      <div className="pagination-container">
        <div className="d-lg-flex align-items-center text-center pb-1">
          <div className="d-inline-block me-3">
            <label className="m-lg-1">Display</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="form-select d-inline-block w-auto"
              style={{ border: "none" }}
            >
              {sizePerPageList.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <span className="d-inline-block align-items-center text-sm-start text-center my-sm-0 my-2">
            <label className="form-labe">Page</label>
            <input
              type="number"
              value={pageIndex}
              min="1"
              max={pageCount}
              onChange={(e) => safePageChange(Number(e.target.value || 1))}
              className="form-control w-25 ms-1 d-inline-block"
              style={{ border: "none" }}
            />
          </span>

          <ul className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0">
            <li
              className={classNames("page-item", "paginate_button", "previous", {
                disabled: pageIndex === 1,
              })}
              onClick={() => safePageChange(pageIndex - 1)}
            >
              <Link to="#" className="page-link">
                <i className="mdi mdi-chevron-left"></i>
              </Link>
            </li>

            {visiblePages.map((page) => (
              <li
                key={page}
                className={classNames("page-item", "d-none", "d-xl-inline-block", {
                  active: pageIndex === page,
                })}
                onClick={() => safePageChange(page)}
              >
                <Link to="#" className="page-link">
                  {page}
                </Link>
              </li>
            ))}

            <li
              className={classNames("page-item", "paginate_button", "next", {
                disabled: pageIndex === pageCount,
              })}
              onClick={() => safePageChange(pageIndex + 1)}
            >
              <Link to="#" className="page-link">
                <i className="mdi mdi-chevron-right"></i>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
);

export default HistoryPagination;
