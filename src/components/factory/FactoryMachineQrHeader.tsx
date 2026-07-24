import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FactoryCodeInfoRes, getFactoryCodeInfo } from "../../redux/system/SystemUserSlice";
import { Payload } from "../../constants/common/common";
import { isEmpty } from "../../utils/CommonUtil";
import { FactoryLineList, getLineList } from "../../redux/tablet/tabletSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";

const TopbarWrapper = styled.div`
  width: 100%;
  background-color: #38414a;
  padding: 4px 10px;
`;

const TopbarButtonGroup = styled.div`
  display: flex;
  gap: 3px;
  justify-content: end;

  & button {
    padding: 3px 8px;
    font-size: 13px;
    font-weight: bold;
    border-radius: 4px;
    min-width: 80px;
  }
`;

const CodeSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: #e9ecef;
  margin-bottom: 5px;
`;

const CodeBox = styled.div`
  display: flex;
  align-items: center;
  width: 90%;
`;

const Title = styled.h2<{ bgColor?: string; color?: string }>`
  background-color: ${({ bgColor }) => bgColor || "white"};
  color: ${({ color }) => color || "black"};
  padding: 5px;
  border-radius: 5px;
  font-weight: bold;
  width: 70%;
  text-align: center;
  gap: 15px;
`;

const Code = styled.div<{ color?: string }>`
  color: ${({ color }) => color || "black"};
  padding: 5px;
  border-radius: 5px;
  font-weight: bold;
  width: 100%;
  text-align: center;
`;

const Select = styled.select`
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
`;

interface Props {
  isFixTab: boolean;
  setIsFixTab: (value: boolean) => void;
  onKeypadOpen: () => void;
  onQrScanOpen: () => void;
  onSearchButtonClick: () => void;
  onResetButtonClick: () => void;
  onDeleteButtonClick: () => void;
  onSaveButtonClick: () => void;
  setSelectedFactory?: (value: string | null | undefined) => void;
  setSelectedLine?: (value: string | null | undefined) => void;
  selectedFactory?: string | null;
  selectedLine?: string | null;
}

const FactoryMachineQrHeader = memo(
  ({
    isFixTab,
    setIsFixTab,
    onKeypadOpen,
    onQrScanOpen,
    onSearchButtonClick,
    onResetButtonClick,
    onDeleteButtonClick,
    onSaveButtonClick,
    setSelectedFactory,
    setSelectedLine,
    selectedFactory,
    selectedLine,
  }: Props) => {
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [factoryCodeInfo, setFactoryCodeInfo] = useState<FactoryCodeInfoRes[]>([]);
    const [factoryLineList, setFactoryLineList] = useState<FactoryLineList[]>([]);

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

    const handleFactoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedFactory?.(value);
    };

    const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedLine?.(value);
    };
    return (
      <>
        <TopbarWrapper>
          <TopbarButtonGroup>
            <Button
              variant="success"
              onClick={onSearchButtonClick}
              className="waves-effect waves-light btn btn-success"
            >
              {t("common.search.btn")}
              <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
                <i className="mdi mdi-alert-circle-outline"></i>
              </span>
            </Button>

            <Button variant="danger" onClick={onDeleteButtonClick} className="waves-effect waves-light btn btn-danger">
              {t("common.delete.btn")}
              <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
                <i className="mdi mdi-close-circle-outline"></i>
              </span>
            </Button>

            <Button variant="success" onClick={onResetButtonClick} className="waves-effect waves-light btn btn-success">
              {t("common.reset.btn")}
              <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
                <i className="mdi mdi-broom"></i>
              </span>
            </Button>

            <Button variant="success" onClick={onSaveButtonClick} className="waves-effect waves-light btn btn-success">
              {t("common.save.btn")}
              <span className="btn-label-right" style={{ marginLeft: "-10px" }}>
                <i className="mdi mdi-check-all"></i>
              </span>
            </Button>
          </TopbarButtonGroup>
        </TopbarWrapper>

        <CodeSection>
          <CodeBox>
            <Title bgColor="#d4edda" color="#155724">
              QR CODE
            </Title>
            <Code color="#155724">
              <div className="input-group">
                <input type="text" className="form-control" readOnly onClick={onQrScanOpen} />
                <Button type="button" className="btn waves-light btn-blue" onClick={onKeypadOpen}>
                  <i className="fa fa-search me-1"></i>
                </Button>
              </div>
            </Code>
            <Title bgColor="#d4edda" color="#155724">
              FACTORY
            </Title>
            <Code color="#155724">
              <Select
                className={"form-control text-center"}
                name="cdFty"
                value={selectedFactory ?? ""}
                onChange={handleFactoryChange}
              >
                <option value="">{t("management.change.choice")}</option>
                {factoryCodeInfo.map((item, index) => (
                  <option key={index} value={item.cdSysdef}>
                    {item.nmSysdef}
                  </option>
                ))}
              </Select>
            </Code>
            <Title bgColor="#d4edda" color="#155724">
              LINE
            </Title>
            <Code color="#155724">
              <Select
                className={"form-control text-center"}
                name="cdLine"
                value={selectedLine ?? ""}
                onChange={handleLineChange}
              >
                <option value="">{t("management.change.choice")}</option>
                {factoryLineList.map((item, index) => (
                  <option key={index} value={item.sewLn}>
                    {item.sewNm}
                  </option>
                ))}
              </Select>
            </Code>
            {/* Fix 라벨 먼저, 체크박스는 오른쪽에 */}
            <label style={{ display: "flex", alignItems: "center", fontSize: "26px", gap: "4px" }}>
              Fix
              <input
                type="checkbox"
                checked={isFixTab}
                onChange={(e) => setIsFixTab(e.target.checked)}
                style={{ width: "26px", height: "26px" }}
              />
            </label>
          </CodeBox>
        </CodeSection>
      </>
    );
  }
);

export default FactoryMachineQrHeader;
