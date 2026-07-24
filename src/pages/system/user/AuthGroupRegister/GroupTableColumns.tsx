import React from "react";

export const GroupTableColumns = () => {
  return [
    {
      Header: "그룹 ID",
      accessor: "groupId",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 100,
      width: 150,
      maxWidth: 210,
      type: "text",
      editable: true,
    },
    {
      Header: "그룹명",
      accessor: "groupName",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 100,
      width: 150,
      maxWidth: 210,
      type: "text",
      editable: true,
    },
    {
      Header: "구분",
      accessor: "groupSw",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 150,
      maxWidth: 210,
      type: "text",
      editable: true,
    },
    {
      Header: "참고사항",
      accessor: "remark",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 150,
      maxWidth: 210,
      type: "text",
      editable: true,
    },
  ];
};
