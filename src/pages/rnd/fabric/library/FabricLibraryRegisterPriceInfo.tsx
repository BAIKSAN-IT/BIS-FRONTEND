import React, {memo, useEffect, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css"; // 스타일 import
/*component */
import IconComponent from "@components/common/IconComponent";

/* redux */
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {SaveRndArticleReq} from "@redux/rnd/RndSlice";
import {CommonNeoeCodeRes, getCommonNeoeCodeDtlList} from "@redux/common/commonSlice";

/* constants */
import {Payload} from "@constants/common/common";

/* utils */
import {isEmpty} from "@utils/CommonUtil";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
}

const FabricLibraryRegisterPriceInfo = memo(({articleList, setArticleList}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const {user} = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const [currencyList, setCurrencyList] = useState<CommonNeoeCodeRes[]>([]);

  // 2. 각 검색 파라미터 상태 (cdFlag1은 onChange에서 e.target.value로 업데이트)
  const [searchCurrencyParams, setSearchCurrencyParams] = useState({
    cdCompany: user?.companyId || "",
    cdField: "CZ_FA00090",
    cdSysdef: "",
    cdFlag1: "",
    fg1Syscode: "",
  });

  const fetchCurrencyList = () => {
    dispatch(getCommonNeoeCodeDtlList({...searchCurrencyParams})).then((res: any) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setCurrencyList(payload.data);
      } else {
        setCurrencyList([]);
      }
    });
  };

  useEffect(() => {
    fetchCurrencyList();
  }, [searchCurrencyParams]);

  const handleArticleChange = (field: keyof SaveRndArticleReq, value: string) => {
    setArticleList((prev) => {
      const updatedItem = {...prev[0], [field]: value};
      return [updatedItem]; // 새로운 배열로 만들어서 memo 감지되도록
    });
  };
  return (
    <>
      {/* Price */}
      <Card style={{transform: "translateY(-30px)", height: "60px", width: "50%"}}>
        <Card.Body>
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "10px",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            PRICE
          </div>
          <Row>
            {/* Currency */}
            <Col md={3} style={{}}>
              <div className="system-form-group d-flex align-items-center justify-content-between">
                <label className="search-custom-fabric-input-label-class"
                       style={{width: "80px", transform: "translateY(-3px)"}}>
                  CUR
                </label>
                <div className={"position-relative w-100"}>
                  <select
                    name="cdCurrency"
                    className="form-control text-center"
                    value={articleList[0]?.cdCurrency || ""}
                    onChange={(e) => handleArticleChange("cdCurrency", e.target.value)}
                  >
                    {currencyList.map((item, index) => (
                      <option key={index} value={item.cdSysdef}>
                        {item.nmSysdef}
                      </option>
                    ))}
                  </select>
                  <IconComponent className={`mdi mdi-chevron-down icon-chevron`}/>
                </div>
              </div>
            </Col>
            {/* YARD */}
            <Col md={3} style={{}}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">YD</label>
                <input
                  type="text"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px"}}
                  autoComplete="off"
                  name={"pricePerYard"}
                  value={articleList[0]?.pricePerYard || ""}
                  onChange={(e) => handleArticleChange("pricePerYard", e.target.value)}
                />
              </div>
            </Col>
            {/* METER 입력 필드 */}
            <Col md={3} style={{}}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">MT</label>
                <input
                  type="text"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px"}}
                  autoComplete="off"
                  name={"pricePerMeter"}
                  value={articleList[0]?.pricePerMeter || ""}
                  onChange={(e) => handleArticleChange("pricePerMeter", e.target.value)}
                />
              </div>
            </Col>
            {/* KG */}
            <Col md={3} style={{}}>
              <div className="d-flex align-items-center mb-2">
                <label className="search-custom-fabric-input-label-class">KG</label>
                <input
                  type="text"
                  className="form-control text-end"
                  style={{height: "27px", fontSize: "10px"}}
                  autoComplete="off"
                  name={"pricePerWight"}
                  value={articleList[0]?.pricePerWight || ""}
                  onChange={(e) => handleArticleChange("pricePerWight", e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default FabricLibraryRegisterPriceInfo;
