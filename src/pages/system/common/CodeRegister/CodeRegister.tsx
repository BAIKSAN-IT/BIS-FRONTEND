import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Col, Row } from "react-bootstrap";

/* Common */
import { Payload } from "../../../../constants/common/common";

/* Component */
import SystemPageTitleBar from "../../../../components/common/SystemPageTitleBar";
import SearchCodeRegister from "./SearchCodeRegister";
import PisProgramTable from "../../../../components/table/PisProgramTable";

import { CodeTableColumns } from "./CodeTableColumns";
import { CodeDtlTableColumns } from "./CodeDtlTableColumns";

/* Utils */
import { isEmpty } from "../../../../utils/CommonUtil";
import { addRow, removeRow, updateTableData } from "../../../../utils/tableUtils";

/* Redux */
import { AppDispatch, RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

import {
  CodeDtlListRes,
  CodeListRes,
  deleteCodeDtlInfo,
  deleteCodeInfo,
  getCodeDtlList,
  getCodeList,
  saveCodeDtlInfo,
  saveCodeInfo,
} from "../../../../redux/system/SystemCommonSlice";

/* lb */
import Swal from "sweetalert2";
import { downloadExcel } from "../../../../utils/excelUtils";

const CodeRegister = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const originalValuesRef = useRef<{ [key: string]: string }>({}); // 최초 한 번만 저장됨(기존값비교)
  const modifiedRowsRef = useRef<Set<string>>(new Set()); // 수정된 행을 Set으로 관리하여 빠른 검색 가능
  const [codeListRes, setCodeListRes] = useState<CodeListRes[]>([]); // 코드 대분류 리스트
  const [codeModifiedRows, setCodeModifiedRows] = useState<CodeListRes[]>([]); // 유저 정보 리스트

  const [codeDtlListRes, setCodeDtlListRes] = useState<CodeDtlListRes[]>([]); // 코드 중분류 리스트
  const [dtlModifiedRows, setDtlModifiedRows] = useState<CodeDtlListRes[]>([]); // 유저 정보 리스트

  const [selectedRow, setSelectedRow] = useState<CodeListRes | null>(null); // 코드 대분류 선택된 행 데이터 저장
  const [selectedDtlRow, setSelectedDtlRow] = useState<CodeDtlListRes | null>(null); // 코드 중분류 선택된 행 데이터 저장

  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "",
    nmField: "",
  }); // 코드 목록 ( 대분류 ) 검색 조건

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
    codeList: {
      cdCompany: user?.companyId || "1000",
      cdField: "",
      nmField: "",
      nmFieldEn: "",
      nmFieldJp: "",
      nmFieldCh: "",
      nmFieldL1: "",
      nmFieldL2: "",
      nmFieldL3: "",
      nmFieldL4: "",
      nmFieldL5: "",
      fgSysCode: "",
      remark: "",
      idUser: user?.userId ?? "",
      seqNo: 0,
      isNew: false,
    },
    codeDtlList: {
      cdCompany: user?.companyId || "1000",
      cdField: "",
      cdSysdef: "",
      nmSysdef: "",
      nmSysdefEn: "",
      nmSysdefJp: "",
      nmSysdefCh: "",
      nmSysdefL1: "",
      nmSysdefL2: "",
      nmSysdefL3: "",
      nmSysdefL4: "",
      nmSysdefL5: "",
      cdHigh: "",
      cdUsrdef: "",
      nmUsrdef: "",
      nmUsrdefEn: "",
      nmUsrdefL1: "",
      nmUsrdefL2: "",
      fgSysCode: "",
      cdFlag1: "",
      cdFlag2: "",
      cdFlag3: "",
      noOrder: "",
      useYn: "1",
      remark: "",
      idUser: user?.userId ?? "",
      seqNo: 0,
      isNew: false,
    },
  };

  /* 삭제, 저장 이벤트 발생시 초기화 */
  const resetState = () => {
    setCodeModifiedRows([]);
    setDtlModifiedRows([]);
    modifiedRowsRef.current.clear();
    originalValuesRef.current = {};
  };

  // 대분류 코드 리스트 가져오기
  const fetchCodeList = (params = searchParams) => {
    dispatch(getCodeList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setCodeListRes(payload.data);

        const cdField = payload.data[0]?.cdField;
        const cdCompany = user?.companyId || "1000";

        setSelectedRow(payload.data[0]); //첫로딩시 selectedRow 에 첫번쨰값 세팅

        if (cdField) {
          fetchCodeDtlList(cdCompany, cdField); // 분리한 함수 호출
        }
      } else {
        setCodeListRes([]);
        setSelectedRow(null);
        setCodeDtlListRes([]);
        setSelectedDtlRow(null);
        setErrorMsg(payload.errorMessage || "코드 리스트가 없습니다.");
      }
    });
  };

  // 중분류 코드 리스트 가져오기
  const fetchCodeDtlList = (cdCompany: string, cdField: string) => {
    dispatch(getCodeDtlList({ cdCompany, cdField }))
      .then((res) => {
        const detailPayload = res.payload as Payload;
        if (detailPayload.status === 200 && !isEmpty(detailPayload.data)) {
          setCodeDtlListRes(detailPayload.data); // 디테일 정보 상태 저장
          setSelectedDtlRow(detailPayload.data[0] ?? null); // Code 목록이 조회 될 떄 중분류 첫번쨰 값 selected
        } else {
          setCodeDtlListRes([]);
          setErrorMsg(detailPayload.errorMessage || "상세 정보가 없습니다.");
        }
      })
      .catch(() => {
        setCodeDtlListRes([]);
        setErrorMsg("상세 정보 호출 실패");
      });
  };

  // 대분류 row 클릭시 발생하는 이벤트 중분류 조회
  const CodeListClick = (row: CodeListRes) => {
    if (selectedRow?.cdField === row.cdField) return; // 동일한 행이면 무시

    setSelectedRow(row); // 선택된 행 저장
    setSelectedDtlRow(null); // 중분류 초기화

    const cdField = row.cdField;
    const cdCompany = user?.companyId || "1000";

    if (cdField) {
      fetchCodeDtlList(cdCompany, cdField);
    }
  };

  // + 버튼 클릭시 발생하는 이벤트
  const handleAddRow = (tableName: "code" | "codeDtl") => {
    if (tableName === "code") {
      if (codeListRes.some((row) => row.isNew)) {
        showAlert("이미 추가된 신규 항목이 존재합니다.");
        return;
      }
      const hasEmptyKeyRow = codeListRes.some(
        (row) => !row.cdField?.trim() || !row.nmField?.trim() || !row.nmFieldEn?.trim()
      );

      if (hasEmptyKeyRow) {
        showAlert("CODE,NAME,NAME(EN) 필수 값 입니다.");
        return;
      }
      addRow(codeListRes, defaultRows.codeList, setCodeListRes, setSelectedRow);
    } else {
      const hasEmptyKeyRow = codeDtlListRes.some(
        (row) => !row.cdField?.trim() || !row.cdSysdef?.trim() || !row.nmSysdef?.trim() || !row.nmSysdefEn?.trim()
      );

      if (hasEmptyKeyRow) {
        showAlert("CODE,NAME,NAME(EN) 필수 값 입니다.");
        return;
      }

      addRow(
        codeDtlListRes,
        {
          ...defaultRows.codeDtlList,
          cdField: selectedRow?.cdField ?? "",
        },
        setCodeDtlListRes,
        setSelectedDtlRow
      );
    }
  };

  // - 버튼 클릭시 발생하는 이벤트
  const handleRemoveRow = (tableName: "code" | "codeDtl") => {
    if (tableName === "code") {
      if (!selectedRow) {
        showAlert("삭제할 대분류 행을 선택해주세요");
        return;
      }

      confirmAction(`${selectedRow.cdField} 행을 삭제하시겠습니까? 분류코드도 전체 삭제가됩니다.`, () => {
        if (selectedRow.isNew) {
          // 신규: 그냥 삭제만
          setCodeListRes((prev) => prev.filter((row) => row.seqNo !== selectedRow.seqNo));
          setSelectedRow(null);
        } else {
          // 기존: API 호출 후 삭제
          dispatch(
            deleteCodeInfo({
              cdCompany: selectedRow.cdCompany,
              cdField: selectedRow.cdField,
              nmField: selectedRow.nmField,
              nmFieldEn: selectedRow.nmFieldEn,
            })
          )
            .then((res) => {
              const payload = res.payload as Payload;
              if (payload.status === 200) {
                resetState();
                fetchCodeList();
                setSelectedRow(null);
              } else {
                showAlert(payload.errorMessage || "삭제 실패");
              }
            })
            .catch(() => showAlert("삭제 실패 (서버 오류)"));
        }
      });
    } else {
      if (!selectedDtlRow) {
        showAlert("삭제할 상세 행을 선택해주세요");
        return;
      }

      confirmAction(`${selectedDtlRow.cdSysdef} 행을 삭제하시겠습니까?`, () => {
        if (selectedDtlRow.isNew) {
          // 신규: 그냥 삭제만
          setCodeDtlListRes((prev) => prev.filter((row) => row.seqNo !== selectedDtlRow.seqNo));
          setSelectedDtlRow(null);
        } else {
          // 기존: API 호출 후 삭제
          dispatch(
            deleteCodeDtlInfo({
              cdCompany: selectedDtlRow.cdCompany,
              cdField: selectedDtlRow.cdField,
              cdSysdef: selectedDtlRow.cdSysdef,
              nmSysdef: selectedDtlRow.nmSysdef,
              nmSysdefEn: selectedDtlRow.nmSysdefEn,
            })
          )
            .then((res) => {
              const payload = res.payload as Payload;
              if (payload.status === 200) {
                setCodeDtlListRes((prev) => prev.filter((row) => row.seqNo !== selectedDtlRow.seqNo));
                setSelectedDtlRow(null);
              } else {
                showAlert(payload.errorMessage || "삭제 실패");
              }
            })
            .catch(() => showAlert("삭제 실패 (서버 오류)"));
        }
      });
    }
  };

  /* 대분류 행 업데이트 (좌측테이블) */
  const updateData = (rowIndex: number, columnId: string, value: string) => {
    updateTableData<CodeListRes, CodeListRes>(
      rowIndex,
      columnId,
      value,
      codeListRes,
      setCodeListRes,
      setCodeModifiedRows,
      originalValuesRef,
      modifiedRowsRef,
      (row) => row.cdField
    );
  };

  /* 중분류 행 업데이트 (우측테이블) */
  const updateDtlData = (rowIndex: number, columnId: string, value: string) => {
    updateTableData<CodeDtlListRes, CodeDtlListRes>(
      rowIndex,
      columnId,
      value,
      codeDtlListRes,
      setCodeDtlListRes,
      setDtlModifiedRows,
      originalValuesRef,
      modifiedRowsRef,
      (row) => row.cdSysdef || `temp-${row.seqNo}`
    );
  };
  // 조회 버튼 클릭 시 호출되는 함수
  const onSearchButtonClick = () => {
    fetchCodeList();
  };

  // 저장 버튼 클릭 시 호출되는 함수
  const onSaveButtonClick = () => {
    if (dtlModifiedRows.length === 0 && codeModifiedRows.length === 0) {
      showAlert("저장할 데이터가 없습니다.");
      return;
    }

    confirmAction(t("common.confirm.save"), () => handleSaveConfirm(codeModifiedRows, dtlModifiedRows));
  };

  const handleSaveConfirm = (codeSaveData: any, dtlSaveData: any) => {
    if (codeSaveData.length > 0) {
      dispatch(saveCodeInfo(codeSaveData))
        .then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200 && !isEmpty(payload.data)) {
            resetState();
            fetchCodeList();
          } else {
            showAlert(payload.errorMessage || t("common.confirm.saveError"));
          }
        })
        .catch(() => {
          showAlert(t("common.confirm.saveErrorManager"));
        });
    }

    if (dtlSaveData.length > 0) {
      dispatch(saveCodeDtlInfo(dtlSaveData))
        .then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200 && !isEmpty(payload.data)) {
            setDtlModifiedRows([]); // 저장 후 초기화
          } else {
            showAlert(payload.errorMessage || t("common.confirm.saveError"));
          }
        })
        .catch(() => {
          showAlert(t("common.confirm.saveErrorManager"));
        });
    }
  };

  /* 출력 버튼 클릭 시 */
  const onPrintButtonClick = () => {
    window.print();
  };

  /* 엑셀 다운로드 */
  const onExcelDownloadClick = () => {
    downloadExcel(CodeTableColumns(), codeListRes, "CodeList.xlsx");
  };

  //최초 로딩 시 호출
  useEffect(() => {
    fetchCodeList();
  }, []);
  return (
    <>
      {/* System - PageTitleBar */}
      <SystemPageTitleBar
        pageTitle={"Code Register"}
        breadCrumbItems={[
          { label: "Common", path: "/coderegister" },
          { label: "CodeRegister", path: "/coderegister", active: true },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={() => {}}
        onSaveButtonClick={onSaveButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={onPrintButtonClick}
      />
      <div className="container-fluid p-0">
        {/* 검색 조건 */}
        <SearchCodeRegister
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={onSearchButtonClick}
        />
        <Card style={{ width: "1600px" }}>
          <Card.Body>
            <Row className="gx-3 align-items-stretch d-flex flex-wrap">
              {/* 좌측 대분류 리스트 */}
              <Col xs={12} sm={12} md={6} lg={6} className="d-flex flex-column">
                <div className="d-flex align-items-center gap-1">
                  <Button variant="light" onClick={() => handleAddRow("code")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-plus font-12"></i>
                  </Button>
                  <Button variant="light" onClick={() => handleRemoveRow("code")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-minus font-12"></i>
                  </Button>
                </div>
                <div className="card flex-grow-1 card-gray-border">
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={CodeTableColumns()}
                      data={codeListRes}
                      onRowClick={(row) => CodeListClick(row)}
                      selectedRow={selectedRow}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      isSortable={true} // 정렬 기능 활성화
                      errorMsg={errorMsg}
                      updateData={updateData}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} className="d-flex flex-column">
                <div className="d-flex align-items-center gap-1">
                  <Button variant="light" onClick={() => handleAddRow("codeDtl")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-plus font-12"></i>
                  </Button>
                  <Button variant="light" onClick={() => handleRemoveRow("codeDtl")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-minus font-12"></i>
                  </Button>
                </div>
                <div className="card flex-grow-1 card-gray-border">
                  {/* 우측 분류항목별 리스트 */}
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={CodeDtlTableColumns()}
                      data={codeDtlListRes}
                      selectedRow={selectedDtlRow}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      isSortable={true} // 정렬 기능 활성화
                      errorMsg={errorMsg}
                      updateData={updateDtlData}
                      onRowClick={(row) => setSelectedDtlRow(row)}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
});

export default CodeRegister;
