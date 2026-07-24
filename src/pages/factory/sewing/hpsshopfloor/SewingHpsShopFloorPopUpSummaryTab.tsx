import React, {memo} from "react";

/* redux */
import SummaryBox from "@components/SummaryBox";
import {SewingHpsPopUpMaxRes, SewingHpsPopUpRes} from "@redux/factory/factorySewingSlice";

interface Props {
  hpsHeadData: SewingHpsPopUpRes[] | []
  sewingHpsPopUpMax: SewingHpsPopUpMaxRes | null
}

const SewingHpsShopFloorPopUpSummaryTab = memo(({hpsHeadData, sewingHpsPopUpMax}: Props) => {
  return (
    <>
      <div style={{display: "flex", marginBottom: "10px"}}>
        <SummaryBox label="LINE'S" value={(hpsHeadData[0]?.sewLn ?? 0).toLocaleString()} />
        <SummaryBox label="Actual<br/>Sewer" value={(hpsHeadData[0]?.mpw4 ?? 0).toLocaleString()} />
        <SummaryBox label="Production<br/>Target" value={(hpsHeadData[0]?.tgtProd ?? 0).toLocaleString()} />
        <SummaryBox label="Production<br/>Actual" value={(hpsHeadData[0]?.actProd ?? 0).toLocaleString()} />
        <SummaryBox label="Actual<br/>Efficiency" value={(hpsHeadData[0]?.rtEff ?? 0) + '%'} />
        <SummaryBox label="Earning<br/>Amount" value={'$' + (hpsHeadData[0]?.earnAmt ?? 0).toLocaleString()} />

      </div>
    </>
  );
});

export default SewingHpsShopFloorPopUpSummaryTab;
