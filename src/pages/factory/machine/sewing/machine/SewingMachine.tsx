import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AppDispatch, RootState } from "../../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styled, { createGlobalStyle } from "styled-components";
import { Card, Row } from "react-bootstrap";
import CustomTableGrid from "../../../../../components/CustomTableGrid";
import sewingState from "../../../../../assets/images/factory/sewingState.png";
import sewingState1 from "../../../../../assets/images/factory/sewingState1.png";
import sewingState2 from "../../../../../assets/images/factory/sewingState2.png";
import sewingState3 from "../../../../../assets/images/factory/sewingState3.png";
import { formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty } from "../../../../../utils/CommonUtil";
import { getSewingMachine } from "../../../../../redux/factory/factoryQrSystemSlice";
import { Payload } from "../../../../../constants/common/common";
import { HEADER_PROPS } from "../../../../../constants/common/common";
import {
  SEWING_MACHINE_COLUMNS,
  SEWING_MACHINE_COLUMNS_TYPE,
  SewingContainerProps,
} from "../../../../../constants/factory/sewing/sewingMachine";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: white;
  }

  #root {
    height: 100%;
  }
`;

const getColorByContent = (flag: string) => {
  switch (flag) {
    case "010":
      return "#FF00FF"; // 기계종류별 color
    case "020":
      return "#FFA500";
    case "030":
    case "040":
    case "050":
      return "#008000";
    case "060":
      return "#0000FF";
    case "070":
      return "#000080";
    case "080":
      return "#800080";
    default:
      return "#000000";
  }
};

const SewingItem = styled.div<SewingContainerProps>`
  border: ${(props) => `2px solid ${getColorByContent(props.flag)}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  min-height: 110px;
  // max-height: 110px;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);

  transition: transform 0.2s ease-in-out, max-height 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.2);
    max-height: 100%;
    font-weight: bold;
  }

  .item-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 5px;

    .item-number {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 3px;
      color: ${(props) => getColorByContent(props.flag)};
    }

    .item-icon img {
      max-width: 35px;
    }
  }

  .item-text {
    font-size: 10px;
    color: red;
    font-weight: bold;
  }

  .item-content {
    font-size: 10px;
    color: black;
    text-align: center;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

/************************************* */
const SewingContainer = styled.div`
  height: 100%; // 부모 요소로부터 100% 높이를 차지하도록 설정
  display: flex;
  flex-direction: column;
  overflow: hidden; // 자식 요소가 넘치는 것을 방지
`;

const ScrollableTableWrapper = styled.div`
  flex: 1; // 남은 공간을 모두 차지하도록 설정
  overflow-y: auto;
  padding-bottom: 10px; // 하단에 약간의 여유 추가
`;

const StyledTable = styled.table`
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  height: 100%; // 테이블을 부모 컨테이너 높이에 맞게 설정
`;

const TableHeaderCell = styled.th`  //cell간격 수정
  font-weight: bold;
  width: 30px;  
  text-align: center;
  border: 1px solid lightgray;
  background-color: #e0f7fa;
`;

const RowHeaderCell = styled.td`
  width: 35px !important;
  min-width: 35px !important;
  max-width: 35px !important;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
  background-color: #f0f0f0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TableCell = styled.td`
  width: 30px;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 57px;
  border-left: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
`;

const TableRow = styled.tr`
  height: 57px;
  border-top: 1px solid lightgray;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50px;
  cursor: pointer;
`;

const StyledImage = styled.img<{ flag: string }>`
  width: 25px;
  height: 25px;
  object-fit: contain;
  margin-bottom: 2px;
  border: 2px solid ${({ flag }) => getColorByContent(flag)};
  border-radius: 4px;
  padding: 1px;
  box-sizing: border-box;
`;

const ImageName = styled.div`
  font-size: 10px;
  font-weight: bold;
  color: blue;
`;

const ImageListWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-wrap: nowrap;
`;

const TableHeadRow = styled.tr``;
/**************************************** */

const SewingMachine = forwardRef((props: HEADER_PROPS, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [sewingMachine, setSewingMachine] = useState<SEWING_MACHINE_COLUMNS_TYPE[]>([]);
  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  const gridItems = Array.from({ length: 200 }, (_, index) => ({
    id: index + 1,
  }));

  useEffect(() => {
    let params = {
      titleName: "SEWING MACHINE STATUS",
      pageLimitCnt: 140,
    };
    setHeaderLayoutInfo(params);
  }, []);

  useEffect(() => {
    setHeaderLayoutInfo({ pageTotalCnt: pageTotalCnt });
  }, [pageTotalCnt]);

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
      dtsWk: formatDateToYYYYMMDD(val.selectedDate),
      excel: val.excel,
      currentPage: val.currentPage,
      limitPage: val.limitPage,
    };

    dispatch(getSewingMachine(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Sewing_Status_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setPageTotalCnt(payload.data[0].totalCnt);
            setSewingMachine(payload.data);
            setHeaderLayoutInfo({ firstLoading: false });
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setPageTotalCnt(0);
          setSewingMachine([]);
          setHeaderLayoutInfo({ firstLoading: false });
        }
      }
    });
  };

  const handleImageClick = (info: {
    row: string;
    col: string;
    index: number;
    text: string;
    content: string;
    name: string;
  }) => {
    alert(
      `Row: ${info.row}, Column: ${info.col}, Index: ${info.index}\nText: ${info.text}\nContent: ${info.content}\nName: ${info.name}`
    );
  };

  return (
    <>
      <GlobalStyle />
        <SewingContainer>
          <ScrollableTableWrapper>
            <StyledTable>
              <thead>
                <TableHeadRow>
                  <TableHeaderCell />
                  {Array.from({ length: 24 }, (_, index) => (
                    <TableHeaderCell key={`header-${index}`}>
                      {index + 1 + "L"}
                    </TableHeaderCell>
                  ))}
                </TableHeadRow>
              </thead>
              <tbody>
                {sewingMachine.map((rowItem, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <RowHeaderCell>{rowItem.locRow}</RowHeaderCell>
                    {Object.entries(rowItem)
                      .filter(([key]) => /^l\d+$/i.test(key))
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([colKey, colValue]) => {
                        const strVal = typeof colValue === "string" ? colValue.trim() : "";
                        const [rawParts, countPart] = strVal.split(/,(?=\d+$)/);
                        const repeatCount = parseInt(countPart || "0", 10);
                        const parts = rawParts
                          .split("/")
                          .map((part) => part.trim().split("-"))
                          .filter((p) => p.length === 3);

                        return (
                          <TableCell key={colKey}>
                            {parts.length > 0 && repeatCount > 0 && (
                              <ImageListWrapper>
                                {Array.from({ length: repeatCount }).map((_, imgIdx) => {
                                  const [flag, status, name] = parts[imgIdx] || ["", "", ""];
                                  let imgSrc = sewingState;
                                  if (status === "200" || status === "9") imgSrc = sewingState3;
                                  else if (status === "300") imgSrc = sewingState1;
                                  else if (status === "100") imgSrc = sewingState2;

                                  return (
                                    <ImageWrapper
                                      key={`${colKey}-imgwrap-${imgIdx}`}
                                      onClick={() =>
                                        handleImageClick({
                                          row: rowItem.locRow,
                                          col: colKey,
                                          index: imgIdx + 1,
                                          text: flag,
                                          content: status,
                                          name,
                                        })
                                      }
                                    >
                                      <StyledImage src={imgSrc} alt={`status-${status}`} flag={flag} />
                                      <ImageName>{name}</ImageName>
                                    </ImageWrapper>
                                  );
                                })}
                              </ImageListWrapper>
                            )}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                ))}
              </tbody>
            </StyledTable>
          </ScrollableTableWrapper>
        </SewingContainer>
    </>
  );
});

export default SewingMachine;
