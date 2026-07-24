import React, { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createGlobalStyle } from "styled-components";
import { Card, Row } from "react-bootstrap";
import CustomTable from "../../../components/CustomTable";
import { getVtnTime, isEmpty, openKeypad } from "../../../utils/CommonUtil";
import TabletCommonPopup from "../popup/TabletCommonPopup";
import {
  BQrDetailParam,
  INPUT_COLUMNS,
  InputItems,
  InputState,
  QR_COLUMNS,
  QR_COLUMNS_MODIFY,
  QrItems,
} from "../../../constants/tablet/sewing/sewingInput";
import {
  deleteBQrListInfo,
  getSewingInputQrDetail,
  getSewingInputQrInfo,
  saveBQrListInfo,
} from "../../../redux/tablet/tabletSewingSlice";
import { Payload } from "../../../constants/common/common";
import { HEADER_PROPS } from "../../../constants/common/common";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
  }

  #root {
    background-color: var(--color-black);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .container {
    text-align: center;
    .card.preview {
      height: 100px;
      border-radius: 20px;
      justify-content: center;
    }

    li {
      list-style-type: none;
    }

    .logoutBtn {
      position: absolute;
      top: 10%;
      right: 10%;
    }
  }
`;

const SewingInput = forwardRef((props: HEADER_PROPS, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
    handleDelete,
    handleSave,
    handleInputMode,
  }));

  const { user, userEnvInfo, line, workTime, workTimeIdx } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    isPass: state.Tablet.isPass,
    userEnvInfo: state.Tablet.userEnvInfo,
    line: state.Tablet.line,
    workTime: state.Tablet.workTime,
    workTimeIdx: state.Tablet.workTimeIdx,
  }));

  // table 컬럼
  const [qrColumns] = useState(QR_COLUMNS);
  const [qrModifyColumns] = useState(QR_COLUMNS_MODIFY);
  const [inputColumns] = useState(INPUT_COLUMNS);

  // table 데이터
  const [qrList, setQrList] = useState<QrItems[]>([]);
  const [inputList, setInputList] = useState<InputItems[]>([]);
  const [originInputList, setOriginInputList] = useState<InputItems[]>([]);

  // 선택된 행,열 값
  const [inputIdx, setInputIdx] = useState<InputState>([0, ""]);
  const [isScan, setIsScan] = useState<boolean>(false);
  const [saveQrCOde, setSaveQrCOde] = useState<string>("");

  const [inputMode, setInputMode] = useState<string>("input");
  const [selectSeqQr, setSelectSeqQr] = useState<string>("");

  // 헤더 정보 입력
  useEffect(() => {
    let params = {
      headerInfo: {
        isQrSearch: true,
        titleName: "SewingInput",
        isLineSelect: true,
        isInputMode: true,
      },
    };

    setHeaderLayoutInfo(params);
  }, []);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // 입력 키보드 팝업 오픈
  const keyPopOpen = (rowIdx: number, columnName: string) => {
    if (columnName === "dft" || columnName === "sewIn") {
      if (!(Number(inputList[rowIdx].qtCut) === 0 && Number(inputList[rowIdx].balance) === 0)) {
        setInputIdx([rowIdx, columnName]);
        openKeypad();
      }
    }
  };

  // SEW, DFT IN 입력 Handler
  const setInputQtyHandler = (val: number) => {
    setInputList((prevList) => {
      const updatedList = prevList.map((item, index) => {
        if (index === inputIdx[0]) {
          const originItem = originInputList[index];
          const sewInValue = String(
            Math.abs(Number(originItem.balance) + Math.ceil(Number(originItem.balance) / 10)) < val
              ? Math.abs(Number(originItem.balance) + Math.ceil(Number(originItem.balance) / 10))
              : val
          );
          if (inputIdx[1] === "sewIn") {
            return {
              ...item,
              [inputIdx[1]]: sewInValue,
              ttlSewIn: String(Number(originItem.ttlSewIn) + (Number(sewInValue) - Number(originItem.sewIn))),
              balance: String(
                Number(originItem.ttlSewIn) + (Number(sewInValue) - Number(originItem.sewIn)) - Number(originItem.qtCut)
              ),
            };
          } else {
            const limit = qrList.find((qr) => qr.seqSz === item.seqSz);

            if (inputMode === "input" && !isEmpty(limit)) {
              const valChk = Number(item.sewIn) + val > Number(limit?.layerCount);
              return {
                ...item,
                [inputIdx[1]]: String(val),
                sewIn: valChk
                  ? String(Number(item.sewIn) - (val >= Number(item.sewIn) ? Number(item.sewIn) : val))
                  : item.sewIn,
                ttlSewIn: valChk
                  ? String(Number(item.ttlSewIn) - (val >= Number(item.sewIn) ? Number(item.sewIn) : val))
                  : item.sewIn,
                balance: valChk
                  ? String(Number(item.balance) - (val >= Number(item.sewIn) ? Number(item.sewIn) : val))
                  : item.balance,
                ttlDft: String(Number(originItem.ttlDft) + (val - Number(originItem.dft))),
              };
            } else {
              return {
                ...item,
                [inputIdx[1]]: String(val),
                ttlDft: String(Number(originItem.ttlDft) + (val - Number(originItem.dft))),
              };
            }
          }
        }
        return item;
      });

      const totalSewIn = updatedList.reduce((sum, item) => sum + Number(item.sewIn), 0);
      const totalDftIn = updatedList.reduce((sum, item) => sum + Number(item.dft), 0);

      // qrList qtLod 합계
      setQrList((prevQrList) =>
        prevQrList.map((qrItem) => {
          if (qrItem.isChecked) {
            return {
              ...qrItem,
              qtLod: String(totalSewIn),
              qtDft: String(totalDftIn),
              balance: String(totalSewIn - Number(qrItem.layerCount)),
            };
          }
          return qrItem;
        })
      );

      return updatedList;
    });
    setIsScan(true);
  };

  // 전체 체크 / 해제 이벤트
  const handleHeaderCheckboxChange = (checked: boolean) => {
    setQrList((prevQrList) =>
      prevQrList.map((item) => ({
        ...item,
        isChecked: checked,
      }))
    );
  };

  // qr row 체크 이벤트
  const handleRowSelectionChange = (selectedRowIndex: number) => {
    setQrList((prevQrList) =>
      prevQrList.map((item, index) => ({
        ...item,
        isChecked: index === selectedRowIndex ? !item.isChecked : false,
      }))
    );
    const selectedQrItem = qrList[selectedRowIndex];
    setSelectSeqQr(selectedQrItem.iseqQrcode);
    if (!selectedQrItem.isChecked) {
      if (!isScan) {
        const workInfo = {
          cdCompany: userEnvInfo.cdCompany,
          cdBizarea: userEnvInfo.cdBizarea,
          cdFty: userEnvInfo.cdFty,
          dtsWk: workTime,
          sewLn: String(Number(line?.sewLn)),
          idWork: user?.userId,
          insertDt: getVtnTime().slice(0, 10),
        };

        let params = {
          workInfo: workInfo,
          qrInfo: selectedQrItem,
        };

        if (!params.qrInfo.partNm.includes("RIB")) {
          getBQrDetail(params);
        } else {
          setInputList([]);
          setOriginInputList([]);
        }
      } else {
        setSaveQrCOde(selectedQrItem.qrCode);
        window.ui.modal.open("savePop");
      }
    }
  };

  // 삭제 이벤트
  const setDelete = () => {
    window.ui.modal.close("confirmPop");
    if (!isEmpty(inputList)) {
      if (inputMode === "input") {
        setQrList([]);
        setInputList([]);
        setIsScan(false);
      } else {
        const workInfo = {
          cdCompany: userEnvInfo.cdCompany,
          cdBizarea: userEnvInfo.cdBizarea,
          cdFty: userEnvInfo.cdFty,
          dtsWk: workTime,
          seqWk: qrList.find((item) => item.qrCode === inputList[0].qrCode)?.seqWk,
          sewLn: String(Number(line?.sewLn)),
          idWork: user?.userId,
          insertDt: getVtnTime().slice(0, 10),
          seqFab: qrList.find((item) => item.qrCode === inputList[0].qrCode)?.seqFab,
          seqClr: qrList.find((item) => item.qrCode === inputList[0].qrCode)?.seqClr,
          iseqQrcode: selectSeqQr,
        };

        let params = {
          workInfo: workInfo,
          qrList: inputList.filter((item) => item.sewIn !== "0" || item.dft !== "0"),
        };

        dispatch(deleteBQrListInfo(params)).then((res) => {
          const payload = res.payload as Payload;

          if (payload.status === 200) {
            window.ui.modal.toast("Delete Success");

            setQrList((prevQrList) => prevQrList.filter((item) => item.iseqQrcode !== params.workInfo?.iseqQrcode));
            setInputList([]);
            setIsScan(false);
          } else {
            if (payload.errorCode === "999") {
              window.ui.modal.toast(payload.errResult.ErrorMessage);
            }
          }
        });
      }
    }
  };

  // BQr Detail list 조회
  const getBQrDetail = (params: BQrDetailParam) => {
    dispatch(getSewingInputQrDetail(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        if (inputMode === "input") {
          setInputList((prevList) => {
            const updatedList = payload.data.map((item: InputItems) => {
              if (item.seqSz === params.qrInfo.seqSz) {
                return {
                  ...item,
                  sewIn: params.qrInfo.layerCount,
                  ttlSewIn: Number(item.ttlSewIn) + Number(params.qrInfo.layerCount),
                  balance: Number(item.balance) + Number(params.qrInfo.layerCount),
                };
              }
              return item;
            });

            const totalSewIn = updatedList.reduce((sum: number, item: any) => sum + Number(item.sewIn), 0);
            const totalDftIn = updatedList.reduce((sum: number, item: any) => sum + Number(item.dft), 0);

            // qrList qtLod 합계
            setQrList((prevQrList) =>
              prevQrList.map((qrItem) => {
                if (qrItem.isChecked) {
                  return {
                    ...qrItem,
                    qtLod: String(totalSewIn),
                    qtDft: String(totalDftIn),
                    balance: String(totalSewIn - Number(qrItem.layerCount)),
                  };
                }
                return qrItem;
              })
            );

            return updatedList;
          });

          setIsScan(true);
        } else {
          setInputList(payload.data);
        }
        setOriginInputList(payload.data);

        // qrList qtLod 합계
        setQrList((prevQrList) =>
          prevQrList.map((item) => {
            if (item.qrCode === params.qrInfo.qrCode && item.isChecked) {
              const totalSewIn = payload.data.reduce((sum: number, listItem: any) => sum + Number(listItem.sewIn), 0);
              const totalDftIn = payload.data.reduce((sum: number, listItem: any) => sum + Number(listItem.dft), 0);
              return {
                ...item,
                qtLod: String(totalSewIn),
                qtDft: String(totalDftIn),
              };
            }
            return item;
          })
        );
      }
    });
  };

  // 저장 후 조회
  const saveBQrInfo = () => {
    handleSave();
    window.ui.modal.close("savePop");
    getBQrInfo(saveQrCOde);
  };

  // 취소 후 조회
  const cancelBQrInfo = () => {
    // qrList inputQty 초기화
    setQrList((prevQrList) => prevQrList.filter((item, index) => item.qrCode !== inputList[0]?.qrCode));
    setInputList([]);
    closeSavePop();
  };

  // save 팝업 닫기
  const closeSavePop = () => {
    window.ui.modal.close("savePop");
    getBQrInfo(saveQrCOde);
    setIsScan(false);

    const totalSewIn = originInputList.reduce((sum: number, item: any) => sum + Number(item.sewIn), 0);
    const totalDftIn = originInputList.reduce((sum: number, item: any) => sum + Number(item.dft), 0);
    // qrList qtLod 초기화
    setQrList((prevQrList) =>
      prevQrList.map((qrItem) => {
        if (qrItem.qrCode === originInputList[0]?.qrCode && qrItem.isChecked) {
          return {
            ...qrItem,
            qtLod: String(totalSewIn),
            qtDft: String(totalDftIn),
            balance: String(totalSewIn - Number(qrItem.layerCount)),
          };
        }
        return qrItem;
      })
    );
  };

  // BQr 가져오기
  const getBQrInfo = (val: any) => {
    let params = {
      qrCode: val,
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      dataType: inputMode,
    };

    dispatch(getSewingInputQrInfo(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const workInfo = {
          cdCompany: userEnvInfo.cdCompany,
          cdBizarea: userEnvInfo.cdBizarea,
          cdFty: userEnvInfo.cdFty,
          dtsWk: workTime,
          sewLn: String(Number(line?.sewLn)),
          idWork: user?.userId,
          insertDt: getVtnTime().slice(0, 10),
          dataType: inputMode,
        };
        let params = {
          workInfo: workInfo,
          qrInfo: inputMode === "input" ? payload.data : payload.data[0],
        };

        if (!params.qrInfo.partNm.includes("RIB")) {
          getBQrDetail(params);
        } else {
          setInputList([]);
          setOriginInputList([]);
        }

        if (inputMode === "input") {
          setSelectSeqQr(payload.data.iseqQrcode);
          setQrList((prevQrList) => {
            const isQrCodePresent = prevQrList.some((item) => item.qrCode === payload.data.qrCode);

            if (!isQrCodePresent) {
              const newData = {
                ...payload.data,
              };
              const newList = [newData, ...prevQrList];
              const totalItems = newList.length;
              return newList.map((item, index) => ({
                ...item,
                no: totalItems - index,
                isChecked: index === 0 ? true : false,
                qtLod: "0",
                qtDft: "0",
                balance: String(0 - Number(item.layerCount)),
              }));
            }

            return prevQrList;
          });
        } else {
          setSelectSeqQr(payload.data[0].iseqQrcode);

          const updatedData = payload.data.map((item: QrItems, index: number) => ({
            ...item,
            no: payload.data.length - index,
            isChecked: index === 0 ? true : false,
          }));
          setQrList(updatedData);
        }
      } else {
        const errMsg = payload.errorMessage ?? "Data not found";
        window.ui.modal.toast(errMsg);
      }
    });
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    if (!isScan) {
      getBQrInfo(val);
    } else {
      setSaveQrCOde(val);
      window.ui.modal.open("savePop");
    }
  };

  // 삭제버튼 클릭 이벤트
  const handleDelete = () => {
    if (!isEmpty(inputList)) {
      window.ui.modal.open("confirmPop");
    }
  };

  // 저장버튼 클릭 이벤트
  const handleSave = () => {
    if (!isEmpty(inputList)) {
      const workInfo = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        dtsWk: workTime,
        seqWk: null,
        sewLn: String(Number(line?.sewLn)),
        idWork: user?.userId,
        workTimeIdx: workTimeIdx,
        insertDt: getVtnTime().slice(0, 10),
        seqFab: qrList.find((item) => item.qrCode === inputList[0].qrCode)?.seqFab,
        seqClr: qrList.find((item) => item.qrCode === inputList[0].qrCode)?.seqClr,
        iseqQrcode: selectSeqQr,
        dataType: inputMode,
      };

      let params = {
        workInfo: workInfo,
        qrList: inputList.filter((item) => item.sewIn !== "0" || item.dft !== "0"),
      };

      if (!isEmpty(params.qrList)) {
        dispatch(saveBQrListInfo(params)).then((res) => {
          const payload = res.payload as Payload;

          if (payload.status === 200) {
            window.ui.modal.toast("Save Success");
            setQrList((prevQrList) => prevQrList.filter((item) => item.qrCode !== params.qrList[0]?.qrCode));
            setInputList([]);
            setIsScan(false);
          } else {
            if (payload.errorCode === "999") {
              window.ui.modal.toast(payload.errResult.ErrorMessage);
            }
          }
        });
      }
    }
  };

  // Input Mode 변경 이벤트
  const handleInputMode = (val: any) => {
    setInputMode(val);
    setIsScan(false);
    setQrList([]);
    setInputList([]);
  };

  return (
    <>
      <Card style={{ marginTop: "2px" }}>
        <Row style={{ width: "100%" }}>
          <CustomTable
            columns={inputMode === "input" ? qrColumns : qrModifyColumns}
            data={qrList}
            isSelectable={true}
            isSortable={true}
            selectShow={true}
            onHeaderCheckboxChange={handleHeaderCheckboxChange}
            onRowSelectionChange={handleRowSelectionChange}
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tbodyClass="qrList"
            tableHeightClass="table-260"
          />
        </Row>

        <Row style={{ width: "100%", marginTop: "25px" }}>
          <CustomTable
            columns={inputColumns}
            data={inputList}
            isSelectable={true}
            isSortable={true}
            selectShow={false}
            onRowSelectionChange={keyPopOpen}
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tableHeightClass="table-260"
          />
        </Row>
      </Card>

      <TabletCommonPopup
        setValue={setInputQtyHandler}
        isConfirm={setDelete}
        isSave={saveBQrInfo}
        isCancel={cancelBQrInfo}
      />
    </>
  );
});

export default SewingInput;
