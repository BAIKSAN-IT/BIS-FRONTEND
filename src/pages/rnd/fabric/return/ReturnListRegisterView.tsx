import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Swal from "sweetalert2";
import {AppDispatch, RootState} from "@redux/store";
import ReturnListTableColumns from "./ReturnListTableColumns";
import ReturnTopRegister from "./ReturnTopRegister";
import TabletTopCommonPopup from "../../../tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "@components/factory/QrReadePopup";
import QrCodeCamera from "@components/common/QrCodeCamera";

import {
  addReturn,
  clearReturn,
  clearReturnView,
  getRndArticleReturnAllList,
  mergeReturnFiles,
  patchReturnCell,
  removeReturn,
  RndArticleFileRes,
  RndArticleReturnRes,
  saveRndArticleReturn,
} from "@redux/rnd/ReturnSlice";

import {getRndArticleQrCodeInfo, RndArticleQrCodeInfoReq, SaveRndArticleFileReq,} from "@redux/rnd/RndSlice";

import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import {CommonNeoeCodeRes, getCommonNeoeCodeDtlList} from "@redux/common/commonSlice";
import {Payload} from "@constants/common/common";
import {isEmpty} from "@utils/CommonUtil";
import PisVirtualTable from "@components/table/PisVirtualTable";

export type ReturnChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

export type ReturnForm = {
  dtsDate: string;
  dtsSeq: string;
  qrcode: string;
  seqArticle: string;
  cdStatus: string;
  nmStatus: string;
  cdWorker: string;
  userNm: string;
  remark: string;
  remarkDetail: string;
};

