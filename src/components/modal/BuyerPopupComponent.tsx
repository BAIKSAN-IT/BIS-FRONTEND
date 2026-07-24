import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { getBuyerList, PisBuyerListRes, PisStyleListRes } from "../../redux/common/commonSlice";
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
  isShowBuyerPopup?: boolean;
  setIsShowBuyerPopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  onBuyerSelect?: (rowIndex: number, item: PisBuyerListRes) => void;
  onBuyerDoubleClickSelect?: (item: PisBuyerListRes) => void;
  currentOrderRowIndex?: number;
  setCurrentOrderRowIndex?: Dispatch<SetStateAction<number>>;
}

const BuyerPopupComponent = memo(
  ({
    isShowBuyerPopup,
    setIsShowBuyerPopup,
    onClose,
    onBuyerSelect,
    onBuyerDoubleClickSelect,
    currentOrderRowIndex,
    setCurrentOrderRowIndex,
  }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const [errorMsg, setErrorMsg] = useState("");
    const { t } = useTranslation();
    const { user, systemProgram } = useSelector((state: RootState) => ({
      user: state.Auth.user,
      systemProgram: state.systemProgram.programList,
    }));
    // 바이어 정보
    const [buyerList, setBuyerList] = useState<PisBuyerListRes[]>([]);
    const [searchBuyerParams, setSearchBuyerParams] = useState({
      cdCompany: user?.companyId || "",
      cdBuyer: "",
      nmBuyer: "",
      lang: "KOR",
    });
    /* 바이어 목록 데이터 요청 */
    const fetchBuyerList = () => {
      dispatch(getBuyerList({ ...searchBuyerParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setBuyerList(payload?.data || []);
        } else {
          setBuyerList([]);
          setErrorMsg(payload.errorMessage || "데이터를 찾을 수 없습니다.");
        }
      });
    };

    /* 바이어 모달 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      setSearchBuyerParams({
        cdCompany: user?.companyId || "",
        cdBuyer: "",
        nmBuyer: "",
        lang: "KOR",
      });
      fetchBuyerList(); // 팝업 열리자마자 조회
    }, [isShowBuyerPopup]);

    /* 바이어 검색 */
    const handleSearchBuyer = () => {
      fetchBuyerList(); // 검색 요청
    };
    /* 바이어 row 클릭 */
    const onBuyerRowDoubleClick = (row: PisBuyerListRes) => {
      setSearchBuyerParams((prev) => ({
        ...prev,
        cdBuyer: row.cdBuyer,
        nmBuyer: row.nmBuyer,
      }));
      // 현재 편집 중인 주문 행의 인덱스(currentRowIndex)와 선택된 row를 함께 전달
      if (onBuyerSelect && typeof currentOrderRowIndex === "number") {
        onBuyerSelect(currentOrderRowIndex, row);
      }
      if (onBuyerDoubleClickSelect) {
        onBuyerDoubleClickSelect(row);
      }

      setBuyerList([]);
      setIsShowBuyerPopup(false); // 모달 창 닫기
    };

    // 입력 값 변경 처리 함수
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSearchBuyerParams((prev) => ({
        ...prev,
        [name]: value, // 해당 필드만 업데이트
      }));
    };

    // 엔터 키 입력 처리 함수
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          handleSearchBuyer();
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
        sort: true,
      },
      {
        Header: "BuyerCode",
        accessor: "cdBuyer",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 150,
        width: 300,
        maxWidth: 350,
        sort: true,
      },
      {
        Header: "BuyerName",
        accessor: "nmBuyer",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 150,
        width: 400,
        maxWidth: 500,
        sort: true,
      },
    ];

    return (
      <Modal show={isShowBuyerPopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("Buyer 조회")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            <label className="modal-search-custom-label-class">{"BuyerCode"}</label>
            <FormControl
              type="text"
              value={searchBuyerParams.cdBuyer}
              name={"cdBuyer"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />

            <label className="modal-search-custom-label-class ms-1">{"BuyerName"}</label>
            <FormControl
              type="text"
              value={searchBuyerParams.nmBuyer}
              name={"nmBuyer"}
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
              onClick={handleSearchBuyer}
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
          <span className="bold-text">Count {buyerList?.length || 0}</span>
        </div>
        <div className="modal-table-container gx-3 px-2">
          {/* 데이터 테이블 */}
          <PisTable
            columns={tableColumns}
            data={buyerList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={buyerList?.length || 0}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => {
              // 1) 선택한 row 의 인덱스로 설정
              if (setCurrentOrderRowIndex) setCurrentOrderRowIndex(row.index);
              // 2) 실제 선택 핸들러 호출
              onBuyerRowDoubleClick(row.original);
            }}
            onClose={onClose}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default BuyerPopupComponent;
