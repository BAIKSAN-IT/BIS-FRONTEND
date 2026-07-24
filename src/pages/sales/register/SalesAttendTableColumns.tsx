export const SalesAttendTableColumns = () => [
  {
    Header: "당사",
    columns: [
      {
        Header: "성명",
        accessor: "nmEmp",
        sort: true,
        width: 100, // flex-basis:100px
        minWidth: 100, // 최소 100px
        flexGrow: 0, // 남는 공간은 나눠 갖지 않고…
        flexShrink: 0, // 줄어들지 않음 → overflow 발생
        editable: true,
        isSearchBtn: true,
      },
      {
        Header: "부서",
        accessor: "nmDept",
        sort: true,
        width: 100, // flex-basis:100px
        minWidth: 100, // 최소 100px
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
      },
    ],
  },
  {
    Header: "관계사",
    columns: [
      {
        Header: "성명",
        accessor: "empVendor",
        sort: true,
        width: 80,
        minWidth: 80,
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
      },
      {
        Header: "부서",
        accessor: "deptVendor",
        sort: true,
        width: 80,
        minWidth: 80,
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
      },
      {
        Header: "직책",
        accessor: "positionVendor",
        sort: true,
        width: 60,
        minWidth: 60,
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
      },
      {
        Header: "연락처",
        accessor: "telNoVendor",
        sort: true,
        width: 120,
        minWidth: 120,
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
      },
      {
        Header: "회사명",
        accessor: "nmVendor",
        sort: true,
        width: 150,
        minWidth: 150,
        flexGrow: 0,
        flexShrink: 0,
        type: "text",
        editable: true,
        isSearchBtn: true,
      },
    ],
  },
];
