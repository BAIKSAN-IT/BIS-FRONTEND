interface UpdateTableOptions<T, TMod> {
  setModifiedRows?: React.Dispatch<React.SetStateAction<TMod[]>>;
  originalValuesRef?: React.MutableRefObject<Record<string, string>>;
  modifiedRowsRef?: React.MutableRefObject<Set<string>>;
  rowKeyExtractor?: (row: T | TMod) => string;
}

export function updateTableData<T extends Record<string, any>, TMod extends Record<string, any>>(
  rowIndex: number,
  columnId: string,
  value: string,
  currentData: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  options?: UpdateTableOptions<T, TMod>
) {
  const { setModifiedRows, originalValuesRef, modifiedRowsRef, rowKeyExtractor } = options || {};

  const newValue = value.trim() === "" ? "0" : value;
  const currentRow = currentData[rowIndex];
  const rowKey = rowKeyExtractor ? `${rowKeyExtractor(currentRow)}-${columnId}` : "";

  // 최초 원본 저장
  if (originalValuesRef && !(rowKey in originalValuesRef.current)) {
    originalValuesRef.current[rowKey] = (currentRow[columnId] ?? "").toString();
  }

  const originalValue = originalValuesRef?.current[rowKey];

  setData((prev) =>
    prev.map((row, idx) => (idx === rowIndex ? { ...row, [columnId]: currentRow.isNew ? value : newValue } : row))
  );

  if (setModifiedRows && rowKeyExtractor) {
    const updatedRow = { ...currentRow, [columnId]: newValue } as TMod;
    const rowKeyValue = rowKeyExtractor(currentRow);

    setModifiedRows((prev) => {
      const existsIndex = prev.findIndex((r) => rowKeyExtractor(r) === rowKeyValue);
      if (originalValue === newValue) {
        return prev.filter((r) => rowKeyExtractor(r) !== rowKeyValue);
      }
      return existsIndex !== -1 ? prev.map((r, idx) => (idx === existsIndex ? updatedRow : r)) : [...prev, updatedRow];
    });

    if (modifiedRowsRef) {
      if (originalValue === newValue) {
        modifiedRowsRef.current.delete(rowKeyValue);
      } else {
        modifiedRowsRef.current.add(rowKeyValue);
      }
    }
  }
}
