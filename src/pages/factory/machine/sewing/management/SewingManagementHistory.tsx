import React, { memo } from "react";
import { Row } from "react-bootstrap";
import CustomTable from "../../../../../components/CustomTable";
import { SewingManagementHistoryListColumns } from "./SewingManagementHistoryListColumns";
import { useTranslation } from "react-i18next";
import { SewingQrSystemHistoryListRes } from "../../../../../redux/factory/factoryQrSystemSlice";

interface Props {
  sewingQrSystemHistoryList: SewingQrSystemHistoryListRes[] | [];
  onRowClick?: (rows: SewingQrSystemHistoryListRes) => void;
  onRowDoubleClick?: (rows: SewingQrSystemHistoryListRes) => void;
}
const SewingManagementHistory = memo(({ sewingQrSystemHistoryList, onRowClick, onRowDoubleClick }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <Row style={{ width: "100%" }}>
        <CustomTable
          columns={SewingManagementHistoryListColumns()}
          data={sewingQrSystemHistoryList || []}
          isSelectable={true}
          tableClass="table-striped dt-responsive nowrap w-100 body-height"
          theadClass="table-gray"
          tableHeightClass="table-300"
          onRowClick={(row) => onRowClick?.(row)}
          onRowDoubleClick={(row) => onRowDoubleClick?.(row)}
        />
      </Row>
    </>
  );
});

export default SewingManagementHistory;
