import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Dropdown} from "react-bootstrap";
import classNames from "classnames";
/* redux*/
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {setUserEnvInfo,} from "@redux/tablet/tabletSlice";

/* utils */
import {splitArray} from "@utils/array";

// apps icon
import factoryImg from "./icons/slack.png";

interface Props {
  top?: number;
  iconSize?: number;
}

const BizareaDropDownComponent = ({top = 0, iconSize = 22}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const {initBizareaList} = useSelector((state: RootState) => ({
    initBizareaList: state.Tablet.initBizareaList,
  }));

  const chunk_size = 4;
  const bizChunks = splitArray(initBizareaList, chunk_size);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const {userEnvInfo} = useSelector(
    (state: RootState) => ({
      userEnvInfo: state.Tablet.userEnvInfo,
    })
  );

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
  }, [userEnvInfo.cdBizarea]);


  const onItemClick = (props: any) => {
    // 1. 선택된 값이 현재 값과 동일하면 아무것도 하지 않음
    if (props.code === userEnvInfo.cdBizarea) {
      toggleDropdown();
      return;
    }

    let envParams = {
      cdCompany: userEnvInfo.cdCompany,
      cdBizarea: props.code,
      nmBizarea: props.name,
      cdFty: '',
      nmFty: '',
    };
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
                    <img src={factoryImg} alt=""/>
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

export default BizareaDropDownComponent;
