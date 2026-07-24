import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from "react";
import { Button, Col, FormControl } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/*component */
import PisSalesTable from "../../../components/table/PisSalesTable";
import { SalesAttendTableColumns } from "./SalesAttendTableColumns";
import { SalesCostTableColumns } from "./SalesCostTableColumns";
import { SalesActivitySaveReq } from "../../../redux/sales/SalesActivitySlice";

/* redux */
/* lb */
import DOMPurify from "dompurify";
import { CommonPisCodeDetailRes, getCommonCodeDetailList } from "../../../redux/common/commonSlice";
import { Payload } from "../../../constants/common/common";
import { isEmpty } from "../../../utils/CommonUtil";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
interface Props {
  selectedItems: {
    attendee: boolean;
    purpose: boolean;
    mainIssue: boolean;
    futurePlans: boolean;
    followUp: boolean;
    order: boolean;
    expense: boolean;
    isAllCheck: boolean;
  };
  setSelectedItems: React.Dispatch<
    React.SetStateAction<{
      attendee: boolean;
      purpose: boolean;
      mainIssue: boolean;
      futurePlans: boolean;
      followUp: boolean;
      order: boolean;
      expense: boolean;
      isAllCheck: boolean;
    }>
  >;
  isVisible?: boolean;
  isDisabled?: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  addRow: (tableName: "order" | "attendee" | "cost") => void;
  removeRow: (tableName: "order" | "attendee" | "cost") => void;
  setIsShowOurUserPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowCompanyPopup?: Dispatch<SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  salesActivitySaveReq?: SalesActivitySaveReq | null;
  setSalesActivitySaveReq?: React.Dispatch<React.SetStateAction<SalesActivitySaveReq>>;
  updateDataAttendee?: (rowIndex: number, columnId: string, value: string) => void;
  updateDataCost?: (rowIndex: number, columnId: string, value: string) => void;
  setCurrentAttendRowIndex: React.Dispatch<React.SetStateAction<number>>;
}

