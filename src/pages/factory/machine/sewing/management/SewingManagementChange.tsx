import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/store";
import { FactoryLineList, getLineList } from "../../../../../redux/tablet/tabletSlice";
import { FactoryCodeInfoRes, getFactoryCodeInfo, PagingUserListRes } from "../../../../../redux/system/SystemUserSlice";
import { Payload } from "../../../../../constants/common/common";
import { isEmpty } from "../../../../../utils/CommonUtil";
import { SewingQrSystemHistoryListRes, SewingQrSystemRes } from "../../../../../redux/factory/factoryQrSystemSlice";
import { DateUtils } from "../../../../../utils/dateUtils";
import { Button } from "react-bootstrap";
import TabletTopCommonPopup from "../../../../tablet/popup/TabletTopCommonPopup";
import QrReaderPopup from "../../../../../components/factory/QrReadePopup";
import UserPopupComponent from "../../../../../components/modal/UserPopupComponent";

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

const Select = styled.select`
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
`;
interface Props {
  selectedRow?: SewingQrSystemHistoryListRes | null;
  sewingQrSystemInfo?: SewingQrSystemRes | null;
  selectedFactory?: string | null;
  selectedLine?: string | null;
  setSelectedFactory?: (val: string | null) => void;
  setSelectedLine?: (val: string | null) => void;
  selectedTab?: string;
}
const SewingManagementChange = memo(
  ({
    selectedRow,
    sewingQrSystemInfo,
    selectedFactory,
    selectedLine,
    setSelectedFactory,
    setSelectedLine,
    selectedTab,
  }: Props) => {
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [factoryCodeInfo, setFactoryCodeInfo] = useState<FactoryCodeInfoRes[]>([]);
    const [factoryLineList, setFactoryLineList] = useState<FactoryLineList[]>([]);

    const [focusedField, setFocusedField] = useState<"idUser" | "nmUser" | "cdPosition" | null>(null);

    const [isShowUserPopup, setIsShowUserPopup] = useState(false); //유저 팝업
    const [showUserKeypadPopup, setShowUserKeypadPopup] = useState(false); // 키패드 팝업
    const [showPositionKeypadPopup, setShowPositionKeypadPopup] = useState(false); // 키패드 팝업
    const [showUserQrScanner, setShowUserQrScanner] = useState(false); // 스캐너 오픈

    const formatDateToInput = (dateStr: string | null | undefined) => {
      if (!dateStr) return "";

      if (dateStr.length === 8) {
        // yyyymmdd → yyyy-mm-dd
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      }

      if (dateStr.length === 10 && dateStr.includes("-")) {
        // 이미 yyyy-mm-dd 형태라면 그대로 사용
        return dateStr;
      }

      return "";
    };

    const getInitialFormValues = (
      selectedRow?: SewingQrSystemHistoryListRes | null,
      sewingQrSystemInfo?: SewingQrSystemRes | null
    ) => {
      const isNew = selectedRow === null || undefined;
      return {
        astSw: isNew ? "11" : selectedRow?.astSw || "11",
        cdFty: isNew ? "" : sewingQrSystemInfo?.cdFty || "",
        cdLine: isNew ? "" : sewingQrSystemInfo?.cdLine || "",
        astSeq: isNew ? "" : selectedRow?.astSeq || "",
        cdComp: isNew ? "" : sewingQrSystemInfo?.cdComp || "",
        cdTypMachine: isNew ? "" : sewingQrSystemInfo?.cdTypMachine || "",
        cdPosition: isNew ? "" : sewingQrSystemInfo?.cdPosition || "",
        dtsPurchase: isNew ? "" : formatDateToInput(sewingQrSystemInfo?.dtsPurchase) || "",
        dtsRentS: isNew ? "" : formatDateToInput(sewingQrSystemInfo?.dtsRentS) || "",
        dtsRentR: isNew ? "" : formatDateToInput(sewingQrSystemInfo?.dtsRentR) || "",
        dtsRentE: isNew ? "" : formatDateToInput(sewingQrSystemInfo?.dtsRentE) || "",
        amAmtP: isNew ? "" : selectedRow?.amAmtP || "",
        cdCrncyP: isNew ? "" : sewingQrSystemInfo?.cdCrncyP || "",
        dtsJob: DateUtils.today,
        prYymm: isNew ? "" : sewingQrSystemInfo?.prYymm || "",
        dcRmk: isNew ? "" : sewingQrSystemInfo?.dcRmk || "",
        idUser: isNew ? "" : sewingQrSystemInfo?.idUser || "",
        nmUser: isNew ? "" : sewingQrSystemInfo?.nmUser || "",
        cdDept: isNew ? "" : sewingQrSystemInfo?.cdDept || "",
        nmDept: isNew ? "" : sewingQrSystemInfo?.nmDept || "",
      };
    };
    const [formValues, setFormValues] = useState(getInitialFormValues());

    useEffect(() => {
      if (selectedTab === "change") {
        setFormValues(getInitialFormValues(selectedRow, sewingQrSystemInfo));
      }
    }, [selectedRow, sewingQrSystemInfo, selectedTab]);
    const handleKeypadSearchUser = (val: string) => {
      if (focusedField) {
        setFormValues((prev) => ({
          ...prev,
          [focusedField]: val,
        }));
      }

      setShowUserKeypadPopup(false);
      setFocusedField(null);
    };
    const handleKeypadSearchPosition = (val: string) => {
      if (focusedField) {
        setFormValues((prev) => ({
          ...prev,
          [focusedField]: val,
        }));
      }

      setShowPositionKeypadPopup(false);
      setFocusedField(null);
    };

    // 유저 팝업에서 더블 클릭 시
    const handleUserSelect = (popupUser: PagingUserListRes) => {
      setFormValues((prev) => ({
        ...prev,
        idUser: popupUser.userId || "",
        nmUser: popupUser.userNm || "",
        cdDept: popupUser.cdDept || "",
        nmDept: popupUser.nmDept || "",
      }));
    };

    useEffect(() => {
      dispatch(
        getFactoryCodeInfo({
          cdField: "CZ_CA00061",
          cdCompany: user?.companyId || "",
          cdSysdef: "",
          cdPlag1: user?.cdBizarea || "",
        })
      ).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setFactoryCodeInfo(payload.data);
        }
      });
    }, []);

    useEffect(() => {
      if (selectedFactory) {
        dispatch(
          getLineList({
            cdCompany: user?.companyId || "",
            cdBizarea: user?.cdBizarea || "",
            nmBizarea: "",
            cdFty: selectedFactory,
            nmFty: "",
            dtsWk: "",
            processGbn: "0005",
            cdPart: "",
            cdFtyAll: "",
          })
        ).then((res) => {
          const payload = res.payload as Payload;
          if (payload.status === 200 && !isEmpty(payload.data)) {
            setFactoryLineList(payload.data);
          }
        });
      }
    }, [selectedFactory]);

    return (
      <>
        <StyledForm id="changeForm">
          <input name="astSeq" className="form-control" type="hidden" defaultValue={formValues.astSeq} readOnly />
          <DetailTable>
            <tbody>
              <tr>
                <th>{t("management.change.astSw")}</th>
                <td colSpan={5}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <label>
                      <input type="radio" name="astSw" value="00" defaultChecked={formValues.astSw === "00"} />
                      {t("management.change.allotment")}
                    </label>
                    <label>
                      <input type="radio" name="astSw" value="11" defaultChecked={formValues.astSw === "11"} />
                      {t("management.change.Change")}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <th>{t("management.change.cdFty")}</th>
                <td>
                  <Select
                    className={"form-control text-center"}
                    name="cdFty"
                    value={selectedFactory || ""}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setSelectedFactory?.(value);
                    }}
                  >
                    <option value="">{t("management.change.choice")}</option>
                    {factoryCodeInfo.map((item, index) => (
                      <option key={index} value={item.cdSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </Select>
                </td>
                <th>{t("management.change.cdLine")}</th>
                <td>
                  <Select
                    className={"form-control text-center"}
                    name="cdLine"
                    value={selectedLine || ""}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setSelectedLine?.(value);
                    }}
                  >
                    <option value="">{t("management.change.choice")}</option>
                    {factoryLineList.map((item, index) => {
                      return (
                        <option key={index} value={String(item.sewLn)}>
                          {item.sewNm}
                        </option>
                      );
                    })}
                  </Select>
                </td>
                <th>{t("management.change.cdPosition")}</th>
                <td>
                  <input
                    name="cdPosition"
                    className="form-control text-end"
                    type="text"
                    autoComplete="off"
                    onClick={() => {
                      setFocusedField("cdPosition");
                      window.ui.modal.open("headerKeyPad");
                      setShowUserKeypadPopup(true);
                    }}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cdPosition: e.target.value,
                      }))
                    }
                    value={formValues.cdPosition}
                  />
                </td>
              </tr>
              <tr>
                <th>{t("management.change.cdTypMachine")}</th>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ marginBottom: 0, width: "10%" }}>
                      <input
                        type="checkbox"
                        checked={formValues.cdTypMachine === "20"}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            cdTypMachine: e.target.checked ? "20" : "10",
                          }))
                        }
                      />
                      {t("management.change.rental")}
                    </label>

                    <input type="hidden" name="cdTypMachine" value={formValues.cdTypMachine} />

                    <input
                      name="cdComp"
                      className="form-control"
                      type="text"
                      defaultValue={formValues.cdComp}
                      placeholder={t("management.change.cdComp")}
                      style={{ width: "90%" }}
                    />
                  </div>
                </td>
                <th>{t("management.change.dtsRent")}</th>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      name="dtsRentS"
                      className="form-control"
                      type="date"
                      value={formValues.dtsRentS}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          dtsRentS: e.target.value,
                        }))
                      }
                      disabled={formValues.cdTypMachine !== "20"}
                    />

                    <input
                      name="dtsRentE"
                      className="form-control"
                      type="date"
                      value={formValues.dtsRentE}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          dtsRentE: e.target.value,
                        }))
                      }
                      disabled={formValues.cdTypMachine !== "20"}
                    />
                  </div>
                </td>
                <th>{t("management.change.dtsPurchase")}</th>
                <td>
                  <input
                    name="dtsPurchase"
                    className="form-control"
                    type="date"
                    defaultValue={formValues.dtsPurchase}
                  />
                </td>
              </tr>
              <tr>
                <th>{t("management.change.dtsRentR")}</th>
                <td>
                  <input
                    name="dtsRentR"
                    className="form-control"
                    type="date"
                    value={formValues.dtsRentR}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        dtsRentR: e.target.value,
                      }))
                    }
                  />
                </td>
                <th>{t("management.change.amAmtP")}</th>
                <td>
                  <input
                    name="amAmtP"
                    className="form-control text-end"
                    type="text"
                    defaultValue={formValues.amAmtP.toLocaleString()}
                  />
                </td>
                <th>{t("management.change.cdCrncyP")}</th>
                <td>
                  <select
                    name="cdCrncyP"
                    className="form-control text-center"
                    value={formValues.cdCrncyP}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cdCrncyP: e.target.value,
                      }))
                    }
                  >
                    <option value="">선택</option>
                    <option value="KRW">KRW</option>
                    <option value="USD">USD</option>
                    <option value="VND">VND</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th>{t("management.change.user")}</th>
                <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      name="idUser"
                      className="form-control"
                      style={{ width: "150px" }}
                      type="text"
                      value={formValues.idUser}
                      placeholder={"ID"}
                      onClick={() => {
                        setFocusedField("idUser");
                        window.ui.modal.open("headerKeyPad");
                        setShowUserKeypadPopup(true);
                      }}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          idUser: e.target.value,
                        }))
                      }
                    />

                    <Button
                      type="button"
                      className="btn waves-light btn-blue"
                      onClick={() => {
                        setShowUserKeypadPopup(false);
                        setIsShowUserPopup(true);
                      }}
                    >
                      <i className="fa fa-search me-0"></i>
                    </Button>
                    <input
                      name="nmUser"
                      className="form-control"
                      type="text"
                      value={formValues.nmUser}
                      placeholder={"NAME"}
                      onClick={() => {
                        setFocusedField("nmUser");
                        window.ui.modal.open("headerKeyPad");
                        setShowUserKeypadPopup(true);
                      }}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          nmUser: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      className="btn waves-light btn-blue"
                      onClick={() => {
                        setShowUserKeypadPopup(false);
                        setShowUserQrScanner(true);
                      }}
                    >
                      <i className="fa fa-camera me-0"></i>
                    </Button>
                  </div>
                </td>
                <th>{t("management.change.nmDept")}</th>
                <td>
                  <input name="nmDept" className="form-control" type="text" defaultValue={formValues.nmDept} />
                </td>
                <th>{t("management.change.dtsJob")}</th>
                <td>
                  <input
                    name="dtsJob"
                    className="form-control"
                    type="date"
                    value={formValues.dtsJob}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        dtsJob: e.target.value,
                      }))
                    }
                  />
                </td>
              </tr>
              <tr>
                <th>{t("management.change.dcRmk")}</th>
                <td colSpan={5}>
                  <textarea name="dcRmk" defaultValue={formValues.dcRmk} />
                </td>
              </tr>
            </tbody>
          </DetailTable>
        </StyledForm>
        {/* 사용자 INPUT 클릭 시 나오는 팝업 */}
        {showUserKeypadPopup && <TabletTopCommonPopup setSearchValue={handleKeypadSearchUser} />}
        {/* Position INPUT 클릭 시 나오는 팝업 */}
        {showPositionKeypadPopup && <TabletTopCommonPopup setSearchValue={handleKeypadSearchPosition} />}

        {/* 사용자 명 옆에 카메라 버튼 클릭 시 나오는 스캔 */}
        {showUserQrScanner && (
          <QrReaderPopup
            onScan={(value) => {
              /*const next = { ...searchParams, cdQr: value };
              setUserSearchParams(next);*/
              setShowUserQrScanner(false);
            }}
            onClose={() => setShowUserQrScanner(false)}
          />
        )}
        <UserPopupComponent
          cdDept={""}
          nmDept={""}
          isShowUserPopup={isShowUserPopup}
          setIsShowUserPopup={setIsShowUserPopup}
          onClose={() => setIsShowUserPopup(false)}
          onUserSelect={handleUserSelect}
        />
      </>
    );
  }
);

export default SewingManagementChange;
