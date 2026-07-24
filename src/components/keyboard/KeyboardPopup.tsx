import React, { useEffect, useState } from "react";
import styled from "styled-components";

const PopupContainer = styled.div<{ visible: boolean }>`
  display: ${(props) => (props.visible ? "block" : "none")};
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  border-top: 2px solid #555;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  padding: 10px 0;
  box-sizing: border-box;
`;

const KeyRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 5px 0;
`;

const KeyButton = styled.button<{ wide?: boolean }>`
  width: ${(props) => (props.wide ? "20%" : "10%")};
  padding: 15px 10px;
  margin: 3px;
  font-size: 16px;
  color: white;
  background-color: #444;
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555;
  }

  &:active {
    background-color: #666;
  }
`;

const defaultKeys = [
  [
    { normal: "1", shifted: "!" },
    { normal: "2", shifted: "@" },
    { normal: "3", shifted: "#" },
    { normal: "4", shifted: "$" },
    { normal: "5", shifted: "%" },
    { normal: "6", shifted: "^" },
    { normal: "7", shifted: "&" },
    { normal: "8", shifted: "*" },
    { normal: "9", shifted: "(" },
    { normal: "0", shifted: ")" },
    { normal: "-", shifted: "_" },
    { normal: "=", shifted: "+" },
    { normal: "Delete", shifted: "Delete" },
  ],
  [
    { normal: "q", shifted: "Q" },
    { normal: "w", shifted: "W" },
    { normal: "e", shifted: "E" },
    { normal: "r", shifted: "R" },
    { normal: "t", shifted: "T" },
    { normal: "y", shifted: "Y" },
    { normal: "u", shifted: "U" },
    { normal: "i", shifted: "I" },
    { normal: "o", shifted: "O" },
    { normal: "p", shifted: "P" },
    { normal: "[", shifted: "{" },
    { normal: "]", shifted: "}" },
  ],
  [
    { normal: "a", shifted: "A" },
    { normal: "s", shifted: "S" },
    { normal: "d", shifted: "D" },
    { normal: "f", shifted: "F" },
    { normal: "g", shifted: "G" },
    { normal: "h", shifted: "H" },
    { normal: "j", shifted: "J" },
    { normal: "k", shifted: "K" },
    { normal: "l", shifted: "L" },
    { normal: "Enter", shifted: "Enter" },
  ],
  [
    { normal: "Shift", shifted: "Shift" },
    { normal: "z", shifted: "Z" },
    { normal: "x", shifted: "X" },
    { normal: "c", shifted: "C" },
    { normal: "v", shifted: "V" },
    { normal: "b", shifted: "B" },
    { normal: "n", shifted: "N" },
    { normal: "m", shifted: "M" },
    { normal: ",", shifted: "<" },
    { normal: ".", shifted: ">" },
    { normal: "/", shifted: "?" },
    { normal: "Shift", shifted: "Shift" },
  ],
  [{ normal: "Close", shifted: "Close" }],
];

const UpperKeys = [
  [
    { normal: "1", shifted: "!" },
    { normal: "2", shifted: "@" },
    { normal: "3", shifted: "#" },
    { normal: "4", shifted: "$" },
    { normal: "5", shifted: "%" },
    { normal: "6", shifted: "^" },
    { normal: "7", shifted: "&" },
    { normal: "8", shifted: "*" },
    { normal: "9", shifted: "(" },
    { normal: "0", shifted: ")" },
    { normal: "-", shifted: "_" },
    { normal: "=", shifted: "+" },
    { normal: "Delete", shifted: "Delete" },
  ],
  [
    { normal: "Q", shifted: "q" },
    { normal: "W", shifted: "w" },
    { normal: "E", shifted: "e" },
    { normal: "R", shifted: "r" },
    { normal: "T", shifted: "t" },
    { normal: "Y", shifted: "y" },
    { normal: "U", shifted: "u" },
    { normal: "I", shifted: "i" },
    { normal: "O", shifted: "o" },
    { normal: "P", shifted: "p" },
    { normal: "[", shifted: "{" },
    { normal: "]", shifted: "}" },
  ],
  [
    { normal: "A", shifted: "a" },
    { normal: "S", shifted: "s" },
    { normal: "D", shifted: "d" },
    { normal: "F", shifted: "f" },
    { normal: "G", shifted: "g" },
    { normal: "H", shifted: "h" },
    { normal: "J", shifted: "j" },
    { normal: "K", shifted: "k" },
    { normal: "L", shifted: "l" },
    { normal: "Enter", shifted: "Enter" },
  ],
  [
    { normal: "Shift", shifted: "Shift" },
    { normal: "Z", shifted: "z" },
    { normal: "X", shifted: "x" },
    { normal: "C", shifted: "c" },
    { normal: "V", shifted: "v" },
    { normal: "B", shifted: "b" },
    { normal: "N", shifted: "n" },
    { normal: "M", shifted: "m" },
    { normal: ",", shifted: "<" },
    { normal: ".", shifted: ">" },
    { normal: "/", shifted: "?" },
    { normal: "Shift", shifted: "Shift" },
  ],
  [{ normal: "Close", shifted: "Close" }],
];

interface KeyboardPopupProps {
  visible: boolean;
  isUpper: boolean;
  onKeyPress: (key: string) => void;
  onHide: () => void;
}

const KeyboardPopup: React.FC<KeyboardPopupProps> = ({
  visible,
  isUpper,
  onKeyPress,
  onHide,
}) => {
  useEffect(() => {
    if (!visible) {
      setIsShifted(false);
    }
  }, [visible]);

  const [isShifted, setIsShifted] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === "Shift") {
      setIsShifted(!isShifted);
    } else {
      onKeyPress(key);
    }
  };

  return (
    <PopupContainer visible={visible}>
      {(isUpper ? UpperKeys : defaultKeys).map((row, rowIndex) => (
        <KeyRow key={rowIndex}>
          {row.map((key, idx) => (
            <KeyButton
              key={key.normal + idx}
              wide={
                key.normal === "Shift" ||
                key.normal === "Enter" ||
                key.normal === "Delete" ||
                key.normal === "Close"
              }
              onClick={() => {
                if (key.normal === "Enter" || key.normal === "Close") {
                  onHide();
                } else {
                  handleKeyPress(isShifted ? key.shifted : key.normal);
                }
              }}
            >
              {isShifted ? (
                key.shifted === "Delete" ? (
                  <i className="fe-delete"></i>
                ) : (
                  key.shifted
                )
              ) : key.normal === "Delete" ? (
                <i className="fe-delete"></i>
              ) : (
                key.normal
              )}
            </KeyButton>
          ))}
        </KeyRow>
      ))}
    </PopupContainer>
  );
};

export default KeyboardPopup;
