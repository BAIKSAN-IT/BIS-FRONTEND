import React, { memo } from "react";
import { Button } from "react-bootstrap";

export interface QrCodeCameraProps {
  value?: string;
  onChange?: (v: string) => void;

  readOnly?: boolean;
  onKeypadOpen?: () => void; // 키패드 버튼
  onScanClick?: () => void; // 카메라 버튼

  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;

  /** 레이아웃 */
  labelPosition?: "top" | "left";
  widthRatio?: number;
  minInputPx?: number;

  attachLabel?: boolean;
}

const QrCodeCameraComponent: React.FC<QrCodeCameraProps> = ({
  value = "",
  onChange,
  readOnly = false,
  onKeypadOpen,
  onScanClick,
  id,
  className,
  disabled,
  labelPosition = "top",
  widthRatio = 1 / 3,
  minInputPx = 320,
  attachLabel = false,
}) => {
  const groupWidth = `calc(${Math.round(widthRatio * 100)}%)`;

  const labelChipStyle: React.CSSProperties = {
    background: "#bbdaf6",
    color: "#155724",
    fontWeight: 700,
    textAlign: "center",
  };

  const groupLabelStyle: React.CSSProperties = {
    ...labelChipStyle,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    border: "1px solid #ced4da",
    borderRight: 0,
  };

  /** Input 필드 */
  const renderInput = () => (
    <input
      type="text"
      className="form-control text-end"
      value={value}
      style={attachLabel ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {}}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );

  /** 버튼들 */
  const renderButtons = () => (
    <>
      {/* 키패드 버튼 */}
      <Button type="button" className="btn waves-light btn-blue" onClick={onKeypadOpen} title="Open keypad">
        <i className="mdi mdi-keyboard" /> {/* 키보드 아이콘 */}
      </Button>

      {/* 카메라 버튼 */}
      <Button type="button" className="btn waves-light btn-blue ms-1" onClick={onScanClick} title="Open QR scanner">
        <i className="mdi mdi-camera" />
      </Button>
    </>
  );

  /** attachLabel = true → input-group 내부 라벨 */
  if (attachLabel) {
    return (
      <div className={className} id={id}>
        <div
          className="input-group"
          style={{ width: groupWidth, minWidth: minInputPx, transform: "translateY(-18px)" }}
        >
          <span className="input-group-text" style={groupLabelStyle}>
            QR CODE
          </span>
          {renderInput()}
          {renderButtons()}
        </div>
      </div>
    );
  }

  /** 라벨이 위/왼쪽 배치일 경우 */
  const isTop = labelPosition === "top";
  return (
    <div className={className} id={id} style={{ padding: 6 }}>
      <div
        style={{
          display: "flex",
          flexDirection: isTop ? "column" : "row",
          alignItems: isTop ? "flex-start" : "center",
          gap: isTop ? 6 : 3,
        }}
      >
        <div
          style={{
            ...labelChipStyle,
            width: isTop ? "auto" : 110,
            minWidth: isTop ? "auto" : 110,
          }}
        >
          QR CODE
        </div>

        <div className="input-group" style={{ width: groupWidth, minWidth: minInputPx }}>
          {renderInput()}
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};

const areEqual = (a: QrCodeCameraProps, b: QrCodeCameraProps) =>
  a.value === b.value &&
  a.readOnly === b.readOnly &&
  a.placeholder === b.placeholder &&
  a.id === b.id &&
  a.className === b.className &&
  a.disabled === b.disabled &&
  a.labelPosition === b.labelPosition &&
  a.widthRatio === b.widthRatio &&
  a.minInputPx === b.minInputPx &&
  a.attachLabel === b.attachLabel;

const QrCodeCamera = memo(QrCodeCameraComponent, areEqual);
QrCodeCamera.displayName = "QrCodeCamera";

export default QrCodeCamera;
