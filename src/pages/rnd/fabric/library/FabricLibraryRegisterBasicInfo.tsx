import React, {memo, useEffect, useState} from "react";
import {Button, Card, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import {useDispatch, useSelector} from "react-redux";
/*component */
import IconComponent from "@components/common/IconComponent";
import DeptPopupComponent from "@components/modal/DeptPopupComponent";
import FabricPopupComponent from "@components/modal/FabricPopupComponent";
import SupplierPopupComponent from "@components/modal/SupplierPopupComponent";
import UserPopupComponent from "@components/modal/UserPopupComponent";
import ButtonComponent from "@components/common/ButtonComponent";

/* redux */
import {AppDispatch, RootState} from "@redux/store";
import {
  FabricInfoRes,
  getFabricAllInfoList,
  SaveRndArticleProcessReq,
  SaveRndArticleReq,
  SaveRndArticleYarnReq,
} from "@redux/rnd/RndSlice";
import {DeptListRes, PagingUserListRes, PartnerListRes} from "@redux/system/SystemUserSlice";
import {CommonNeoeCodeRes, getCommonNeoeCodeDtlList, PisBuyerListRes} from "@redux/common/commonSlice";

/* constants */
import {Payload} from "@constants/common/common";

/* Utils */
import {DateUtils} from "@utils/dateUtils";
import {isEmpty} from "@utils/CommonUtil";
import BuyerPopupComponent from "@components/modal/BuyerPopupComponent";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
  yarnList: SaveRndArticleYarnReq[];
  setYarnList: React.Dispatch<React.SetStateAction<SaveRndArticleYarnReq[]>>;
  processList: SaveRndArticleProcessReq[];
  setProcessList: React.Dispatch<React.SetStateAction<SaveRndArticleProcessReq[]>>;
}

