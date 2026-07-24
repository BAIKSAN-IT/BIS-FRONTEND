import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row } from "react-bootstrap";

/* Component */
import SystemPageTitleBar from "../../../../components/common/SystemPageTitleBar";
import SearchProgramRegister from "./SearchProgramRegister";
import PisProgramTable from "../../../../components/table/PisProgramTable";
import ProgramMenuTree from "./ProgramMenuTree";
import { ProgramTableColumns } from "./ProgramTableColumns";

/* Common */
import { Payload } from "../../../../constants/common/common";

/* Utils */
import { isEmpty } from "../../../../utils/CommonUtil";

/* Redux */
import { AppDispatch, RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

import {
  getProgramMenuList,
  ProgramMenuListRes,
  ProgramMenuSaveReq,
  saveProgramMenuInfo,
} from "../../../../redux/system/SystemProgramSlice";

/* Excel */
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* lb */
import Swal from "sweetalert2";

const ProgramRegister = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");

  // idInsert, CompanyId 추출하기 위함.
  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const originalValuesRef = useRef<{ [key: string]: string }>({}); // 최초 한 번만 저장됨(기존값비교)
  const modifiedRowsRef = useRef<Set<string>>(new Set()); // 수정된 행을 Set으로 관리하여 빠른 검색 가능
  const [programMenuList, setProgramMenuList] = useState<ProgramMenuListRes[]>([]); // 유저 정보 리스트
  const [modifiedRows, setModifiedRows] = useState<ProgramMenuListRes[]>([]); // 유저 정보 리스트
  const [selectedRow, setSelectedRow] = useState<ProgramMenuListRes | null>(); // 선택된 행 데이터 저장
  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "",
    menuLevel: "",
    appName: "",
    pageName: "",
  }); // 사용자 목록 검색 조건

  const programMenuTreeRef = useRef<ProgramMenuListRes[]>(programMenuList); //Tree에 넘겨줄 값

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
  /* 프로그램 메뉴 저장시 넘겨주는 param */
  const [programMenuFormState, setProgramMenuFormState] = useState<ProgramMenuSaveReq>({
    cdCompany: user?.companyId || "",
    pgmNo: "",
    appName: "",
    menuId: "",
    menuLevel: "",
    menuType: "",
    pageId: "",
    pageNameKo: "",
    pageNameEn: "",
    pageNameVn: "",
    pageNameL1: "",
    pageNameL2: "",
    pageNameL3: "",
    pageUrl: "",
    pagePrefix: "",
    parentNo: "",
    sortNo: "",
    pageYn: "1",
    menuIcon: "",
    remark: "",
    find: "0",
    newFlag: "0",
    del: "0",
    sav: "0",
    excelDown: "0",
    excelUp: "0",
    useGrp: "0",
    copy: "0",
    prt: "0",
    rowAdd: "0",
    rowDel: "0",
    popup: "0",
    extBtn1: "0",
    extBtn2: "0",
    extBtn3: "0",
    useYn: "1",
    pageRemark: "",
    idInsert: user?.userId ?? "",
  });
  // 전체 프로그램 목록 조회
  const fetchProgramMenuList = (params = searchParams) => {
    dispatch(getProgramMenuList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setProgramMenuList(payload.data);

        programMenuTreeRef.current = payload.data; //Tree값 최신화

        // 초기값 다시 세팅
        const newOriginalValues: { [key: string]: string } = {};
        payload.data.forEach((row: ProgramMenuListRes) => {
          Object.keys(row).forEach((key) => {
            newOriginalValues[`${row.pgmNo}-${key}`] = row[key as keyof ProgramMenuListRes]?.toString() ?? "";
          });
        });

        originalValuesRef.current = newOriginalValues; // 기존값 업데이트
      } else {
        setProgramMenuList([]); // 리스트 초기화
        setErrorMsg(payload.errorMessage); // 에러 메시지 설정
      }
    });
  };

  /* 우측 테이블 저장 및 수정을 위한 로직 */
  const updateData = (rowIndex: number, columnId: string, value: string) => {
    const newValue = value.trim() === "" ? "0" : value.toString();

    const rowKey = `${programMenuList[rowIndex].pgmNo}-${columnId}`; //고유 키 생성 및 원래 값 저장 (행 조작을 위함)

    // 원래 값을 최초 한 번만 저장
    if (!(rowKey in originalValuesRef.current)) {
      originalValuesRef.current[rowKey] = (
        programMenuList[rowIndex][columnId as keyof ProgramMenuListRes] ?? ""
      ).toString();
    }

    const originalValue = originalValuesRef.current[rowKey]; // 원래 값 가져옴

    //리스트 업데이트
    setProgramMenuList((prev) =>
      prev.map((row, index) => {
        // 신규 행이면 빈 값은 그대로 유지
        if (index === rowIndex && row.isNew) {
          return { ...row, [columnId]: value.trim() === "" ? "" : newValue };
        }
        return index === rowIndex ? { ...row, [columnId]: newValue } : row;
      })
    );

    setModifiedRows((prev) => {
      //값이 동일하면은 배열에서 제거해줌.
      if (originalValue === newValue) {
        return prev.filter((row) => row.pgmNo !== programMenuList[rowIndex].pgmNo);
      }

      const updatedRow = { ...programMenuList[rowIndex], [columnId]: newValue };
      const existingIndex = prev.findIndex((row) => row.pgmNo === updatedRow.pgmNo);

      if (existingIndex !== -1) {
        return prev.map((row, index) => (index === existingIndex ? updatedRow : row));
      } else {
        return [...prev, updatedRow];
      }
    });
    // 기존 값과 동일하면 modifiedRowsRef에서도 삭제
    originalValue === newValue
      ? modifiedRowsRef.current.delete(programMenuList[rowIndex].pgmNo)
      : modifiedRowsRef.current.add(programMenuList[rowIndex].pgmNo);
  };

  // 조회 버튼 클릭 시 호출되는 함수
  const onSearchButtonClick = () => {
    fetchProgramMenuList();
  };

  // 신규 버튼 클릭 시 호출되는 함수
  const onNewButtonClick = useCallback(() => {
    if (!selectedRow) {
      showAlert("먼저 행을 선택해주세요.");
      return;
    }

    // 선택한 행의 위치 찾기(programMenuList에 pgmNo와 selectedRow에 pgmNo가 같지 않으면은 -1 을 반환)
    const selectedIndex = programMenuList.findIndex((row) => row.pgmNo === selectedRow.pgmNo);
    if (selectedIndex === -1) return;

    // 신규 행의 pgmNo를 고유한 값으로 설정
    const newRow: ProgramMenuListRes = {
      ...programMenuFormState,
      pgmNo: `NEW_${Date.now()}`, // 고유한 신규 ID 설정
      seqNo: "X", // 신규 행의 No 값은 "X"
      isNew: true, // 신규 행 구분
    };
    setProgramMenuList((prev) => {
      return [...prev.slice(0, selectedIndex + 1), newRow, ...prev.slice(selectedIndex + 1)];
    });

    modifiedRowsRef.current.add(newRow.pgmNo); // Set에 추가하여 빠르게 관리 ( 성능 관련 )
  }, [selectedRow, programMenuList, programMenuFormState]);

  // 저장 버튼 클릭 시 호출되는 함수
  const onSaveButtonClick = () => {
    if (modifiedRows.length === 0) {
      showAlert("저장할 데이터가 없습니다.");
      return;
    }
    const requiredFields: Record<string, string> = {
      pageNameKo: "NAME(KO)",
      pageNameEn: "NAME(EN)",
      pageNameVn: "NAME(VN)",
      parentNo: "PARENT",
      menuType: "TYPE",
      menuLevel: "LEVEL",
    };
    // 필수값이 누락된 행 찾기
    // Object.entries()는 객체를 [key, value] 형태의 배열로 변환합니다.
    // 여기서 (_, fieldName)에서 첫 번째 _는 Object.entries(requiredFields).filter(([field]) => ...)에서 나온 배열의 첫 번째 요소를 무시한다는 의미이다.
    const missingRows = modifiedRows.reduce((acc, row) => {
      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => String(row[field as keyof ProgramMenuListRes]).trim() === "")
        .map(([_, fieldName]) => fieldName);

      // menuType이 "m"인데 menuId가 없는 경우 추가
      if (row.menuType === "M" && !row.menuId) {
        missingFields.push("메뉴 생성시 TYPE은 ");
      }

      if (missingFields.length > 0) {
        acc.push(`${missingFields.join(", ")}`);
      }

      return acc;
    }, [] as string[]);

    // 필수값 누락된 경우 알림
    if (missingRows.length > 0) {
      showAlert(`${missingRows.join("\n")}필수값입니다.`);
      return;
    }

    const sanitizedData = programMenuList
      .filter((row) => modifiedRowsRef.current.has(row.pgmNo)) // 수정된 행만 필터링
      .map((row) => ({
        ...row,
        pgmNo: row.isNew ? "" : row.pgmNo, // 신규 데이터는 ''로 변환 ( 프로시저에서 처리함 )
        idInsert: user?.userId ?? "",
      }));

    confirmAction(t("common.confirm.save"), () => handleSaveConfirm(sanitizedData));
  };

  const handleSaveConfirm = (saveData: any) => {
    dispatch(saveProgramMenuInfo(saveData))
      .then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          fetchProgramMenuList();
          setModifiedRows([]); // 저장 후 초기화
        } else {
          showAlert(payload.errorMessage || t("common.confirm.saveError"));
        }
      })
      .catch(() => {
        showAlert(t("common.confirm.saveErrorManager"));
      });
  };

  /* 출력 버튼 클릭 시 */
  const onPrintButtonClick = () => {
    window.print();
  };

  //신규 버튼 클릭시 생기는 행으로 X버튼 클릭시 배열에서 제거
  const onRemoveNewRow = useCallback((rowIndex: number) => {
    setProgramMenuList((prev) => {
      const removedRow = prev[rowIndex];

      if (removedRow.isNew) {
        modifiedRowsRef.current.delete(removedRow.pgmNo); // Set에서 제거
        return prev.filter((_, index) => index !== rowIndex); // UI에서도 제거
      }

      return prev;
    });
  }, []);

  // 테이블에 넘겨줄 값.
  const tableColumns = ProgramTableColumns(onRemoveNewRow);

  /* 엑셀 다운로드 */
  const onExcelDownloadClick = () => {
    const flattenColumns = (cols: any[]): any[] =>
      cols.flatMap((col) => (col.columns ? flattenColumns(col.columns) : col));

    const flatColumns = flattenColumns(tableColumns);
    const header = flatColumns.map((col) => col.Header);

    const data = programMenuList.map((program) =>
      flatColumns.map((col) => program[col.accessor as keyof ProgramMenuListRes] || "")
    );

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProgramMenuList");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "ProgramMenuList.xlsx");
  };

  //최초 로딩 시 호출
  useEffect(() => {
    fetchProgramMenuList();
  }, []);

  const onRowClick = (row: ProgramMenuListRes) => {
    if (selectedRow?.pgmNo === row.pgmNo) {
      setSelectedRow(null); // 같은 행을 다시 클릭하면 선택 해제
    } else {
      setSelectedRow(row); // 선택한 행만 저장
    }
  };
  return (
    <>
      {/* System - PageTitleBar */}
      <SystemPageTitleBar
        pageTitle={"User Register"}
        breadCrumbItems={[
          { label: "Program", path: "/programregister" },
          { label: "ProgramRegister", path: "/programregister", active: true },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={onNewButtonClick}
        onSaveButtonClick={onSaveButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={onPrintButtonClick}
      />
      <div className="container-fluid p-0">
        {/* 검색 조건 */}
        <SearchProgramRegister
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={onSearchButtonClick}
        />
        <Card>
          <Card.Body>
            <Row className="gx-3 align-items-stretch d-flex flex-wrap">
              {/* Program Menu Tree */}
              <Col xs={12} sm={12} md={2} lg={2} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <ProgramMenuTree
                    programMenuTree={programMenuTreeRef.current}
                    setSelectedRow={setSelectedRow} // 추가
                  />
                </div>
              </Col>
              <Col xs={12} sm={12} md={10} lg={10} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  {/* 우측 리스트 */}
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={tableColumns}
                      data={programMenuList}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      updateData={updateData}
                      onRowClick={onRowClick}
                      selectedRow={selectedRow}
                      isSortable={true} // 정렬 기능 활성화
                      errorMsg={errorMsg}
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

export default ProgramRegister;
