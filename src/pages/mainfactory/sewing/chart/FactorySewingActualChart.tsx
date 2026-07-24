import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import {AppDispatch, RootState} from "@redux/store";
import {Payload} from "@constants/common/common";
import {formatDateToYYYYMMDD} from "@utils/CommonUtil";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import useInputRefs from "@utils/useInputRefs";

import SearchFactorySewingActualChart from "./SearchFactorySewingActualChart";

import {
  FactorySewingActualChartRes,
  getFactorySewingActualChartList,
} from "@redux/mainfactory/dashboard/FactoryDashBoardSlice";

import LineComboChart from "@components/chart/LineComboChart";

export type ChartMode = "LINE" | "PROD" | "AMOUNT" | "SEWER";
export type SeriesDef = { key: string; label?: string };

const FactorySewingActualChart = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const {refs, getValues} = useInputRefs(["dtsWk"]);

  const [factoryDashBoardList, setFactoryDashBoardList] = useState<FactorySewingActualChartRes[]>([]);
  const [mode, setMode] = useState<ChartMode>("PROD");

  /** 조회 */
  const handleSearch = useCallback(() => {
    const {dtsWk} = getValues();

    const params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: formatDateToYYYYMMDD(new Date(dtsWk)),
      bep: 60,
    };

    dispatch(getFactorySewingActualChartList(params)).then((res) => {
      const payload = res.payload as Payload;
      setFactoryDashBoardList(payload?.data ?? []);
    });
  }, [
    dispatch,
    getValues,
    userEnvInfo.cdCompany,
    userEnvInfo.cdBizarea,
    userEnvInfo.cdFty,
  ]);

  const chartConfig = useMemo(() => {
    if (mode === "LINE") {
      return {
        title: "LINE",
        barSeries: [
          {key: "totLn", label: "TOTAL LINE"},
          {key: "sewLn", label: "SEWING LINE"},
        ] as SeriesDef[],
        lineSeries: {key: "utilRate", label: "(%)"} as SeriesDef,
        yLeftUnit: "(EA)",
        yRightUnit: "",
      };
    }

    if (mode === "PROD") {
      return {
        title: "PROD",
        barSeries: [
          {key: "tgtProd", label: "TARGET"},
          {key: "actProd", label: "ACTUAL"},
        ] as SeriesDef[],
        lineSeries: {key: "rtEff", label: "EFFICIENCY(%)"} as SeriesDef,
        yLeftUnit: "(PCS)",
        yRightUnit: "",
      };
    }

    if (mode === "SEWER") {
      return {
        title: "SEWER",
        barSeries: [] as SeriesDef[],
        lineSeries: {key: "mpw4", label: "SEWER"} as SeriesDef,
        yLeftUnit: "(PEOPLE)",
        yRightUnit: "",
      };
    }

    return {
      title: "AMOUNT",
      barSeries: [] as SeriesDef[],
      lineSeries: {key: "earnAmt", label: "EARN AMT"} as SeriesDef,
      yLeftUnit: "($)",
      yRightUnit: "",
    };
  }, [mode]);

  /** 공통 컴포넌트 건드리지 않고, 부모에서 utilRate 생성 */
  const chartRows = useMemo(() => {
    if (!factoryDashBoardList || factoryDashBoardList.length === 0) return [];

    return factoryDashBoardList.map((r) => {
      const tot = Number((r as any).totLn) || 0;
      const sew = Number((r as any).sewLn) || 0;

      return {
        ...r,
        utilRate: tot > 0 ? Math.round((sew / tot) * 1000) / 10 : 0,
      };
    });
  }, [factoryDashBoardList]);

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <EisPageTitleBar
        pageNm="FACTORY"
        pageUrl="/factory/sewing/actual/chart"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {
            label: "SEWING ACTUAL CHART",
            path: "/factory/sewing/actual/chart",
            active: true,
          },
        ]}
      />

      <SearchFactorySewingActualChart
        refs={refs}
        onSearchButtonClick={handleSearch}
        mode={mode}
        onModeChange={(m) => setMode(m)}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col
              xs={12}
              className="d-flex flex-column"
              style={{height: "calc(76vh - 47px)", overflow: "auto"}}
            >
              <LineComboChart
                rows={chartRows as any}
                days={30}
                title={chartConfig.title}
                barSeries={chartConfig.barSeries}
                lineSeries={chartConfig.lineSeries}
                chartHeight={170}
                minChartWidth={800}
                endDate={formatDateToYYYYMMDD(new Date(getValues().dtsWk))}
                yLeftUnit={chartConfig.yLeftUnit}
                yRightUnit={chartConfig.yRightUnit}
                reverseDates={true}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FactorySewingActualChart;
