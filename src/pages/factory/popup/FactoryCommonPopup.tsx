import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled, { createGlobalStyle } from "styled-components";
import { AppDispatch } from "../../../redux/store";
import { logoutUser, resetState } from "../../../redux/common/authSlice";

const GlobalStyle = createGlobalStyle`
  .factory-modal {
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

  .popup-content-access {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 400px;
    border-radius: 8px;
    text-align: center;
    height: 240px;

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
`;

const PopupButton = styled.button`
  background: #f60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: #e55;
  }
`;

const FactoryCommonPopup = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 로그인 정보 초기화
  const resetInformation = () => {
    dispatch(logoutUser());
    dispatch(resetState());
  };

  return (
    <>
      {/*      <div id="notAllowedPopup" className="factory-modal">
        <div className="popup-content">
          <i className="fe-alert-triangle notAllow"></i>
          <p>허용되지 않은 접근입니다.</p>
          <PopupButton onClick={resetInformation}>확인</PopupButton>
        </div>
      </div>*/}

      <GlobalStyle />

      <div id="accessNotAllowedPopup" className="factory-modal">
        <div className="popup-content-access">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Permission to access this page is denied.</p>
          <PopupButton onClick={() => window.ui.modal.close("accessNotAllowedPopup")}>확인</PopupButton>
        </div>
      </div>

      <div id="accessNotAllowedBtnPopup" className="factory-modal">
        <div className="popup-content-access">
          <i className="fe-alert-triangle notAllow"></i>
          <p>Permission to access this button is denied.</p>
          <PopupButton onClick={() => window.ui.modal.close("accessNotAllowedBtnPopup")}>확인</PopupButton>
        </div>
      </div>
    </>
  );
};

export default FactoryCommonPopup;
