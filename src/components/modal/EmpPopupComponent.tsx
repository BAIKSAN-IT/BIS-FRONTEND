import React, { memo, useCallback } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";

/* Redux */
import { EmpListRes } from "../../redux/system/SystemUserSlice";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import IconComponent from "../common/IconComponent";
import PisTable from "../table/PisTable";
import { useTranslation } from "react-i18next";

interface Props {
  itemList: EmpListRes[];
  errorMsg: string;
  show: boolean;
  onClose: () => void;
  onSearch: () => void;
  setSearchEmpParams: React.Dispatch<
    React.SetStateAction<{
      noEmp: string;
      cdBizarea: string;
      cdDept: string;
      limit: number;
      pageNo: number;
    }>
  >;
  searchEmpParams: { noEmp: string; cdBizarea: string; cdDept: string };
  onEmpPopUpRowClick: (row: EmpListRes) => void;
  onLoadMore: () => void;
}

const EmpPopupComponent = memo(
  ({
    itemList,
    errorMsg,
    show,
    onClose,
    onSearch,
    setSearchEmpParams,
    searchEmpParams,
    onEmpPopUpRowClick,
    onLoadMore,
  }: Props) => {
    const { t } = useTranslation();
    // 입력 값 변경 처리 함수
    const handleInputChange = useCallback(
      (field: "noEmp" | "cdBizarea" | "cdDept", value: string) => {
        setSearchEmpParams((prevParams) => ({
          ...prevParams,
          [field]: value,
        }));
      },
      [setSearchEmpParams]
    );
    // 엔터 키 입력 처리 함수
    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          onSearch(); // 검색 함수 호출
        }
      },
      [onSearch]
    );
    // 무한 스크롤 핸들러
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 10) {
          onLoadMore();
        }
      },
      [onLoadMore]
    );
    // 테이블 컬럼 정의
    const tableColumns = [
      {
        Header: "NO",
        accessor: "rowNum",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 60,
        width: 60,
        maxWidth: 100,
      },
      {
        Header: t("register.form.employeeNumber"),
        accessor: "noEmp",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 80,
        width: 80,
        maxWidth: 120,
      },
      {
        Header: t("register.form.userName"),
        accessor: "nmKor",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 160,
        width: 160,
        maxWidth: 180,
      },
      {
        Header: t("register.form.userEngName"),
        accessor: "nmEng",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 160,
        width: 160,
        maxWidth: 180,
      },
      {
        Header: t("register.form.nmBizarea"),
        accessor: "cdBizarea",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 200,
      },
      {
        Header: t("register.form.guestNmDept"),
        accessor: "cdDept",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 200,
      },
    ];

    return (
      <Modal show={show} onHide={onClose} size="lg" centered>
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("register.modal.employmentTitle")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            <label className="modal-search-custom-label-class">{t("register.modal.employee")}</label>
            <FormControl
              value={searchEmpParams.noEmp}
              onChange={(e) => handleInputChange("noEmp", e.target.value)}
              onKeyPress={handleKeyPress}
              className="modal-search-custom-input-class text-center"
            />
            <label className="modal-search-custom-label-class ms-1">{t("register.modal.partner")}</label>
            <FormControl
              value={searchEmpParams.cdBizarea}
              onChange={(e) => handleInputChange("cdBizarea", e.target.value)}
              onKeyPress={handleKeyPress}
              className="modal-search-custom-input-class text-center"
            />
            {/* 조회 버튼 */}
            <ButtonComponent
              type="button"
              className="system-modal-search-button"
              iClassName="ti-search"
              txt={t("common.search.btn")}
              onClick={onSearch}
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
          <span className="bold-text">
            Count {itemList?.length || 0} of {itemList[0]?.totalCount || 0}
          </span>
        </div>
        <div className="modal-table-container gx-3 px-2">
          {/* 데이터 테이블 */}
          <PisTable
            columns={tableColumns}
            data={itemList}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={itemList.length}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => onEmpPopUpRowClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default EmpPopupComponent;
