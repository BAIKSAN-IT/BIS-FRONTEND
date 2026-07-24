import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// redux
import { RootState, AppDispatch } from "../../redux/store";

// utils
import { changeHTMLAttribute } from "../../utils";
import FactoryCommonPopup from "../../pages/factory/popup/FactoryCommonPopup";
import { isEmpty } from "../../utils/CommonUtil";

const FactoryTopbar = React.lazy(() => import("./FactoryTopbar"));
const FactoryPagingTopbar = React.lazy(() => import("./FactoryPagingTopbar"));

const loading = () => <div className=""></div>;

interface VerticalLayoutProps {
  children?: any;
  path: string;
}

const FactoryLayout = ({ children, path }: VerticalLayoutProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const childRef = useRef<any>(null);

  const { topbarTheme } = useSelector((state: RootState) => ({
    topbarTheme: state.Layout.topbarTheme,
  }));

  const [pageTotalCnt, setPageTotalCnt] = useState(0);
  const [pageLimitCnt, setPageLimitCnt] = useState(0);
  const [titleName, setTitleName] = useState("");
  const [isStyle, setIsStyle] = useState(false);
  const [isQc, setIsQc] = useState(false);
  const [type, setType] = useState("");
  const [firstLoading, setFirstLoading] = useState(true);
  const [lnInfo, setLnInfo] = useState({
    stLn: "0",
    edLn: "0",
    lnNm: "Line",
    isShow: false,
  });

  // 페이지, 라인 선택 안하는 화면 분기
  const pagingTopbar = [
    "/factory/sewing/input",
    "/factory/cutting/stock",
    "/factory/cutting/actual/style",
    "/factory/cutting/actual/color",
    "/factory/needle/actual",
    "/factory/packing/actual",
    "/factory/knitting/list",
  ];

  useEffect(() => {
    changeHTMLAttribute("data-topbar-color", topbarTheme);
  }, [topbarTheme]);

  // Header 버튼 이벤트 핸들러
  const btnHandler = (type: string, val?: any) => {
    if (!childRef.current) return;
    try {
      switch (type) {
        case "1":
          childRef.current.handleSearch(val);
          break;
        case "2":
          childRef.current.handleDelete();
          break;
        case "3":
          childRef.current.handleSave();
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
      pageTotalCnt: setPageTotalCnt,
      pageLimitCnt: setPageLimitCnt,
      titleName: setTitleName,
      isStyle: setIsStyle,
      isQc: setIsQc,
      lnInfo: setLnInfo,
      firstLoading: setFirstLoading,
      type: setType,
    };

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const normalizedKey = key;
        const handler = handlers[normalizedKey];

        if (handler) {
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
            {pagingTopbar.includes(path) ? (
              <FactoryPagingTopbar
                btnHandler={btnHandler}
                totalCnt={pageTotalCnt}
                limitCnt={pageLimitCnt}
                isLoading={firstLoading}
                titleName={titleName}
                isStyle={isStyle}
                type={type}
              />
            ) : (
              <FactoryTopbar
                btnHandler={btnHandler}
                titleName={titleName}
                isLoading={firstLoading}
                lnInfo={lnInfo}
                isQc={isQc}
                type={type}
              />
            )}
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

export default FactoryLayout;