const SalesActivityRegisterLeft = memo(
  ({
    selectedItems,
    isVisible,
    setIsVisible,
    isDisabled,
    addRow,
    removeRow,
    setIsShowOurUserPopup,
    setIsShowCompanyPopup,
    handleInputChange,
    salesActivitySaveReq,
    setSalesActivitySaveReq,
    updateDataAttendee = () => {}, // 기본 함수를 제공하여 undefined 방지
    updateDataCost = () => {}, // 기본 함수를 제공하여 undefined 방지
    setCurrentAttendRowIndex,
  }: Props) => {
    const { t } = useTranslation();

    const convertBrToNewline = (htmlString: any) => {
      // DOMPurify를 사용해 HTML 정화 후, <br> 태그를 newline 문자로 변환
      const cleanHtml = DOMPurify.sanitize(htmlString);
      return cleanHtml.replace(/<br\s*\/?>/gi, "\n");
    };

    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    const [costTypeList, setCostTypeList] = useState<CommonPisCodeDetailRes[]>([]);

    const [searchCostTypeParams, setSearchCostTypeParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "SP0004",
      cdSysdef: "",
      cdFlag1: "",
    });

    const fetchCostTypeList = () => {
      dispatch(getCommonCodeDetailList({ ...searchCostTypeParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setCostTypeList(payload.data);
        } else {
          setCostTypeList([]);
        }
      });
    };

    useEffect(() => {
      fetchCostTypeList();
    }, []);
    const updateDataCosts = (rowIndex: number, columnId: string, value: string) => {
      if (setSalesActivitySaveReq) {
        setSalesActivitySaveReq((prev) => {
          // 기존 비용 데이터 배열 복사
          const newCostList = prev.saveActivityCostList.map((row, index) => {
            if (index === rowIndex) {
              // 먼저 해당 열(column)만 업데이트
              let updatedRow = { ...row, [columnId]: value };
              // 만약 업데이트하는 컬럼이 cdCost라면 nmCost도 같이 업데이트
              if (columnId === "cdCost" && value) {
                // costTypeList에서 해당 값(cdSysdef)이 일치하는 옵션 찾기
                const matchedOption = costTypeList.find((opt) => opt.cdSysdef === value);
                if (matchedOption) {
                  updatedRow = { ...updatedRow, nmCost: matchedOption.nmSysdef };
                } else {
                  updatedRow = { ...updatedRow, nmCost: "" };
                }
              }
              return updatedRow;
            }
            return row;
          });
          return { ...prev, saveActivityCostList: newCostList };
        });
      }
    };
    return (
      <>
        {isVisible && (
          <Col xs={12} sm={12} md={4} lg={4} className="d-flex flex-column">
            <div className="card flex-grow-1 card-gray-border">
              <div className="sales-table-container">
                {selectedItems.attendee && (
                  <PisSalesTable
                    columns={SalesAttendTableColumns()}
                    data={
                      (salesActivitySaveReq?.saveActivityAttendList || []).filter((r) => r.ynFlag !== "D") // ← D가 아닌 항목만 보여줌
                    }
                    updateData={updateDataAttendee} // attendee 테이블 업데이트 함수 사용
                    theadClass="table-custom-sales-light text-center font-12"
                    tableClass="table-custom-sales-background text-center font-12"
                    isSortable={true} // 정렬 기능 활성화
                    isDisabled={isDisabled}
                    setIsShowOurUserPopup={setIsShowOurUserPopup}
                    setIsShowCompanyPopup={setIsShowCompanyPopup}
                    setCurrentAttendRowIndex={setCurrentAttendRowIndex}
                  />
                )}
                {selectedItems.purpose && (
                  <div className="system-form-group d-flex flex-column">
                    <label className="sales-custom-label-class">{t("상담목적")}</label>
                    <FormControl
                      as="textarea"
                      name={"purpose"}
                      value={convertBrToNewline(salesActivitySaveReq?.saveActivityList[0]?.purpose || "")}
                      className="sales-textarea-form-control"
                      autoComplete="off"
                      onChange={handleInputChange}
                      disabled={isDisabled}
                    />
                  </div>
                )}
                {selectedItems.mainIssue && (
                  <div className="system-form-group d-flex flex-column">
                    <label className="sales-custom-label-class">{t("Agenda")}</label>
                    <FormControl
                      as="textarea"
                      name={"agenda"}
                      value={convertBrToNewline(salesActivitySaveReq?.saveActivityList[0]?.agenda || "")}
                      className="sales-textarea-form-control"
                      autoComplete="off"
                      onChange={handleInputChange}
                      disabled={isDisabled}
                    />
                  </div>
                )}
                {selectedItems.followUp && (
                  <div className="system-form-group d-flex flex-column">
                    <label className="sales-custom-label-class">{t("결과 및 기대효과")}</label>
                    <FormControl
                      as="textarea"
                      className="sales-textarea-form-control"
                      name={"results"}
                      value={convertBrToNewline(salesActivitySaveReq?.saveActivityList[0]?.results || "")}
                      onChange={handleInputChange}
                      autoComplete="off"
                      disabled={isDisabled}
                    />
                  </div>
                )}
                {selectedItems.futurePlans && (
                  <div className="system-form-group d-flex flex-column">
                    <label className="sales-custom-label-class">{t("향후계획")}</label>
                    <FormControl
                      as="textarea"
                      className="sales-textarea-form-control"
                      name={"progress"}
                      value={convertBrToNewline(salesActivitySaveReq?.saveActivityList[0]?.progress || "")}
                      onChange={handleInputChange}
                      autoComplete="off"
                      disabled={isDisabled}
                    />
                  </div>
                )}
                {selectedItems.expense && (
                  <>
                    {/* expense 행 추가/삭제 버튼 */}
                    <div className="d-flex justify-content-between align-items-center mb-1 position-relative">
                      <div className="d-flex align-items-center gap-1">
                        <div>{""}</div>
                        <div>{""}</div>
                      </div>
                      {!isDisabled && (
                        <div className="d-flex align-items-center gap-1">
                          <Button variant="light" onClick={() => addRow("cost")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-plus font-16"></i>
                          </Button>
                          <Button variant="light" onClick={() => removeRow("cost")} style={{ fontSize: "10px" }}>
                            <i className="mdi mdi-minus font-16"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* costs 테이블 */}
                    <PisSalesTable
                      columns={SalesCostTableColumns(costTypeList)}
                      data={
                        (salesActivitySaveReq?.saveActivityCostList || []).filter((r) => r.ynFlag !== "D") // ← D가 아닌 항목만 보여줌
                      }
                      updateData={updateDataCosts}
                      theadClass="table-custom-sales-light text-center font-12"
                      tableClass="table-custom-sales-background text-center font-12"
                      isSortable={true}
                      isDisabled={isDisabled}
                    />
                  </>
                )}
              </div>
            </div>
          </Col>
        )}
      </>
    );
  }
);

export default SalesActivityRegisterLeft;