/* ================================
   Component
================================ */
const ReturnListRegisterView = forwardRef<ReturnChildAPI, {}>((_, ref) => {
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
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  const returnList = useSelector((s: RootState) => s.return.list);
  const fileList = useSelector((s: RootState) => s.return.fileList) as RndArticleFileRes[];

  const [checkedRows, setCheckedRows] = useState<RndArticleReturnRes[]>([]);
  const [selectedRow, setSelectedRow] = useState<RndArticleReturnRes | null>(null);

  const initialReturnForm: ReturnForm = {
    dtsDate: new Date().toISOString().split("T")[0],
    dtsSeq: "",
    qrcode: "",
    seqArticle: "",
    cdStatus: "00", // 기본값
    nmStatus: "00", // 기본값
    cdWorker: user?.userId || "",
    userNm: user?.userNm || "",
    remark: "",
    remarkDetail: "",
  };
  const [returnForm, setReturnForm] = useState<ReturnForm>(initialReturnForm);

  // QR 관련 상태
  const [showKeypadPopup, setShowKeypadPopup] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrValue, setQrValue] = useState("");

  //********************************************
  // ********************************************
  // 1. STATUS 상태 조회 (DETAIL) START
  //**********************************************
  // **********************************************
  const [returnTypeList, setReturnTypeList] = useState<CommonNeoeCodeRes[]>([]);

  const [searchReturnParams, setSearchReturnParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_RD00002",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const fetchReturnTypeList = () => {
    dispatch(
      getCommonNeoeCodeDtlList({
        cdCompany: user?.companyId || "",
        cdField: "CZ_RD00002",
        cdSysdef: "",
        cdFlag1: "",
        fg1Syscode: "",
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) setReturnTypeList(payload.data);
      else setReturnTypeList([]);
    });
  };

  // 4. 각 API 호출
  useEffect(() => {
    fetchReturnTypeList();
  }, [searchReturnParams]);

  //********************************************
  // ********************************************
  // 1. STATUS 상태 조회 (DETAIL) END
  // 2. QR 조회 START
  //**********************************************
  // **********************************************
  const onQrCodeSearch = async (qrcode: string) => {
    if (!qrcode) return showAlert("QR Code를 입력하세요.");

    const rq: RndArticleQrCodeInfoReq = {
      cdCompany: user?.companyId || "1000",
      seqArticle: "",
      qrcode,
    };
    const fq = {
      cdCompany: user?.companyId || "1000",
      cdWorker: user?.userId || "",
      seq: 0,
      seqArticle: "",
    };

    try {
      const listRes = await dispatch(getRndArticleReturnAllList(fq)).unwrap();
      if (listRes?.data?.rndArticleFileList) {
        dispatch(mergeReturnFiles(listRes.data.rndArticleFileList));
      }

      const qrRes = await dispatch(getRndArticleQrCodeInfo(rq)).unwrap();
      const data = qrRes?.data;
      if (data) {
        const newData = Array.isArray(data) ? data[0] : data;
        dispatch(addReturn([newData]));
        setQrValue("");
      } else {
        showAlert("No Data.");
      }
    } catch (e) {
      console.error(e);
      showAlert("QR 조회 실패");
    }
  };

  useEffect(() => {
    if ([11, 13].includes(qrValue.length)) {
      onQrCodeSearch(qrValue);
    }
  }, [qrValue]);

  //********************************************
  // ********************************************
  // 1. STATUS 상태 조회 (DETAIL) END
  // 2. QR 조회 END
  //**********************************************
  // **********************************************

  useEffect(() => {
    if (returnList.length > 0 && !selectedRow) {
      setSelectedRow(returnList[0]); // 첫 번째 row 자동 선택
    }
  }, [returnList, selectedRow]);
  const onSave = async () => {
    if (!returnList.length) return showAlert("There are no items to save.");
    if (!returnForm.cdStatus) return showAlert("Status is a required field.");
    if (!returnForm.cdWorker) return showAlert("Manager is a required field.");

    try {
      // 배열에서 첫 번째로 발견된 truthy한 dtsSeq 사용
      const commonDtsSeq = returnList.find((r) => r.dtsSeq && r.dtsSeq.trim() !== "")?.dtsSeq || "";

      const payload = returnList.map((row) => ({
        cdCompany: user?.companyId || "1000",
        dtsDate: returnForm.dtsDate.replace(/-/g, ""),
        dtsSeq: commonDtsSeq,
        qrcode: row.qrcode ?? qrValue ?? "",
        seqArticle: row.seqArticle || "",
        cdStatus: returnForm.cdStatus,
        cdWorker: returnForm.cdWorker || user?.userId || "",
        remark: returnForm.remark,
        remarkDetail: row.remarkDetail ?? "",
        idInsert: user?.userId || "",
        ynFlag: "Y",
      }));
      await dispatch(saveRndArticleReturn(payload)).unwrap();
      showAlert("저장이 완료되었습니다.");
    } catch {
      showAlert("저장 실패. 관리자에게 문의하세요.");
    }
  };

  const onDelete = async () => {
    if (!checkedRows.length) return showAlert("삭제할 항목을 선택해 주세요.");

    try {
      const payload = checkedRows.map((row) => {
        const ReturnRow = returnList.find((r) => r.seqArticle === row.seqArticle);
        return {
          cdCompany: user?.companyId || "1000",
          dtsDate: returnForm.dtsDate.replace(/-/g, ""),
          dtsSeq: ReturnRow?.dtsSeq ?? "",
          qrcode: row.qrcode ?? "",
          seqArticle: row.seqArticle || "",
          cdStatus: returnForm.cdStatus || "",
          cdWorker: returnForm.cdWorker || user?.userId || "",
          remark: row.remark ?? row.remarkDetail ?? "",
          ynFlag: "D" as const,
        };
      });

      await dispatch(saveRndArticleReturn(payload)).unwrap();
      const seqs = checkedRows.map((r) => r.seqArticle || "");
      dispatch(removeReturn(seqs));
      setCheckedRows([]);
      showAlert("삭제 완료");
    } catch {
      showAlert("삭제 실패");
    }
  };

  const onNew = () => {
    dispatch(clearReturn());
    dispatch(clearReturnView());
    setCheckedRows([]);
    setSelectedRow(null);
    setQrValue("");
    setReturnForm(initialReturnForm);
  };

  const onCheckboxChange = (row: any, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedRows((prev) => {
      const exists = prev.some((r) => String(r.seqArticle ?? r.seqNo) === String(row.seqArticle ?? row.seqNo));
      return exists
        ? prev.filter((r) => String(r.seqArticle ?? r.seqNo) !== String(row.seqArticle ?? row.seqNo))
        : [...prev, row];
    });
    setSelectedRow(null);
  };

  const updateData = (rowIndex: number, columnId: string, value: string) => {
    const target = returnList[rowIndex];
    if (!target) return;
    dispatch(
      patchReturnCell({
        seqArticle: target.seqArticle || "",
        field: columnId as keyof RndArticleReturnRes,
        value,
      })
    );
  };

  const onExcel = () => {
    if (!checkedRows.length) {
      showAlert("엑셀로 내보낼 항목을 선택해 주세요.");
      return;
    }

    const dataForTable = checkedRows.map((r, idx) => {
      const seq = String(r.seqArticle ?? r.seqNo ?? idx);
      const file = fileList.find((f) => String(f.seqArticle) === seq);
      const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;

      const imgUrl = fileName
        ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
        : null;

      return {
        ...r,
        seqArticle: seq,
        remarkDetail: r.remarkDetail ?? "",
        imgUrl,
      };
    });

    downloadExcelWithImages(columns, dataForTable, token, "returnList.xlsx", 120, 70);
  };

  /* ================================
     Exposed API
  ================================ */
  useImperativeHandle(ref, () => ({
    onSearch: () => {
    },
    onNew,
    onSave,
    onDelete,
    onExcel,
    onPrint: () => {
    },
  }));

  /* ================================
     Columns
  ================================ */
  const fileListForColumns: SaveRndArticleFileReq[] = useMemo(
    () =>
      fileList.map((f) => ({
        cdCompany: f.cdCompany ?? (user?.companyId || "1000"),
        seqArticle: String(f.seqArticle ?? ""),
        seq: Number(f.seq ?? 0),
        imgFileNameOrg: f.imgFileNameOrg ?? "",
        imgFileName: f.imgFileName && f.imgFileName.trim() !== "" ? f.imgFileName : f.imgFileNameOrg ?? "",
        ynFlag: f.ynFlag ?? "",
      })),
    [fileList, user?.companyId]
  );

  const columns = useMemo(
    () => ReturnListTableColumns(fileListForColumns, returnTypeList),
    [fileListForColumns, returnList, returnTypeList]
  );
  return (
    <>
      <ReturnTopRegister
        returnForm={returnForm}
        setReturnForm={setReturnForm}
        refs={{} as any}
        selectedRow={selectedRow}
      />

      <Card className="rnd-recap-table-top mt-n3" style={{height: 'calc(-34px + 76vh)'}}>
        <Card.Body style={{minHeight: "calc(70vh - 51px)"}}>
          {/* QR 입력 영역 */}\
          <div className="d-flex justify-content-between align-items-center mt-n3">
            <div className="d-inline-flex align-items-center">
              <div className="">
                <QrCodeCamera
                  value={qrValue}
                  onChange={(v) => setQrValue(v)}
                  readOnly={false}
                  onScanClick={() => setShowQrScanner(true)}
                  onKeypadOpen={() => {
                    (window as any).ui?.modal?.open?.("headerKeyPad");
                    setShowKeypadPopup(true);
                  }}
                  attachLabel
                  widthRatio={1 / 5}
                  minInputPx={400}
                />
              </div>
            </div>

            <Button className={'mt-n4'} variant="primary" onClick={() => {
            }} style={{minWidth: 40}}>
              SEND LIST
            </Button>
          </div>
          <Row className="align-items-stretch d-flex flex-wrap mt-n1">
            <Col xs={12} className="d-flex flex-column mt-n1">
              <div className="card flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-98px + 77vh)'}}>
                  <PisVirtualTable
                    columns={columns}
                    data={returnList}
                    onRowDoubleClick={(row) => setSelectedRow(row)}
                    onRowClick={(row: RndArticleReturnRes) => setSelectedRow(row)}
                    onCheckboxChange={onCheckboxChange}
                    checkedRows={checkedRows}
                    selectedRow={selectedRow}
                    updateData={updateData}
                    theadClass="table-custom-rnd-light text-center font-12"
                    tableClass="table-custom-rnd-background text-center font-12"
                    isSelectable
                    isOnlySelected
                    isSortable
                    virtualize={true}
                    barHeightStyle={"calc(-100px + 77vh)"}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showKeypadPopup && (
        <TabletTopCommonPopup
          setSearchValue={(val: string) => {
            setQrValue(val);
            setShowKeypadPopup(false);
            if (val) onQrCodeSearch(val);
          }}
        />
      )}
      {showQrScanner && (
        <QrReaderPopup
          onScan={(val: string) => {
            setShowQrScanner(false);
            if (val) onQrCodeSearch(val);
          }}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </>
  );
});

export default ReturnListRegisterView;
