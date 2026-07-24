import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Swal from "sweetalert2";
import {AppDispatch, RootState} from "@redux/store";
import SendingListTableColumns from "./SendingListTableColumns";
import SendingTopRegister from "./SendingTopRegister";
import TabletTopCommonPopup from "../../../tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "@components/factory/QrReadePopup";
import QrCodeCamera from "@components/common/QrCodeCamera";

import {
  addSend,
  clearSend,
  clearSendView,
  getRndArticleSendAllList,
  mergeSendFiles,
  patchSendCell,
  removeSend,
  RndArticleFileRes,
  RndArticleSendRes,
  saveRndArticleSend,
} from "@redux/rnd/SendingSlice";

import {getRndArticleQrCodeInfo, RndArticleQrCodeInfoReq, SaveRndArticleFileReq,} from "@redux/rnd/RndSlice";

import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import PisVirtualTable from "@components/table/PisVirtualTable";

export type SendingChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

export type SendingForm = {
  dtsDate: string;
  dtsSeq: string;
  qrcode: string;
  seqArticle: string;
  cdSending: string;
  recipient: string;
  cdWorker: string;
  userNm: string;
  cdDept: string;
  nmDept: string;
  cdBuyer: string;
  nmBuyer: string;
  cdBrand: string;
  nmBrand: string;
  cdSeason: string;
  nmSeason: string;
  dtsYear: string;
  topic: string;
  remark: string;
  remarkDetail: string;
  ynHanger: string;
  ynSwatch: string;
};

