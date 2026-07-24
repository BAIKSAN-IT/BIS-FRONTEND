// src/types/react-window.d.ts
declare module "react-window" {
  import * as React from "react";

  // 개별 row 렌더러 props
  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
    data?: any;
    isScrolling?: boolean;
  }

  // FixedSizeList props
  export interface FixedSizeListProps {
    height?: number; // 리스트 세로 크기(px)
    width?: number | string; // 리스트 가로 크기(px 또는 %)
    itemCount?: number; // 전체 아이템 개수
    itemSize?: number; // 각 아이템 높이(px)
    className?: string;
    style?: React.CSSProperties;
    children?: (props: ListChildComponentProps) => React.ReactNode;
    outerElementType?: any;
    innerElementType?: any;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}

  // VariableSizeList (행마다 높이가 다를 때)
  export interface VariableSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: (index: number) => number;
    children: (props: ListChildComponentProps) => React.ReactNode;
  }

  export class VariableSizeList extends React.Component<VariableSizeListProps> {}

  // Grid 타입도 필요하다면 여기에 추가 가능
}
