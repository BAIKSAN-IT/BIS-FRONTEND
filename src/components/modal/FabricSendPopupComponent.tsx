import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";

/* Redux */

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
import { FabricInfoRes, getFabricInfoList } from "../../redux/rnd/RndSlice";

interface Props {
  isShowFabricSendPopup?: boolean;
  setIsShowFabricSendPopup: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onFabricSendSelect?: (row: FabricInfoRes) => void;
  cdFabric?: string;
  nmFabric?: string;
  dyLot?: string;
  noStyle?: string;
}

const FabricSendPopupComponent = memo(
  ({ isShowFabricSendPopup, setIsShowFabricSendPopup, onClose, onFabricSendSelect, cdFabric, nmFabric }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));
    const [fabricInfoList, setFabricInfoList] = useState<FabricInfoRes[]>([]);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [searchParams, setSearchParams] = useState({
      cdCompany: user?.companyId || "1000",
      nmFabric: "",
      cdFabric: "",
      dyLot: "",
      noStyle: "",
      pageNo: 1,
      pageSize: 50,
    });

    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));

    // API 호출: 검색 조건에 따라 처리 (검색 모드와 무한스크롤 모드 구분)
    const fetchFabricInfoList = (params = searchParams) => {
      dispatch(getFabricInfoList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          // 검색 조건이 있다면(검색 모드) 전체 결과를 받아와서 리스트를 교체
          if (params.nmFabric.trim() !== "" || params.nmFabric.trim() !== "") {
            setFabricInfoList(payload.data);
          } else {
            // 무한 스크롤 모드: pageNo 1이면 초기화, 아니라면 기존 리스트에 추가
            if (params.pageNo === 1) {
              setFabricInfoList(payload.data);
            } else {
              setFabricInfoList((prev) => [...prev, ...payload.data]);
            }
          }
        } else {
          // pageSize가 1이면 데이터가 없으므로 리스트를 초기화
          if (params.pageNo === 1) {
            setFabricInfoList([]);
          }
        }
      });
    };

    // 모달이 열릴 때 초기화: 모달이 열리면 pageSize를 1로 재설정하고 데이터를 불러옴
    useEffect(() => {
      if (isShowFabricSendPopup) {
        setSearchParams((prev) => ({ ...prev, pageNo: 1 }));
        fetchFabricInfoList({ ...searchParams, pageNo: 1 });
      } else {
        setSearchParams({
          cdCompany: user?.companyId || "1000",
          nmFabric: "",
          cdFabric: "",
          dyLot: "",
          noStyle: "",
          pageSize: 50,
          pageNo: 1,
        });
        setFabricInfoList([]);
      }
    }, [isShowFabricSendPopup, nmFabric, cdFabric]);

    // 무한 스크롤 모드: pageSize가 변경되면 추가 데이터를 불러옴 (검색 조건이 없을 때만)
    useEffect(() => {
      if (
        isShowFabricSendPopup &&
        searchParams.nmFabric.trim() === "" &&
        searchParams.cdFabric.trim() === "" &&
        searchParams.pageNo > 1
      ) {
        fetchFabricInfoList(searchParams);
      }
    }, [searchParams.pageNo]);

    // 검색 버튼 클릭: 검색 조건이 있는 경우 전체 결과 조회 (page 1)
    const handleSearchPartner = () => {
      setSearchParams((prev) => ({ ...prev, pageNo: 1 }));
      fetchFabricInfoList({ ...searchParams, pageNo: 1 });
    };

    const onFabricSendRowDoubleClick = (row: FabricInfoRes) => {
      setSearchParams((prev) => ({
        ...prev,
        nmFabric: row.nmFabric,
        cdFabric: row.cdFabric,
      }));
      if (onFabricSendSelect) {
        onFabricSendSelect(row);
      }
      setIsShowFabricSendPopup(false);
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
            pageNo: prev.pageNo + 1,
          }));
        }
      }, 300);
    }, []);
    const tableColumns = [
      {
        Header: "NO",
        accessor: "seqNo",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 50,
        width: 50,
        maxWidth: 180,
      },
      {
        Header: t("LOT#"),
        accessor: "dyLot",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 1000,
      },
      {
        Header: t("STYLE#"),
        accessor: "noStyle",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 1000,
      },
      {
        Header: t("FABRIC CODE"),
        accessor: "cdFabric",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 180,
      },
      {
        Header: t("FABRIC NAME"),
        accessor: "nmFabric",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 200,
        width: 200,
        maxWidth: 220,
      },
      {
        Header: t("FAB INCH"),
        accessor: "widthInch",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
      {
        Header: t("WEIGHT(G/M>)"),
        accessor: "wgtSqm",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
      {
        Header: t("WEIGHT(G/YD)"),
        accessor: "wgtYd",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
      {
        Header: t("COMPOSITION"),
        accessor: "composition",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 310,
        width: 310,
        maxWidth: 320,
      },
      {
        Header: t("KNIT INCH"),
        accessor: "knitInch",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
      {
        Header: t("KNIT GAUGE"),
        accessor: "knitGauge",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
      {
        Header: t("BUYER NAME"),
        accessor: "nmBuyer",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 180,
      },
    ];

    return (
      <Modal show={isShowFabricSendPopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className="modal-search-custom-title-class">{t("register.modal.fabricTitle")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            {/* 사업장명 입력 */}
            <label className="modal-search-custom-label-class">{t("register.modal.cdFabric")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              value={searchParams.cdFabric || ""}
              name="cdFabric"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* 거래처명 입력 */}
            <label className="modal-search-custom-label-class ms-1">{t("register.modal.nmFabric")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              value={searchParams.nmFabric || ""}
              name="nmFabric"
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
            Count {fabricInfoList?.length || 0} of {fabricInfoList[0]?.totalCount || 0}
          </span>
        </div>
        {/* onScroll만 컨테이너에 적용합니다. */}
        <div className="modal-table-container gx-3 px-2">
          <PisTable
            columns={tableColumns}
            data={fabricInfoList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={50}
            isSortable={true}
            onRowDoubleClick={(row) => onFabricSendRowDoubleClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);
export default FabricSendPopupComponent;
