import React, {memo} from "react";

/* redux */
import SummaryBox from "@components/SummaryBox";
import {SewingHpsPopUpMaxRes, SewingHpsPopUpRes} from "@redux/factory/factorySewingSlice";

interface Props {
  hpsHeadData: SewingHpsPopUpRes[] | []
  sewingHpsPopUpMax: SewingHpsPopUpMaxRes | null
}

const SewingHpsPopUpSummaryTab = memo(({hpsHeadData, sewingHpsPopUpMax}: Props) => {
  return (
    <>
      <div style={{display: "flex", marginBottom: "10px"}}>
        <SummaryBox label="BEP/1H ($)" value={sewingHpsPopUpMax?.bep.toLocaleString() || 0}/>
        <SummaryBox label="LINE'S" value={(hpsHeadData[0]?.sewLn ?? 0).toLocaleString()} />
        <SummaryBox label="ACTUAL<br/>SEWER" value={(hpsHeadData[0]?.mpw4 ?? 0).toLocaleString()} />
        <SummaryBox label="PPODUCTION<br/>TARGET" value={(hpsHeadData[0]?.tgtProd ?? 0).toLocaleString()} />
        <SummaryBox label="PRODUCTION<br/>ACTUAL" value={(hpsHeadData[0]?.actProd ?? 0).toLocaleString()} />
        <SummaryBox label="ACTUAL<br/>EFFICIENCY" value={(hpsHeadData[0]?.rtEff ?? 0) + '%'} />
        <SummaryBox label="EARNING<br/>AMOUNT" value={'$' + (hpsHeadData[0]?.earnAmt ?? 0).toLocaleString()} />

      </div>
    </>
  );
});

export default SewingHpsPopUpSummaryTab;