const FabricLibraryRegisterBasicInfo = memo(
  ({articleList, setArticleList, yarnList, setYarnList, processList, setProcessList}: Props) => {
    const dispatch = useDispatch<AppDispatch>();

    const {user} = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    const [openSelect, setOpenSelect] = useState<string | null>(null);
    const [isShowDeptPopup, setIsShowDeptPopup] = useState(false);
    const [isShowUserPopup, setIsShowUserPopup] = useState(false);
    const [isShowBuyerPopup, setIsShowBuyerPopup] = useState(false);
    const [isShowSupplierPopup, setIsShowSupplierPopup] = useState(false);
    const [isShowFabricPopup, setIsShowFabricPopup] = useState(false);

    // 1. 코드 목록
    const [fabricDivisionList, setFabricDivisionList] = useState<CommonNeoeCodeRes[]>([]);
    const [productTypeList, setProductTypeList] = useState<CommonNeoeCodeRes[]>([]);
    const [fabricTypeList, setFabricTypeList] = useState<CommonNeoeCodeRes[]>([]);
    const [knitCategoryList, setKnitCategoryList] = useState<CommonNeoeCodeRes[]>([]);
    const [structureCategoryList, setStructureCategoryList] = useState<CommonNeoeCodeRes[]>([]);
    const [layerList, setLayerList] = useState<CommonNeoeCodeRes[]>([]);
    const [seasonList, setSeasonList] = useState<CommonNeoeCodeRes[]>([]);

    const formatDate = (rawDate?: string): string => {
      if (!rawDate || rawDate.length !== 8) return "";
      const year = rawDate.substring(0, 4);
      const month = rawDate.substring(4, 6);
      const day = rawDate.substring(6, 8);
      return `${year}-${month}-${day}`;
    };

    // 2. 검색 파라미터
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
    const [searchLayerParams, setSearchLayerParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "CZ_CA02111",
      cdSysdef: "",
      cdFlag1: "",
      fg1Syscode: "",
    });

    const [searchSeasonParams, setSearchSeasonParams] = useState({
      cdCompany: user?.companyId || "",
      cdField: "CZ_CA00064",
      cdSysdef: "",
      cdFlag1: "",
      fg1Syscode: "",
    });

    // 3. 코드 목록 조회
    const fetchFabricDivisionList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchFabricDivisionParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setFabricDivisionList(payload.data);
        else setFabricDivisionList([]);
      });
    };
    const fetchProductTypeList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchProductTypeParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setProductTypeList(payload.data);
        else setProductTypeList([]);
      });
    };
    const fetchFabricTypeList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchFabricTypeParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setFabricTypeList(payload.data);
        else setFabricTypeList([]);
      });
    };
    const fetchKnitCategoryList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchKnitCategoryParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setKnitCategoryList(payload.data);
        else setKnitCategoryList([]);
      });
    };
    const fetchStructureCategoryList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchStructureCategoryParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setStructureCategoryList(payload.data);
        else setStructureCategoryList([]);
      });
    };
    const fetchLayerList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchLayerParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setLayerList(payload.data);
        else setLayerList([]);
      });
    };
    const fetchSeasonList = () => {
      dispatch(getCommonNeoeCodeDtlList({...searchSeasonParams})).then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) setSeasonList(payload.data);
        else setSeasonList([]);
      });
    };

    // 4. 호출
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
      fetchLayerList();
    }, [searchLayerParams]);
    useEffect(() => {
      fetchSeasonList();
    }, [searchSeasonParams]);
    useEffect(() => {
      if (!searchStructureCategoryParams.cdFlag1) {
        setStructureCategoryList([]);
        return;
      }
      fetchStructureCategoryList();
    }, [searchStructureCategoryParams]);

    const handleArticleChange = (field: keyof SaveRndArticleReq, value: string) => {
      setArticleList((prev) => {
        const updatedItem = {...prev[0], [field]: value};
        return [updatedItem];
      });
    };

    // 샘플 플래그 토글 핸들러 ("Y"/"N")
    const handleFlagToggle =
      (field: "ynDevelopSample" | "yn1stSample" | "ynColorSample" | "ynReviseColorSample" | "ynAppSample") =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
          handleArticleChange(field, e.target.checked ? "Y" : "N");
        };
    const handleFabricSelect = async (fabric: FabricInfoRes) => {
      if (!fabric.cdFabric || !user?.companyId) return;
      const param = {
        cdCompany: user?.companyId || "1000",
        nmFabric: "",
        cdFabric: fabric.cdFabric || "",
        dyLot: fabric.dyLot || "",
        noStyle: fabric.noStyle || "",
        pageSize: 50,
        pageNo: 1,
      };

      // 여러 같은 data가 나오면은 비교해줘야하므로 값을 nmColor로 비교해준다.
      // 문제가 뭐냐면은 data가 4개가나오면은 두번째를 선택해도 첫번쨰값으로 map을 돌리기떄문이다.
      const selectedColor = fabric.nmColor;

      try {
        const res = await dispatch(getFabricAllInfoList(param)).unwrap();
        const data = res.data;
        if (data?.fabricInfoList) {
          const filteredFabricInfoList = data.fabricInfoList.filter(
            (item: any) => item.nmColor === selectedColor
          );

          const fabricList = filteredFabricInfoList.map((fabric: any) => ({
            cdCompany: fabric.cdCompany,
            seqArticle: "",
            cdHanger: "",
            cdFabric: fabric.cdFabric,
            nmFabric: fabric.nmFabric,
            nmFabricSt: fabric.nmFabricSt,
            cdSupplier: "",
            nmSupplier: "",
            noSupplierArticle: fabric.cdPurchase || "",
            fabricDivision: "0",
            productType: fabric.cdSample || "1",
            fabricType: fabric.fabCategory || "1",
            fabricCategory: fabric.fabStructureType || "01",
            fabricCategoryS: fabric.cdFabStructureType || "S",
            fabricStructure: fabric.fabStructureDetail1 || "101",
            fabricStructureS: fabric.cdFabStructureDetail1 || "SJ",
            fabricSecondStructure: "",
            cdLayer: fabric.cdLayer || "",
            composition: fabric.composition,
            noLot: fabric.dyLot || "",
            noSample: fabric.noStyle || "",
            fabricInch: String(fabric.ncode13 || ""),
            fabricGauge: Number(fabric.guage || 0),
            widthInch: Number(fabric.inch || 0),
            wgtGsm: Number(fabric.ncode08 || 0),
            wgtYdm: Number(fabric.wgtYd || 0),
            cdPressure: "",
            cdColorType: "",
            cdColor: "",
            nmColor: fabric.nmColor || "",
            cdSeason: "",
            cdCurrency: "USD",
            dtPrice: DateUtils.today.replace(/-/g, ""),
            pricePerYard: 0,
            pricePerWight: 0,
            pricePerMeter: 0,
            cdUnit: "",
            cdCountry: "",
            cdIncomterms: "",
            leadtimeDays: 0,
            minOrders: 0,
            minColor: 0,
            qtyKeep: 1,
            qtyKeepOrg: 1,
            buyerNotify: "",
            internalNotify: fabric.dcRmk,
            ynConfirm: "",
            dtConfirm: "",
            cdTheme: "",
            cdItem: "",
            cdDept: user?.deptId || "",
            nmDept: user?.deptNm || "",
            noEmp: user?.userId || "",
            userNm: user?.userNm || "",
            cdHangerPrev: "",
            dtHanger: DateUtils.today.replace(/-/g, ""),
            garmentSample: "",
            styleDesc: "",
            nuNidcnt: fabric.needle || 0,
            ynDevelopSample: "N",
            yn1stSample: "N",
            ynReviseColorSample: "N",
            ynColorSample: "N",
            ynAppSample: "N",
            fabricFinishing: "",
            cdBuyer: fabric.cdBuyer || "",
            nmBuyer: fabric.nmBuyer || "",
            idInsert: user?.userId || "",
            dtInsert: new Date().toISOString(),
            idUpdate: user?.userId || "",
            dtUpdate: new Date().toISOString(),
          })) as SaveRndArticleReq[];
          setSearchStructureCategoryParams((prev) => ({...prev, cdFlag1: fabric.nmFabStructureType || ""}));
          setArticleList(fabricList);
        } else {
          setArticleList([]);
        }
        if (data?.fabricYarnInfoList) {
          const yarnList: SaveRndArticleYarnReq[] = data.fabricYarnInfoList.map((yarn: any) => ({
            cdCompany: yarn.cdCompany,
            seqArticle: "",
            cdFabric: yarn.cdFabric,
            cdYarn: yarn.cdYarn,
            nmYarn: yarn.nmYarn,
            nmYarnSt: yarn.nmYarnSt,
            seq: yarn.seq,
            yarnMaterial: yarn.yarnMaterial,
            cpstRt: Number(yarn.cpstRt) || 0,
            yarnCount: yarn.yarnCount,
            countType: yarn.countType,
            loopLength: Number(yarn.loopLength) || 0,
            separate: yarn.separate,
            yarnColor: yarn.yarnColor,
            is2Ply: yarn.is2Ply,
            feeder: yarn.feeder,
            ply: yarn.ply,
            ynFlag: "",
          }));
          setYarnList(yarnList);
        } else {
          setYarnList([]);
        }
        if (data?.fabricProcessInfoList) {
          const processList: SaveRndArticleProcessReq[] = data.fabricProcessInfoList.map((process: any) => ({
            cdCompany: process.cdCompany,
            seqArticle: "",
            cdFabric: process.cdFabric,
            cdProcess: process.code,
            rtLoss: Number(process.rtLoss) || 0,
            ynFlag: "",
          }));
          setProcessList(processList);
        } else {
          setProcessList([]);
        }
      } catch (err) {
        console.error("상세 조회 실패", err);
      }
    };

    /* 초기 article */
    useEffect(() => {
      if (!articleList || articleList.length === 0) {
        const defaultArticle: SaveRndArticleReq = {
          cdCompany: user?.companyId || "1000",
          seqArticle: "",
          cdHanger: "",
          cdFabric: "",
          nmFabric: "",
          nmFabricSt: "",
          cdSupplier: "",
          nmSupplier: "",
          noSupplierArticle: "",
          fabricDivision: "0",
          productType: "1",
          fabricType: "1",
          fabricCategory: "01",
          fabricCategoryS: "S",
          fabricStructure: "101",
          fabricStructureS: "SJ",
          fabricSecondStructure: "",
          cdLayer: "",
          composition: "",
          noLot: "",
          noSample: "",
          fabricInch: "",
          fabricGauge: 0,
          widthInch: 0,
          wgtGsm: 0,
          wgtYdm: 0,
          cdPressure: "",
          cdColorType: "",
          cdColor: "",
          nmColor: "",
          cdSeason: "",
          cdCurrency: "USD",
          dtPrice: DateUtils.today.replace(/-/g, ""),
          pricePerYard: 0,
          pricePerWight: 0,
          pricePerMeter: 0,
          cdUnit: "",
          cdCountry: "",
          cdIncomterms: "",
          leadtimeDays: 0,
          minOrders: 0,
          minColor: 0,
          qtyKeep: 1,
          qtyKeepOrg: 1,
          buyerNotify: "",
          internalNotify: "",
          ynConfirm: "N",
          dtConfirm: "",
          cdTheme: "",
          cdItem: "",
          cdDept: user?.deptId || "",
          nmDept: user?.deptNm || "",
          noEmp: user?.userId || "",
          userNm: user?.userNm || "",
          cdHangerPrev: "",
          dtHanger: DateUtils.today.replace(/-/g, ""),
          garmentSample: "",
          styleDesc: "",
          nuNidcnt: 0,
          ynDevelopSample: "N",
          yn1stSample: "N",
          ynReviseColorSample: "N",
          ynColorSample: "N",
          ynAppSample: "N",
          fabricFinishing: "",
          cdBuyer: "",
          nmBuyer: "",
          idInsert: user?.userId || "",
          dtInsert: new Date().toISOString(),
          idUpdate: user?.userId || "",
          dtUpdate: new Date().toISOString(),
        };
        setSearchStructureCategoryParams((prev) => ({...prev, cdFlag1: "SINGLE"}));
        setArticleList([defaultArticle]);
      }
    }, []);
    // A) fabricCategory 변경 시 cdFlag1 갱신 → Structure 목록 fetch 트리거
    useEffect(() => {
      const cat = articleList?.[0]?.fabricCategory;
      if (!cat || knitCategoryList.length === 0) return;

      const found = knitCategoryList.find((k) => String(k.cdSysdef) === String(cat));
      const nextCdFlag1 = found?.nmSysdef || ""; // 서버가 요구하는 플래그 키

      if (nextCdFlag1 && nextCdFlag1 !== searchStructureCategoryParams.cdFlag1) {
        setSearchStructureCategoryParams((prev) => ({
          ...prev,
          cdField: "CZ_CA02104",
          cdSysdef: "",
          cdFlag1: nextCdFlag1,
        }));
      }
    }, [articleList?.[0]?.fabricCategory, knitCategoryList, searchStructureCategoryParams.cdFlag1]);

    // B) Structure 옵션 로드 후 현재 선택값 보정
    useEffect(() => {
      if (structureCategoryList.length === 0) return;

      setArticleList((prev) => {
        if (!prev || prev.length === 0) return prev;

        const cur = String(prev[0].fabricStructure ?? "");
        const hit = structureCategoryList.find((o) => String(o.cdSysdef) === cur);
        const next = hit ?? structureCategoryList[0];

        const same =
          String(prev[0].fabricStructure) === String(next.cdSysdef) &&
          String(prev[0].fabricStructureS ?? "") === String(next.cdUsrdef ?? "");

        if (same) return prev;

        return [
          {
            ...prev[0],
            fabricStructure: String(next.cdSysdef),
            fabricStructureS: String(next.cdUsrdef ?? ""),
          },
        ];
      });
    }, [structureCategoryList, setArticleList]);
    // C) fabricCategoryS 자동 보정 (KnitCategory & fabricCategory가 있을 때)
    useEffect(() => {
      const a0 = articleList?.[0];
      if (!a0) return;
      if (!a0.fabricCategory) return;
      if (knitCategoryList.length === 0) return;

      const found = knitCategoryList.find((k) => String(k.cdSysdef) === String(a0.fabricCategory));
      const nextS = found?.fg1Syscode || ""; // 철자 주의: fg1Syscode

      if (nextS && a0.fabricCategoryS !== nextS) {
        setArticleList((prev) => [
          {
            ...prev[0],
            fabricCategoryS: nextS,
          },
        ]);
      }
    }, [articleList?.[0]?.fabricCategory, knitCategoryList]);
    const handleIncreaseQtyKeep = () => {
      setArticleList((prev) => {
        const currentQty = Number(prev[0]?.qtyKeep) || 0;
        const updatedItem = {...prev[0], qtyKeep: currentQty + 1};
        return [updatedItem];
      });
    };
    return (
      <>
        <Card
          className="form-grid"
          style={{
            border: "1px solid #ddd",
            transform: "translateY(-20px)",
            height: "300px", // 필요하면 높이 조정
            transition: "height 0.3s ease-in-out",
          }}
        >
          <Card.Body>
            <div className={"mt-n3"}>
              <div style={{fontWeight: "bold", fontSize: "14px", transform: "translateY(6px)"}}>
                BASIC
              </div>
              <div className="d-flex justify-content-end">
                <Button
                  variant={(articleList[0]?.ynConfirm || "N") === "Y" ? "primary" : "outline-primary"}
                  className={`sales-activity-button ${
                    (articleList[0]?.ynConfirm || "N") === "Y" ? "active-button" : ""
                  }`}
                  onClick={() => handleArticleChange("ynConfirm", "Y")}
                >
                  확정
                </Button>
                <Button
                  variant={(articleList[0]?.ynConfirm || "N") === "N" ? "primary" : "outline-primary"}
                  className={`sales-activity-button ${
                    (articleList[0]?.ynConfirm || "N") === "N" ? "active-button" : ""
                  }`}
                  onClick={() => handleArticleChange("ynConfirm", "N")}
                >
                  미확정
                </Button>
              </div>
            </div>

            <Row>
              {/* Fabric Name */}
              <Col md={12}>
                <div className="fg-row">
                  <label className="fg-label required">FABRIC NAME</label>
                  <input
                    type="text"
                    name="nmFabric"
                    className="form-control fg-control fg-control"
                    autoComplete="off"
                    value={articleList[0]?.nmFabric || ""}
                    onChange={(e) => handleArticleChange("nmFabric", e.target.value)}
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

              {/* Style# */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label required">STYLE#</label>
                  <input
                    type="text"
                    name="noSample"
                    className="form-control fg-control"
                    autoComplete="off"
                    value={articleList[0]?.noSample || ""}
                    onChange={(e) => handleArticleChange("noSample", e.target.value)}
                  />
                </div>
              </Col>

              {/* LOT# */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label">LOT#</label>
                  <input
                    type="text"
                    name="noLot"
                    className="form-control fg-control"
                    autoComplete="off"
                    value={articleList[0]?.noLot || ""}
                    onChange={(e) => handleArticleChange("noLot", e.target.value)}
                  />
                </div>
              </Col>

              {/* Supplier */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label">SUPPLIER</label>
                  <FormControl
                    name="noSupplierArticle"
                    type="text"
                    className="form-control fg-control text-center"
                    autoComplete="off"
                    value={articleList[0]?.noSupplierArticle || ""}
                    onChange={(e) => handleArticleChange("noSupplierArticle", e.target.value)}
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

              {/* BUYER */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label">BUYER</label>
                  <input
                    type="text"
                    name={"cdBuyer"}
                    className="form-control fg-control text-center"
                    autoComplete="off"
                    value={articleList[0]?.nmBuyer}
                    onChange={(e) => handleArticleChange("cdBuyer", e.target.value)}
                  />
                  <ButtonComponent
                    type="button"
                    className="fg-btn"
                    iClassName="ti-search"
                    txt={""}
                    onClick={() => setIsShowBuyerPopup(true)}
                  />
                </div>
              </Col>
              {/* Fabric Division */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label">FABRIC DIVISION</label>
                  <div className={"position-relative w-100"}>
                    <select
                      name="fabricDivision"
                      className="form-control fg-control text-center"
                      value={articleList[0]?.fabricDivision || ""}
                      onChange={(e) => handleArticleChange("fabricDivision", e.target.value)}
                    >
                      {fabricDivisionList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>

              {/* Product Type */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label">PRODUCT TYPE</label>
                  <div className={"position-relative w-100"}>
                    <select
                      name="productType"
                      className="form-control fg-control text-center"
                      value={articleList[0]?.productType || ""}
                      onChange={(e) => handleArticleChange("productType", e.target.value)}
                    >
                      {productTypeList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>

              {/* Fabric Type */}
              <Col md={3}>
                <div className="fg-row">
                  <label className="fg-label required">FABRIC TYPE</label>
                  <div className={"position-relative w-100"}>
                    <select
                      name="fabricType"
                      className="form-control fg-control text-center"
                      value={articleList[0]?.fabricType || ""}
                      onChange={(e) => handleArticleChange("fabricType", e.target.value)}
                    >
                      {fabricTypeList.map((item, index) => (
                        <option key={index} value={item.cdSysdef}>
                          {item.nmSysdef}
                        </option>
                      ))}
                    </select>
                    <IconComponent
                      className={`mdi ${
                        openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                      } icon-chevron`}
                    />
                  </div>
                </div>
              </Col>

              <>
                {/* Knit Category */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label required">KNIT CATEGORY</label>
                    <div className={"position-relative w-100"}>
                      <select
                        className="form-control fg-control text-center"
                        name={"fabricCategory"}
                        style={{transform: "translateY(0px)"}}
                        value={articleList[0]?.fabricCategory || ""}
                        onChange={(e) => {
                          const selectedItem = knitCategoryList.find((item) => item.cdSysdef === e.target.value);
                          const selectedNmSysdef = selectedItem?.nmSysdef || "";
                          const selectedFg1SysCode = selectedItem?.fg1Syscode || "";
                          handleArticleChange("fabricCategory", e.target.value);
                          handleArticleChange("fabricCategoryS", selectedFg1SysCode);

                          setSearchStructureCategoryParams((prev) => ({
                            ...prev,
                            cdFlag1: selectedNmSysdef,
                            cdField: "CZ_CA02104",
                            cdSysdef: "",
                          }));
                        }}
                      >
                        {knitCategoryList.map((item, index) => (
                          <option key={index} value={item.cdSysdef}>
                            {item.nmSysdef}
                          </option>
                        ))}
                      </select>
                      <IconComponent
                        className={`mdi ${
                          openSelect === "category" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    </div>
                  </div>
                </Col>

                {/* Structure */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label required">STRUCTURE</label>
                    <div className="position-relative w-100">
                      <select
                        name={"fabricStructure"}
                        style={{transform: "translateY(0px)"}}
                        className="form-control fg-control text-center"
                        value={articleList[0]?.fabricStructure || ""}
                        onChange={(e) => {
                          const selectedItem = structureCategoryList.find((item) => item.cdSysdef === e.target.value);
                          const selectedCdUsrdef = selectedItem?.cdUsrdef || "";
                          handleArticleChange("fabricStructure", e.target.value);
                          handleArticleChange("fabricStructureS", selectedCdUsrdef);
                        }}
                      >
                        {structureCategoryList.map((item, index) => (
                          <option key={index} value={item.cdSysdef}>
                            {item.nmSysdef}
                          </option>
                        ))}
                      </select>
                      <IconComponent
                        className={`mdi ${
                          openSelect === "consultationType" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    </div>
                  </div>
                </Col>

                {/* Inch */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">SECOND STRUCTURE</label>
                    <input
                      type="text"
                      name="fabricSecondStructure"
                      className="form-control fg-control text-center"
                      value={articleList[0]?.fabricSecondStructure || ""}
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("fabricSecondStructure", e.target.value)}
                    />
                  </div>
                </Col>

                {/* Layer */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">LAYER</label>
                    <div className={"position-relative w-100"}>
                      <select
                        name={"cdLayer"}
                        style={{transform: "translateY(0px)"}}
                        className="form-control fg-control text-center"
                        value={articleList[0]?.cdLayer || ""}
                        onChange={(e) => handleArticleChange("cdLayer", e.target.value)}
                      >
                        <option value={""}/>
                        {layerList.map((item, index) => (
                          <option key={index} value={item.cdSysdef}>
                            {item.nmSysdef}
                          </option>
                        ))}
                      </select>
                      <IconComponent
                        className={`mdi ${
                          openSelect === "progressStatus" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    </div>
                  </div>
                </Col>

                {/* SQM */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">SQM</label>
                    <input
                      type="number"
                      name="wgtGsm"
                      className="form-control fg-control text-center"
                      autoComplete="off"
                      value={articleList[0]?.wgtGsm || ""}
                      onChange={(e) => handleArticleChange("wgtGsm", e.target.value)}
                    />
                  </div>
                </Col>

                {/* Inch */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">INCH</label>
                    <input
                      type="text"
                      name="fabricInch"
                      className="form-control fg-control text-center"
                      value={articleList[0]?.fabricInch || ""}
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("fabricInch", e.target.value)}
                    />
                  </div>
                </Col>

                {/* Color (placeholder) */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">COLOR C/N</label>
                    <InputGroup>
                      <FormControl
                        type="text"
                        name="cdColor"
                        value={articleList[0]?.cdColor || ""}
                        className="form-control fg-control"
                        autoComplete="off"
                        placeholder="CODE"
                        maxLength={10}
                        onChange={(e) => handleArticleChange("cdColor", e.target.value)}
                      />
                      <FormControl
                        type="text"
                        name="nmColor"
                        value={articleList[0]?.nmColor || ""}
                        className="form-control fg-control"
                        autoComplete="off"
                        placeholder="NAME"
                        maxLength={100}
                        onChange={(e) => handleArticleChange("nmColor", e.target.value)}
                      />
                    </InputGroup>
                  </div>
                </Col>

                {/* Input Date */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">INPUT DATE</label>
                    <input
                      type="date"
                      name={"dtHanger"}
                      value={formatDate(articleList[0]?.dtHanger) || DateUtils.today}
                      className="form-control fg-control text-center"
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("dtHanger", e.target.value.replace(/-/g, ""))}
                    />
                  </div>
                </Col>

                {/* Department */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">DEPARTMENT</label>
                    <input
                      type="text"
                      name={"cdDept"}
                      className="form-control fg-control text-center"
                      value={articleList[0]?.nmDept || ""}
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("cdDept", e.target.value)}
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

                {/* Manager */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">MANAGER</label>
                    <input
                      type="text"
                      name={"noEmp"}
                      value={articleList[0]?.userNm || ""}
                      className="form-control fg-control text-center"
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("noEmp", e.target.value)}
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

                {/* Fabric Finishing (Manager 다음) */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">FINISHING</label>
                    <input
                      type="text"
                      name={"fabricFinishing"}
                      className="form-control fg-control"
                      autoComplete="off"
                      value={articleList[0]?.fabricFinishing || ""}
                      onChange={(e) => handleArticleChange("fabricFinishing", e.target.value)}
                    />
                  </div>
                </Col>
                {/* SEASON */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">SEASON</label>
                    <div className={"position-relative w-100"}>
                      <select
                        name="fabricType"
                        className="form-control fg-control text-center"
                        value={articleList[0]?.cdSeason || ""}
                        onChange={(e) => handleArticleChange("cdSeason", e.target.value)}
                      >
                        <option value={""}/>
                        {seasonList.map((item, index) => (
                          <option key={index} value={item.cdSysdef}>
                            {item.nmSysdef}
                          </option>
                        ))}
                      </select>
                      <IconComponent
                        className={`mdi ${
                          openSelect === "workType" ? "mdi-chevron-up" : "mdi-chevron-down"
                        } icon-chevron`}
                      />
                    </div>
                  </div>
                </Col>

                {/* Fabric Finishing (Manager 다음) */}
                <Col md={3}>
                  <div className="d-flex align-items-center mb-2">
                    <label className="fg-label">KEEP QTY</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="qtyKeep"
                        value={articleList[0]?.qtyKeep || 0}
                        className="form-control fg-control text-center"
                        autoComplete="off"
                        style={{fontSize: "10px", height: "27px"}}
                        onChange={(e) => handleArticleChange("qtyKeep", e.target.value)}
                      />
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        style={{
                          fontSize: '10px',
                          height: '27px',
                          width: '27px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={handleIncreaseQtyKeep}
                      >
                        <i className="mdi mdi-plus font-12"/>
                      </button>
                    </div>
                  </div>
                </Col>
                {/* Sample Flags (체크박스) */}
                <Col md={9}>
                  <div className="d-flex align-items-center mb-2" style={{gap: 12, flexWrap: "wrap"}}>
                    <label className="search-custom-fabric-input-label-class" style={{width: "100px"}}>
                      SAMPLES
                    </label>

                    <div className="form-check" style={{fontSize: 12}}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ynDevelopSample"
                        checked={(articleList[0]?.ynDevelopSample || "N") === "Y"}
                        onChange={handleFlagToggle("ynDevelopSample")}
                      />
                      <label className="form-check-label" htmlFor="ynDevelopSample">
                        Develop smpl
                      </label>
                    </div>

                    <div className="form-check" style={{fontSize: 12}}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="yn1stSample"
                        checked={(articleList[0]?.yn1stSample || "N") === "Y"}
                        onChange={handleFlagToggle("yn1stSample")}
                      />
                      <label className="form-check-label" htmlFor="yn1stSample">
                        1st smpl
                      </label>
                    </div>

                    <div className="form-check" style={{fontSize: 12}}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ynColorSample"
                        checked={(articleList[0]?.ynColorSample || "N") === "Y"}
                        onChange={handleFlagToggle("ynColorSample")}
                      />
                      <label className="form-check-label" htmlFor="ynColorSample">
                        Color smpl
                      </label>
                    </div>

                    <div className="form-check" style={{fontSize: 12}}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ynReviseColorSample"
                        checked={(articleList[0]?.ynReviseColorSample || "N") === "Y"}
                        onChange={handleFlagToggle("ynReviseColorSample")}
                      />
                      <label className="form-check-label" htmlFor="ynReviseColorSample">
                        Revise Color smpl
                      </label>
                    </div>
                    <div className="form-check" style={{fontSize: 12}}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ynAppSample"
                        checked={(articleList[0]?.ynAppSample || "N") === "Y"}
                        onChange={handleFlagToggle("ynAppSample")}
                      />
                      <label className="form-check-label" htmlFor="ynAppSample">
                        App smpl
                      </label>
                    </div>
                  </div>
                </Col>
                {/* Input Date */}
                <Col md={3}>
                  <div className="fg-row">
                    <label className="fg-label">PRICE DATE</label>
                    <input
                      type="date"
                      name={"dtPrice"}
                      value={formatDate(articleList[0]?.dtPrice) || DateUtils.today}
                      className="form-control fg-control text-center"
                      autoComplete="off"
                      onChange={(e) => handleArticleChange("dtPrice", e.target.value.replace(/-/g, ""))}
                    />
                  </div>
                </Col>
              </>
            </Row>
          </Card.Body>
        </Card>

        {/* User 모달 */}
        <UserPopupComponent
          cdDept={articleList[0]?.cdDept || ""}
          nmDept={""}
          isShowUserPopup={isShowUserPopup}
          setIsShowUserPopup={setIsShowUserPopup}
          onClose={() => setIsShowUserPopup(false)}
          onUserSelect={(user: PagingUserListRes) => {
            setArticleList((prev) => {
              const updated = {
                ...prev[0],
                userNm: user.userNm,
                noEmp: user.userId,
                cdDept: user.cdDept,
                nmDept: user.nmDept,
              };
              return [updated];
            });
          }}
        />

        {/* 부서 모달 */}
        <DeptPopupComponent
          isShowDeptPopup={isShowDeptPopup}
          setIsShowDeptPopup={setIsShowDeptPopup}
          onClose={() => setIsShowDeptPopup(false)}
          onDeptSelect={(dept: DeptListRes) => {
            setArticleList((prev) => {
              const updated = {...prev[0], cdDept: dept.cdDept, nmDept: dept.nmDept};
              return [updated];
            });
          }}
        />

        {/* FabricName 모달 */}
        <FabricPopupComponent
          nmFabric={articleList[0]?.nmFabric || ""}
          isShowFabricPopup={isShowFabricPopup}
          setIsShowFabricPopup={setIsShowFabricPopup}
          onClose={() => setIsShowFabricPopup(false)}
          onFabricSelect={(fabric: FabricInfoRes) => {
            handleFabricSelect(fabric);
          }}
        />
        {/* BUYER 모달 */}
        <BuyerPopupComponent
          isShowBuyerPopup={isShowBuyerPopup}
          setIsShowBuyerPopup={setIsShowBuyerPopup}
          onClose={() => setIsShowBuyerPopup(false)}
          onBuyerDoubleClickSelect={(b: PisBuyerListRes) => {
            setArticleList((prev) => {
              const updated = {...prev[0], cdBuyer: b.cdBuyer, nmBuyer: b.nmBuyer};
              return [updated];
            });
          }}
        />

        {/* Supplier 모달 */}
        <SupplierPopupComponent
          cdPartner={articleList[0]?.cdSupplier || ""}
          isShowSupplierPopup={isShowSupplierPopup}
          setIsShowSupplierPopup={setIsShowSupplierPopup}
          onClose={() => setIsShowSupplierPopup(false)}
          onSupplierSelect={(partner: PartnerListRes) => {
            setArticleList((prev) => {
              const updated = {...prev[0], cdSupplier: partner.cdPartner, noSupplierArticle: partner.lnPartner};
              return [updated];
            });
          }}
        />
      </>
    );
  }
);

export default FabricLibraryRegisterBasicInfo;
