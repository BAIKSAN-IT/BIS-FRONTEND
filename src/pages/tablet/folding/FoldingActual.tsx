import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

/* lb */
import styled from "styled-components";

/* redux */
import { AppDispatch, RootState } from "../../../redux/store";
import { getLineList, getTimeList, getWorkerList, setAutoSaveCnt } from "../../../redux/tablet/tabletSlice";
import {
  FOLDING_COLUMNS,
  FoldingItems,
  FoldingRes,
  RfidParam,
  WorkInfoData,
} from "../../../constants/tablet/folding/foldingActual";
import { getFoldingQr, getFoldingRfid, saveFoldingRfid } from "../../../redux/tablet/tabletFoldingSlice";

/* component */
import CustomTable from "../../../components/CustomTable";
import TabletCommonPopup from "../popup/TabletCommonPopup";

/* constants */
import { HEADER_PROPS, Payload } from "../../../constants/common/common";

/* utils */
import { getVtnTime, isEmpty } from "../../../utils/CommonUtil";

/* img */
import noImage from "../../../assets/images/noImage.png";

interface CodeBoxProps {
  title: string;
  bgColor: string;
  color: string;
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const CodeSection = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  margin-bottom: 20px;
`;

const CodeBox = styled.div`
  display: flex;
  align-items: center;
  width: 45%;
`;

const Title = styled.h2<{ bgColor?: string; color?: string }>`
  background-color: ${({ bgColor }) => bgColor || "white"};
  color: ${({ color }) => color || "black"};
  padding: 5px;
  border-radius: 5px;
  font-weight: bold;
  width: 80%;
  text-align: center;
`;

const Code = styled.div<{ color?: string }>`
  color: ${({ color }) => color || "black"};
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  width: 80%;
  text-align: center;
`;

const ImageSection = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
`;

const ImgInfoArea = styled.div`
  display: flex;
  width: 45%;
`;

const ProductImage = styled.img`
  flex: 1;
  max-width: 40%;
  height: auto;
  object-fit: cover;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  background-color: lightslategrey;
  border: 1px solid #dee2e6;

  .info {
    color: white;
    width: 90%;
    font-size: clamp(12px, 1.5vw, 20px);

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
        font-size: clamp(12px, 1.2vw, 18px);
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
        font-size: clamp(12px, 1.2vw, 18px);
      }
    }
  }
`;

const FoldingActual = forwardRef((props: HEADER_PROPS, ref) => {
  useImperativeHandle(ref, () => ({
    handleSearch,
    handleSave,
    handleClearMode,
    handleDelete,
  }));

  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  const { user, permission, userEnvInfo, worker, workTime, workTimeIdx, autoSaveCnt } = useSelector(
    (state: RootState) => ({
      user: state.Auth.user,
      permission: state.Auth.permission,
      userEnvInfo: state.Tablet.userEnvInfo,
      worker: state.Tablet.worker,
      workTime: state.Tablet.workTime,
      workTimeIdx: state.Tablet.workTimeIdx,
      autoSaveCnt: state.Tablet.autoSaveCnt,
    })
  );

  const [foldingList, setFoldingList] = useState<FoldingItems[]>([]);
  const [foldingQrInfo, setFoldingQrInfo] = useState<FoldingRes | null>();
  const [foldingRfidInfo, setFoldingRfidInfo] = useState<FoldingRes | null>();

  const [qrSearch, setQrSearch] = useState<boolean>(true);

  const qrCodeRef = useRef<HTMLInputElement>(null);
  const rfidCodeRef = useRef<HTMLInputElement>(null);
  const [keyPadTarget, setKeyPadTarget] = useState<"qr" | "rfid" | null>(null);
  const handleKeyPadValue = (val: string) => {
    if (keyPadTarget === "qr" && qrCodeRef.current) {
      qrCodeRef.current.value = val;
      handleSearch(); // QR 엔터 동작
    }
    if (keyPadTarget === "rfid" && rfidCodeRef.current) {
      rfidCodeRef.current.value = val;
      // 필요하면 RFID 엔터 처리 추가
    }
  };
  useEffect(() => {
    setHeaderLayoutInfo({
      headerInfo: {
        isQrSearch: false,
        titleName: "FoldingActual",
        isTableSelect: true,
        isInputMode: true,
      },
    });

    dispatch(setAutoSaveCnt(3));
  }, []);

  useEffect(() => {
    const processGbn = searchParams.get("processGbn");
    const nmLine = searchParams.get("nmLine");
    const cdPart = searchParams.get("cdPart");

    if (nmLine === "TABLE" && !isEmpty(cdPart)) {
      dispatch(getWorkerList({ ...userEnvInfo, cdPart: cdPart as string }));
    }

    if (!isEmpty(userEnvInfo) && !isEmpty(processGbn)) {
      dispatch(getLineList({ ...userEnvInfo, processGbn: processGbn as string }));
      dispatch(getTimeList({ ...userEnvInfo, processGbn: processGbn as string }));
    }
  }, [searchParams, userEnvInfo, dispatch]);

  // 포커스 유지 로직 추가
  useEffect(() => {
    const focusCheckInterval = setInterval(() => {
      if (qrSearch) {
        if (qrCodeRef.current !== document.activeElement) {
          qrCodeRef.current?.focus();
        }
      } else {
        if (rfidCodeRef.current !== document.activeElement) {
          qrCodeRef.current?.focus();
        }
      }
    }, 500);

    return () => {
      clearInterval(focusCheckInterval);
    };
  }, [qrSearch]);

  // saveCnt 자동저장
  useEffect(() => {
    if (foldingList.length >= (autoSaveCnt ?? 0)) {
      handleSave();
    }
  }, [foldingList]);

  useLayoutEffect(() => {
    const qrBlurEvt = () => {
      qrCodeRef.current?.focus();
    };
    const rfidBlurEvt = () => {
      qrCodeRef.current?.focus();
    };

    const focusInput = () => {
      if (qrSearch) {
        qrCodeRef.current?.focus();
        qrCodeRef.current?.addEventListener("blur", qrBlurEvt);
      } else {
        qrCodeRef.current?.focus();
        qrCodeRef.current?.addEventListener("blur", rfidBlurEvt);
      }
    };

    focusInput();

    return () => {
      qrCodeRef.current?.removeEventListener("blur", qrBlurEvt);
      rfidCodeRef.current?.removeEventListener("blur", rfidBlurEvt);
    };
  }, [qrCodeRef, rfidCodeRef, qrSearch]);

  // info component
  const renderProductInfo = (label: string, value: string) => (
    <div className="text">
      <span className="left_text">{label}</span>
      <span className="right_text">{value}</span>
    </div>
  );

  // qr, rfid render component
  const CodeBoxComponent = forwardRef<HTMLInputElement, CodeBoxProps>(({ title, bgColor, color }, ref) => (
    <CodeBox>
      <Title bgColor={bgColor} color={color}>
        {title}
      </Title>
      <Code color={color}>
        <div className="input-group">
          <input
            type="text"
            id={`qr_area_${title}`}
            className="form-control"
            inputMode="none"
            ref={ref}
            onKeyPress={handleKeyPress}
            disabled={title === "RFID CODE"}
          />
          {/* QR 코드일떄만 보여준다. */}
          {title === "QR CODE" && (
            <button
              type="button"
              className="btn waves-light btn-blue"
              onClick={() => {
                setKeyPadTarget(title === "QR CODE" ? "qr" : "rfid");
                window.ui.modal.open("keyPad");
              }}
            >
              <i className="fa fa-search me-1"></i>
            </button>
          )}
        </div>
      </Code>
    </CodeBox>
  ));

  // 데이터를 부모로 보내기
  const setHeaderLayoutInfo = (data: any) => {
    if (props.sendDataToParent) {
      props.sendDataToParent(data);
    }
  };

  // input Enter key 이벤트
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // 값 초기화
  const resetData = () => {
    setQrSearch(true);
    setFoldingQrInfo(null);
    setFoldingRfidInfo(null);
    setFoldingList([]);
  };

  // Clear 이벤트
  const handleClearMode = () => {
    setQrSearch(true);
    setFoldingQrInfo(null);
    setFoldingRfidInfo(null);
    setFoldingList([]);
  };

  // 삭제버튼 클릭 이벤트
  const handleDelete = () => {
    setFoldingList((prevList) => prevList.filter((item) => !item.isChecked));
  };
  // qr row 체크 이벤트
  const handleRowSelectionChange = (selectedRowIndex: number) => {
    setFoldingList((prevFoldingList) =>
      prevFoldingList.map((item, index) => ({
        ...item,
        isChecked: index === selectedRowIndex ? true : false,
      }))
    );

    const selectDt = foldingList[selectedRowIndex];
    const qrDt: FoldingRes = {
      cdCompany: selectDt?.cdCompany,
      cdBizarea: selectDt?.cdBizarea,
      cdFty: selectDt?.cdFty,
      seqStyle: selectDt?.seqStyle,
      noStyle: selectDt?.noStyle,
      seqOrd: selectDt?.seqOrd,
      noPo: selectDt?.noPo,
      seqDo: selectDt?.seqDo,
      dest: selectDt?.dest,
      seqClr: selectDt?.seqClr,
      nmClr: selectDt?.nmClr,
      seqSz: selectDt?.seqSz,
      nmSz: selectDt?.nmSz,
      cdBuyer: selectDt?.cdBuyer,
      nmBuyer: selectDt?.nmBuyer,
      qtOrd: selectDt?.qtOrd,
      poQtOrd: selectDt?.poQtOrd,
      prodImg: selectDt?.qrProdImg,
      qr: selectDt?.qr,
    };
    const rfidDt: FoldingRes = {
      cdCompany: selectDt?.cdCompany,
      cdBizarea: selectDt?.cdBizarea,
      cdFty: selectDt?.cdFty,
      seqStyle: selectDt?.seqStyle,
      noStyle: selectDt?.noStyle,
      seqOrd: selectDt?.seqOrd,
      noPo: selectDt?.noPo,
      seqDo: selectDt?.seqDo,
      dest: selectDt?.dest,
      seqClr: selectDt?.seqClr,
      nmClr: selectDt?.nmClr,
      seqSz: selectDt?.seqSz,
      nmSz: selectDt?.nmSz,
      cdBuyer: selectDt?.cdBuyer,
      nmBuyer: selectDt?.nmBuyer,
      qtOrd: selectDt?.qtOrd,
      poQtOrd: selectDt?.poQtOrd,
      prodImg: selectDt?.rfidProdImg,
      rfid: selectDt?.rfid,
    };
    setFoldingQrInfo(qrDt);
    setFoldingRfidInfo(rfidDt);
  };
  const handleHeaderCheckboxChange = (checked: boolean) => {
    setFoldingList((prev) =>
      prev.map((item) => ({
        ...item,
        isChecked: checked,
      }))
    );
  };
  // qr 데이타 setting
  const setData = (val: FoldingRes, qr: string) => {
    if (
      val?.cdBuyer === val.cdBuyer &&
      val?.seqStyle === val.seqStyle &&
      val?.noPo === val.noPo &&
      val?.seqDo === val.seqDo &&
      val?.seqClr === val.seqClr &&
      val?.seqSz === val.seqSz
    ) {
      const newDt: FoldingItems[] = [
        {
          isChecked: false,
          cdCompany: val?.cdCompany,
          cdBizarea: val?.cdBizarea,
          cdFty: val?.cdFty,
          seqStyle: val?.seqStyle,
          noStyle: val?.noStyle,
          seqOrd: val?.seqOrd,
          noPo: val?.noPo,
          seqDo: val?.seqDo,
          dest: val?.dest,
          seqClr: val?.seqClr,
          nmClr: val?.nmClr,
          seqSz: val?.seqSz,
          nmSz: val?.nmSz,
          cdBuyer: val?.cdBuyer,
          nmBuyer: val?.nmBuyer,
          qtOrd: val?.qtOrd,
          poQtOrd: val?.poQtOrd,
          qrProdImg: val?.prodImg,
          rfidProdImg: val?.prodImg,
          qr: qr,
          rfid: qr,
          no: 1,
        },
      ];

      setFoldingList((prevList) => {
        const isQrDuplicated = prevList.some((item) => item.qr === qr);

        if (isQrDuplicated) {
          return prevList;
        }

        const updatedPrevList = prevList.map((item) => ({
          ...item,
          isChecked: false,
          no: (item.no ?? 0) + 1,
        }));

        return [...newDt, ...updatedPrevList];
      });

      setQrSearch(true);
    } else {
      window.ui.modal.open("definedPop");
      setQrSearch(false);
    }
  };

  // qr,rfid 비교 이벤트
  const compareData = (val: FoldingRes, rfid: string) => {
    if (
      foldingQrInfo?.cdBuyer === val.cdBuyer &&
      foldingQrInfo?.seqStyle === val.seqStyle &&
      foldingQrInfo?.noPo === val.noPo &&
      foldingQrInfo?.seqDo === val.seqDo &&
      foldingQrInfo?.seqClr === val.seqClr &&
      foldingQrInfo?.seqSz === val.seqSz
    ) {
      const newDt: FoldingItems[] = [
        {
          isChecked: true,
          cdCompany: foldingQrInfo?.cdCompany,
          cdBizarea: foldingQrInfo?.cdBizarea,
          cdFty: foldingQrInfo?.cdFty,
          seqStyle: foldingQrInfo?.seqStyle,
          noStyle: foldingQrInfo?.noStyle,
          seqOrd: foldingQrInfo?.seqOrd,
          noPo: foldingQrInfo?.noPo,
          seqDo: foldingQrInfo?.seqDo,
          dest: foldingQrInfo?.dest,
          seqClr: foldingQrInfo?.seqClr,
          nmClr: foldingQrInfo?.nmClr,
          seqSz: foldingQrInfo?.seqSz,
          nmSz: foldingQrInfo?.nmSz,
          cdBuyer: foldingQrInfo?.cdBuyer,
          nmBuyer: foldingQrInfo?.nmBuyer,
          qtOrd: foldingQrInfo?.qtOrd,
          poQtOrd: foldingQrInfo?.poQtOrd,
          qrProdImg: foldingQrInfo?.prodImg,
          rfidProdImg: val?.prodImg,
          qr: foldingQrInfo?.qr,
          rfid: rfid,
          no: 1,
        },
      ];

      setFoldingList((prevList) => {
        const isQrDuplicated = prevList.some((item) => item.qr === foldingQrInfo?.qr);

        if (isQrDuplicated) {
          return prevList;
        }

        const updatedPrevList = prevList.map((item) => ({
          ...item,
          isChecked: false,
          no: (item.no ?? 0) + 1,
        }));
        return [...newDt, ...updatedPrevList];
      });

      setQrSearch(true);
    } else {
      window.ui.modal.open("definedPop");
      setQrSearch(false);
    }
  };

  // 조회버튼 클릭 이벤트
  const handleSearch = () => {
    if (qrSearch) {
      const qrVal = qrCodeRef?.current?.value ?? "";
      let params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        qr: qrVal,
      };

      dispatch(getFoldingQr(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200) {
          if (!isEmpty(payload.data)) {
            setFoldingQrInfo({ ...payload.data, qr: qrVal });

            setData(payload.data, qrVal);

            /*
            setFoldingList((prevList) => {
              const duplicatedCheck = prevList.some((item) => item.qr === qrVal);

              if (duplicatedCheck) return prevList; // 이미 배열에 있으면 추가 x

              return [
                ...prevList,
                {
                  ...{ ...payload.data, qr: qrVal },
                  isChecked: false,
                  no: prevList.length + 1,
                },
              ];
            });
          */
          }
        } else {
          setFoldingQrInfo(null);
        }
      });
    } else {
      const rfidVal = rfidCodeRef?.current?.value ?? "";
      let params = {
        cdCompany: userEnvInfo.cdCompany,
        cdBizarea: userEnvInfo.cdBizarea,
        cdFty: userEnvInfo.cdFty,
        rfid: rfidVal,
      };

      dispatch(getFoldingRfid(params)).then((res) => {
        const payload = res.payload as Payload;

        if (payload.status === 200) {
          if (!isEmpty(payload.data)) {
            compareData(payload.data, rfidVal);
            setFoldingRfidInfo({ ...payload.data, rfid: rfidVal });
          }
        } else {
          setFoldingRfidInfo(null);
        }
      });
    }
  };
  // 저장버튼 클릭 이벤트
  const handleSave = () => {
    if (!isEmpty(foldingList)) {
      if (isEmpty(worker)) {
        window.ui.modal.toast("Worker Checked");
      }

      if (!isEmpty(workTime) && !isEmpty(worker)) {
        let workInfo: WorkInfoData = {
          cdCompany: userEnvInfo.cdCompany,
          cdBizarea: userEnvInfo.cdBizarea,
          cdFty: userEnvInfo.cdFty,
          idWork: user?.userId,
          workTimeIdx: workTimeIdx,
          dtsWk: workTime,
          seqWk: null,
          sewLn: permission?.find((ln) => ln.pageCode === "010601")?.cdLn,
          worker: worker?.cdUser,
          insertDt: getVtnTime().slice(0, 10),
        };

        let params: RfidParam = {
          workInfo: workInfo,
          foldingList: foldingList,
        };

        dispatch(saveFoldingRfid(params)).then((res) => {
          const payload = res.payload as Payload;

          if (payload.status === 200) {
            window.ui.modal.toast("Save Success");
            resetData();
          }
        });
      }
    }
  };

