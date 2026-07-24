import React from "react";

export const FabricLibraryRegisterGarmentTableColumns = () => [
  {
    Header: "GARMENT STYLE#",
    accessor: "garmentSample",
    editable: true,
    minWidth: 80,
    width: 100,
    maxWidth: 180,
    sort: true,
  },
  {
    Header: "GARMENT DESC",
    accessor: "styleDesc",
    editable: true,
    minWidth: 80,
    width: 100,
    maxWidth: 180,
    sort: true,
  },
];
