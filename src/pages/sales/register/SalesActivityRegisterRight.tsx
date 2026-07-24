import React, { Dispatch, memo, SetStateAction } from "react";
import { Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/* redux */
import { SalesActivityAllListRes, SalesActivitySaveReq } from "../../../redux/sales/SalesActivitySlice";

/* Component */
import { SalesOrderTableColumns } from "./SalesOrderTableColumns";
import JoditEditorOriginal from "../../editor/JoditEditor";
import PisSalesTable from "../../../components/table/PisSalesTable";

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
  isVisible: boolean;
  isDisabled: boolean;
  salesActivityAll?: SalesActivityAllListRes | null;
  setIsShowStylePopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowBuyerPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowBrandPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowItemPopup?: Dispatch<SetStateAction<boolean>>;
  updateDataOrder: (rowIndex: number, columnId: string, value: string) => void;
  salesActivitySaveReq?: SalesActivitySaveReq | null;
  setSalesActivitySaveReq?: React.Dispatch<React.SetStateAction<SalesActivitySaveReq>>;
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setPendingDeleteFiles: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentOrderRowIndex: React.Dispatch<React.SetStateAction<number>>;
}

const SalesActivityRegisterRight = memo(
  ({
    selectedItems,
    setSelectedItems,
    isVisible,
    isDisabled,
    salesActivityAll,
    setIsShowStylePopup,
    setIsShowBuyerPopup,
    setIsShowBrandPopup,
    setIsShowItemPopup,
    updateDataOrder,
    salesActivitySaveReq,
    setSalesActivitySaveReq,
    setPendingFiles,
    setPendingDeleteFiles,
    setCurrentOrderRowIndex,
  }: Props) => {
    const { t } = useTranslation();
    return (
      <Col xs={12} sm={12} md={isVisible ? 8 : 12} lg={isVisible ? 8 : 12} className="d-flex flex-column">
        {/*테이블 렌더링*/}
        {selectedItems.order && (
          <div className="card flex-grow-1 card-gray-border mb-1">
            <div className="sales-register-table-container">
              <PisSalesTable
                columns={SalesOrderTableColumns()}
                data={
                  (salesActivitySaveReq?.saveActivityOrderList || []).filter((r) => r.ynFlag !== "D") // ← D가 아닌 항목만 보여줌
                }
                updateData={updateDataOrder}
                theadClass="table-custom-sales-light text-center font-12"
                tableClass="table-custom-sales-background text-center font-12"
                isSortable={true}
                isDisabled={isDisabled}
                setIsShowStylePopup={setIsShowStylePopup}
                setIsShowBuyerPopup={setIsShowBuyerPopup}
                setIsShowBrandPopup={setIsShowBrandPopup}
                setIsShowItemPopup={setIsShowItemPopup}
                setCurrentOrderRowIndex={setCurrentOrderRowIndex}
              />
            </div>
          </div>
        )}
        {/* 에디터 */}
        <div className="editor-container">
          <JoditEditorOriginal
            setSelectedItems={setSelectedItems}
            isDisabled={isDisabled}
            salesActivitySaveReq={salesActivitySaveReq}
            setSalesActivitySaveReq={setSalesActivitySaveReq}
            setPendingFiles={setPendingFiles}
            setPendingDeleteFiles={setPendingDeleteFiles}
          />
        </div>
      </Col>
    );
  }
);

export default SalesActivityRegisterRight;
