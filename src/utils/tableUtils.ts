export function updateTableData<TRow extends { [key: string]: any }, TMod extends { [key: string]: any }>(
  rowIndex: number,
  columnId: string,
  value: string,
  currentData: TRow[],
  setData: React.Dispatch<React.SetStateAction<TRow[]>>,
  setModifiedRows: React.Dispatch<React.SetStateAction<TMod[]>>,
  originalValuesRef: React.MutableRefObject<{ [key: string]: string }>,
  modifiedRowsRef: React.MutableRefObject<Set<string>>,
  rowKeyExtractor: (row: TRow | TMod) => string
): void {
  const newValue = value.trim() === "" ? "0" : value.toString();
  const currentRow = currentData[rowIndex];
  const rowKey = `${rowKeyExtractor(currentRow)}-${columnId}`;

  if (!(rowKey in originalValuesRef.current)) {
    originalValuesRef.current[rowKey] = (currentRow[columnId] ?? "").toString();
  }

  const originalValue = originalValuesRef.current[rowKey];

  // 테이블 행 수정
  setData((prev) =>
    prev.map((row, idx) =>
      idx === rowIndex
        ? {
            ...row,
            [columnId]: currentRow.isNew ? (value.trim() === "" ? "" : newValue) : newValue,
          }
        : row
    )
  );

  setModifiedRows((prev) => {
    const updatedRow = { ...currentRow, [columnId]: newValue } as unknown as TMod;
    const rowKeyValue = rowKeyExtractor(currentRow);

    if (!rowKeyValue) return prev;

    if (originalValue === newValue) {
      // 원래 값과 같으면 삭제
      return prev.filter((row) => rowKeyExtractor(row) !== rowKeyValue);
    }

    // 중복 제거 후 교체 또는 추가
    const existsIndex = prev.findIndex((r) => rowKeyExtractor(r) === rowKeyValue);
    if (existsIndex !== -1) {
      return prev.map((row, idx) => (idx === existsIndex ? updatedRow : row));
    } else {
      return [...prev, updatedRow];
    }
  });

  const baseKey = rowKeyExtractor(currentRow);
  if (!baseKey) return;

  if (originalValue === newValue) {
    modifiedRowsRef.current.delete(baseKey);
  } else {
    modifiedRowsRef.current.add(baseKey);
  }
}

export function addRow<T>(
  currentData: T[],
  defaultRow: T,
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setSelectedRow?: (row: T) => void,
  setModifiedRows?: React.Dispatch<React.SetStateAction<T[]>>,
  modifiedRowsRef?: React.MutableRefObject<Set<string>>,
  rowKeyExtractor?: (row: T) => string
) {
  const newRow: T = {
    ...defaultRow,
    seqNo: currentData.length + 1,
    isNew: true,
  };

  setData([...currentData, newRow]);

  if (setSelectedRow) {
    setSelectedRow(newRow);
  }

  if (setModifiedRows && rowKeyExtractor && modifiedRowsRef) {
    const newKey = rowKeyExtractor(newRow);

    if (!newKey) return; // 빈 키는 제외

    setModifiedRows((prev) => {
      const exists = prev.some((r) => rowKeyExtractor(r) === newKey);
      return exists ? prev : [...prev, newRow];
    });

    modifiedRowsRef.current.add(newKey);
  }
}

export function removeRow<T>(
  selectedRow: T | null,
  currentData: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  key: keyof T,
  alertMessage?: string,
  confirmMessageBuilder?: (row: T) => string,
  clearSelection?: () => void
) {
  if (!selectedRow) {
    alert(alertMessage);
    return;
  }

  const confirmMessage =
    confirmMessageBuilder?.(selectedRow) ?? `정말로 seqNo ${selectedRow[key]} 행을 삭제하시겠습니까?`;

  const confirmDelete = window.confirm(confirmMessage);
  if (!confirmDelete) return;

  const updatedRows = currentData.filter((row) => row[key] !== selectedRow[key]);
  setData(updatedRows);

  if (clearSelection) clearSelection();
}
