import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { FormControl, Modal, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
/* Redux */
import { getPagingUserList, PagingUserListRes } from "../../redux/system/SystemUserSlice";
import { AppDispatch, RootState } from "../../redux/store";

/* Component */
import ButtonComponent from "../common/ButtonComponent";
import IconComponent from "../common/IconComponent";
import PisTable from "../table/PisTable";

/* constant */
import { Payload } from "../../constants/common/common";

/* Util */
import { isEmpty } from "../../utils/CommonUtil";

interface Props {
  isShowUserPopup?: boolean;
  setIsShowUserPopup: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onUserSelect?: (row: PagingUserListRes) => void;
  cdDept: string;
  nmDept: string;
}

const UserPopupComponent = memo(
  ({ isShowUserPopup, setIsShowUserPopup, onClose, onUserSelect, cdDept, nmDept }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    const [pagingUserList, setPagingUserList] = useState<PagingUserListRes[]>([]);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [searchParams, setSearchParams] = useState({
      userId: "",
      userNm: "",
      pageNo: 1,
      pageCount: 50,
      dtsDate: "",
      guestYn: "",
      useYn: "Y",
      deptId: cdDept,
    });

    const { systemProgram } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
    }));

    // API 호출: 검색 조건에 따라 처리 (검색 모드와 무한스크롤 모드 구분)
    const fetchPagingUserList = (params = searchParams) => {
      dispatch(getPagingUserList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          // 검색 조건이 있다면(검색 모드) 전체 결과를 받아와서 리스트를 교체
          if (params.userId.trim() !== "" || params.userNm.trim() !== "") {
            setPagingUserList(payload.data);
          } else {
            // 무한 스크롤 모드: pageNo가 1이면 초기화, 아니라면 기존 리스트에 추가
            if (params.pageNo === 1) {
              setPagingUserList(payload.data);
            } else {
              setPagingUserList((prev) => [...prev, ...payload.data]);
            }
          }
        } else {
          // pageNo가 1이면 데이터가 없으므로 리스트를 초기화
          if (params.pageNo === 1) {
            setPagingUserList([]);
          }
        }
      });
    };

    // 모달이 열릴 때 초기화: 모달이 열리면 pageNo를 1로 재설정하고 데이터를 불러옴
    useEffect(() => {
      if (isShowUserPopup) {
        setSearchParams((prev) => ({ ...prev, pageNo: 1 }));
        fetchPagingUserList({ ...searchParams, pageNo: 1 });
      } else {
        setSearchParams({
          userId: "",
          userNm: "",
          pageNo: 1,
          pageCount: 50,
          dtsDate: "",
          guestYn: "",
          useYn: "Y",
          deptId: cdDept,
        });
        setPagingUserList([]);
      }
    }, [isShowUserPopup, nmDept, cdDept]);

    // 무한 스크롤 모드: pageNo가 변경되면 추가 데이터를 불러옴 (검색 조건이 없을 때만)
    useEffect(() => {
      if (
        isShowUserPopup &&
        searchParams.userId.trim() === "" &&
        searchParams.userNm.trim() === "" &&
        searchParams.pageNo > 1
      ) {
        fetchPagingUserList(searchParams);
      }
    }, [searchParams.pageNo]);

    // 검색 버튼 클릭: 검색 조건이 있는 경우 전체 결과 조회 (pageNo 1)
    const handleSearchUser = () => {
      setSearchParams((prev) => ({ ...prev, pageNo: 1 }));
      fetchPagingUserList({ ...searchParams, pageNo: 1 });
    };

    const onUserRowDoubleClick = (row: PagingUserListRes) => {
      setSearchParams((prev) => ({
        ...prev,
        userId: row.userNm,
        userNm: row.userId,
      }));
      if (onUserSelect) {
        onUserSelect(row);
      }
      setIsShowUserPopup(false);
    };

    // 재직 상태 선택 핸들러
    const handleUserStatusChange = (value: string) => {
      setSearchParams((prevParams) => ({
        ...prevParams,
        useYn: value,
      }));
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
          handleSearchUser();
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
        accessor: "userNm",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 120,
        width: 150,
        maxWidth: 180,
      },
      {
        Header: t("register.form.nmBizarea"),
        accessor: "nmBizarea",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 200,
      },
      {
        Header: t("register.form.guestNmDept"),
        accessor: "nmDept",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 150,
        width: 150,
        maxWidth: 200,
      },
      {
        Header: t("register.search.employmentStatus"),
        accessor: "useNm",
        Cell: ({ value }: { value: any }) => <span>{value}</span>,
        sort: true,
        minWidth: 120,
        width: 150,
        maxWidth: 180,
      },
    ];

    return (
      <Modal show={isShowUserPopup} onHide={onClose} size="lg" centered>
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
          <Modal.Title className="modal-search-custom-title-class">{t("register.modal.employmentTitle")}</Modal.Title>
        </Modal.Header>
        {/* 검색 영역 */}
        <Row className="gx-3 px-2 d-flex align-items-center">
          <div className="d-flex align-items-center mb-3">
            <label className="modal-user-search-custom-label-class">{t("register.modal.employee")}</label>
            <FormControl
              className={"modal-user-search-custom"}
              type="text"
              value={searchParams.userId || ""}
              name="userId"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            <label className="modal-user-search-custom-label-class ms-1">{t("사원명")}</label>
            <FormControl
              className={"modal-user-search-custom"}
              type="text"
              value={searchParams.userNm || ""}
              name="userNm"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            <div
              className="d-flex align-items-center"
              style={{ fontSize: "13px", transform: "translateX(12px)", marginTop: "16px" }}
            >
              <label className="me-2">
                <input
                  style={{ marginRight: "3px" }}
                  type="radio"
                  name="useYn"
                  value=""
                  checked={searchParams.useYn === ""}
                  onChange={(e) => handleUserStatusChange(e.target.value)}
                />
                전체
              </label>
              <label className="me-2">
                <input
                  style={{ marginRight: "3px" }}
                  type="radio"
                  name="useYn"
                  value="Y"
                  checked={searchParams.useYn === "Y"}
                  onChange={(e) => handleUserStatusChange(e.target.value)}
                />
                재직중
              </label>
              <label>
                <input
                  style={{ marginRight: "3px" }}
                  type="radio"
                  name="useYn"
                  value="N"
                  checked={searchParams.useYn === "N"}
                  onChange={(e) => handleUserStatusChange(e.target.value)}
                />
                퇴사자
              </label>
            </div>
            <ButtonComponent
              type="button"
              className="modal-user-search-custom-button"
              iClassName="ti-search"
              txt={t("common.search.btn")}
              onClick={handleSearchUser}
            />
            <ButtonComponent
              type="button"
              className="modal-user-search-custom-button ms-1"
              iClassName="fe-x"
              txt={t("common.close.btn")}
              onClick={onClose}
            />
          </div>
        </Row>
        <div className="system-modal-total-count px-2">
          <span className="bold-text">
            Count {pagingUserList?.length || 0} of {pagingUserList[0]?.totalCount || 0}
          </span>
        </div>
        {/* onScroll만 컨테이너에 적용합니다. */}
        <div className="modal-table-container gx-3 px-2">
          <PisTable
            columns={tableColumns}
            data={pagingUserList || []}
            theadClass="table-custom-system-user-light text-center font-12"
            tableClass="table-custom-system-user-background text-center font-12"
            pageSize={20}
            isSortable={true}
            onRowDoubleClick={(row) => onUserRowDoubleClick(row.original)}
            onClose={onClose}
            onScroll={handleScroll}
          />
        </div>
        <Modal.Footer />
      </Modal>
    );
  }
);

export default UserPopupComponent;
