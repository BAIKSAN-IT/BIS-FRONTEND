import React, { useState } from "react";
import { createGlobalStyle, styled } from "styled-components";
import { useTranslation } from "react-i18next";

export const GlobalStyle = createGlobalStyle`
  .tablet-top-modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgba(0,0,0,0.4);
  }

  .tablet-top-modal-open {
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

const ButtonLetter = styled(ButtonArea)`
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

const ButtonToggle = styled(ButtonArea)`
  background: #a9a9a9;

  &:hover {
    background: #a9a9a9;
  }
`;

const ButtonBackspace = styled(ButtonArea)`
  background: #f39c12;

  &:hover {
    background: #e67e22;
  }
`;

const PopupHeader = styled.div``;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 20px;
`;

interface ComponentProps {
  setSearchValue?: (val: string) => void;
}

const TabletTopCommonPopup: React.FC<ComponentProps> = ({ setSearchValue }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");
  const [isNumeric, setIsNumeric] = useState<boolean>(true);
  const [isNegative, setIsNegative] = useState<boolean>(false);

  const handleNumberClick = (number: string) => {
    setInputValue((prev) => prev + number);
  };

  const handleLetterClick = (letter: string) => {
    setInputValue((prev) => prev + letter);
  };

  const handleClearClick = () => {
    setInputValue("");
    setIsNegative(false);
  };

  const handleBackspaceClick = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const toggleSign = () => {
    setInputValue((prev) =>
      prev ? (isNegative ? prev.slice(1) : `-${prev}`) : "-"
    );
    setIsNegative(!isNegative);
  };

  const closePop = (popName: string) => {
    setInputValue("");
    window.ui.modal.close(popName);
  };

  const handleSearchConfirmClick = () => {
    if (setSearchValue) {
      setSearchValue(inputValue);
    }
    setInputValue("");
    window.ui.modal.close("headerKeyPad");
  };

  const toggleKeypad = () => {
    setIsNumeric(!isNumeric);
  };

  return (
    <>
      <GlobalStyle />
      <div id="headerKeyPad" className="tablet-top-modal">
        <div className={isNumeric ? "modal-content" : "modal-content-wide"}>
          <PopupHeader>
            <PopupTitle></PopupTitle>
            <span className="close" onClick={() => closePop("headerKeyPad")}>
              &times;
            </span>
          </PopupHeader>
          <KeyPadArea>
            <DisplayArea>{inputValue}</DisplayArea>
            {isNumeric ? (
              <>
                <ButtonRow>
                  <ButtonNumber onClick={() => handleNumberClick("1")}>
                    1
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("2")}>
                    2
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("3")}>
                    3
                  </ButtonNumber>
                </ButtonRow>
                <ButtonRow>
                  <ButtonNumber onClick={() => handleNumberClick("4")}>
                    4
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("5")}>
                    5
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("6")}>
                    6
                  </ButtonNumber>
                </ButtonRow>
                <ButtonRow>
                  <ButtonNumber onClick={() => handleNumberClick("7")}>
                    7
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("8")}>
                    8
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("9")}>
                    9
                  </ButtonNumber>
                </ButtonRow>
                <ButtonRow>
                  <ButtonNumber onClick={toggleSign}>
                    {isNegative ? "+" : "-"}
                  </ButtonNumber>
                  <ButtonNumber onClick={() => handleNumberClick("0")}>
                    0
                  </ButtonNumber>
                  <ButtonBackspace onClick={handleBackspaceClick}>
                    <i className="fe-delete"></i>
                  </ButtonBackspace>
                </ButtonRow>
                <ButtonRow>
                  <ButtonClear onClick={handleClearClick}>Del</ButtonClear>
                  <ButtonConfirm onClick={handleSearchConfirmClick}>
                    Enter
                  </ButtonConfirm>
                </ButtonRow>
              </>
            ) : (
              <>
                <ButtonRow>
                  <ButtonLetter onClick={() => handleLetterClick("A")}>
                    A
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("B")}>
                    B
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("C")}>
                    C
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("D")}>
                    D
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("E")}>
                    E
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("F")}>
                    F
                  </ButtonLetter>
                </ButtonRow>
                <ButtonRow>
                  <ButtonLetter onClick={() => handleLetterClick("G")}>
                    G
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("H")}>
                    H
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("I")}>
                    I
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("J")}>
                    J
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("K")}>
                    K
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("L")}>
                    L
                  </ButtonLetter>
                </ButtonRow>
                <ButtonRow>
                  <ButtonLetter onClick={() => handleLetterClick("M")}>
                    M
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("N")}>
                    N
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("O")}>
                    O
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("P")}>
                    P
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("Q")}>
                    Q
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("R")}>
                    R
                  </ButtonLetter>
                </ButtonRow>
                <ButtonRow>
                  <ButtonLetter onClick={() => handleLetterClick("S")}>
                    S
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("T")}>
                    T
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("U")}>
                    U
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("V")}>
                    V
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("W")}>
                    W
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("X")}>
                    X
                  </ButtonLetter>
                </ButtonRow>
                <ButtonRow>
                  <ButtonLetter onClick={() => handleLetterClick("Y")}>
                    Y
                  </ButtonLetter>
                  <ButtonLetter onClick={() => handleLetterClick("Z")}>
                    Z
                  </ButtonLetter>
                  <ButtonBackspace onClick={handleBackspaceClick}>
                    <i className="fe-delete"></i>
                  </ButtonBackspace>
                  <ButtonClear onClick={handleClearClick}>Del</ButtonClear>
                  <ButtonConfirm onClick={handleSearchConfirmClick}>
                    Enter
                  </ButtonConfirm>
                </ButtonRow>
              </>
            )}
            <ButtonRow>
              <ButtonToggle onClick={toggleKeypad}>
                {isNumeric ? "Switch to Letters" : "Switch to Numbers"}
              </ButtonToggle>
            </ButtonRow>
          </KeyPadArea>
        </div>
      </div>
    </>
  );
};

export default TabletTopCommonPopup;
