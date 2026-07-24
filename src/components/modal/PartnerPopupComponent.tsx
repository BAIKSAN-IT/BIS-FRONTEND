import React, { memo, useCallback } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";

/* Redux */
import { PartnerListRes } from "../../redux/system/SystemUserSlice";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import PisTable from "../table/PisTable";
import IconComponent from "../common/IconComponent";
import { useTranslation } from "react-i18next";

interface Props {
  itemList: PartnerListRes[];
  errorMsg: string;
  show: boolean;
  onClose: () => void;
  onSearch: () => void; // 매개변수 추가
  setSearchPartnerParams: React.Dispatch<
    React.SetStateAction<{
      lnPartner: string;
      cdPartner: string;
      limit: number;
      page: number;
    }>
  >;
  searchPartnerParams: { lnPartner: string; cdPartner: string };
  onLoadMore: () => void; // 추가 데이터 요청
  onPartnerModalRowClick: (row: PartnerListRes) => void;
}

const PartnerPopupComponent = memo(
  ({
    itemList,
    errorMsg,
    show,
    onClose,
    onSearch,
    setSearchPartnerParams,
    searchPartnerParams,
    onLoadMore,
    onPartnerModalRowClick,
  }: Props) => {
    const { t } = useTranslation();
    // 입력 값 변경 처리 함수
    const handleInputChange = useCallback(
      (field: "lnPartner" | "cdPartner", value: string) => {
        setSearchPartnerParams((prevParams) => ({
          ...prevParams,
          [field]: value,
        }));
      },
      [setSearchPartnerParams]
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

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (scrollHeight - scrollTop - clientHeight < 50) {
          onLoadMore();
        }
      },
      [onLoadMore]
    );
    // 테이블 컬럼 정의
    const partnerTableColumns = [
      {
        Header: "NO",
        accessor: "rowNum",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 50,
        width: 50,
        maxWidth: 180,
      },
      {
        Header: t("register.modal.company"),
        accessor: "cdCompany",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 200,
        width: 200,
        maxWidth: 180,
      },
      {
        Header: t("register.modal.partner"),
        accessor: "cdPartner",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 200,
        width: 200,
        maxWidth: 220,
      },
      {
        Header: t("register.modal.lnPartner"),
        accessor: "lnPartner",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 310,
        width: 310,
        maxWidth: 320,
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("register.modal.partnerTitle")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            {/* 사업장명 입력 */}
            <label className="modal-search-custom-label-class">{t("register.modal.partner")}</label>
            <FormControl
              value={searchPartnerParams.cdPartner}
              onChange={(e) => handleInputChange("cdPartner", e.target.value)}
              onKeyPress={handleKeyPress}
              className="modal-search-custom-input-class text-center"
            />

            {/* 거래처명 입력 */}
            <label className="modal-search-custom-label-class ms-1">{t("register.modal.lnPartner")}</label>
            <FormControl
              value={searchPartnerParams.lnPartner}
              onChange={(e) => handleInputChange("lnPartner", e.target.value)}
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
            columns={partnerTableColumns}
            data={itemList}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={itemList.length}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => onPartnerModalRowClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);
export default PartnerPopupComponent;
