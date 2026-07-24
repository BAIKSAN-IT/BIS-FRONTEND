import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";

import korFlag from "./flags/korea.jpg";
import vietFlag from "./flags/vietnam.jpg";
import myanFlag from "./flags/myanmar.jpg";
import usFlag from "./flags/us.jpg";
import { setLanguage } from "../../redux/system/SystemProgramSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

// get the languages
const Languages = [
  {
    name: "Korea",
    flag: korFlag,
    code: "ko", // 한국어
  },
  {
    name: "English",
    flag: usFlag,
    code: "en", // 영어
  },
  {
    name: "Vietnam",
    flag: vietFlag,
    code: "vi", // 베트남어
  },
  {
    name: "Myanmar",
    flag: myanFlag,
    code: "vi", // 미얀마어도 베트남어로 처리
  },
];

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const currentLang = Languages.find((lang) => lang.code === i18n.language) || Languages[0]; // 현재 언어 설정
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  /*
   * toggle language-dropdown
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  /*
   * Change language
   */
  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode); // 언어 변경
    dispatch(setLanguage(langCode)); // Redux에 언어 저장
    setDropdownOpen(false); // 드롭다운 닫기
  };

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-languages"
        as="a"
        onClick={toggleDropdown}
        className={classNames("nav-link waves-effect waves-light", {
          show: dropdownOpen,
        })}
      >
        <img src={currentLang.flag} alt={currentLang.name} height="16" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
        <div onClick={toggleDropdown}>
          {Languages.map((lang, i) => (
            <button key={i} className="dropdown-item notify-item" onClick={() => handleChangeLanguage(lang.code)}>
              <img src={lang.flag} alt={lang.name} className="me-1" height="12" />
              <span className="align-middle">{lang.name}</span>
            </button>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageDropdown;
