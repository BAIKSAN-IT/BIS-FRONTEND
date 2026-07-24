import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styled, { createGlobalStyle } from "styled-components";
import { Card, Row } from "react-bootstrap";
import CustomTableGrid from "../../../components/CustomTableGrid";
import knittingState1 from "../../../assets/images/factory/knittingState1.png";
import knittingState2 from "../../../assets/images/factory/knittingState2.png";
import knittingState3 from "../../../assets/images/factory/knittingState3.png";
import { formatDateToYYYYMMDD, generateExcel, getVtnTime, isEmpty } from "../../../utils/CommonUtil";
import { getKnittingMachine } from "../../../redux/factory/factoryKnittingSlice";
import { Payload } from "../../../constants/common/common";
import { HEADER_PROPS } from "../../../constants/common/common";
import {
  KNITTING_MACHINE_COLUMNS,
  KNITTING_MACHINE_COLUMNS_TYPE,
  KnittingContainerProps,
} from "../../../constants/factory/knitting/knitting";

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
    case "D":
      return "#FF00FF"; // fuchsia
    case "J":
      return "#FFA500";
    case "J.Q":
    case "JQ":
      return "#C0C0C0"; //Silver
    case "R":
      return "#008000";
    case "S":
      return "#0000FF";
    case "S.J.Q":
    case "SJQ":
      return "#000080";
    case "S.T":
    case "ST":
      return "#800080";
    default:
      return "#000000";
  }
};

const KnittingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
  grid-auto-rows: auto;
  gap: 5px;
  height: 100vh;
  padding: 3px;
  box-sizing: border-box;
`;

const KnittingItem = styled.div<KnittingContainerProps>`
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

const KnittingMachine = forwardRef((props: HEADER_PROPS, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useImperativeHandle(ref, () => ({
    handleSearch,
  }));

  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [knittingMachine, setKnittingMachine] = useState<KNITTING_MACHINE_COLUMNS_TYPE[]>([]);

  const [pageTotalCnt, setPageTotalCnt] = useState(0);

  const gridItems = Array.from({ length: 200 }, (_, index) => ({
    id: index + 1,
  }));

  useEffect(() => {
    let params = {
      titleName: "KNITTING MACHINE STATUS",
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

    dispatch(getKnittingMachine(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200) {
        if (!isEmpty(payload.data)) {
          if (val.excel === "Y") {
            const currentDate = getVtnTime(val.selectedDate)
              .replace(/[-:T\s]/g, "")
              .slice(0, 14);
            const fileName = `Knitting_Status_${currentDate}`;
            generateExcel(payload.data, fileName);
          } else {
            setPageTotalCnt(payload.data[0].totalCnt);
            setKnittingMachine(payload.data);
            setHeaderLayoutInfo({ firstLoading: false });
          }
        }
      } else {
        if (payload.errorCode === "100") {
          setPageTotalCnt(0);
          setKnittingMachine([]);
          setHeaderLayoutInfo({ firstLoading: false });
        }
      }
    });
  };

  return (
    <>
      <GlobalStyle />

      <KnittingContainer>
        <div className="knitting-grid">
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ fontWeight: "bold", width: "15px", textAlign: "center" }}></th>
                {Array.from({ length: 26 }, (_, index) => (
                  <th
                    key={`header-${index}`}
                    style={{
                      fontWeight: "bold",
                      width: "40px",
                      textAlign: "center",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {knittingMachine.map((rowItem, rowIdx) => (
                <tr key={rowIdx} style={{ height: "80px" }}>
                  {" "}
                  {/*  row 높이 고정 */}
                  <td
                    style={{
                      fontWeight: "bold",
                      width: "40px",
                      textAlign: "center",
                      height: "70px",
                      transform: "translateY(-12px)",
                    }}
                  >
                    {rowItem.locRow}
                  </td>
                  {Object.entries(rowItem)
                    .filter(([key]) => key.startsWith("col"))
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([colKey, colValue]) => {
                      const parts = typeof colValue === "string" ? colValue.split("/") : ["", "", "", "", ""];
                      const [flag, status, text, content, names] = parts;

                      return (
                        <td
                          key={colKey}
                          style={{
                            width: "40px",
                            textAlign: "center",
                            verticalAlign: "top",
                            padding: "5px",
                            height: "80px", //  셀 높이 고정
                          }}
                        >
                          {colValue && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                height: "100%", //  내부 div 높이 채우기
                              }}
                            >
                              {names}
                              <img
                                src={
                                  status === "0" || status === "9"
                                    ? knittingState3
                                    : status === "1"
                                    ? knittingState1
                                    : knittingState2
                                }
                                alt="status"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "contain",
                                  marginBottom: "5px",
                                  border: `1px solid ${getColorByContent(flag)}`,
                                  borderRadius: "4px",
                                  padding: "1px",
                                  boxSizing: "border-box",
                                }}
                              />
                              <div style={{ fontSize: "12px", fontWeight: "bold" }}>{text}</div>
                              <div style={{ fontSize: "14px", color: "red", fontWeight: "bold" }}>{content}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </KnittingContainer>
    </>
  );
});

export default KnittingMachine;
