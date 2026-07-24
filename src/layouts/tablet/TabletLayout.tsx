import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// redux
import { RootState, AppDispatch } from "../../redux/store";

// utils
import { changeHTMLAttribute } from "../../utils";
import { isEmpty } from "../../utils/CommonUtil";
import FactoryCommonPopup from "../../pages/factory/popup/FactoryCommonPopup";
import { setWorkerList } from "../../redux/tablet/tabletSlice";

const TabletTopbar = React.lazy(() => import("./TabletTopbar"));

const loading = () => <div className=""></div>;

interface VerticalLayoutProps {
  children?: any;
}

const TabletLayout = ({ children }: VerticalLayoutProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const childRef = useRef<any>(null);

  const { line, factoryTotalWorkerList, selecetPermission, topbarTheme } =
    useSelector((state: RootState) => ({
      line: state.Tablet.line,
      factoryTotalWorkerList: state.Tablet.factoryTotalWorkerList,
      selecetPermission: state.Auth.selecetPermission,
      topbarTheme: state.Layout.topbarTheme,
    }));

  const [headerInfo, setHeaderInfo] = useState({
    isQrSearch: true,
    selectPass: false,
    titleName: "",
    isLineSelect: false,
    isTableSelect: false,
    isInputMode: false,
  });
  const [stInfo, setStInfo] = useState({
    noStyle: "",
    noPo: "",
    nmClr: "",
  });
  const [reload, setReload] = useState<number>(0);

  useEffect(() => {
    if (line) {
      const lineWorkerList = factoryTotalWorkerList.filter(
        (item) => item.noLine === line.sewLn
      );

      if (!isEmpty(lineWorkerList)) {
        dispatch(setWorkerList(lineWorkerList));
      } else {
        dispatch(setWorkerList(factoryTotalWorkerList));
      }
    }
  }, [line, factoryTotalWorkerList]);

  useEffect(() => {
    changeHTMLAttribute("data-topbar-color", topbarTheme);
  }, [topbarTheme]);

  // Header 버튼 이벤트 핸들러
  const btnHandler = (type: string, val: any) => {
    if (!childRef.current) return;

    try {
      switch (type) {
        case "1":
          if (selecetPermission?.authSearch === "Y") {
            childRef.current.handleSearch(val);
          } else {
            window.ui.modal.open("accessNotAllowedBtnPopup");
          }
          break;
        case "2":
          if (selecetPermission?.authDelete === "Y") {
            childRef.current.handleDelete();
          } else {
            window.ui.modal.open("accessNotAllowedBtnPopup");
          }
          break;
        case "3":
          if (selecetPermission?.authSave === "Y") {
            childRef.current.handleSave();
          } else {
            window.ui.modal.open("accessNotAllowedBtnPopup");
          }
          break;
        case "4":
          childRef.current.handleInputMode(val);
          break;
        case "5":
          childRef.current.handleClearMode();
          break;

        default:
          console.warn("Unknown type:", type);
      }
    } catch (error) {
      console.error("Error calling function:", error);
    }
  };

  // 자식 컴포넌트로부터 데이터를 받는 콜백 함수
  const handleDataFromChild = (data: any) => {
    const handlers: { [key: string]: (value: any) => void } = {
      headerInfo: setHeaderInfo,
      stInfo: setStInfo,
      reload: setReload,
    };

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const normalizedKey = key;
        const handler = handlers[normalizedKey];
        if (handler && !isEmpty(data[key])) {
          handler(data[key]);
        }
      }
    }
  };

  return (
    <>
      <div id="wrapper">
        <div className="content-page">
          <Suspense fallback={loading()}>
            <TabletTopbar
              btnHandler={btnHandler}
              headerInfo={headerInfo}
              stInfo={stInfo}
              reload={reload}
            />
          </Suspense>

          <Suspense fallback={loading()}>
            {React.cloneElement(children, {
              ref: childRef,
              sendDataToParent: handleDataFromChild,
            })}
          </Suspense>
        </div>

        <FactoryCommonPopup />
      </div>
    </>
  );
};

export default TabletLayout;
