import React from "react";
import styled from "styled-components";

interface KnittingStatusSummaryBoxProps {
  label: string;
  value?: string | number;
  style?: string;
}

/* ===============================
 * 퍼센트 색상
 * =============================== */
const getColor = (value: number) => {
  if (value < 50) return "#d9534f";      // red
  if (value < 80) return "#f0ad4e";      // orange
  return "#5cb85c";                      // green
};

/* ===============================
 * Styled Components
 * =============================== */

const Wrapper = styled.div`
  flex: 1;
  background-color: #bbdaf6;
  border-radius: 9px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  height: 45px;
  margin-right: 3px;
  transform: translateY(5px);
`;

const LabelBox = styled.div<{ color?: string }>`
  font-size: clamp(10px, 0.7vw, 18px);
  font-weight: bold;
  color: ${({ color }) => color || "#000"};
  line-height: 1.1;
  white-space: nowrap;
  margin-right: 6px;
  padding: 4px 6px;
`;

const BarArea = styled.div<{ width: number }>`
  position: relative;
  flex: 1;
  height: 100%;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.6);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    width: ${({ width }) => width}%;
    background-color: ${({ width }) => getColor(width)};
    opacity: 0.85;
    transition: width 0.3s ease;
  }
`;

const BarText = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: clamp(8px, 0.7vw, 16px);
  font-weight: bold;
  color: #6200c9;
  line-height: 1.1;
  text-align: center;
  pointer-events: none;
`;

/* ===============================
 * Component
 * =============================== */

const KnittingStatusSummaryBox: React.FC<
  KnittingStatusSummaryBoxProps
> = ({ label, value, style }) => {
  const valueStr =
    value !== undefined && value !== null ? String(value) : "-";

  /** 퍼센트만 추출 */
  let percent = 0;
  const match = valueStr.match(/([\d.]+)%/);
  if (match) {
    const parsed = Number(match[1]);
    percent = isNaN(parsed) ? 0 : parsed;
  }

  percent = Math.min(Math.max(percent, 0), 100);

  return (
    <Wrapper>
      <LabelBox color={style} dangerouslySetInnerHTML={{ __html: label }} />
      <BarArea width={percent}>
        <BarText dangerouslySetInnerHTML={{ __html: valueStr }} />
      </BarArea>
    </Wrapper>
  );
};

export default KnittingStatusSummaryBox;
