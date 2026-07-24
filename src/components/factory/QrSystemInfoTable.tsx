// components/common/InfoTable.tsx
import React, { memo } from "react";
import styled from "styled-components";

const QrSystemTableWrapper = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ccc;
    padding: 0px;
    text-align: center;
    vertical-align: middle;
    height: 27px;
  }

  th {
    background-color: #d4edda;
    font-weight: bold;
    width: 130px;
  }
`;

interface QrSystemInfoCell {
  isTh?: boolean; // true면 <th>, false면 <td>
  content: string | React.ReactNode;
  rowSpan?: number;
  colSpan?: number;
}

interface Props {
  rows: QrSystemInfoCell[][];
}

const QrSystemTable = memo(({ rows }: Props) => {
  return (
    <QrSystemTableWrapper>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIdx) =>
              cell.isTh ? (
                <th key={`th-${rowIndex}-${cellIdx}`} rowSpan={cell.rowSpan ?? 1} colSpan={cell.colSpan ?? 1}>
                  {cell.content}
                </th>
              ) : (
                <td key={`td-${rowIndex}-${cellIdx}`} rowSpan={cell.rowSpan ?? 1} colSpan={cell.colSpan ?? 1}>
                  {cell.content}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </QrSystemTableWrapper>
  );
});

export default QrSystemTable;
