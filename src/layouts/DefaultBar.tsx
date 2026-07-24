import React, { Suspense } from "react";
import FactoryCommonPopup from "../pages/factory/popup/FactoryCommonPopup";

const loading = () => <div className=""></div>;

interface VerticalLayoutProps {
  children?: any;
}

const DefaultBar = ({ children }: VerticalLayoutProps) => {
  return (
    <>
      <Suspense fallback={loading()}>{children}</Suspense>

      <FactoryCommonPopup />
    </>
  );
};
export default DefaultBar;
