import React, { useEffect, Suspense } from "react";
import { useSelector } from "react-redux";

// store
import { RootState } from "../redux/store";

// utils
import { changeHTMLAttribute } from "../utils";

const Loading = () => <div className="loading">Loading...</div>; // 간단한 로딩 스피너 컴포넌트

interface DefaultLayoutProps {
  layout: {
    layoutType: string;
    layoutWidth: string;
    leftSideBarTheme: string;
    leftSideBarType: string;
    isOpenRightSideBar: boolean; // showRightSidebar을 isOpenRightSideBar로 변경
  };
  children?: React.ReactNode; // children의 타입을 React.ReactNode로 정의
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ layout, children }) => {
  const layoutColor = useSelector(
    (state: RootState) => state.Layout.layoutColor
  );

  useEffect(() => {
    changeHTMLAttribute("data-bs-theme", layoutColor);
  }, [layoutColor]);

  useEffect(() => {
    document.body.classList.add(
      "authentication-bg",
      "authentication-bg-pattern"
    );

    return () => {
      document.body.classList.remove(
        "authentication-bg",
        "authentication-bg-pattern"
      );
    };
  }, []);

  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};

export default DefaultLayout;
