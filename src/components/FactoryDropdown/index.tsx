
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";
import { RootState, AppDispatch } from "../../redux/store";
import { getFactoryList, setUserEnvInfo,} from "../../redux/tablet/tabletSlice";

import factorFlag from "./icons/factory.png";

interface Props {
  top?: number;
  iconSize?: number;
  showIcon?: boolean;
}
const FactoryDropdown = ({top,iconSize,showIcon=false}:Props) => {

  const hasRun = useRef(false);
  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const { Factorys } = useSelector((state: RootState) => ({
    Factorys: state.Tablet.factoryList,
  }));

  const dispatch = useDispatch<AppDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

   /*
   * toggle language-dropdown
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
  }, [userEnvInfo.cdFty]);


const onItemSelect = (props:any) => {

    let envParams = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: userEnvInfo.cdBizarea,
      nmBizarea: userEnvInfo.nmBizarea,
      cdFty: (props.code === userEnvInfo.cdFty) ? null      : props.code,
      nmFty: (props.code === userEnvInfo.cdFty) ? 'FACTORY' : props.name,
    };

    dispatch(setUserEnvInfo(envParams));

    toggleDropdown();
};

useEffect(() => {
  if (!hasRun.current) {
      hasRun.current = true;
      const params = {
            cdCompany: '1000',
            cdBizarea : userEnvInfo.cdBizarea,
            cdFty: userEnvInfo.cdFty,
            cdFtyAll: userEnvInfo.cdFtyAll,
            nmBizarea: userEnvInfo.nmBizarea,
            nmFty: userEnvInfo.nmFty,
            };
      dispatch(getFactoryList(params));
      }
  }, [dispatch, userEnvInfo]);

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
          <img src={factorFlag} alt="factory" height="16" />             // 기존 이미지 출력
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

export default FactoryDropdown;
