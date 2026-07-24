import React from "react";
import { CommonNeoeCodeRes } from "../../../../redux/common/commonSlice";

export const FabricLibraryRegisterProcessTableColumns = (processTypeList: CommonNeoeCodeRes[]) => [
  {
    Header: "PROCESS",
    accessor: "cdProcess",
    type: "select",
    options: processTypeList,
    editable: true,
    minWidth: 80,
    width: 150,
    maxWidth: 1000,
    sort: true,
  },
  {
    Header: "LOSS(%)",
    accessor: "rtLoss",
    number: true,
    numberMode: "decimal",
    editable: true,
    minWidth: 60,
    width: 80,
    maxWidth: 1000,
    sort: true,
  },
];
