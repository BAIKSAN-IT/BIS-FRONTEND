// src/components/common/QrCodeBar.tsx
import React, { memo } from "react";
import { Button } from "react-bootstrap";

export interface QrCodeBarProps {
  value?: string;
  onChange?: (v: string) => void;

  readOnly?: boolean;
  onInputClick?: () => void;

  onKeypadOpen?: () => void;
  onScanClick?: () => void;
  showScanButton?: boolean;

  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;

  /** 레이아웃 */
  labelPosition?: "top" | "left"; // 라벨을 바깥에 둘 때만 영향, 기본 "top"
  widthRatio?: number; // 입력 영역 너비 비율 (0~1), 기본 1/3
  minInputPx?: number; // 최소 너비 px, 기본 320

  /** ✅ 라벨을 인풋 옆에 '딱 붙여' input-group 안쪽으로 넣기 */
  attachLabel?: boolean; // 기본 false (이전과 동일), true면 input-group-text 사용
}

const QrCodeBarComponent: React.FC<QrCodeBarProps> = ({
  value = "",
  onChange,
  readOnly = false,
  onInputClick,
  onKeypadOpen,
  onScanClick,
  placeholder = "Scan or paste QR code…",
  id,
  className,
  disabled,
  showScanButton = false,
  labelPosition = "top",
  widthRatio = 1 / 3,
  minInputPx = 320,
  attachLabel = false,
}) => {
  const groupWidth = `calc(${Math.round(widthRatio * 100)}%)`;

  // 공통 라벨 스타일
  const labelChipStyle: React.CSSProperties = {
    background: "#bbdaf6",
    color: "#155724",
    fontWeight: 700,
    textAlign: "center",
  };

  // input-group 안쪽 라벨 스타일 (붙어서 보이도록)
  const groupLabelStyle: React.CSSProperties = {
    ...labelChipStyle,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    border: "1px solid #ced4da",
    borderRight: 0,
  };

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

          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            onClick={() => {
              if (readOnly && onInputClick) onInputClick();
            }}
            onChange={(e) => onChange?.(e.target.value)}
          />

          {onKeypadOpen && (
            <Button type="button" className="btn waves-light btn-blue" onClick={onKeypadOpen} title="Open keypad">
              <i className="fa fa-search me-1" />
            </Button>
          )}

          {showScanButton && onScanClick && (
            <Button type="button" variant="secondary" onClick={onScanClick} title="Open QR scanner">
              <i className="mdi mdi-qrcode-scan" />
            </Button>
          )}
        </div>
      </div>
    );
  }

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

        <div
          className="input-group"
          style={{
            width: groupWidth,
            minWidth: minInputPx,
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            onClick={() => {
              if (readOnly && onInputClick) onInputClick();
            }}
            onChange={(e) => onChange?.(e.target.value)}
          />

          {onKeypadOpen && (
            <Button type="button" className="btn waves-light btn-blue" onClick={onKeypadOpen} title="Open keypad">
              <i className="fa fa-search me-1" />
            </Button>
          )}

          {showScanButton && onScanClick && (
            <Button type="button" variant="secondary" onClick={onScanClick} title="Open QR scanner">
              <i className="mdi mdi-qrcode-scan" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (a: QrCodeBarProps, b: QrCodeBarProps) =>
  a.value === b.value &&
  a.readOnly === b.readOnly &&
  a.placeholder === b.placeholder &&
  a.id === b.id &&
  a.className === b.className &&
  a.disabled === b.disabled &&
  a.showScanButton === b.showScanButton &&
  a.labelPosition === b.labelPosition &&
  a.widthRatio === b.widthRatio &&
  a.minInputPx === b.minInputPx &&
  a.attachLabel === b.attachLabel;

const QrCodeBar = memo(QrCodeBarComponent, areEqual);
QrCodeBar.displayName = "QrCodeBar";

export default QrCodeBar;
