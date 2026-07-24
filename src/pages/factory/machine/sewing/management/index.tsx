import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import styled from "styled-components";
import { HEADER_PROPS, Payload } from "../../../../../constants/common/common";
import { useTranslation } from "react-i18next";
import FactoryMachineQrHeader from "../../../../../components/factory/FactoryMachineQrHeader";
import FactoryMachineQrImgIfno from "../../../../../components/factory/FactoryMachineQrImgIfno";
import FactoryMachineQrStatus from "../../../../../components/factory/FactoryMachineQrStatus";
import SewingManagementHistory from "./SewingManagementHistory";
import { QrStatusTabType } from "../../../../../utils/QrStatusTab";
import SewingManagementChange from "./SewingManagementChange";
import SewingManagementBroken from "./SewingManagementBroken";
import SewingManagementDisposal from "./SewingManagementDisposal";
import {
  deleteSewingQrSystemBroken,
  deleteSewingQrSystemDisposal,
  deleteSewingQrSystemHistory,
  deleteSewingQrSystemRepair,
  getSewingQrSystemHistoryList,
  getSewingQrSystemInfo,
  saveSewingQrSystem,
  saveSewingQrSystemBroken,
  saveSewingQrSystemDisposal,
  saveSewingQrSystemRepair,
  SewingQrSystemHistoryListRes,
  SewingQrSystemRes,
} from "../../../../../redux/factory/factoryQrSystemSlice";
import { isEmpty } from "../../../../../utils/CommonUtil";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/store";
import TabletTopCommonPopup from "../../../../tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "../../../../../components/factory/QrReadePopup";
import SewingManagementRepair from "./SewingManagementRepair";

