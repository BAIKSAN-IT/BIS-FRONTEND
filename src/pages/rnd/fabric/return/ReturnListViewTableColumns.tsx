import React from "react";
const formatYYYYMMDD = (v?: string | number) => {
  if (!v) return "";
  const s = String(v);
  if (s.length !== 8) return s; // 예외 방어
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};
export const ReturnListViewTableColumns = () => {
  const base: any[] = [
    {
      Header: "NO",
      id: "seqNo",
      accessor: "seqNo",
      minWidth: 10,
      width: 40,
      maxWidth: 300,
      sort: false,
      type: "text",
      className: "text-center",
      disabled: true,
    },
    {
      Header: "DATE",
      accessor: "dtsDate",
      Cell: ({ value }: any) => formatYYYYMMDD(value),
      sort: true,
      minWidth: 40,
      width: 80,
      maxWidth: 1000,
      type: "text",
      className: "text-center",
    },
    {
      Header: "SEQ",
      accessor: "dtsSeq", // 일자내 순번
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 60,
      width: 80,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "STATUS",
      accessor: "nmStatus", // 비고
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 150,
      width: 120,
      maxWidth: 500,
      type: "text",
    },
    {
      Header: "MANAGER",
      accessor: "userNm", // 담당자
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 120,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "REMARK",
      accessor: "remark", // 비고
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 150,
      width: 120,
      maxWidth: 500,
      type: "text",
    },
  ];
  return base;
};
