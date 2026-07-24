import React, { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Spinner } from "react-bootstrap";

/* Common */
import { Payload } from "../../../../constants/common/common";

/* Component */
import SystemPageTitleBar from "../../../../components/common/SystemPageTitleBar";
import PisProgramTable from "../../../../components/table/PisProgramTable";
import GroupMenuDropZone from "./GroupMenuDropZone";
import { isEmpty } from "../../../../utils/CommonUtil";
import { updateTableData } from "../../../../utils/tableUtils";

/* Redux */
import { AppDispatch, RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

/* lb */
import Swal from "sweetalert2";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

/* Utils */
import { downloadExcel } from "../../../../utils/excelUtils";

/* Slice */
import {
  getGroupInfoList,
  getGroupList,
  GroupInfoRes,
  GroupListRes,
  saveGroup,
  saveGroupUser,
} from "../../../../redux/system/SystemGroupSlice";
import { GroupTableColumns } from "../AuthGroupRegister/GroupTableColumns";
import SearchAuthGroupRegister from "../AuthGroupRegister/SearchAuthGroupRegister";
import { getProgramMenuList, getProgramList, ProgramMenuListRes } from "../../../../redux/system/SystemProgramSlice";
import MenuTreeListDragDrop from "./MenuTreeListDragDrop";
import PisTable from "../../../../components/table/PisTable";
import { UserAuthRegisterTableColumns } from "./UserAuthRegisterTableColumns";

const UserAuthRegister = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");

  /* 알림 */
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

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));
  console.log(user);
  const originalValuesRef = useRef<{ [key: string]: string }>({});
  const modifiedRowsRef = useRef<Set<string>>(new Set());

  const [groupList, setGroupList] = useState<GroupListRes[]>([]);
  const [groupModifiedRows, setGroupModifiedRows] = useState<GroupListRes[]>([]);

  const [groupInfoList, setGroupInfoList] = useState<GroupInfoRes[]>([]);
  const [groupInfoModifiedRows, setGroupInfoModifiedRows] = useState<GroupInfoRes[]>([]);

  const [selectedRow, setSelectedRow] = useState<GroupListRes | null>(null); // 그룹
  const [selectedInfoRow, setSelectedInfoRow] = useState<GroupInfoRes | null>(null); // 사용자
  const [selectedUserRow, setSelectedUserRow] = useState<GroupInfoRes | null>(null); // 사용자 선택 저장

  const [programMenuList, setProgramMenuList] = useState<ProgramMenuListRes[]>([]);
  const programMenuTreeRef = useRef<ProgramMenuListRes[]>(programMenuList);

  const [selectedProgramRow, setSelectedProgramRow] = useState<ProgramMenuListRes | null>(null);
  const [droppedMenus, setDroppedMenus] = useState<ProgramMenuListRes[]>([]);

  // 사용자 보유 프로그램 목록
  const [userProgramList, setUserProgramList] = useState<ProgramMenuListRes[]>([]);
  const [userProgramLoading, setUserProgramLoading] = useState(false);

  // 드롭 처리
  const handleDropProgramMenu = (item: ProgramMenuListRes) => {
    setDroppedMenus((prev) => (prev.some((m) => m.pgmNo === item.pgmNo) ? prev : [...prev, item]));
  };

  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "1000",
    groupId: "",
    groupName: "",
  });

  const [searchProgramParams, setSearchProgramParams] = useState({
    cdCompany: user?.companyId || "",
    menuLevel: "99",
    appName: "",
    pageName: "",
  });

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

  const resetState = () => {
    setGroupModifiedRows([]);
    setGroupInfoModifiedRows([]);
    modifiedRowsRef.current.clear();
    originalValuesRef.current = {};
  };

  // 그룹 리스트 조회
  const fetchGroupList = (params = searchParams) => {
    dispatch(getGroupList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setGroupList(payload.data);
        setSelectedRow(payload.data[0] || null);
        const groupId = payload.data[0]?.groupId;
        const cdCompany = payload.data[0]?.cdCompany;
        if (groupId) fetchGroupInfoList(cdCompany, groupId);
      } else {
        setGroupList([]);
        setSelectedRow(null);
        setGroupInfoList([]);
        setSelectedInfoRow(null);
        setErrorMsg(payload.errorMessage || "그룹 리스트가 없습니다.");
      }
    });
  };

  // 그룹 사용자 리스트 조회
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

  // 프로그램 메뉴 리스트 조회
  const fetchProgramMenuList = (params = searchProgramParams) => {
    dispatch(getProgramMenuList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        console.log(payload.data);
        setProgramMenuList(payload.data);
        programMenuTreeRef.current = payload.data;

        const newOriginalValues: { [key: string]: string } = {};
        payload.data.forEach((row: ProgramMenuListRes) => {
          Object.keys(row).forEach((key) => {
            newOriginalValues[`${row.pgmNo}-${key}`] = (row as any)[key]?.toString?.() ?? "";
          });
        });
        originalValuesRef.current = newOriginalValues;
      } else {
        setProgramMenuList([]);
        setErrorMsg(payload.errorMessage);
      }
    });
  };

  // 그룹 행 클릭
  const GroupListClick = (row: GroupListRes) => {
    if (selectedRow?.groupId === row.groupId) return;
    setSelectedRow(row);
    setSelectedInfoRow(null);
    setSelectedUserRow(null);
    setUserProgramList([]);
    const groupId = row.groupId;
    const cdCompany = user?.companyId || "1000";
    if (groupId) fetchGroupInfoList(cdCompany, groupId);

    dispatch(getProgramList({ cdCompany, groupId: groupId, cdUserId: "" }))
      .then((res: any) => {
        const payload = res.payload as Payload;
        if (payload?.status === 200 && Array.isArray(payload.data)) {
          setUserProgramList(payload.data as ProgramMenuListRes[]);
        } else {
          setUserProgramList([]);
          setErrorMsg(payload?.errorMessage || "사용자 프로그램 목록이 없습니다.");
        }
      })
      .finally(() => setUserProgramLoading(false));
  };

  // 사용자 행 클릭
  const onUserRowClick = (row: GroupInfoRes) => {
    setSelectedInfoRow(row);
    setSelectedUserRow(row);

    if (!row?.userId) return;
    const cdCompany = user?.companyId || "1000";

    setUserProgramLoading(true);
    dispatch(getProgramList({ cdCompany, groupId: "", cdUserId: row.userId }))
      .then((res: any) => {
        const payload = res.payload as Payload;
        if (payload?.status === 200 && Array.isArray(payload.data)) {
          setUserProgramList(payload.data as ProgramMenuListRes[]);
        } else {
          setUserProgramList([]);
          setErrorMsg(payload?.errorMessage || "사용자 프로그램 목록이 없습니다.");
        }
      })
      .finally(() => setUserProgramLoading(false));
  };

  /* 테이블 업데이트 */
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

  const onSearchButtonClick = () => fetchGroupList();

  const onSaveButtonClick = () => {
    if (groupInfoModifiedRows.length === 0 && groupModifiedRows.length === 0) {
      showAlert("저장할 데이터가 없습니다.");
      return;
    }
    confirmAction(t("common.confirm.save"), () => handleSaveConfirm(groupModifiedRows, groupInfoModifiedRows));
  };

  const handleSaveConfirm = (groupeSaveData: any, groupUserSaveData: any) => {
    if (groupeSaveData.length > 0) {
      dispatch(saveGroup(groupeSaveData)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          resetState();
          fetchGroupList();
        } else {
          showAlert(payload.errorMessage || t("common.confirm.saveError"));
        }
      });
    }

    if (groupUserSaveData.length > 0) {
      dispatch(saveGroupUser(groupUserSaveData)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setGroupInfoModifiedRows([]);
        } else {
          showAlert(payload.errorMessage || t("common.confirm.saveError"));
        }
      });
    }
  };

  const onPrintButtonClick = () => window.print();

  const onExcelDownloadClick = () => {
    downloadExcel(GroupTableColumns(), groupList, "GroupList.xlsx");
  };

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    fetchProgramMenuList();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
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
        <SearchAuthGroupRegister
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={onSearchButtonClick}
        />

        <Card style={{ width: "1600px" }}>
          <Card.Body>
            <Row className="gx-3 align-items-stretch d-flex flex-wrap">
              {/* 좌측 그룹 리스트 */}
              <Col xs={12} sm={12} md={6} lg={6} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <div className="system-table-container">
                    <PisProgramTable
                      columns={GroupTableColumns()}
                      data={groupList}
                      onRowClick={(row) => GroupListClick(row)}
                      selectedRow={selectedRow}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      isSortable={true}
                      errorMsg={errorMsg}
                      updateData={updateData}
                    />
                  </div>
                </div>
              </Col>

              {/* 사용자 리스트 */}
              {/*<Col xs={12} sm={12} md={4} lg={4} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <div className="system-table-container">
                    <PisTable
                      columns={UserAuthRegisterTableColumns()}
                      data={groupInfoList}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      isSortable={true}
                      errorMsg={errorMsg}
                      // 사용자 행 클릭 처리
                      onRowClick={onUserRowClick}
                    />
                  </div>
                </div>
              </Col>*/}

              {/* 전체 메뉴 트리 */}
              <Col xs={12} sm={12} md={3} lg={3} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <label className={"text-center"} style={{ background: "#bbdaf6" }}>
                    전체 메뉴
                  </label>
                  <MenuTreeListDragDrop
                    programMenuTree={programMenuTreeRef.current}
                    setSelectedRow={(row: any) => {
                      setSelectedProgramRow(row?.pgmNo ? row : null);
                    }}
                  />
                </div>
              </Col>

              {/* 드롭존 */}
              <Col xs={12} sm={12} md={3} lg={3} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <label className={"text-center"} style={{ background: "#bbdaf6" }}>
                    현재 메뉴
                  </label>
                  <GroupMenuDropZone
                    droppedItems={droppedMenus}
                    onDrop={handleDropProgramMenu}
                    selectedUser={selectedUserRow}
                    userPrograms={userProgramList}
                    userProgramsLoading={userProgramLoading}
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </DndProvider>
  );
});

export default UserAuthRegister;
