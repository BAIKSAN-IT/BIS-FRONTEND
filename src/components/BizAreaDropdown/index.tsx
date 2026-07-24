import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
// utils
import { splitArray } from "../../utils/";
import { RootState, AppDispatch } from "../../redux/store";
import { getBizareaList, getFactoryList, setUserEnvInfo,} from "../../redux/tablet/tabletSlice";
import { Payload } from "../../constants/common/common";
import {
  formatDateToYYYYMMDD,
  generateExcel,
  getVtnTime,
  isEmpty,
} from "../../utils/CommonUtil";

// apps icon
import factoryImg from "./icons/slack.png";
import { factory } from "typescript";
//import vina from "./icons/slack.png";
//import pktt from "./icons/slack.png";
//import bago from "./icons/slack.png";

interface Props {
  top?: number;
  iconSize?: number;
}
const BizAreaDropdown = ({top= 0,iconSize = 22}:Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const hasRun = useRef(false);

  const { Bizarea } = useSelector((state: RootState) => ({
    Bizarea: state.Tablet.bizareaList,
  }));

  const[factoryList, setFactoryList] = useState([]);

  const bizarea = Bizarea || [];
  const chunk_size = 4;
  const bizChunks = splitArray(bizarea, chunk_size);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const { user, loading, error, userLoggedIn, userEnvInfo} = useSelector(
    (state: RootState) => ({
      user: state.Auth.user,
      loading: state.Auth.loading,
      error: state.Auth.error,
      userLoggedIn: state.Auth.userLoggedIn,
      userEnvInfo : state.Tablet.userEnvInfo,
    })
  );



useEffect(() => {

    if (!hasRun.current) {
        hasRun.current = true;
        const params = {
              cdCompany: '1000',
              cdBizarea : userEnvInfo.cdBizarea,
        };
        dispatch(getBizareaList(params));
    }
}, [dispatch, userEnvInfo.cdBizarea]);


  /*
  * toggle apps-dropdown
  */
const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
};


useEffect(() => {
}, [userEnvInfo.cdBizarea]);


  const onItemClick = (props:any) => {

    setFactoryList([]);  // Factory list 초기화

    let envParams = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: (props.code === userEnvInfo.cdBizarea) ? null : props.code,
      nmBizarea: (props.code === userEnvInfo.cdBizarea) ? 'BIZ' : props.name,
      cdFty    : (props.code === userEnvInfo.cdBizarea) ? ''    : userEnvInfo.cdFty,
      nmFty    : 'FACTORY',
    };

    let FactoryParam = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: (props.code === userEnvInfo.cdBizarea) ? null : props.code,
    };

    dispatch(getFactoryList(FactoryParam)).then((res) => {

    const payload = res.payload as Payload;

    if (payload.status === 200 && !isEmpty(payload.data)) {
       setFactoryList(payload.data);
      }
    })


    dispatch(setUserEnvInfo(envParams));

    toggleDropdown();

  };

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-apps"
        as="a"
        onClick={toggleDropdown}
        className={classNames("nav-link waves-effect waves-light", {
          show: dropdownOpen,
        })}
        style={{top: top}}
      >
        <i className={`fe-grid noti-icon font-${iconSize}`}></i>
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu-end dropdown-menu-animated dropdown-lg p-0">
        <div className="p-2">
          {(bizChunks || []).map((bizarea, idx) => (
            <div className="row g-0" key={idx}>
              {(bizarea || []).map((item, i) => (
                <div className="col" key={i}>
                  <Link className="dropdown-icon-item"
                        to="#"
                        key={i + "-lang"}
                        onClick={() => onItemClick(item)}>
                    <img src={factoryImg} alt="" />
                    <span>{item.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default BizAreaDropdown;
