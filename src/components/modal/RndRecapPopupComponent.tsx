// src/components/modal/RndRecapPopupComponent.tsx
import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { FormControl, Modal, Row, Col, Card, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getRndArticleRecapAllList, RndArticleRecapReq, RndArticleRecapAllRes } from "../../redux/rnd/RecapSlice";
import { Payload } from "../../constants/common/common";
import { isEmpty } from "../../utils/CommonUtil";
import { DateUtils } from "../../utils/dateUtils";

import ButtonComponent from "../common/ButtonComponent";
import PisRndTable from "../table/PisRndTable";
import RecapListTableColumns from "../../pages/rnd/fabric/recap/RecapListTableColumns";
import { useTranslation } from "react-i18next";
import IconComponent from "../common/IconComponent";

interface Props {
  isShow: boolean;
  setIsShow: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
}

const RndRecapPopupComponent = memo(({ isShow, onClose }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.Auth.user);

  /** 검색 파라미터 */
  const [searchParams, setSearchParams] = useState<RndArticleRecapReq>({
    cdCompany: user?.companyId || "1000",
    startDate: DateUtils.oneMonthAgo,
    endDate: DateUtils.today,
    cdWorker: "",
    nmBuyer: "",
    nmBrand: "",
    cdSeason: "",
    topic: "",
    remark: "",
    seqArticle: "",
    seq: 0,
  });

  const [recapAllList, setRecapAllList] = useState<RndArticleRecapAllRes | null>(null);
  const [recapList, setRecapList] = useState<any[]>([]);
  const [checkedRows, setCheckedRows] = useState<any[]>([]);

  /** 조회 함수 */
  const fetchRndArticleRecapAllList = useCallback(() => {
    const params: RndArticleRecapReq = {
      ...searchParams,
      startDate: searchParams.startDate?.replaceAll("-", ""), // yyyy-mm-dd → yyyymmdd
      endDate: searchParams.endDate?.replaceAll("-", ""),
    };

    dispatch(getRndArticleRecapAllList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        const data = payload.data as RndArticleRecapAllRes;
        setRecapAllList(data);
        setRecapList(data.rndArticleRecapList || []);
        setCheckedRows([]);
      } else {
        setRecapAllList(null);
        setRecapList([]);
        setCheckedRows([]);
      }
    });
  }, [dispatch, searchParams]);

  /** 팝업 처음 열릴 때만 조회 */
  useEffect(() => {
    if (isShow) {
      fetchRndArticleRecapAllList();
    }
    // ❌ searchParams는 dependency에서 제거
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShow]);

  /** Enter 입력 시 조회 */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchRndArticleRecapAllList();
    }
  };

  /** input 값 변경 핸들러 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  /** 테이블 컬럼 정의 */
  /*const columns = useMemo(() => RecapListTableColumns(recapAllList?.rndArticleFileList), [recapAllList]);*/

  /** 체크박스 제어 */
  const onCheckboxChange = (row: any, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedRows((prev) => {
      const exists = prev.some((r) => r.seqArticle === row.seqArticle);
      return exists ? prev.filter((r) => r.seqArticle !== row.seqArticle) : [...prev, row];
    });
  };

  return (
    /*<Modal show={isShow} onHide={onClose} size="xl" centered>
      {/!* 헤더 *!/}
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
        <Modal.Title className="modal-search-custom-title-class">{t("Recap List")}</Modal.Title>
      </Modal.Header>

      {/!* 검색 조건 *!/}
      <Card
        className="form-grid"
        style={{
          border: "1px solid #ddd",
          height: "120px", // 필요하면 높이 조정
        }}
      >
        <Card.Body>
          <Row>
            {/!* Input Date *!/}
            <Col md={6} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Input Date</label>
                <InputGroup>
                  <FormControl
                    type="date"
                    name="startDate"
                    value={searchParams.startDate}
                    className="form-control text-center fg-control"
                    autoComplete="off"
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                  />
                  <FormControl
                    type="date"
                    name="endDate"
                    value={searchParams.endDate}
                    className="form-control text-center fg-control"
                    autoComplete="off"
                    min={searchParams.startDate}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                  />
                </InputGroup>
              </div>
            </Col>

            {/!* Manager *!/}
            <Col md={3} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Manager</label>
                <FormControl
                  type="text"
                  name="cdWorker"
                  value={searchParams.cdWorker}
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* Buyer *!/}
            <Col md={3} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Buyer</label>
                <FormControl
                  type="text"
                  name="nmBuyer"
                  value={searchParams.nmBuyer}
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* Brand *!/}
            <Col md={3} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Brand</label>
                <FormControl
                  type="text"
                  name="nmBrand"
                  value={searchParams.nmBrand}
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* Season *!/}
            <Col md={3} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Season</label>
                <FormControl
                  type="text"
                  name="cdSeason"
                  value={searchParams.cdSeason}
                  className="text-center fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* Topic *!/}
            <Col md={6} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Topic</label>
                <FormControl
                  type="text"
                  name="topic"
                  value={searchParams.topic}
                  className="text-left fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* Remark *!/}
            <Col md={6} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <label className="fg-label">Remark</label>
                <FormControl
                  type="text"
                  name="remark"
                  value={searchParams.remark}
                  className="text-left fg-control"
                  autoComplete="off"
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </Col>

            {/!* 버튼 *!/}
            <Col md={2} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="ti-search"
                  txt={t("common.search.btn")}
                  onClick={fetchRndArticleRecapAllList}
                />
              </div>
            </Col>
            <Col md={2} style={{ transform: "translateY(-15px)" }}>
              <div className="fg-row">
                <ButtonComponent
                  type="button"
                  className="fg-btn"
                  iClassName="fe-x"
                  txt={t("common.close.btn")}
                  onClick={onClose}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/!* 테이블 *!/}
      <div className="modal-table-container px-2">
        <PisRndTable
          columns={columns}
          data={recapList}
          theadClass="table-custom-rnd-light text-center font-12"
          tableClass="table-custom-rnd-background text-center font-12"
          isSortable
          isSelectable
          isOnlySelected
          checkedRows={checkedRows}
          onCheckboxChange={onCheckboxChange}
        />
      </div>
    </Modal>*/
    <></>
  );
});

export default RndRecapPopupComponent;
