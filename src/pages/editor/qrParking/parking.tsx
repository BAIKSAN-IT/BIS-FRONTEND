import React, { useState } from "react";
import QRCode from "react-qr-code";

export default function CallQrCode() {
  const phoneNumber = "01047881595";
  const [mode, setMode] = useState<"tel" | "sms">("tel");

  const qrValue = mode === "tel" ? `tel:${phoneNumber}` : `sms:${phoneNumber}`;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>연락 QR 코드</h2>

        {/* 버튼 탭 */}
        <div style={styles.tabWrapper}>
          <button
            style={{ ...styles.tabBtn, ...(mode === "tel" ? styles.activeTab : {}) }}
            onClick={() => setMode("tel")}
          >
            📞 전화
          </button>
          <button
            style={{ ...styles.tabBtn, ...(mode === "sms" ? styles.activeTab : {}) }}
            onClick={() => setMode("sms")}
          >
            💬 메시지
          </button>
        </div>

        {/* QR 코드 */}
        <div style={styles.qrWrapper}>
          <QRCode value={qrValue} size={200} />
        </div>

        <p style={styles.phone}>{phoneNumber}</p>
        <p style={styles.guide}>
          {mode === "tel" ? "📱 카메라로 스캔하면 전화가 연결됩니다." : "💬 카메라로 스캔하면 메시지 앱이 열립니다."}
        </p>
      </div>
    </div>
  );
}

// 🎨 스타일 정의
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "30px 40px",
    borderRadius: "20px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    textAlign: "center",
    maxWidth: "340px",
    width: "100%",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  tabWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    gap: "10px",
  },
  tabBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#f7f7f7",
    cursor: "pointer",
    fontWeight: "500",
    transition: "0.2s",
  },
  activeTab: {
    background: "#4facfe",
    color: "#fff",
    border: "1px solid #4facfe",
  },
  qrWrapper: {
    background: "#fff",
    padding: "15px",
    borderRadius: "12px",
    display: "inline-block",
    marginBottom: "15px",
    border: "2px solid #eee",
  },
  phone: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: "10px 0",
  },
  guide: {
    fontSize: "13px",
    color: "#777",
  },
};
