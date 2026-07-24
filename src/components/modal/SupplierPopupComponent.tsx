import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";

/* Redux */
import { getPartnerList, PartnerListRes } from "../../redux/system/SystemUserSlice";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import PisTable from "../table/PisTable";
import IconComponent from "../common/IconComponent";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { useLocation } from "react-router-dom";
import { Payload } from "../../constants/common/common";
import { isEmpty } from "../../utils/CommonUtil";

interface Props {
  isShowSupplierPopup?: boolean;
  setIsShowSupplierPopup: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onSupplierSelect?: (row: PartnerListRes) => void;
  cdPartner?: string;
  lnPartner?: string;
}

const SupplierPopupComponent = memo(
  ({ isShowSupplierPopup, setIsShowSupplierPopup, onClose, onSupplierSelect, cdPartner, lnPartner }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    const [partnerList, setPartnerList] = useState<PartnerListRes[]>([]);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [searchParams, setSearchParams] = useState({
      lnPartner: "",
      cdPartner: "",
      limit: 50,
      page: 1,
    });

    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));

    // API 호출: 검색 조건에 따라 처리 (검색 모드와 무한스크롤 모드 구분)
    const fetchPartnerList = (params = searchParams) => {
      dispatch(getPartnerList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          // 검색 조건이 있다면(검색 모드) 전체 결과를 받아와서 리스트를 교체
          if (params.lnPartner.trim() !== "" || params.lnPartner.trim() !== "") {
            setPartnerList(payload.data);
          } else {
            // 무한 스크롤 모드: limit가 1이면 초기화, 아니라면 기존 리스트에 추가
            if (params.page === 1) {
              setPartnerList(payload.data);
            } else {
              setPartnerList((prev) => [...prev, ...payload.data]);
            }
          }
        } else {
          // limit가 1이면 데이터가 없으므로 리스트를 초기화
          if (params.page === 1) {
            setPartnerList([]);
          }
        }
      });
    };

    // 모달이 열릴 때 초기화: 모달이 열리면 limit를 1로 재설정하고 데이터를 불러옴
    useEffect(() => {
      if (isShowSupplierPopup) {
        setSearchParams((prev) => ({ ...prev, page: 1 }));
        fetchPartnerList({ ...searchParams, page: 1 });
      } else {
        setSearchParams({
          lnPartner: "",
          cdPartner: "",
          limit: 50,
          page: 1,
        });
        setPartnerList([]);
      }
    }, [isShowSupplierPopup, lnPartner, cdPartner]);

    // 무한 스크롤 모드: limit가 변경되면 추가 데이터를 불러옴 (검색 조건이 없을 때만)
    useEffect(() => {
      if (
        isShowSupplierPopup &&
        searchParams.lnPartner.trim() === "" &&
        searchParams.cdPartner.trim() === "" &&
        searchParams.page > 1
      ) {
        fetchPartnerList(searchParams);
      }
    }, [searchParams.page]);

    // 검색 버튼 클릭: 검색 조건이 있는 경우 전체 결과 조회 (page 1)
    const handleSearchPartner = () => {
      setSearchParams((prev) => ({ ...prev, page: 1 }));
      fetchPartnerList({ ...searchParams, page: 1 });
    };

    const onPartnerRowDoubleClick = (row: PartnerListRes) => {
      setSearchParams((prev) => ({
        ...prev,
        lnPartner: row.lnPartner,
        cdPartner: row.cdPartner,
      }));
      if (onSupplierSelect) {
        onSupplierSelect(row);
      }
      setIsShowSupplierPopup(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          handleSearchPartner();
        }
      }
    };

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      // e.currentTarget을 변수에 저장
      const target = e.currentTarget;
      if (!target) return; // 혹시 모를 null 체크

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollHeight - scrollTop - clientHeight < 10) {
          setSearchParams((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        }
      }, 300);
    }, []);
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
      <Modal show={isShowSupplierPopup} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton className="modal-search-custom-header-class">
          <IconComponent
            className="fe-grid noti-icon"
            style={{
              fontSize: "20px",
              right: "10px",
              top: "50%",
              transform: "translateY(0%)",
              marginRight: "10px",
            }}
          />
          <Modal.Title className="modal-search-custom-title-class">{t("Supplier 정보 조회")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            {/* 사업장명 입력 */}
            <label className="modal-search-custom-label-class">{t("register.modal.partner")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              value={searchParams.cdPartner || ""}
              name="cdPartner"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* 거래처명 입력 */}
            <label className="modal-search-custom-label-class ms-1">{t("register.modal.lnPartner")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              value={searchParams.lnPartner || ""}
              name="lnPartner"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />

            {/* 조회 버튼 */}
            <ButtonComponent
              type="button"
              className="system-modal-search-button"
              iClassName="ti-search"
              txt={t("common.search.btn")}
              onClick={handleSearchPartner}
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
            Count {partnerList?.length || 0} of {partnerList[0]?.totalCount || 0}
          </span>
        </div>
        {/* onScroll만 컨테이너에 적용합니다. */}
        <div className="modal-table-container gx-3 px-2">
          <PisTable
            columns={tableColumns}
            data={partnerList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={20}
            isSortable={true}
            onRowDoubleClick={(row) => onPartnerRowDoubleClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);
export default SupplierPopupComponent;
