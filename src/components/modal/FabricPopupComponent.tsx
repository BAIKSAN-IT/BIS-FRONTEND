import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

/* Redux */
import { FabricInfoRes, getFabricInfoList } from "@redux/rnd/RndSlice";
import { AppDispatch, RootState } from "@redux/store";

/* Component */
import ButtonComponent from "@components/common/ButtonComponent";
import PisTable from "@components/table/PisTable";
import IconComponent from "@components/common/IconComponent";

/* utils */
import { isEmpty } from "@utils/CommonUtil";

/* constants */
import { Payload } from "@constants/common/common";

/* lb */
import Swal from "sweetalert2";

interface Props {
  isShowFabricPopup?: boolean;
  setIsShowFabricPopup: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onFabricSelect?: (row: FabricInfoRes) => void;
  cdFabric?: string;
  nmFabric?: string;
  dyLot?: string;
  noStyle?: string;
}

const FabricPopupComponent = memo(
  ({ isShowFabricPopup, setIsShowFabricPopup, onClose, onFabricSelect, cdFabric, nmFabric }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    const showAlert = (msg: string) => {
      Swal.fire({
        text: msg,
        confirmButtonText: "OK",
        customClass: { popup: "small-swal-popup", confirmButton: "small-swal-button" },
      });
    };

    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));
    const [fabricInfoList, setFabricInfoList] = useState<FabricInfoRes[]>([]);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /* INPUT 속도 개선 (검색조건) */
    const dyLotRef = useRef<HTMLInputElement | null>(null);
    const noStyleRef = useRef<HTMLInputElement | null>(null);
    const cdFabricRef = useRef<HTMLInputElement | null>(null);
    const nmFabricRef = useRef<HTMLInputElement | null>(null);

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
          // 무한스크롤 모드
          if (params.pageNo === 1) {
            setFabricInfoList(payload.data);
          } else {
            setFabricInfoList((prev) => [...prev, ...payload.data]);
          }
        } else {
          if (params.pageNo === 1) setFabricInfoList([]);
        }
      });
    };
    // 검색 버튼 클릭: 검색 조건이 있는 경우 전체 결과 조회 (page 1)
    const handleSearchPartner = () => {
      const dyLot = dyLotRef.current?.value.trim() ?? "";
      const noStyle = noStyleRef.current?.value.trim() ?? "";
      const cdFabricVal = cdFabricRef.current?.value.trim() ?? "";
      const nmFabricVal = nmFabricRef.current?.value.trim() ?? "";

      // 최소 하나는 입력되어야 검색
      if (!dyLot && !noStyle && !cdFabricVal && !nmFabricVal) {
        showAlert("At least one search condition is required");
        return;
      }

      const nextParams = {
        ...searchParams,
        dyLot,
        noStyle,
        cdFabric: cdFabricVal,
        nmFabric: nmFabricVal,
        pageNo: 1,
      };

      setSearchParams(nextParams);
      fetchFabricInfoList(nextParams);
    };

    const onFabricRowDoubleClick = (row: FabricInfoRes) => {
      setSearchParams((prev) => ({
        ...prev,
        nmFabric: row.nmFabric,
        cdFabric: row.cdFabric,
      }));
      if (onFabricSelect) {
        onFabricSelect(row);
      }
      setIsShowFabricPopup(false);
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
    const lastScrollTop = useRef(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (!target) return;

      // X 스크롤 무시
      if (target.scrollLeft !== 0) return;

      // Y축 실제 스크롤 이동이 없으면 무시
      if (target.scrollTop <= lastScrollTop.current) {
        lastScrollTop.current = target.scrollTop;
        return;
      }

      lastScrollTop.current = target.scrollTop;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = target;

        if (scrollHeight - scrollTop - clientHeight < 10) {
          setSearchParams((prev) => ({ ...prev, pageNo: prev.pageNo + 1 }));
        }
      }, 200);
    }, []);
    // 모달이 열릴 때 초기화: 모달이 열리면 pageSize를 1로 재설정하고 데이터를 불러옴
    useEffect(() => {
      if (isShowFabricPopup) {
        // 조건이 있을 때만 조회
        setSearchParams((prev) => ({ ...prev, pageNo: 1 }));
      } else {
        // 닫힐 때 초기화
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
        if (dyLotRef.current) dyLotRef.current.value = "";
        if (noStyleRef.current) noStyleRef.current.value = "";
        if (cdFabricRef.current) cdFabricRef.current.value = "";
        if (nmFabricRef.current) nmFabricRef.current.value = "";
      }
    }, [isShowFabricPopup]);

    useEffect(() => {
      if (!isShowFabricPopup) return; // 닫혀있으면 동작 X
      if (searchParams.pageNo > 1) {
        fetchFabricInfoList(searchParams);
      }
    }, [searchParams.pageNo]);
    const tableColumns = [
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
        width: 250,
        maxWidth: 1000,
      },
      {
        Header: t("COLOR"),
        accessor: "nmColor",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 60,
        width: 120,
        maxWidth: 1000,
      },
      {
        Header: t("FABRIC CODE"),
        accessor: "cdFabric",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 1000,
      },
      {
        Header: t("FABRIC NAME"),
        accessor: "nmFabric",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 250,
        maxWidth: 1000,
      },
      {
        Header: t("FAB INCH"),
        accessor: "widthInch",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 1000,
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
      {
        Header: t("SQM"),
        accessor: "ncode08",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 1000,
      },
      {
        Header: t("WIDTH"),
        accessor: "ncode13",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 100,
        width: 100,
        maxWidth: 1000,
      },
    ];

    return (
      <Modal show={isShowFabricPopup} onHide={onClose} size="xl" centered>
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
            {/* LOT 입력 */}
            <label className="modal-search-custom-label-class ms-1" style={{width: '100%'}}>{t("register.modal.dyLot")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              ref={dyLotRef}
              name="dyLot"
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* STYLE 입력 */}
            <label className="modal-search-custom-label-class ms-1" style={{width: '100%'}}>{t("register.modal.noStyle")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              ref={noStyleRef}
              name="noStyle"
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* CODE */}
            <label className="modal-search-custom-label-class ms-1" style={{width: '100%'}}>{t("register.modal.code")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              ref={cdFabricRef}
              name="cdFabric"
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* NAME */}
            <label className="modal-search-custom-label-class ms-1" style={{width: '100%'}}>{t("register.modal.name")}</label>
            <FormControl
              className="modal-search-custom-input-class text-center"
              type="text"
              ref={nmFabricRef}
              name="nmFabric"
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            {/* 조회 버튼 */}
            <ButtonComponent
              type="button"
              className="system-modal-search-button"
              iClassName="ti-search"
              txt={t("")}
              onClick={handleSearchPartner}
            />

            {/* 닫기 버튼 */}
            <ButtonComponent
              type="button"
              className="system-modal-search-button ms-1"
              iClassName="fe-x"
              txt={t("")}
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
            onRowDoubleClick={(row) => onFabricRowDoubleClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);
export default FabricPopupComponent;
