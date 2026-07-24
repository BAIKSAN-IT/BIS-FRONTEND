// QrStatusTab.ts
export type QrStatusTabType = "history" | "change" | "broken" | "repair" | "disposal";

export const QR_STATUS_TABS: { key: QrStatusTabType; label: string }[] = [
  { key: "history", label: "common.history.btn" },
  { key: "change", label: "common.change.btn" },
  { key: "broken", label: "common.broken.btn" },
  { key: "repair", label: "common.repair.btn" },
  { key: "disposal", label: "common.disposal.btn" },
];
// 아이콘 class 함수 추가
export const getSewingQrIconClass = (key: QrStatusTabType) => {
  switch (key) {
    case "history":
      return "mdi-history";
    case "change":
      return "mdi-pencil";
    case "broken":
      return "mdi-alert";
    case "repair":
      return "mdi-repair";
    case "disposal":
      return "mdi-delete";
    default:
      return "";
  }
};
