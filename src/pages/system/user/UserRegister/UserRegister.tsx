import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row } from "react-bootstrap";

/* Component */
import SystemPageTitleBar from "@components/common/SystemPageTitleBar";
import UserRegisterForm from "./UserRegisterForm";
import SearchUserRegister from "./SearchUserRegister";
import PisTable from "@components/table/PisTable";
import PasswordChangeModal from "./PasswordChangeModal";

/* Common */
import { Payload } from "@constants/common/common";

/* Utils */
import { isEmpty } from "@utils/CommonUtil";

/* Redux */
import { AppDispatch, RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";

import {
  getUserIdDuplicateCheck,
  getUserList,
  saveUserInfo,
  SaveUserInfoReq,
  updateUserStatus,
  UserListRes,
} from "@redux/system/SystemUserSlice";
/* Excel */
import * as XLSX from "xlsx";

import { saveAs } from "file-saver";
/* lb */
import Swal from "sweetalert2";

const UserRegister = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");

  const [showPwdModal, setShowPwdModal] = useState(false);

  const [userList, setUserList] = useState<UserListRes[]>([]); // 유저 정보 리스트
  const [selectedRow, setSelectedRow] = useState<UserListRes | null>(); // 선택된 행 데이터 저장
  const [searchParams, setSearchParams] = useState({
    userId: "",
    userNm: "",
    pageNo: 1,
    pageCount: 1,
    dtsDate: "",
    guestYn: "",
    useYn: "",
  }); // 사용자 목록 검색 조건

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

  const today = new Date();
  const formattedToday = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const [isPasswordEditable, setIsPasswordEditable] = useState(false); // 비밀번호
  const [isUserIdChecked, setIsUserIdChecked] = useState(false); // 아이디 중복 체크 여부 추가
  // modId , regId 추출
  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  /* 저장시 넘겨주는 param */
  const [formState, setFormState] = useState<SaveUserInfoReq>({
    userId: "",
    deptId: "",
    userNm: "",
    loginPwd: "",
    loginPwd1: "",
    userNmEng: "",
    telNo: "",
    faxNo: "",
    mobileNo: "",
    emailAddr: "",
    useStateCd: "",
    companyId: "1000",
    siteCd: "",
    regId: user?.userId ?? "",
    modId: user?.userId ?? "",
    noEmp: "",
    cdPartner: "",
    emailAddr1: "",
    dtsStart: formattedToday,
    dtsEnd: "",
    userSw: "00",
    guestYn: "N",
    guestNmPartner: "",
    guestNmDept: "",
    guestNmPos: "",
    remark: "",
  });

  // 사용자 목록 조회
  const fetchUserList = (params = searchParams) => {
    dispatch(getUserList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setUserList(
          payload.data.map((user: any) => ({
            rowNum: user.rowNum,
            pageNum: user.pageNum,
            userId: user.userId,
            userNmEng: user.userNmEng,
            deptId: user.deptId,
            userNm: user.userNm,
            nmDept: user.nmDept,
            noEmp: user.noEmp,
            emailAddr: user.emailAddr,
            useStateCd: user.useStateCd,
            emailAddr1: user.emailAddr1,
            telNo: user.telNo,
            mobileNo: user.mobileNo,
            dtsStart: user.dtsStart,
            dtsEnd: user.dtsEnd,
            guestYn: user.guestYn,
            guestNmDept: user.guestNmDept,
            guestNmPos: user.guestNmPos,
            guestNmPartner: user.guestNmPartner,
          }))
        );
      } else {
        setUserList([]); // 리스트 초기화
        setErrorMsg(payload.errorMessage); // 에러 메시지 설정
      }
    });
  };
  const checkUserIdDuplicate = () => {
    if (!formState.userId.trim()) {
      showAlert(t("register.validation.id"));
      return;
    }
    dispatch(getUserIdDuplicateCheck({ userId: formState.userId }))
      .then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200) {
          if (isEmpty(payload.data)) {
            showAlert(t("register.validation.idAvailable"));
            setIsUserIdChecked(true);
          } else {
            showAlert(t("register.validation.idDuplication"));
            setIsUserIdChecked(false);
          }
        } else {
          showAlert(payload.errorMessage || t("register.validation.idDuplicationCheckError"));
        }
      })
      .catch(() => {
        showAlert(t("register.validation.idDuplicationCheckError"));
      });
  };
  // 조회 버튼 클릭 시 호출되는 함수
  const onSearchButtonClick = () => {
    fetchUserList(); // 사용자 목록 조회 함수 호출
  };

  // 신규 버튼 클릭 시 호출되는 함수
  const onNewButtonClick = () => {
    setSelectedRow(null);
    setIsPasswordEditable(true);
    setFormState({
      userId: "",
      deptId: "",
      userNm: "",
      loginPwd: "",
      loginPwd1: "",
      userNmEng: "",
      telNo: "",
      faxNo: "",
      mobileNo: "",
      emailAddr: "",
      useStateCd: "",
      companyId: "1000",
      siteCd: "",
      regId: user?.userId ?? "",
      modId: user?.userId ?? "",
      noEmp: "",
      cdPartner: "",
      emailAddr1: "",
      dtsStart: formattedToday,
      dtsEnd: "",
      userSw: "00",
      guestYn: "N",
      guestNmPartner: "",
      guestNmDept: "",
      guestNmPos: "",
      remark: "",
    });
  };
  // 저장 버튼 클릭 시 호출되는 함수
  const onSaveButtonClick = () => {
    if (!formState.userId) {
      showAlert(t("register.validation.id"));
      return;
    }
    // selectedRow가 null이 아니면 중복 체크를 건너뜀
    if (!selectedRow && !isUserIdChecked) {
      showAlert(t("register.validation.idDuplicationCheck"));
      return;
    }

    // 사용자명 입력 체크
    if (!formState.userNm) {
      showAlert(t("register.validation.name"));
      return;
    }

    // 비밀번호 체크
    if (!selectedRow && !formState.loginPwd) {
      showAlert(t("register.validation.password"));
      return;
    }

    // 비밀번호 확인 체크
    if (!selectedRow && !formState.loginPwd1) {
      showAlert(t("register.validation.passwordConfirm"));
      return;
    }

    // 비밀번호와 비밀번호 확인이 같은지 체크
    if (!selectedRow && formState.loginPwd !== formState.loginPwd1) {
      showAlert(t("register.validation.passwordCheck"));
      return;
    }

    confirmAction(t("common.confirm.save"), handleSaveConfirm);
  };
  const saveData = {
    ...formState,
    dtsEnd: formState.dtsEnd ? formState.dtsEnd : "99991231",
    isUpdateCheck: selectedRow ? "Y" : "N",
  };
  // 저장 확인 모달에서 "확인" 클릭 시 호출되는 함수
  const handleSaveConfirm = () => {
    dispatch(saveUserInfo(saveData))
      .then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          const resetParams = {
            userId: "",
            userNm: "",
            pageNo: 1,
            pageCount: 1,
            dtsDate: "",
            guestYn: "",
            useYn: "",
          };
          setSearchParams(resetParams);

          fetchUserList(resetParams);
          setSelectedRow(null);
          setFormState({
            userId: "",
            deptId: "",
            userNm: "",
            loginPwd: "",
            loginPwd1: "",
            userNmEng: "",
            telNo: "",
            faxNo: "",
            mobileNo: "",
            emailAddr: "",
            useStateCd: "",
            companyId: "1000",
            siteCd: "",
            regId: user?.userId ?? "",
            modId: user?.userId ?? "",
            noEmp: "",
            cdPartner: "",
            emailAddr1: "",
            dtsStart: formattedToday,
            dtsEnd: "",
            userSw: "00",
            guestYn: "N",
            guestNmPartner: "",
            guestNmDept: "",
            guestNmPos: "",
            remark: "",
          });
        } else {
          showAlert(payload.errorMessage || t("common.confirm.saveError"));
        }
      })
      .catch(() => {
        showAlert(t("common.confirm.saveErrorManager"));
      });
  };

  /* 삭제 버튼 클릭 시 */
  const onDeleteButtonClick = () => {
    if (!formState.userId) {
      showAlert(t("common.confirm.deleteUser"));
      return;
    }
    // 삭제 확인 팝업 띄우기
    confirmAction(t("common.confirm.delete"), handleDeleteConfirm);
  };

  /* 삭제 확인 후 실제 API 호출 */
  const handleDeleteConfirm = () => {
    dispatch(updateUserStatus({ userId: formState.userId, modId: formState.modId, dtsEnd: formattedToday }))
      .then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200) {
          const resetParams = {
            userId: "",
            userNm: "",
            pageNo: 1,
            pageCount: 1,
            dtsDate: "",
            guestYn: "",
            useYn: "",
          };
          setSearchParams(resetParams);

          fetchUserList(resetParams);
          setSelectedRow(null);
          // 폼 초기화
          setFormState({
            userId: "",
            deptId: "",
            userNm: "",
            loginPwd: "",
            loginPwd1: "",
            userNmEng: "",
            telNo: "",
            faxNo: "",
            mobileNo: "",
            emailAddr: "",
            useStateCd: "",
            companyId: "1000",
            siteCd: "",
            regId: user?.userId ?? "",
            modId: user?.userId ?? "",
            noEmp: "",
            cdPartner: "",
            emailAddr1: "",
            dtsStart: formattedToday,
            dtsEnd: "",
            userSw: "00",
            guestYn: "N",
            guestNmPartner: "",
            guestNmDept: "",
            guestNmPos: "",
            remark: "",
          });
        } else {
          showAlert(t("common.confirm.deleteUserError") + payload.errorMessage);
        }
      })
      .catch(() => {
        showAlert(t("common.confirm.deleteUserErrorManager"));
      });
  };
  /* 출력 버튼 클릭 시 */
  const onPrintButtonClick = () => {
    window.print();
  };

  const sizePerPageList = [
    { text: "20", value: 20 },
    { text: "30", value: 30 },
    { text: "50", value: 50 },
  ];

  const tableColumns = [
    {
      Header: "NO",
      accessor: "pageNum",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 40,
      width: 40,
      maxWidth: 100,
    },
    {
      Header: "ID",
      accessor: "userId",
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      sort: true,
      minWidth: 80,
      width: 80,
      maxWidth: 180,
    },
    {
      Header: "UserNm",
      accessor: "userNm",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 80,
      width: 80,
      maxWidth: 180,
    },
    {
      Header: "DeptNm",
      accessor: "nmDept",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 100,
      maxWidth: 180,
    },
    {
      Header: "Email(1)",
      accessor: "emailAddr",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 120,
      width: 120,
      maxWidth: 180,
    },
    {
      Header: "Email(2)",
      accessor: "emailAddr1",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 120,
      width: 120,
      maxWidth: 180,
    },
    {
      Header: "TelNo",
      accessor: "telNo",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 100,
      maxWidth: 180,
    },
    {
      Header: "H.P(MOBILE)",
      accessor: "mobileNo",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 100,
      width: 100,
      maxWidth: 180,
    },
    {
      Header: "Start Date",
      accessor: "dtsStart",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 80,
      width: 80,
      maxWidth: 100,
    },
    {
      Header: "End Date",
      accessor: "dtsEnd",
      sort: true,
      Cell: ({ value }: { value: any }) => <span style={{ fontWeight: "normal" }}>{value}</span>,
      minWidth: 80,
      width: 80,
      maxWidth: 100,
    },
  ];
  /* 엑셀 다운로드 */
  const onExcelDownloadClick = () => {
    const header = tableColumns.map((col) => col.Header);
    const data = userList.map((user) => tableColumns.map((col) => user[col.accessor as keyof UserListRes] || ""));

    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UserList");

    // 파일 생성 및 다운로드
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "UserList.xlsx");
  };

  //최초 로딩 시 호출
  useEffect(() => {
    fetchUserList();
    setIsPasswordEditable(true);
  }, []);

  useEffect(() => {
    setIsUserIdChecked(false); // 아이디 변경 시 중복 체크 초기화
  }, [formState.userId]);

  return (
    <>
      {/* System - PageTitleBar */}
      <SystemPageTitleBar
        pageTitle={"User Register"}
        breadCrumbItems={[
          { label: "User", path: "/userregister" },
          { label: "UserRegister", path: "/userregister", active: true },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={onNewButtonClick}
        onSaveButtonClick={onSaveButtonClick}
        onDeleteButtonClick={onDeleteButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={onPrintButtonClick}
      />
      <div className="container-fluid p-0">
        {/* 검색 조건 */}
        <SearchUserRegister
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearchButtonClick={onSearchButtonClick}
        />
        <Card>
          <Card.Body>
            <div
              className="system-list-total-count"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span className="bold-text">Total {userList?.length}</span>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowPwdModal(true)}
                disabled={!selectedRow}
              >
                비밀번호 변경
              </button>
            </div>
            <Row className="gx-3 align-items-stretch flex">
              <Col xs={12} sm={12} md={7} lg={7} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  {/* 좌측 리스트 */}
                  <div className="system-table-container">
                    <PisTable
                      columns={tableColumns}
                      data={userList}
                      theadClass="table-custom-system-user-light text-center font-12"
                      tableClass="table-custom-system-user-background text-center font-12"
                      pageSize={20} // 페이지 크기
                      sizePerPageList={sizePerPageList}
                      isSortable={true} // 정렬 기능 활성화
                      pagination={true} // 페이지네이션 활성화
                      onRowClick={(row) => (setSelectedRow(row), setIsPasswordEditable(false))}
                      selectedRow={selectedRow}
                      errorMsg={errorMsg}
                    />
                  </div>
                </div>
              </Col>
              {/* 사용자 등록 폼 */}
              <Col xs={12} sm={12} md={5} lg={5} className="d-flex flex-column">
                <div className="card flex-grow-1 card-gray-border">
                  <UserRegisterForm
                    selectedRow={selectedRow}
                    formState={formState}
                    setFormState={setFormState}
                    isPasswordEditable={isPasswordEditable}
                    onClickUserIdDuplicate={checkUserIdDuplicate}
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
      <PasswordChangeModal
        show={showPwdModal}
        onClose={() => setShowPwdModal(false)}
        userId={selectedRow?.userId ?? null}
        userNm={selectedRow?.userNm ?? null}
        modId={user?.userId ?? ""}
      />
    </>
  );
});

export default UserRegister;
