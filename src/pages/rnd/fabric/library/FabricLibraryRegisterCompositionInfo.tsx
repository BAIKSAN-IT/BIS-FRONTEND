import React, {memo, useEffect, useMemo, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import PisRndTable from "@components/table/PisRndTable";
import {FabricLibraryRegisterBasicInfoTableColumns} from "./FabricLibraryRegisterBasicInfoTableColumns";

/* redux */
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {
  getRndArticleAllList,
  getRndArticleQrCodeInfo,
  RndArticleQrCodeInfoReq,
  SaveRndArticleCompositionReq,
  SaveRndArticleFileReq,
  SaveRndArticleProcessReq,
  SaveRndArticleReq,
  SaveRndArticleStyleReq,
  SaveRndArticleYarnReq
} from "@redux/rnd/RndSlice";
import {CommonNeoeCodeRes, getCommonNeoeCodeDtlList} from "@redux/common/commonSlice";

/* constants */
import {Payload} from "@constants/common/common";

/* utils */
import {isEmpty} from "@utils/CommonUtil";
import {updateTableData} from "@utils/updateTableData";
import {addRow} from "@utils/addRow";

/* lb */
import Swal from "sweetalert2";
import TabletTopCommonPopup from "@pages/tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "@components/factory/QrReadePopup";
import QrCodeMainPis from "@components/common/QrCodeMainPis";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
  compositionList: SaveRndArticleCompositionReq[];
  setCompositionList: React.Dispatch<React.SetStateAction<SaveRndArticleCompositionReq[]>>;
  yarnList: SaveRndArticleYarnReq[];
  setYarnList: React.Dispatch<React.SetStateAction<SaveRndArticleYarnReq[]>>;
  processList: SaveRndArticleProcessReq[];
  setProcessList: React.Dispatch<React.SetStateAction<SaveRndArticleProcessReq[]>>;
  fileList: SaveRndArticleFileReq[];
  setFileList: React.Dispatch<React.SetStateAction<SaveRndArticleFileReq[]>>;
  styleList: SaveRndArticleStyleReq[];
  setStyleList: React.Dispatch<React.SetStateAction<SaveRndArticleStyleReq[]>>;
}

