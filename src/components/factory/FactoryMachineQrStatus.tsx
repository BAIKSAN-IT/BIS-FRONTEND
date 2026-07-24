import React, { memo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { getSewingQrIconClass, QR_STATUS_TABS, QrStatusTabType } from "../../utils/QrStatusTab";

const TopbarButtonGroup = styled.div`
  display: flex;
  gap: 3px; /* 줄임 */

  & button {
    padding: 3px 8px; /* 줄임 */
    font-size: 13px; /* 줄임 */
    font-weight: bold;
    border-radius: 4px;
    min-width: 80px; /* 줄임 */
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 6px 8px; /* 줄임 */
`;

interface Props {
  selectedTab: QrStatusTabType;
  onTabChange: (tab: QrStatusTabType) => void;
}

const FactoryMachineQrStatus = memo(({ onTabChange, selectedTab }: Props) => {
  const { t } = useTranslation();
  return (
    <ButtonWrapper>
      <TopbarButtonGroup>
        {QR_STATUS_TABS.map(({ key, label }) => (
          <Button
            key={key}
            variant={selectedTab === key ? "danger" : "success"}
            onClick={() => onTabChange(key)}
            className="waves-effect waves-light"
          >
            {t(label)}
            <span className="btn-label-right" style={{ marginLeft: "-8px" }}>
              <i className={`mdi ${getSewingQrIconClass(key)}`} />
            </span>
          </Button>
        ))}
      </TopbarButtonGroup>
    </ButtonWrapper>
  );
});

export default FactoryMachineQrStatus;
