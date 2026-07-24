import React, {memo} from "react";

interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SearchFactoryDashboardBox = memo(({label, active, onClick}: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 120,
        height: 32,
        borderRadius: 8,
        border: active ? "1px solid #0d6efd" : "1px solid #d0d7de",
        background: active ? "#e7f1ff" : "#fff",
        color: active ? "#0d6efd" : "#495057",
        fontWeight: 700,
        padding: "0 14px",
        marginRight: 8,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
});

export default SearchFactoryDashboardBox;
