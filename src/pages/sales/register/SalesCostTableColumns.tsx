import { CommonPisCodeDetailRes } from "../../../redux/common/commonSlice";

export const SalesCostTableColumns = (costTypeList: CommonPisCodeDetailRes[]) => [
  {
    Header: "발생비용정산",
    columns: [
      {
        Header: "구분",
        accessor: "cdCost",
        width: 100,
        flexGrow: 1,
        flexShrink: 1,
        type: "select",
        options: costTypeList,
        editable: true,
      },
      {
        Header: "금액",
        accessor: "amtCost",
        flexGrow: 1,
        flexShrink: 1,
        type: "text",
        number: true,
        editable: true,
      },
      {
        Header: "비고",
        accessor: "remarks",
        flexGrow: 1,
        flexShrink: 1,
        type: "text",
        editable: true,
      },
    ],
  },
];