  return (
    <>
      <Container>
        <CodeSection>
          <CodeBoxComponent title="QR CODE" bgColor="#d4edda" color="#155724" ref={qrCodeRef} />
          <CodeBoxComponent title="RFID CODE" bgColor="#f8d7da" color="#721c24" ref={rfidCodeRef} />
        </CodeSection>

        <ImageSection>
          <ImgInfoArea>
            <ProductImage
              src={
                !isEmpty(foldingQrInfo?.prodImg)
                  ? `${process.env.REACT_APP_IMG_URL}/images${foldingQrInfo?.prodImg ?? ""}`
                  : noImage
              }
              alt="Product Image(QR CODE)"
            />
            <InfoSection>
              <div className="info">
                {renderProductInfo("QR", foldingQrInfo?.qr ?? "")}
                {renderProductInfo("BUYER", foldingQrInfo?.nmBuyer ?? "")}
                {renderProductInfo("STYLE NO", foldingQrInfo?.noStyle ?? "")}
                {renderProductInfo("PO NO", foldingQrInfo?.noPo ?? "")}
                {renderProductInfo("D.O", foldingQrInfo?.dest ?? "")}
                {renderProductInfo("COLOR", foldingQrInfo?.nmClr ?? "")}
                {renderProductInfo("SIZE", foldingQrInfo?.nmSz ?? "")}
                {renderProductInfo("QUANTITY", foldingQrInfo?.qtOrd ?? "")}
              </div>
            </InfoSection>
          </ImgInfoArea>

          <ImgInfoArea>
            <ProductImage
              src={
                !isEmpty(foldingRfidInfo?.prodImg)
                  ? `${process.env.REACT_APP_IMG_URL}/images${foldingQrInfo?.prodImg ?? ""}`
                  : noImage
              }
              alt="Product Image(RFID CODE)"
            />
            <InfoSection>
              <div className="info">
                {renderProductInfo("RFID(QR)", foldingQrInfo?.rfid ?? "")}
                {renderProductInfo("BUYER", foldingQrInfo?.nmBuyer ?? "")}
                {renderProductInfo("STYLE NO", foldingQrInfo?.noStyle ?? "")}
                {renderProductInfo("PO NO", foldingQrInfo?.noPo ?? "")}
                {renderProductInfo("D.O", foldingQrInfo?.dest ?? "")}
                {renderProductInfo("COLOR", foldingQrInfo?.nmClr ?? "")}
                {renderProductInfo("SIZE", foldingQrInfo?.nmSz ?? "")}
                {renderProductInfo("QUANTITY", foldingQrInfo?.qtOrd ?? "")}
              </div>

              {/*
              <div className="info">
                {renderProductInfo("RFID CODE", foldingRfidInfo?.rfid ?? "")}
                {renderProductInfo("BUYER", foldingRfidInfo?.nmBuyer ?? "")}
                {renderProductInfo("STYLE NO", foldingRfidInfo?.noStyle ?? "")}
                {renderProductInfo("PO NO", foldingRfidInfo?.noPo ?? "")}
                {renderProductInfo("D.O", foldingRfidInfo?.dest ?? "")}
                {renderProductInfo("COLOR", foldingRfidInfo?.nmClr ?? "")}
                {renderProductInfo("SIZE", foldingRfidInfo?.nmSz ?? "")}
                {renderProductInfo("QUANTITY", foldingRfidInfo?.qtOrd ?? "")}
              </div>
              */}
            </InfoSection>
          </ImgInfoArea>
        </ImageSection>

        <Row style={{ width: "100%" }}>
          <CustomTable
            columns={FOLDING_COLUMNS}
            data={foldingList}
            isSelectable={true}
            selectShow={true}
            onRowSelectionChange={handleRowSelectionChange}
            onHeaderCheckboxChange={handleHeaderCheckboxChange}
            tableClass="table-striped dt-responsive nowrap w-100 body-height"
            theadClass="table-gray"
            tableHeightClass="table-215"
          />
        </Row>

        <TabletCommonPopup setValueString={handleKeyPadValue} />
      </Container>
    </>
  );
});

export default FoldingActual;
