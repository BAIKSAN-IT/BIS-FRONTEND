import React, {memo} from "react";

interface Props {
  value: number;
  upColor?: string;
  downColor?: string;
  fontSize?: number | string;
  fontWeight?: number;
}

const DiffArrow = memo(
  ({
     value,
     upColor = "#ff0000",
     downColor = "#0066ff",
     fontSize = 7,
     fontWeight = 700,
   }: Props) => {
    if (value > 0) {
      return (
        <span style={{fontSize, color: upColor, fontWeight}}>
          ▲
        </span>
      );
    }

    if (value < 0) {
      return (
        <span style={{fontSize, color: downColor, fontWeight}}>
          ▼
        </span>
      );
    }

    return null;
  }
);

export default DiffArrow;
