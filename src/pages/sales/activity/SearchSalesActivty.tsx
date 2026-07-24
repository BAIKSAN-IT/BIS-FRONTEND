import React, { Dispatch, memo, SetStateAction, useEffect, useState } from "react";
import { Button, Card, Col, FormControl, InputGroup, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import IconComponent from "../../../components/common/IconComponent";

/* redux */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import ButtonComponent from "../../../components/common/ButtonComponent";
import DeptPopupComponent from "../../../components/modal/DeptPopupComponent";
import { DeptListRes, PagingUserListRes } from "../../../redux/system/SystemUserSlice";
import UserPopupComponent from "../../../components/modal/UserPopupComponent";
import { InputRefMap } from "../../../utils/useInputRefs";
import { DateUtils } from "../../../utils/dateUtils";
import { CommonPisCodeDetailRes, getCommonCodeDetailList } from "../../../redux/common/commonSlice";
import { Payload } from "../../../constants/common/common";
import { isEmpty } from "../../../utils/CommonUtil";

interface Props {
  isShowContent: boolean;
  setIsShowContent: Dispatch<SetStateAction<boolean>>;
  onSearchButtonClick: () => void;
  searchParams: {
    cdCompany: string; // 회사 코드
    keywords: string; // 키워드
    nmVendor: string; //관계사
    descAttend: string; //참여자
    nmEmp: string; // 담당자 명
    cdDept: string; // 부서 코드
    nmDept: string; // 부서 명
    dtMeetFrom: string; // 상담기간 FROM
    dtMeetTo: string; // 상담기간 TO
    nmWork: string; // 업무구분
    nmDetail: string; // 상세분류
    progress: string; // 진행상태
    gwStatus: string; // 진행상태
    noDocuSeq: string; // 문서번호
    purpose: string; // 상담목적
    nmBuyer: string; // Buyer
    nmBrand: string; // BRAND
    nmItem: string; // ITEM
    dtInputFrom: string; // 작성일자 TO
    dtInputTo: string; // 작성일자 TO
    nmActivity: string; // 상담유형
    nmNameVendor: string; //연락처
    pLang: string; //언어
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string; // 회사 코드
      keywords: string; // 키워드
      nmVendor: string; //관계사
      descAttend: string; //참여자
      nmEmp: string; // 담당자 명
      cdDept: string; // 부서 코드
      nmDept: string; // 부서 명
      dtMeetFrom: string; // 상담기간 FROM
      dtMeetTo: string; // 상담기간 TO
      nmWork: string; // 업무구분
      nmDetail: string; // 상세분류
      progress: string; // 진행상태
      gwStatus: string; // 진행상태
      noDocuSeq: string; // 문서번호
      purpose: string; // 상담목적
      nmBuyer: string; // Buyer
      nmBrand: string; // BRAND
      nmItem: string; // ITEM
      dtInputFrom: string; // 작성일자 TO
      dtInputTo: string; // 작성일자 TO
      nmActivity: string; // 상담유형
      nmNameVendor: string; //연락처
      pLang: string; //언어
    }>
  >;
  refs: InputRefMap<
    | "keywords"
    | "nmVendor"
    | "descAttend"
    | "nmEmp"
    | "cdDept"
    | "nmDept"
    | "dtMeetFrom"
    | "dtMeetTo"
    | "progress"
    | "noDocuSeq"
    | "purpose"
    | "nmBuyer"
    | "nmBrand"
    | "nmItem"
    | "dtInputFrom"
    | "dtInputTo"
    | "nmNameVendor"
    | "pLang"
  >;
}

const SearchSalesActivity = memo(
  ({ isShowContent, setIsShowContent, onSearchButtonClick, searchParams, setSearchParams, refs }: Props) => {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const { systemProgram, user } = useSelector((state: RootState) => ({
      systemProgram: state.systemProgram.programList,
      user: state.Auth.user,
    }));

    const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);
    const [openSelect, setOpenSelect] = useState<string | null>(null); // 특정 select box ID만 관리
    const [isShowDeptPopup, setIsShowDeptPopup] = useState(false);
    const [isShowUserPopup, setIsShowUserPopup] = useState(false);

    // Enter 키로 조회 실행
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
        if (e.key === "Enter") {
          onSearchButtonClick();
        }
      }
    };
    // select box focus & blur 이벤트 핸들러
    const handleSelectFocus = (id: string) => {
      setOpenSelect(id);
    };

    const handleSelectBlur = () => {
      setOpenSelect(null);
    };

    // 1. 각 코드 목록에 대한 상태
    const [workTypeList, setWorkTypeList] = useState<CommonPisCodeDetailRes[]>([]);
    const [detailTypeList, setDetailTypeList] = useState<CommonPisCodeDetailRes[]>([]);
    const [consultationTypeList, setConsultationTypeList] = useState<CommonPisCodeDetailRes[]>([]);

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

    // 4. 각 API 호출
    useEffect(() => {
      fetchWorkTypeList();
    }, [searchWorkTypeParams]);

    useEffect(() => {
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
      setSearchParams((prev) => ({
        ...prev,
        cdDept: searchParams.nmDept ? searchParams.cdDept : "",
      }));
    }, [searchParams.nmDept, searchParams.cdDept]);
    useEffect(() => {
      if (user) {
        setSearchParams((prev) => ({
          ...prev,
          nmDept: user.deptNm || "",
          nmEmp: user.userNm || "",
        }));
      }
    }, []);
    return (
      <>
        <Card
          className="form-grid"
          style={{
            border: "1px solid #ddd",
            transform: "translateY(-20px)",
            height: isAddSearchOpen ? "190px" : "80px",
            transition: "height 0.3s ease-in-out",
          }}
        >
          <Card.Body>
            <Row>
              {/* keyWord 입력 필드 */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">keyWord</label>
                  <input
                    type="text"
                    name={"keywords"}
                    ref={refs["keywords"]}
                    className="form-control fg-control"
                    style={{ height: "27px", fontSize: "10px" }}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 관계사 입력 필드 */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">관계사</label>
                  <input
                    type="text"
                    name={"nmVendor"}
                    ref={refs["nmVendor"]}
                    className="form-control fg-control"
                    style={{ height: "27px", fontSize: "10px" }}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 참여자 입력 필드 */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">참여자</label>
                  <input
                    type="text"
                    name={"descAttend"}
                    ref={refs["descAttend"]}
                    className="form-control fg-control"
                    style={{ height: "27px", fontSize: "10px" }}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 부서  */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">부서</label>
                  <FormControl
                    name="nmDept"
                    ref={refs["nmDept"]}
                    style={{ height: "27px", fontSize: "10px" }}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    value={searchParams?.nmDept || ""}
                    onKeyPress={handleKeyPress}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        nmDept: e.target.value,
                      }))
                    }
                  />
                  <ButtonComponent
                    type="button"
                    className="fg-btn"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => setIsShowDeptPopup(true)}
                  />
                </div>
              </Col>

              {/* 담당자  */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">담당자</label>
                  <FormControl
                    name={"nmEmp"}
                    ref={refs["nmEmp"]}
                    value={searchParams?.nmEmp || ""}
                    style={{ height: "27px", fontSize: "10px" }}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    onKeyPress={handleKeyPress}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        nmEmp: e.target.value,
                      }))
                    }
                  />
                  <ButtonComponent
                    type="button"
                    className="fg-btn"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => setIsShowUserPopup(true)}
                  />
                </div>
              </Col>
              {/* 상담기간 */}
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">상담기간</label>
                  <InputGroup>
                    <FormControl
                      type="date"
                      style={{ height: "27px", fontSize: "8px" }}
                      name="dtMeetFrom"
                      ref={refs["dtMeetFrom"]}
                      defaultValue={DateUtils.twelveMonthsAgo}
                      onKeyPress={handleKeyPress}
                      autoComplete="off"
                      className="text-center fg-control"
                    />
                    <FormControl
                      type="date"
                      style={{ height: "27px", fontSize: "8px" }}
                      name="dtMeetTo"
                      ref={refs["dtMeetTo"]}
                      defaultValue={DateUtils.today}
                      onKeyPress={handleKeyPress}
                      autoComplete="off"
                      min={refs["dtMeetFrom"]?.current?.value}
                      className="text-center fg-control"
                    />
                  </InputGroup>
                </div>
              </Col>
              <Col md={3} style={{ transform: "translateY(-18px)" }}>
                <div className="fg-row">
                  <label className="fg-label">작성일자</label>
                  <InputGroup>
                    <FormControl
                      type="date"
                      name={"dtInputFrom"}
                      ref={refs["dtInputFrom"]}
                      defaultValue={DateUtils.twelveMonthsAgo}
                      style={{ height: "27px", fontSize: "8px" }}
                      onKeyPress={handleKeyPress}
                      autoComplete="off"
                      className="text-center fg-control"
                    />
                    <FormControl
                      type="date"
                      name={"dtInputTo"}
                      ref={refs["dtInputTo"]}
                      defaultValue={DateUtils.today}
                      style={{ height: "27px", fontSize: "8px" }}
                      onKeyPress={handleKeyPress}
                      autoComplete="off"
                      min={refs["dtInputFrom"]?.current?.value}
                      className="text-center fg-control"
                    />
                  </InputGroup>
                </div>
              </Col>

              {/* 추가조회 */}
              <Col md={2} style={{ transform: "translateY(-18px)" }}>
                <div className="d-flex align-items-center mb-2">
                  <Button
                    variant={"outline-primary"}
                    className={"custom-outline-button me-2"}
                    onClick={() => setIsAddSearchOpen(!isAddSearchOpen)}
                    style={{ fontSize: "65%" }}
                  >
                    조건추가
                  </Button>
                </div>
              </Col>
              <Col md={1} style={{ transform: "translateY(-12px)", fontSize: "90%" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isShowContent}
                    style={{ marginRight: "2px" }}
                    onChange={() => setIsShowContent(!isShowContent)}
                  />
                  상세보기
                </label>
              </Col>
              {isAddSearchOpen && (
                <>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">업무구분</label>
                      <div className={"position-relative w-100"}>
                        <select
                          name="nmWork"
                          value={searchParams.nmWork || ""}
                          className="form-select text-center fg-control"
                          onChange={(e) => {
                            const selectedNmSysdef = e.target.value;

                            // 선택된 항목 찾기
                            const selectedItem = workTypeList.find((item) => item.nmSysdef === selectedNmSysdef);
                            const selectedCdSysdef = selectedItem?.cdSysdef || "";

                            // 검색 조건 업데이트
                            setSearchParams((prev) => ({
                              ...prev,
                              nmWork: selectedNmSysdef, // 사람이 보는 이름
                              nmDetail: "", // 상세분류 초기화
                            }));

                            // 상세분류 코드 조건 업데이트 (cdFlag1)
                            setSearchDetailTypeParams((prev) => ({
                              ...prev,
                              cdFlag1: selectedCdSysdef, // 내부 조건 코드
                              cdCompany: prev.cdCompany,
                              cdField: "SP0002",
                              cdSysdef: "",
                            }));
                          }}
                        >
                          <option value="">전체</option>
                          {workTypeList.map((item) => (
                            <option key={item.cdSysdef} value={item.nmSysdef}>
                              {item.nmSysdef}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Col>

                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">상세분류</label>
                      <div className={"position-relative w-100"}>
                        <select
                          className="form-select text-center fg-control"
                          name={"nmDetail"}
                          style={{ transform: "translateY(0px)" }}
                          value={searchParams?.nmDetail || ""}
                          onChange={(e) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              nmDetail: e.target.value,
                            }))
                          }
                        >
                          <option value=""></option>
                          {detailTypeList.map((item, index) => (
                            <option key={index} value={item.nmSysdef}>
                              {item.nmSysdef}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Col>

                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">상담유형</label>
                      <div className="position-relative w-100">
                        <select
                          name={"nmActivity"}
                          style={{ transform: "translateY(0px)" }}
                          value={searchParams.nmActivity || ""}
                          className="form-select text-center fg-control"
                          onChange={(e) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              nmActivity: e.target.value,
                            }))
                          }
                        >
                          {consultationTypeList.map((item, index) => (
                            <option key={index} value={item.nmSysdef}>
                              {item.nmSysdef}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Col>

                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">진행상태</label>
                      <div className={"position-relative w-100"}>
                        <select
                          className="form-select text-center fg-control"
                          name={"gwStatus"}
                          value={searchParams?.gwStatus || ""}
                          onChange={(e) =>
                            setSearchParams((prev) => ({
                              ...prev,
                              gwStatus: e.target.value,
                            }))
                          }
                        >
                          <option value="">전체</option>
                          <option value="Y">완료</option>
                          <option value="N">반려</option>
                          <option value="C">진행중</option>
                          <option value="P">작성중</option>
                        </select>
                      </div>
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">문서번호</label>
                      <input
                        type="text"
                        name={"noDocuSeq"}
                        ref={refs["noDocuSeq"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">상담목적</label>
                      <input
                        type="text"
                        name={"purpose"}
                        ref={refs["purpose"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">Buyer</label>
                      <input
                        type="text"
                        name={"nmBuyer"}
                        ref={refs["nmBuyer"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">BRAND</label>
                      <input
                        type="text"
                        name={"nmBrand"}
                        ref={refs["nmBrand"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">ITEM</label>
                      <input
                        type="text"
                        name={"nmItem"}
                        ref={refs["nmItem"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                  <Col md={3} style={{ transform: "translateY(-18px)" }}>
                    <div className="fg-row">
                      <label className="fg-label">연락처</label>
                      <input
                        type="text"
                        name={"nmNameVendor"}
                        ref={refs["nmNameVendor"]}
                        className="form-control fg-control"
                        style={{ height: "27px", fontSize: "10px" }}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
                      />
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </Card.Body>
        </Card>
        {/* User 모달 팝업 */}
        <UserPopupComponent
          cdDept={refs["cdDept"]?.current?.value || ""}
          nmDept={refs["nmDept"]?.current?.value || ""}
          isShowUserPopup={isShowUserPopup}
          setIsShowUserPopup={setIsShowUserPopup}
          onClose={() => setIsShowUserPopup(false)}
          onUserSelect={(user: PagingUserListRes) => {
            if (refs["nmEmp"].current) refs["nmEmp"].current.value = user.userNm;
            if (refs["nmDept"].current) refs["nmDept"].current.value = user.nmDept;
            setSearchParams((prev) => ({
              ...prev,
              nmEmp: user.userNm,
              nmDept: user.nmDept,
            }));
          }}
        />
        {/* 부서 모달 팝업 */}
        <DeptPopupComponent
          isShowDeptPopup={isShowDeptPopup}
          setIsShowDeptPopup={setIsShowDeptPopup}
          onClose={() => setIsShowDeptPopup(false)}
          onDeptSelect={(dept: DeptListRes) => {
            if (refs["nmDept"].current) refs["nmDept"].current.value = dept.nmDept;
            setSearchParams((prev) => ({
              ...prev,
              nmDept: dept.nmDept,
            }));
          }}
        />
      </>
    );
  }
);

export default SearchSalesActivity;
