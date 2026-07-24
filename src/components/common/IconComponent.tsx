import { memo, CSSProperties } from "react";

interface Props {
  className?: string; // 아이콘 클래스 이름
  style?: CSSProperties; // 사용자 정의 스타일
  onClick?: () => void;
}

const IconComponent = memo(({ className = "", style, onClick }: Props) => {
  // 기본 스타일 정의
  const defaultStyle: CSSProperties = {
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "12px",
    color: "#888",
  };

  return (
    <i
      className={className}
      style={{
        ...defaultStyle, // 기본 스타일
        ...style, // 사용자 정의 스타일로 덮어쓰기
      }}
      onClick={onClick}
    ></i>
  );
});

export default IconComponent;
