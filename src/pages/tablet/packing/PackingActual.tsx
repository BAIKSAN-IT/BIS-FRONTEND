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
  PACKING_COLUMNS,
  PACKING_INPUT_COLUMNS,
  PackingDetailParam,
  PackingDetailReqInfo,
  PackingInputItems,
  PackingItems,
  PackingReqInfo,
  WorkInfoData,
} from "../../../constants/tablet/packing/packingActual";
import {
  deletePackingDetail,
  getPackingDetailList,
  getPackingList,
  savePackingDetail,
} from "../../../redux/tablet/tabletPackingSlice";
import { Payload } from "../../../constants/common/common";

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

const PackingLeftArea = styled.div`
  width: 65%;
`;

const PackingRightArea = styled.div`
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

const PackingActual = forwardRef((props: HEADER_PROPS, ref) => {
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

  const [packingList, setPackingList] = useState<PackingItems[]>([]);
  const [packingInputList, setPackingInputList] = useState<PackingInputItems[]>(
    []
  );
  const [originPackingInputList, setOriginPackingInputList] = useState<
    PackingInputItems[]
  >([]);

  const [inputMode, setInputMode] = useState<string>("input");
  const [inputIdx, setInputIdx] = useState<number>(0);
  const [reloadCnt, setReloadCnt] = useState<number>(0);

  // 헤더 정보 입력
  useEffect(() => {
    let params = {
      headerInfo: {
        isQrSearch: false,
        titleName: "PackingActual",
        isTableSelect: true,
        isInputMode: true,
      },
    };

    setHeaderLayoutInfo(params);
  }, []);

  useEffect(() => {
    const packingInfo = packingList.find(
      (item) => item.isChecked
    ) as PackingItems;

    if (!isEmpty(packingInfo)) {
      let params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        dtsWk: packingInfo.dtsWk,
        seqWk: packingInfo.seqWk,
        seqStyle: packingInfo.seqStyle,
        seqOrd: packingInfo.seqOrd,
        seqClr: packingInfo.seqClr,
        sewLn: packingInfo.sewLn,
        timeWork: packingInfo.timeWork,
        cdWork: packingInfo.worker,
        dataType: inputMode,
      };

      getPackingBottomInfo(params);

      setHeaderLayoutInfo({
        stInfo: {
          noStyle: packingInfo.noStyle,
          noPo: packingInfo.noPo,
          nmClr: packingInfo.nmClr,
        },
      });
    }
  }, [packingList]);

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

    getPackingTopInfo(params);
  };

  // 삭제버튼 클릭 이벤트
  const handleDelete = () => {
    if (inputMode === "modify" && !isEmpty(packingInputList)) {
      window.ui.modal.open("confirmPop");
    }
  };

  // 저장버튼 클릭 이벤트
  const handleSave = () => {
    const packingInfo = packingList.find(
      (item) => item.isChecked
    ) as PackingItems;

    if (isEmpty(worker)) {
      window.ui.modal.toast("Worker Checked");
    }

    if (!isEmpty(packingInputList) && !isEmpty(workTime) && !isEmpty(worker)) {
      let workInfo: WorkInfoData = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        sewLn: String(Number(line?.sewLn)),
        idWork: user?.userId,
        cdBuyer: packingInfo.cdBuyer,
        workTimeIdx:
          inputMode === "input" ? workTimeIdx : Number(packingInfo.timeWork),
        dtsWk: workTime,
        seqWk: null,
        worker: worker?.cdUser,
        insertDt: getVtnTime().slice(0, 10),
        dataType: inputMode,
      };
      let params: PackingDetailParam = {};

      if (inputMode === "input") {
        params = {
          workInfo: workInfo,
          packingList: packingInputList.filter(
            (item) => Number(item.qtPak) > 0
          ),
        };
      } else {
        params = {
          workInfo: workInfo,
          packingList: packingInputList.filter(
            (item) => item.qtPak !== item.cqtPak
          ),
        };
      }

      if (!isEmpty(params.packingList)) {
        dispatch(savePackingDetail(params)).then((res) => {
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

  // packing list조회
  const getPackingTopInfo = (param: PackingReqInfo) => {
    dispatch(getPackingList(param)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const updatedData = payload.data.map(
          (item: PackingItems, index: number) => ({
            ...item,
            no: index + 1,
            isChecked: index === 0 ? true : false,
          })
        );
        setPackingList(updatedData);
      } else {
        setPackingList([]);
        setPackingInputList([]);
        setOriginPackingInputList([]);
        window.ui.modal.toast("Data not found");
      }
    });
  };

  // packing detail list조회
  const getPackingBottomInfo = (param: PackingDetailReqInfo) => {
    dispatch(getPackingDetailList(param)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        const updatedData = payload.data.map(
          (item: PackingInputItems, index: number) => ({
            ...item,
            no: index + 1,
            isChecked: index === 0 ? true : false,
          })
        );
        setPackingInputList(updatedData);
        setOriginPackingInputList(updatedData);
      } else {
        setPackingInputList([]);
        setOriginPackingInputList([]);
        window.ui.modal.toast("Data not found");
      }
    });
  };

  // Packing input 수량 변경
  const changeQuantity = (type: string) => {
    if (!isEmpty(packingInputList[inputIdx])) {
      let pak = Number(packingInputList[inputIdx]?.qtPak);
      pak = type === "1" ? Math.max(pak - 1, 0) : pak + 1;

      setInputQtyHandler(pak);
    }
  };

  // Input Mode 변경 이벤트
  const handleInputMode = (val: any) => {
    setInputMode(val);
    setPackingList([]);
    setPackingInputList([]);
    setOriginPackingInputList([]);
  };

  // packing list row 체크 이벤트
  const handleRowSelectionChange = (selectedRowIndex: number) => {
    setPackingList((prevPackingList) =>
      prevPackingList.map((item, idx) => {
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

  // packing detail list row 체크 이벤트
  const handleRowDetailSelectionChange = (
    rowIdx: number,
    columnName: string
  ) => {
    setPackingInputList((prevPackingList) =>
      prevPackingList.map((item, idx) => {
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
    setOriginPackingInputList((prevPackingList) =>
      prevPackingList.map((item, idx) => {
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

    if (columnName === "qtPak") {
      if (
        !(
          Number(packingInputList[rowIdx].qtSew) === 0 &&
          Number(packingInputList[rowIdx].balance) === 0
        )
      ) {
        openKeypad();
      }
    }
  };

  // value 입력 Handler
  const setInputQtyHandler = (val: number) => {
    if (inputMode === "input") {
      setPackingInputList((prevPackingList) => {
        const updatedList = prevPackingList.map((item, index) => {
          if (index === inputIdx) {
            const originItem = originPackingInputList[index];
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
              qtPak: sewInValue,
              qtTtlPak: String(
                Number(originItem.qtTtlPak) + Number(sewInValue)
              ),
              balance: String(
                Number(originItem.qtTtlPak) +
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
      setPackingInputList((prevPackingList) => {
        const updatedList = prevPackingList.map((item, index) => {
          if (index === inputIdx) {
            const originItem = originPackingInputList[index];
            const sewInValue = String(
              Math.abs(Number(originItem.balance)) +
                Math.abs(Number(originItem.qtPak)) +
                Math.abs(Math.ceil(Number(originItem.balance) / 10)) <
                val
                ? Math.abs(Number(originItem.balance)) +
                    Math.abs(Number(originItem.qtPak)) +
                    Math.abs(Math.ceil(Number(originItem.balance) / 10))
                : val
            );
            return {
              ...item,
              qtPak: sewInValue,
              qtTtlPak: String(
                Number(originItem.qtTtlPak) + Number(sewInValue)
              ),
              balance: String(
                Number(originItem.qtTtlPak) +
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

    const packingInfo = packingList.find(
      (item) => item.isChecked
    ) as PackingItems;

    if (!isEmpty(packingInputList)) {
      let workInfo: WorkInfoData = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        sewLn: String(Number(line?.sewLn)),
        idWork: user?.userId,
        cdBuyer: packingInfo.cdBuyer,
        workTimeIdx:
          inputMode === "input" ? workTimeIdx : Number(packingInfo.timeWork),
        dtsWk: workTime,
        seqWk: null,
        worker: worker?.cdUser,
        insertDt: getVtnTime().slice(0, 10),
        dataType: inputMode,
      };
      let params: PackingDetailParam = {
        workInfo: workInfo,
        packingList: originPackingInputList,
      };

      if (!isEmpty(params.packingList)) {
        dispatch(deletePackingDetail(params)).then((res) => {
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
            columns={PACKING_COLUMNS}
            data={packingList}
            isSelectable={true}
            selectShow={false}
            isSortable={true}
            onRowSelectionChange={(selectedRowIndex) =>
              handleRowSelectionChange(selectedRowIndex)
            }
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tbodyClass="packingList"
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
          <PackingLeftArea>
            <CustomTable
              columns={PACKING_INPUT_COLUMNS}
              data={packingInputList}
              isSelectable={true}
              selectShow={false}
              isSortable={true}
              onRowSelectionChange={handleRowDetailSelectionChange}
              tableClass="table-striped dt-responsive nowrap w-100 body-height"
              theadClass="table-gray"
              tableHeightClass="table-320"
            />
          </PackingLeftArea>

          <PackingRightArea>
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
                PACKING
                <br />
                QTY
              </div>

              <div className="right_area">
                <button
                  className="input_box"
                  onClick={() => window.ui.modal.open("keyPad")}
                >
                  {Number(packingInputList[inputIdx]?.qtPak ?? 0)}
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
          </PackingRightArea>
        </Row>
      </Card>

      <TabletCommonPopup setValue={setInputQtyHandler} isConfirm={setDelete} />
    </>
  );
});

export default PackingActual;
