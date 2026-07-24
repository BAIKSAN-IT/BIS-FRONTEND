import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createGlobalStyle, styled } from "styled-components";
import { Card, Row } from "react-bootstrap";
import CustomTable from "../../../components/CustomTable";
import TabletCommonPopup from "../popup/TabletCommonPopup";
import { getVtnTime, isEmpty, openKeypad } from "../../../utils/CommonUtil";
import { HEADER_PROPS } from "../../../constants/common/common";
import {
  NEEDLE_COLUMNS,
  NEEDLE_INPUT_COLUMNS,
  NeedleDetailParam,
  NeedleDetailReqInfo,
  NeedleInputItems,
  NeedleItems,
  NeedleReqInfo,
  WorkInfoData,
} from "../../../constants/tablet/folding/needleActual";
import {
  deleteNeedleDetail,
  getNeedleDetailList,
  getNeedleList,
  saveNeedleDetail,
} from "../../../redux/tablet/tabletNeedleSlice";

import { Payload } from "../../../constants/common/common";
import { useSearchParams } from "react-router-dom";
import {
  getLineList,
  getTimeList,
  getWorkerList,
} from "../../../redux/tablet/tabletSlice";

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

const NeedleLeftArea = styled.div`
  width: 65%;
`;

const NeedleRightArea = styled.div`
  width: 35%;
  background-color: lightslategrey;

  .info {
    height: 150px;
    margin-top: 15px;
    color: white;
    border-bottom: 1px solid;

    .text {
      display: flex;
      justify-content: space-between;
      height: 30px;

      .left_text {
        flex: 1;
        font-weight: bold;
        margin-right: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .right_text {
        flex: 2;
        text-align: left;
        border-left: 1px solid;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-left: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .bottom_content {
    margin-top: 15px;
    display: flex;

    .left_area {
      flex: 1;

      text-align: center;
      font-weight: bold;
      font-size: 15px;
      color: white;
    }

    .right_area {
      flex: 2;

      .input_box {
        width: 100%;
        height: 55px;
        border: 0;
        background-color: whitesmoke;
        font-size: 30px;
        margin-bottom: 5px;
        border-radius: 10px;
      }
    }
  }

  .btn_box {
    display: flex;

    .plus_btn {
      width: 100%;
      height: 70px;
      border: 1px #1abc9c;
      background-color: #1abc9c;
      border-radius: 10px;

      & i {
        font-size: 35px;
      }
    }

    .minus_btn {
      width: 100%;
      height: 70px;
      border: 1px #f1556c;
      background-color: #f1556c;
      margin-left: 5px;
      border-radius: 10px;

      & i {
        font-size: 35px;
      }
    }
  }
`;

