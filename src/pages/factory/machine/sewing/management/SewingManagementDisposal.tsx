import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { SewingQrSystemHistoryListRes } from "../../../../../redux/factory/factoryQrSystemSlice";
import { DateUtils, formatDate } from "../../../../../utils/dateUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";

interface Props {
  selectedRow?: SewingQrSystemHistoryListRes | null;
}

const StyledForm = styled.form`
  margin: 0;
  padding: 0;
  display: contents;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  td,
  th {
    border: 1px solid #ccc;
    padding: 6px;
    text-align: center;
    vertical-align: middle;
  }
  th {
    background-color: #d4edda;
  }
  td[colspan] {
    text-align: left;
    padding-left: 10px;
  }

  textarea {
    width: 100%;
    height: 60px;
    border: none;
    resize: none;
  }
`;

const SewingManagementDisposal = memo(({ selectedRow }: Props) => {
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState({
    astSw: selectedRow?.astSw || "99",
    dtsTrash: DateUtils.today || "",
    nmCompany: selectedRow?.nmCompany || "",
    amtTrash: selectedRow?.amt || 0,
    nmPerson: selectedRow?.nmPerson || "",
    descTrash: selectedRow?.remark || "",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormValues({
        astSw: selectedRow?.astSw || "99",
        dtsTrash: DateUtils.today || "",
        nmCompany: selectedRow?.nmCompany || "",
        amtTrash: selectedRow?.amt || 0,
        nmPerson: selectedRow?.nmPerson || "",
        descTrash: selectedRow?.remark || "",
      });
    }
  }, [selectedRow]);

  return (
    <StyledForm id="disposalForm">
      <DetailTable>
        <tbody>
          <tr>
            <th>{t("management.disposal.astSw")}</th>
            <td colSpan={3}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <label>
                  <input type="radio" name="astSw" value="99" defaultChecked={formValues.astSw === "99"} />
                  {t("management.disposal.dispose")}
                </label>
                <label>
                  <input type="radio" name="astSw" value="88" defaultChecked={formValues.astSw === "88"} />
                  {t("management.disposal.sale")}
                </label>
              </div>
            </td>
          </tr>
          <tr>
            <th>{t("management.disposal.dtsTrash")}</th>
            <td>
              <input name="dtsTrash" className="form-control" type="date" defaultValue={formValues.dtsTrash} />
            </td>
            <th>{t("management.disposal.nmCompany")}</th>
            <td>
              <input name="nmCompany" className="form-control" type="text" defaultValue={formValues.nmCompany} />
            </td>
          </tr>
          <tr>
            <th>{t("management.disposal.amtTrash")}</th>
            <td>
              <input name="amtTrash" className="form-control text-end" type="text" defaultValue={formValues.amtTrash} />
            </td>
            <th>{t("management.disposal.nmPerson")}</th>
            <td>
              <input name="nmPerson" className="form-control" type="text" defaultValue={formValues.nmPerson} />
            </td>
          </tr>
          <tr>
            <th>{t("management.disposal.descTrash")}</th>
            <td colSpan={3}>
              <textarea name="descTrash" defaultValue={formValues.descTrash} />
            </td>
          </tr>
        </tbody>
      </DetailTable>
    </StyledForm>
  );
});

export default SewingManagementDisposal;
