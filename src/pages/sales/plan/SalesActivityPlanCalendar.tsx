import React, {useEffect, useRef, useState} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import {EventInput} from "@fullcalendar/core";

import {fetchKoreanHolidays} from "@utils/holidaysApi";

// 서비스키
const HOLIDAY_API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY || "";

interface Props {
  onDateClick: (arg: any) => void;
  onEventClick: (arg: any) => void;
  onDrop: (arg: any) => void;
  onEventDrop: (arg: any) => void;

  events: EventInput[];

  currentFilter?: string;
  onFilterChange?: (newFilter: string) => void;

}

const SalesActivityPlanCalendar: React.FC<Props> = ({
                                                      onDateClick,
                                                      onEventClick,
                                                      onDrop,
                                                      onEventDrop,
                                                      events,
                                                      currentFilter,
                                                      onFilterChange,
                                                    }) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  const [holidays, setHolidays] = useState<
    { date: string; name: string }[]
  >([]);

  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [tooltip, setTooltip] = useState<{
    open: boolean;
    x: number;
    y: number;
    data?: any;
  }>({ open: false, x: 0, y: 0 });

  const showTooltip = (info: any) => {
    const ext = info.event?.extendedProps || {};
    const jsEvent: MouseEvent | undefined = info.jsEvent; // FullCalendar가 mouse event도 줌

    // 마우스 위치 기준 (가장 단순하고 안정적)
    const x = (jsEvent?.clientX ?? 0) + 12;
    const y = (jsEvent?.clientY ?? 0) + 12;

    setTooltip({
      open: true,
      x,
      y,
      data: {
        title: info.event?.title,
        dtPlan: ext.dtPlan,
        startTm: ext.startTm,
        endTm: ext.endTm,
        purpose: ext.purpose,
        company: ext.company,
        attend: ext.attend,
        levShare: ext.levShare,
        noticeYn: ext.noticeYn,
        sw: ext.sw,
      },
    });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, open: false }));
  };
  /* ===============================
     공휴일 조회
  =============================== */
  useEffect(() => {
    if (!HOLIDAY_API_KEY || !currentYear) return;

    fetchKoreanHolidays(currentYear, HOLIDAY_API_KEY)
      .then(setHolidays)
      .catch(console.error);
  }, [currentYear]);

  /* ===============================
     연도 변경 감지
  =============================== */
  const handleDatesSet = (info: any) => {
    const newYear = info.start.getFullYear();

    if (newYear !== currentYear) {
      setCurrentYear(newYear);
    }
  };

  /* ===============================
     필터 버튼 Active 처리
  =============================== */
  useEffect(() => {
    if (!calendarRef.current) return;

    const mapping: Record<string, string> = {
      "11": "team",
      "22": "dept",
      "33": "division",
      "99": "all",
    };

    Object.entries(mapping).forEach(([lev, id]) => {
      const btn =
        calendarRef.current!.querySelector<HTMLElement>(
          `.fc-${id}-button`
        );

      if (!btn) return;

      btn.classList.toggle("fc-button-active", currentFilter === lev);
    });
  }, [currentFilter]);

  /* ===============================
     일정에 levShare 클래스 부여
  =============================== */
  const eventClassNames = (arg: any) => {
    const lev = arg.event.extendedProps?.levShare;

    if (lev === "11") return ["event-lev-11"];
    if (lev === "22") return ["event-lev-22"];
    if (lev === "33") return ["event-lev-33"];
    if (lev === "99") return ["event-lev-99"];

    return [];
  };

  return (
    <div id="calendar" ref={calendarRef}>
      <FullCalendar
        initialView="dayGridMonth"
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
          listPlugin,
          bootstrapPlugin,
        ]}
        eventMouseEnter={showTooltip}
        eventMouseLeave={hideTooltip}
        themeSystem="bootstrap"
        editable
        selectable
        droppable
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        drop={onDrop}
        eventDrop={onEventDrop}
        datesSet={handleDatesSet}
        height={800}
        fixedWeekCount={false}
        /* ===== 필터 버튼 ===== */
        customButtons={{
          team: {
            text: "개인",
            click: () => onFilterChange?.("11"),
          },
          dept: {
            text: "팀",
            click: () => onFilterChange?.("22"),
          },
          division: {
            text: "부서",
            click: () => onFilterChange?.("33"),
          },
          all: {
            text: "전체",
            click: () => onFilterChange?.("99"),
          },
        }}
        headerToolbar={{
          left: "prev,next today team,dept,division,all",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
          list: "List",
          prev: "Prev",
          next: "Next",
        }}
        /* ===== 이벤트 색상 제어 ===== */
        eventClassNames={eventClassNames}
        /* ===== 공휴일 ===== */
        dayCellClassNames={(arg) => {
          const y = arg.date.getFullYear();
          const m = String(arg.date.getMonth() + 1).padStart(2, "0");
          const d = String(arg.date.getDate()).padStart(2, "0");

          const dateStr = `${y}-${m}-${d}`;

          const holiday = holidays.find(
            (h) => h.date === dateStr
          );

          if (holiday) return ["fc-holiday-cell"];

          return [];
        }}

        dayCellContent={(arg) => {
          const y = arg.date.getFullYear();
          const m = String(arg.date.getMonth() + 1).padStart(2, "0");
          const d = String(arg.date.getDate()).padStart(2, "0");

          const dateStr = `${y}-${m}-${d}`;

          const holiday = holidays.find(
            (h) => h.date === dateStr
          );

          return (
            <div className="fc-daygrid-day-top-inner">
              <span className="fc-daygrid-day-number">
                {arg.dayNumberText}
              </span>

              {holiday && (
                <span className="fc-holiday-name">
                  {holiday.name}
                </span>
              )}
            </div>
          );
        }}
      />
      {tooltip.open && tooltip.data && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 9999,
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1px solid rgba(15,23,42,0.12)",
            borderRadius: 14,
            boxShadow: "0 12px 26px rgba(0,0,0,0.14)",
            padding: "10px 12px",
            fontSize: 12,
            maxWidth: 340,
            pointerEvents: "none",
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 14,                         // 꼬리 위치 (원하면 조절)
              top: -6,
              width: 12,
              height: 12,
              background: "#1e90ff",
              borderLeft: "1px solid rgba(10, 80, 120, 0.18)",
              borderTop: "1px solid rgba(10, 80, 120, 0.18)",
              transform: "rotate(45deg)",
            }}
          />

          <div style={{ color: 'blue' ,marginBottom: 6, fontSize: 13 }}>
            {tooltip.data.title}
          </div>

          <div style={{ marginTop: 1 }}>
            <span >일자 :</span> {tooltip.data.dtPlan}
          </div>
          <div style={{ marginTop: 1 }}>
            <span >시간 :</span> {tooltip.data.startTm} ~ {tooltip.data.endTm}
          </div>
          {tooltip.data.purpose && (
            <div style={{ marginTop: 1 }}>
              <span>목적 :</span> {tooltip.data.purpose}
            </div>
          )}
          {tooltip.data.company && (
            <div style={{ marginTop: 1 }}>
              <span>관계사 :</span> {tooltip.data.company}
            </div>
          )}
          {tooltip.data.attend && (
            <div style={{ marginTop: 1 }}>
              <span>참석자 :</span> {tooltip.data.attend}
            </div>
          )}
        </div>
      )}
      {/* ================= CSS ================= */}
      <style>
        {`
          /* 공휴일 */
          .fc-holiday-cell {
            background: #ffecec !important;
            color: #c00 !important;
            border-radius: 8px;
          }

          /* ================= 일정 색상 ================= */

          /* 개인 */
          .fc-h-event.event-lev-11 {
            background: none !important;
            border: 0px solid #fff !important;

            /* 개인 타이틀 색상 */
            .fc-event-title {
              color: #000000 !important;
            }
          }

          /* 팀 */
          .fc-h-event.event-lev-22 {
            background: none !important;
            border: 0px solid #fff !important;

            /* 팀 타이틀 색상 */
            .fc-event-title {
              color: #CC00FF !important;
            }
          }

          /* 부서 */
          .fc-h-event.event-lev-33 {
            background: none !important;
            border: 0px solid #fff !important;

            /* 부서 타이틀 색상 */
            .fc-event-title {
              color: #0054FF !important;
            }
          }

          /* 전체 */
          .fc-h-event.event-lev-99 {
            background: none !important;
            border: 0px solid #fff !important;

            /* 전체 타이틀 색상 */
            .fc-event-title {
              color: red !important;
            }
          }
          .fc-all-button {
            background: #5cb85c !important;
          }
          /* 간격 조정 */
          .fc-daygrid-event-harness {
            height: 20px !important;
          }
        `}
      </style>
    </div>
  );
};

export default SalesActivityPlanCalendar;
