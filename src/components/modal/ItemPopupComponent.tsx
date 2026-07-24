import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { getItemList, PisItemListRes } from "../../redux/common/commonSlice";
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
  isShowItemPopup?: boolean;
  setIsShowItemPopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  onItemSelect?: (rowIndex: number, item: PisItemListRes) => void;
  currentOrderRowIndex?: number;
  setCurrentOrderRowIndex?: Dispatch<SetStateAction<number>>;
}

const ItemPopupComponent = memo(
  ({
    isShowItemPopup,
    setIsShowItemPopup,
    onClose,
    onItemSelect,
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
    // 아이템 정보
    const [ItemList, setItemList] = useState<PisItemListRes[]>([]);
    const [searchItemParams, setSearchItemParams] = useState({
      cdCompany: user?.companyId || "",
      cdItem: "",
      nmItem: "",
      lang: "KOR",
    });
    /* 아이템 목록 데이터 요청 */
    const fetchItemList = () => {
      dispatch(getItemList({ ...searchItemParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setItemList(payload?.data || []);
        } else {
          setItemList([]);
          setErrorMsg(payload.errorMessage || "데이터를 찾을 수 없습니다.");
        }
      });
    };

    /* 아이템 모달 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      // searchItemParams 초기화
      setSearchItemParams({
        cdCompany: user?.companyId || "",
        cdItem: "",
        nmItem: "",
        lang: "KOR",
      });
      setItemList([]);
    }, [isShowItemPopup]);

    /* 아이템 검색 */
    const handleSearchItem = () => {
      fetchItemList(); // 검색 요청
    };
    /* 아이템 row 더블클릭 */
    const onItemRowDoubleClick = (row: PisItemListRes) => {
      // 필요에 따라 searchItemParams 업데이트 가능
      setSearchItemParams((prev) => ({
        ...prev,
        cdItem: row.cdItem,
        nmItem: row.nmItem,
      }));
      // 현재 편집 중인 주문 행의 인덱스(currentRowIndex)와 선택된 row를 함께 전달
      if (onItemSelect && typeof currentOrderRowIndex === "number") {
        onItemSelect(currentOrderRowIndex, row);
      }
      setItemList([]);
      setIsShowItemPopup(false); // 모달 창 닫기
    };

    // 입력 값 변경 처리 함수
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSearchItemParams((prev) => ({
        ...prev,
        [name]: value, // 해당 필드만 업데이트
      }));
    };

    // 엔터 키 입력 처리 함수
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          handleSearchItem();
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
        Header: "아이템코드",
        accessor: "cdItem",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 150,
        width: 300,
        maxWidth: 350,
        sort: true,
      },
      {
        Header: "아이템명",
        accessor: "nmItem",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 150,
        width: 400,
        maxWidth: 500,
        sort: true,
      },
    ];

    return (
      <Modal show={isShowItemPopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("아이템(ITEM) 조회")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            <label className="modal-search-custom-label-class">{"아이템코드"}</label>
            <FormControl
              type="text"
              value={searchItemParams.cdItem}
              name={"cdItem"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />

            <label className="modal-search-custom-label-class ms-1">{"아이템명"}</label>
            <FormControl
              type="text"
              value={searchItemParams.nmItem}
              name={"nmItem"}
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
              onClick={handleSearchItem}
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
          <span className="bold-text">Count {ItemList?.length || 0}</span>
        </div>
        <div className="modal-table-container gx-3 px-2">
          {/* 데이터 테이블 */}
          <PisTable
            columns={tableColumns}
            data={ItemList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={ItemList?.length || 0}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => {
              // 1) 선택한 row 의 인덱스로 설정
              if (setCurrentOrderRowIndex) setCurrentOrderRowIndex(row.index);
              // 2) 실제 선택 핸들러 호출
              onItemRowDoubleClick(row.original);
            }}
            onClose={onClose}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default ItemPopupComponent;
