import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* redux */
import { getStyleList, PisItemListRes, PisStyleListRes } from "../../redux/common/commonSlice";
import { AppDispatch, RootState } from "../../redux/store";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import PisTable from "../table/PisTable";
import IconComponent from "../common/IconComponent";

/* constant */
import { Payload } from "../../constants/common/common";

/* utils */
import { isEmpty } from "../../utils/CommonUtil";

/* lb */
import Swal from "sweetalert2";
import { number } from "yup";
interface Props {
  isShowStylePopup?: boolean;
  setIsShowStylePopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  onStyleSelect?: (rowIndex: number, item: PisStyleListRes) => void;
  currentOrderRowIndex?: number;
  setCurrentOrderRowIndex?: Dispatch<SetStateAction<number>>;
}

const StylePopupComponent = memo(
  ({
    isShowStylePopup,
    setIsShowStylePopup,
    onClose,
    onStyleSelect,
    currentOrderRowIndex,
    setCurrentOrderRowIndex,
  }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const [errorMsg, setErrorMsg] = useState("");
    const { t } = useTranslation();

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

    const { user, systemProgram } = useSelector((state: RootState) => ({
      user: state.Auth.user,
      systemProgram: state.systemProgram.programList,
    }));
    // 바이어 정보
    const [styleList, setStyleList] = useState<PisStyleListRes[]>([]);
    const [searchStyleParams, setSearchStyleParams] = useState({
      cdCompany: user?.companyId || "",
      noStyle: "",
      nmBuyer: "",
      nmBrand: "",
      nmItem: "",
      lang: "KOR",
    });
    /* 스타일 목록 데이터 요청 */
    const fetchStyleList = () => {
      dispatch(getStyleList({ ...searchStyleParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setStyleList(payload?.data || []);
        } else {
          setStyleList([]);
          setErrorMsg(payload.errorMessage || "데이터를 찾을 수 없습니다.");
        }
      });
    };

    /*    /!* 스타일 모달 창 오픈 시 데이터 조회 및 초기화 *!/
    useEffect(() => {
      if (
        isShowStylePopup &&
        (searchStyleParams.noStyle !== "" ||
          searchStyleParams.nmBrand !== "" ||
          searchStyleParams.nmBuyer !== "" ||
          searchStyleParams.nmItem)
      ) {
        setSearchStyleParams({
          cdCompany: user?.companyId || "",
          noStyle: "",
          nmBuyer: "",
          nmBrand: "",
          nmItem: "",
          lang: "KOR",
        });
        fetchStyleList();
      } else {
        // searchStyleParams 초기화
        setSearchStyleParams({
          cdCompany: user?.companyId || "",
          noStyle: "",
          nmBuyer: "",
          nmBrand: "",
          nmItem: "",
          lang: "KOR",
        });
      }
    }, [isShowStylePopup]);*/

    /* 스타일 모달 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      setSearchStyleParams({
        cdCompany: user?.companyId || "",
        noStyle: "",
        nmBuyer: "",
        nmBrand: "",
        nmItem: "",
        lang: "KOR",
      });
      setStyleList([]);
    }, [isShowStylePopup]);

    /* 스타일 검색 */
    const handleSearchStyle = () => {
      if (
        searchStyleParams.noStyle !== "" ||
        searchStyleParams.nmBrand !== "" ||
        searchStyleParams.nmBuyer !== "" ||
        searchStyleParams.nmItem
      ) {
        fetchStyleList();
      } else {
        showAlert("값을 입력한 후 조회버튼을 눌러주세요.");
      }
    };
    /* 스타일 row 클릭 */
    const onStyleRowDoubleClick = (row: PisStyleListRes) => {
      setSearchStyleParams((prev) => ({
        ...prev,
        seqStyle: row.seqStyle,
        noStyle: row.noStyle,
        cdBuyer: row.cdBuyer,
        nmBuyer: row.nmBuyer,
        cdBrand: row.cdBrand,
        nmBrand: row.nmBrand,
        cdItem: row.cdItem,
        nmItem: row.nmItem,
        amount: row.amOrd,
        quantity: row.qtOrd,
      }));
      // 현재 편집 중인 주문 행의 인덱스(currentRowIndex)와 선택된 row를 함께 전달
      if (onStyleSelect && typeof currentOrderRowIndex === "number") {
        onStyleSelect(currentOrderRowIndex, row);
      }
      setStyleList([]);
      setIsShowStylePopup(false); // 모달 창 닫기
    };

    // 입력 값 변경 처리 함수
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSearchStyleParams((prev) => ({
        ...prev,
        [name]: value, // 해당 필드만 업데이트
      }));
    };

    // 엔터 키 입력 처리 함수
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          handleSearchStyle();
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
        Header: "seq.Style",
        accessor: "seqStyle",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 150,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "No.Style",
        accessor: "noStyle",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "No.StyleO",
        accessor: "noStyleO",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 150,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "스타일명",
        accessor: "nmStyle",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "아이템코드",
        accessor: "cdItem",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "아이템명",
        accessor: "nmItem",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "BuyerCode",
        accessor: "cdBuyer",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "BuyerName",
        accessor: "nmBuyer",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "BrandCode",
        accessor: "cdBrand",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "BrandName",
        accessor: "nmBrand",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "QtOrd",
        accessor: "qtOrd",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
      {
        Header: "AmOrd",
        accessor: "amOrd",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        minWidth: 80,
        width: 200,
        maxWidth: 250,
        sort: true,
      },
    ];

    return (
      <Modal show={isShowStylePopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className={"modal-search-custom-title-class"}>{t("스타일(STYLE) 조회")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            <label className="modal-search-custom-label-class">{"StyleNo"}</label>
            <FormControl
              type="text"
              value={searchStyleParams.noStyle}
              name={"noStyle"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <label className="modal-search-custom-label-class ms-1">{"BuyerName"}</label>
            <FormControl
              type="text"
              value={searchStyleParams.nmBuyer}
              name={"nmBuyer"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <label className="modal-search-custom-label-class ms-1">{"BrandName"}</label>
            <FormControl
              type="text"
              value={searchStyleParams.nmBrand}
              name={"nmBrand"}
              className="modal-search-custom-input-class text-center"
              autoComplete="off"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />

            <label className="modal-search-custom-label-class ms-1">{"ItemName"}</label>
            <FormControl
              type="text"
              value={searchStyleParams.nmItem}
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
              txt={""}
              onClick={handleSearchStyle}
            />

            {/* 닫기 버튼 */}
            <ButtonComponent
              type="button"
              className="system-modal-search-button ms-1"
              iClassName="fe-x"
              txt={""}
              onClick={onClose}
            />
          </div>
        </Row>
        <div className="system-modal-total-count px-2">
          <span className="bold-text">Count {styleList?.length || 0}</span>
        </div>
        <div className="modal-table-container gx-3 px-2">
          {/* 데이터 테이블 */}
          <PisTable
            columns={tableColumns}
            data={styleList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={styleList?.length || 0}
            isSortable={true}
            errorMsg={errorMsg}
            onRowDoubleClick={(row) => {
              // 1) 선택한 row 의 인덱스로 설정
              if (setCurrentOrderRowIndex) setCurrentOrderRowIndex(row.index);
              // 2) 실제 선택 핸들러 호출
              onStyleRowDoubleClick(row.original);
            }}
            onClose={onClose}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default StylePopupComponent;
