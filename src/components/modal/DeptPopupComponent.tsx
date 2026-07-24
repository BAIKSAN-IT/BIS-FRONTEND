import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { DeptListRes, getDeptList } from "../../redux/system/SystemUserSlice";
import { AppDispatch, RootState } from "../../redux/store";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import PisTable from "../table/PisTable";
import IconComponent from "../common/IconComponent";

/* constant */
import { Payload } from "../../constants/common/common";

/* utils */
import { isEmpty } from "../../utils/CommonUtil";

interface Props {
  isShowDeptPopup?: boolean;
  setIsShowDeptPopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  onDeptSelect?: (dept: DeptListRes) => void; // 추가된 prop
}

const DeptPopupComponent = memo(({ isShowDeptPopup, setIsShowDeptPopup, onClose, onDeptSelect }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useTranslation();

  const [deptList, setDeptList] = useState<DeptListRes[]>([]); // 부서 정보 리스트
  const [searchDeptParams, setSearchDeptParams] = useState({
    nmDept: "",
    cdDept: "",
  }); // 사용자 목록 검색 조건
  const { systemProgram } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
  }));
  /* 부서 모달 데이터 요청 */
  const fetchDeptList = () => {
    dispatch(getDeptList({ ...searchDeptParams })).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setDeptList(payload?.data || []);
      } else {
        setDeptList([]);
        setErrorMsg(payload.errorMessage || "데이터를 찾을 수 없습니다.");
      }
    });
  };

  /* 부서 모달 창 오픈 시 데이터 조회 및 초기화 */
  useEffect(() => {
    if (isShowDeptPopup) {
      fetchDeptList();
    } else {
      // searchDeptParams 초기화
      setSearchDeptParams({
        nmDept: "",
        cdDept: "",
      });
    }
  }, [isShowDeptPopup]);

  /* 부서 검색 */
  const handleSearchDept = () => {
    fetchDeptList(); // 검색 요청
  };
  /* 부서 모달 클릭 */
  const onDeptRowDoubleClick = (row: DeptListRes) => {
    setSearchDeptParams((prev) => ({
      ...prev,
      cdDept: row.cdDept,
      nmDept: row.nmDept,
    }));
    if (onDeptSelect) {
      onDeptSelect(row);
    }
    setIsShowDeptPopup(false); // 모달 창 닫기
  };

  // 입력 값 변경 처리 함수
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchDeptParams((prev) => ({
      ...prev,
      [name]: value, // 해당 필드만 업데이트
    }));
  };

  // 엔터 키 입력 처리 함수
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
      if (e.key === "Enter") {
        handleSearchDept();
      }
    }
  };

  // 테이블 컬럼 정의
  const tableColumns = [
    {
      Header: "NO",
      accessor: "rowNum",
      Cell: ({ value }: { value: any }) => <span>{value}</span>,
      minWidth: 50,
      width: 50,
      maxWidth: 180,
    },
    {
      Header: "부서코드",
      accessor: "cdDept",
      Cell: ({ value }: { value: any }) => <span>{value}</span>,
      minWidth: 150,
      width: 180,
      maxWidth: 200,
    },
    {
      Header: "회사코드",
      accessor: "cdCompany",
      Cell: ({ value }: { value: any }) => <span>{value}</span>,
      minWidth: 150,
      width: 180,
      maxWidth: 200,
    },

    {
      Header: "부서명",
      accessor: "nmDept",
      Cell: ({ value }: { value: any }) => <span>{value}</span>,
      minWidth: 150,
      width: 200,
      maxWidth: 250,
    },
    {
      Header: "사업장코드",
      accessor: "cdBizarea",
      Cell: ({ value }: { value: any }) => <span>{value}</span>,
      minWidth: 150,
      width: 180,
      maxWidth: 250,
    },
  ];

  return (
    <Modal show={isShowDeptPopup} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className={"modal-search-custom-header-class"}>
        <IconComponent
          className={"fe-grid noti-icon"}
          style={{
            fontSize: "20px", // 아이콘 크기 변경
            right: "10px", // 오른쪽 정렬
            top: "50%", // 세로 중앙 정렬
            transform: "translateY(0%)", // 정확한 중앙 정렬
            marginRight: "10px",
          }}
        />
        <Modal.Title className={"modal-search-custom-title-class"}>{t("부서코드")}</Modal.Title>
      </Modal.Header>
      {/* 검색 영역 */}
      <Row className="gx-3 px-2 d-flex align-items-center">
        <div className="d-flex align-items-center mb-3">
          <label className="modal-search-custom-label-class">{"코드"}</label>
          <FormControl
            type="text"
            value={searchDeptParams.cdDept}
            name={"cdDept"}
            className="modal-search-custom-input-class text-center"
            autoComplete="off"
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />

          <label className="modal-search-custom-label-class ms-1">{"부서명"}</label>
          <FormControl
            type="text"
            value={searchDeptParams.nmDept}
            name={"nmDept"}
            className="modal-search-custom-input-class text-center"
            autoComplete="off"
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />

          {/* 조회 버튼 */}
          <ButtonComponent
            type="button"
            className="system-modal-search-button"
            iClassName="ti-search"
            txt={t("common.search.btn")}
            onClick={handleSearchDept}
          />

          {/* 닫기 버튼 */}
          <ButtonComponent
            type="button"
            className="system-modal-search-button ms-1"
            iClassName="fe-x"
            txt={t("common.close.btn")}
            onClick={onClose}
          />
        </div>
      </Row>
      <div className="system-modal-total-count px-2">
        <span className="bold-text">Count {deptList?.length || 0}</span>
      </div>
      <div className="modal-table-container gx-3 px-2">
        {/* 데이터 테이블 */}
        <PisTable
          columns={tableColumns}
          data={deptList || []}
          theadClass="table-custom-system-user-light text-center font-12"
          tableClass="table-custom-system-user-background text-center font-12"
          pageSize={deptList?.length || 0}
          isSortable={true}
          errorMsg={errorMsg}
          onRowDoubleClick={(row) => onDeptRowDoubleClick(row.original)}
          onClose={onClose}
        />
      </div>
      <Modal.Footer />
    </Modal>
  );
});

export default DeptPopupComponent;
