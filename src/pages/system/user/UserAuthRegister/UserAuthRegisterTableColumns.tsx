import React from "react";

export const UserAuthRegisterTableColumns = () => {
  return [
    {
      Header: "사용자 ID",
      accessor: "userId",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 100,
      width: 150,
      maxWidth: 400,
      type: "text",
      editable: true,
    },
    {
      Header: "사용자 명",
      accessor: "userNm",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 100,
      width: 150,
      maxWidth: 400,
      type: "text",
      editable: true,
    },
    {
      Header: "부서명",
      accessor: "nmDept",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 240,
      maxWidth: 400,
      type: "text",
      editable: true,
    },
  ];
};
