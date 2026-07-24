import React, { memo, useEffect, useState } from "react";
import { Button, Card, Row } from "react-bootstrap";

/* Component */
import SalesActivityRegisterTop from "./SalesActivityRegisterTop";
import SalesActivityRegisterLeft from "./SalesActivityRegisterLeft";
import SalesActivityRegisterRight from "./SalesActivityRegisterRight";
import UserPopupComponent from "../../../components/modal/UserPopupComponent";
import DeptPopupComponent from "../../../components/modal/DeptPopupComponent";
import BuyerPopupComponent from "../../../components/modal/BuyerPopupComponent";
import ItemPopupComponent from "../../../components/modal/ItemPopupComponent";
import BrandPopupComponent from "../../../components/modal/BrandPopupComponent";
import StylePopupComponent from "../../../components/modal/StylePopupComponent";
import CompanyPopupComponent from "../../../components/modal/CompanyPopupComponent";

/* Redux */
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { DeptListRes, PagingUserListRes, PartnerListRes } from "../../../redux/system/SystemUserSlice";
import {
  getSalesActivityAllList,
  SalesActivityAllListRes,
  SalesActivityAttendListRes,
  SalesActivityCostListRes,
  SalesActivityOrderListRes,
  SalesActivitySaveReq,
  SalesActivitySumListRes,
} from "../../../redux/sales/SalesActivitySlice";
import { isEmpty } from "../../../utils/CommonUtil";
import { Payload } from "../../../constants/common/common";

/* lb */
import Swal from "sweetalert2";
import { PisBrandListRes, PisBuyerListRes, PisItemListRes, PisStyleListRes } from "../../../redux/common/commonSlice";
import OurUserPopupComponent from "../../../components/modal/OurUserPopupComponent";

