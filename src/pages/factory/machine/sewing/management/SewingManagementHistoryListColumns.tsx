import { useTranslation } from "react-i18next";

export const SewingManagementHistoryListColumns = () => {
  const { t } = useTranslation();
  return [
    {
      Header: `${t("management.history.seq")}`,
      accessor: "seq",
      className: "text-center",
    },
    {
      Header: `${t("management.history.dtsJob")}`,
      accessor: "dtsJob",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmAstSw")}`, //구분
      accessor: "nmAstSw",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmFty")}`,
      accessor: "nmFty",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmLine")}`,
      accessor: "nmLine",
      className: "text-center",
    },
    {
      Header: `${t("management.history.cdPosition")}`,
      accessor: "cdPosition",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmUse")}`,
      accessor: "nmUse",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmStatus")}`,
      accessor: "nmStatus",
      className: "text-center",
    },
    {
      Header: `${t("management.history.locReturn")}`, //반품처
      accessor: "locReturn",
      className: "text-center",
    },
    {
      Header: `${t("management.history.dtsReturn")}`, //반품일자
      accessor: "dtsReturn",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmCompany")}`, //업체
      accessor: "nmCompany",
      className: "text-center",
    },
    {
      Header: `${t("management.history.nmPerson")}`, //담당자
      accessor: "nmPerson",
      className: "text-center",
    },
    {
      Header: `${t("management.history.amt")}`, //비용
      accessor: "amt",
      className: "text-center",
    },
    {
      Header: `${t("management.history.ynFix")}`, //완료여부
      accessor: "ynFix",
      className: "text-center",
    },
    {
      Header: `${t("management.history.remark")}`,
      accessor: "remark",
      className: "text-center",
    },
  ];
};
