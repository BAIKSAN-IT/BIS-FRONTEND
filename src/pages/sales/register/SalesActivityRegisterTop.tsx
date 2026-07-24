import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import IconComponent from "../../../components/common/IconComponent";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import ButtonComponent from "../../../components/common/ButtonComponent";
import { SalesActivitySaveReq, SalesActivitySumListRes } from "../../../redux/sales/SalesActivitySlice";
import { CommonPisCodeDetailRes, getCommonCodeDetailList } from "../../../redux/common/commonSlice";
import { Payload } from "../../../constants/common/common";
import { isEmpty } from "../../../utils/CommonUtil";
import { DateUtils } from "../../../utils/dateUtils";
import SalesActivityDetail from "../detail/SalesActivityDetail";

interface Props {
  selectedItems: {
    attendee: boolean;
    purpose: boolean;
    mainIssue: boolean;
    futurePlans: boolean;
    followUp: boolean;
    order: boolean;
    expense: boolean;
    isAllCheck: boolean;
  };
  setSelectedItems: React.Dispatch<
    React.SetStateAction<{
      attendee: boolean;
      purpose: boolean;
      mainIssue: boolean;
      futurePlans: boolean;
      followUp: boolean;
      order: boolean;
      expense: boolean;
      isAllCheck: boolean;
    }>
  >;
  salesActivitySaveReq?: SalesActivitySaveReq | null;
  setIsShowUserPopup?: Dispatch<SetStateAction<boolean>>;
  setIsShowDeptPopup?: Dispatch<SetStateAction<boolean>>;
  isDisabled: boolean;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSalesActivitySaveReq?: React.Dispatch<React.SetStateAction<SalesActivitySaveReq>>;
}

