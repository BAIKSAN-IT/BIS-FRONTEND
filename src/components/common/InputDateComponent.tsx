import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ================= Utils ================= */

const toDisplay = (v?: string) => {
  if (!v) return "";

  const n = v.replace(/\D/g, "").slice(0, 8);

  if (n.length <= 4) return n;
  if (n.length <= 6) return `${n.slice(0,4)}-${n.slice(4)}`;

  return `${n.slice(0,4)}-${n.slice(4,6)}-${n.slice(6)}`;
};

const toDB = (v: string) => v.replace(/\D/g, "");

const toDate = (v?: string) => {
  if (!v || v.length !== 8) return null;

  return new Date(
    Number(v.slice(0,4)),
    Number(v.slice(4,6)) - 1,
    Number(v.slice(6))
  );
};

const fromDate = (d: Date | null) => {
  if (!d) return "";

  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2,"0") +
    String(d.getDate()).padStart(2,"0")
  );
};

/* ================= Props ================= */

interface Props {
  name?: string;
  value?: string;
  className?: string;
  onChange: (v: string) => void;
}

/* ================= Component ================= */

const InputDateComponent: React.FC<Props> = ({
                                               name,
                                               value,
                                               className,
                                               onChange,
                                             }) => {

  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("");

  /* 외부값 → 화면 */
  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  /* 키보드 입력 */
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = toDisplay(e.target.value);

    setDisplay(f);

    const db = toDB(f);

    if (db.length === 8) {
      onChange(db);
    }
  };

  /* 달력 선택 */
  const handleCalendar = (
    date: Date | null | [Date | null, Date | null]
  ) => {
    if (!date || Array.isArray(date)) return;

    const db = fromDate(date);

    setDisplay(toDisplay(db));
    onChange(db);

    setOpen(false);
  };

  return (
    <div
      className="custom-date-wrapper"
      style={{ position: "relative", width: "100%" }}
    >
      {/* Input */}
      <input
        type="text"
        name={name}
        value={display}
        className={className}
        autoComplete="off"
        placeholder="YYYY-MM-DD"
        maxLength={10}
        inputMode="numeric"

        style={{
          paddingRight: "28px", // 아이콘 공간
        }}

        onChange={handleInput}
      />

      {/* 아이콘 */}
      <i
        className="mdi mdi-calendar"
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "#666",
          fontSize: "14px",
          zIndex: 5,
        }}
        onClick={() => setOpen(true)}
      />

      {/* 달력 */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 99999,
          }}
        >
          <DatePicker
            inline
            selected={toDate(value)}
            onChange={handleCalendar}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
      )}
    </div>
  );
};

export default InputDateComponent;
