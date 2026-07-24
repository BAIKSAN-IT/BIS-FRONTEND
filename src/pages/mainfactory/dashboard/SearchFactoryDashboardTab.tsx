import React, {memo} from "react";
import SearchFactoryDashboardBox from "./SearchFactoryDashboardBox";
import {FactoryDashboardTab} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";

interface Props {
  selectedTab: FactoryDashboardTab;
  onTabChange: (tab: FactoryDashboardTab) => void;
}

const SearchFactoryDashboardTab = memo(({selectedTab, onTabChange}: Props) => {
  const tabs: {label: string; value: FactoryDashboardTab}[] = [
    {label: "PERSON", value: "PERSON"},
    {label: "SEWING", value: "SEWING"},
    {label: "KNITTING", value: "KNITTING"},
    {label: "DYEING", value: "DYEING"},
  ];

  return (
    <div className="mt-n2" style={{display: "flex", flexWrap: "wrap"}}>
      {tabs.map((tab) => (
        <SearchFactoryDashboardBox
          key={tab.value}
          label={tab.label}
          active={selectedTab === tab.value}
          onClick={() => onTabChange(tab.value)}
        />
      ))}
    </div>
  );
});

export default SearchFactoryDashboardTab;