/* ================================
   Component
================================ */
const SendingListRegisterView = forwardRef<SendingChildAPI, {}>((_, ref) => {
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

  const sendList = useSelector((s: RootState) => s.sending.list);
  const fileList = useSelector((s: RootState) => s.sending.fileList) as RndArticleFileRes[];

  const [checkedRows, setCheckedRows] = useState<RndArticleSendRes[]>([]);
  const [selectedRow, setSelectedRow] = useState<RndArticleSendRes | null>(null);

  const initialSendingForm: SendingForm = {
    dtsDate: new Date().toISOString().split("T")[0],
    dtsSeq: "",
    qrcode: "",
    seqArticle: "",
    cdSending: "01", // 기본값
    recipient: "",
    cdWorker: user?.userId || "",
    userNm: user?.userNm || "",
    cdDept: user?.deptId || "",
    nmDept: user?.deptNm || "",
    cdBuyer: "",
    nmBuyer: "",
    cdBrand: "",
    nmBrand: "",
    cdSeason: "01", // 기본값
    nmSeason: "",
    dtsYear: String(new Date().getFullYear()),
    topic: "",
    remark: "",
    remarkDetail: "",
    ynHanger: "0",
    ynSwatch: "0",
  };
  const [sendingForm, setSendingForm] = useState<SendingForm>(initialSendingForm);
  // QR 관련 상태
  const [showKeypadPopup, setShowKeypadPopup] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const onQrCodeSearch = (qrcode: string) => {
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
    dispatch(getRndArticleSendAllList(fq)).then((res: any) => {
      const data = res?.payload?.data;
      if (res?.payload?.status === 200 && data) {
        dispatch(mergeSendFiles(res.payload.data.rndArticleFileList));
      }
    });
    dispatch(getRndArticleQrCodeInfo(rq)).then((res: any) => {
      const data = res?.payload?.data;
      if (res?.payload?.status === 200 && data) {
        const newData = Array.isArray(data) ? data[0] : data;
        dispatch(addSend([newData]));
        setQrValue("");
      } else {
        showAlert("No Data.");
      }
    });
  };

  useEffect(() => {
    if ([11, 13].includes(qrValue.length)) {
      onQrCodeSearch(qrValue);
    }
  }, [qrValue]);

  const onSave = async () => {
    if (!sendList.length) return showAlert("There are no items to save.");
    if (!sendingForm.cdBrand) return showAlert("Brand is a required field.");
    if (!sendingForm.dtsYear) return showAlert("Year is a required field.");
    if (!sendingForm.cdSeason) return showAlert("Season is a required field.");
    if (!sendingForm.cdWorker) return showAlert("Manager is a required field.");
    if (!sendingForm.cdSending) return showAlert("Sending is a required field.");
    if (!sendingForm.recipient) return showAlert("recipient is a required field.");

    try {
      // 배열에서 첫 번째로 발견된 truthy한 dtsSeq 사용
      const commonDtsSeq = sendList.find((r) => r.dtsSeq && r.dtsSeq.trim() !== "")?.dtsSeq || "";
      console.log(commonDtsSeq);
      console.log(sendingForm);
      const payload = sendList.map((row) => ({
        cdCompany: user?.companyId || "1000",
        dtsDate: sendingForm.dtsDate.replace(/-/g, ""),
        dtsSeq: commonDtsSeq,
        qrcode: row.qrcode ?? qrValue ?? "",
        seqArticle: row.seqArticle || "",
        cdSending: sendingForm.cdSending,
        recipient: sendingForm.recipient,
        cdBuyer: sendingForm.cdBuyer,
        nmBuyer: sendingForm.nmBuyer,
        cdBrand: sendingForm.cdBrand,
        nmBrand: sendingForm.nmBrand,
        cdSeason: sendingForm.cdSeason,
        dtsYear: sendingForm.dtsYear,
        cdWorker: sendingForm.cdWorker || user?.userId || "",
        topic: sendingForm.topic,
        remark: sendingForm.remark,
        remarkDetail: row.remarkDetail ?? "",
        ynHanger: row.ynHanger ?? "0",
        ynSwatch: row.ynSwatch ?? "0",
        idInsert: user?.userId || "",
        ynFlag: "Y",
      }));
      await dispatch(saveRndArticleSend(payload)).unwrap();
      showAlert("저장이 완료되었습니다.");
    } catch {
      showAlert("저장 실패. 관리자에게 문의하세요.");
    }
  };

  const onDelete = async () => {
    if (!checkedRows.length) return showAlert("삭제할 항목을 선택해 주세요.");

    try {
      const payload = checkedRows.map((row) => {
        const sendRow = sendList.find((r) => r.seqArticle === row.seqArticle);
        return {
          cdCompany: user?.companyId || "1000",
          dtsDate: sendingForm.dtsDate.replace(/-/g, ""),
          dtsSeq: sendRow?.dtsSeq ?? "",
          qrcode: row.qrcode ?? "",
          seqArticle: row.seqArticle || "",
          cdSending: sendingForm.cdSending,
          recipient: sendingForm.recipient,
          cdWorker: sendingForm.cdWorker || user?.userId || "",
          remark: row.remark ?? row.remarkDetail ?? "",
          ynFlag: "D" as const,
        };
      });

      await dispatch(saveRndArticleSend(payload)).unwrap();
      const seqs = checkedRows.map((r) => r.seqArticle || "");
      dispatch(removeSend(seqs));
      setCheckedRows([]);
      showAlert("삭제 완료");
    } catch {
      showAlert("삭제 실패");
    }
  };

  const onNew = () => {
    dispatch(clearSend());
    dispatch(clearSendView());
    setCheckedRows([]);
    setSelectedRow(null);
    setQrValue("");
    setSendingForm(initialSendingForm);
  };

  const onCheckboxChange = (row: any, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedRows((prev) => {
      const exists = prev.some((r) => String(r.seqArticle ?? r.seqNo) === String(row.seqArticle ?? row.seqNo));
      return exists
        ? prev.filter((r) => String(r.seqArticle ?? r.seqNo) !== String(row.seqArticle ?? row.seqNo))
        : [...prev, row];
    });
    console.log(checkedRows);
    setSelectedRow(null);
  };

  const updateData = (rowIndex: number, columnId: string, value: string) => {
    const target = sendList[rowIndex];
    if (!target) return;
    dispatch(
      patchSendCell({
        seqArticle: target.seqArticle || "",
        field: columnId as keyof RndArticleSendRes,
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

    downloadExcelWithImages(columns, dataForTable, token, "SendList.xlsx", 120, 70);
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

  const columns = useMemo(() => SendingListTableColumns(fileListForColumns), [fileListForColumns, sendList]);

  return (
    <>
      <SendingTopRegister
        sendingForm={sendingForm}
        setSendingForm={setSendingForm}
        refs={{} as any}
        selectedRow={selectedRow}
      />

      <Card className="rnd-recap-table-top mt-n3" style={{height: 'calc(68vh - 36px)'}}>
        <Card.Body>
          {/* QR 입력 영역 */}
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

          <Row className="align-items-stretch d-flex flex-wrap mt-n1">
            <Col xs={12} className="d-flex flex-column mt-n1">
              <div className="card flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-98px + 68vh)'}}>
                  <PisVirtualTable
                    columns={columns}
                    data={sendList}
                    onRowDoubleClick={(row) => setSelectedRow(row)}
                    onRowClick={(row: RndArticleSendRes) => setSelectedRow(row)}
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
                    barHeightStyle={"calc(-100px + 68vh)"}
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

export default SendingListRegisterView;
