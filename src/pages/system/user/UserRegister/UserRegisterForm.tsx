import React, { memo, useEffect, useRef, useState } from "react";
import { Col, FormControl, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";

/* Component */
import IconComponent from "../../../../components/common/IconComponent";
import EmpPopupComponent from "../../../../components/modal/EmpPopupComponent";
import PartnerPopupComponent from "../../../../components/modal/PartnerPopupComponent";
import ButtonComponent from "../../../../components/common/ButtonComponent";

/* Redux */
import { AppDispatch } from "../../../../redux/store";
import {
  BizareaListRes,
  EmpListRes,
  FactoryCodeInfoRes,
  getBizareaList,
  getEmpList,
  getFactoryCodeInfo,
  getPartnerList,
  PartnerListRes,
  SaveUserInfoReq,
  UserListRes,
} from "../../../../redux/system/SystemUserSlice";
import { isEmpty } from "../../../../utils/CommonUtil";
import { Payload } from "../../../../constants/common/common";
import { useTranslation } from "react-i18next";

interface Props {
  selectedRow?: UserListRes | null;
  formState: SaveUserInfoReq | null;
  setFormState: React.Dispatch<React.SetStateAction<SaveUserInfoReq>>;
  onClickUserIdDuplicate?: () => void;
  isPasswordEditable?: boolean;
}
const UserRegisterForm = memo(
  ({ selectedRow, formState, setFormState, onClickUserIdDuplicate, isPasswordEditable }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리

    const [searchEmpParams, setSearchEmpParams] = useState({
      noEmp: "",
      cdBizarea: "",
      cdDept: "",
      pageNo: 1,
      limit: 50,
    }); // 사원 번호 검색 조건

    const [searchPartnerParams, setSearchPartnerParams] = useState({
      lnPartner: "",
      cdPartner: "",
      limit: 50,
      page: 1,
    }); // 거래처코드(SCM) 목록 검색 조건

    /* 모달 리스트 */
    const [bizareaList, setBizareaList] = useState<BizareaListRes[]>([]); // 사업장 정보 리스트
    const [empList, setEmpList] = useState<EmpListRes[]>([]); // 부서 정보 리스트
    const [partnerList, setPartnerList] = useState<PartnerListRes[]>([]); // 거래처 정보 리스트
    const [factoryCodeInfo, setFactoryCodeInfo] = useState<FactoryCodeInfoRes[]>([]); // 거래처 정보 리스트

    /* 팝업 창 상태 */
    const [isEmpPopUpOpen, setIsEmpPopUpOpen] = useState(false); // 부서 모달 창
    const [isPartnerPopUpOpen, setIsPartnerPopUpOpen] = useState(false); // 거래처코드(SCM) 모달 창

    /* Guest disabled 체크 */
    const isGuestDisabledCheck = formState?.guestYn === "N" || formState?.guestYn === "" || formState?.guestYn === null;

    const formatDateToYYYYMMDD = (dateString: string) => {
      if (!dateString) return "";
      return dateString.replace(/-/g, "");
    };

    const formatDateToYYYY_MM_DD = (dateString: string) => {
      if (!dateString || dateString.length !== 8) return "";
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    };

    useEffect(() => {
      setFormState((prev) => ({
        ...prev,
        dtsStart: prev.dtsStart ? formatDateToYYYYMMDD(prev.dtsStart) : "",
        dtsEnd: prev.dtsEnd ? formatDateToYYYYMMDD(prev.dtsEnd) : "",
      }));
    }, [formState?.dtsStart, formState?.dtsEnd]);

    useEffect(() => {
      if (selectedRow) {
        setFormState((prev) => ({
          ...prev,
          ...selectedRow, // 선택된 행 데이터를 폼에 반영
        }));
      }
    }, [selectedRow]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value })); // 입력값 업데이트
    };

    /* 사업장 데이터 요청 */
    const fetchBizareaList = () => {
      dispatch(getBizareaList()).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setBizareaList(payload.data);
        } else {
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
      });
    };
    // fetchFactoryCodeInfo 함수 수정
    const fetchFactoryCodeInfo = (cdPlag1: string) => {
      const params = {
        cdField: "CZ_CA00061",
        cdCompany: "1000",
        cdSysdef: "",
        cdPlag1: cdPlag1,
      };

      dispatch(getFactoryCodeInfo(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setFactoryCodeInfo(payload.data);
        } else {
          setFactoryCodeInfo([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
      });
    };

    // cdPlag1 값 변경 시 공장 코드 조회
    useEffect(() => {
      if (formState?.companyId) {
        fetchFactoryCodeInfo(formState?.companyId);
      }
    }, [formState?.companyId]);

    useEffect(() => {
      setFormState((prev) => ({
        ...prev,
        siteCd: factoryCodeInfo[0]?.cdSysdef, // 첫 번째 사업장 값 자동 선택
      }));
    }, [factoryCodeInfo]);

    useEffect(() => {
      fetchBizareaList();
    }, []);

    /* 사원 정보 팝업 데이터 요청 */
    const fetchEmpList = () => {
      dispatch(getEmpList({ ...searchEmpParams })).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          if (searchEmpParams.pageNo === 1) {
            setEmpList(payload.data); // 첫 페이지는 데이터 교체
          } else {
            setEmpList((prev) => [...prev, ...payload.data]); // 이후 페이지는 데이터 추가
          }
        } else {
          setEmpList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
      });
    };

    /* 사원 정보 모달 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      if (isEmpPopUpOpen) {
        fetchEmpList();
      } else {
        setSearchEmpParams({
          noEmp: "",
          cdBizarea: "",
          cdDept: "",
          pageNo: 1,
          limit: 50,
        });
      }
    }, [isEmpPopUpOpen]);

    /* 사원 정보 팝업 클릭 */
    const onEmpPopUpRowClick = (row: EmpListRes) => {
      setFormState((prev) => ({
        ...prev,
        noEmp: row.noEmp,
        userId: row.noEmp,
        loginPwd: row.loginPwd,
        userNm: row.nmKor || "",
        userNmEng: row.nmEng || "",
        companyId: row.cdBizarea || "",
        deptId: row.cdDept || "",
        telNo: row.noTel || "",
        emailAddr: row.noEmail || "",
      }));
      setIsEmpPopUpOpen(false); // 팝업 창 닫기
    };

    // 조회 버튼 클릭 핸들러
    const handleSearchEmp = () => {
      setEmpList([]);

      const newParams = { ...searchEmpParams, pageNo: 1 };
      setSearchEmpParams(newParams);
      // 새 파라미터를 사용하여 API 호출
      dispatch(getEmpList(newParams)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          // 첫 페이지는 데이터 교체
          setEmpList(payload.data);
        } else {
          setEmpList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
        setIsLoading(false);
      });
    };

    // 사원번호 조회시
    const isEmpFetching = useRef(false);
    const handleLoadMoreEmp = () => {
      if (isLoading || isEmpFetching.current) return;
      if (empList.length >= empList[0]?.totalCount) {
        return;
      }
      isEmpFetching.current = true;
      setIsLoading(true);
      setSearchEmpParams((prev) => ({
        ...prev,
        pageNo: prev.pageNo + 1,
      }));
    };

    useEffect(() => {
      if (isEmpPopUpOpen && searchEmpParams.pageNo > 1) {
        if (empList.length < empList[0]?.totalCount) {
          fetchEmpList();
          isEmpFetching.current = false;
          setIsLoading(false);
        }
      }
    }, [searchEmpParams.pageNo]);

    /* 파트너 팝업 데이터 요청 */
    const fetchPartnerList = () => {
      dispatch(getPartnerList({ ...searchPartnerParams })).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          if (searchPartnerParams.page === 1) {
            setPartnerList(payload.data); // 첫 페이지는 데이터 교체
          } else {
            setPartnerList((prev) => [...prev, ...payload.data]); // 이후 페이지는 데이터 추가
          }
        } else {
          setPartnerList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
        setIsLoading(false); // 로딩 상태 해제
      });
    };

    /* 거래처코드(SCM) 팝업 클릭 */
    const onPartnerModalRowClick = (row: PartnerListRes) => {
      setFormState((prev) => ({
        ...prev,
        cdPartner: row.cdPartner,
      }));
      setIsEmpPopUpOpen(false); // 모달 창 닫기
    };

    /* 파트너 팝업 창 오픈 시 데이터 조회 및 초기화 */
    useEffect(() => {
      if (isPartnerPopUpOpen) {
        fetchPartnerList();
      } else {
        setSearchPartnerParams({
          lnPartner: "",
          cdPartner: "",
          limit: 50,
          page: 1,
        });
      }
    }, [isPartnerPopUpOpen]);

    // 조회 버튼 클릭 핸들러
    const handleSearchPartner = () => {
      setPartnerList([]);

      const newParams = { ...searchPartnerParams, page: 1 };
      setSearchPartnerParams(newParams);

      dispatch(getPartnerList(newParams)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          setPartnerList(payload.data);
        } else {
          setPartnerList([]);
          setErrorMsg(payload.errorMessage || t("common.data.notFound"));
        }
        setIsLoading(false);
      });
    };

    const handleLoadMorePartner = () => {
      if (isLoading) return;
      if (partnerList.length >= partnerList[0]?.totalCount) {
        return;
      }
      setIsLoading(true);
      setSearchPartnerParams((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    };

    useEffect(() => {
      // 더 이상 가져올 데이터가 없으면 호출하지 않음
      if (isPartnerPopUpOpen && searchPartnerParams.page > 1) {
        if (partnerList.length < partnerList[0]?.totalCount) {
          fetchPartnerList();
        }
      }
    }, [searchPartnerParams.page]);

    /* 거래처코드 값이 존재하면 사용자 구분 자동 변경 */
    useEffect(() => {
      if (formState?.cdPartner) {
        setFormState((prev) => ({
          ...prev,
          userSw: "88",
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          userSw: "00",
        }));
      }
    }, [formState?.cdPartner]); // cdPartner 값이 변경될 때 실행

    return (
      <div className="card user-form-card flex-grow-1">
        <div className="form-container p-3">
          <form>
            <Row>
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userId")}</label>
                  <FormControl
                    type="text"
                    name="userId"
                    value={formState?.userId || ""}
                    onChange={handleInputChange}
                    className="text-center"
                    autoComplete="off"
                    maxLength={10}
                  />
                  <ButtonComponent
                    type="button"
                    className="system-register-search-button"
                    iClassName="fe-check"
                    txt={""}
                    onClick={() => {
                      if (onClickUserIdDuplicate) {
                        onClickUserIdDuplicate();
                      }
                    }}
                  />
                </div>
              </Col>

              {/* 사원 번호 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.employeeNumber")}</label>
                  <FormControl
                    value={formState?.noEmp || ""}
                    name="noEmp"
                    onChange={handleInputChange}
                    type="text"
                    className="text-center custom-disabled-input"
                    autoComplete="off"
                    maxLength={10}
                    disabled={true}
                  />
                  <ButtonComponent
                    type="button"
                    className="system-register-search-button"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => {
                      setIsEmpPopUpOpen(true);
                    }}
                  />
                </div>
              </Col>

              {/* 사용자명 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userName")}</label>
                  <FormControl
                    name="userNm"
                    onChange={handleInputChange}
                    value={formState?.userNm || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 사용자명 (영문) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userEngName")}</label>
                  <FormControl
                    name="userNmEng"
                    onChange={handleInputChange}
                    value={formState?.userNmEng || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 비밀번호 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userPassword")}</label>
                  <FormControl
                    name="loginPwd"
                    onChange={handleInputChange}
                    type="password"
                    value={formState?.loginPwd || ""}
                    className={`text-center ${!isPasswordEditable ? "custom-disabled-input" : ""}`}
                    autoComplete="off"
                    disabled={!isPasswordEditable}
                  />
                </div>
              </Col>

              {/* 비밀번호 (확인) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userPasswordConfirm")}</label>
                  <FormControl
                    name="loginPwd1"
                    onChange={handleInputChange}
                    type="password"
                    value={formState?.loginPwd1 || ""}
                    className={`text-center ${!isPasswordEditable ? "custom-disabled-input" : ""}`}
                    autoComplete="off"
                    disabled={!isPasswordEditable}
                  />
                </div>
              </Col>

              {/* 전화번호 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.telNo")}</label>
                  <FormControl
                    name="telNo"
                    onChange={handleInputChange}
                    value={formState?.telNo || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* H.P(MOBILE) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.mobileNo")}</label>
                  <FormControl
                    name="mobileNo"
                    onChange={handleInputChange}
                    value={formState?.mobileNo || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 사업장 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.nmBizarea")}</label>
                  <div className={"position-relative w-100"}>
                    <select
                      className="form-control text-center"
                      value={formState?.companyId || ""}
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          companyId: e.target.value,
                        }));
                      }}
                    >
                      {bizareaList.map((biz) => (
                        <option key={biz.cdBizarea} value={biz.cdBizarea}>
                          {biz.nmBizarea}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={"mdi mdi-chevron-down position-absolute"}
                      style={{
                        fontSize: "23px", // 아이콘 크기 변경
                        right: "10px", // 오른쪽 정렬
                        top: "50%", // 세로 중앙 정렬
                        transform: "translateY(-50%)", // 정확한 중앙 정렬
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* 현장코드 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.factory")}</label>
                  <div className={"position-relative w-100"}>
                    <select
                      className="form-control text-center"
                      value={formState?.siteCd || ""}
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          siteCd: e.target.value,
                        }));
                      }}
                    >
                      {factoryCodeInfo.map((factory) => (
                        <option key={factory.cdSysdef} value={factory.cdSysdef}>
                          {factory.nmSysdefL5}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={"mdi mdi-chevron-down position-absolute"}
                      style={{
                        fontSize: "23px", // 아이콘 크기 변경
                        right: "10px", // 오른쪽 정렬
                        top: "50%", // 세로 중앙 정렬
                        transform: "translateY(-50%)", // 정확한 중앙 정렬
                      }}
                    />
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <div style={{ borderBottom: "2px solid #ddd", marginBottom: "14px" }}></div>
              </Col>

              {/* 거래처코드 (SCM) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.partner")}</label>
                  <FormControl
                    name="cdPartner"
                    onChange={handleInputChange}
                    type="text"
                    value={formState?.cdPartner || ""}
                    className="text-center"
                    autoComplete="off"
                  />
                  <ButtonComponent
                    type="button"
                    className="system-register-search-button"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => {
                      setIsPartnerPopUpOpen(true);
                    }}
                  />
                </div>
              </Col>

              {/* 사용자 구분 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.userGubun")}</label>
                  <div className={"position-relative w-100"}>
                    <select
                      className="form-control text-center"
                      value={formState?.userSw} // useEffect를 통해 값이 업데이트됨
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          userSw: e.target.value, // 선택된 값 업데이트
                        }));
                      }}
                    >
                      <option value="00">일반사용자</option>
                      <option value="88">SCM사용자</option>
                      <option value="99">관리자</option>
                    </select>
                    <IconComponent
                      className={"mdi mdi-chevron-down position-absolute"}
                      style={{
                        fontSize: "20px", // 아이콘 크기 변경
                        right: "10px", // 오른쪽 정렬
                        top: "50%", // 세로 중앙 정렬
                        transform: "translateY(-50%)", // 정확한 중앙 정렬
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* Email(1) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.email")}</label>
                  <FormControl
                    name="emailAddr"
                    onChange={handleInputChange}
                    value={formState?.emailAddr || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* Email(2) */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.email2")}</label>
                  <FormControl
                    name="emailAddr1"
                    onChange={handleInputChange}
                    value={formState?.emailAddr1 || ""}
                    type="text"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 사용 시작일 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.dtsStart")}</label>
                  <div className={"position-relative w-100"}>
                    <FormControl
                      name="dtsStart"
                      id="dtsStart"
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          dtsStart: formatDateToYYYYMMDD(e.target.value), // YYYY-MM-DD → YYYYMMDD 변환 후 저장
                        }))
                      }
                      value={formatDateToYYYY_MM_DD(formState?.dtsStart || "")} // YYYYMMDD → YYYY-MM-DD 변환 후 화면 표시
                      type="date"
                      className="text-center"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </Col>

              {/* 사용 종료일 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.dtsEnd")}</label>
                  <FormControl
                    name="dtsEnd"
                    id="dtsEnd"
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        dtsEnd: formatDateToYYYYMMDD(e.target.value), // YYYY-MM-DD → YYYYMMDD 변환 후 저장
                      }))
                    }
                    value={formatDateToYYYY_MM_DD(formState?.dtsEnd || "")} // YYYYMMDD → YYYY-MM-DD 변환 후 화면 표시
                    type="date"
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
              </Col>

              {/* 참고사항 */}
              <Col md={12} className="mb-0">
                <div className="system-form-group d-flex align-items-center">
                  <label className="remark-custom-label-class">{t("register.form.remark")}</label>
                  <FormControl
                    as="textarea" //  `type="textarea"` 대신 `as="textarea"` 사용
                    name="remark"
                    onChange={handleInputChange}
                    value={formState?.remark || ""}
                    className="textarea-form-control" //  올바른 클래스 적용
                    autoComplete="off"
                  />
                </div>
              </Col>

              <Col md={12}>
                <div style={{ borderBottom: "2px solid #ddd", marginBottom: "14px" }}></div>
              </Col>

              {/* 게스트 여부 */}
              <Col md={12} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.guestYn")}</label>
                  <div className="radio-group">
                    <label className="me-3">
                      <input
                        type="radio"
                        name="guestYn"
                        value="Y"
                        checked={formState?.guestYn === "Y"}
                        onChange={(e) => setFormState((prev) => ({ ...prev, guestYn: e.target.value }))}
                        className="me-1"
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="guestYn"
                        value="N"
                        checked={formState?.guestYn === "N" || formState?.guestYn === "" || formState?.guestYn === null}
                        onChange={(e) => setFormState((prev) => ({ ...prev, guestYn: e.target.value }))}
                        className="me-1"
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </Col>

              {/* 회사명 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.guestNmPartner")}</label>
                  <FormControl
                    name="guestNmPartner"
                    onChange={handleInputChange}
                    type="text"
                    value={formState?.guestNmPartner || ""}
                    className={`text-center ${isGuestDisabledCheck ? "custom-disabled-input" : ""}`}
                    autoComplete="off"
                    disabled={isGuestDisabledCheck}
                  />
                </div>
              </Col>

              {/* 부서 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.guestNmDept")}</label>
                  <FormControl
                    name="guestNmDept"
                    onChange={handleInputChange}
                    type="text"
                    value={formState?.guestNmDept || ""}
                    className={`text-center ${isGuestDisabledCheck ? "custom-disabled-input" : ""}`}
                    autoComplete="off"
                    disabled={isGuestDisabledCheck}
                  />
                </div>
              </Col>

              {/* 직책 */}
              <Col md={6} className="mb-0">
                <div className="system-form-group d-flex align-items-center justify-content-between">
                  <label className="label-custom custom-label-class">{t("register.form.guestNmPos")}</label>
                  <FormControl
                    name="guestNmPos"
                    onChange={handleInputChange}
                    type="text"
                    value={formState?.guestNmPos || ""}
                    className={`text-center ${isGuestDisabledCheck ? "custom-disabled-input" : ""}`}
                    autoComplete="off"
                    disabled={isGuestDisabledCheck}
                  />
                </div>
              </Col>
            </Row>
          </form>

          {/* 모달 팝업 */}
          <EmpPopupComponent
            itemList={empList}
            errorMsg={errorMsg}
            show={isEmpPopUpOpen}
            onClose={() => setIsEmpPopUpOpen(false)}
            onSearch={handleSearchEmp}
            searchEmpParams={searchEmpParams}
            setSearchEmpParams={setSearchEmpParams}
            onLoadMore={handleLoadMoreEmp}
            onEmpPopUpRowClick={onEmpPopUpRowClick}
          />
          <PartnerPopupComponent
            itemList={partnerList}
            errorMsg={errorMsg}
            show={isPartnerPopUpOpen}
            onClose={() => setIsPartnerPopUpOpen(false)}
            onSearch={handleSearchPartner}
            searchPartnerParams={searchPartnerParams}
            setSearchPartnerParams={setSearchPartnerParams}
            onLoadMore={handleLoadMorePartner}
            onPartnerModalRowClick={onPartnerModalRowClick}
          />
        </div>
      </div>
    );
  }
);

export default UserRegisterForm;
