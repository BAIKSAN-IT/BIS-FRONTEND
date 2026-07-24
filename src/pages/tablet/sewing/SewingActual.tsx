import React, {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createGlobalStyle, styled } from "styled-components";
import { Button, Card, Col, Row } from "react-bootstrap";
import CustomTable from "../../../components/CustomTable";
import { getVtnTime, isEmpty } from "../../../utils/CommonUtil";
import {
  setAutoSaveCnt,
  setIsPass,
  setNmPass,
} from "../../../redux/tablet/tabletSlice";
import {
  getSewingActualQrInfo,
  getSewingActualQrList,
  getTodaySewingActualQrList,
  deleteQrListInfo,
  saveQrListInfo,
} from "../../../redux/tablet/tabletSewingSlice";
import {
  QR_COLUMNS,
  PASS_COLUMNS,
  REJECT_COLUMNS,
  QrItems,
  PassItems,
  RejectItems,
} from "../../../constants/tablet/sewing/sewingActual";
import { Payload } from "../../../constants/common/common";
import { getCommonRejectCode } from "../../../redux/common/commonSlice";
import TabletCommonPopup from "../popup/TabletCommonPopup";
import { HEADER_PROPS } from "../../../constants/common/common";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    overflow: hidden;
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

const QrArea = styled.div`
  text-align: center;
  margin: 20px 0;
  padding-right: 0px;
`;

