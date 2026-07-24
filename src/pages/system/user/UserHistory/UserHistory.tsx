import React, { memo, useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import SystemPageTitleBar from "@components/common/SystemPageTitleBar";
import { AppDispatch } from "@redux/store";
import { Payload } from "@constants/common/common";
import { getUserHistoryList, UserHistoryListReq, UserHistoryListRes } from "@redux/user/UserHistorySlice";
import SearchUserHistory from "./SearchUserHistory";
import HistoryTable, { HistoryTableColumn } from "../common/HistoryTable";

type UserHistoryRow = UserHistoryListRes & {
  pageNum: number;
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

const toCompactDate = (value?: string) => (value ? value.replace(/-/g, "") : "");

const formatDateTime = (value?: string) => {
  if (!value) return "";
  if (value.length >= 19) return value;
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 14) return value;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)} ${digits.slice(8, 10)}:${digits.slice(
    10,
    12
  )}:${digits.slice(12, 14)}`;
};

const UserHistory = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState<UserHistoryRow[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchParams, setSearchParams] = useState<UserHistoryListReq>({
    loginId: "",
    userId: "",
    userNm: "",
    loginIp: "",
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

  const fetchUserHistory = (params = searchParams) => {
    dispatch(
      getUserHistoryList({
        ...params,
        fromDt: toCompactDate(params.fromDt),
        toDt: toCompactDate(params.toDt),
      })
    ).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && Array.isArray(payload.data)) {
        const nextRows = payload.data.map((item: UserHistoryListRes, index: number) => ({
          ...item,
          pageNum: index + 1,
        }));
        setRows(nextRows);
        setPageIndex(1);
        setErrorMsg("");
      } else {
        setRows([]);
        setPageIndex(1);
        setErrorMsg(payload.errorMessage || "No user history found.");
      }
    });
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const columns = useMemo<HistoryTableColumn<UserHistoryRow>[]>(
    () => [
      {
        key: "pageNum",
        header: "NO",
        width: "5%",
        align: "center",
      },
      {
        key: "loginId",
        header: "Login ID",
        width: "11%",
        align: "center",
        render: (row) => renderEllipsis(row.loginId),
      },
      {
        key: "userId",
        header: "User ID",
        width: "10%",
        align: "center",
        render: (row) => renderEllipsis(row.userId),
      },
      {
        key: "userNm",
        header: "User Name",
        width: "10%",
        align: "center",
        render: (row) => renderEllipsis(row.userNm),
      },
      {
        key: "loginIp",
        header: "Login IP",
        width: "10%",
        align: "center",
        render: (row) => renderEllipsis(row.loginIp),
      },
      {
        key: "loginDate",
        header: "Login Date",
        width: "15%",
        align: "center",
        render: (row) => renderEllipsis(formatDateTime(row.loginDate)),
      },
      {
        key: "logoutDate",
        header: "Logout Date",
        width: "15%",
        align: "center",
        render: (row) => renderEllipsis(formatDateTime(row.logoutDate)),
      },
      {
        key: "userGubunCd",
        header: "User Type",
        width: "7%",
        align: "center",
        render: (row) => renderEllipsis(row.userGubunCd),
      },
      {
        key: "logoutTypeCd",
        header: "Logout Type",
        width: "7%",
        align: "center",
        render: (row) => renderEllipsis(row.logoutTypeCd),
      },
      {
        key: "regId",
        header: "Reg ID",
        width: "10%",
        align: "center",
        render: (row) => renderEllipsis(row.regId),
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
          { label: "UserHistory", path: "/userhistory", active: true },
        ]}
        onSearchButtonClick={() => fetchUserHistory()}
        onSaveButtonClick={() => showAlert("This page is read-only.")}
        onNewButtonClick={() => {}}
      />

      <div className="container-fluid p-0 history-page-container">
        <SearchUserHistory
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={() => fetchUserHistory()}
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

export default UserHistory;