const FabricLibraryRegisterCompositionInfo = memo(
  ({
     articleList,
     setArticleList,
     compositionList,
     setCompositionList,
     yarnList,
     setYarnList,
     processList,
     setProcessList,
     fileList,
     setFileList,
     styleList,
     setStyleList
   }: Props) => {
    const dispatch = useDispatch<AppDispatch>();

    const {user} = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    /* SweetAlert - 단순 메시지 알림 */
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

    /* SweetAlert - 확인 취소 모달 */
    const confirmAction = (message: string, callback: () => void) => {
      Swal.fire({
        title: "Confirm",
        text: message,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "tight-swal-popup",
          title: "tight-swal-title",
          closeButton: "tight-swal-close",
          confirmButton: "small-swal-button",
          cancelButton: "small-swal-button",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          callback();
        }
      });
    };

    // QR 관련 상태
    const [showKeypadPopup, setShowKeypadPopup] = useState(false);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [qrValue, setQrValue] = useState("");

    const [compositionTypeList, setCompositionTypeList] = useState<CommonNeoeCodeRes[]>([]);

    // 1) state 추가 (컬럼 표시 여부)
    const [showFaceBack, setShowFaceBack] = useState(false);

    const [searchCompositionTypeParams, setSearchCompositionTypeParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "CZ_CA02118",
      cdSysdef: "",
      cdFlag1: "",
      fg1Syscode: "",
    });
    const onQrCodeSearch = async (qrcode: string) => {
      if (!qrcode) return showAlert("QR CODE is Required.");

      const codeReq: RndArticleQrCodeInfoReq = {
        cdCompany: user?.companyId || "1000",
        seqArticle: "",
        qrcode,
      };

      const qrRes: any = await dispatch(getRndArticleQrCodeInfo(codeReq));
      const qrData = qrRes?.payload?.data;

      if (!qrData || qrRes?.payload?.status !== 200) {
        return showAlert("QR Code Info No Data.");
      }

      const {seqArticle} = qrData;
      if (!seqArticle) return showAlert("Valid SeqArticle Not Found.");

      const articleReq = {
        cdCompany: user?.companyId || "1000",
        startDate: "00000000",
        endDate: "99991231",
        seqArticle: seqArticle,
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

      const articleRes: any = await dispatch(getRndArticleAllList(articleReq));
      const articleData = articleRes?.payload?.data;

      if (!articleData || articleRes?.payload?.status !== 200) {
        return showAlert("Article Info Not Found.");
      }

      setArticleList(articleData.rndArticleList || []);
      setYarnList(articleData.rndArticleYarnList || []);
      setProcessList(articleData.rndArticleProcessList || []);
      setCompositionList(articleData.rndArticleCompositionList || []);
      setFileList(articleData.rndArticleFileList || []);
      setStyleList(articleData.rndArticleStyleList || []);

      setQrValue('');
    };

    useEffect(() => {
      if ([11, 13].includes(qrValue.length)) {
        onQrCodeSearch(qrValue);
      }
    }, [qrValue]);

    const fetchCompositionTypeList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchCompositionTypeParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setCompositionTypeList(payload.data);
        } else {
          setCompositionTypeList([]);
        }
      });
    };

    useEffect(() => {
      fetchCompositionTypeList();
    }, [searchCompositionTypeParams]);

    const viewPairs = useMemo(() => {
      return (compositionList || [])
        .map((row, i) => ({i, row}))
        .filter((p) => p.row.ynFlag !== "D")
        .sort((a, b) => Number(a.row.sortSeq ?? 0) - Number(b.row.sortSeq ?? 0));
    }, [compositionList]);

    // 테이블에 줄 데이터
    const viewCompositionList = useMemo(() => viewPairs.map((p) => p.row), [viewPairs]);
    // "보이는 인덱스" -> "원본 인덱스"
    const visibleIndexes = useMemo(() => viewPairs.map((p) => p.i), [viewPairs]);

    const nextSortSeq = useMemo(() => {
      const maxSeq = viewPairs.reduce((m, p) => Math.max(m, Number(p.row.sortSeq || 0)), 0);
      return maxSeq + 1;
    }, [viewPairs]);

    const defaultRows = {
      composition: {
        cdCompany: user?.companyId || "1000",
        seqArticle: compositionList[0]?.seqArticle || "",
        cdFabric: "01",
        cdComposition: "01",
        rtComp: 0,
        rtCompBack: 0,
        sortSeq: nextSortSeq,
        ynFlag: "",
      },
    };

    const swapSortSeqByOriginalIndex = (origA: number, origB: number) => {
      setCompositionList((prev) => {
        const next = [...prev];
        const A = next[origA];
        const B = next[origB];
        if (!A || !B) return prev;

        const aSeq = Number(A.sortSeq ?? 0);
        const bSeq = Number(B.sortSeq ?? 0);

        next[origA] = {...A, sortSeq: bSeq};
        next[origB] = {...B, sortSeq: aSeq};
        return next;
      });
    };

    const handleMove = (viewRowIndex: number, dir: "up" | "down") => {
      const targetView = viewRowIndex;
      const neighborView = dir === "up" ? targetView - 1 : targetView + 1;

      if (neighborView < 0 || neighborView >= visibleIndexes.length) return; // 범위 밖

      const origA = visibleIndexes[targetView];
      const origB = visibleIndexes[neighborView];

      swapSortSeqByOriginalIndex(origA, origB);
    };

    const handleMoveUp = (viewRowIndex: number) => handleMove(viewRowIndex, "up");
    const handleMoveDown = (viewRowIndex: number) => handleMove(viewRowIndex, "down");

    const rowKeyExtractor = (r: SaveRndArticleCompositionReq) =>
      `${r.seqArticle ?? ""}-${r.cdFabric ?? ""}-${r.cdComposition ?? ""}`;
    const numericColumns = ["rtComp", "rtCompBack", "sortSeq"];

    const toNumberValue = (value: any) => {
      if (value === "" || value == null) return 0;

      const n = Number(value);
      return Number.isNaN(n) ? 0 : n;
    };

    const updateDataProxy = (viewRowIndex: number, columnId: string, value: any) => {
      const originalIndex = visibleIndexes[viewRowIndex];
      if (originalIndex == null) return;

      const targetRow = compositionList[originalIndex];
      if (!targetRow) return;

      // 삭제된 행은 수정하지 않음
      if (targetRow.ynFlag === "D") return;

      // MATERIAL 변경
      if (columnId === "cdComposition") {
        const newCdComposition = String(value ?? "");

        if ((targetRow.cdComposition ?? "") === newCdComposition) return;

        setCompositionList((prev) => {
          const current = prev[originalIndex];
          if (!current || current.ynFlag === "D") return prev;

          const isPersisted = !!(
            current.seqArticle &&
            current.cdFabric &&
            current.cdComposition
          );

          // 저장 전 신규행이면 값만 변경
          if (!isPersisted || current.ynFlag === "I") {
            const next = [...prev];

            next[originalIndex] = {
              ...current,
              cdComposition: newCdComposition,
              ynFlag: current.ynFlag || "I",
            };

            return next;
          }

          const next = [...prev];

          // 기존 저장행은 삭제 처리
          next[originalIndex] = {
            ...current,
            ynFlag: "D",
          };

          // 변경된 MATERIAL 신규행 추가
          next.push({
            ...current,
            cdComposition: newCdComposition,
            ynFlag: "I",
          });

          return next;
        });

        return;
      }

      // 숫자 컬럼은 updateTableData 거치지 않고 직접 number로 저장
      if (numericColumns.includes(columnId)) {
        setCompositionList((prev) => {
          const current = prev[originalIndex];
          if (!current || current.ynFlag === "D") return prev;

          const next = [...prev];

          next[originalIndex] = {
            ...current,
            [columnId]: toNumberValue(value),
          };

          return next;
        });

        return;
      }

      // 문자열 컬럼만 기존 updateTableData 사용
      updateTableData<SaveRndArticleCompositionReq, SaveRndArticleCompositionReq>(
        originalIndex,
        columnId,
        String(value ?? ""),
        compositionList,
        setCompositionList,
        {
          rowKeyExtractor,
        }
      );
    };
    // + 버튼 클릭시 발생하는 이벤트
    const handleAddRow = () => {
      addRow(compositionList, defaultRows.composition, setCompositionList);
    };

    const normalizeSortSeq = (list: SaveRndArticleCompositionReq[]) => {
      const pairs = list
        .map((row, i) => ({i, row}))
        .filter((p) => p.row.ynFlag !== "D")
        .sort((a, b) => Number(a.row.sortSeq ?? 0) - Number(b.row.sortSeq ?? 0));

      let seq = 1;
      const next = [...list];
      pairs.forEach((p) => {
        next[p.i] = {...next[p.i], sortSeq: seq++};
      });
      return next;
    };

    // 2) 보이는 인덱스로 삭제 수행(soft/hard)
    const removeByViewIndex = (viewRowIndex: number, hard = false) => {
      if (viewRowIndex == null || viewRowIndex < 0 || viewRowIndex >= visibleIndexes.length) return;

      const originalIdx = visibleIndexes[viewRowIndex];
      const target = compositionList[originalIdx];
      if (!target) return;

      confirmAction("행을 삭제하겠습니까?", () => {
        // 저장되어 있던 행인지 판별
        const persisted = !!(target?.seqArticle && target?.cdFabric && target?.cdComposition);

        if (persisted && !hard) {
          // === Soft delete: ynFlag = 'D'만 세팅(뷰에서는 사라짐)
          updateTableData<SaveRndArticleCompositionReq, SaveRndArticleCompositionReq>(
            originalIdx,
            "ynFlag",
            "D",
            compositionList,
            setCompositionList,
            {rowKeyExtractor}
          );
        } else {
          // === Hard delete: 배열에서 제거 + sortSeq 정리
          setCompositionList((prev) => {
            const next = prev.filter((_, i) => i !== originalIdx);
            return normalizeSortSeq(next); // 연속 번호로 정렬
          });
        }
      });
    };

    // 3) 기존 - 버튼도 마지막 보이는 행 기준으로 제거
    const handleRemoveRow = () => {
      if (visibleIndexes.length === 0) {
        showAlert("삭제할 행이 없습니다.");
        return;
      }
      removeByViewIndex(visibleIndexes.length - 1, false); // 마지막(soft)
    };

    useEffect(() => {
      if (!compositionList || compositionList.length === 0) return;

      const sortedComps = compositionList
        .filter((r) => r.ynFlag !== "D")
        .slice()
        .sort((a, b) => Number(b.rtComp) - Number(a.rtComp));

      const compositionString = sortedComps
        .map((comp) => {
          const matchedType = compositionTypeList.find((type) => type.cdSysdef === comp.cdComposition);
          const name = matchedType?.nmSysdef || comp.cdComposition;
          return `${comp.rtComp}% ${name}`;
        })
        .join(" / ");

      // articleList[0]의 composition 필드에 반영
      if (articleList.length > 0) {
        const updated = [...articleList];
        updated[0] = {
          ...updated[0],
          composition: compositionString,
        };
        setArticleList(updated);
      }
    }, [compositionList, compositionTypeList]);

    const total = viewCompositionList.reduce((sum, r) => sum + Number(r.rtComp || 0) + Number(r.rtCompBack || 0), 0);

    useEffect(() => {
      if (!compositionList || compositionList.length === 0) {
        setCompositionList([defaultRows.composition]);
      }
    }, []);

    // 2) rtCompBack 값이 "존재(0이 아님)"하면 컬럼은 무조건 계속 보이게
    const hasBackValue = useMemo(() => {
      return (compositionList || []).some((r) => r.ynFlag !== "D" && Number(r.rtCompBack || 0) !== 0);
    }, [compositionList]);

    useEffect(() => {
      if (hasBackValue) setShowFaceBack(true);
    }, [hasBackValue]);

    // 3) 버튼 클릭 시: 값 있으면 ON 유지 / 값 없으면 토글
    const handleShowFaceBack = () => {
      setShowFaceBack((prev) => (hasBackValue ? true : !prev));
    };
    return (
      <>
        <Card
          className="form-grid"
          style={{
            border: "1px solid #ddd",
            transform: "translateY(-20px)",
            height: "375px",
            transition: "height 0.3s ease-in-out",
          }}
        >
          <Card.Body>
            <Row>
              {/* Fabric Name 입력 필드 */}
              <Col md={12} style={{transform: "translateY(-12px)"}}>
                <div className="fg-row mb-2">
                  <label className="fg-label">HANGER/#</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{height: "27px", fontSize: "10px", backgroundColor: "#f2f2f2", cursor: "not-allowed"}}
                    value={articleList[0]?.cdHanger}
                    autoComplete="off"
                    readOnly={true}
                  />
                </div>
              </Col>
              {/* QR CODE 입력 필드 */}
              <Col md={12}>
                <div className="d-inline-flex align-items-center mb-2">
                  <div className="flex-grow-0 w-auto">
                    <QrCodeMainPis
                      value={qrValue}
                      onChange={(v) => setQrValue(v)}
                      readOnly={true}
                      onScanClick={() => setShowQrScanner(true)}
                      onKeypadOpen={() => {
                        (window as any).ui?.modal?.open?.("headerKeyPad");
                        setShowKeypadPopup(true);
                      }}
                      attachLabel
                      minInputPx={335}
                      labelTitle="QR CODE"
                    />
                  </div>
                </div>
              </Col>
              <Col md={12} style={{transform: "translateY(-24px)"}}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div style={{fontSize: "16px", fontWeight: "bold"}}>TOTAL: {total}%</div>

                  <div>
                    <Button variant="light" style={{fontSize: "10px"}} onClick={handleShowFaceBack}>
                      <i className="mdi mdi-eye-outline font-10"></i>
                    </Button>
                    <Button
                      variant="light"
                      style={{fontSize: "10px"}}
                      className={"gx-1"}
                      onClick={() => handleAddRow()}
                    >
                      <i className="mdi mdi-plus font-10"></i>
                    </Button>
                    <Button variant="light" style={{fontSize: "10px"}} onClick={() => handleRemoveRow()}>
                      <i className="mdi mdi-minus font-10"></i>
                    </Button>
                  </div>
                </div>
                <div className="card flex-grow-1 card-gray-border mb-1">
                  <div className="fabric-register-table-container" style={{height: "210px"}}>
                    <PisRndTable
                      columns={FabricLibraryRegisterBasicInfoTableColumns(
                        compositionTypeList,
                        handleMoveUp,
                        handleMoveDown,
                        (viewRowIndex: number, hard?: boolean) => removeByViewIndex(viewRowIndex, !!hard),
                        showFaceBack
                      )}
                      data={viewCompositionList}
                      updateData={updateDataProxy}
                      theadClass="table-custom-sales-light text-center font-12"
                      tableClass="table-custom-sales-background text-center font-12"
                      isSortable={true}
                    />
                  </div>
                </div>
                {/*<div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginTop: "16px",
                  }}
                >
                  {viewCompositionList.slice().map((comp, idx, arr) => {
                    const matchedType = compositionTypeList.find((type) => type.cdSysdef === comp.cdComposition);
                    const name = matchedType?.nmSysdef || comp.cdComposition;
                    const isLast = idx === arr.length - 1;

                    return (
                      <span key={idx}>
                        {name} {comp.rtComp}%{!isLast && " , "}
                      </span>
                    );
                  })}
                </div>*/}
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
  }
);

export default FabricLibraryRegisterCompositionInfo;