const SewingActual = forwardRef((props: HEADER_PROPS, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
    handleDelete,
    handleSave,
  }));

  const {
    user,
    isPass,
    userEnvInfo,
    line,
    workTime,
    workTimeIdx,
    autoSaveCnt,
  } = useSelector((state: RootState) => ({
    user: state.Auth.user,
    isPass: state.Tablet.isPass,
    userEnvInfo: state.Tablet.userEnvInfo,
    line: state.Tablet.line,
    workTime: state.Tablet.workTime,
    workTimeIdx: state.Tablet.workTimeIdx,
    autoSaveCnt: state.Tablet.autoSaveCnt,
  }));

  // const [remark, setRemark] = useState<string>("01");

  // table 컬럼
  const [qrColumns] = useState(QR_COLUMNS);
  const [passColumns] = useState(PASS_COLUMNS);
  const [rejectColumns] = useState(REJECT_COLUMNS);

  // table 데이터
  const [qrList, setQrList] = useState<QrItems[]>([]);
  const [passList, setPassList] = useState<PassItems[]>([]);
  const [originPassList, setOriginPassList] = useState<PassItems[]>([]);
  const [rejectList1, setRejectList1] = useState<RejectItems[]>([]);
  const [rejectList2, setRejectList2] = useState<RejectItems[]>([]);
  const [rejectList3, setRejectList3] = useState<RejectItems[]>([]);
  const [rejectList4, setRejectList4] = useState<RejectItems[]>([]);
  const [rejectList5, setRejectList5] = useState<RejectItems[]>([]);

  // 마운트 시점
  useEffect(() => {
    getTodayQrList();

    // 헤더 정보 입력
    let params = {
      headerInfo: {
        isQrSearch: true,
        selectPass: true,
        titleName: "SewingActual",
        isLineSelect: true,
      },
    };
    setHeaderLayoutInfo(params);
    dispatch(setAutoSaveCnt(5));

    let params2 = {
      cdFlag: ["Q200"],
    };

    // reject 사유 가져오기
    dispatch(getCommonRejectCode(params2)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const rejectData = payload.data as RejectItems[];
        const rejectLists = [
          setRejectList1,
          setRejectList2,
          setRejectList3,
          setRejectList4,
          setRejectList5,
        ];

        rejectLists.forEach((setRejectList, index) => {
          setRejectList(
            rejectData
              .filter((_, i) => i % 5 === index)
              .map((item) => ({
                cdSysdef: item.cdSysdef,
                nmSysdef: item.nmSysdef,
                nmSysdefE: item.nmSysdefE,
                nmSysdefV: item.nmSysdefV ?? item.nmSysdefE,
                isChecked: false,
              }))
          );
        });
      }
    });

    return () => {
      dispatch(setIsPass(true));
      dispatch(setNmPass("PASS"));
    };
  }, []);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  useEffect(() => {
    setSearchQrSum();

    if (qrList.length >= (autoSaveCnt ?? 0)) {
      handleSave();
    }
  }, [qrList, originPassList]);

  // useEffect(() => {
  //   setQrList((prevQrList) => {
  //     return prevQrList.map((item) => {
  //       const updatedItem = {
  //         ...item,
  //         outProc: item.isChecked && !isPass ? remark : item.outProc,
  //       };

  //       return updatedItem;
  //     });
  //   });
  // }, [remark]);

  useEffect(() => {
    updateQrListRejects();
  }, [rejectList1, rejectList2, rejectList3, rejectList4, rejectList5]);

  // reject 부위 수정 이벤트 핸들러
  // const handleRemarkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setRemark(event.target.value);
  // };

  // qr 컬럼 상태값 변경
  const setStatusChange = (isPass: boolean, nmPass: string) => {
    setQrList((prevQrList) => {
      return prevQrList.map((item) => {
        const updatedItem = {
          ...item,
          status: item.isChecked ? nmPass : item.status,
          rejectList: item.isChecked && isPass ? [] : item.rejectList,
          // outProc:
          //   item.isChecked && isPass
          //     ? ""
          //     : item.status === "REJECT"
          //     ? item.outProc
          //     : remark,
        };

        return updatedItem;
      });
    });
  };

  const setStatusValue = (isPass: boolean, nmPass: string) => {
    dispatch(setIsPass(isPass));
    dispatch(setNmPass(nmPass));
    setStatusChange(isPass, nmPass);

    if (!isPass) {
      const selectedQrItem = qrList.find((item) => item.isChecked);
      if (
        (selectedQrItem?.status === "RE-WORK" ||
          selectedQrItem?.status === "REJECT") &&
        !isPass &&
        selectedQrItem.rejectList
      ) {
        setRejectListsFromQrItem(selectedQrItem.rejectList);
        // setRemark(selectedQrItem.outProc);
      }
    } else {
      callResetRejectHandler();
    }
  };

  // Actual LIST 가져오기
  const getQrList = (qrInfo?: any) => {
    if (
      !passList.some(
        (item) =>
          item.seqStyle === qrInfo.seqStyle &&
          item.seqClr === qrInfo.seqClr &&
          item.seqSz === qrInfo.seqSz
      )
    ) {
      let params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        dtsWk: workTime,
        sewLn: line?.sewLn,
        seqClr: qrInfo.seqClr,
        seqOrd: qrInfo.seqOrd,
        seqSz: qrInfo.seqSz,
        seqStyle: qrInfo.seqStyle,
        qrCode: qrInfo.qrCode,
      };

      dispatch(getSewingActualQrList(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload?.status === 200 && !isEmpty(payload.data)) {
          setOriginPassList((prevOriginPassList) => {
            const newUniqueData = payload.data.filter(
              (newItem: any) =>
                !prevOriginPassList.some(
                  (existingItem) =>
                    existingItem.seqStyle === newItem.seqStyle &&
                    existingItem.seqClr === newItem.seqClr &&
                    existingItem.seqSz === newItem.seqSz
                )
            );

            const combinedData = [...newUniqueData, ...prevOriginPassList];
            const noData = combinedData.map((item, index, array) => ({
              ...item,
              no: array.length - index,
            }));
            return noData;
          });

          setPassList((prevPassList) => {
            const newUniqueData = payload.data.filter(
              (newItem: any) =>
                !prevPassList.some(
                  (existingItem) =>
                    existingItem.seqStyle === newItem.seqStyle &&
                    existingItem.seqClr === newItem.seqClr &&
                    existingItem.seqSz === newItem.seqSz
                )
            );

            const combinedData = [...newUniqueData, ...prevPassList];
            const noData = combinedData.map((item, index, array) => ({
              ...item,
              no: array.length - index,
            }));
            return noData;
          });
        }
      });
    }
  };

  // pass data 컬럼에 수량 추가
  const setSearchQrSum = () => {
    let updatedPassList = [...originPassList];

    qrList.forEach((item) => {
      updatedPassList = updatedPassList.map((originItem) => {
        if (
          originItem.seqStyle === item.seqStyle &&
          originItem.seqClr === item.seqClr &&
          originItem.seqSz === item.seqSz
        ) {
          if (item.status === "PASS") {
            return {
              ...originItem,
              qtSew: String(Number(originItem.qtSew) + 1),
              ttlSew: String(Number(originItem.ttlSew) + 1),
              balance: String(
                Number(originItem.ttlSew) + 1 - Number(originItem.ttlSewIn)
              ),
            };
          } else {
            return {
              ...originItem,
              reject: String(Number(originItem.reject) + 1),
            };
          }
        }
        return originItem;
      });
    });

    setPassList(updatedPassList);
  };

  // 당일 실적 Actual LIST 가져오기
  const getTodayQrList = () => {
    let params = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      cdFty: userEnvInfo.cdFty,
      dtsWk: workTime,
      sewLn: line?.sewLn,
    };

    dispatch(getTodaySewingActualQrList(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload?.status === 200 && !isEmpty(payload.data)) {
        const arrLen = payload.data.length;
        const Nodata = payload.data.map((item: PassItems, index: number) => ({
          ...item,
          no: arrLen - index,
        }));
        setOriginPassList(Nodata);
        setPassList(Nodata);
      }
    });
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    if (val) {
      let params = {
        qrCode: val,
      };

      dispatch(getSewingActualQrInfo(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200 && !isEmpty(payload.data)) {
          setQrList((prevQrList) => {
            const isQrCodePresent = prevQrList.some(
              (item) => item.qrCode === payload.data.qrCode
            );

            if (!isQrCodePresent) {
              const newData = {
                ...payload.data,
                status: "PASS",
                // outProc: isPass ? "" : remark,
                dtInsert: getVtnTime().replace("T", " ").slice(0, 19),
                dtIdx: workTimeIdx,
              };
              const newList = [newData, ...prevQrList];
              const totalItems = newList.length;
              return newList.map((item, index) => ({
                ...item,
                no: totalItems - index,
                isChecked: index === 0 ? true : false,
              }));
            }

            return prevQrList;
          });
          dispatch(setIsPass(true));
          dispatch(setNmPass("PASS"));

          if (!qrList.some((item) => item.qrCode === payload.data.qrCode)) {
            callResetRejectHandler();
            getQrList(payload.data);
          }
        } else {
          window.ui.modal.toast("Data not found");
        }
      });
    }
  };

  // 삭제버튼 클릭 이벤트
  const handleDelete = () => {
    if (!isEmpty(qrList.filter((item) => item.isChecked))) {
      window.ui.modal.open("confirmPop");
    }
  };

  const setDelete = () => {
    const workInfo = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      cdFty: userEnvInfo.cdFty,
      dtsWk: workTime,
      sewLn: String(Number(line?.sewLn)),
      idWork: user?.userId,
      workTimeIdx: workTimeIdx,
    };

    const deleteQrList = qrList.filter((item) => item.isChecked);
    const remainingQrList = qrList.filter((item) => !item.isChecked);
    let params = {
      workInfo: workInfo,
      qrList: deleteQrList,
    };

    dispatch(deleteQrListInfo(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        window.ui.modal.toast("Delete Success");
        getTodayQrList();
      }

      dispatch(setIsPass(true));
      dispatch(setNmPass("PASS"));
      setQrList(remainingQrList);
    });
    window.ui.modal.close("confirmPop");
  };

  // 저장버튼 클릭 이벤트
  const handleSave = () => {
    if (!isEmpty(qrList)) {
      const rejectQrList = qrList.filter((item) => item.status === "REJECT");

      if (rejectQrList.some((item) => isEmpty(item.rejectList))) {
        const empIdx = qrList.findIndex(
          (item) => item.status === "REJECT" && isEmpty(item.rejectList)
        );
        window.ui.modal.open("rejectPop");
        handleRowSelectionChange(empIdx);
      } else {
        const workInfo = {
          cdCompany: userEnvInfo.cdCompany,
          cdBizarea: userEnvInfo.cdBizarea,
          cdFty: userEnvInfo.cdFty,
          dtsWk: workTime,
          sewLn: String(Number(line?.sewLn)),
          idWork: user?.userId,
          workTimeIdx: workTimeIdx,
        };

        let params = {
          workInfo: workInfo,
          qrList: qrList,
        };

        dispatch(saveQrListInfo(params)).then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200) {
            window.ui.modal.toast("Save Success");
            if (isEmpty(payload.data)) {
              setQrList([]);
            } else {
              setQrList((prevQrList) =>
                prevQrList.filter((item) => payload.data.includes(item.qrCode))
              );
            }
            getTodayQrList();
            dispatch(setIsPass(true));
            dispatch(setNmPass("PASS"));

            callResetRejectHandler();
          }
        });
      }
    }
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

    // qrList 상태 업데이트 이후 dispatch 실행
    dispatch(setIsPass(selectedQrItem.status === "PASS" ? true : false));
  };

  // isPass가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    const selectedQrItem = qrList.find((item) => item.isChecked);

    if (!selectedQrItem) return;

    if (
      (selectedQrItem.status === "RE-WORK" ||
        selectedQrItem.status === "REJECT") &&
      !isPass &&
      selectedQrItem.rejectList
    ) {
      setRejectListsFromQrItem(selectedQrItem.rejectList);
      // setRemark(selectedQrItem.outProc);
    } else if (selectedQrItem.status === "PASS") {
      callResetRejectHandler();
    }
  }, [isPass, qrList]);

  // rejectList select 초기화
  const setRejectListsFromQrItem = (rejectList: string[]) => {
    setRejectList1((prevList) =>
      prevList.map((item) => ({
        ...item,
        isChecked: rejectList.includes(item.cdSysdef),
      }))
    );
    setRejectList2((prevList) =>
      prevList.map((item) => ({
        ...item,
        isChecked: rejectList.includes(item.cdSysdef),
      }))
    );
    setRejectList3((prevList) =>
      prevList.map((item) => ({
        ...item,
        isChecked: rejectList.includes(item.cdSysdef),
      }))
    );
    setRejectList4((prevList) =>
      prevList.map((item) => ({
        ...item,
        isChecked: rejectList.includes(item.cdSysdef),
      }))
    );
    setRejectList5((prevList) =>
      prevList.map((item) => ({
        ...item,
        isChecked: rejectList.includes(item.cdSysdef),
      }))
    );
  };

  // reject list 초기화 함수 호출
  const callResetRejectHandler = () => {
    resetRejectList(setRejectList1);
    resetRejectList(setRejectList2);
    resetRejectList(setRejectList3);
    resetRejectList(setRejectList4);
    resetRejectList(setRejectList5);
  };

  // reject list 초기화 함수
  const resetRejectList = (
    setRejectList: React.Dispatch<React.SetStateAction<RejectItems[]>>
  ) => {
    setRejectList((prevRejectList) =>
      prevRejectList.map((item) => ({
        ...item,
        isChecked: false,
      }))
    );
  };

  // reject row 체크 이벤트
  const handleRejectRowSelectionChange = (
    selectedRowIndex: number,
    listIndex: number
  ) => {
    const updateList = (
      list: RejectItems[],
      setList: React.Dispatch<React.SetStateAction<RejectItems[]>>
    ) => {
      const totalCheckedCount = [
        ...rejectList1,
        ...rejectList2,
        ...rejectList3,
        ...rejectList4,
        ...rejectList5,
      ].filter((item) => item.isChecked).length;

      setList(
        list.map((item, index) => {
          if (index === selectedRowIndex) {
            if (item.isChecked || totalCheckedCount < 5) {
              return {
                ...item,
                isChecked: !item.isChecked,
              };
            }
          }
          return item;
        })
      );
    };

    const checkQr = qrList.find((item) => item.isChecked);

    if (checkQr?.status === "RE-WORK" || checkQr?.status === "REJECT") {
      if (listIndex === 0) {
        updateList(rejectList1, setRejectList1);
      } else if (listIndex === 1) {
        updateList(rejectList2, setRejectList2);
      } else if (listIndex === 2) {
        updateList(rejectList3, setRejectList3);
      } else if (listIndex === 3) {
        updateList(rejectList4, setRejectList4);
      } else if (listIndex === 4) {
        updateList(rejectList5, setRejectList5);
      }
    }
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

  // qrList에 reject 사유 추가
  const updateQrListRejects = () => {
    const selectedRejects = [
      ...rejectList1,
      ...rejectList2,
      ...rejectList3,
      ...rejectList4,
      ...rejectList5,
    ]
      .filter((item) => item.isChecked)
      .map((item) => item.cdSysdef);

    setQrList((prevQrList) =>
      prevQrList.map((item) =>
        item.isChecked ? { ...item, rejectList: selectedRejects } : item
      )
    );
  };

  return (
    <>
      <Card style={{ marginTop: "2px" }}>
        <Row style={{ width: "100%" }}>
          <CustomTable
            columns={qrColumns}
            data={qrList}
            isSelectable={true}
            selectShow={true}
            isSortable={true}
            onRowSelectionChange={handleRowSelectionChange}
            onHeaderCheckboxChange={handleHeaderCheckboxChange}
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tbodyClass="qrList"
            tableHeightClass="table-260"
          />
        </Row>

        <Row style={{ width: "100%" }}>
          <QrArea>
            <Button
              variant="success"
              className="waves-effect waves-light btn btn-success"
              style={{ marginRight: "1%", fontSize: "20px", width: "49%" }}
              onClick={() => setStatusValue(true, "PASS")}
            >
              &nbsp;&nbsp;{t("PASS")}&nbsp;&nbsp;
            </Button>

            {/* <Button
              variant="warning"
              className="waves-effect waves-light btn btn-warning"
              style={{ marginRight: "1%", fontSize: "20px", width: "32%" }}
              onClick={() => setStatusValue(false, "RE-WORK")}
            >
              {t("RE-WORK")}
            </Button> */}

            <Button
              variant="danger"
              className="waves-effect waves-light btn btn-success"
              style={{ fontSize: "20px", width: "49%" }}
              onClick={() => setStatusValue(false, "REJECT")}
            >
              {t("REJECT")}
            </Button>
          </QrArea>
        </Row>

        {isPass && (
          <Row style={{ width: "100%" }}>
            <CustomTable
              columns={passColumns}
              data={passList}
              isSortable={true}
              tableClass="table-striped dt-responsive nowrap w-100 body-height"
              theadClass="table-gray"
              tableHeightClass="table-260"
            />
          </Row>
        )}
        {!isPass && (
          <Row style={{ width: "100%" }}>
            {/* <div className="mb-2" style={{ textAlign: "right" }}>
              <label className="form-label">REMARK &nbsp; | &nbsp;&nbsp;</label>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="Line"
                  value="01"
                  name="remark"
                  checked={remark === "01"}
                  onChange={handleRemarkChange}
                  className="form-check-input"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="Line">
                  LINE
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="cutting"
                  value="02"
                  name="remark"
                  checked={remark === "02"}
                  onChange={handleRemarkChange}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="cutting">
                  CUTTING
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="dispose"
                  value="03"
                  name="remark"
                  checked={remark === "03"}
                  onChange={handleRemarkChange}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="dispose">
                  폐기
                </label>
              </div>
            </div> */}

            {!isEmpty(rejectList1) && (
              <Col style={{ width: "20%" }}>
                <CustomTable
                  columns={rejectColumns}
                  data={rejectList1}
                  isSelectable={true}
                  selectShow={false}
                  isMultiple={true}
                  onRowSelectionChange={(selectedRowIndex) =>
                    handleRejectRowSelectionChange(selectedRowIndex, 0)
                  }
                  tableClass="table-striped dt-responsive nowrap w-100 body-height"
                  theadClass="table-gray"
                  tbodyClass="rejectList1"
                />
              </Col>
            )}
            {!isEmpty(rejectList2) && (
              <Col style={{ width: "20%" }}>
                <CustomTable
                  columns={rejectColumns}
                  data={rejectList2}
                  isSelectable={true}
                  selectShow={false}
                  isMultiple={true}
                  onRowSelectionChange={(selectedRowIndex) =>
                    handleRejectRowSelectionChange(selectedRowIndex, 1)
                  }
                  tableClass="table-striped dt-responsive nowrap w-100 body-height"
                  theadClass="table-gray"
                  tbodyClass="rejectList2"
                />
              </Col>
            )}
            {!isEmpty(rejectList3) && (
              <Col style={{ width: "20%" }}>
                <CustomTable
                  columns={rejectColumns}
                  data={rejectList3}
                  isSelectable={true}
                  selectShow={false}
                  isMultiple={true}
                  onRowSelectionChange={(selectedRowIndex) =>
                    handleRejectRowSelectionChange(selectedRowIndex, 2)
                  }
                  tableClass="table-striped dt-responsive nowrap w-100 body-height"
                  theadClass="table-gray"
                  tbodyClass="rejectList3"
                />
              </Col>
            )}
            {!isEmpty(rejectList4) && (
              <Col style={{ width: "20%" }}>
                <CustomTable
                  columns={rejectColumns}
                  data={rejectList4}
                  isSelectable={true}
                  selectShow={false}
                  isMultiple={true}
                  onRowSelectionChange={(selectedRowIndex) =>
                    handleRejectRowSelectionChange(selectedRowIndex, 3)
                  }
                  tableClass="table-striped dt-responsive nowrap w-100 body-height"
                  theadClass="table-gray"
                  tbodyClass="rejectList4"
                />
              </Col>
            )}
            {!isEmpty(rejectList5) && (
              <Col style={{ width: "20%" }}>
                <CustomTable
                  columns={rejectColumns}
                  data={rejectList5}
                  isSelectable={true}
                  selectShow={false}
                  isMultiple={true}
                  onRowSelectionChange={(selectedRowIndex) =>
                    handleRejectRowSelectionChange(selectedRowIndex, 4)
                  }
                  tableClass="table-striped dt-responsive nowrap w-100 body-height"
                  theadClass="table-gray"
                  tbodyClass="rejectList5"
                />
              </Col>
            )}
          </Row>
        )}
      </Card>

      <TabletCommonPopup isConfirm={setDelete} />
    </>
  );
});

export default SewingActual;
