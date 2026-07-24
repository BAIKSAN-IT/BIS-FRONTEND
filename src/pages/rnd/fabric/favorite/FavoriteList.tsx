import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Card, Col, Form, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Swal from "sweetalert2";
import {AppDispatch, RootState} from "@redux/store";
import QrCodeCamera from "@components/common/QrCodeCamera";
import TabletTopCommonPopup from "@pages/tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "@components/factory/QrReadePopup";
import FavoriteListTableColumns from "./FavoriteListTableColumns";

import {
  addFavorite,
  clearFavorite,
  getRndArticleFavoriteAllList,
  mergeFavoriteFiles,
  patchFavoriteCell,
  RndArticleFavoriteRes,
  saveRndArticleFavorite,
} from "@redux/rnd/favoriteSlice";

import {getRndArticleQrCodeInfo, RndArticleQrCodeInfoReq, SaveRndArticleFileReq,} from "@redux/rnd/RndSlice";
import {downloadExcelWithImages} from "@utils/excelUtils";
import config from "../../../../config";
import PisVirtualTable from "@components/table/PisVirtualTable";

export type FabricRecapChildAPI = {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
};

const FavoriteList = forwardRef<FabricRecapChildAPI, {}>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);
  const token = useSelector((s: RootState) => s.Auth.token) ?? "";

  const favoriteList = useSelector((s: RootState) => s.favorite.list);
  const fileList = useSelector((s: RootState) => s.favorite.fileList);

  const [checkedRows, setCheckedRows] = useState<RndArticleFavoriteRes[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [isPrivateView, setIsPrivateView] = useState(false); //  기본값: 나만 보기
  const [showKeypadPopup, setShowKeypadPopup] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrValue, setQrValue] = useState("");

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

  /**  리스트 조회 */
  const fetchFavoriteList = () => {
    const rq = {
      cdCompany: user?.companyId || "1000",
      cdDept: user?.deptId || "", //  체크 상태에 따라 cdWorker 설정
      cdWorker: !isPrivateView ? user?.userId || "" : "", //  체크 상태에 따라 cdWorker 설정
      seq: 0,
      seqArticle: "",
    };
    dispatch(getRndArticleFavoriteAllList(rq));
  };

  useEffect(() => {
    fetchFavoriteList();
  }, [dispatch, user?.companyId, user?.userId, isPrivateView]); //  나만 보기 토글 시 자동 재조회

  /**  QR Code 검색 */
  const onQrCodeSearch = (qrcode: string) => {
    if (!qrcode) return showAlert("QR Code를 입력하세요.");

    const rq: RndArticleQrCodeInfoReq = {
      cdCompany: user?.companyId || "1000",
      seqArticle: "",
      qrcode,
    };

    dispatch(getRndArticleQrCodeInfo(rq)).then((res: any) => {
      const data = res?.payload?.data;
      if (res?.payload?.status === 200 && data) {
        const newData = Array.isArray(data) ? data[0] : data;
        dispatch(addFavorite([newData]));
        if (res?.payload?.data?.rndArticleFileList?.length) {
          dispatch(mergeFavoriteFiles(res.payload.data.rndArticleFileList));
        }
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


  /**  버튼 제어 */
  const isDisabled = isPrivateView;

  const onNew = () => {
    if (isDisabled) return showAlert("전체보기 상태에서는 신규 등록이 불가합니다.");
    dispatch(clearFavorite());
    setCheckedRows([]);
    setSelectedRow(null);
  };

  const onSave = async () => {
    if (isDisabled) return showAlert("전체보기 상태에서는 저장이 불가합니다.");
    if (!checkedRows.length) return showAlert("저장할 항목을 체크해 주세요.");
    try {
      const payload = checkedRows.map((r) => ({
        cdCompany: user?.companyId || "1000",
        cdWorker: user?.userId || "",
        seqArticle: r.seqArticle || "",
        remark: r.remark ?? "",
        useYn: r.useYn && r.useYn !== "" ? r.useYn : "1",
        idInsert: user?.userId || "",
        ynFlag: "",
      }));
      await dispatch(saveRndArticleFavorite(payload)).unwrap();
      showAlert("저장 완료");
    } catch {
      showAlert("저장 중 오류가 발생했습니다.");
    }
  };

  const onDelete = async () => {
    if (isDisabled) return showAlert("전체보기 상태에서는 삭제가 불가합니다.");
    if (!checkedRows.length) return showAlert("삭제할 항목을 체크해 주세요.");
    try {
      const payload = checkedRows.map((r) => ({
        cdCompany: user?.companyId || "1000",
        cdWorker: user?.userId || "",
        seqArticle: r.seqArticle || "",
        remark: r.remark ?? "",
        useYn: r.useYn ?? "",
        idInsert: user?.userId || "",
        ynFlag: "D",
      }));
      await dispatch(saveRndArticleFavorite(payload)).unwrap();
      showAlert("삭제 완료");
      dispatch(clearFavorite());
    } catch {
      showAlert("삭제 중 오류가 발생했습니다.");
    }
  };

  const onCheckboxChange = (row: any, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedRows((prev) => {
      const exists = prev.some((r) => r.seqArticle === row.seqArticle);
      return exists ? prev.filter((r) => r.seqArticle !== row.seqArticle) : [...prev, row];
    });
    setSelectedRow(null);
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
      return {...r, seqArticle: seq, remark: r.remark ?? "", imgUrl};
    });

    downloadExcelWithImages(columns, dataForTable, token, "FavoriteList.xlsx", 120, 70);
  };

  const updateData = (rowIndex: number, columnId: string, value: string) => {
    const target = favoriteList[rowIndex];
    if (!target) return;
    dispatch(
      patchFavoriteCell({
        seqArticle: target.seqArticle || "",
        field: columnId as keyof RndArticleFavoriteRes,
        value,
      })
    );
  };

  useImperativeHandle(ref, () => ({
    onQrCodeSearch,
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
    [fileList, user?.companyId,isPrivateView]
  );

  const detailDataForTable = useMemo(
    () =>
      favoriteList.map((r, idx) => {
        const seq = String(r.seqArticle ?? r.seqNo ?? idx);
        const file = fileList.find((f) => String(f.seqArticle) === seq);
        const fileName = file?.imgFileName && file.imgFileName.trim() !== "" ? file.imgFileName : file?.imgFileNameOrg;
        const imgUrl = fileName
          ? `${config.API_URL}/rnd/preview?seqArticle=${seq}&fileName=${encodeURIComponent(fileName)}`
          : null;
        return {...r, seqArticle: seq, remark: r.remark ?? r.remarkDetail ?? "", imgUrl};
      }),
    [favoriteList, fileList,isPrivateView]
  );

  const columns = useMemo(() => FavoriteListTableColumns(fileListForColumns), [fileListForColumns, favoriteList,isPrivateView]);

  return (
    <>
      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(-44px + 82vh)"}}>
          <div className="d-inline-flex align-items-center mb-1">
            <div className="">
              <QrCodeCamera
                value={qrValue}
                onChange={(v) => setQrValue(v)}
                readOnly={false}
                onScanClick={() => setShowQrScanner(true)}
                onKeypadOpen={() => {
                  window.ui?.modal?.open?.("headerKeyPad");
                  setShowKeypadPopup(true);
                }}
                attachLabel
                widthRatio={1 / 5}
                minInputPx={400}
              />
            </div>
            <Form.Check
              type="checkbox"
              id="privateView"
              label="View All"
              checked={isPrivateView}
              onChange={(e) => setIsPrivateView(e.target.checked)}
              className="ms-5 mb-3 d-flex align-items-center"
              style={{
                marginTop: "-20px",
                gap: "3px",
                transform: "scale(1.4)",
                transformOrigin: "top left",
                fontSize: "12px",
                cursor: "pointer",
                userSelect: "none",
              }}
            />
          </div>

          <Row className="align-items-stretch d-flex flex-wrap mt-n2">
            <Col xs={12} className="d-flex flex-column mt-n1">
              <div className="card flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-95px + 80vh)'}}>
                  <PisVirtualTable
                    columns={columns}
                    data={detailDataForTable}
                    onRowClick={(row) => setSelectedRow(row)}
                    onCheckboxChange={onCheckboxChange}
                    checkedRows={checkedRows}
                    selectedRow={selectedRow}
                    updateData={updateData}
                    theadClass="table-custom-rnd-light text-center font-12"
                    tableClass="table-custom-rnd-background text-center font-12"
                    isSelectable
                    isSortable
                    barHeightStyle={"calc(-100px + 81vh)"}
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

export default FavoriteList;