const SalesActivityRegisterTop = memo(
  ({
    selectedItems,
    setSelectedItems,
    salesActivitySaveReq,
    handleDateChange,
    handleSelectChange,
    setIsShowUserPopup,
    setIsShowDeptPopup,
    isDisabled,
    handleInputChange,
    setSalesActivitySaveReq,
  }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const location = useLocation();
    const [openSelect, setOpenSelect] = useState<string | null>(null);
    const [isShowActivityDetailPopup, setIsShowActivityDetailPopup] = useState(false); //전자결제 팝업
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    // 1. 각 코드 목록에 대한 상태
    const [workTypeList, setWorkTypeList] = useState<CommonPisCodeDetailRes[]>([]);
    const [detailTypeList, setDetailTypeList] = useState<CommonPisCodeDetailRes[]>([]);
    const [consultationTypeList, setConsultationTypeList] = useState<CommonPisCodeDetailRes[]>([]);
    const [workShareList, setWorkShareList] = useState<CommonPisCodeDetailRes[]>([]);

    // 2. 각 검색 파라미터 상태 (cdFlag1은 onChange에서 e.target.value로 업데이트)
    const [searchWorkTypeParams, setSearchWorkTypeParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "SP0001",
      cdSysdef: "",
      cdFlag1: "",
    });
    const [searchDetailTypeParams, setSearchDetailTypeParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "SP0002",
      cdSysdef: "",
      cdFlag1: "",
    });
    const [searchConsultationTypeParams, setSearchConsultationTypeParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "SP0003",
      cdSysdef: "",
      cdFlag1: "",
    });
    const [searchWorkShareParams, setSearchWorkShareParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "SP0005",
      cdSysdef: "",
      cdFlag1: "",
    });

    // 3. 각 코드 목록을 가져오는 별도의 검색 함수
    const fetchWorkTypeList = () => {
      dispatch(getCommonCodeDetailList({ ...searchWorkTypeParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setWorkTypeList(payload.data);
        } else {
          setWorkTypeList([]);
        }
      });
    };

    const fetchDetailTypeList = () => {
      dispatch(getCommonCodeDetailList({ ...searchDetailTypeParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setDetailTypeList(payload.data);
        } else {
          setDetailTypeList([]);
        }
      });
    };

    const fetchConsultationTypeList = () => {
      dispatch(getCommonCodeDetailList({ ...searchConsultationTypeParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setConsultationTypeList(payload.data);
        } else {
          setConsultationTypeList([]);
        }
      });
    };

    const fetchWorkShareList = () => {
      dispatch(getCommonCodeDetailList({ ...searchWorkShareParams })).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setWorkShareList(payload.data);
        } else {
          setWorkShareList([]);
        }
      });
    };
    const fallbackDefaultSave: Required<SalesActivitySaveReq["saveActivityList"][0]> = {
      cdCompany: user?.companyId || "",
      noDocuSeq: "",
      noDocu: "",
      seqDocu: "",
      levDocu: 1,
      dtMeeting: DateUtils.today.replace(/-/g, ""),
      dtInput: DateUtils.today.replace(/-/g, ""),
      cdWork: "",
      cdDetail: "",
      cdActivity: "0001",
      nmWork: "",
      nmDetail: "",
      nmActivity: "",
      purpose: "",
      keywords: "",
      levShare: "11",
      agenda: "",
      results: "",
      progress: "",
      gwStatus: "",
      dtApproval: "",
      nmApproval: "",
      noEmp: user?.userId || "",
      nmEmp: user?.userNm || "",
      cdDept: user?.deptId || "",
      nmDept: user?.deptNm || "",
      contents: "",
      ynFlag: "",
      idInsert: user?.userId || "",
      dtInsert: "",
      idUpdate: user?.userId || "",
      dtUpdate: "",
    };

    // 업무구분 선택 시 (예: "업무구분" select)
    const handleWorkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cd = e.target.value;
      const found = detailTypeList.find((item) => item.cdSysdef === cd);
      const nm = found?.nmSysdef ?? "";
      setSearchDetailTypeParams((prev) => ({
        ...prev,
        cdFlag1: cd,
      }));
      if (!salesActivitySaveReq || !setSalesActivitySaveReq) return;
      const updatedList =
        salesActivitySaveReq.saveActivityList.length > 0
          ? salesActivitySaveReq.saveActivityList.map((wk, i) => (i === 0 ? { ...wk, cdWork: cd, nmWork: nm } : wk))
          : [{ ...fallbackDefaultSave, cdWork: cd, nmWork: nm }];
      setSalesActivitySaveReq({
        ...salesActivitySaveReq,
        saveActivityList: updatedList,
      });
    };

    // 상세분류 선택 시 (예: "상세분류" select)
    const handleDetailTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cd = e.target.value;
      const found = detailTypeList.find((item) => item.cdSysdef === cd);
      const nm = found?.nmSysdef ?? "";

      if (!salesActivitySaveReq || !setSalesActivitySaveReq) return;
      const updatedList =
        salesActivitySaveReq.saveActivityList.length > 0
          ? salesActivitySaveReq.saveActivityList.map((dt, i) => (i === 0 ? { ...dt, cdDetail: cd, nmDetail: nm } : dt))
          : [{ ...fallbackDefaultSave, cdDetail: cd, nmDetail: nm }];
      setSalesActivitySaveReq({
        ...salesActivitySaveReq,
        saveActivityList: updatedList,
      });
    };
    // 별도의 핸들러: 상담유형
    const handleConsultationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cd = e.target.value; // 선택된 코드
      const found = consultationTypeList.find((item) => item.cdSysdef === cd);
      const nm =
        found?.nmSysdef ?? // 만약 nmSysdef에 이름이 들어온다면
        "";

      if (!salesActivitySaveReq || !setSalesActivitySaveReq) return;
      const updatedList =
        salesActivitySaveReq.saveActivityList.length > 0
          ? salesActivitySaveReq.saveActivityList.map((act, i) =>
              i === 0 ? { ...act, cdActivity: cd, nmActivity: nm } : act
            )
          : [{ ...fallbackDefaultSave, cdActivity: cd, nmActivity: nm }];
      setSalesActivitySaveReq({
        ...salesActivitySaveReq,
        saveActivityList: updatedList,
      });
    };

    // 업무공유
    const handleWorkShareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      if (salesActivitySaveReq && setSalesActivitySaveReq) {
        let updatedList = salesActivitySaveReq.saveActivityList;
        if (updatedList.length === 0) {
          updatedList = [{ ...fallbackDefaultSave, levShare: newValue } as any];
        } else {
          updatedList = updatedList.map((activity, index) =>
            index === 0 ? { ...activity, levShare: newValue } : activity
          );
        }
        setSalesActivitySaveReq({
          ...salesActivitySaveReq,
          saveActivityList: updatedList,
        });
      }
    };

    useEffect(() => {
      if (salesActivitySaveReq && setSalesActivitySaveReq) {
        if (salesActivitySaveReq.saveActivityList.length === 0) {
          setSalesActivitySaveReq({
            ...salesActivitySaveReq,
            saveActivityList: [{ ...fallbackDefaultSave }],
          });
        }
      }
    }, []);

    // 5. 각 API 호출
    useEffect(() => {
      fetchWorkTypeList();
    }, [searchWorkTypeParams]);

    useEffect(() => {
      // 진행상태가 완료일떄는 호출한다.
      if (isDisabled) {
        fetchDetailTypeList();
      }
      // 업무구분이 선택되지 않았다면 상세분류 목록을 비워둔다.
      if (!searchDetailTypeParams.cdFlag1) {
        setDetailTypeList([]);
        return;
      }
      fetchDetailTypeList();
    }, [searchDetailTypeParams]);

    useEffect(() => {
      fetchConsultationTypeList();
    }, [searchConsultationTypeParams]);

    useEffect(() => {
      fetchWorkShareList();
    }, [searchWorkShareParams]);

    const handleCheckboxChange = (field: keyof typeof selectedItems) => {
      setSelectedItems((prev) => {
        if (field === "isAllCheck") {
          const newValue = !prev.isAllCheck;
          return {
            attendee: newValue,
            purpose: newValue,
            mainIssue: newValue,
            futurePlans: newValue,
            followUp: newValue,
            order: newValue,
            expense: newValue,
            isAllCheck: newValue,
          };
        } else {
          // 해당 필드 토글
          const updated = { ...prev, [field]: !prev[field] };
          // 전체 체크박스(전체선택 제외)가 모두 true인지 확인
          const allChecked =
            updated.attendee &&
            updated.purpose &&
            updated.mainIssue &&
            updated.futurePlans &&
            updated.followUp &&
            updated.order &&
            updated.expense;
          return { ...updated, isAllCheck: allChecked };
        }
      });
    };
    // 이미 상세분류에 값이 존재할떄
    useEffect(() => {
      const initialWork = salesActivitySaveReq?.saveActivityList[0]?.cdWork;
      if (initialWork) {
        // searchDetailTypeParams.cdFlag1 에 반영해서 목록 로드
        setSearchDetailTypeParams((prev) => ({
          ...prev,
          cdFlag1: initialWork,
        }));
      }
    }, [salesActivitySaveReq?.saveActivityList[0]?.cdWork]);
    return (
      <>
        <Card className={"form-grid sales-register-top-card"}>
          <Card.Body>
            <Row className="gy-1 gx-1 align-items-center">
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">상담일자</label>
                  <input
                    type="date"
                    className={`${
                      isDisabled ? "custom-disabled-input" : "form-control"
                    } sales-register-top-input text-center`}
                    value={
                      salesActivitySaveReq?.saveActivityList[0]?.dtMeeting
                        ? `${salesActivitySaveReq.saveActivityList[0].dtMeeting.slice(
                            0,
                            4
                          )}-${salesActivitySaveReq.saveActivityList[0].dtMeeting.slice(
                            4,
                            6
                          )}-${salesActivitySaveReq.saveActivityList[0].dtMeeting.slice(6)}`
                        : ""
                    }
                    onChange={handleDateChange}
                    disabled={isDisabled}
                  />
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">업무구분</label>
                  <div className="position-relative">
                    <select
                      name="cdWork"
                      className={`${
                        isDisabled ? "custom-disabled-input" : "form-control"
                      } sales-register-top-input text-center`}
                      value={salesActivitySaveReq?.saveActivityList[0]?.cdWork || ""}
                      onChange={handleWorkTypeChange}
                      disabled={isDisabled}
                    >
                      <option value=""></option>
                      {/* 옵션: codeDetailList의 값을 활용 (예시로) */}
                      {workTypeList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    {!isDisabled && (
                      <IconComponent
                        className={`sales-register-top-icon mdi ${
                          openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    )}
                  </div>
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">상세분류</label>
                  <div className="position-relative">
                    <select
                      name="cdDetail"
                      className={`${
                        isDisabled ? "custom-disabled-input" : "form-control"
                      } sales-register-top-input text-center`}
                      value={salesActivitySaveReq?.saveActivityList[0]?.cdDetail || ""}
                      onChange={handleDetailTypeChange}
                      disabled={isDisabled}
                    >
                      <option value=""></option>
                      {detailTypeList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    {!isDisabled && (
                      <IconComponent
                        className={`sales-register-top-icon mdi ${
                          openSelect === "detail" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    )}
                  </div>
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">상담유형</label>
                  <div className="position-relative">
                    <select
                      name="cdActivity"
                      className={`${
                        isDisabled ? "custom-disabled-input" : "form-control"
                      } sales-register-top-input text-center`}
                      // value를 별도 상태로 관리하거나 조건에 따라 "SP0003"으로 처리
                      value={salesActivitySaveReq?.saveActivityList[0]?.cdActivity || ""}
                      onChange={handleConsultationTypeChange}
                      disabled={isDisabled}
                    >
                      {consultationTypeList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    {!isDisabled && (
                      <IconComponent
                        className={`sales-register-top-icon mdi ${
                          openSelect === "consultationType" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    )}
                  </div>
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">업무공유</label>
                  <div className="position-relative">
                    <select
                      className={`${
                        isDisabled ? "custom-disabled-input" : "form-control"
                      } sales-register-top-input text-center`}
                      name={"levShare"}
                      value={salesActivitySaveReq?.saveActivityList[0]?.levShare || ""}
                      onChange={handleWorkShareChange}
                      disabled={isDisabled}
                    >
                      {workShareList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    {!isDisabled && (
                      <IconComponent
                        className={`sales-register-top-icon mdi ${
                          openSelect === "teamShare" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    )}
                  </div>
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">Keywords</label>
                  <input
                    type="text"
                    style={{ width: "100%" }}
                    name={"keywords"}
                    className={`${
                      isDisabled ? "custom-disabled-input" : "form-control"
                    } sales-register-top-input text-left`}
                    value={salesActivitySaveReq?.saveActivityList[0]?.keywords || ""}
                    autoComplete="off"
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  />
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-24px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">담당자</label>
                  <input
                    type="text"
                    style={{ width: "95px" }}
                    name={"nmEmp"}
                    className={`${
                      isDisabled ? "custom-disabled-input" : "form-control"
                    } sales-register-top-input text-center`}
                    value={salesActivitySaveReq?.saveActivityList[0]?.nmEmp || ""}
                    autoComplete="off"
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  />
                  <ButtonComponent
                    type="button"
                    className="fg-btn"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => {
                      if (setIsShowUserPopup) {
                        setIsShowUserPopup(true);
                      }
                    }}
                    disabled={isDisabled}
                  />
                </div>
              </Col>
              <Col md={2} style={{ transform: "translateY(-24px)" }}>
                <div className="d-flex align-items-center mb-1">
                  <label className="search-custom-label-class">부서</label>
                  <input
                    type="text"
                    style={{ width: "95px" }}
                    name={"nmDept"}
                    className={`${
                      isDisabled ? "custom-disabled-input" : "form-control"
                    } sales-register-top-input text-center`}
                    value={salesActivitySaveReq?.saveActivityList[0]?.nmDept || ""}
                    autoComplete="off"
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  />
                  <ButtonComponent
                    type="button"
                    className="fg-btn"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => {
                      if (setIsShowDeptPopup) setIsShowDeptPopup(true);
                    }}
                    disabled={isDisabled}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center" style={{ fontSize: "70%", transform: "translateY(-24px)" }}>
                  {[
                    { key: "attendee", label: "참석자" },
                    { key: "mainIssue", label: "Agenda" },
                    { key: "purpose", label: "상담목적" },
                    { key: "followUp", label: "결과 및 기대효과" },
                    { key: "futurePlans", label: "향후계획" },
                    { key: "expense", label: "비용항목" },
                    { key: "order", label: "Order 관련" },
                    { key: "isAllCheck", label: "전체 선택" },
                  ].map((item) => (
                    <label key={item.key} style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={selectedItems[item.key as keyof typeof selectedItems]}
                        onChange={() => handleCheckboxChange(item.key as keyof typeof selectedItems)}
                        style={{ marginRight: "2px" }}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </Col>
              <Col md={1}>
                <div
                  className={"sales-register-top-div mb-1"}
                  style={{ fontSize: "10px", transform: "translateY(-24px)" }}
                >
                  <Button
                    variant={"outline-primary"}
                    className={"custom-outline-button me-2"}
                    onClick={() => {
                      if (setIsShowActivityDetailPopup) {
                        setIsShowActivityDetailPopup(true);
                      }
                    }}
                  >
                    이전글
                  </Button>
                </div>
              </Col>
              {/*<Col md={1}>
                <div className="d-flex align-items-center" style={{ fontSize: "12px", transform: "translateY(-24px)" }}>
                  <label style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      disabled={isDisabled}
                      checked={salesActivitySaveReq?.saveActivityList[0]?.gwStatus === "Y"}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (setSalesActivitySaveReq && salesActivitySaveReq) {
                          setSalesActivitySaveReq({
                            ...salesActivitySaveReq,
                            saveActivityList: salesActivitySaveReq.saveActivityList.map((act, idx) =>
                              idx === 0 ? { ...act, gwStatus: checked ? "Y" : "" } : act
                            ),
                          });
                        }
                      }}
                      style={{ marginRight: "2px" }}
                    />
                    결제완료
                  </label>
                </div>
              </Col>*/}
            </Row>
          </Card.Body>
        </Card>
        {/* 이전글 보기 */}
        <SalesActivityDetail
          salesActivitySaveReq={salesActivitySaveReq}
          isShowActivityDetailPopup={isShowActivityDetailPopup}
          setIsShowActivityDetailPopup={setIsShowActivityDetailPopup}
          onClose={() => setIsShowActivityDetailPopup(false)}
        />
      </>
    );
  }
);

export default SalesActivityRegisterTop;