const NeedleActual = forwardRef((props: HEADER_PROPS, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
    handleDelete,
    handleSave,
    handleInputMode,
  }));

  const { user, userEnvInfo, line, worker, workTime, workTimeIdx } =
    useSelector((state: RootState) => ({
      user: state.Auth.user,
      userEnvInfo: state.Tablet.userEnvInfo,
      line: state.Tablet.line,
      worker: state.Tablet.worker,
      workTime: state.Tablet.workTime,
      workTimeIdx: state.Tablet.workTimeIdx,
    }));

  const [searchParams, setSearchParams] = useSearchParams();

  const [needleList, setNeedleList] = useState<NeedleItems[]>([]);
  const [needleInputList, setNeedleInputList] = useState<NeedleInputItems[]>(
    []
  );
  const [originNeedleInputList, setOriginNeedleInputList] = useState<
    NeedleInputItems[]
  >([]);

  const [inputMode, setInputMode] = useState<string>("input");
  const [inputIdx, setInputIdx] = useState<number>(0);
  const [reloadCnt, setReloadCnt] = useState<number>(0);

  useEffect(() => {
    const processGbn = searchParams.get("processGbn");
    const nmLine = searchParams.get("nmLine");
    const cdPart = searchParams.get("cdPart");

    if (!isEmpty(nmLine)) {
      if (!isEmpty(cdPart) && nmLine === "TABLE") {
        let params = {
          ...userEnvInfo,
          cdPart: cdPart as string,
        };
        dispatch(getWorkerList(params));
      }
    }

    if (!isEmpty(userEnvInfo) && !isEmpty(processGbn)) {
      let params = {
        ...userEnvInfo,
        processGbn: processGbn as string,
      };

      dispatch(getLineList(params));
      dispatch(getTimeList(params));
    }
  }, [searchParams]);

  // 헤더 정보 입력
  useEffect(() => {
    let params = {
      headerInfo: {
        isQrSearch: false,
        titleName: "NeedleActual",
        isTableSelect: true,
        isInputMode: true,
      },
    };

    setHeaderLayoutInfo(params);
  }, []);

  useEffect(() => {
    const needleInfo = needleList.find((item) => item.isChecked) as NeedleItems;

    if (!isEmpty(needleInfo)) {
      let params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        dtsWk: needleInfo.dtsWk,
        seqWk: needleInfo.seqWk,
        seqStyle: needleInfo.seqStyle,
        seqOrd: needleInfo.seqOrd,
        seqClr: needleInfo.seqClr,
        sewLn: needleInfo.sewLn,
        timeWork: needleInfo.timeWork,
        cdWork: needleInfo.worker,
        dataType: inputMode,
      };

      getNeedleBottomInfo(params);

      setHeaderLayoutInfo({
        stInfo: {
          noStyle: needleInfo.noStyle,
          noPo: needleInfo.noPo,
          nmClr: needleInfo.nmClr,
        },
      });
    }
  }, [needleList]);

  useEffect(() => {
    if (reloadCnt > 0) {
      setHeaderLayoutInfo({ reload: reloadCnt });
    }
  }, [reloadCnt]);

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props?.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = (val: any) => {
    let params = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      cdFty: userEnvInfo.cdFty,
      dtsWk: val.dtsWk,
      noStyle: val.styleNo,
      noPo: val.po,
      sewLn: line?.sewLn,
      nmColor: val.color,
      dataType: inputMode,
    };

    getNeedleTopInfo(params);
  };

  // 삭제버튼 클릭 이벤트
  const handleDelete = () => {
    if (inputMode === "modify" && !isEmpty(needleInputList)) {
      window.ui.modal.open("confirmPop");
    }
  };

  // 저장버튼 클릭 이벤트
  const handleSave = () => {
    const needleInfo = needleList.find((item) => item.isChecked) as NeedleItems;

    if (isEmpty(worker)) {
      window.ui.modal.toast("Worker Checked");
    }

    if (!isEmpty(needleInputList) && !isEmpty(workTime) && !isEmpty(worker)) {
      let workInfo: WorkInfoData = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        sewLn: String(Number(line?.sewLn)),
        idWork: user?.userId,
        cdBuyer: needleInfo.cdBuyer,
        workTimeIdx:
          inputMode === "input" ? workTimeIdx : Number(needleInfo.timeWork),
        dtsWk: workTime,
        seqWk: null,
        worker: worker?.cdUser,
        insertDt: getVtnTime().slice(0, 10),
        dataType: inputMode,
      };
      let params: NeedleDetailParam = {};

      if (inputMode === "input") {
        params = {
          workInfo: workInfo,
          needleList: needleInputList.filter((item) => Number(item.qtFin) > 0),
        };
      } else {
        params = {
          workInfo: workInfo,
          needleList: needleInputList.filter(
            (item) => item.qtFin !== item.cqtFin
          ),
        };
      }

      if (!isEmpty(params.needleList)) {
        dispatch(saveNeedleDetail(params)).then((res) => {
          const payload = res.payload as Payload;

          if (payload.status === 200) {
            setReloadCnt(reloadCnt + 1);
            window.ui.modal.toast("Save Success");
          } else {
            if (payload.errorCode === "999") {
              window.ui.modal.toast(payload.errResult.ErrorMessage);
            }
          }
        });
      }
    }
  };

  // needle list조회
  const getNeedleTopInfo = (param: NeedleReqInfo) => {
    dispatch(getNeedleList(param)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const updatedData = payload.data.map(
          (item: NeedleItems, index: number) => ({
            ...item,
            no: index + 1,
            isChecked: index === 0 ? true : false,
          })
        );
        setNeedleList(updatedData);
      } else {
        setNeedleList([]);
        setNeedleInputList([]);
        setOriginNeedleInputList([]);
        window.ui.modal.toast("Data not found");
      }
    });
  };

  // needle detail list조회
  const getNeedleBottomInfo = (param: NeedleDetailReqInfo) => {
    dispatch(getNeedleDetailList(param)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const updatedData = payload.data.map(
          (item: NeedleInputItems, index: number) => ({
            ...item,
            no: index + 1,
            isChecked: index === 0 ? true : false,
          })
        );
        setNeedleInputList(updatedData);
        setOriginNeedleInputList(updatedData);
      } else {
        setNeedleInputList([]);
        setOriginNeedleInputList([]);
        window.ui.modal.toast("Data not found");
      }
    });
  };

  // Needle input 수량 변경
  const changeQuantity = (type: string) => {
    if (!isEmpty(needleInputList[inputIdx])) {
      let pak = Number(needleInputList[inputIdx]?.qtFin);
      pak = type === "1" ? Math.max(pak - 1, 0) : pak + 1;

      setInputQtyHandler(pak);
    }
  };

  // Input Mode 변경 이벤트
  const handleInputMode = (val: any) => {
    setInputMode(val);
    setNeedleList([]);
    setNeedleInputList([]);
    setOriginNeedleInputList([]);
  };

  // needle list row 체크 이벤트
  const handleRowSelectionChange = (selectedRowIndex: number) => {
    setNeedleList((prevNeedleList) =>
      prevNeedleList.map((item, idx) => {
        if (idx === selectedRowIndex) {
          return {
            ...item,
            isChecked: true,
          };
        } else {
          return {
            ...item,
            isChecked: false,
          };
        }
      })
    );
  };

  // needle detail list row 체크 이벤트
  const handleRowDetailSelectionChange = (
    rowIdx: number,
    columnName: string
  ) => {
    setNeedleInputList((prevNeedleList) =>
      prevNeedleList.map((item, idx) => {
        if (idx === rowIdx) {
          return {
            ...item,
            isChecked: true,
          };
        } else {
          return {
            ...item,
            isChecked: false,
          };
        }
      })
    );
    setOriginNeedleInputList((prevNeedleList) =>
      prevNeedleList.map((item, idx) => {
        if (idx === rowIdx) {
          return {
            ...item,
            isChecked: true,
          };
        } else {
          return {
            ...item,
            isChecked: false,
          };
        }
      })
    );
    setInputIdx(rowIdx);

    if (columnName === "qtFin") {
      if (
        !(
          Number(needleInputList[rowIdx].qtSew) === 0 &&
          Number(needleInputList[rowIdx].balance) === 0
        )
      ) {
        openKeypad();
      }
    }
  };

  // value 입력 Handler
  const setInputQtyHandler = (val: number) => {
    if (inputMode === "input") {
      setNeedleInputList((prevNeedleList) => {
        const updatedList = prevNeedleList.map((item, index) => {
          if (index === inputIdx) {
            const originItem = originNeedleInputList[index];
            const sewInValue = String(
              Math.abs(
                Number(originItem.balance) +
                  Math.ceil(Number(originItem.balance) / 10)
              ) < val
                ? Math.abs(
                    Number(originItem.balance) +
                      Math.ceil(Number(originItem.balance) / 10)
                  )
                : val
            );
            return {
              ...item,
              qtFin: sewInValue,
              qtTtlFin: String(
                Number(originItem.qtTtlFin) + Number(sewInValue)
              ),
              balance: String(
                Number(originItem.qtTtlFin) +
                  Number(sewInValue) -
                  Number(originItem.qtSew)
              ),
            };
          }
          return item;
        });
        return updatedList;
      });
    } else {
      setNeedleInputList((prevNeedleList) => {
        const updatedList = prevNeedleList.map((item, index) => {
          if (index === inputIdx) {
            const originItem = originNeedleInputList[index];
            const sewInValue = String(
              Math.abs(Number(originItem.balance)) +
                Math.abs(Number(originItem.qtFin)) +
                Math.abs(Math.ceil(Number(originItem.balance) / 10)) <
                val
                ? Math.abs(Number(originItem.balance)) +
                    Math.abs(Number(originItem.qtFin)) +
                    Math.abs(Math.ceil(Number(originItem.balance) / 10))
                : val
            );
            return {
              ...item,
              qtFin: sewInValue,
              qtTtlFin: String(
                Number(originItem.qtTtlFin) + Number(sewInValue)
              ),
              balance: String(
                Number(originItem.qtTtlFin) +
                  Number(sewInValue) -
                  Number(originItem.qtSew)
              ),
            };
          }
          return item;
        });
        return updatedList;
      });
    }
  };

  // 삭제 이벤트
  const setDelete = () => {
    window.ui.modal.close("confirmPop");

    const needleInfo = needleList.find((item) => item.isChecked) as NeedleItems;

    if (!isEmpty(needleInputList)) {
      let workInfo: WorkInfoData = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        sewLn: String(Number(line?.sewLn)),
        idWork: user?.userId,
        cdBuyer: needleInfo.cdBuyer,
        workTimeIdx:
          inputMode === "input" ? workTimeIdx : Number(needleInfo.timeWork),
        dtsWk: workTime,
        seqWk: null,
        worker: worker?.cdUser,
        insertDt: getVtnTime().slice(0, 10),
        dataType: inputMode,
      };
      let params: NeedleDetailParam = {
        workInfo: workInfo,
        needleList: originNeedleInputList,
      };

      if (!isEmpty(params.needleList)) {
        dispatch(deleteNeedleDetail(params)).then((res) => {
          const payload = res.payload as Payload;

          if (payload.status === 200) {
            window.ui.modal.toast("Delete Success");
            setReloadCnt(reloadCnt + 1);
          } else {
            if (payload.errorCode === "999") {
              window.ui.modal.toast(payload.errResult.ErrorMessage);
            }
          }
        });
      }
    }
  };

  return (
    <>
      <Card style={{ marginTop: "2px" }}>
        <Row style={{ width: "100%" }}>
          <CustomTable
            columns={NEEDLE_COLUMNS}
            data={needleList}
            isSelectable={true}
            selectShow={false}
            isSortable={true}
            onRowSelectionChange={(selectedRowIndex) =>
              handleRowSelectionChange(selectedRowIndex)
            }
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tbodyClass="needleList"
            tableHeightClass="table-250"
          />
        </Row>

        <Row
          style={{
            width: "100%",
            marginTop: "25px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <NeedleLeftArea>
            <CustomTable
              columns={NEEDLE_INPUT_COLUMNS}
              data={needleInputList}
              isSelectable={true}
              selectShow={false}
              isSortable={true}
              onRowSelectionChange={handleRowDetailSelectionChange}
              tableClass="table-striped dt-responsive nowrap w-100 body-height"
              theadClass="table-gray"
              tableHeightClass="table-320"
            />
          </NeedleLeftArea>

          <NeedleRightArea>
            <div className="info">
              <div className="text">
                <span className="left_text">STYLE NO</span>
                <span className="right_text">2CB29-3</span>
              </div>
              <div className="text">
                <span className="left_text">PO NO</span>
                <span className="right_text">8A30202</span>
              </div>
              <div className="text">
                <span className="left_text">D.O</span>
                <span className="right_text"></span>
              </div>
              <div className="text">
                <span className="left_text">COLOR</span>
                <span className="right_text">ICE BLUE PEACOAT</span>
              </div>
              <div className="text">
                <span className="left_text">SIZE</span>
                <span className="right_text">XL</span>
              </div>
            </div>

            <div className="bottom_content">
              <div className="left_area">
                NEEDLE
                <br />
                QTY
              </div>

              <div className="right_area">
                <button
                  className="input_box"
                  onClick={() => window.ui.modal.open("keyPad")}
                >
                  {Number(needleInputList[inputIdx]?.qtFin ?? 0)}
                </button>
              </div>
            </div>

            <div className="btn_box">
              <button className="plus_btn" onClick={() => changeQuantity("2")}>
                <i className="fe-plus" />
              </button>
              <button className="minus_btn" onClick={() => changeQuantity("1")}>
                <i className="fe-minus" />
              </button>
            </div>
          </NeedleRightArea>
        </Row>
      </Card>

      <TabletCommonPopup setValue={setInputQtyHandler} isConfirm={setDelete} />
    </>
  );
});

export default NeedleActual;
