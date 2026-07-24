import React, { memo, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import PisRndTable from "../../../../components/table/PisRndTable";
import { FabricLibraryRegisterYarnTableColumns } from "./FabricLibraryRegisterYarnTableColumns";

/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { SaveRndArticleYarnReq } from "../../../../redux/rnd/RndSlice";
import { CommonNeoeCodeRes, getCommonNeoeCodeDtlList } from "../../../../redux/common/commonSlice";

/* Constants */
import { Payload } from "../../../../constants/common/common";

/* utils */
import { isEmpty } from "../../../../utils/CommonUtil";
import { updateTableData } from "../../../../utils/updateTableData";
import { addRow } from "../../../../utils/addRow";

/* lb */
import Swal from "sweetalert2";

interface Props {
  yarnList: SaveRndArticleYarnReq[];
  setYarnList: React.Dispatch<React.SetStateAction<SaveRndArticleYarnReq[]>>;
}

const FabricLibraryRegisterProcessInfo = memo(({ yarnList, setYarnList }: Props) => {
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
  const [plyTypeList, setPlyTypeList] = useState<CommonNeoeCodeRes[]>([]);

  const [searchPlyTypeParams, setSearchPlyTypeParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02114",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const fetchPlyTypeList = () => {
    dispatch(getCommonNeoeCodeDtlList({ ...searchPlyTypeParams })).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setPlyTypeList(payload.data);
      } else {
        setPlyTypeList([]);
      }
    });
  };

  useEffect(() => {
    fetchPlyTypeList();
  }, [searchPlyTypeParams]);

  const defaultRows = {
    yarn: {
      cdCompany: user?.companyId || "1000",
      seqArticle: yarnList[0]?.seqArticle || "",
      cdFabric: "",
      cdYarn: "",
      nmYarn: "",
      seq: yarnList.length + 1,
      yarnMaterial: "",
      cpstRt: 0,
      yarnCount: "",
      countType: "",
      loopLength: 0,
      separate: "",
      yarnColor: "",
      is2Ply: "",
      feeder: "",
      ply: "",
      ynFlag: "",
    },
  };
  const viewYarnList = useMemo(() => (yarnList || []).filter((r) => r.ynFlag !== "D"), [yarnList]);

  // 뷰 인덱스 -> 원본 인덱스 매핑
  const visibleIndexes = useMemo(
    () =>
      (yarnList || []).reduce<number[]>((acc, row, i) => {
        if (row.ynFlag !== "D") acc.push(i);
        return acc;
      }, []),
    [yarnList]
  );
  const rowKeyExtractor = (r: SaveRndArticleYarnReq) => `${r.seqArticle ?? ""}-${r.cdYarn ?? ""}-${r.seq ?? ""}`;

  // 테이블에서 넘겨주는 rowIndex는 "뷰 인덱스"이므로 원본 인덱스로 변환해서 전달
  const updateDataProxy = (viewRowIndex: number, columnId: string, value: string) => {
    const originalIndex = visibleIndexes[viewRowIndex];
    if (originalIndex == null) return;

    updateTableData<SaveRndArticleYarnReq, SaveRndArticleYarnReq>(
      originalIndex,
      columnId,
      value,
      yarnList,
      setYarnList,
      {
        rowKeyExtractor,
      }
    );
  };

  // + 버튼 클릭시 발생하는 이벤트
  const handleAddRow = () => {
    addRow(yarnList, defaultRows.yarn, setYarnList);
  };

  const isPersistedYarn = (row: SaveRndArticleYarnReq) => !!row?.seqArticle && !!row?.cdYarn;

  const handleRemoveRow = () => {
    if (visibleIndexes.length === 0) {
      showAlert("삭제할 행이 없습니다.");
      return;
    }

    // 화면에 보이는 마지막 행의 "원본 인덱스"
    const originalIdx = visibleIndexes[visibleIndexes.length - 1];
    const target = yarnList[originalIdx];
    if (!target) return;

    confirmAction("행을 삭제하겠습니까?", () => {
      if (isPersistedYarn(target)) {
        // 수정
        updateTableData<SaveRndArticleYarnReq, SaveRndArticleYarnReq>(
          originalIdx,
          "ynFlag",
          "D",
          yarnList,
          setYarnList,
          { rowKeyExtractor }
        );
      } else {
        // 신규
        setYarnList((prev) => prev.filter((_, i) => i !== originalIdx));
      }
    });
  };

  useEffect(() => {
    if (!yarnList || yarnList.length === 0) {
      setYarnList([defaultRows.yarn]);
    }
  }, []);
  return (
    <>
      {/* Yarn Information */}
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
            <span style={{ fontWeight: "bold", fontSize: 14 }}>YARN</span>
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
                <div className="fabric-register-table-container">
                  <PisRndTable
                    columns={FabricLibraryRegisterYarnTableColumns(plyTypeList)}
                    data={viewYarnList} // ← 필터된 뷰
                    updateData={updateDataProxy} // ← 인덱스 보정 프록시
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
