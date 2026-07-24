import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {isEmpty} from "./CommonUtil";
import {LST_RMK} from "../constants/factory/common";

const SpanArea = styled.div`
  display: block;
  width: 100%;
`;

const RemarkArea = styled.div`
  display: block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
`;

const Tooltip = styled.div<{ top: number; left: number }>`
  visibility: ${(props) => (props.top || props.left ? "visible" : "hidden")};
  background-color: black;
  color: #fff;
  text-align: left;
  border-radius: 5px;
  padding: 5px;
  position: fixed;
  z-index: 999;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  opacity: ${(props) => (props.top || props.left ? 1 : 0)};
  transition: opacity 0.3s;
  width: max-content;
  max-width: 200px;
  word-wrap: break-word;
  white-space: normal;
  font-size: 15px;

  &::after {
    content: "";
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 200px;
`;

const ClickableSpan = styled.span`
  display: inline-block;
  width: 100%;
  min-height: 20px;
  cursor: pointer;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;

  .blue-dot {
    width: 15px;
    height: 15px;
    background-color: blue;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }

  .green-dot {
    width: 15px;
    height: 15px;
    background-color: #5cb85c;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }

  .orange-dot {
    width: 15px;
    height: 15px;
    background-color: orange;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }

  .red-dot {
    width: 15px;
    height: 15px;
    background-color: red;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }

  .number {
    font-size: 14px;
  }
`;

interface DefaultColumnProps {
  row: any;
  columnName: string;
  isShowPercent?: boolean;
  color?: string;
  onclick?: () => void;
}

interface RemarkColumnProps {
  row: any;
  columnName: string;
}

const getColor = (value: number) => {
  // if (value < 40) return "#d9534f";
  // if (value < 60) return "#f0ad4e";
  // if (value < 80) return "#5bc0de";
  // return "#5cb85c";

  if (value === 100) return "#5cb85c";
  return "#f0ad4e";
};

const getSewColor = (value: number) => {
  if (value < 80) return "#d9534f";
  if (value < 90) return "#f0ad4e";

  return "#5cb85c";
};

const BarArea = styled.span<{ width: number }>`
  display: inline-block;
  position: relative;
  width: 100%;
  padding: 5px;
  color: black;
  text-align: center;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({width}) => width}%;
    background-color: ${({width}) => getColor(width)};
    z-index: 0;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const IronBarArea = styled.span<{ width: number }>`
  display: inline-block;
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  padding: 5px;
  color: black;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({width}) => width}%;
    background-color: ${({width}) => getColor(width)};
    z-index: 0;
    transition: width 0.4s ease;
  }

  span {
    position: relative;
    z-index: 1;
    font-weight: bold;
    color: #333;
  }

  &:hover::before {
    opacity: 0.8;
  }

  &:hover span {
    color: gray;
  }
`;

const SewBarArea = styled.span<{ width: number }>`
  display: inline-block;
  position: relative;
  width: 100%;
  padding: 5px;
  color: black;
  text-align: center;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({width}) => width}%;
    background-color: ${({width}) => getSewColor(width)};
    z-index: 0;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const IronArea = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;

  img {
    flex: 0 0 auto;
    max-width: 40%;
    height: auto;
    max-height: 80px;
    object-fit: contain;
  }

  div {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 10px;
    width: 60px;
  }
