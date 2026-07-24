import React, {useEffect, useState} from "react";
import {FormControl, InputGroup, Modal} from "react-bootstrap";
import {FormProvider, useForm} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";

/* lb */
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {EventInput} from "@fullcalendar/core";

/* Utils */
import {DateUtils} from "@utils/dateUtils";
import {isEmpty} from "@utils/CommonUtil";

/* component */
import IconComponent from "@components/common/IconComponent";
import ButtonComponent from "@components/common/ButtonComponent";

/* constants */
import {Payload} from "@constants/common/common";

/* redux */
import {CommonPisCodeDetailRes, getCommonCodeDetailList} from "@redux/common/commonSlice";
import {AppDispatch, RootState} from "@redux/store";

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

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  isEditable?: boolean,
  eventData: EventInput,
  selectedDate?: string,
  onRemoveEvent?: () => void,
  onUpdateEvent: (v: FormValues) => void,
  onAddEvent: (v: FormValues) => void,
}

export default function SalesActivityPlanAddEditEvent({
                                                        isOpen,
                                                        onClose,
                                                        isEditable,
                                                        eventData,
                                                        selectedDate,
                                                        onRemoveEvent,
                                                        onUpdateEvent,
                                                        onAddEvent,
                                                      }: Props) {
  const {t} = useTranslation();

  const schema = yup.object().shape({
    dtPlan: yup.string().required("계획일자를 입력하세요"),
    startTm: yup.string().required("시작시간을 입력하세요"),
    endTm: yup.string().required("종료시간을 입력하세요"),
    levShare: yup.string().required("업무공유 범위를 선택하세요"),
  });

  const methods = useForm<FormValues>({
    defaultValues: {
      dtPlan: selectedDate || DateUtils.today,
      startTm: new Date().toTimeString().slice(0, 5),
      endTm: new Date().toTimeString().slice(0, 5),
      purpose: "",
      company: "",
      attend: "",
      levShare: "11",
      noticeYn: "Y",
    },
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    register,
    formState: {errors},
    reset,
    getValues,
  } = methods;

  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const [workShareList, setWorkShareList] = useState<CommonPisCodeDetailRes[]>([]);
  const [openSelect, setOpenSelect] = useState(false);

  // 업무공유 코드 리스트 조회
  useEffect(() => {
    dispatch(
      getCommonCodeDetailList({
        cdCompany: user?.companyId || "",
        cdField: "SP0005",
        cdSysdef: "",
        cdFlag1: "",
      })
    ).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setWorkShareList(payload.data);
      } else {
        setWorkShareList([]);
      }
    });
  }, [dispatch, user]);

  // (1) 편집 모드 진입 시: eventData → 완전 리셋
  useEffect(() => {
    // 편집 모드이고, 옵션 리스트(workShareList)가 로딩된 후에만 실행
    if (isEditable && workShareList.length > 0 && (eventData.extendedProps as any)) {
      const ext = eventData.extendedProps as any;
      reset({
        dtPlan: ext.dtPlan,
        startTm: ext.startTm,
        endTm: ext.endTm,
        purpose: ext.purpose,
        company: ext.company,
        attend: ext.attend,
        levShare: ext.levShare, // 서버에서 받은 levShare 값
        noticeYn: ext.noticeYn, // 서버에서 받은 levShare 값
      });
    }
  }, [isEditable, eventData, workShareList, reset]);
  // (2) 등록 모드, 날짜만 변경 시: 나머지 필드 초기화
  useEffect(() => {
    if (!selectedDate || isEditable) return;
    reset({
      dtPlan: selectedDate,
      startTm: new Date().toTimeString().slice(0, 5),
      endTm: new Date().toTimeString().slice(0, 5),
      purpose: "",
      company: "",
      attend: "",
      levShare: workShareList[0]?.cdSysdef || "11",
      noticeYn: "Y",
    });
  }, [selectedDate, isEditable, reset, workShareList]);

  const onSubmit = (data: FormValues) => {
    if (isEditable) onUpdateEvent(data);
    else onAddEvent(data);
  };

  // 작성자 사번
  const writerNoEmp = (eventData?.extendedProps as any)?.noEmp;

// 로그인 사용자 사번
  const loginNoEmp = user?.userId;

