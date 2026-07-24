import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";

/* constants */
import {Payload} from "@constants/common/common";

/* confing */
import config from "../../../../config";

/* utils */
import {DateUtils} from "@utils/dateUtils";
import {isEmpty} from "@utils/CommonUtil";
import {downloadExcelWithImages} from "@utils/excelUtils";
import useReportPopupBridge from "@utils/useReportPopupBridge";
import useInputRefs from "@utils/useInputRefs";

/* redux */
import {exportRndArticleReport} from "@redux/reports/ReportsSlice";
import {addRecap, clearRecap, mergeRecapFiles} from "@redux/rnd/RecapSlice";
import {getRndArticleAllList, RndArticleAllListRes, RndArticleModel, RndArticleReq,} from "@redux/rnd/RndSlice";

/* components */
import SearchFabricLibrary from "../library/SearchFabricLibrary";
import {FabricLibraryListTableColumns} from "../library/FabricLibraryListTableColumns";
import RecapTabList from "./RecapTabList";
import PisVirtualTable from "@components/table/PisVirtualTable";

export type FabricRecapChildAPI = {
  onSearch?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const FabricList = forwardRef<FabricRecapChildAPI, {}>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  // 검색 파라미터
  const defaultReq: RndArticleReq = {
    cdCompany: user?.companyId || "1000",
    startDate: DateUtils.oneMonthAgo.replace(/-/g, ""),
    endDate: DateUtils.today.replace(/-/g, ""),
    seqArticle: "",
    cdHanger: "",
    nmFabric: "",
    cdSupplier: "",
    noSupplierArticle: "",
    productType: "",
    fabricType: "",
    fabricDivision: "",
    fabricCategory: "",
    fabricStructure: "",
    userNm: "",
    cdDept: "",
    nmDept: "",
    noSample: "",
    noLot: "",
    ynConfirm: "",
    cdFabric: "",
    cdComposition: "",
    cdProcess: "",
    cdYarn: "",
    nmYarn: "",
    qrcode: "",
    seq: 0,
    rowQrNum: 0,
  };
  const [rq, setRq] = useState<RndArticleReq>(defaultReq);
  const {refs, getValues} = useInputRefs([
    "cdHanger",
    "nmFabric",
    "startDate",
    "endDate",
    "cdSupplier",
    "noSupplierArticle",
    "productType",
    "fabricType",
    "fabricDivision",
    "fabricCategory",
    "fabricStructure",
    "userNm",
    "cdDept",
    "nmDept",
    "noSample",
    "noLot",
    "ynConfirm",
    "cdFabric",
    "cdComposition",
    "cdProcess",
    "cdYarn",
    "nmYarn",
    "qrcode",
    "seq",
  ]);

  // 데이터
  const [listAll, setListAll] = useState<RndArticleAllListRes | null>(null);
  const [selectedRow, setSelectedRow] = useState<RndArticleModel | null>(null);

  //  다중 선택
  const [checkedRows, setCheckedRows] = useState<RndArticleModel[]>([]);

  // 조회
  const fetchList = (params = rq) => {
    dispatch(getRndArticleAllList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setListAll(payload.data);
        setCheckedRows([]);
      } else {
        setListAll(null);
        setCheckedRows([]);
      }
    });
  };
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

  const onSearch = () => {
    const input = getValues();
    const norm = (d?: string) => (d ? d.replaceAll("-", "") : "");
    const next = safeMerge(rq, {
      ...rq,
      ...input,
      startDate: norm(input.startDate ?? rq.startDate),
      endDate: norm(input.endDate ?? rq.endDate),
      seq: Number(input.seq || 0),
    });
    setRq(next);
    fetchList(next);
  };

  // 리포트/엑셀
  const [reportPayload, setReportPayload] = useState<{ blobUrl: string; params: any } | null>(null);
  useReportPopupBridge(
    () => reportPayload ?? {blobUrl: "", params: {}},
    async (docType, ctx) => {
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

  const onPrint = async () => {
    /*const seqArticle = checkedRows[0]?.seqArticle ?? "";
    if (!seqArticle) return alert("출력할 항목을 선택해 주세요.");
    try {
      const res = await dispatch(
        exportRndArticleReport({...rq, seqArticle, cdCompany: user?.companyId || "1000", docType: "pdf"})
      ).unwrap();
      const blobUrl = URL.createObjectURL(new Blob([res.data], {type: "application/pdf"}));
      setReportPayload({
        blobUrl,
        params: {
          docType: "pdf",
          reportType: "rndArticleReportGenerator",
          request: {...rq, seqArticle, cdCompany: user?.companyId || "1000"},
        },
      });
      window.postMessage({type: "OPEN_REPORT_POPUP"}, "*");
    } catch {
      alert("리포트 출력에 실패했습니다.");
    }*/
  };

  // 체크박스(다중)
  const onCheckboxChange = (row: any, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedRows((prev) => {
      const exists = prev.some((r) => r.seqArticle === row.seqArticle);
      return exists ? prev.filter((r) => r.seqArticle !== row.seqArticle) : [...prev, row];
    });
    setSelectedRow(null);
  };

  const actAddTo = (bucket: "recap") => {
    if (bucket !== "recap") return;
    if (!checkedRows.length) return;
    // 1) 목록 Redux 저장
    dispatch(addRecap(checkedRows as any));
    // 2) 파일 Redux merge
    if (listAll?.rndArticleFileList?.length) {
      dispatch(mergeRecapFiles(listAll.rndArticleFileList));
    }
    // 3) 탭 이동
    window.postMessage({type: "SWITCH_TAB", tab: "recap"}, "*");
  };

  useImperativeHandle(ref, () => ({
    onSearch,
    onExcel: onExcelDownloadClick,
    onPrint,
  }));

  const onExcelDownloadClick = () => {
    // 1) 테이블 데이터 형태 + 이미지 URL 만들기
    const dataForExcel = (listAll?.rndArticleList || []).map((r, idx) => {
      const seq = String(r.seqArticle ?? r.seqNo ?? idx);
      const file = (listAll?.rndArticleFileList || []).find((f) => String(f.seqArticle) === seq);
      const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;
      const imgUrl = fileName
        ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
        : null;

      return {...r, seqArticle: seq, imgUrl};
    });

    // 2) 컬럼(그룹 헤더 포함 가능) – 썸네일(이미지) 컬럼이 첫 leaf면 그 자리에 이미지 들어감
    const fileColumnsSource = (listAll?.rndArticleFileList || []).map((f) => ({
      cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
      seqArticle: String(f.seqArticle ?? ""),
      seq: Number(f.seq ?? 0),
      imgFileNameOrg: f.imgFileNameOrg ?? "",
      imgFileName: f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
      ynFlag: f.ynFlag ?? "",
    }));
    const columns = FabricLibraryListTableColumns(fileColumnsSource); // 또는 FabricLibrary 전용 컬럼 팩토리 사용

    // 3) 다운로드
    downloadExcelWithImages(columns, dataForExcel, token, "FabricLibrary.xlsx", 120, 70);
  };
  const columns = useMemo(
    () => FabricLibraryListTableColumns(listAll?.rndArticleFileList),
    [listAll?.rndArticleFileList, checkedRows]
  );

  useEffect(() => {
    fetchList();
  }, [dispatch]);
  return (
    <>
      <SearchFabricLibrary refs={refs} searchParams={rq} setSearchParams={setRq} onSearchButtonClick={onSearch}/>
      <Card className="mt-n4">
        <Card.Body style={{minHeight: "calc(65vh - 51px)"}}>
          <RecapTabList onAct={actAddTo} selectedCount={checkedRows.length} size="sm"/>
          <Row className="align-items-stretch d-flex flex-wrap mt-n2">
            <Col xs={12} className="d-flex flex-column mt-n1">
              <div className="card flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-98px + 75vh)'}}>
                  <PisVirtualTable
                    columns={columns}
                    data={listAll?.rndArticleList || []}
                    onRowDoubleClick={() => {
                    }}
                    onRowClick={(row) => setSelectedRow(row)}
                    onCheckboxChange={onCheckboxChange}
                    checkedRows={checkedRows}
                    selectedRow={selectedRow}
                    theadClass="table-custom-rnd-light text-center font-12"
                    tableClass="table-custom-rnd-background text-center font-12"
                    isSelectable
                    isSortable
                    isOnlySelected
                    virtualize={true}
                    barHeightStyle={"calc(-100px + 65vh)"}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricList;
