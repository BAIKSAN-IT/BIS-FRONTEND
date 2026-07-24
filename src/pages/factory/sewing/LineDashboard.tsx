import React, { forwardRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  SEWING_ACTUAL_DEFECT_TYPE,
  SEWING_ACTUAL_TYPE,
} from "../../../constants/factory/sewing/sewingActual";
import { isEmpty } from "../../../utils/CommonUtil";

interface LineDashboardProps {
  actual: SEWING_ACTUAL_TYPE[];
  defect: SEWING_ACTUAL_DEFECT_TYPE[];
}

const TopLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4682b4;
  padding: 10px;
  font-size: 20px;
  color: white;
  font-weight: bold;
  height: 30px;
`;

const TitleLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5e9c4;
  height: 40px;
  font-size: 16px;
  padding: 3px;
  font-weight: bold;
  color: black;
  letter-spacing: -1px;

  .po-do {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    // word-break: break-all;
    // margin-right: 5px;
  }
`;

const ContentLayer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;

  .leftArea {
    width: 50%;
    display: flex;
    justify-content: space-between;
    background-color: #f5a593;
    font-weight: bold;
    color: black;
    padding: 0 10px;
  }
  .rightArea {
    width: 50%;
    display: flex;
    justify-content: space-between;
    background-color: #6495ed;
    font-weight: bold;
    color: black;
    padding: 0 10px;
  }
`;

const DetailLayer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 20px;

  .leftArea {
    width: 50%;
    background-color: #d3e7f0;
    font-weight: bold;
    color: black;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .rightArea {
    width: 50%;
    background-color: #f3f3ac;
    font-weight: bold;
    color: black;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .defect {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;

      .defect-list {
        color: #ff0000;
        font-size: 15px;
        height: 75px;
        overflow: hidden;

        .defect-detail {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
`;

const OutputDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 35px;
  letter-spacing: -2px;

  .output {
    font-size: 25px;
  }
`;

const OutputInnerDetail = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  font-weight: bold;
  width: 100%;

  .output-num {
    font-size: 40px;
  }

  .details {
    display: flex;
    flex-direction: column;
    margin-left: auto;
    font-size: 20px;
    align-items: center;
    font-weight: bold;

    .top {
      color: #ff0000;
    }
    .bottom {
      color: #ff0000;
    }
  }
`;

const LineDashboard = forwardRef<HTMLDivElement, LineDashboardProps>(
  ({ actual, defect }, ref) => {
    useEffect(() => {
      if (actual.length > 0) {
        const sewDt = actual[0];
        setSewer(sewDt.mpw4 ?? "0");
        setHelper(sewDt.helper ?? "0");
        setLine(sewDt.sewLn);

        const noPoArray = actual.map((item) => item.noPo ?? "");
        const nmDoArray = actual.map((item) => item.nmDo ?? "");

        setNoPo(noPoArray);
        setNmDo(nmDoArray);

        if (actual.length === 1) {
          setTarget(setNumberType(sewDt.tgtProd, "1"));
          setTmWk(setNumberType(sewDt.tmWk, "2"));
          setOutput(setNumberType(sewDt.actProd, "2"));
          setWhour(sewDt.whour ?? "0");
          setProduction(
            setNumberType(Number(sewDt.actProd) - Number(sewDt.tgtProd), "2")
          );
        } else if (actual.length > 1) {
          setTarget(setNumberType(TtlValue(actual, "tgtProd").toString(), "1"));
          setTmWk(setNumberType(sewDt.tmWk, "2"));
          setOutput(setNumberType(TtlValue(actual, "actProd").toString(), "2"));
          setWhour(setNumberType(TtlValue(actual, "whour").toString(), "2"));
          setProduction(
            setNumberType(
              TtlValue(actual, "actProd") - TtlValue(actual, "tgtProd"),
              "2"
            )
          );
        }
      }
    }, [actual]);

    const [sewer, setSewer] = useState<string>("0");
    const [helper, setHelper] = useState<string>("0");
    const [line, setLine] = useState<string>("");
    const [noPo, setNoPo] = useState<string[]>([]);
    const [nmDo, setNmDo] = useState<string[]>([]);
    const [target, setTarget] = useState<string>("0");
    const [tmWk, setTmWk] = useState<string>("0");
    const [output, setOutput] = useState<string>("0");
    const [whour, setWhour] = useState<string>("0");
    const [production, setProduction] = useState<string>("0");

    const setNumberType = (val: any, type: string) => {
      if (type === "1") {
        return Number(val).toLocaleString("ko-KR");
      } else if (type === "2") {
        return Number(val).toLocaleString("ko-KR", {
          maximumFractionDigits: 2,
        });
      } else {
        return Number(val).toLocaleString("ko-KR");
      }
    };

    const TtlValue = (
      data: SEWING_ACTUAL_TYPE[],
      name: keyof SEWING_ACTUAL_TYPE
    ): number => {
      return data.reduce((sum, item) => sum + Number(item[name] ?? 0), 0);
    };

    const getTtlDefect = (data: SEWING_ACTUAL_DEFECT_TYPE[]) => {
      const ttlDefect = data[0]?.ttlDefect;
      const ttlRate = data[0]?.ttlRate;

      if (!isEmpty(ttlDefect) && !isEmpty(ttlRate)) {
        return `${setNumberType(defect[0]?.ttlDefect, "1")} / ${setNumberType(
          defect[0]?.ttlRate,
          "2"
        )}%`;
      }
      return "0 / 0%";
    };

    return (
      <>
        <TopLayer>
          <div>{`SEWER : ${sewer} HELPER : ${helper}`}</div>
          <div>{`LINE ${line}`}</div>
        </TopLayer>

        <TitleLayer>
          {noPo?.map((item, idx) => {
            return (
              <div className="po-do" key={idx}>{`PO(DO) : ${item} ${
                !isEmpty(nmDo[idx]) ? "(" + nmDo[idx] + ")" : ""
              }`}</div>
            );
          })}
        </TitleLayer>

        <ContentLayer>
          <div className="leftArea">
            <span>TARGET</span>
            <span>{`${target}/${tmWk}h`}</span>
          </div>
          <div className="rightArea">
            <span>INSPECTION</span>
            <span>{`${defect[0]?.qtInsp ?? "0"}`}</span>
          </div>
        </ContentLayer>

        <DetailLayer>
          <div className="leftArea">
            <div className="output">OUTPUT</div>
            <OutputDetail>
              <OutputInnerDetail>
                <span className="output-num">{output}</span>
                <div className="details">
                  <div className="top">{whour}h</div>
                  <div className="bottom">{production}</div>
                </div>
              </OutputInnerDetail>
            </OutputDetail>
          </div>

          <div className="rightArea">
            <div className="defect">
              <div>DEFECT</div>
              <div>{getTtlDefect(defect)}</div>
            </div>

            <div className="defect">
              <div>TOP3 DEFECT</div>
            </div>

            <div className="defect">
              <div className="defect-list">
                {defect.map((item, idx) => {
                  return (
                    <div className="defect-detail">{`${item.ranks}. ${item.nmDefect}`}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </DetailLayer>
      </>
    );
  }
);

export default LineDashboard;
