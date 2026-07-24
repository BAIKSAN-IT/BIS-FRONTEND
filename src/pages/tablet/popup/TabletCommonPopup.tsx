import React, { useState } from "react";
import { createGlobalStyle, styled } from "styled-components";
import { Button, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../components/CustomTable";
import { CommaColumn } from "../../../utils/CommonUtilJsx";

export const GlobalStyle = createGlobalStyle`
  .tablet-modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .tablet-modal-open {
    display: block;
  }

  .popup-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 400px;
    border-radius: 8px;
    text-align: center;
    height: 200px;

    .notAllow {
      font-size: 50px;
      color: red;
    }

    & > p {
      margin: 1rem 0;
      font-size: 20px;
      color: red;
      font-weight: bold;
    }
  }

  .popup-content-reject {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 400px;
    border-radius: 8px;
    text-align: center;
    height: 250px;

    .notAllow {
      font-size: 50px;
      color: red;
    }

    & > p {
      margin: 1rem 0;
      font-size: 20px;
      color: red;
      font-weight: bold;
    }
  }

  .modal-content {
    background-color: #fefefe;
    margin: 8% auto;
    padding: 0;
    border: 1px solid #888;
    width: 90%;
    max-width: 400px;
    border-radius: 8px;
  }

  .modal-content-wide {
    background-color: #fefefe;
    margin: 8% auto;
    padding: 0;
    border: 1px solid #888;
    width: 90%;
    max-width: 700px;
    border-radius: 8px;

    position: relative;
    display: flex;
    flex-direction: column;
  }

  .modal-content-big {
    background-color: #fefefe;
    margin: 3% auto;
    padding: 0;
    border: 1px solid #888;
    width: 95%;
    height: 90%;
    border-radius: 8px;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 35px;
    font-weight: bold;
    margin-right: 6%;
    margin-top: 2%;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
`;

const KeyPadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

const DisplayArea = styled.div`
  height: 50px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 24px;
  text-align: right;
  color: #333;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const ButtonArea = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  flex: 1;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ddd;
    cursor: not-allowed;
  }
`;

const ButtonNumber = styled(ButtonArea)`
  background: #6c757d;

  &:hover {
    background: #5a6268;
  }
`;

const ButtonClear = styled(ButtonArea)`
  background: #f1556c;

  &:hover {
    background: #f1556c;
  }
`;

const ButtonConfirm = styled(ButtonArea)`
  background: #1abc9c;

  &:hover {
    background: #1abc9c;
  }
`;

const PopupHeader = styled.div``;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const LargePopupContent = styled.div`
  padding: 20px;
`;

const TopBarArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2px;
  background-color: #38414a;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  width: 550px;
  margin-left: 15px;
`;

const PackingCloseBtn = styled.span`
  color: #aaa;
  float: right;
  font-size: 40px;
  font-weight: bold;
  margin: 0 2%;
`;

const SearchArea = styled.div`
  display: flex;
  padding-top: 2px;
  width: 450px;

  .search-area {
    width: 100%;
    margin-right: 5px;

    & input {
      text-align: left;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  width: 300px;

  & button {
    margin-right: 10px;
    padding: 7px 5px;
    width: 115px;

    & span {
      margin-left: -10px;
    }
  }
`;

const PopupButtonConfirm = styled.button`
  background: darkgreen;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 15px;
  width: 40%;

  &:hover {
    background: darkgreen;
  }
`;

const PopupButtonCancel = styled.button`
  background: thistle;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 40%;

  &:hover {
    background: thistle;
  }
`;

const ButtonBackspace = styled(ButtonArea)`
  background: #f39c12;

  &:hover {
    background: #e67e22;
  }
`;

interface ComponentProps {
  setValue?: (val: number) => void;
  setValueString?: (val: string) => void;
  isConfirm?: () => void;
  isSave?: () => void;
  isCancel?: () => void;
}

interface SearchData {
  styleNo: string;
  po: string;
  color: string;
}

const TabletCommonPopup: React.FC<ComponentProps> = ({ setValue, setValueString, isConfirm, isSave, isCancel }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");

  const [searchArea, setSearchArea] = useState<SearchData>({
    styleNo: "",
    po: "",
    color: "",
  });

  const handleNumberClick = (number: string) => {
    setInputValue((prev) => prev + number);
  };

  const handleClearClick = () => {
    setInputValue("");
  };

  const handleBackspaceClick = () => {
    setInputValue((prev) => {
      if (prev.slice(-1) === "-") {
        return prev;
      }
      return prev.slice(0, -1);
    });
  };

  const closePop = (popName: string) => {
    setInputValue("");
    setIsNegative(false);
    window.ui.modal.close(popName);
  };

  const handleConfirmClick = () => {
    if (setValue) {
      setValue(Number(inputValue));
    }
    if (setValueString) {
      setValueString(inputValue);
    }
    setInputValue("");
    setIsNegative(false);
    window.ui.modal.close("keyPad");
  };

  // inputValue change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setSearchArea((prevState) => ({
      ...prevState,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const [isNegative, setIsNegative] = useState<boolean>(false);

  // 입력 초기화
  const resetSearchArea = () => {
    setSearchArea({
      styleNo: "",
      po: "",
      color: "",
    });
  };

  // 팝업창 닫기
  const ClosePackingPop = () => {
    resetSearchArea();
    window.ui.modal.close("packing-delete");
  };

  const toggleSign = () => {
    setInputValue((prev) => (prev ? (isNegative ? prev.slice(1) : `-${prev}`) : "-"));
    setIsNegative(!isNegative);
  };

  // get input columns
  const packingInputColumns = [
    {
      Header: "등록일자",
      accessor: "date",
      sort: true,
      className: "text-center",
    },
    {
      Header: "SEQ",
      accessor: "seq",
      sort: true,
    },
    {
      Header: "BUYER",
      accessor: "buyer",
      sort: true,
      className: "text-center",
    },
    {
      Header: "STYLE NO",
      accessor: "styleNo",
      sort: true,
      className: "text-center",
    },
    {
      Header: "PO NO",
      accessor: "poNo",
      sort: true,
      className: "text-center",
    },
    {
      Header: "D.O",
      accessor: "do",
      sort: true,
      className: "text-center",
    },
    {
      Header: "COLOR",
      accessor: "color",
      sort: true,
      className: "text-center",
    },

    {
      Header: "SIZE",
      accessor: "size",
      sort: true,
      className: "text-center",
    },
    {
      Header: "ORDER QTY",
      accessor: "orderQty",
      Cell: ({ row }: { row: any }) => <CommaColumn row={row} columnName="orderQty" />,
      sort: true,
      className: "text-center",
    },
    {
      Header: "PACKING QTY",
      accessor: "packingQty",
      Cell: ({ row }: { row: any }) => <CommaColumn row={row} columnName="packingQty" />,
      sort: true,
      className: "text-center",
    },
  ];

  interface PackingInputItems {
    date: string;
    seq: string;
    buyer: string;
    styleNo: string;
    poNo: string;
    do: string;
    color: string;
    size: string;
    orderQty: string;
    packingQty: string;
  }

  const packingInputList: PackingInputItems[] = [
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "191",
      orderQty: "191",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "122",
      orderQty: "122",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "ICE BLUE PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
    {
      date: "",
      seq: "",
      buyer: "",
      styleNo: "2CB29-3",
      poNo: "8A30202",
      do: "",
      color: "WILD ASTER/PEACOAT",
      size: "141",
      orderQty: "141",
      packingQty: "",
    },
  ];

  return (
    <>
      <GlobalStyle />
      <div id="keyPad" className="tablet-modal">
        <div className="modal-content">
          <PopupHeader>
            <PopupTitle></PopupTitle>
            <span className="close" onClick={() => closePop("keyPad")}>
              &times;
            </span>
          </PopupHeader>
          <KeyPadArea>
            <DisplayArea>{inputValue}</DisplayArea>
            <ButtonRow>
              <ButtonNumber onClick={() => handleNumberClick("1")}>1</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("2")}>2</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("3")}>3</ButtonNumber>
            </ButtonRow>
            <ButtonRow>
              <ButtonNumber onClick={() => handleNumberClick("4")}>4</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("5")}>5</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("6")}>6</ButtonNumber>
            </ButtonRow>
            <ButtonRow>
              <ButtonNumber onClick={() => handleNumberClick("7")}>7</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("8")}>8</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("9")}>9</ButtonNumber>
            </ButtonRow>
            <ButtonRow>
              <ButtonNumber onClick={toggleSign}>{isNegative ? "+" : "-"}</ButtonNumber>
              <ButtonNumber onClick={() => handleNumberClick("0")}>0</ButtonNumber>
              <ButtonBackspace onClick={handleBackspaceClick}>
                <i className="fe-delete"></i>
              </ButtonBackspace>
            </ButtonRow>
            <ButtonRow>
              <ButtonClear onClick={handleClearClick}>Del</ButtonClear>
              <ButtonConfirm onClick={handleConfirmClick}>Enter</ButtonConfirm>
            </ButtonRow>
          </KeyPadArea>
        </div>
      </div>

      <div id="packing-delete" className="tablet-modal">
        <div className="modal-content-big">
          <PopupHeader>
            <TopBarArea>
              <LeftSection>
                <SearchArea>
                  <div className="search-area">
                    <div className="input-group">
                      <input
                        type="text"
                        id="styleNo"
                        name="styleNo"
                        placeholder="STYLE NO"
                        className="form-control"
                        value={searchArea.styleNo}
                        onChange={(e) => handleInputChange(e)}
                      />
                    </div>
                  </div>
                  <div className="search-area">
                    <div className="input-group">
                      <input
                        type="text"
                        id="po"
                        name="po"
                        placeholder="PO#"
                        className="form-control"
                        value={searchArea.po}
                        onChange={(e) => handleInputChange(e)}
                      />
                    </div>
                  </div>
                  <div className="search-area">
                    <div className="input-group">
                      <input
                        type="text"
                        id="color"
                        name="color"
                        placeholder="COLOR#"
                        className="form-control"
                        value={searchArea.color}
                        onChange={(e) => handleInputChange(e)}
                      />
                    </div>
                  </div>
                </SearchArea>
                <Button
                  variant="success"
                  className="waves-effect waves-light btn btn-success"
                  style={{ marginTop: "2px" }}
                  onClick={() => resetSearchArea()}
                >
                  {t("CLEAR")}
                </Button>
              </LeftSection>

              <RightSection>
                <Button variant="success" className="waves-effect waves-light btn btn-success">
                  {t("SEARCH")}
                  <span className="btn-label-right">
                    <i className="mdi mdi-alert-circle-outline"></i>
                  </span>
                </Button>
                <Button variant="danger" className="waves-effect waves-light btn btn-success">
                  {t("DELETE")}
                  <span className="btn-label-right">
                    <i className="mdi mdi-close-circle-outline"></i>
                  </span>
                </Button>

                <PackingCloseBtn onClick={() => ClosePackingPop()}>&times;</PackingCloseBtn>
              </RightSection>
            </TopBarArea>
          </PopupHeader>
          <LargePopupContent>
            <Row style={{ width: "100%" }}>
              <CustomTable
                columns={packingInputColumns}
                data={packingInputList}
                isSelectable={true}
                isSortable={true}
                selectShow={true}
                isMultiple={true}
                tableClass="table-striped dt-responsive nowrap w-100 body-height"
                theadClass="table-gray"
                tableHeightClass="table-550"
              />
            </Row>
          </LargePopupContent>
        </div>
      </div>

      <div id="confirmPop" className="tablet-modal">
        <div className="popup-content">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Would you like to delete this?</p>

          <div>
            <PopupButtonConfirm onClick={isConfirm}>OK</PopupButtonConfirm>
            <PopupButtonCancel onClick={() => window.ui.modal.close("confirmPop")}>NO</PopupButtonCancel>
          </div>
        </div>
      </div>

      <div id="rejectPop" className="tablet-modal">
        <div className="popup-content-reject">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Please provide the reason for rejection.</p>

          <div>
            <PopupButtonCancel onClick={() => window.ui.modal.close("rejectPop")}>OK</PopupButtonCancel>
          </div>
        </div>
      </div>

      <div id="definedPop" className="tablet-modal">
        <div className="popup-content">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Data does not match.</p>

          <div>
            <PopupButtonCancel onClick={() => window.ui.modal.close("definedPop")}>OK</PopupButtonCancel>
          </div>
        </div>
      </div>

      <div id="savePop" className="tablet-modal">
        <div className="popup-content">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Would you like to save the changes</p>

          <div>
            <PopupButtonConfirm onClick={isSave}>SAVE</PopupButtonConfirm>
            <PopupButtonCancel onClick={isCancel}>NO</PopupButtonCancel>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabletCommonPopup;
