import React, { memo, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import PisRndTable from "@components/table/PisRndTable";
import { FabricLibraryRegisterProcessTableColumns } from "./FabricLibraryRegisterProcessTableColumns";
/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { CommonNeoeCodeRes, getRndProcessCodeDtlList } from "@redux/common/commonSlice";
import { SaveRndArticleProcessReq } from "@redux/rnd/RndSlice";

/* constants */
import { Payload } from "@constants/common/common";

/* Utils */
import { updateTableData } from "@utils/updateTableData";
import { addRow } from "@utils/addRow";
import { isEmpty } from "@utils/CommonUtil";

/* lb */
import Swal from "sweetalert2";

interface Props {
  processList: SaveRndArticleProcessReq[];
  setProcessList: React.Dispatch<React.SetStateAction<SaveRndArticleProcessReq[]>>;
}

const FabricLibraryRegisterProcessInfo = memo(({ processList, setProcessList }: Props) => {
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

  const [processTypeList, setProcessTypeList] = useState<CommonNeoeCodeRes[]>([]);

  const [searchProcessTypeParams, setSearchProcessTypeParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const fetchProcessTypeList = () => {
    dispatch(getRndProcessCodeDtlList({ ...searchProcessTypeParams })).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setProcessTypeList(payload.data);
      } else {
        setProcessTypeList([]);
      }
    });
  };

  useEffect(() => {
    fetchProcessTypeList();
  }, [searchProcessTypeParams]);

  const defaultRows = {
    process: {
      cdCompany: user?.companyId || "1000",
      seqArticle: processList[0]?.seqArticle || "",
      cdFabric: "496",
      cdProcess: "",
      rtLoss: 0,
      ynFlag: "",
    },
  };
  const viewProcessList = useMemo(() => (processList || []).filter((r) => r.ynFlag !== "D"), [processList]);

  // 뷰 인덱스 -> 원본 인덱스 매핑
  const visibleIndexes = useMemo(
    () =>
      (processList || []).reduce<number[]>((acc, row, i) => {
        if (row.ynFlag !== "D") acc.push(i);
        return acc;
      }, []),
    [processList]
  );
  const rowKeyExtractor = (r: SaveRndArticleProcessReq) =>
    `${r.seqArticle ?? ""}-${r.cdFabric ?? ""}-${r.cdProcess ?? ""}`;

  // 테이블에서 넘겨주는 rowIndex는 "뷰 인덱스"이므로 원본 인덱스로 변환해서 전달
  const updateDataProxy = (viewRowIndex: number, columnId: string, value: string) => {
    const originalIndex = visibleIndexes[viewRowIndex];
    if (originalIndex == null) return;

    updateTableData<SaveRndArticleProcessReq, SaveRndArticleProcessReq>(
      originalIndex,
      columnId,
      value,
      processList,
      setProcessList,
      {
        rowKeyExtractor,
      }
    );
  };
  // + 버튼 클릭시 발생하는 이벤트
  const handleAddRow = () => {
    addRow(processList, defaultRows.process, setProcessList);
  };
  const isPersistedProcess = (row: SaveRndArticleProcessReq) =>
    !!row?.seqArticle && !!row?.cdFabric && !!row?.cdProcess;
  const handleRemoveRow = () => {
    if (visibleIndexes.length === 0) {
      showAlert("삭제할 행이 없습니다.");
      return;
    }

    // 화면에 보이는 마지막 행의 "원본 인덱스"
    const originalIdx = visibleIndexes[visibleIndexes.length - 1];
    const target = processList[originalIdx];
    if (!target) return;

    confirmAction("행을 삭제하겠습니까?", () => {
      if (isPersistedProcess(target)) {
        // 수정
        updateTableData<SaveRndArticleProcessReq, SaveRndArticleProcessReq>(
          originalIdx,
          "ynFlag",
          "D",
          processList,
          setProcessList,
          { rowKeyExtractor }
        );
      } else {
        // 신규
        setProcessList((prev) => prev.filter((_, i) => i !== originalIdx));
      }
    });
  };
  return (
    <>
      {/* Process Information */}
      <Card
        className="compact-card flex-grow-1"
        style={{
          border: "1px solid #ddd",
          height: 253,
          marginTop: -20,
          transition: "height .3s ease",
        }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <span style={{ fontWeight: "bold", fontSize: 14 }}>PROCESS</span>
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
                <div className="fabric-register-table-container" style={{height: "195px"}}>
                  <PisRndTable
                    columns={FabricLibraryRegisterProcessTableColumns(processTypeList)}
                    data={viewProcessList}
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

export default FabricLibraryRegisterProcessInfo;
