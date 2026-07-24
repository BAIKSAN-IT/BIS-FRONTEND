import React from "react";
const formatYYYYMMDD = (v?: string | number) => {
  if (!v) return "";
  const s = String(v);
  if (s.length !== 8) return s; // 예외 방어
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};
export const SendingListViewTableColumns = () => {
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
      Header: "WORKER",
      accessor: "userNm", // 담당자
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 120,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "BUYER",
      accessor: "nmBuyer", // 바이어명
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 150,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "BRAND",
      accessor: "nmBrand", // 브랜드명
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 150,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "YEAR",
      accessor: "dtsYear", // 년도
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 80,
      width: 100,
      maxWidth: 150,
      type: "text",
    },
    {
      Header: "SEASON",
      accessor: "nmSeason", // 시즌 코드
      sort: true,
      Cell: ({ value, row }: { value: any; row: any }) => {
        // row.original.nmSeason 값이 있으면 우선 표시
        const nmSeason = row?.original?.nmSeason || "";
        return <span style={{ fontWeight: "normal" }}>{nmSeason || value}</span>;
      },
      minWidth: 100,
      width: 120,
      maxWidth: 1000,
      type: "text",
    },
    {
      Header: "RECIPIENT",
      accessor: "recipient",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 120,
      width: 120,
      maxWidth: 500,
      type: "text",
    },
    {
      Header: "SEND",
      accessor: "nmSending", // 비고
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 150,
      width: 120,
      maxWidth: 500,
      type: "text",
    },
    {
      Header: "TOPIC",
      accessor: "topic", // 주제
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 150,
      width: 120,
      maxWidth: 500,
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
