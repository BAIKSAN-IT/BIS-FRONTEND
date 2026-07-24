import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Dropdown} from "react-bootstrap";
import classNames from "classnames";

/* redux */
import {AppDispatch, RootState} from "@redux/store";
import {setUserEnvInfo,} from "@redux/tablet/tabletSlice";

/* icons */
import factorFlag from "./icons/factory.png";

interface Props {
  top?: number;
  iconSize?: number;
  showIcon?: boolean;
}

const FactoryDropDownComponent = ({top, iconSize, showIcon = false}: Props) => {

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const {Factorys} = useSelector((state: RootState) => ({
    Factorys: state.Tablet.factoryList,
  }));

  const dispatch = useDispatch<AppDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
  }, [userEnvInfo.cdFty]);


  const onItemSelect = (props: any) => {

    let envParams = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      nmBizarea: userEnvInfo.nmBizarea,
      cdFty: props.code,
      nmFty: props.name,
    };

    dispatch(setUserEnvInfo(envParams));

    toggleDropdown();
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
        style={{top: top}}
      >
        {showIcon ? (
          <i className={`fe-home noti-icon font-${iconSize || 22}`}></i> // 아이콘 출력
        ) : (
          <img src={factorFlag} alt="factory" height="16"/>             // 기존 이미지 출력
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
        <div onClick={toggleDropdown}>
          {(Factorys || []).map((factory, i) => {
            return (
              <Link
                to="#"
                className="dropdown-item notify-item"
                key={i + "-lang"}
                onClick={() => onItemSelect(factory)}
              >
                <img
                  src={factorFlag}
                  alt={factory.name}
                  className="me-1"
                  height="12"
                />{""}
                <span className="align-middle">{factory.name}</span>
              </Link>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FactoryDropDownComponent;
