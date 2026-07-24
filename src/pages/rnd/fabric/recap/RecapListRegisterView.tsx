import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Swal from "sweetalert2";
import {AppDispatch, RootState} from "@/redux/store";
import RecapListTableColumns from "./RecapListTableColumns";
import RecapTopRegister from "./RecapTopRegister";

import {
  addRecap,
  clearRecap,
  clearRecapView,
  getRndArticleRecapAllList,
  patchRecapCell,
  removeRecap,
  RndArticleFileRes,
  RndArticleRecapRes,
  saveRndArticleRecap,
} from "@redux/rnd/RecapSlice";

import {getRndArticleQrCodeInfo, RndArticleQrCodeInfoReq, SaveRndArticleFileReq,} from "@redux/rnd/RndSlice";
import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import {mergeSendFiles} from "@redux/rnd/SendingSlice";
import TabletTopCommonPopup from "../../../tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "@components/factory/QrReadePopup";
import QrCodeCamera from "@components/common/QrCodeCamera";
import PisVirtualTable from "@components/table/PisVirtualTable";

export type RecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

export type RecapForm = {
  dtsDate: string;
  dtsSeq: string;
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
};

const RecapListRegisterView = forwardRef<RecapChildAPI, {}>((_, ref) => {
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

  const recapList = useSelector((s: RootState) => s.recap.list);
  const fileList = useSelector((s: RootState) => s.recap.fileList) as RndArticleFileRes[];

  const [checkedRows, setCheckedRows] = useState<RndArticleRecapRes[]>([]);
  const [selectedRow, setSelectedRow] = useState<RndArticleRecapRes | null>(null);

  // QR 관련 상태
  const [showKeypadPopup, setShowKeypadPopup] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const initialRecapForm: RecapForm = {
    dtsDate: new Date().toISOString().split("T")[0], // 오늘 날짜
    dtsSeq: "",
    cdWorker: user?.userId || "",
    userNm: user?.userNm || "",
    cdDept: user?.deptId || "",
    nmDept: user?.deptNm || "",
    cdBuyer: "",
    nmBuyer: "",
    cdBrand: "",
    nmBrand: "",
    cdSeason: "01",
    nmSeason: "",
    dtsYear: String(new Date().getFullYear()),
    topic: "",
    remark: "",
    remarkDetail: "",
  };
  const [recapForm, setRecapForm] = useState<RecapForm>(initialRecapForm);
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
    dispatch(getRndArticleRecapAllList(fq)).then((res: any) => {
      console.log(res);
      const data = res?.payload?.data;
      if (res?.payload?.status === 200 && data) {
        dispatch(mergeSendFiles(res.payload.data.rndArticleFileList));
      }
    });
    dispatch(getRndArticleQrCodeInfo(rq)).then((res: any) => {
      const data = res?.payload?.data;
      if (res?.payload?.status === 200 && data) {
        const newData = Array.isArray(data) ? data[0] : data;
        dispatch(addRecap([newData]));
        setQrValue("");
      } else {
        showAlert("QR Code 결과가 없습니다.");
      }
    });
  };

  useEffect(() => {
    if ([11, 13].includes(qrValue.length)) {
      onQrCodeSearch(qrValue);
    }
  }, [qrValue]);

  useEffect(() => {
    if (recapList.length > 0 && !selectedRow) {
      setSelectedRow(recapList[0]); // 첫 번째 row 자동 선택
    }
  }, [recapList, selectedRow]);
  const onSave = async () => {
    if (!recapList.length) return showAlert("There are no items to save.");
    if (!recapForm.cdBrand) return showAlert("Brand is a required field.");
    if (!recapForm.dtsYear) return showAlert("Year is a required field.");
    if (!recapForm.cdSeason) return showAlert("Season is a required field.");
    if (!recapForm.cdWorker) return showAlert("Manager is a required field.");
    try {
      const payload = recapList.map((row) => ({
        cdCompany: user?.companyId || "1000",
        cdWorker: recapForm.cdWorker || user?.userId || "",
        seqArticle: row.seqArticle || "",
        dtsDate: recapForm.dtsDate.replace(/-/g, ""),
        dtsSeq: row.dtsSeq ?? "",
        remark: recapForm.remark ?? "",
        remarkDetail: row.remarkDetail ?? "",
        cdBuyer: recapForm.cdBuyer,
        nmBuyer: recapForm.nmBuyer,
        cdBrand: recapForm.cdBrand,
        nmBrand: recapForm.nmBrand,
        cdSeason: recapForm.cdSeason,
        dtsYear: recapForm.dtsYear,
        topic: recapForm.topic,
        idInsert: user?.userId || "",
        ynFlag: "Y",
      }));
      await dispatch(saveRndArticleRecap(payload)).unwrap();
      showAlert("Success");
    } catch {
      showAlert("Save failed. Please contact the administrator.");
    }
  };

  const onDelete = async () => {
    if (!checkedRows.length) return showAlert("삭제할 항목을 선택해 주세요.");

    try {
      const payload = checkedRows.map((row) => {
        // recapList에서 동일한 seqArticle 가진 데이터 찾기
        const recapRow = recapList.find((r) => r.seqArticle === row.seqArticle);

        return {
          cdCompany: user?.companyId || "1000",
          cdWorker: recapForm.cdWorker || user?.userId || "",
          seqArticle: row.seqArticle || "",
          dtsDate: recapForm.dtsDate.replace(/-/g, ""),
          dtsSeq: recapRow?.dtsSeq ?? "", //recapList에서 가져온 dtsSeq
          remark: row.remark ?? row.remarkDetail ?? "",
          idInsert: user?.userId || "",
          ynFlag: "D" as const,
        };
      });

      await dispatch(saveRndArticleRecap(payload)).unwrap();

      const seqs = checkedRows.map((r) => r.seqArticle || "");
      dispatch(removeRecap(seqs));
      setCheckedRows([]);
      showAlert("삭제가 완료되었습니다.");
    } catch {
      showAlert("삭제 중 오류가 발생했습니다.");
    }
  };
  const onNew = () => {
    dispatch(clearRecap());
    dispatch(clearRecapView());
    setCheckedRows([]);
    setSelectedRow(null);
    setQrValue("");
    setRecapForm(initialRecapForm);
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
    const target = recapList[rowIndex];
    if (!target) return;
    dispatch(
      patchRecapCell({
        seqArticle: target.seqArticle || "",
        field: columnId as keyof RndArticleRecapRes,
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

    downloadExcelWithImages(columns, dataForTable, token, "RecapList.xlsx", 120, 70);
  };

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
  console.log(fileListForColumns)
  const columns = useMemo(() => RecapListTableColumns(fileListForColumns), [fileListForColumns, recapList]);
  return (
    <>
      <RecapTopRegister recapForm={recapForm} setRecapForm={setRecapForm} refs={{} as any} selectedRow={selectedRow}/>

      <Card className="rnd-recap-table-top mt-n3">
        <Card.Body style={{minHeight: "calc(65vh - 51px)"}}>
          {/* QR 입력 영역 */}
          <div className="d-inline-flex align-items-center">
            <div className="flex-grow-0 w-auto">
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
                    data={recapList}
                    onRowDoubleClick={(row) => setSelectedRow(row)}
                    onRowClick={(row: RndArticleRecapRes) => setSelectedRow(row)}
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

export default RecapListRegisterView;
