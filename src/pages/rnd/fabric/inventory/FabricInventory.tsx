import React, {useEffect, useMemo, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";

import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {useTranslation} from "react-i18next";

/* lb */
import RndPageTitleBar from "@components/common/RndPageTitleBar";
import useInputRefs from "@utils/useInputRefs";
import SearchFabricInventory from "./SearchFabricInventory";
import {FabricInventoryListTableColumns} from "./FabricInventoryListTableColumns";
import {Payload} from "@constants/common/common";
import {isEmpty} from "@utils/CommonUtil";
import {exportRndArticleReport} from "@redux/reports/ReportsSlice";
import useReportPopupBridge from "@utils/useReportPopupBridge";
import config from "../../../../config";
import {downloadExcelWithImages} from "@utils/excelUtils";
import {
  getRndArticleInventoryAllList,
  RndArticleInventoryAllRes,
  RndArticleInventoryReq,
} from "@redux/rnd/inventorySlice";
import PisVirtualTable from "@components/table/PisVirtualTable";

const FabricInventory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  const defaultRndArticleInventoryReq: RndArticleInventoryReq = {
    cdCompany: user?.companyId || "1000",
    seqArticle: "",
    nmFabric: "",
    cdHanger: "",
    noLot: "",
    noSample: "",
    productType: "",
    fabricType: "",
    fabricDivision: "",
    fabricCategory: "",
    fabricStructure: "",
    cdDept: "",
    nmDept: "",
    userNm: "",
    ynAll: "Y",
    seq: 0,
  };

  const [searchParams, setSearchParams] = useState<RndArticleInventoryReq>(defaultRndArticleInventoryReq);
  const {refs, getValues} = useInputRefs([
    "nmFabric",
    "cdHanger",
    "noLot",
    "noSample",
    "productType",
    "fabricType",
    "fabricDivision",
    "fabricCategory",
    "fabricStructure",
    "cdDept",
    "nmDept",
    "userNm",
  ]);
  const [rndArticleInventoryAllList, setRndArticleInventoryAllList] = useState<RndArticleInventoryAllRes | null>(null);

  const fetchRndArticleInventoryAllList = (params = searchParams) => {
    dispatch(getRndArticleInventoryAllList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setRndArticleInventoryAllList(payload.data);
      } else {
        setRndArticleInventoryAllList(null);
      }
    });
  };

  /* 최초 로딩시 전체 조회 */
  useEffect(() => {
    fetchRndArticleInventoryAllList(searchParams);
  }, []);

  const safeMerge = (current: any, updates: any) => {
    const result: any = {...current};
    Object.keys(updates).forEach((key) => {
      const v = updates[key];
      if (v !== undefined && v !== "") {
        result[key] = v;
      }
    });
    return result;
  };

  const onSearchButtonClick = () => {
    const inputValues = getValues();

    const nextParams = safeMerge(searchParams, {
      ...inputValues,
      seqArticle: "",
      seq: 0,
    });

    setSearchParams(nextParams);
    fetchRndArticleInventoryAllList(nextParams);
  };
  const [reportPayload, setReportPayload] = useState<{
    blobUrl: string;
    params: any;
  } | null>(null);

  // 2) 브리지 훅: READY 오면 reportPayload를 전달, 다운로드 요청 오면 API 호출
  useReportPopupBridge(
    () => reportPayload ?? {blobUrl: "", params: {}},
    async (docType, ctx) => {
      // 여기서만 공통 API 호출
      const res = await dispatch(exportRndArticleReport({...ctx.request, docType})).unwrap();

      const mime =
        docType === "pdf"
          ? "application/pdf"
          : docType === "excel"
            ? "application/vnd.ms-excel"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const ext = docType === "pdf" ? "pdf" : docType === "excel" ? "xls" : "docx";

      const blob = new Blob([res.data], {type: mime});
      const url = URL.createObjectURL(blob);
      return {url, filename: `report.${ext}`};
    }
  );
  const onExcelDownloadClick = () => {
    // 1) 테이블 데이터 형태 + 이미지 URL 만들기
    const dataForExcel = (rndArticleInventoryAllList?.rndArticleInventoryList || []).map((r, idx) => {
      const seq = String(r.seqArticle ?? r.seqNo ?? idx);
      const file = (rndArticleInventoryAllList?.rndArticleFileList || []).find((f) => String(f.seqArticle) === seq);
      const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;
      const imgUrl = fileName
        ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
        : null;

      return {...r, seqArticle: seq, imgUrl};
    });

    // 2) 컬럼(그룹 헤더 포함 가능) – 썸네일(이미지) 컬럼이 첫 leaf면 그 자리에 이미지 들어감
    const fileColumnsSource = (rndArticleInventoryAllList?.rndArticleFileList || []).map((f) => ({
      cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
      seqArticle: String(f.seqArticle ?? ""),
      seq: Number(f.seq ?? 0),
      imgFileNameOrg: f.imgFileNameOrg ?? "",
      imgFileName: f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
      ynFlag: f.ynFlag ?? "",
    }));
    const columns = FabricInventoryListTableColumns(fileColumnsSource); // 또는 FabricInventory 전용 컬럼 팩토리 사용

    // 3) 다운로드
    downloadExcelWithImages(columns, dataForExcel, token, "FabricInventory.xlsx", 120, 70);
  };
  const columns = useMemo(
    () => FabricInventoryListTableColumns(rndArticleInventoryAllList?.rndArticleFileList),
    [rndArticleInventoryAllList?.rndArticleFileList]
  );
  return (
    <>
      <RndPageTitleBar
        pageNm={"RND"}
        pageUrl={"/fabric/library"}
        breadCrumbItems={[
          {label: "FABRIC", path: "/fabric/library"},
          {
            label: "FABRIC INVENTORY",
            path: "/fabric/inventory",
            active: true,
          },
        ]}
        onSearchButtonClick={onSearchButtonClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onPrintButtonClick={() => {
        }}
      />
      <SearchFabricInventory
        refs={refs}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearchButtonClick={onSearchButtonClick}
      />
      <Card className="card flex-grow-1 card-gray-border mt-n3">
        <Card.Body style={{minHeight: "calc(-53px + 73vh)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n2">
            <Col xs={12} className="d-flex flex-column mt-n1">
              <div className="card flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-98px + 75vh)'}}>
                  <PisVirtualTable
                    columns={columns}
                    data={rndArticleInventoryAllList?.rndArticleInventoryList || []}
                    theadClass="text-center font-12"
                    tableClass="table-custom-eis-background text-center font-12"
                    isSortable={true}
                    isOnlySelected={true}
                    virtualize={true}
                    barHeightStyle={"calc(-100px + 75vh)"}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};
export default FabricInventory;
