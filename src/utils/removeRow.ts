export function removeRow<T>(
  selectedRow: T | null,
  currentData: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  key: keyof T,
  options?: {
    alertMessage?: string;
    confirmMessageBuilder?: (row: T) => string;
    clearSelection?: () => void;
    fallbackRow?: T;
  }
) {
  const rowToDelete = selectedRow ?? options?.fallbackRow;

  if (!rowToDelete) {
    options?.alertMessage && alert(options.alertMessage);
    return;
  }

  const confirmMessage =
    options?.confirmMessageBuilder?.(rowToDelete) ?? `정말로 ${String(rowToDelete[key])} 항목을 삭제하시겠습니까?`;
  const confirmed = window.confirm(confirmMessage);
  if (!confirmed) return;

  // key 값이 같더라도 첫 번째 항목만 제거
  const indexToRemove = currentData.findIndex((row) => row === rowToDelete);
  if (indexToRemove === -1) return;

  const updated = [...currentData];
  updated.splice(indexToRemove, 1);
  setData(updated);

  if (options?.clearSelection) options.clearSelection();
}
