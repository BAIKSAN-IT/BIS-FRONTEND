import { CSSProperties, memo } from "react";
import IconComponent from "./IconComponent";

interface Props {
  type: "button" | "submit" | "reset";
  id?: string;
  className?: string; // 기본적으로 선택적 적용 가능
  iClassName?: string;
  onClick?: () => void;
  txt: string;
  style?: CSSProperties;
  isToggle?: boolean; // 토글 상태 추가
  disabled?: boolean; // disable 상태 추가
}

const ButtonComponent = memo(
  ({ type, id, className = "", onClick, txt, iClassName, style, isToggle, disabled = false }: Props) => {
    return (
      <button
        type={type}
        id={id}
        className={className} // 공통 클래스 유지
        onClick={onClick}
        style={style}
        disabled={disabled}
      >
        {iClassName && <i className={iClassName}></i>}
        {txt}
        {/* isOpen이 존재할 때만 아이콘 표시 */}
        {isToggle !== undefined && (
          <IconComponent className={`mdi ${isToggle ? "mdi-chevron-up" : "mdi-chevron-down"} toggle-icon`} />
        )}
      </button>
    );
  }
);

export default ButtonComponent;
