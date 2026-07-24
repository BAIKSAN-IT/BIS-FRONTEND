import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { SewingQrSystemHistoryListRes } from "../../../../../redux/factory/factoryQrSystemSlice";
import { DateUtils } from "../../../../../utils/dateUtils";

interface Props {
  selectedRow?: SewingQrSystemHistoryListRes | null;
}

const StyledForm = styled.form`
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

const SewingManagementBroken = memo(({ selectedRow }: Props) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    astSw: selectedRow?.astSw || "22",
    dtsJob: DateUtils.today || "",
    dtsReturn: selectedRow?.dtsReturn || "",
    locReturn: selectedRow?.locReturn || "",
    descBroken: selectedRow?.remark || "",
    cdReturn: selectedRow?.cdReturn || "",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormValues({
        astSw: selectedRow?.astSw || "22",
        dtsJob: DateUtils.today || "",
        dtsReturn: selectedRow?.dtsReturn || "",
        locReturn: selectedRow?.locReturn || "",
        descBroken: selectedRow?.remark || "",
        cdReturn: selectedRow?.cdReturn || "",
      });
    }
  }, [selectedRow]);

  return (
    <StyledForm id="brokenForm">
      <DetailTable>
        <tbody>
          <tr>
            <th>{t("management.broken.astSw")}</th>
            <td colSpan={3}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <label>
                  <input type="radio" name="astSw" value="22" defaultChecked={formValues.astSw === "22"} />{" "}
                  {t("management.broken.broken")}
                </label>
                <label>
                  <input type="radio" name="astSw" value="33" defaultChecked={formValues.astSw === "33"} />{" "}
                  {t("management.broken.disrepair")}
                </label>
              </div>
            </td>
          </tr>
          <tr>
            <th>{t("management.broken.dtsJob")}</th>
            <td>
              <input name="dtsJob" className="form-control" type="date" defaultValue={formValues.dtsJob} />
            </td>
            <th>{t("management.broken.dtsReturn")}</th>
            <td>
              <input name="dtsReturn" className="form-control" type="date" defaultValue={formValues.dtsReturn} />
            </td>
          </tr>
          <tr>
            <th>{t("management.broken.locReturn")}</th>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ marginBottom: 0, width: "10%" }}>
                  <input
                    type="checkbox"
                    name="cdReturn"
                    value="Y"
                    checked={formValues.cdReturn === "Y"}
                    onChange={(e: any) => {
                      setFormValues((prev) => ({
                        ...prev,
                        cdReturn: e.target.checked ? "Y" : "N",
                      }));
                    }}
                    style={{ marginRight: "6px" }}
                  />
                  {t("management.broken.cdReturn")}
                </label>

                <input type="hidden" name="cdReturn" value={formValues.cdReturn} />

                <input
                  name="locReturn"
                  className="form-control"
                  type="text"
                  defaultValue={formValues.locReturn}
                  style={{ width: "90%" }}
                />
              </div>
            </td>
            <th>{t("management.broken.descBroken")}</th>
            <td>
              <input name="descBroken" className="form-control" type="text" defaultValue={formValues.descBroken} />
            </td>
          </tr>
        </tbody>
      </DetailTable>
    </StyledForm>
  );
});

export default SewingManagementBroken;
