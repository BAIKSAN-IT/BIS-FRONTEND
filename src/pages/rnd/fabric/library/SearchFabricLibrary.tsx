import React, {memo, useEffect, useState} from "react";
import {Card, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import IconComponent from "../../../../components/common/IconComponent";
import DeptPopupComponent from "@components/modal/DeptPopupComponent";
import SupplierPopupComponent from "@components/modal/SupplierPopupComponent";
import FabricPopupComponent from "@components/modal/FabricPopupComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import ButtonComponent from "@components/common/ButtonComponent";

/* redux */
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {CommonNeoeCodeRes, getCommonNeoeCodeDtlList} from "@redux/common/commonSlice";
import {DeptListRes, PagingUserListRes, PartnerListRes} from "@redux/system/SystemUserSlice";
import {FabricInfoRes} from "@redux/rnd/RndSlice";

/* utils */
import {InputRefMap} from "@utils/useInputRefs";
import {isEmpty} from "@utils/CommonUtil";
import {DateUtils} from "@utils/dateUtils";

/* constants */
import {Payload} from "@constants/common/common";

interface Props {
  onSearchButtonClick: () => void;
  searchParams: {
    cdCompany: string; // 회사 코드
    startDate: string; // START DATE
    endDate: string; // END DATE
    seqArticle: string;
    cdHanger: string;
    nmFabric: string;
    cdSupplier: string;
    noSupplierArticle: string;
    productType: string;
    fabricType: string;
    fabricDivision: string;
    fabricCategory: string;
    fabricStructure: string;
    userNm: string;
    cdDept: string;
    nmDept: string;
    noSample: string; // STYLE#
    noLot: string; // LOT#
    ynConfirm: string;
    cdFabric: string;
    cdComposition: string;
    cdProcess: string;
    cdYarn: string;
    nmYarn: string;
    qrcode: string;
    seq: number;
    rowQrNum: number;
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany: string; // 회사 코드
      startDate: string; // START DATE
      endDate: string; // END DATE
      seqArticle: string;
      cdHanger: string;
      nmFabric: string;
      cdSupplier: string;
      noSupplierArticle: string;
      productType: string;
      fabricType: string;
      fabricDivision: string;
      fabricCategory: string;
      fabricStructure: string;
      userNm: string;
      cdDept: string;
      nmDept: string;
      noSample: string; // STYLE#
      noLot: string; // LOT#
      ynConfirm: string;
      cdFabric: string;
      cdComposition: string;
      cdProcess: string;
      cdYarn: string;
      nmYarn: string;
      qrcode: string;
      seq: number;
      rowQrNum: number;
    }>
  >;
  refs: InputRefMap<
    | "nmFabric"
    | "startDate"
    | "endDate"
    | "cdSupplier"
    | "noSupplierArticle"
    | "cdHanger"
    | "productType"
    | "fabricType"
    | "fabricDivision"
    | "fabricCategory"
    | "fabricStructure"
    | "userNm"
    | "cdDept"
    | "nmDept"
    | "ynConfirm"
    | "noSample"
    | "noLot"
    | "cdFabric"
    | "cdComposition"
    | "cdProcess"
    | "cdYarn"
    | "nmYarn"
    | "qrcode"
    | "seq"
  >;
}

const SearchFabricLibrary = memo(({onSearchButtonClick, searchParams, setSearchParams, refs}: Props) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const {systemProgram, user} = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
    user: state.Auth.user,
  }));

  const [openSelect, setOpenSelect] = useState<string | null>(null); // 특정 select box ID만 관리
  const [isShowDeptPopup, setIsShowDeptPopup] = useState(false);
  const [isShowUserPopup, setIsShowUserPopup] = useState(false);
  const [isShowSupplierPopup, setIsShowSupplierPopup] = useState(false);
  const [isShowFabricPopup, setIsShowFabricPopup] = useState(false);

  // Enter 키로 조회 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (systemProgram.find((program) => program.find === "1" && program.pageUrl === location.pathname)) {
      if (e.key === "Enter") {
        onSearchButtonClick();
      }
    }
  };

  // 1. 각 코드 목록에 대한 상태
  const [fabricDivisionList, setFabricDivisionList] = useState<CommonNeoeCodeRes[]>([]);
  const [productTypeList, setProductTypeList] = useState<CommonNeoeCodeRes[]>([]);
  const [fabricTypeList, setFabricTypeList] = useState<CommonNeoeCodeRes[]>([]);
  const [knitCategoryList, setKnitCategoryList] = useState<CommonNeoeCodeRes[]>([]);
  const [structureCategoryList, setStructureCategoryList] = useState<CommonNeoeCodeRes[]>([]);

  // 2. 각 검색 파라미터 상태 (cdFlag1은 onChange에서 e.target.value로 업데이트)
  const [searchFabricDivisionParams, setSearchFabricDivisionParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02117",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });
  const [searchProductTypeParams, setSearchProductTypeParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02101",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const [searchFabricTypeParams, setSearchFabricTypeParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02102",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const [searchKnitCategoryParams, setSearchKnitCategoryParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02103",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const [searchStructureCategoryParams, setSearchStructureCategoryParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_CA02104",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  // 3. 각 코드 목록을 가져오는 별도의 검색 함수
  const fetchFabricDivisionList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchFabricDivisionParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setFabricDivisionList(payload.data);
      } else {
        setFabricDivisionList([]);
      }
    });
  };

  const fetchProductTypeList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchProductTypeParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setProductTypeList(payload.data);
      } else {
        setProductTypeList([]);
      }
    });
  };

  const fetchFabricTypeList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchFabricTypeParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setFabricTypeList(payload.data);
      } else {
        setFabricTypeList([]);
      }
    });
  };

  const fetchKnitCategoryList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchKnitCategoryParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setKnitCategoryList(payload.data);
      } else {
        setKnitCategoryList([]);
      }
    });
  };

  const fetchStructureCategoryList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchStructureCategoryParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setStructureCategoryList(payload.data);
      } else {
        setStructureCategoryList([]);
      }
    });
  };

  // 4. 각 API 호출
  useEffect(() => {
    fetchFabricDivisionList();
  }, [searchFabricDivisionParams]);

  useEffect(() => {
    fetchProductTypeList();
  }, [searchProductTypeParams]);

  useEffect(() => {
    fetchFabricTypeList();
  }, [searchFabricTypeParams]);

  useEffect(() => {
    fetchKnitCategoryList();
  }, [searchKnitCategoryParams]);

  useEffect(() => {
    // 업무구분이 선택되지 않았다면 상세분류 목록을 비워둔다.
    if (!searchStructureCategoryParams.cdFlag1) {
      setStructureCategoryList([]);
      return;
    }
    fetchStructureCategoryList();
  }, [searchStructureCategoryParams]);

  useEffect(() => {
    if (user) {
      setSearchParams((prev) => ({
        ...prev,
        cdDept: "",
        nmDept: "",
        userNm: "",
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
          height: "150px",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <Card.Body>
          <Row>
            {/* Fabric Name 입력 필드 */}
            <Col md={6} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">FABRIC NAME</label>
                <input
                  type="text"
                  name={"nmFabric"}
                  ref={refs["nmFabric"]}
                  value={searchParams.nmFabric || ""}
                  className="form-control fg-control"
                  style={{height: "27px", fontSize: "10px"}}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      nmFabric: e.target.value,
                    }))
                  }
                />
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="ti-search"
                  txt={""}
                  onClick={() => setIsShowFabricPopup(true)}
                />
              </div>
            </Col>

            {/* Input Date */}
            <Col md={6} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">INPUT DATE</label>
                <InputGroup>
                  <FormControl
                    type="date"
                    style={{height: "27px", fontSize: "12px"}}
                    name="startDate"
                    ref={refs["startDate"]}
                    defaultValue={'2024-01-01'}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                  />
                  <FormControl
                    type="date"
                    style={{height: "27px", fontSize: "12px"}}
                    name="endDate"
                    ref={refs["endDate"]}
                    defaultValue={DateUtils.today}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                    min={refs["startDate"]?.current?.value}
                  />
                </InputGroup>
              </div>
            </Col>

            {/* Style# */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">STYLE#</label>
                <input
                  type="text"
                  name={"noSample"}
                  ref={refs["noSample"]}
                  value={searchParams.noSample || ""}
                  className="form-control text-center fg-control"
                  style={{height: "27px", fontSize: "10px"}}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      noSample: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>

            {/* Lot# */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">LOT#</label>
                <input
                  type="text"
                  name={"noLot"}
                  ref={refs["noLot"]}
                  value={searchParams.noLot || ""}
                  className="form-control text-center fg-control"
                  style={{height: "27px", fontSize: "10px"}}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      noLot: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>

            {/* Supplier  */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">SUPPLIER</label>
                <FormControl
                  name="cdSupplier"
                  ref={refs["cdSupplier"]}
                  style={{height: "27px", fontSize: "10px"}}
                  type="text"
                  className="text-center fg-control"
                  autoComplete="off"
                  value={searchParams.cdSupplier || ""}
                  onKeyPress={handleKeyPress}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      cdSupplier: e.target.value,
                    }))
                  }
                />
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="ti-search"
                  txt={""}
                  onClick={() => setIsShowSupplierPopup(true)}
                />
              </div>
            </Col>

            {/* Supplier Article# */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">HANGER#</label>
                <input
                  type="text"
                  name={"cdHanger"}
                  ref={refs["cdHanger"]}
                  value={searchParams.cdHanger || ""}
                  className="form-control text-center fg-control"
                  style={{height: "27px", fontSize: "10px"}}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      cdHanger: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>

            {/* FabricDivision  */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">FABRIC DIVISION</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="fabricDivision"
                    value={searchParams.fabricDivision || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        fabricDivision: e.target.value,
                      }))
                    }
                  >
                    <option value=""></option>
                    {fabricDivisionList.map((item, index) => (
                      <option key={index} value={item.nmSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>

            {/* Product Type */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">PRODUCT TYPE</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="productType"
                    value={searchParams.productType || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        productType: e.target.value,
                      }))
                    }
                  >
                    <option value=""></option>
                    {productTypeList.map((item, index) => (
                      <option key={index} value={item.cdSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>

            {/* Fabric Type */}
            <Col md={3} style={{transform: "translateY(-18px)"}}>
              <div className="fg-row">
                <label className="fg-label">FABRIC TYPE</label>
                <div className={"position-relative w-100"}>
                  <select
                    name="fabricType"
                    value={searchParams.fabricType || ""}
                    className="form-control text-center fg-control"
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        fabricType: e.target.value,
                      }))
                    }
                  >
                    <option value=""></option>
                    {fabricTypeList.map((item, index) => (
                      <option key={index} value={item.cdSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent
                    className={`mdi ${openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"} icon-chevron`}
                  />
                </div>
              </div>
            </Col>
            <>
              {/* Knit Category */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">KNIT CATEGORY</label>
                  <div className="position-relative w-100">
                    <select
                      className="form-control text-center fg-control"
                      name="fabricCategory"
                      value={searchParams.fabricCategory || ""}
                      onChange={(e) => {
                        const selectedCdSysdef = e.target.value;
                        const selectedItem = knitCategoryList.find((item) => item.cdSysdef === selectedCdSysdef);
                        const selectedNmSysdef = selectedItem?.nmSysdef || "";

                        // 검색 파라미터 업데이트
                        setSearchParams((prev) => ({
                          ...prev,
                          fabricCategory: selectedCdSysdef, // 값은 코드
                        }));

                        // 구조 타입 조회 조건 업데이트 (cdFlag1에는 nmSysdef)
                        setSearchStructureCategoryParams((prev) => ({
                          ...prev,
                          cdFlag1: selectedNmSysdef,
                          cdField: "CZ_CA02104",
                          cdSysdef: "",
                        }));
                      }}
                    >
                      <option value=""></option>
                      {knitCategoryList.map((item) => (
                        <option key={item.cdSysdef} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Col>

              {/* Structure Category */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">STRUCTURE</label>
                  <div className="position-relative w-100">
                    <select
                      name="fabricStructure"
                      value={searchParams.fabricStructure || ""}
                      className="form-control text-center fg-control"
                      onChange={(e) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          fabricStructure: e.target.value, // 구조 타입 코드
                        }))
                      }
                    >
                      <option value=""></option>
                      {structureCategoryList.map((item) => (
                        <option key={item.cdSysdef} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Col>
              {/* Department  */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">DEPARTMENT</label>
                  <FormControl
                    name="nmDept"
                    ref={refs["nmDept"]}
                    style={{height: "27px", fontSize: "10px"}}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    value={searchParams?.nmDept || ""}
                    onKeyPress={handleKeyPress}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        nmDept: e.target.value,
                        cdDept: e.target.value,
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

              {/* Manager  */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">MANAGER</label>
                  <FormControl
                    name={"userNm"}
                    ref={refs["userNm"]}
                    value={searchParams?.userNm || ""}
                    style={{height: "27px", fontSize: "10px"}}
                    type="text"
                    className="text-center fg-control"
                    autoComplete="off"
                    onKeyPress={handleKeyPress}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        userNm: e.target.value,
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
              {/* Status */}
              <Col md={3} style={{transform: "translateY(-18px)"}}>
                <div className="fg-row">
                  <label className="fg-label">STATUS</label>
                  <div className={"position-relative w-100"}>
                    <select
                      className="form-control text-center fg-control"
                      name={"ynConfirm"}
                      value={searchParams?.ynConfirm || ""}
                      onChange={(e) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          ynConfirm: e.target.value,
                        }))
                      }
                    >
                      <option value="">전체</option>
                      <option value="Y">확정</option>
                      <option value="N">미확정</option>
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "progressStatus" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>
            </>
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
          if (refs["userNm"].current) refs["userNm"].current.value = user.userNm;
          if (refs["nmDept"].current) refs["nmDept"].current.value = user.nmDept;
          setSearchParams((prev) => ({
            ...prev,
            userNm: user.userNm,
            cdDept: user.cdDept,
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
            cdDept: dept.cdDept,
            nmDept: dept.nmDept,
          }));
        }}
      />

      {/* FabricName 모달 팝업 */}
      <FabricPopupComponent
        nmFabric={refs["nmFabric"]?.current?.value || ""}
        isShowFabricPopup={isShowFabricPopup}
        setIsShowFabricPopup={setIsShowFabricPopup}
        onClose={() => setIsShowFabricPopup(false)}
        onFabricSelect={(fabric: FabricInfoRes) => {
          setSearchParams((prev) => ({
            ...prev,
            nmFabric: fabric.nmFabric,
            cdFabric: fabric.cdFabric,
          }));
        }}
      />

      {/* Supplier 모달 팝업 */}
      <SupplierPopupComponent
        cdPartner={refs["cdSupplier"]?.current?.value || ""}
        isShowSupplierPopup={isShowSupplierPopup}
        setIsShowSupplierPopup={setIsShowSupplierPopup}
        onClose={() => setIsShowSupplierPopup(false)}
        onSupplierSelect={(partner: PartnerListRes) => {
          setSearchParams((prev) => ({
            ...prev,
            cdSupplier: partner.cdPartner,
            nmSupplier: partner.lnPartner,
          }));
        }}
      />
    </>
  );
});

export default SearchFabricLibrary;
