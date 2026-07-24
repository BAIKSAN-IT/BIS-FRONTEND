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

/* redux */
import { ProgramMenuListRes } from "../../redux/system/SystemProgramSlice";
import ButtonComponent from "../common/ButtonComponent";

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
    const defaultRef = useRef();
    const resolvedRef: any = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <div className="form-check">
          <input type="checkbox" className="form-check-input" ref={resolvedRef} {...rest} />
          <label htmlFor="form-check-input" className="form-check-label"></label>
        </div>
      </>
    );
  })
);

interface TableColumn {
  Header: string;
  accessor?: string; // accessor는 하위 컬럼이 있을 때 없어도 됨
  columns?: TableColumn[]; // 중첩 컬럼 지원
  sort?: boolean;
  Cell?: any;
  className?: string;
  editable?: boolean;
  type?: string;
  options?: any;
}
interface TableProps {
  isSearchable?: boolean;
  isSortable?: boolean;
  pagination?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
  isDisabled?: boolean;
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
  selectedRow?: ProgramMenuListRes | null; // 선택된 행 상태 이후 필요시 추가 UserListRes | UserDeptList | 등등
  errorMsg?: string; // ErrorMsg 리스트를 불렀을떄 값이 없으면
  updateData: (rowIndex: number, columnId: string, value: string) => void;
  setIsShowOurUserPopup?: Dispatch<SetStateAction<boolean>>; // 당사-성명 팝업 호출
  setIsShowCompanyPopup?: Dispatch<SetStateAction<boolean>>; // 당사-회사명 팝업 호출
  setIsShowStylePopup?: Dispatch<SetStateAction<boolean>>; // ORDER-Style 팝업 호출
  setIsShowBuyerPopup?: Dispatch<SetStateAction<boolean>>; // ORDER-Buyer 팝업 호출
  setIsShowBrandPopup?: Dispatch<SetStateAction<boolean>>; // ORDER-BRAND 팝업 호출
  setIsShowItemPopup?: Dispatch<SetStateAction<boolean>>; // ORDER-ITEM 팝업 호출
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
  };
  updateData: (rowIndex: number, columnId: string, value: string) => void;
  isSearchBtn?: boolean;
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
    setIsShowOurUserPopup,
    setIsShowCompanyPopup,
    setIsShowStylePopup,
    setIsShowBuyerPopup,
    setIsShowBrandPopup,
    setIsShowItemPopup,
    setCurrentOrderRowIndex,
    setCurrentAttendRowIndex,
  }) => {
    // 로컬 입력값 상태
    const [value, setValue] = useState<string>(initialValue ?? "");
    const lastValue = useRef<string>(initialValue ?? "");
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setValue(initialValue ?? "");
      lastValue.current = initialValue ?? "";
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let newValue = e.target.value;
      setValue(newValue);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        if (newValue !== lastValue.current) {
          lastValue.current = newValue;
          updateData(row.index, column.id, newValue);
        }
      }, 300);
    };

    const handleBlur = () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      if (column.number) {
        const unformattedValue = String(value).replace(/,/g, ""); // 저장 시 콤마 제거
        updateData(row.index, column.id, unformattedValue);
        const formattedValue = unformattedValue !== "" ? Number(unformattedValue).toLocaleString() : "";
        setValue(formattedValue);
        lastValue.current = unformattedValue;
      } else {
        if (value !== lastValue.current) {
          lastValue.current = value;
          updateData(row.index, column.id, value);
        }
      }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked ? "1" : "0";
      setValue(newValue);
      updateData(row.index, column.id, newValue);
    };

    const handleUserPopup = useCallback(() => {
      setCurrentOrderRowIndex && setCurrentOrderRowIndex(row.index);
      setCurrentAttendRowIndex && setCurrentAttendRowIndex(row.index);

      if (setIsShowOurUserPopup && header === "성명") {
        setIsShowOurUserPopup(true);
      }
      if (setIsShowCompanyPopup && header === "회사명") {
        setIsShowCompanyPopup(true);
      }
      if (setIsShowStylePopup && header === "Style") {
        setIsShowStylePopup(true);
      }
      if (setIsShowBuyerPopup && header === "Buyer") {
        setIsShowBuyerPopup(true);
      }
      if (setIsShowBrandPopup && header === "BRAND") {
        setIsShowBrandPopup(true);
      }
      if (setIsShowItemPopup && header === "ITEM") {
        setIsShowItemPopup(true);
      }
    }, [
      header,
      setIsShowOurUserPopup,
      setIsShowCompanyPopup,
      setIsShowStylePopup,
      setIsShowBuyerPopup,
      setIsShowBrandPopup,
      setIsShowItemPopup,
    ]);

    return column.type === "checkbox" ? (
      <input
        className="system-form-check-input"
        type="checkbox"
        checked={value === "1"}
        onChange={handleCheckboxChange}
      />
    ) : column.type === "select" && column.options ? (
      <select
        className={"input-pis-table-custom text-center"}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        {column.options.map((opt: any, index) => (
          <option key={index} value={opt.cdSysdef}>
            {opt.nmSysdef}
          </option>
        ))}
      </select>
    ) : (
      <div className={'form-grid'} style={{ display: "flex", alignItems: "center" }}>
        <input
          className={"input-pis-table-custom"}
          type="text"
          value={column.number && value && !isNaN(Number(value)) ? Number(value).toLocaleString() : value}
          onChange={handleChange}
          onBlur={handleBlur}
          // 만약 column.number가 true면 오른쪽 정렬 적용, 아니면 기본 왼쪽 정렬
          style={{ width: "100%", textAlign: column.number ? "right" : "left" }}
        />
        {isSearchBtn && (
          <ButtonComponent
            type="button"
            className="fg-btn"
            iClassName="ti-search"
            txt={""}
            onClick={handleUserPopup}
          />
        )}
      </div>
    );
  }
);

