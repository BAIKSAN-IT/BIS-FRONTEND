import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Col, Row} from "react-bootstrap";

import EisPageTitleBar from "@components/common/EisPageTitleBar";
import PisEisTable from "@components/table/PisEisTable";

import {AppDispatch, RootState} from "@redux/store";
import {
  getSixMonthBasePeriodInfo,
  getSixMonthOrderStatusList,
  SixMonthBasePeriodRes,
  SixMonthOrderListRes,
} from "@redux/eis/monthstatus/MonthStatusSlice";

import {formatDateToYYYYMMDD} from "@utils/CommonUtil";
import {Payload} from "@constants/common/common";

import SearchSixMonthStatus, {SixMonthOrderStatusSearchHandle,} from "./SearchSixMonthStatus";
import SixMonthStatusTableColumns from "./SixMonthStatusTableColumns";

const SixMonthStatus = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);

  const today = formatDateToYYYYMMDD(new Date());
  const currentYear = today.substring(0, 4);

  const [basePeriod, setBasePeriod] = useState<SixMonthBasePeriodRes | null>(null);
  const [orderList, setOrderList] = useState<SixMonthOrderListRes[] | []>([]);

  const [viewMode, setViewMode] = useState<"BOTH" | "PCS" | "AMOUNT">("BOTH"); //radio버튼 관리

  const searchRef = useRef<SixMonthOrderStatusSearchHandle>(null);
  const [selectedBaseDate, setSelectedBaseDate] = useState(today);

  const fetchBasePeriod = useCallback(
    async (req: { periodYear: string; dtBegin: string }) => {
      const res = await dispatch(getSixMonthBasePeriodInfo(req));
      const payload = res.payload as Payload;
      const base = payload?.data as SixMonthBasePeriodRes;
      if (!base) return;
      setBasePeriod(base);
      fetchOrderList({
        cdCompany: user?.companyId ?? "1000",
        cdBizarea: user?.cdBizarea ?? "1000",
        bSDate: base.dtBegin.replace(/-/g, ""),
        bEDate: base.dtEnd.replace(/-/g, ""),
        fgLang: "L0",
      });
    },
    [dispatch]
  );

  const fetchOrderList = useCallback(
    async (params: any) => {
      const res = await dispatch(getSixMonthOrderStatusList(params));
      const payload = res.payload as Payload;
      setOrderList(payload?.data ?? null);
    },
    [dispatch]
  );

  useEffect(() => {
    fetchBasePeriod({periodYear: currentYear, dtBegin: today});
  }, []);

  const handleSearch = () => {
    const vals = searchRef.current?.getValues();
    if (!vals) return;
    setSelectedBaseDate(vals.dtBegin);
    fetchBasePeriod(vals);
  };

  const columns = useMemo(
    () => SixMonthStatusTableColumns(selectedBaseDate, viewMode),
    [selectedBaseDate, viewMode]
  );
  return (
    <>
      <EisPageTitleBar
        pageNm="EIS"
        pageUrl="/monthstatus"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[{label: "SixMonthOrderStatus", path: "/monthstatus", active: true}]}
      />

      <SearchSixMonthStatus
        ref={searchRef}
        periodYear={basePeriod?.periodYear || ''}
        periodWeek={basePeriod?.periodWeek || ''}
        dtBegin={basePeriod?.dtBegin || ''}
        dtEnd={basePeriod?.dtEnd || ''}
        onChangeBaseDate={handleSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(81vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container">
                  <PisEisTable
                    columns={columns}
                    data={orderList ?? []}
                    updateData={() => {
                    }}
                    theadClass="text-center font-12"
                    tableClass="table-custom-eis-background text-center font-12"
                    isSortable={true}
                    isOnlySelected={true}
                    virtualize={false}
                    highlightInvalidRow={true}
                    barHeightStyle={"calc(-100px + 85vh)"}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default SixMonthStatus;
