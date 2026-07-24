import React, {memo} from "react";

/* redux */
import SewingActualSummaryBox from "./SewingActualSummaryBox";
import {SewingHpsPopUpMaxRes, SewingHpsPopUpRes} from "@redux/factory/factorySewingSlice";
import {Card} from "react-bootstrap";

interface Props {
  hpsHeadData: SewingHpsPopUpRes[] | []
  sewingHpsPopUpMax: SewingHpsPopUpMaxRes | null
}

const SewingActualSummaryTab = memo(({hpsHeadData, sewingHpsPopUpMax}: Props) => {
  return (
    <>
      <div className={'mt-n2'} style={{display: "flex"}}>
        <SewingActualSummaryBox label="BEP/1H ($)" value={sewingHpsPopUpMax?.bep.toLocaleString() || 0}/>
        <SewingActualSummaryBox label="LINE'S" value={(hpsHeadData[0]?.sewLn ?? 0).toLocaleString()} />
        <SewingActualSummaryBox label="Actual<br/>Sewer" value={(hpsHeadData[0]?.mpw4 ?? 0).toLocaleString()} />
        <SewingActualSummaryBox label="Production<br/>Target" value={(hpsHeadData[0]?.tgtProd ?? 0).toLocaleString()} />
        <SewingActualSummaryBox label="Production<br/>Actual" value={(hpsHeadData[0]?.actProd ?? 0).toLocaleString()} />
        <SewingActualSummaryBox label="Actual<br/>Efficiency" value={(hpsHeadData[0]?.rtEff ?? 0) + '%'} />
        <SewingActualSummaryBox label="Earning<br/>Amount" value={'$' + (hpsHeadData[0]?.earnAmt ?? 0).toLocaleString()} />
      </div>
    </>
  );
});

export default SewingActualSummaryTab;