const PisSalesTable = memo((props: TableProps) => {
  const defaultColumn = useMemo(() => ({ Cell: EditableCell }), []);
  const isSearchable = props["isSearchable"] || false;
  const isSortable = props["isSortable"] || false;
  const pagination = props["pagination"] || false;
  const isSelectable = props["isSelectable"] || false;
  const isExpandable = props["isExpandable"] || false;
  const isDisabled = props["isDisabled"] || false;
  const sizePerPageList = props["sizePerPageList"] || [];
  const onRowClick = props["onRowClick"];
  const onRowDoubleClick = props["onRowDoubleClick"];
  const onClose = props["onClose"];
  const onScroll = props["onScroll"];
  const selectedRow = props["selectedRow"];
  const errorMsg = props["errorMsg"]; // 에러 메시지 prop 추가
  const updateData = props["updateData"];
  const setIsShowOurUserPopup = props["setIsShowOurUserPopup"]; // 에러 메시지 prop 추가
  const setIsShowCompanyPopup = props["setIsShowCompanyPopup"]; // 에러 메시지 prop 추가
  const setIsShowStylePopup = props["setIsShowStylePopup"]; // 에러 메시지 prop 추가
  const setIsShowBuyerPopup = props["setIsShowBuyerPopup"]; // 에러 메시지 prop 추가
  const setIsShowBrandPopup = props["setIsShowBrandPopup"]; // 에러 메시지 prop 추가
  const setIsShowItemPopup = props["setIsShowItemPopup"]; // 에러 메시지 prop 추가
  const setCurrentOrderRowIndex = props["setCurrentOrderRowIndex"]; // 에러 메시지 prop 추가
  const setCurrentAttendRowIndex = props["setCurrentAttendRowIndex"]; // 에러 메시지 prop 추가
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
  const dataTable = useTable(
    {
      columns: props["columns"],
      data: props["data"],
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
    useFlexLayout,
    useResizeColumns,
    (hooks) => {
      isSelectable &&
        hooks.visibleColumns.push((columns: any) => [
          // Let's make a column for selection
          {
            id: "selection",
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllPageRowsSelectedProps }: any) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
                <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }: any) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
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
            className={classNames("table table-centered sales-react-table", props["tableClass"])}
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

            <tbody {...dataTable.getTableBodyProps()} style={props.isDisabled ? { pointerEvents: "none" } : {}}>
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
                          selectedRow && selectedRow.seqNo === row.original.seqNo
                            ? "#d9ebf9" // 선택된 행 배경색1
                            : row.index % 2 === 0 // 짝수 행
                            ? "#f7f7f7" // 짝수 행 기본 배경색 (회색)
                            : "#ffffff", // 홀수 행 기본 배경색 (흰색)
                      }}
                    >
                      {row.cells.map((cell: any) => (
                        <td {...cell.getCellProps()}>
                          {cell.column.editable ? (
                            <EditableCell
                              value={cell.value}
                              header={cell.column.Header}
                              row={row}
                              column={cell.column}
                              updateData={updateData}
                              isSearchBtn={cell.column.isSearchBtn}
                              setIsShowOurUserPopup={setIsShowOurUserPopup}
                              setIsShowCompanyPopup={setIsShowCompanyPopup}
                              setIsShowStylePopup={setIsShowStylePopup}
                              setIsShowBuyerPopup={setIsShowBuyerPopup}
                              setIsShowBrandPopup={setIsShowBrandPopup}
                              setIsShowItemPopup={setIsShowItemPopup}
                              setCurrentOrderRowIndex={setCurrentOrderRowIndex}
                              setCurrentAttendRowIndex={setCurrentAttendRowIndex}
                            />
                          ) : (
                            cell.render("Cell")
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

export default PisSalesTable;
