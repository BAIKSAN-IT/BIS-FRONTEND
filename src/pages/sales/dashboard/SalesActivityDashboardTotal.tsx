import React from "react";
import { SalesActivityDashboardPortlet } from "./SalesActivityDashboardPortlet";
import { SalesActivityDashboardRes } from "../../../redux/sales/SalesActivitySlice";

interface Props {
  data: SalesActivityDashboardRes[];
}

const SalesActivityDashboardTotal = ({ data = [] }: Props) => {
  return (
    <SalesActivityDashboardPortlet className={"mt-n2"} cardTitle="전체" titleClass="header-title">
      <div className="d-flex justify-content-center align-items-center mt-n2">
        <table className="table table-bordered mb-0" style={{ fontSize: "14px", height: 280 }}>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col />
          </colgroup>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="custom-sales-dashboard-table">{row.deptNm}</td>
                <td
                  style={{
                    verticalAlign: "middle",
                    textAlign: "left",
                  }}
                >
                  {row.nmSysDefList}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SalesActivityDashboardPortlet>
  );
};

export default SalesActivityDashboardTotal;