// 수정/삭제 가능 여부
  const canEdit = String(writerNoEmp) === String(loginNoEmp);
  return (
    <FormProvider {...methods}>
      <Modal show={isOpen} onHide={onClose} centered>
        <Modal.Header closeButton className="modal-search-custom-header-class">
          <IconComponent
            className="fe-grid noti-icon"
            style={{
              fontSize: "20px",
              right: "10px",
              top: "50%",
              transform: "translateY(0%)",
              marginRight: "10px",
            }}
          />
          <Modal.Title className="modal-search-custom-title-class">
            {t(isEditable ? "SalesPlan Update" : "SalesPlan Register")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class">구분</label>

              <InputGroup style={{fontSize: 12}}>

                <div
                  className="d-flex align-items-center w-100 px-1"
                  style={{height: "32px"}}   // 기존 input 높이랑 맞춤
                >

                  {/* 공지 */}
                  <div className="form-check me-3 mb-0">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="Y"
                      {...register("noticeYn")}
                      id="noticeY"
                    />
                    <label className="form-check-label" htmlFor="noticeY">
                      공지사항
                    </label>
                  </div>

                  {/* 일반 */}
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="N"
                      {...register("noticeYn")}
                      id="noticeN"
                    />
                    <label className="form-check-label" htmlFor="noticeN">
                      영업활동
                    </label>
                  </div>

                </div>

              </InputGroup>
            </div>
            {/* 계획일자 + 시간 */}
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class">계획일자</label>
              <InputGroup style={{fontSize: 12}}>
                <FormControl type="date" {...register("dtPlan")} isInvalid={!!errors.dtPlan}/>
                <FormControl type="time" lang="en-GB" {...register("startTm")} isInvalid={!!errors.startTm}/>
                <FormControl type="time" lang="en-GB" {...register("endTm")} isInvalid={!!errors.endTm}/>
                <FormControl.Feedback type="invalid">
                  {errors.dtPlan?.message || errors.startTm?.message || errors.endTm?.message}
                </FormControl.Feedback>
              </InputGroup>
            </div>

            {/* 목적 */}
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class">목적</label>
              <InputGroup style={{fontSize: 12}}>
                <FormControl type="text" {...register("purpose")} isInvalid={!!errors.purpose} autoComplete="off"/>
              </InputGroup>
            </div>

            {/* 관계회사 */}
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class">관계사</label>
              <InputGroup style={{fontSize: 12}}>
                <FormControl type="text" {...register("company")} isInvalid={!!errors.company} autoComplete="off"/>
              </InputGroup>
            </div>

            {/* 참석자 */}
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class">참석자</label>
              <InputGroup style={{fontSize: 12}}>
                <FormControl type="text" {...register("attend")} isInvalid={!!errors.attend} autoComplete="off"/>
              </InputGroup>
            </div>

            {/* 업무공유 */}
            <div className="d-flex align-items-center mb-1">
              <label className="custom-salesPlan-label-class" style={{width: "13%"}}>
                업무공유
              </label>
              <div style={{position: "relative", flex: 1}}>
                <FormControl
                  as="select"
                  {...register("levShare")}
                  isInvalid={!!errors.levShare}
                  onFocus={() => setOpenSelect(true)}
                  onBlur={() => setOpenSelect(false)}
                  style={{textAlign: "center"}}
                >
                  {workShareList.map((item, idx) => (
                    <option key={idx} value={item.cdSysdef}>
                      {item.nmSysdef}
                    </option>
                  ))}
                </FormControl>
                <IconComponent
                  className={`mdi ${openSelect ? "mdi-chevron-up" : "mdi-chevron-down"}`}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <FormControl.Feedback type="invalid">{errors.levShare?.message}</FormControl.Feedback>
              </div>
            </div>

            {/* 버튼 */}
            <div className="d-flex justify-content-end">

              {/* 삭제 버튼 (작성자만) */}
              {isEditable && canEdit && (
                <ButtonComponent
                  type="button"
                  className="system-page-title-button me-1"
                  iClassName="mdi mdi-delete"
                  txt={t("common.delete.btn")}
                  onClick={onRemoveEvent}
                />
              )}

              {/* 저장 버튼 (작성자만 OR 신규등록) */}
              {(!isEditable || canEdit) && (
                <ButtonComponent
                  type="submit"
                  className="system-page-title-button me-1"
                  iClassName="mdi mdi-file-plus"
                  txt={t("common.save.btn")}
                />
              )}

            </div>
          </form>
        </Modal.Body>
      </Modal>
    </FormProvider>
  );
}
