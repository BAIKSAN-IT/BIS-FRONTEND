import React, { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Col, Row } from "react-bootstrap";

/* Common */
import { Payload } from "../../../../constants/common/common";

/* Component */
import SystemPageTitleBar from "../../../../components/common/SystemPageTitleBar";
import PisProgramTable from "../../../../components/table/PisProgramTable";

/* Utils */
import { isEmpty } from "../../../../utils/CommonUtil";
import { addRow, updateTableData } from "../../../../utils/tableUtils";

/* Redux */
import { AppDispatch, RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

/* lb */
import Swal from "sweetalert2";
import { downloadExcel } from "../../../../utils/excelUtils";
import {
  deleteGroupInfo,
  deleteGroupUserInfo,
  getGroupInfoList,
  getGroupList,
  GroupInfoRes,
  GroupListRes,
  saveGroup,
  saveGroupUser,
} from "../../../../redux/system/SystemGroupSlice";
import { GroupTableColumns } from "./GroupTableColumns";
import { GroupUserTableColumns } from "./GroupUserTableColumns";
import SearchAuthGroupRegister from "./SearchAuthGroupRegister";
import { DateUtils } from "../../../../utils/dateUtils";

const AuthGroupRegister = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");
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

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const originalValuesRef = useRef<{ [key: string]: string }>({}); // 최초 한 번만 저장됨(기존값비교)
  const modifiedRowsRef = useRef<Set<string>>(new Set()); // 수정된 행을 Set으로 관리하여 빠른 검색 가능

  const [groupList, setGroupList] = useState<GroupListRes[]>([]); // 코드 대분류 리스트
  const [groupModifiedRows, setGroupModifiedRows] = useState<GroupListRes[]>([]); // 코드 대분류 리스트

  const [groupInfoList, setGroupInfoList] = useState<GroupInfoRes[]>([]); // 코드 중분류 리스트
  const [groupInfoModifiedRows, setGroupInfoModifiedRows] = useState<GroupInfoRes[]>([]); // 유저 정보 리스트

  const [selectedRow, setSelectedRow] = useState<GroupListRes | null>(null); // 코드 대분류 선택된 행 데이터 저장
  const [selectedInfoRow, setSelectedInfoRow] = useState<GroupInfoRes | null>(null); // 코드 중분류 선택된 행 데이터 저장

  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "1000",
    groupId: "",
    groupName: "",
  }); // 코드 목록 ( 대분류 ) 검색 조건

  const defaultRows = {
    saveGroup: {
      cdCompany: user?.companyId || "1000",
      groupId: "",
      groupName: "",
      groupSw: "",
      remark: "",
      idUser: user?.userId ?? "",
      seqNo: 0,
      isNew: false,
    },
    saveGroupUser: {
      cdCompany: user?.companyId || "1000",
      groupId: "",
      userId: "",
      dtsStart: "",
      dtsEnd: "",
      idUser: user?.userId ?? "",
      seqNo: 0,
      isNew: false,
    },
  };

  /* 삭제, 저장 이벤트 발생시 초기화 */
  const resetState = () => {
    setGroupModifiedRows([]);
    setGroupInfoModifiedRows([]);
    modifiedRowsRef.current.clear();
    originalValuesRef.current = {};
  };

  // 그룹 리스트 가져오기
  const fetchGroupList = (params = searchParams) => {
    dispatch(getGroupList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setGroupList(payload.data);

        setSelectedRow(payload.data[0]); //첫로딩시 selectedRow 에 첫번쨰값 세팅
        const groupId = payload.data[0].groupId;
        const cdCompany = payload.data[0].cdCompany;

        if (groupId) {
          fetchGroupInfoList(cdCompany, groupId);
        }
      } else {
        setGroupList([]);
        setSelectedRow(null);
        setGroupInfoList([]);
        setSelectedInfoRow(null);
        setErrorMsg(payload.errorMessage || "그룹 리스트가 없습니다.");
      }
    });
  };

  // 그룹 유저 정보 리스트 가져오기
  const fetchGroupInfoList = (cdCompany: string, groupId: string) => {
    dispatch(getGroupInfoList({ cdCompany, groupId })).then((res: any) => {
      const groupInfoPayload = res.payload as Payload;
      if (groupInfoPayload.status === 200 && !isEmpty(groupInfoPayload.data)) {
        setGroupInfoList(groupInfoPayload.data);
        setSelectedInfoRow(groupInfoPayload.data[0] ?? null);
      } else {
        setGroupInfoList([]);
        setErrorMsg(groupInfoPayload.errorMessage || "그룹 유저 정보가 없습니다.");
      }
    });
  };

  // 그룹 row 클릭시 발생하는 이벤트 그룹 유저 정보 조회
  const GroupListClick = (row: GroupListRes) => {
    if (selectedRow?.groupId === row.groupId) return; // 동일한 행이면 무시

    setSelectedRow(row); // 선택된 행 저장
    setSelectedInfoRow(null); // 그룹 유저 정보 초기화

    const groupId = row.groupId;
    const cdCompany = user?.companyId || "1000";
    if (groupId) {
      fetchGroupInfoList(cdCompany, groupId);
    }
  };

  // + 버튼 클릭시 발생하는 이벤트
  const handleAddRow = (tableName: "group" | "groupInfo") => {
    if (tableName === "group") {
      if (groupList.some((row) => row.isNew)) {
        showAlert("이미 추가된 신규 항목이 존재합니다.");
        return;
      }
      const hasEmptyKeyRow = groupList.some(
        (row) => !row.groupId?.trim() || !row.groupName?.trim() || !row.groupSw?.trim()
      );

      if (hasEmptyKeyRow) {
        showAlert("그룹 ID,그룹 명,구분은 필수 값 입니다.");
        return;
      }
      addRow(groupList, defaultRows.saveGroup, setGroupList, setSelectedRow);
    } else {
      const hasEmptyKeyRow = groupInfoList.some((row: any) => !row.groupId?.trim() || !row.userId?.trim());

      if (hasEmptyKeyRow) {
        showAlert("그룹 ID,사용자 ID는 필수 값 입니다.");
        return;
      }
      const newRow: GroupInfoRes = {
        cdCompany: selectedRow?.cdCompany || "",
        groupId: selectedRow?.groupId || "",
        groupName: "",
        groupSw: "",
        remark: "",
        userId: "",
        dtsStart: DateUtils.today.replaceAll("-", ""),
        dtsEnd: "",
        userNm: "",
        deptId: "",
        nmDept: "",
        seqNo: Date.now(), // 고유값
        isNew: true,
      };

      addRow(groupInfoList, newRow, setGroupInfoList, setSelectedInfoRow);
    }
  };

  // - 버튼 클릭시 발생하는 이벤트
  const handleRemoveRow = (tableName: "group" | "groupInfo") => {
    if (tableName === "group") {
      if (!selectedRow) {
        showAlert("삭제할 그룹을 선택해주세요.");
        return;
      }

      confirmAction(`${selectedRow.groupName} 그룹을 삭제하시겠습니까?`, () => {
        if (selectedRow.isNew) {
          // 신규 항목일 경우: 단순 삭제
          setGroupList((prev) => prev.filter((row) => row.seqNo !== selectedRow.seqNo));
          setSelectedRow(null);
          setGroupInfoList([]);
        } else {
          dispatch(deleteGroupInfo({ cdCompany: selectedRow.cdCompany, groupId: selectedRow.groupId }))
            .then((res) => {
              const payload = res.payload as Payload;
              if (payload.status === 200) {
                setGroupList((prev) => prev.filter((row) => row.groupId !== selectedRow.groupId));
                setSelectedRow(null);
                setGroupInfoList([]);
              } else {
                showAlert(payload.errorMessage || "그룹 삭제 실패");
              }
            })
            .catch(() => showAlert("삭제 실패 (서버 오류)"));
        }
      });
    } else if (tableName === "groupInfo") {
      if (!selectedInfoRow) {
        showAlert("삭제할 사용자를 선택해주세요.");
        return;
      }

      confirmAction(`${selectedInfoRow.userNm} 사용자를 삭제하시겠습니까?`, () => {
        if (selectedInfoRow.isNew) {
          // 신규 항목일 경우: 단순 삭제
          setGroupInfoList((prev) => prev.filter((row) => row.seqNo !== selectedInfoRow.seqNo));
          setSelectedInfoRow(null);
        } else {
          dispatch(
            deleteGroupUserInfo({
              cdCompany: selectedInfoRow.cdCompany,
              groupId: selectedInfoRow.groupId,
              userId: selectedInfoRow.userId,
            })
          )
            .then((res) => {
              const payload = res.payload as Payload;
              if (payload.status === 200) {
                setGroupInfoList((prev) => prev.filter((row) => row.userId !== selectedInfoRow.userId));
                setSelectedInfoRow(null);
              } else {
                showAlert(payload.errorMessage || "사용자 삭제 실패");
              }
            })
            .catch(() => showAlert("삭제 실패 (서버 오류)"));
        }
      });
    }
  };

  /* 대분류 행 업데이트 (좌측테이블) */
  const updateData = (rowIndex: number, columnId: string, value: string) => {
    updateTableData<GroupListRes, GroupListRes>(
      rowIndex,
      columnId,
      value,
      groupList,
      setGroupList,
      setGroupModifiedRows,
      originalValuesRef,
      modifiedRowsRef,
      (row) => row.groupId
    );
  };

  /* 중분류 행 업데이트 (우측테이블) */
  const updateGroupUserData = (rowIndex: number, columnId: string, value: string) => {
    updateTableData<GroupInfoRes, GroupInfoRes>(
      rowIndex,
      columnId,
      value,
      groupInfoList,
      setGroupInfoList,
      setGroupInfoModifiedRows,
      originalValuesRef,
      modifiedRowsRef,
      (row) => row.groupId || `temp-${row.seqNo}`
    );
  };
  // 조회 버튼 클릭 시 호출되는 함수
  const onSearchButtonClick = () => {
    fetchGroupList();
  };

  // 저장 버튼 클릭 시 호출되는 함수
  const onSaveButtonClick = () => {
    if (groupInfoModifiedRows.length === 0 && groupModifiedRows.length === 0) {
      showAlert("저장할 데이터가 없습니다.");
      return;
    }

    confirmAction(t("common.confirm.save"), () => handleSaveConfirm(groupModifiedRows, groupInfoModifiedRows));
  };

  const handleSaveConfirm = (groupeSaveData: any, groupUserSaveData: any) => {
    if (groupeSaveData.length > 0) {
      dispatch(saveGroup(groupeSaveData))
        .then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200 && !isEmpty(payload.data)) {
            resetState();
            fetchGroupList();
          } else {
            showAlert(payload.errorMessage || t("common.confirm.saveError"));
          }
        })
        .catch(() => {
          showAlert(t("common.confirm.saveErrorManager"));
        });
    }

    if (groupUserSaveData.length > 0) {
      dispatch(saveGroupUser(groupUserSaveData))
        .then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200 && !isEmpty(payload.data)) {
            setGroupInfoModifiedRows([]); // 저장 후 초기화
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
    downloadExcel(GroupTableColumns(), groupList, "GroupList.xlsx");
  };

  //최초 로딩 시 호출
  useEffect(() => {
    fetchGroupList();
  }, []);
  return (
    <>
      {/* System - PageTitleBar */}
      <SystemPageTitleBar
        pageTitle={""}
        breadCrumbItems={[
          { label: "User", path: "/userregister" },
          { label: "AuthGroupRegister", path: "/authgroupregister", active: true },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={() => {}}
        onSaveButtonClick={onSaveButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={onPrintButtonClick}
      />
      <div className="container-fluid p-0">
        {/* 검색 조건 */}
        <SearchAuthGroupRegister
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
                  <Button variant="light" onClick={() => handleAddRow("group")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-plus font-12"></i>
                  </Button>
                  <Button variant="light" onClick={() => handleRemoveRow("group")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-minus font-12"></i>
                  </Button>
                </div>
                <div className="card flex-grow-1 card-gray-border">
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={GroupTableColumns()}
                      data={groupList}
                      onRowClick={(row) => GroupListClick(row)}
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
                  <Button variant="light" onClick={() => handleAddRow("groupInfo")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-plus font-12"></i>
                  </Button>
                  <Button variant="light" onClick={() => handleRemoveRow("groupInfo")} style={{ fontSize: "10px" }}>
                    <i className="mdi mdi-minus font-12"></i>
                  </Button>
                </div>
                <div className="card flex-grow-1 card-gray-border">
                  {/* 우측 분류항목별 리스트 */}
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={GroupUserTableColumns()}
                      data={groupInfoList}
                      selectedRow={selectedInfoRow}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      isSortable={true} // 정렬 기능 활성화
                      errorMsg={errorMsg}
                      updateData={updateGroupUserData}
                      onRowClick={(row) => setSelectedInfoRow(row)}
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

export default AuthGroupRegister;
