declare module "react-gauge-chart" {
  import * as React from "react";

  export interface GaugeChartProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    nrOfLevels?: number;
    arcsLength?: number[];
    colors?: string[];

    percent?: number; // 0~1
    animate?: boolean;
    marginInPercent?: number;

    needleColor?: string;
    needleBaseColor?: string;

    hideText?: boolean;
    textColor?: string;
    formatTextValue?: (value: string) => string;

    // 필요하면 계속 추가
  }

  const GaugeChart: React.FC<GaugeChartProps>;
  export default GaugeChart;
}
