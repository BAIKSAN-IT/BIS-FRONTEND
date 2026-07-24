import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { getPartnerList, PartnerListRes } from "../../redux/system/SystemUserSlice";
import { AppDispatch, RootState } from "../../redux/store";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import PisTable from "../table/PisTable";
import IconComponent from "../common/IconComponent";

/* constant */
import { Payload } from "../../constants/common/common";

/* utils */
import { isEmpty } from "../../utils/CommonUtil";
import { number } from "yup";

interface Props {
  isShowCompanyPopup?: boolean;
  setIsShowCompanyPopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  onCompanySelect?: (rowIndex: number, partner: PartnerListRes) => void; // 추가된 prop
  currentAttendRowIndex?: number;
  setCurrentAttendRowIndex?: Dispatch<SetStateAction<number>>;
}

const CompanyPopupComponent = memo(
  ({
    isShowCompanyPopup,
    setIsShowCompanyPopup,
    onClose,
    onCompanySelect,
    currentAttendRowIndex,
    setCurrentAttendRowIndex,
  }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const [errorMsg, setErrorMsg] = useState("");
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리

    const [companyList, setCompanyList] = useState<PartnerListRes[]>([]); // 거래처 정보 리스트

    const [searchCompanyParams, setSearchCompanyParams] = useState({
      lnPartner: "",
      cdPartner: "",
      limit: 50,
      page: 1,
    });

    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));
    /* 파트너 팝업 데이터 요청 */
    const fetchCompanyList = () => {
      dispatch(getPartnerList({ ...searchCompanyParams })).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          if (searchCompanyParams.page === 1) {
            setCompanyList(payload.data); // 첫 페이지는 데이터 교체
          } else {
            setCompanyList((prev) => [...prev, ...payload.data]); // 이후 페이지는 데이터 추가
          }
        } else {
          setCompanyList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
        setIsLoading(false); // 로딩 상태 해제
      });
    };

    /* 회사 모달 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      if (isShowCompanyPopup) {
        fetchCompanyList();
      } else {
        // searchCompanyParams 초기화
        setSearchCompanyParams({
          lnPartner: "",
          cdPartner: "",
          limit: 50,
          page: 1,
        });
      }
    }, [isShowCompanyPopup]);

    const handleSearchCompany = () => {
      setCompanyList([]);

      const newParams = { ...searchCompanyParams, page: 1 };
      setSearchCompanyParams(newParams);

      dispatch(getPartnerList(newParams)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setCompanyList(payload.data);
        } else {
          setCompanyList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
        setIsLoading(false);
      });
    };

    const handleLoadMoreCompany = () => {
      if (isLoading) return;
      if (companyList.length >= companyList[0]?.totalCount) {
        return;
      }
      setIsLoading(true);
      setSearchCompanyParams((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    };

    useEffect(() => {
      // 더 이상 가져올 데이터가 없으면 호출하지 않음
      if (isShowCompanyPopup && searchCompanyParams.page > 1) {
        if (companyList.length < companyList[0]?.totalCount) {
          fetchCompanyList();
        }
      }
    }, [searchCompanyParams.page]);

    /* 회사 팝업 클릭 */
    const onCompanyRowDoubleClick = (row: PartnerListRes) => {
      setSearchCompanyParams((prev) => ({
        ...prev,
        lnPartner: row.lnPartner,
        cdPartner: row.cdPartner,
      }));
      // 현재 편집 중인 주문 행의 인덱스(currentRowIndex)와 선택된 row를 함께 전달
      if (onCompanySelect && typeof currentAttendRowIndex === "number") {
        onCompanySelect(currentAttendRowIndex, row);
      }
      setIsShowCompanyPopup(false); // 모달 창 닫기
    };

    // 입력 값 변경 처리 함수
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSearchCompanyParams((prev) => ({
        ...prev,
        [name]: value, // 해당 필드만 업데이트
      }));
    };

    // 엔터 키 입력 처리 함수
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          handleSearchCompany();
        }
      }
    };

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (scrollHeight - scrollTop - clientHeight < 50) {
          handleLoadMoreCompany();
        }
      },
      [handleLoadMoreCompany]
    );

    // 테이블 컬럼 정의
    const tableColumns = [
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
      <Modal show={isShowCompanyPopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("register.modal.companyTitle")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            {/* 사업장명 입력 */}
            <label className="modal-search-custom-label-class">{t("register.modal.partner")}</label>
            <FormControl
              type="text"
              value={searchCompanyParams.cdPartner}
              name={"cdPartner"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />

            {/* 거래처명 입력 */}
            <label className="modal-search-custom-label-class ms-1">{t("register.modal.lnPartner")}</label>
            <FormControl
              type="text"
              value={searchCompanyParams.lnPartner}
              name={"lnPartner"}
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
              onClick={handleLoadMoreCompany}
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
            Count {companyList?.length || 0} of {companyList[0]?.totalCount || 0}
          </span>
        </div>
        <div className="modal-table-container gx-3 px-2">
          {/* 데이터 테이블 */}
          <PisTable
            columns={tableColumns}
            data={companyList}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={companyList.length}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => {
              // 1) 선택한 row 의 인덱스로 설정
              if (setCurrentAttendRowIndex) setCurrentAttendRowIndex(row.index);
              // 2) 실제 선택 핸들러 호출
              onCompanyRowDoubleClick(row.original);
            }}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default CompanyPopupComponent;
