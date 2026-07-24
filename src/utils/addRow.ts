export function addRow<T>(
  currentData: T[],
  newRow: T,
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setSelectedRow?: (row: T) => void
) {
  setData([...currentData, newRow]);

  if (setSelectedRow) {
    setSelectedRow(newRow);
  }
}
