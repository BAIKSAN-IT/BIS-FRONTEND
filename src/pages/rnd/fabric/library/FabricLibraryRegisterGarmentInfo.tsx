import React, { memo, useMemo } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import PisRndTable from "../../../../components/table/PisRndTable";
/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { SaveRndArticleStyleReq } from "../../../../redux/rnd/RndSlice";

/* constants */

/* Utils */
import { updateTableData } from "../../../../utils/updateTableData";
import { addRow } from "../../../../utils/addRow";

/* lb */
import Swal from "sweetalert2";
import { FabricLibraryRegisterGarmentTableColumns } from "./FabricLibraryRegisterGarmentTableColumns";

interface Props {
  styleList: SaveRndArticleStyleReq[];
  setStyleList: React.Dispatch<React.SetStateAction<SaveRndArticleStyleReq[]>>;
}

const FabricLibraryRegisterGarmentInfo = memo(({ styleList, setStyleList }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  /* SweetAlert - 단순 메시지 알림 */
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };

  /* SweetAlert - 확인 취소 모달 */
  const confirmAction = (message: string, callback: () => void) => {
    Swal.fire({
      title: "Confirm",
      text: message,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "tight-swal-popup",
        title: "tight-swal-title",
        closeButton: "tight-swal-close",
        confirmButton: "small-swal-button",
        cancelButton: "small-swal-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  const defaultRows = {
    style: {
      cdCompany: user?.companyId || "1000",
      seqArticle: styleList[0]?.seqArticle || "",
      seq: styleList.length + 1,
      noStyle: "",
      descStyle: "",
      ynFlag: "",
    },
  };
  const viewStyleList = useMemo(() => (styleList || []).filter((r) => r.ynFlag !== "D"), [styleList]);

  // 뷰 인덱스 -> 원본 인덱스 매핑
  const visibleIndexes = useMemo(
    () =>
      (styleList || []).reduce<number[]>((acc, row, i) => {
        if (row.ynFlag !== "D") acc.push(i);
        return acc;
      }, []),
    [styleList]
  );
  const rowKeyExtractor = (r: SaveRndArticleStyleReq) => `${r.seqArticle ?? ""}-${r.seq ?? ""}`;

  // 테이블에서 넘겨주는 rowIndex는 "뷰 인덱스"이므로 원본 인덱스로 변환해서 전달
  const updateDataProxy = (viewRowIndex: number, columnId: string, value: string) => {
    const originalIndex = visibleIndexes[viewRowIndex];
    if (originalIndex == null) return;

    updateTableData<SaveRndArticleStyleReq, SaveRndArticleStyleReq>(
      originalIndex,
      columnId,
      value,
      styleList,
      setStyleList,
      {
        rowKeyExtractor,
      }
    );
  };
  // + 버튼 클릭시 발생하는 이벤트
  const handleAddRow = () => {
    addRow(styleList, defaultRows.style, setStyleList);
  };
  const isPersistedstyle = (row: SaveRndArticleStyleReq) => !!row?.seqArticle && !!row?.seq;
  const handleRemoveRow = () => {
    if (visibleIndexes.length === 0) {
      showAlert("삭제할 행이 없습니다.");
      return;
    }

    // 화면에 보이는 마지막 행의 "원본 인덱스"
    const originalIdx = visibleIndexes[visibleIndexes.length - 1];
    const target = styleList[originalIdx];
    if (!target) return;

    confirmAction("행을 삭제하겠습니까?", () => {
      if (isPersistedstyle(target)) {
        // 수정
        updateTableData<SaveRndArticleStyleReq, SaveRndArticleStyleReq>(
          originalIdx,
          "ynFlag",
          "D",
          styleList,
          setStyleList,
          { rowKeyExtractor }
        );
      } else {
        // 신규
        setStyleList((prev) => prev.filter((_, i) => i !== originalIdx));
      }
    });
  };
  return (
    <>
      {/* Garment Information */}
      <Card
        className="compact-card flex-grow-1"
        style={{
          border: "1px solid #ddd",
          height: 253,
          marginTop: -20,
          transition: "height .3s ease",
          width: "215px",
        }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <span style={{ fontWeight: "bold", fontSize: 14 }}>GARMENT</span>
            <div className="d-flex gap-1">
              <Button variant="light" size="sm" onClick={() => handleAddRow()}>
                <i className="mdi mdi-plus font-12" />
              </Button>
              <Button variant="light" size="sm" onClick={() => handleRemoveRow()}>
                <i className="mdi mdi-minus font-12" />
              </Button>
            </div>
          </div>

          <Row className="gx-3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card flex-grow-1 card-gray-border mt-1">
                <div className="fabric-register-table-container" style={{height: '190px'}}>
                  <PisRndTable
                    columns={FabricLibraryRegisterGarmentTableColumns()}
                    data={viewStyleList}
                    updateData={updateDataProxy}
                    theadClass="table-custom-sales-light text-center font-12"
                    tableClass="table-custom-sales-background text-center font-12"
                    isSortable
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterGarmentInfo;
