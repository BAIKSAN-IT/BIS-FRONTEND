import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {lstRMK} from "@constants/factory/sewing/sewingHps";
import {updateHpsPopUpSewRmk} from "@redux/factory/factorySewingSlice";
import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common"; // ★ row 타입 추가

interface RemarkCellProps {
  row: any;
  onCellClick?: (e: React.MouseEvent) => void;
  onUpdated?: () => void;
  disabled?: boolean;
}

const RemarkCell = ({row, onCellClick, onUpdated,disabled=false}: RemarkCellProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {userEnvInfo, user} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
    user: state.Auth.user,
  }));

  const originValue = row.original.cdRmk ?? "";
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState(originValue);

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    const res = await dispatch(
      updateHpsPopUpSewRmk({
        cdCompany: userEnvInfo?.cdCompany || "",
        cdBizarea: userEnvInfo?.cdBizarea || "",
        cdFty: userEnvInfo?.cdFty || "",
        sewLn: Number(row.original.sewLn),
        dtsWk: row.original.dtsWk || "",
        seqStyle: Number(row.original.seqStyle),
        cdRmk: newValue,
        id: user?.userId || "",
      })
    );

    const payload = res.payload as Payload;
    if (payload.status === 200) {
      onUpdated?.();   // ★ 부모에게 재조회 요청
    }
    setIsEdit(false);
  };

  const text = lstRMK[Number(originValue)] ?? "-";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        cursor: "pointer",
        padding: "2px 6px",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();   // row 클릭 차단
        if (disabled) return;     // ★ 여기서 완전 차단
        if (!isEdit) setIsEdit(true);
      }}
    >
      {isEdit ? (
        <select
          className="form-select form-select-sm"
          value={value}
          autoFocus
          onChange={handleSelect}
          onMouseDown={(e) => e.stopPropagation()} // select 내부 클릭 보호
        >
          {lstRMK.map((t, i) => (
            <option key={i} value={i}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
};
export default RemarkCell
