import React from "react";
import { CommonNeoeCodeRes } from "@redux/common/commonSlice";

export const FabricLibraryRegisterBasicInfoTableColumns = (
  compositionTypeList: CommonNeoeCodeRes[],
  onMoveUp: (viewRowIndex: number) => void,
  onMoveDown: (viewRowIndex: number) => void,
  onRemoveRow: (viewRowIndex: number, hard?: boolean) => void,
  showFaceBack: boolean
) => {
  const columns: any[] = [
    {
      Header: "MATERIAL",
      accessor: "cdComposition",
      type: "select",
      options: compositionTypeList,
      minWidth: 60,
      width: 130,
      maxWidth: 240,
      sort: true,
      editable: true,
    },
    {
      Header: "FACE(%)",
      accessor: "rtComp",
      minWidth: 60,
      width: 60,
      maxWidth: 180,
      sort: true,
      editable: true,
      number: true,
      numberMode: "decimal",
    },
  ];

  // ✅ 조건부 컬럼: showFaceBack이 true일 때만 표시
  if (showFaceBack) {
    columns.push({
      Header: "BACK(%)",
      accessor: "rtCompBack",
      minWidth: 60,
      width: 80,
      maxWidth: 180,
      sort: true,
      editable: true,
      number: true,
      numberMode: "decimal",
    });
  }

  columns.push({
    Header: "SEQ",
    accessor: "sortSeq",
    editable: false,
    minWidth: 60,
    width: 60,
    maxWidth: 180,
    Cell: ({ row }: any) => (
      <div className="d-flex align-items-center justify-content-center gap-1">
        <button
          type="button"
          className="btn btn-light btn-sm p-0 mx-1"
          title="위로"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(row.index);
          }}
        >
          <i className="mdi mdi-chevron-up font-14" />
        </button>

        <button
          type="button"
          className="btn btn-light btn-sm p-0"
          title="아래로"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(row.index);
          }}
        >
          <i className="mdi mdi-chevron-down font-14" />
        </button>
      </div>
    ),
  });

  return [
    {
      Header: "CONTENTS(COMPOSITION)",
      columns,
    },
  ];
};