interface Props {
  selectedRow: SalesActivitySumListRes | null;
  checkedRow: SalesActivitySumListRes | null;
  isSalesActivitySelectRow: boolean;
  isSalesActivityCheckRow: boolean;
  isDisabled: boolean;
  salesActivitySaveReq: SalesActivitySaveReq;
  setSalesActivitySaveReq: React.Dispatch<React.SetStateAction<SalesActivitySaveReq>>;
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setPendingDeleteFiles: React.Dispatch<React.SetStateAction<string[]>>;
}
const SalesActivityRegister = memo(
  ({
    selectedRow,
    checkedRow,
    isSalesActivitySelectRow,
    isSalesActivityCheckRow,
    isDisabled,
    salesActivitySaveReq,
    setSalesActivitySaveReq,
    setPendingFiles,
    setPendingDeleteFiles,
  }: Props) => {
    /* 등록 화면에 들어왔을떄 Attend에 최소 한개 배열이 존재해야 함으로 실행되는 useEffect */
    useEffect(() => {
      // “신규 등록” 모드일 때만
      if (
        !isSalesActivitySelectRow &&
        !isSalesActivityCheckRow &&
        salesActivitySaveReq.saveActivityAttendList.length === 0
      ) {
        // 기본 1건을 넣어 준다
        setSalesActivitySaveReq((prev) => ({
          ...prev,
          saveActivityAttendList: [
            {
              ...defaultRows.attendee,
              seqAttend: 1,
            },
          ],
        }));
      }
    }, []);

    const dispatch = useDispatch<AppDispatch>();

    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    const getFormattedToday = () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
      const dd = String(today.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    };

    const [isVisible, setIsVisible] = useState(true); // <> 조절
    const [isShowDeptPopup, setIsShowDeptPopup] = useState(false); //부서 팝업
    const [isShowUserPopup, setIsShowUserPopup] = useState(false); //담당자 팝업
    const [isShowOurUserPopup, setIsShowOurUserPopup] = useState(false); //당사 팝업
    const [isShowCompanyPopup, setIsShowCompanyPopup] = useState(false); //회사 팝업
    const [isShowStylePopup, setIsShowStylePopup] = useState(false); //Style 팝업
    const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false); //Buyer 팝업
    const [isShowBrandPopup, setIsShowBrandPopup] = useState(false); //Brand 팝업
    const [isShowItemPopup, setIsShowItemPopup] = useState(false); //Item 팝업

    const [selectedItems, setSelectedItems] = useState({
      attendee: true,
      purpose: true,
      mainIssue: true,
      futurePlans: true,
      followUp: true,
      order: true,
      expense: true,
      isAllCheck: true,
    });

    /* 각 API 관리 */
    const [salesActivityAll, setSalesActivityAll] = useState<SalesActivityAllListRes | null>({
      activityList: [],
      activityAttendList: [],
      activityContentsList: [],
      activityCostList: [],
      activityFileList: [],
      activityOrderList: [],
    });
    const defaultRows = {
      order: {
        cdCompany: user?.companyId || "1000",
        noDocu: "",
        seqDocu: "",
        seqOrder: 0, // 추후 추가 시 길이에 맞게 증가
        cdBuyer: "",
        nmBuyer: "",
        cdBrand: "",
        nmBrand: "",
        cdItem: "",
        nmItem: "",
        seqStyle: 0,
        noStyle: "",
        quantity: 0,
        amount: 0,
        ynFlag: "",
        remarks: "",
      },
      attendee: {
        cdCompany: user?.companyId || "1000",
        noDocu: "",
        seqDocu: "",
        seqAttend: 1, // 추후 추가 시 길이에 맞게 증가
        noEmp: user?.userId || "",
        nmEmp: user?.userNm || "",
        cdDept: user?.deptId || "",
        nmDept: user?.deptNm || "",
        empVendor: "",
        deptVendor: "",
        positionVendor: "",
        telNoVendor: "",
        nmVendor: "",
        ynFlag: "",
        remarks: "",
      },
      cost: {
        cdCompany: user?.companyId || "1000",
        noDocu: "",
        seqDocu: "",
        seqCost: 0, // 추후 추가 시 길이에 맞게 증가
        cdCost: "01",
        nmCost: "",
        amtCost: 0,
        ynFlag: "",
        remarks: "",
      },
    };
    // SaveSalesActivityListReq 타입에 맞는 기본값 객체를 정의.
    const defaultSaveSalesActivityList: SalesActivitySaveReq["saveActivityList"][0] = {
      cdCompany: user?.companyId || "1000",
      noDocuSeq: "",
      noDocu: "",
      seqDocu: "",
      levDocu: isSalesActivitySelectRow || isSalesActivityCheckRow ? selectedRow?.levDocu || checkedRow?.levDocu : 1,
      dtMeeting: "",
      dtInput: isSalesActivitySelectRow || isSalesActivityCheckRow ? "" : getFormattedToday(),
      cdWork: "",
      cdDetail: "",
      cdActivity: "0001",
      nmWork: "",
      nmDetail: "",
      nmActivity: "",
      purpose: "",
      keywords: "",
      levShare: "11",
      agenda: "",
      results: "",
      progress: "",
      gwStatus: "P",
      dtApproval: "",
      nmApproval: "",
      noEmp: user?.userId || "",
      nmEmp: user?.userNm || "",
      cdDept: user?.deptId || "",
      nmDept: user?.deptNm || "",
      contents: "",
      ynFlag: "",
      idInsert: user?.userId || "",
      dtInsert: "",
      idUpdate: user?.userId || "",
      dtUpdate: "",
    };
    // 현재 팝업을 열 때 선택할 주문 행의 인덱스를 저장
    const [currentOrderRowIndex, setCurrentOrderRowIndex] = useState<number>(0);
    const [currentAttendRowIndex, setCurrentAttendRowIndex] = useState<number>(0);

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

    /* 영업 활동 단건 조회 */
    const fetchSalesActivityAllList = (row: SalesActivitySumListRes | null) => {
      if (!row) return;

      const params = {
        cdCompany: row.cdCompany || "",
        noDocu: row.noDocu || "",
        seqDocu: row.seqDocu || "",
      };

      dispatch(getSalesActivityAllList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          const data = payload.data as SalesActivityAllListRes;

          // activityList 에 contents 주입
          const listWithContents = data.activityList.map((item) => {
            // 동일 seqDocu 의 contents 객체 찾기
            const contentObj = data.activityContentsList.find((c) => c.seqDocu === item.seqDocu);
            return {
              ...item,
              noDocuSeq: isSalesActivityCheckRow ? `${item.noDocu}-${item.seqDocu}` : "",
              contents: contentObj?.contents || "",
              gwStatus: row?.gwStatus || "",
            };
          });

          setSalesActivityAll(data);
          setSalesActivitySaveReq({
            saveActivityList: listWithContents,
            saveActivityOrderList: data.activityOrderList.map((r) => ({ ...r, ynFlag: "" })),
            saveActivityFileList: data.activityFileList.map((f) => ({
              ...f,
              ynFlag: "",
            })),
            saveActivityAttendList: data.activityAttendList.map((r) => ({ ...r, ynFlag: "" })),
            saveActivityCostList: data.activityCostList.map((r) => ({ ...r, ynFlag: "" })),
            saveActivityContentsList: data.activityContentsList,
          });
        } else {
          setSalesActivityAll(null);
        }
      });
    };
    // 테이블 종류에 따라 updateData 함수를 만들어 반환하는 고차 함수
    const updateRowData = (table: "order" | "attendee" | "cost") => {
      // 각 테이블에 해당하는 상태 키 결정
      const key =
        table === "order"
          ? "saveActivityOrderList"
          : table === "attendee"
          ? "saveActivityAttendList"
          : "saveActivityCostList";

      return (rowIndex: number, columnId: string, value: string) => {
        setSalesActivitySaveReq((prev) => ({
          ...prev,
          [key]: prev[key].map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row)),
        }));
      };
    };

    // addRow: 기존 값을 그대로 유지하고, 해당 타입의 새 행만 추가
    const addRow = (tableName: "order" | "attendee" | "cost") => {
      if (!salesActivityAll || !salesActivitySaveReq || !setSalesActivitySaveReq) return;

      if (tableName === "order") {
        // 함수형 업데이트를 사용하여 최신 상태를 기반으로 새 행 추가
        setSalesActivitySaveReq((prev) => {
          const newRow: SalesActivityOrderListRes = {
            ...defaultRows.order,
            // seqOrder는 기존 길이+1 (여기서는 단순한 고유번호 용도로 사용)
            seqOrder: prev.saveActivityOrderList.length + 1,
          };
          const newOrderList = [...prev.saveActivityOrderList, newRow];

          // 배열 인덱스는 newOrderList.length - 1 (마지막 행의 인덱스)
          setCurrentOrderRowIndex(newOrderList.length - 1);

          return {
            ...prev,
            saveActivityOrderList: newOrderList,
          };
        });

        setSalesActivityAll((prevAll) => {
          if (!prevAll) {
            return {
              activityList: [],
              activityAttendList: [],
              activityContentsList: [],
              activityCostList: [],
              activityFileList: [],
              activityOrderList: [],
            };
          }
          const newRow: SalesActivityOrderListRes = {
            ...defaultRows.order,
            seqOrder: prevAll.activityOrderList.length + 1,
          };
          return {
            ...prevAll,
            activityOrderList: [...prevAll.activityOrderList, newRow],
          };
        });
      } else if (tableName === "attendee") {
        const newRow: SalesActivityAttendListRes = {
          ...defaultRows.attendee,
          seqAttend: salesActivityAll.activityAttendList.length + 1,
        };
        setSalesActivitySaveReq((prev) => ({
          ...prev,
          saveActivityAttendList: [...prev.saveActivityAttendList, newRow],
        }));
        setSalesActivityAll({
          ...salesActivityAll,
          activityAttendList: [...salesActivityAll.activityAttendList, newRow],
        });
        setCurrentAttendRowIndex(salesActivityAll.activityAttendList.length);
      } else if (tableName === "cost") {
        const newRow: SalesActivityCostListRes = {
          ...defaultRows.cost,
          seqCost: salesActivityAll.activityCostList.length + 1,
        };
        setSalesActivitySaveReq((prev) => ({
          ...prev,
          saveActivityCostList: [...prev.saveActivityCostList, newRow],
        }));
        setSalesActivityAll({
          ...salesActivityAll,
          activityCostList: [...salesActivityAll.activityCostList, newRow],
        });
      }
    };

    const removeRow = (tableName: "order" | "attendee" | "cost") => {
      if (!salesActivitySaveReq) return;
      if (tableName === "attendee") {
        // ynFlag !== 'D' 인 실제 남은 참석자 수
        const activeAttendees = salesActivitySaveReq.saveActivityAttendList.filter((r) => r.ynFlag !== "D");
        if (activeAttendees.length <= 1) {
          showAlert("참석자는 최소 한 명 이상이어야 합니다."); // Swal으로 알림
          return; // 삭제 로직 실행 안 함
        }
      }
      setSalesActivitySaveReq((prev) => {
        const key =
          tableName === "order"
            ? "saveActivityOrderList"
            : tableName === "attendee"
            ? "saveActivityAttendList"
            : "saveActivityCostList";

        const list = prev[key];
        // 삭제 대상인 마지막 실제 행의 인덱스 찾아야함(ynFlag !== 'D')
        let lastUnflagged = -1;
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].ynFlag !== "D") {
            lastUnflagged = i;
            break;
          }
        }
        if (lastUnflagged < 0) return prev;

        const target = list[lastUnflagged] as any;
        // 새로 추가된 행(noDocu, seqDocu 비었으면 새 행)
        const isNew = !target.noDocu?.trim() || !target.seqDocu?.trim();

        // 새 행이면 물리 삭제(slice),기존 데이터면 ynFlag = 'D'로 표시만
        let newList;
        if (isNew) {
          // slice를 이용해 특정 인덱스만 제거
          newList = [...list.slice(0, lastUnflagged), ...list.slice(lastUnflagged + 1)];
        } else {
          newList = list.map((row, idx) => (idx === lastUnflagged ? { ...row, ynFlag: "D" } : row));
        }

        return {
          ...prev,
          [key]: newList,
        };
      });
    };
    // 상담일자 input의 값 변경 시 호출되는 함수
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value; // "YYYY-MM-DD" 형식
      if (salesActivitySaveReq) {
        let updatedList = salesActivitySaveReq.saveActivityList;
        // 만약 배열이 비어있다면 기본 객체 추가 .
        if (updatedList.length === 0) {
          updatedList = [{ ...defaultSaveSalesActivityList }];
        }
        // 첫 번째 요소의 dtMeeting을 업데이트
        updatedList = updatedList.map((activity, index) =>
          index === 0 ? { ...activity, dtMeeting: newDate.replace(/-/g, "") } : activity
        );
        setSalesActivitySaveReq({
          ...salesActivitySaveReq,
          saveActivityList: updatedList,
        });
      }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (salesActivitySaveReq) {
        let updatedList = salesActivitySaveReq.saveActivityList;
        if (updatedList.length === 0) {
          updatedList = [{ ...defaultSaveSalesActivityList, [name]: value }];
        } else {
          updatedList = updatedList.map((activity, index) => (index === 0 ? { ...activity, [name]: value } : activity));
        }
        setSalesActivitySaveReq({
          ...salesActivitySaveReq,
          saveActivityList: updatedList,
        });
      }
    };

    // 입력 필드 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (salesActivitySaveReq) {
        let updatedList = salesActivitySaveReq.saveActivityList;
        if (updatedList.length === 0) {
          // 배열이 비어 있다면 기본 객체를 추가 후 업데이트
          updatedList = [{ ...defaultSaveSalesActivityList, [name]: value }];
        } else {
          updatedList = updatedList.map((activity, index) => (index === 0 ? { ...activity, [name]: value } : activity));
        }
        setSalesActivitySaveReq({
          ...salesActivitySaveReq,
          saveActivityList: updatedList,
        });
      }
    };

    // 부서 모달 선택 시: 배열의 첫 번째 요소에 cdDept와 nmDept 값을 업데이트
    const handleDeptSelect = (dept: DeptListRes) => {
      setSalesActivitySaveReq((prev) => {
        // 배열에 요소가 이미 있다면 첫 번째 요소 업데이트, 없으면 새로운 요소 생성
        if (prev.saveActivityList.length > 0) {
          const updatedFirst = {
            ...prev.saveActivityList[0],
            cdDept: dept.cdDept,
            nmDept: dept.nmDept,
          };
          return {
            ...prev,
            saveActivityList: [updatedFirst, ...prev.saveActivityList.slice(1)],
          };
        } else {
          return {
            ...prev,
            saveActivityList: [
              {
                ...defaultSaveSalesActivityList,
                cdDept: dept.cdDept,
                nmDept: dept.nmDept,
              },
            ],
          };
        }
      });
    };

    // 유저 모달에서 유저 정보를 가져오기 위함. (상단 탑 담당자 모달)
    const handleUserSelect = (user: PagingUserListRes) => {
      setSalesActivitySaveReq((prev) => {
        // 배열에 요소가 이미 있다면 첫 번째 요소 업데이트, 없으면 새로운 요소 생성
        if (prev.saveActivityList.length > 0) {
          const updatedFirst = {
            ...prev.saveActivityList[0],
            noEmp: user.noEmp,
            nmEmp: user.userNm,
            cdDept: user.cdDept,
            nmDept: user.nmDept,
          };
          return {
            ...prev,
            saveActivityList: [updatedFirst, ...prev.saveActivityList.slice(1)],
          };
        } else {
          return {
            ...prev,
            saveActivityList: [
              {
                ...defaultSaveSalesActivityList,
                noEmp: user.noEmp,
                nmEmp: user.userNm,
                cdDept: user.cdDept,
                nmDept: user.nmDept,
              },
            ],
          };
        }
      });
    };

    // 주문 행 업데이트를 위한 공통 헬퍼 함수
    const updateOrderRow = (rowIndex: number, changes: Partial<SalesActivityOrderListRes>) => {
      setSalesActivitySaveReq((prev) => ({
        ...prev,
        saveActivityOrderList: prev.saveActivityOrderList.map((row, index) =>
          rowIndex === index ? { ...row, ...changes } : row
        ),
      }));
    };

    // Attend 행 업데이트를 위한 공통 헬퍼 함수
    const updateAttendRow = (rowIndex: number, changes: Partial<SalesActivityAttendListRes>) => {
      setSalesActivitySaveReq((prev) => ({
        ...prev,
        saveActivityAttendList: prev.saveActivityAttendList.map((row, index) =>
          index === rowIndex ? { ...row, ...changes } : row
        ),
      }));
    };

    // 품목 선택 핸들러
    const handleItemSelect = (rowIndex: number, item: PisItemListRes) => {
      updateOrderRow(rowIndex, {
        cdItem: item.cdItem,
        nmItem: item.nmItem,
        seqStyle: 0,
        noStyle: "",
        cdBuyer: "",
        nmBuyer: "",
        cdBrand: "",
        nmBrand: "",
        amount: 0,
        quantity: 0,
      });
    };

    // 당사 선택 핸들러
    const handleOurUserSelect = (rowIndex: number, item: PagingUserListRes) => {
      updateAttendRow(rowIndex, {
        noEmp: item.noEmp,
        nmEmp: item.userNm,
        cdDept: item.cdDept,
        empVendor: item.nmDept,
      });
    };

    // 회사 선택 핸들러
    const handleCompanySelect = (rowIndex: number, item: PartnerListRes) => {
      updateAttendRow(rowIndex, {
        nmVendor: item.lnPartner,
      });
    };
    // 스타일 선택 핸들러
    const handleStyleSelect = (rowIndex: number, item: PisStyleListRes) => {
      updateOrderRow(rowIndex, {
        seqStyle: item.seqStyle,
        noStyle: item.noStyle,
        cdBuyer: item.cdBuyer,
        nmBuyer: item.nmBuyer,
        cdBrand: item.cdBrand,
        nmBrand: item.nmBrand,
        cdItem: item.cdItem,
        nmItem: item.nmItem,
        amount: item.amOrd,
        quantity: item.qtOrd,
      });
    };

    // 브랜드 선택 핸들러
    const handleBrandSelect = (rowIndex: number, item: PisBrandListRes) => {
      updateOrderRow(rowIndex, {
        cdBrand: item.cdBrand,
        nmBrand: item.nmBrand,
        cdBuyer: item.cdBuyer,
        nmBuyer: item.nmBuyer,
        seqStyle: 0,
        noStyle: "",
        amount: 0,
        quantity: 0,
      });
    };

    // 바이어 선택 핸들러
    const handleBuyerSelect = (rowIndex: number, item: PisBuyerListRes) => {
      updateOrderRow(rowIndex, {
        cdBuyer: item.cdBuyer,
        nmBuyer: item.nmBuyer,
        cdBrand: "",
        nmBrand: "",
        seqStyle: 0,
        noStyle: "",
        amount: 0,
        quantity: 0,
      });
    };
    /* 신규 버튼이 아니면은 API 호출. */
    useEffect(() => {
      if (isSalesActivityCheckRow && checkedRow) {
        fetchSalesActivityAllList(checkedRow);
      } else if (isSalesActivitySelectRow && selectedRow) {
        fetchSalesActivityAllList(selectedRow);
      }
    }, [isSalesActivityCheckRow, isSalesActivitySelectRow, selectedRow, checkedRow]);

    // order 제외한 나머지 checkBox가 false일떄 실행되는 이벤트 ( SalesActivityPlus)
    useEffect(() => {
      const { order, ...rest } = selectedItems; // order 제외한 나머지 필드만 추출

      if (Object.values(rest).every((value) => !value)) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }, [selectedItems]);
    return (
      <>
        <div className="container-fluid p-0">
          {/* 상단 컴포넌트 */}
          <SalesActivityRegisterTop
            setIsShowUserPopup={setIsShowUserPopup}
            setIsShowDeptPopup={setIsShowDeptPopup}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isDisabled={isDisabled}
            handleDateChange={handleDateChange}
            handleSelectChange={handleSelectChange}
            handleInputChange={handleInputChange}
            salesActivitySaveReq={salesActivitySaveReq}
            setSalesActivitySaveReq={setSalesActivitySaveReq}
          />
          <Card className={"sales-activity-table-top"}>
            <Card.Body>
              <Row className="gx-3 align-items-stretch d-flex flex-wrap" style={{ transform: "translateY(-15px)" }}>
                {isVisible && (
                  <div className="d-flex justify-content-between align-items-center mb-1 position-relative">
                    {/* ◀ ▶ 버튼 */}
                    <div className="d-flex align-items-center gap-1">
                      <Button variant="light" onClick={() => setIsVisible(false)} style={{ fontSize: "10px" }}>
                        <i className="mdi mdi-chevron-left font-16"></i>
                      </Button>
                      <Button variant="light" onClick={() => setIsVisible(true)} style={{ fontSize: "10px" }}>
                        <i className="mdi mdi-chevron-right font-16"></i>
                      </Button>
                    </div>
                    <div className="d-flex align-items-center gap-1" style={{ marginRight: "42%" }}>
                      {!isDisabled && selectedItems.attendee ? (
                        <>
                          <Button variant="light" onClick={() => addRow("attendee")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-plus font-16"></i>
                          </Button>
                          <Button variant="light" onClick={() => removeRow("attendee")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-minus font-16"></i>
                          </Button>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      {!isDisabled && selectedItems.order ? (
                        <>
                          <Button variant="light" onClick={() => addRow("order")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-plus font-16"></i>
                          </Button>
                          <Button variant="light" onClick={() => removeRow("order")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-minus font-16"></i>
                          </Button>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                )}
                {/* 좌측 컴포넌트 */}
                <SalesActivityRegisterLeft
                  isVisible={isVisible}
                  setIsVisible={setIsVisible}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setIsShowOurUserPopup={setIsShowOurUserPopup}
                  setIsShowCompanyPopup={setIsShowCompanyPopup}
                  isDisabled={isDisabled}
                  updateDataAttendee={updateRowData("attendee")}
                  updateDataCost={updateRowData("cost")}
                  addRow={addRow}
                  removeRow={removeRow}
                  handleInputChange={handleInputChange}
                  salesActivitySaveReq={salesActivitySaveReq}
                  setSalesActivitySaveReq={setSalesActivitySaveReq}
                  setCurrentAttendRowIndex={setCurrentAttendRowIndex}
                />
                {/* 우측 컴포넌트 */}
                <SalesActivityRegisterRight
                  salesActivityAll={salesActivityAll}
                  isVisible={isVisible}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setIsShowStylePopup={setIsShowStylePopup}
                  setIsShowBuyerPopup={setIsShowBuyerPopup}
                  setIsShowBrandPopup={setIsShowBrandPopup}
                  setIsShowItemPopup={setIsShowItemPopup}
                  isDisabled={isDisabled}
                  updateDataOrder={updateRowData("order")}
                  salesActivitySaveReq={salesActivitySaveReq}
                  setSalesActivitySaveReq={setSalesActivitySaveReq}
                  setPendingFiles={setPendingFiles}
                  setPendingDeleteFiles={setPendingDeleteFiles}
                  setCurrentOrderRowIndex={setCurrentOrderRowIndex}
                />
              </Row>
            </Card.Body>
          </Card>
        </div>
        {/* 담당자 팝업 */}
        <UserPopupComponent
          cdDept={""}
          nmDept={""}
          isShowUserPopup={isShowUserPopup}
          setIsShowUserPopup={setIsShowUserPopup}
          onClose={() => setIsShowUserPopup(false)}
          onUserSelect={handleUserSelect}
        />
        {/* 당사 팝업 */}
        <OurUserPopupComponent
          cdDept={""}
          nmDept={""}
          isShowOurUserPopup={isShowOurUserPopup}
          setIsShowOurUserPopup={setIsShowOurUserPopup}
          onClose={() => setIsShowOurUserPopup(false)}
          onOurUserSelect={handleOurUserSelect}
          currentAttendRowIndex={currentAttendRowIndex}
          setCurrentAttendRowIndex={setCurrentAttendRowIndex}
        />
        {/* 회사 팝업 */}
        <CompanyPopupComponent
          isShowCompanyPopup={isShowCompanyPopup}
          setIsShowCompanyPopup={setIsShowCompanyPopup}
          onClose={() => setIsShowCompanyPopup(false)}
          onCompanySelect={handleCompanySelect}
          currentAttendRowIndex={currentAttendRowIndex}
          setCurrentAttendRowIndex={setCurrentAttendRowIndex}
        />
        {/* 부서 팝업 */}
        <DeptPopupComponent
          isShowDeptPopup={isShowDeptPopup}
          setIsShowDeptPopup={setIsShowDeptPopup}
          onClose={() => setIsShowDeptPopup(false)}
          onDeptSelect={handleDeptSelect}
        />
        {/* 바이어 팝업 */}
        <BuyerPopupComponent
          isShowBuyerPopup={isShowBuyerPopup}
          setIsShowBuyerPopup={setIsShowBuyerPopup}
          onClose={() => setIsShowBuyerPopup(false)}
          onBuyerSelect={handleBuyerSelect}
          currentOrderRowIndex={currentOrderRowIndex}
          setCurrentOrderRowIndex={setCurrentOrderRowIndex}
        />
        {/* 브랜드 팝업 */}
        <BrandPopupComponent
          isShowBrandPopup={isShowBrandPopup}
          setIsShowBrandPopup={setIsShowBrandPopup}
          onClose={() => setIsShowBrandPopup(false)}
          onBrandSelect={handleBrandSelect}
          currentOrderRowIndex={currentOrderRowIndex}
          setCurrentOrderRowIndex={setCurrentOrderRowIndex}
        />
        {/* 스타일 팝업 */}
        <StylePopupComponent
          isShowStylePopup={isShowStylePopup}
          setIsShowStylePopup={setIsShowStylePopup}
          onClose={() => setIsShowStylePopup(false)}
          onStyleSelect={handleStyleSelect}
          currentOrderRowIndex={currentOrderRowIndex}
          setCurrentOrderRowIndex={setCurrentOrderRowIndex}
        />
        {/* 아이템 팝업 */}
        <ItemPopupComponent
          isShowItemPopup={isShowItemPopup}
          setIsShowItemPopup={setIsShowItemPopup}
          onClose={() => setIsShowItemPopup(false)}
          onItemSelect={handleItemSelect}
          currentOrderRowIndex={currentOrderRowIndex}
          setCurrentOrderRowIndex={setCurrentOrderRowIndex}
        />
      </>
    );
  }
);

export default SalesActivityRegister;