/* lb */
import Swal from "sweetalert2";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const SewingManageMent = forwardRef((props: HEADER_PROPS, ref) => {
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
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState("");

  /* Header 날짜 및 타이틀 문구 */
  useImperativeHandle(ref, () => ({}));

  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };
  useEffect(() => {
    setHeaderLayoutInfo({
      titleName: "SEWING MANAGEMENT QR",
    });
  }, []);

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  // 이력조회, 변경, 고장 ,폐기 선택 탭
  const [selectedTab, setSelectedTab] = useState<QrStatusTabType>("history");

  // QR 정보 검색조건
  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "",
    cdBizarea: user?.cdBizarea || "",
    cdQr: "",
  });
  const [sewingQrSystemInfo, setSewingQrSystemInfo] = useState<SewingQrSystemRes | null>();
  const [sewingQrSystemHistoryList, setSewingQrSystemHistoryList] = useState<SewingQrSystemHistoryListRes[]>([]);

  // 이력조회에서 체크 박스 선택 후 삭제하는 API에 보내기위해 담아줄 useState
  const [selectedRow, setSelectedRow] = useState<SewingQrSystemHistoryListRes | null>();
  const [selectedChangeRow, setSelectedChangeRow] = useState<SewingQrSystemHistoryListRes | null>(null);
  const [selectedBrokenRow, setSelectedBrokenRow] = useState<SewingQrSystemHistoryListRes | null>(null);
  const [selectedRepairRow, setSelectedRepairRow] = useState<SewingQrSystemHistoryListRes | null>(null);
  const [selectedDisposalRow, setSelectedDisposalRow] = useState<SewingQrSystemHistoryListRes | null>(null);

  // 해더에 선택할 라인과 factory
  const [selectedFactory, setSelectedFactory] = useState<string | null>();
  const [selectedLine, setSelectedLine] = useState<string | null>();

  useEffect(() => {
    if (sewingQrSystemInfo?.cdFty) {
      setSelectedFactory(sewingQrSystemInfo.cdFty);
    }
    if (sewingQrSystemInfo?.cdLine) {
      setSelectedLine(sewingQrSystemInfo.cdLine);
    }
  }, [sewingQrSystemInfo]);

  const [showKeypadPopup, setShowKeypadPopup] = useState(false); // KeyPad 팝업
  const [showQrScanner, setShowQrScanner] = useState(false); //QrReader 팝업
  const [isFixTab, setIsFixTab] = useState(false); //변경 탭 고정 체크박스
  const [fixedTab, setFixedTab] = useState<QrStatusTabType | null>(null);
  useEffect(() => {
    if (isFixTab) {
      setFixedTab(selectedTab); // 현재 탭을 고정
    } else {
      setFixedTab(null); // 해제 시 고정 해제
    }
  }, [isFixTab]);
  //이미지 경로와 이름 저장을 위함
  const [imgPath, setImgPath] = useState("");
  const [imgFname, setImgFname] = useState("");

  useEffect(() => {
    if (sewingQrSystemInfo?.imgPath) {
      setImgPath(sewingQrSystemInfo.imgPath);
    }
    if (sewingQrSystemInfo?.imgFname) {
      setImgFname(sewingQrSystemInfo.imgFname);
    }
  }, [sewingQrSystemInfo]);

  //이미지
  const handleImageMetaChange = (path: string, fname: string) => {
    setImgPath(path);
    setImgFname(fname);
  };

  // 키패드 입력 시 처리
  const handleKeypadSearch = (val: string) => {
    const next = {
      ...searchParams,
      cdQr: val,
    };
    setSearchParams(next);
    fetchSewingQrSystemInfo(next);
    fetchSewingQrSystemHistoryList(next);
    setShowKeypadPopup(false);
  };

  /* QR 정보 IMG 정보 조회 */
  const fetchSewingQrSystemInfo = (params = searchParams) => {
    dispatch(getSewingQrSystemInfo(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSewingQrSystemInfo(payload.data);
      } else {
        setSewingQrSystemInfo(null);
        setErrorMsg(payload.errorMessage || "QR Data not found.");
      }
    });
  };
  /* QR HISTORY 목록 조회 */
  const fetchSewingQrSystemHistoryList = (params = searchParams) => {
    dispatch(getSewingQrSystemHistoryList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSewingQrSystemHistoryList(payload.data);
      } else {
        setSewingQrSystemHistoryList([]);
        setErrorMsg(payload.errorMessage || "History Data not found.");
      }
    });
  };
  const handleTabChange = (tab: QrStatusTabType) => {
    if (isFixTab && fixedTab) {
      setSelectedTab(fixedTab); // 강제 고정 탭
    } else {
      setSelectedTab(tab);
    }
    if (tab === "change") {
      setSelectedChangeRow(null);
    }
    // 더블클릭 아님 → 선택된 row 초기화
    setSelectedRow(null);
    setSelectedChangeRow(null);
    setSelectedBrokenRow(null);
    setSelectedRepairRow(null);
    setSelectedDisposalRow(null);
  };
  // History에서 row 클릭시
  const handleRowClick = (row: SewingQrSystemHistoryListRes) => {
    switch (row.astSw) {
      case "00":
      case "11":
        setSelectedChangeRow(row);
        break;
      case "22":
      case "33":
        setSelectedBrokenRow(row);
        break;
      case "66":
        setSelectedRepairRow(row);
        break;
      case "88":
      case "99":
        setSelectedDisposalRow(row);
        break;
      default:
        break;
    }

    setSelectedRow(row); // 삭제용 공통 row
  };

  // History에서 row 더블 클릭 시
  const handleRowDoubleClick = (row: SewingQrSystemHistoryListRes) => {
    if (isFixTab && fixedTab) return; // 고정된 경우 무시

    switch (row.astSw) {
      case "00":
      case "11":
        setSelectedTab("change");
        setSelectedChangeRow(row);
        break;
      case "22":
      case "33":
        setSelectedTab("broken");
        setSelectedBrokenRow(row);
        break;
      case "66":
        setSelectedTab("repair");
        setSelectedRepairRow(row);
        break;
      case "88":
      case "99":
        setSelectedTab("disposal");
        setSelectedDisposalRow(row);
        break;
      default:
        setSelectedTab("history");
    }
  };

  // 검색 버튼
  const onSearchButtonClick = () => {
    fetchSewingQrSystemInfo();
    fetchSewingQrSystemHistoryList();
    setSelectedTab(isFixTab && fixedTab ? fixedTab : "history");
  };

  // 초기화 버튼
  const onResetButtonClick = () => {
    setSelectedTab(isFixTab && fixedTab ? fixedTab : "history");
    setSewingQrSystemInfo(null);
    setSewingQrSystemHistoryList([]);
    setSelectedChangeRow(null);
    setSelectedBrokenRow(null);
    setSelectedRepairRow(null);
    setSelectedDisposalRow(null);
    setSearchParams({ cdCompany: user?.companyId || "", cdBizarea: user?.cdBizarea || "", cdQr: "" });
    setShowKeypadPopup(false);
    setShowQrScanner(false);
  };

  //삭제 버튼
  const onDeleteButtonClick = () => {
    if (!selectedRow) {
      showAlert(t("common.remove.tabMove"));
      return;
    }

    confirmAction(t("common.confirm.delete"), () => {
      const deleteParam = {
        cdCompany: selectedRow.cdCompany,
        cdBizarea: selectedRow.cdBizarea,
        astCode: sewingQrSystemInfo?.astCode || "",
        astSeq: selectedRow.astSeq,
      };

      const handleResult = (res: any, successMsg: string, clear: () => void) => {
        const payload = res.payload as Payload;
        if (payload.status === 200) {
          showAlert(successMsg);
          fetchSewingQrSystemHistoryList();
          clear();
        } else {
          showAlert(t("common.alert.deleteFail") + payload.errorMessage);
        }
      };

      switch (selectedTab) {
        case "change":
          dispatch(deleteSewingQrSystemHistory(deleteParam)).then((res) =>
            handleResult(res, t("common.confirm.deleteSuccess"), () => {
              setSelectedRow(null);
              setSelectedChangeRow(null);
              setSelectedTab("history");
            })
          );
          break;
        case "broken":
          dispatch(deleteSewingQrSystemBroken(deleteParam)).then((res) =>
            handleResult(res, t("common.confirm.deleteSuccess"), () => {
              setSelectedRow(null);
              setSelectedBrokenRow(null);
              setSelectedTab("history");
            })
          );
          break;
        case "repair":
          dispatch(deleteSewingQrSystemRepair(deleteParam)).then((res) =>
            handleResult(res, t("common.confirm.deleteSuccess"), () => {
              setSelectedRow(null);
              setSelectedRepairRow(null);
              setSelectedTab("history");
            })
          );
          break;
        case "disposal":
          dispatch(deleteSewingQrSystemDisposal(deleteParam)).then((res) =>
            handleResult(res, t("common.confirm.deleteSuccess"), () => {
              setSelectedRow(null);
              setSelectedDisposalRow(null);
              setSelectedTab("history");
            })
          );
          break;
        default:
          showAlert(t("common.alert.deleteFailTab"));
      }
    });
  };

  // 저장 버튼
  const onSaveButtonClick = () => {
    if (!sewingQrSystemInfo) {
      showAlert(t("common.alert.qrInfoCheck"));
      return;
    }

    confirmAction(t("common.confirm.save"), () => {
      switch (selectedTab) {
        case "change":
          handleChangeSave();
          break;
        case "broken":
          handleBrokenSave();
          break;
        case "repair":
          handleRepairSave();
          break;
        case "disposal":
          handleDisposalSave();
          break;
        default:
          showAlert(t("common.alert.saveTabChoice"));
      }
    });
  };

  //변경
  const handleChangeSave = () => {
    const form = document.getElementById("changeForm") as HTMLFormElement;
    const formData = new FormData(form);

    const param = {
      cdCompany: searchParams.cdCompany,
      cdBizarea: searchParams.cdBizarea,
      astCode: sewingQrSystemInfo?.astCode || "",
      astSw: formData.get("astSw")?.toString() || "",
      astSeq: formData.get("astSeq")?.toString() || "",
      dtsJob: formData.get("dtsJob")?.toString().replaceAll("-", "") || "",
      model: sewingQrSystemInfo?.model || "",
      serialno: sewingQrSystemInfo?.serialNo || "",
      cdTypMachine: formData.get("cdTypMachine")?.toString() || "",
      astMcode: sewingQrSystemInfo?.astMcode || "",
      astScode1: sewingQrSystemInfo?.astScode1 || "",
      astScode2: sewingQrSystemInfo?.astScode2 || "",
      astScode3: sewingQrSystemInfo?.astScode3 || "",
      astScode4: sewingQrSystemInfo?.astScode4 || "",
      astScode5: sewingQrSystemInfo?.astScode5 || "",
      astScode6: sewingQrSystemInfo?.astScode6 || "",
      astScode7: sewingQrSystemInfo?.astScode7 || "",
      cdFty: selectedFactory || "",
      cdLine: Number(selectedLine) || 0,
      cdPosition: formData.get("cdPosition")?.toString() || "",
      prYymm: formData.get("prYymm")?.toString().replaceAll("-", "") || "",
      status: sewingQrSystemInfo?.status || "",
      dtsStart: sewingQrSystemInfo?.dtsStart || "",
      cdComp: formData.get("cdComp")?.toString() || "",
      dtsPurchase: formData.get("dtsPurchase")?.toString().replaceAll("-", "") || "",
      cdCrncyP: formData.get("cdCrncyP")?.toString() || "",
      amAmtP: formData.get("amAmtP")?.toString() || "",
      dtsRentS: formData.get("dtsRentS")?.toString().replaceAll("-", "") || "",
      dtsRentE: formData.get("dtsRentE")?.toString().replaceAll("-", "") || "",
      dtsRentR: formData.get("dtsRentR")?.toString().replaceAll("-", "") || "", // 선택사항이라면 "" 처리
      cdCrncyR: formData.get("cdCrncyR")?.toString() || "", // 선택사항이라면 "" 처리
      amAmtR: sewingQrSystemInfo?.amAmtR || "", // 선택사항이라면 "" 처리
      dcRmk: formData.get("dcRmk")?.toString() || "",
      imgPath: imgPath || "",
      imgFname: imgFname || "",
      idInsert: user?.userId || "",
      idUser: formData.get("idUser")?.toString() || "",
      nmUser: formData.get("nmUser")?.toString() || "",
      cdDept: formData.get("cdDept")?.toString() || "",
      nmDept: formData.get("nmDept")?.toString() || "",
    };

    dispatch(saveSewingQrSystem(param)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        showAlert(t("common.confirm.saveSuccess"));
        setSelectedRow(null);
        setSewingQrSystemHistoryList([]);
        fetchSewingQrSystemHistoryList(); // 변경 후 이력 갱신
        fetchSewingQrSystemInfo(); // 변경 후 이력 갱신
        setSelectedTab(isFixTab && fixedTab ? fixedTab : "history");
      } else {
        showAlert(t("common.alert.deleteFail") + payload.errorMessage);
      }
    });
  };
  //고장
  const handleBrokenSave = () => {
    const form = document.getElementById("brokenForm") as HTMLFormElement;
    const formData = new FormData(form);

    const param = {
      cdCompany: searchParams.cdCompany,
      cdBizarea: searchParams.cdBizarea,
      astCode: sewingQrSystemInfo?.astCode || "",
      astSw: formData.get("astSw")?.toString() || "", // 고장
      astSeq: selectedRow?.astSeq || null,
      dtsJob: formData.get("dtsJob")?.toString().replaceAll("-", "") || "",
      dtsReturn: formData.get("dtsReturn")?.toString().replaceAll("-", "") || "",
      descBroken: formData.get("descBroken")?.toString() || "",
      locReturn: formData.get("locReturn")?.toString() || "",
      idInsert: user?.userId || "",
      cdReturn: formData.get("cdReturn")?.toString() || "",
    };

    dispatch(saveSewingQrSystemBroken(param)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        showAlert(t("common.confirm.saveSuccess"));
        fetchSewingQrSystemHistoryList();
        fetchSewingQrSystemInfo();
        setSelectedTab("history");
      } else {
        showAlert(t("common.alert.deleteFail") + payload.errorMessage);
      }
    });
  };
  //수리
  const handleRepairSave = () => {
    const form = document.getElementById("repairForm") as HTMLFormElement;
    const formData = new FormData(form);

    const param = {
      cdCompany: searchParams.cdCompany,
      cdBizarea: searchParams.cdBizarea,
      astCode: sewingQrSystemInfo?.astCode || "",
      astSeq: selectedRow?.astSeq || null,
      dtsFix: formData.get("dtsFix")?.toString().replaceAll("-", "") || "", // 수리일자
      nmCompany: formData.get("nmCompany")?.toString() || "", // 수리업체
      nmPerson: formData.get("nmPerson")?.toString() || "", // 담당자
      amtFix: Number(formData.get("amtFix")) || 0, // 금액
      descFix: formData.get("descFix")?.toString() || "", // 내역
      ynFix: formData.get("ynFix")?.toString() || "N", // 완료여부
      idInsert: user?.userId || "",
    };

    dispatch(saveSewingQrSystemRepair(param)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        showAlert(t("common.confirm.saveSuccess"));
        fetchSewingQrSystemHistoryList();
        fetchSewingQrSystemInfo();
        setSelectedTab(isFixTab && fixedTab ? fixedTab : "history");
      } else {
        showAlert(t("common.alert.deleteFail") + payload.errorMessage);
      }
    });
  };
  //폐기
  const handleDisposalSave = () => {
    const form = document.getElementById("disposalForm") as HTMLFormElement;
    const formData = new FormData(form);

    const param = {
      cdCompany: searchParams.cdCompany,
      cdBizarea: searchParams.cdBizarea,
      astCode: sewingQrSystemInfo?.astCode || "",
      astSw: formData.get("astSw")?.toString() || "",
      dtsTrash: formData.get("dtsTrash")?.toString().replaceAll("-", "") || "",
      descTrash: formData.get("descTrash")?.toString() || "",
      nmCompany: formData.get("nmCompany")?.toString() || "",
      nmPerson: formData.get("nmPerson")?.toString() || "",
      amtTrash: Number(formData.get("amtTrash")) || 0,
      status: selectedRow?.status || "",
      idInsert: user?.userId || "",
    };

    dispatch(saveSewingQrSystemDisposal(param)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        showAlert(t("common.confirm.saveSuccess"));
        fetchSewingQrSystemHistoryList();
        fetchSewingQrSystemInfo();
        setSelectedTab(isFixTab && fixedTab ? fixedTab : "history");
      } else {
        showAlert(t("common.alert.deleteFail") + payload.errorMessage);
      }
    });
  };

  return (
    <>
      <Container>
        {/* QR CODE 및 검색, 삭제, 초기화, 저장 */}
        <FactoryMachineQrHeader
          onKeypadOpen={() => {
            window.ui.modal.open("headerKeyPad");
            setShowKeypadPopup(true);
          }}
          isFixTab={isFixTab}
          setIsFixTab={setIsFixTab}
          selectedFactory={selectedFactory}
          selectedLine={selectedLine}
          setSelectedFactory={setSelectedFactory}
          setSelectedLine={setSelectedLine}
          onQrScanOpen={() => setShowQrScanner(true)}
          onSearchButtonClick={onSearchButtonClick}
          onResetButtonClick={onResetButtonClick}
          onDeleteButtonClick={onDeleteButtonClick}
          onSaveButtonClick={onSaveButtonClick}
        />

        {/* Image 및 QR 정보 */}
        <FactoryMachineQrImgIfno sewingQrSystemInfo={sewingQrSystemInfo} onImageMetaChange={handleImageMetaChange} />

        {/* QR에 대한 현재 상태 (이력조회,변경,고장,폐기) */}
        <FactoryMachineQrStatus selectedTab={selectedTab} onTabChange={handleTabChange} />

        {/* 선택된 탭에 따라 컴포넌트 표시 (이력조회,변경,고장,폐기)*/}
        {selectedTab === "history" && (
          <SewingManagementHistory
            sewingQrSystemHistoryList={sewingQrSystemHistoryList}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
          />
        )}
        {selectedTab === "change" && (
          <SewingManagementChange
            key={`change-${selectedChangeRow?.seq || "init"}-${selectedChangeRow ? "edit" : "new"}`}
            selectedRow={selectedChangeRow}
            sewingQrSystemInfo={sewingQrSystemInfo}
            selectedFactory={selectedFactory}
            selectedLine={selectedLine}
            setSelectedFactory={setSelectedFactory}
            setSelectedLine={setSelectedLine}
            selectedTab={selectedTab}
          />
        )}
        {selectedTab === "broken" && (
          <SewingManagementBroken key={`broken-${selectedBrokenRow?.seq || "new"}`} selectedRow={selectedBrokenRow} />
        )}
        {selectedTab === "repair" && (
          <SewingManagementRepair key={`repair-${selectedRepairRow?.seq || "new"}`} selectedRow={selectedRepairRow} />
        )}
        {selectedTab === "disposal" && (
          <SewingManagementDisposal
            key={`disposal-${selectedDisposalRow?.seq || "new"}`}
            selectedRow={selectedDisposalRow}
          />
        )}
      </Container>

      {/* QR CODE 버튼 클릭 시 나오는 팝업 */}
      {showKeypadPopup && <TabletTopCommonPopup setSearchValue={handleKeypadSearch} />}

      {/* QR CODE INPUT 클릭 시 나오는 스캔 */}
      {showQrScanner && (
        <QrReaderPopup
          onScan={(value) => {
            const next = { ...searchParams, cdQr: value };
            setSearchParams(next);
            fetchSewingQrSystemInfo(next);
            fetchSewingQrSystemHistoryList(next);
            setShowQrScanner(false);
          }}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </>
  );
});

export default SewingManageMent;