`;
export const FactoryBarColumn: React.FC<DefaultColumnProps> = ({
                                                                 row,
                                                                 columnName,
                                                                 onclick,
                                                               }) => {
  const raw = row?.original?.[columnName];

  // 1️⃣ null / undefined 방어
  if (raw === null || raw === undefined) {
    return (
      <BarArea width={0} onClick={onclick}>
        <span>0.0%</span>
      </BarArea>
    );
  }

  // 2️⃣ 문자열로 강제 변환
  const valueString = String(raw);

  // 3️⃣ END 처리
  let val: number;
  if (valueString === "END") {
    val = 100;
  } else {
    // parseInt ❌ → 소수점 버림
    // parseFloat ⭕
    const num = parseFloat(valueString.replace("%", ""));
    val = isNaN(num) ? 0 : num;
  }

  // 4️⃣ 범위 제한
  if (val < 0) val = 0;
  if (val > 100) val = 100;

  return (
    <BarArea width={val} onClick={onclick}>
      <span>{valueString}</span>
    </BarArea>
  );
};

export const BarColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const valueString = row.original[columnName];
  let val: number;

  if (valueString === "END") {
    val = 100;
  } else {
    val = parseInt(valueString.replace("%", ""), 10);
  }

  if (val < 0) {
    val = 0;
  }
  if (val > 100) {
    val = 100;
  }

  return (
    <BarArea width={val} onClick={onclick}>
      <span>{valueString}</span>
    </BarArea>
  );
};

export const CommaMinusRedColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick,}) => {
  const raw = row.original[columnName];
  if (isEmpty(raw)) {
    return <></>;
  }
  const val = Number(raw);
  if (isNaN(val)) {
    return <>{raw}</>;
  }
  const integerVal = Math.floor(val);
  const isNegative = val < 0;
  return (
    <SpanArea onClick={onclick} style={isNegative ? {color: "red",fontWeight:'700'} : undefined}>
      {integerVal.toLocaleString()}
    </SpanArea>
  );
};

export const CommaColumn: React.FC<DefaultColumnProps> = ({row, columnName, color = 'none', onclick}) => {
  const val = Number(row.original[columnName]);
  const integerVal = Math.floor(val);

  if (isEmpty(val)) {
    return <></>;
  }
  return <SpanArea onClick={onclick} style={{color}}>{integerVal.toLocaleString("ko-KR")}</SpanArea>;
};

export const QcCommaColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const strVal = String(row.original[columnName]);
  const integerVal = Math.floor(val);

  if (!strVal.includes("%")) {
    if (isEmpty(val)) {
      return <></>;
    }

    return <SpanArea onClick={onclick}>{integerVal.toLocaleString("ko-KR")}</SpanArea>;
  } else {
    return <SpanArea onClick={onclick}>{strVal}</SpanArea>;
  }
};

export const IronActualColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = row.original[columnName];
  const valString = String(val);

  // if (valString.includes("<BR>") || valString.includes("&lt;BR&gt;")) {
  //   const normalizedString = valString.replaceAll(/&lt;BR&gt;/g, "<BR>");
  //   const varArr = normalizedString.split(",");

  //   return (
  //     <div>
  //       {varArr.map((item, index) => {
  //         const rowArr = item.split("<BR>");
  //         const resultString = rowArr.slice(1).join("<BR>");

  //         return (
  //           <IronArea key={index}>
  //             <div>
  //               {!isEmpty(rowArr[0]) && (
  //                 <img
  //                   src={(process.env.REACT_APP_IMG_URL || "") + rowArr[0]}
  //                   alt="img Link"
  //                 />
  //               )}
  //               <div
  //                 onClick={onclick}
  //                 dangerouslySetInnerHTML={{ __html: resultString }}
  //               />
  //             </div>
  //           </IronArea>
  //         );
  //       })}
  //     </div>
  //   );
  // }

  if (valString.includes("<BR>") || valString.includes("&lt;BR&gt;")) {
    const varArr = valString?.split(",");

    const rowArr = valString?.split("<BR>");
    const resultString = rowArr.slice(1).join("<BR>");

    if (rowArr.length === 5) {
      return (
        <IronArea>
          {!isEmpty(rowArr[0]) && <img src={`${process.env.REACT_APP_IMG_URL}/images${rowArr[0]}`} alt="preview"/>}
          <div onClick={onclick} dangerouslySetInnerHTML={{__html: resultString}}></div>
        </IronArea>
      );
    } else {
      return (
        <>
          <SpanArea onClick={onclick} dangerouslySetInnerHTML={{__html: valString}}></SpanArea>
        </>
      );
    }
  }

  const rowNum = columnName.replaceAll("amt", "");
  const valTarget = row.original[`target${rowNum}`];
  const integerVal = Math.floor(Number(val));

  if (isEmpty(val)) {
    return <></>;
  }

  if (isEmpty(valTarget)) {
    return <SpanArea onClick={onclick}>{integerVal.toLocaleString("ko-KR")}</SpanArea>;
  }

  const rowArr = valTarget?.split("<BR>");
  const target = Number(rowArr[rowArr.length - 1]);

  let dot = "";

  if (integerVal >= target * 0.9) {
    dot = "green-dot";
  } else if (integerVal >= target * 0.8) {
    dot = "orange-dot";
  } else {
    dot = "red-dot";
  }

  if (isEmpty(integerVal)) {
    return <></>;
  }

  return (
    <IconContainer>
      <div className={dot}></div>
      <span className="number">{integerVal.toLocaleString("ko-KR")}</span>
    </IconContainer>
  );
};

export const ZeroCommaColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);

  return <SpanArea onClick={onclick}>{val.toLocaleString("ko-KR")}</SpanArea>;
};

export const PercentColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const rawValue = row?.original?.[columnName];

  // 값이 없을 때 처리
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return (
      <BarArea width={0} onClick={onclick}>
        <span>-</span>
      </BarArea>
    );
  }

  // 문자열 변환 (이게 핵심!)
  const valueString = String(rawValue);

  // 원본 숫자 포맷팅
  const val = Number(valueString.replace("%", ""));
  const formattedVal = isNaN(val)
    ? "-"
    : val.toLocaleString("ko-KR", {minimumFractionDigits: 2, maximumFractionDigits: 2});

  // 바 차트 계산용 숫자
  let val2 = 0;

  if (valueString === "END") {
    val2 = 100;
  } else {
    const cleaned = valueString.replace("%", "");
    val2 = Number(cleaned);

    if (isNaN(val2)) val2 = 0;
  }

  // 0~100 사이로 보정
  val2 = Math.min(Math.max(val2, 0), 100);

  return (
    <BarArea width={val2} onClick={onclick}>
      <span>{formattedVal}%</span>
    </BarArea>
  );
};


export const NumberPercentColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });

  if (isEmpty(val)) {
    return <></>;
  }
  return <span onClick={onclick}>{formattedVal}%</span>;
};

export const QcNumberPercentColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });

  if (formattedVal === "NaN") {
    return <span>-</span>;
  }
  return <span onClick={onclick}>{formattedVal}%</span>;
};

export const SewingPercentColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });

  const valueString = row.original[columnName];
  let val2: number;

  val2 = Math.round(parseInt(valueString, 10));

  if (val2 < 0) {
    val2 = 0;
  }
  if (val2 > 100) {
    val2 = 100;
  }

  if (Number.isNaN(val2)) {
    return <></>;
  }

  return (
    <SewBarArea width={val2} onClick={onclick}>
      <span>{Math.round(Number(formattedVal))}%</span>
    </SewBarArea>
  );
};

export const getTotalPercent = (row: any) => {
  const ord = Number(row.original.qtOrd);
  const acc = Number(row.original.totalQtSew);

  if (!ord || ord === 0) return null;

  return Math.round((acc / ord) * 100);
};

export const getTotalPercentBg = (row: any) => {
  const ord = Number(row.original.qtOrd);
  const acc = Number(row.original.totalQtSew);

  if (!ord || ord === 0) return "";

  return "hour-bg-blue text-center";
};

export const getSewingBgClass = (row: any, key: string) => {
  const raw = row.original[key];

  if (raw === null || raw === undefined || raw === "") return "";

  const num = Number(raw);
  if (isNaN(num)) return "";

  if (num >= 90) return "hour-bg-green";
  if (num >= 80) return "hour-bg-orange";
  return "hour-bg-red";
};

export const CmColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isEmpty(val)) {
    return <></>;
  }
  return <SpanArea onClick={onclick}>${formattedVal}</SpanArea>;
};

export const DigitColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });

  if (isEmpty(val)) {
    return <></>;
  }
  return <SpanArea onClick={onclick}>{formattedVal}</SpanArea>;
};

export const DigitPercentColumn: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const formattedVal = val.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });

  if (isEmpty(val)) {
    return <></>;
  }
  return <SpanArea onClick={onclick}>{formattedVal}%</SpanArea>;
};

export const DateColumn: React.FC<DefaultColumnProps> = ({row, columnName, color = 'none', onclick}) => {
  if (isEmpty(row.original[columnName])) {
    return <></>;
  }
  const val = String(row.original[columnName]);
  const formattedVal = val ? val.replace(/(\d{4})(\d{2})(\d{2})/, "$2/$3") : "";

  return <SpanArea onClick={onclick} style={{color}}>{formattedVal}</SpanArea>;
};

export const SelectRemarkColumn: React.FC<RemarkColumnProps> = ({row, columnName}) => {
  const [tooltipPosition, setTooltipPosition] = useState({top: 0, left: 0});
  const val = row.original[columnName];
  const remarkRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleMouseOver = (e: React.MouseEvent) => {
    if (remarkRef.current) {
      const rect = remarkRef.current.getBoundingClientRect();

      setTooltipPosition({
        top: rect.bottom,
        left: rect.left,
      });
    }
  };

  const handleMouseOut = () => {
    setTooltipPosition({top: 0, left: 0});
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    row.original[columnName] = e.target.value;
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (remarkRef.current && !remarkRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  return (
    <RemarkArea ref={remarkRef} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isEditing ? (
        <Select value={val} onChange={handleSelectChange} onBlur={() => setIsEditing(false)}>
          {LST_RMK.map((remark, index) => (
            <option key={index} value={index}>
              {remark}
            </option>
          ))}
        </Select>
      ) : (
        <ClickableSpan onClick={handleClick}>{LST_RMK[val] || " "}</ClickableSpan>
      )}
      <Tooltip top={tooltipPosition.top} left={tooltipPosition.left}>
        {LST_RMK[val]}
      </Tooltip>
    </RemarkArea>
  );
};

export const RemarkColumn: React.FC<RemarkColumnProps> = ({row, columnName}) => {
  const [tooltipPosition, setTooltipPosition] = useState({top: 0, left: 0});
  const val = row.original[columnName];
  const remarkRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = (e: React.MouseEvent) => {
    if (remarkRef.current) {
      const rect = remarkRef.current.getBoundingClientRect();

      setTooltipPosition({
        top: rect.bottom,
        left: rect.left,
      });
    }
  };

  const handleMouseOut = () => {
    setTooltipPosition({top: 0, left: 0});
  };

  return (
    <RemarkArea ref={remarkRef} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <span>{val}</span>
      <Tooltip top={tooltipPosition.top} left={tooltipPosition.left}>
        {val}
      </Tooltip>
    </RemarkArea>
  );
};

export const TitleEnterCell = ({header}: { header: string }) => {
  return (
    <span>
      {header.split("<br/>").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < header.split("<br/>").length - 1 && <br/>}
        </React.Fragment>
      ))}
    </span>
  );
};

export const TitleEnterRow: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = row.original[columnName];

  if (isEmpty(val)) {
    return <></>;
  }

  return (
    <span>
      {val.split("<br/>").map((line: any, index: number) => (
        <React.Fragment key={index}>
          {line}
          {index < val.split("<br/>").length - 1 && <br/>}
        </React.Fragment>
      ))}
    </span>
  );
};

export const HourlyBox: React.FC<DefaultColumnProps> = ({row, columnName, onclick}) => {
  const val = Number(row.original[columnName]);
  const targetHour = Number(row.original["tgtHour"]);

  let dot = "";

  if (val >= targetHour * 0.9) {
    dot = "green-dot";
  } else if (val >= targetHour * 0.8) {
    dot = "orange-dot";
  } else {
    dot = "red-dot";
  }

  if (isEmpty(val)) {
    return <></>;
  }

  return (
    <IconContainer>
      <div className={dot}></div>
      <span className="number">{val}</span>
    </IconContainer>
  );
};
export const HourlyBoxBg: React.FC<DefaultColumnProps> = ({
                                                            row,
                                                            columnName,
                                                            isShowPercent = false,
                                                            color = 'none',
                                                          }) => {
  const raw = row.original[columnName];

  // --------------------------
  // CASE 1: 값이 아예 없으면 → 빈칸 + 색칠 없음
  // --------------------------
  if (raw === null || raw === undefined || raw === "") {
    return <span></span>;
  }

  // --------------------------
  // CASE 2: 숫자로 변환 (여기서 NaN이면 값 없는 것으로 판단)
  // --------------------------
  const num = Number(raw);
  if (isNaN(num)) {
    return <span></span>;
  }

  // --------------------------
  // CASE 3: % 표기 시 반올림
  // --------------------------
  const displayValue = isShowPercent ? Math.round(num) : num;

  // --------------------------
  // CASE 4: 색상 적용
  // --------------------------
  const bgClass = getSewingBgClass(
    {original: {[columnName]: displayValue}},
    columnName
  );

  return (
    <span className={bgClass} style={{color}}>
      {displayValue}
      {isShowPercent ? "%" : ""}
    </span>
  );
};
export const RoundTwoColumn: React.FC<DefaultColumnProps> = ({row, columnName}) => {
  const raw = row.original[columnName];

  if (raw === null || raw === undefined || raw === "") return <></>;

  const num = Number(raw);

  const rounded = Number(num.toFixed(2));

  return (
    <SpanArea>{rounded.toLocaleString("ko-KR")}</SpanArea>
  );
};
