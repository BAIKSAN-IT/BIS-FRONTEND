import React from "react";

export const SalesActivityDetailTableColumnsList = () => {
  return [
    {
      Header: "DOCUNO",
      accessor: "SEQ",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 120,
      width: 150,
      maxWidth: 180,
    },
    {
      Header: "SEQ_NO",
      accessor: "12",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 120,
      width: 150,
      maxWidth: 180,
    },
    {
      Header: "제목",
      accessor: "13",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 120,
      width: 150,
      maxWidth: 180,
    },
  ];
};
