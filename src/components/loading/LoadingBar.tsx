// LoadingBar.tsx
import React from "react";
import "./LoadingBar.css";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";

const LoadingBar: React.FC = () => {
  // pendingCount 기준으로 계산
  const isLoading = useSelector(
    (state: RootState) => state.Loading.pendingCount > 0
  );

  if (!isLoading) return null;

  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingBar;
