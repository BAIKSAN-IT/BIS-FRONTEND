import React from "react";
import QRCode from "react-qr-code";

interface QRCodePrintProps {
  codes: string[];
}

const QRCodePrint = ({ codes }: QRCodePrintProps) => {
  return (
    <div id="qr-print-area" style={{ display: "block", padding: 20 }}>
      {codes.map((code, index) => (
        <div
          key={index}
          style={{
            pageBreakAfter: "always",
            width: "750px",
            margin: "0 auto 40px",
            border: "1px solid black",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              border: "1px solid black",
            }}
          >
            <tbody>
              {/* 상단 체크박스 라인 */}
              <tr>
                <td colSpan={4} style={{ padding: 4 }}>
                  <strong>For</strong>
                  &nbsp; ☑ Develop smpl &nbsp; ☑ 1st smpl &nbsp; ☑ Color smpl &nbsp; ☑ Revise color smpl &nbsp; ☑ App
                  smpl
                </td>
              </tr>

              {/* HANGER / SAMPLE / DESCRIPTION */}
              <tr>
                <td style={tdLabel}>HANGER#</td>
                <td style={tdValue}>PKU-20200304-A01</td>
                <td style={tdLabel}>SAMPLE NO.</td>
                <td style={tdValue}>21SS-24CORE-007</td>
              </tr>
              <tr>
                <td style={tdLabel}>DESCRIPTION</td>
                <td style={tdValue}>DOUBLEFACE</td>
                <td style={tdLabel}>SUPPLIER</td>
                <td style={tdValue}>(주) PANKO</td>
              </tr>

              {/* COMPOSITION */}
              <tr>
                <td style={tdLabel}>COMPOSITION</td>
                <td colSpan={3} style={{ ...tdValue, height: 60, lineHeight: "20px" }}>
                  POLYESTER 46%
                  <br />
                  MODAL 44%
                  <br />
                  POLYURETHANE 10%
                </td>
              </tr>

              {/* FABRICATION / YARN COUNT */}
              <tr>
                <td style={tdLabel}>FABRICATION</td>
                <td style={tdValue}>PET30SF + MODAL30SF + SPAN30D</td>
                <td style={tdLabel}>YARN COUNT</td>
                <td style={tdValue}>CM40S/1 + SPAN 20D SD + RAYON 40S/1</td>
              </tr>

              {/* WEIGHT / WIDTH */}
              <tr>
                <td style={tdLabel}>WEIGHT</td>
                <td style={tdValue}>300g/㎡</td>
                <td style={tdLabel}>WIDTH</td>
                <td style={tdValue}>5456 (INCH)</td>
              </tr>

              {/* LOT / COLOR */}
              <tr>
                <td style={tdLabel}>LOT#</td>
                <td style={tdValue}>S23-1367</td>
                <td style={tdLabel}>COLOR CODE</td>
                <td style={tdValue}>10</td>
              </tr>
              <tr>
                <td style={tdLabel}>COLOR NAME</td>
                <td style={tdValue}>ANY PINK</td>
                <td style={tdLabel}>SUBMIT DATE</td>
                <td style={tdValue}>2024-03-25</td>
              </tr>

              {/* REMARK + QR */}
              <tr>
                <td style={tdLabel}>REMARK</td>
                <td colSpan={2} style={tdValue}></td>
                <td rowSpan={2} style={{ textAlign: "center", padding: 6 }}>
                  <QRCode value={code} size={64} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

const tdLabel: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px",
  fontWeight: "bold",
  width: "20%",
  verticalAlign: "top",
};

const tdValue: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px",
  verticalAlign: "top",
};

export default React.memo(QRCodePrint);
