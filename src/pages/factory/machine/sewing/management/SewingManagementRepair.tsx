import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { SewingQrSystemHistoryListRes } from "../../../../../redux/factory/factoryQrSystemSlice";
import { DateUtils } from "../../../../../utils/dateUtils";

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

const SewingManagementRepair = memo(({ selectedRow }: Props) => {
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState({
    dtsFix: DateUtils.today || "",
    amtFix: selectedRow?.amt || 0,
    nmCompany: selectedRow?.nmCompany || "",
    nmPerson: selectedRow?.nmPerson || "",
    descFix: selectedRow?.remark || "",
    ynFix: selectedRow?.ynFix || "N",
  });
  useEffect(() => {
    if (selectedRow) {
      setFormValues({
        dtsFix: DateUtils.today || "",
        amtFix: selectedRow?.amt || 0,
        nmCompany: selectedRow?.nmCompany || "",
        nmPerson: selectedRow?.nmPerson || "",
        descFix: selectedRow?.remark || "",
        ynFix: selectedRow?.ynFix || "N",
      });
    }
  }, [selectedRow]);

  return (
    <StyledForm id="repairForm">
      <DetailTable>
        <tbody>
          <tr>
            <th>{t("management.repair.dtsFix")}</th>
            <td>
              <input name="dtsFix" className="form-control" type="date" defaultValue={formValues.dtsFix} />
            </td>
            <th>{t("management.repair.amtFix")}</th>
            <td>
              <input name="amtFix" className="form-control text-end" type="text" defaultValue={formValues.amtFix} />
            </td>
          </tr>
          <tr>
            <th>{t("management.repair.nmCompany")}</th>
            <td>
              <input name="nmCompany" className="form-control" type="text" defaultValue={formValues.nmCompany} />
            </td>
            <th>{t("management.repair.nmPerson")}</th>
            <td>
              <input name="nmPerson" className="form-control" type="text" defaultValue={formValues.nmPerson} />
            </td>
          </tr>
          <tr>
            <th>{t("management.repair.descFix")}</th>
            <td colSpan={3} style={{ padding: 0 }}>
              <textarea name="descFix" className="form-control" defaultValue={formValues.descFix} />
            </td>
          </tr>
          <tr>
            <th>{t("management.repair.ynFix")}</th>
            <td colSpan={3}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <label>
                  <input type="radio" name="ynFix" value="Y" defaultChecked={formValues.ynFix === "Y"} />{" "}
                  {t("management.repair.complete")}
                </label>
                <label>
                  <input type="radio" name="ynFix" value="N" defaultChecked={formValues.ynFix !== "Y"} />{" "}
                  {t("management.repair.incomplete")}
                </label>
              </div>
            </td>
          </tr>
        </tbody>
      </DetailTable>
    </StyledForm>
  );
});

export default SewingManagementRepair;
