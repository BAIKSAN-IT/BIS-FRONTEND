// openReportPopup.ts
let reportPopup: Window | null = null;

export const openReportPopup = () => {
  const popupUrl = `/report-viewer`;
  if (!reportPopup || reportPopup.closed) {
    reportPopup = window.open(
      popupUrl,
      "popupWindow",
      "width=1000,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no"
    );
  } else {
    reportPopup.focus();
  }
};
