import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { createGlobalStyle } from "styled-components";

/* lb */
import Swal from "sweetalert2";

/* excel */
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

/* component */
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import SearchSewingProcess from "./SearchSewingProcess";
import CustomTableGrid from "@components/CustomTableGrid";
import { SalesActivityTableColumns, merges, multiHeader } from "./SewingProcessTableColumns";

/* redux */
import { AppDispatch, RootState } from "@redux/store";
import { getSewingProcessList, SewingProcessListRes } from "@redux/eis/sewing/SewingProcessSlice";

/* constants */
import { Payload } from "@constants/common/common";

/* utils */
import { isEmpty } from "@utils/CommonUtil";
import useInputRefs from "@utils/useInputRefs";

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    background-color: white;
  }
`;

const SewingProcess = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [searchParams, setSearchParams] = useState({
    cdCompany: userEnvInfo.cdCompany || "",
    cdBizarea: userEnvInfo.cdBizarea || "",
    cdFty: userEnvInfo.cdFty || "",
    nmBuyer: "",
    dtsFromWk: "",
    dtsToWk: "",
    style: "",
  });

  const { refs, getValues } = useInputRefs(["nmBuyer", "style", "dtsFromWk", "dtsToWk"]);

  const showAlert = (msg: string) => {
    Swal.fire({
      text: msg,
      confirmButtonText: "OK",
      customClass: { popup: "small-swal-popup", confirmButton: "small-swal-button" },
    });
  };

  const fetchSewingList = (params = searchParams) => {
    const converted = {
      ...params,
      dtsFromWk: params.dtsFromWk.replace(/-/g, ""),
      dtsToWk: params.dtsToWk.replace(/-/g, ""),
    };
    dispatch(getSewingProcessList(converted)).then((res) => {
      const payload = res.payload as Payload;
      setSewingProcessList(payload.status === 200 && !isEmpty(payload.data) ? payload.data : []);
    });
  };

  const [sewingProcessList, setSewingProcessList] = useState<SewingProcessListRes[]>([]);

  const onSearchButtonClick = () => {
    const inputValues = getValues();
    const nextParams = { ...searchParams, ...inputValues };

    if (!nextParams.cdBizarea && !nextParams.nmBuyer && !nextParams.style) {
      showAlert(t("One Of The Three Is Required.(Bizarea, Buyer, Style)"));
      return;
    }
    if (nextParams.dtsFromWk > nextParams.dtsToWk) {
      showAlert(t("Please Re-Select The EndDate."));
      return;
    }
    setSearchParams(nextParams);
    fetchSewingList(nextParams);
  };

  const onExcelDownloadClick = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, multiHeader, { origin: "A1" });
    ws["!merges"] = merges;
    const dataRows = sewingProcessList.map((item) => [
      item.nmBuyer,
      item.noStyle,
      item.nmPo,
      item.qtOrd,
      item.destinationOrder,
      item.nmClr,
      item.nmSz,
      item.szOrd,
      item.qtLod,
      item.qtTtlLod,
      item.rateLod,
      item.qtDft,
      item.qtTtlDft,
      item.rateDft,
      item.qtSew,
      item.qtTtlSew,
      item.rateSew,
      item.qtIron,
      item.qtTtlIron,
      item.rateIron,
      item.qtFinish,
      item.qtTtlFinish,
      item.rateFinish,
    ]);
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: { r: 2, c: 0 } });
    XLSX.utils.book_append_sheet(wb, ws, "SewingProcessList");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "SewingProcessList.xlsx");
  };

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
    }));
  }, [userEnvInfo]);

  return (
    <>
      <GlobalStyle />
      <Row>
        <Col>
          <EisPageTitleBar
            pageNm="EIS"
            pageUrl="/knitstatus"
            breadCrumbItems={[{ label: "SewingProcess", path: "/sewingProcess", active: true }]}
            onSearchButtonClick={onSearchButtonClick}
            onExcelDownloadClick={onExcelDownloadClick}
            onPrintButtonClick={() => window.print()}
          />
          <SearchSewingProcess refs={refs} onSearchButtonClick={onSearchButtonClick} />
        </Col>
      </Row>
      <Card className="mt-1">
        <Row>
          <div className="hps-popup-wrapper">
          <CustomTableGrid
            columns={SalesActivityTableColumns()}
            data={sewingProcessList}
            isSortable
            tableClass="table-striped dt-responsive nowrap w-100 body-height-grid font-12 fixed-layout-table"
            theadClass="table-gray-grid-eis"
            tbodyClass="hourlyList"
          />
          </div>
        </Row>
      </Card>
    </>
  );
});

export default SewingProcess;
