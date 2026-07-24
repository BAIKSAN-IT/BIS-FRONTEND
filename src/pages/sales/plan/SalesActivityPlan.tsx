import React, {useEffect, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import "@fullcalendar/react";
import {DateClickArg, Draggable} from "@fullcalendar/interaction";
import {EventClickArg, EventInput} from "@fullcalendar/core";
import {useDispatch, useSelector} from "react-redux";

/* redux*/
import {AppDispatch, RootState} from "@redux/store";
import {
  deleteSalesActivityPlan,
  getSalesActivityPlanList,
  SalesActivityPlanListRes,
  saveSalesActivityPlan,
} from "@redux/sales/SalesActivitySlice";

/* Utils */
import {isEmpty} from "@utils/CommonUtil";

/* constants */
import {Payload} from "@constants/common/common";

/* component */
import SalesPlanPageTitleBar from "./SalesPlanPageTitleBar";
import SalesActivityPlanAddEditEvent from "./SalesActivityPlanAddEditEvent";
import SalesActivityPlanActualPopup from "./SalesActivityPlanActualPopup";
import SalesActivityPlanCalendar from "./SalesActivityPlanCalendar";

interface FormValues {
  dtPlan: string; // "YYYY-MM-DD"
  startTm: string; // "HH:MM"
  endTm: string; // "HH:MM"
  purpose: string;
  company: string;
  attend: string;
  levShare: string;
  noticeYn: string;
}

const SalesActivityPlan: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => ({user: state.Auth.user}));

  // 팝업 제어
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  // 클릭된 이벤트 데이터와, 신규 클릭 날짜
  const [eventData, setEventData] = useState<EventInput>({} as EventInput);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 필터: "11"=개인, "22"=팀, "33"=부서, "99"=전체
  const [levShareFilter, setLevShareFilter] = useState<string>("11");

  // 서버에서 받아온 플랜 리스트
  const [salesActivityPlanList, setSalesActivityPlanList] = useState<SalesActivityPlanListRes[]>([]);

  // 1. 목록 조회 (levShareFilter 반영)
  const fetchSalesActivityPlanList = () => {
    dispatch(
      getSalesActivityPlanList({
        cdCompany: user?.companyId || "",
        dtPlan: "", // 전체 기간
        levShare: levShareFilter,
        noEmp: user?.userId ?? '',
        cdDept: user?.deptId || '',
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      setSalesActivityPlanList(payload.status === 200 && !isEmpty(payload.data) ? payload.data : []);
    });
  };

  // 2. 첫 렌더링 및 필터 변경 시마다 재조회
  useEffect(() => {
    fetchSalesActivityPlanList();
  }, [levShareFilter]);

  // 3. FullCalendar 이벤트 매핑
  const formatDate = (yyyymmdd: string) => `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;

  const [events, setEvents] = useState<EventInput[]>([]);
  useEffect(() => {
    setEvents(
      salesActivityPlanList.map((plan) => {
        const dateStr = formatDate(plan.dtPlan);
        const startTime = plan.startTm ? `${plan.startTm.slice(0, 2)}:${plan.startTm.slice(2, 4)}` : "00:00";
        const endTime = plan.endTm ? `${plan.endTm.slice(0, 2)}:${plan.endTm.slice(2, 4)}` : "23:59";
        const isPlan = plan.sw === "001";
        const color = isPlan ? "#1abc9c" : "#0056b3";
        return {
          id: `${plan.seqPlan}-${plan.seqDocu}`,
          title: plan?.porpose?.replace(/<br\s*\/?>/gi, "") || "제목없음",
          start: dateStr,
          allDay: true,
          editable: plan.sw === "001",
          startEditable: plan.sw === "001",
          classNames: ["text-start"], // 텍스트 정렬만 남겨두고
          /*className: plan.sw === "001" ? "bg-success text-start" : "bg-primary text-start",*/
          backgroundColor: color, // 드래그 미러에도 적용
          borderColor: color,
          extendedProps: {
            ...plan,
            dtPlan: dateStr,
            startTm: startTime,
            endTm: endTime,
          },
        };
      })
    );
  }, [salesActivityPlanList]);

  // 외부 드래그 소스 초기화
  useEffect(() => {
    const draggableEl = document.getElementById("external-events");
    if (draggableEl) new Draggable(draggableEl, {itemSelector: ".external-event"});
  }, []);

  // 달력 날짜 클릭 -> 신규 팝업
  const onDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setEventData({} as EventInput);
    setShowDetailPopup(false);
    setShowPlanPopup(true);
  };

  // 이벤트 클릭 -> 수정 or 상세 팝업
  const onEventClick = (arg: EventClickArg) => {
    const ext = (arg.event.extendedProps as any) || {};
    setEventData({
      id: String(arg.event.id),
      title: arg.event.title,
      start: arg.event.start || undefined,
      end: arg.event.end || undefined,
      className: arg.event.classNames[0],
      extendedProps: ext,
    });
    if (ext.sw === "002") setShowDetailPopup(true);
    else setShowPlanPopup(true);
  };

  // 신규 저장
  const handleAddEvent = (data: FormValues) => {
    const req = {
      cdCompany: user?.companyId || "",
      dtPlan: data.dtPlan.replace(/-/g, ""),
      seqPlan: "", // 신규
      purpose: data.purpose,
      company: data.company,
      attend: data.attend,
      startTm: data.startTm.replace(":", ""),
      endTm: data.endTm.replace(":", ""),
      levShare: data.levShare,
      noEmp: user?.userId || "",
      cdDept: user?.deptId || "",
      idInsert: user?.userId || "",
      noticeYn: data.noticeYn,
    };
    dispatch(saveSalesActivityPlan(req)).then(() => {
      fetchSalesActivityPlanList();
      setShowPlanPopup(false);
    });
  };

  // 수정 저장
  const handleUpdateEvent = (data: FormValues) => {
    const ext = eventData.extendedProps as any;
    const req = {
      cdCompany: user?.companyId || "",
      dtPlan: data.dtPlan.replace(/-/g, ""),
      seqPlan: ext.seqPlan,
      purpose: data.purpose,
      company: data.company,
      attend: data.attend,
      startTm: data.startTm.replace(":", ""),
      endTm: data.endTm.replace(":", ""),
      levShare: data.levShare,
      noEmp: user?.userId || "",
      cdDept: user?.deptId || "",
      idInsert: user?.userId || "",
      noticeYn: data.noticeYn,
    };
    dispatch(saveSalesActivityPlan(req)).then(() => {
      fetchSalesActivityPlanList();
      setShowPlanPopup(false);
    });
  };

  // 삭제
  const handleRemoveEvent = () => {
    const ext = eventData.extendedProps as any;
    dispatch(
      deleteSalesActivityPlan({
        cdCompany: user?.companyId || "",
        dtPlan: ext.dtPlan.replace(/-/g, ""),
        seqPlan: ext.seqPlan,
        noticeYn: ext.noticeYn,
      })
    ).then(() => {
      fetchSalesActivityPlanList();
      setShowPlanPopup(false);
    });
  };

  // 드래그 앤 드롭으로 일정 이동
  const onEventDrop = (dropInfo: any) => {
    const ext = dropInfo.event.extendedProps as any;
    if (ext.sw === "002") {
      dropInfo.revert();
      return;
    }

    // 1. 기존 데이터 삭제
    const oldDt = ext.dtPlan.replace(/-/g, "");
    dispatch(
      deleteSalesActivityPlan({
        cdCompany: user?.companyId || "",
        dtPlan: oldDt,
        seqPlan: ext.seqPlan,
        noticeYn: ext.noticeYn,
      })
    )
      .then(() => {
        // 2. 새 날짜로 등록
        const newDt = dropInfo.event.startStr.replace(/-/g, "");
        return dispatch(
          saveSalesActivityPlan({
            cdCompany: user?.companyId || "",
            dtPlan: newDt,
            seqPlan: "",
            purpose: ext.purpose,
            company: ext.company,
            attend: ext.attend,
            startTm: ext.startTm.replace(":", ""),
            endTm: ext.endTm.replace(":", ""),
            levShare: ext.levShare,
            noEmp: user?.userId || "",
            cdDept: user?.deptId || "",
            idInsert: user?.userId || "",
            noticeYn: ext.noticeYn,
          })
        );
      })
      .then(() => fetchSalesActivityPlanList())
      .catch(() => dropInfo.revert());
  };

  return (
    <>
      <SalesPlanPageTitleBar
        pageNm="Sales"
        pageUrl="/salesActivityDashboard"
        breadCrumbItems={[
          {label: "SalesPlus", path: "/salesActivityDashboard"},
          {label: "SalesActivityPlan", path: "/salesActivityPlan", active: true},
        ]}
      />

      <Row className="mt-n2" style={{minHeight: "calc(95vh - 100px)"}}>
        <Col style={{display: "flex", flexDirection: "column"}}>
          <Card style={{flex: 1, display: "flex", flexDirection: "column"}}>
            <Card.Body>
              <SalesActivityPlanCalendar
                events={events}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
                onDrop={() => {
                }}
                onEventDrop={onEventDrop}
                currentFilter={levShareFilter}
                onFilterChange={setLevShareFilter}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 신규/수정 모달 */}
      {showPlanPopup && (
        <SalesActivityPlanAddEditEvent
          isOpen={showPlanPopup}
          onClose={() => setShowPlanPopup(false)}
          isEditable={Boolean(eventData.id)}
          eventData={eventData}
          selectedDate={selectedDate}
          onRemoveEvent={handleRemoveEvent}
          onUpdateEvent={handleUpdateEvent}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* 상세 팝업 (sw==="002") */}
      {showDetailPopup && (
        <SalesActivityPlanActualPopup
          isShowActivityDetailPopup={showDetailPopup}
          onClose={() => setShowDetailPopup(false)}
          cdCompany={(eventData.extendedProps as any).cdCompany}
          noDocu={(eventData.extendedProps as any).noDocu}
          seqDocu={(eventData.extendedProps as any).seqDocu}
        />
      )}
    </>
  );
};

export default SalesActivityPlan;
