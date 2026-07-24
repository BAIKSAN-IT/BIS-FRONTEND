import React, {memo} from "react";
import {Button} from "react-bootstrap";

export interface QrCodeMainPisProps {
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

  labelTitle?: string; // label 명
}

const QrCodeMainPisComponent: React.FC<QrCodeMainPisProps> = ({
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
                                                              labelTitle = 'QR CODE'
                                                            }) => {

  const groupWidth = `calc(${Math.round(widthRatio * 100)}%)`;

  const labelChipStyle: React.CSSProperties = {
    boxSizing: "border-box",
    width: "var(--label-w)",
    minWidth: "var(--label-w)",
    maxWidth: "var(--label-w)",
    height: "var(--control-h)",
    backgroundColor: "#bbdaf6",
    fontFamily: "PaperlogyMedium",
    color: "#424242",
    fontWeight: "normal",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    borderRadius: "6px",
    fontSize: "9px",
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

  const renderInput = () => (
    <input
      type="text"
      className="form-control text-end"
      value={value}
      style={attachLabel ? {height: 'var(--control-h)',borderTopLeftRadius: 0, borderBottomLeftRadius: 0} : {}}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );

  const renderButtons = () => (
    <>
      <Button type="button" className="btn waves-light btn-blue" onClick={onKeypadOpen} title="Open keypad" style={{height: 'var(--control-h)'}}>
        <i className="mdi mdi-keyboard" style={{fontSize: '14px', display: 'flex', alignItems: 'center'}}/>
      </Button>

      <Button type="button" className="btn waves-light btn-blue ms-1" onClick={onScanClick} title="Open QR scanner" style={{height: 'var(--control-h)'}}>
        <i className="mdi mdi-camera" style={{fontSize: '14px', display: 'flex', alignItems: 'center'}}/>
      </Button>
    </>
  );

  /** attachLabel 모드 */
  if (attachLabel) {
    return (
      <div className={className} id={id}>
        <div
          className="input-group"
          style={{
            width: groupWidth,
            minWidth: `min(${minInputPx}px, 100%)`,  // ★ 수정된 부분
            transform: "translateY(-18px)"
          }}
        >
          <span className="input-group-text" style={groupLabelStyle}>
            {labelTitle}
          </span>
          {renderInput()}
          {renderButtons()}
        </div>
      </div>
    );
  }

  const isTop = labelPosition === "top";

  return (
    <div className={className} id={id} style={{padding: 6}}>
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
          {labelTitle}
        </div>

        <div
          className="input-group"
          style={{
            width: groupWidth,
            minWidth: `min(${minInputPx}px, 100%)`  // ★ 여기도 동일하게 적용
          }}
        >
          {renderInput()}
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};

const areEqual = (a: QrCodeMainPisProps, b: QrCodeMainPisProps) =>
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

const QrCodeMainPis = memo(QrCodeMainPisComponent, areEqual);
QrCodeMainPis.displayName = "QrCodeMainPis";

export default QrCodeMainPis;
