import React, { memo } from "react";
import { QrReader } from "react-qr-reader";

interface Props {
  onScan: (value: string) => void;
  onClose: () => void;
}

const QrReaderPopup = memo(({ onScan, onClose }: Props) => {
  const handleResult = (result: any, error: any) => {
    if (result?.text) {
      onScan(result.text);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ position: "relative", width: "90%", maxWidth: 400 }}>
        <QrReader
          constraints={{ facingMode: "environment" }}
          scanDelay={300}
          onResult={handleResult}
          containerStyle={{ width: "100%" }}
          videoContainerStyle={{ width: "100%" }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255,255,255,0.8)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default QrReaderPopup;
