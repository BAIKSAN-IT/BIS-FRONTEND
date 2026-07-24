import React, { memo, useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import SystemPageTitleBar from "@components/common/SystemPageTitleBar";
import { AppDispatch, RootState } from "@redux/store";
import { Payload } from "@constants/common/common";
import SearchMenuHistory from "./SearchMenuHistory";
import { getMenuHistoryList, MenuHistoryListReq, MenuHistoryListRes } from "@redux/menu/MenuHistorySlice";
import HistoryTable, { HistoryTableColumn } from "../common/HistoryTable";

type MenuHistoryRow = MenuHistoryListRes & {
  pageNum: number;
  accessDateTime: string;
};

const renderEllipsis = (value?: string) => (
  <span
    title={value || ""}
    style={{
      display: "inline-block",
      width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    }}
  >
    {value || ""}
  </span>
);

const formatDate = (value?: string) => {
  if (!value) return "";
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length !== 6) return value;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
};

const toCompactDate = (value?: string) => (value ? value.replace(/-/g, "") : "");

const MenuHistory = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState<MenuHistoryRow[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchParams, setSearchParams] = useState<MenuHistoryListReq>({
    cdCompany: user?.companyId || "1000",
    noEmp: "",
    userNm: "",
    menuCd: "",
    menuNm: "",
    fromDt: monthStart,
    toDt: todayText,
  });

  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };

  const fetchMenuHistory = (params = searchParams) => {
    dispatch(
      getMenuHistoryList({
        ...params,
        cdCompany: user?.companyId || "1000",
        fromDt: toCompactDate(params.fromDt),
        toDt: toCompactDate(params.toDt),
      })
    ).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && Array.isArray(payload.data)) {
        const nextRows = payload.data.map((item: MenuHistoryListRes, index: number) => ({
          ...item,
          pageNum: index + 1,
          accessDateTime: `${formatDate(item.dtAccess)} ${formatTime(item.accessTm)}`.trim(),
        }));
        setRows(nextRows);
        setPageIndex(1);
        setErrorMsg("");
      } else {
        setRows([]);
        setPageIndex(1);
        setErrorMsg(payload.errorMessage || "No menu history found.");
      }
    });
  };

  useEffect(() => {
    fetchMenuHistory();
  }, []);

  const columns = useMemo<HistoryTableColumn<MenuHistoryRow>[]>(
    () => [
      {
        key: "pageNum",
        header: "NO",
        width: "5%",
        align: "center",
      },
      {
        key: "accessDateTime",
        header: "Access DateTime",
        width: "13%",
        align: "center",
        render: (row) => renderEllipsis(row.accessDateTime),
      },
      {
        key: "noEmp",
        header: "User ID",
        width: "8%",
        align: "center",
        render: (row) => renderEllipsis(row.noEmp),
      },
      {
        key: "userNm",
        header: "User Name",
        width: "8%",
        align: "center",
        render: (row) => renderEllipsis(row.userNm),
      },
      {
        key: "menuCd",
        header: "Menu Code",
        width: "8%",
        align: "center",
        render: (row) => renderEllipsis(row.menuCd),
      },
      {
        key: "menuNm",
        header: "Menu Name",
        width: "11%",
        align: "center",
        render: (row) => renderEllipsis(row.menuNm),
      },
      {
        key: "menuUrl",
        header: "URL",
        width: "15%",
        align: "left",
        render: (row) => renderEllipsis(row.menuUrl),
      },
      {
        key: "accessIp",
        header: "Access IP",
        width: "10%",
        align: "center",
        render: (row) => renderEllipsis(row.accessIp),
      },
      {
        key: "sessionId",
        header: "Session ID",
        width: "22%",
        align: "left",
        render: (row) => renderEllipsis(row.sessionId),
      },
    ],
    []
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(1);
  };

  return (
    <>
      <SystemPageTitleBar
        pageTitle=""
        breadCrumbItems={[
          { label: "User", path: "/userregister" },
          { label: "MenuHistory", path: "/menuhistory", active: true },
        ]}
        onSearchButtonClick={() => fetchMenuHistory()}
        onSaveButtonClick={() => showAlert("This page is read-only.")}
        onNewButtonClick={() => {}}
      />

      <div className="container-fluid p-0 history-page-container">
        <SearchMenuHistory
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={() => fetchMenuHistory()}
        />

        <Card className="history-page-card">
          <Card.Body style={{ minHeight: "calc(79vh - 45px)" }}>
            <Row className="align-items-stretch d-flex flex-wrap">
              <Col xs={12} className="d-flex flex-column">
                <div className="card grid flex-grow-1 card-gray-border">
                  <div className="history-table-container">
                    <HistoryTable
                      columns={columns}
                      data={rows}
                      errorMsg={errorMsg}
                      pageSize={pageSize}
                      pageIndex={pageIndex}
                      onPageChange={setPageIndex}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
});

export default MenuHistory;
