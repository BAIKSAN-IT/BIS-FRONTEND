import React, { memo } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getTrackingInfo } from "../../redux/delivery/SmartTrackerSlice";
import { Payload } from "../../constants/common/common";
import ButtonComponent from "../common/ButtonComponent";

interface Props {
  companyCode: string;
  invoiceNumber: string;
  width?: number;
  height?: number;
}

const SMART_DELIVERY_KEY = process.env.REACT_APP_SMART_DELIVERY_KEY || "";

const SweetTrackerPopupComponent = memo(({ companyCode, invoiceNumber, width = 900, height = 800 }: Props) => {
  const handleSearch = async () => {
    if (!companyCode) {
      alert("택배사를 선택하세요.");
      return;
    }
    if (!invoiceNumber) {
      alert("운송장 번호를 입력하세요.");
      return;
    }

    try {
      const popup = window.open(
        "",
        "sweettracker_popup",
        `width=${width},height=${height},left=200,top=100,resizable=yes,scrollbars=yes`
      );

      const form = document.createElement("form");
      form.action = "https://info.sweettracker.co.kr/tracking/4";
      form.method = "post";
      form.target = "sweettracker_popup";

      const inputs = [
        { name: "t_key", value: SMART_DELIVERY_KEY },
        { name: "t_code", value: companyCode },
        { name: "t_invoice", value: invoiceNumber },
      ];
      console.log(inputs);
      inputs.forEach(({ name, value }) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err: any) {
      alert(`스마트택배 API 호출 실패: ${err.message}`);
    }
  };

  return (
    <>
      <ButtonComponent type="button" className="fg-btn" iClassName="ti-search" txt="" onClick={handleSearch} />
    </>
  );
});

export default SweetTrackerPopupComponent;
