import React, { useEffect, useState } from "react";
import { Card, Col, Nav, Row, Tab, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";

import { isEmpty, monthFormat, yearFormat } from "../../utils/CommonUtil";
import { cboAREA, cboAST_MCODE, cboSTATUS } from "../../constants";
import { getAssetChangeHistory, getAssetInfo } from "../../redux/asset/assetSlice";

import { QrReader } from "react-qr-reader";
import TabletTopCommonPopup from "../tablet/popup/TabletTopCommonPopup";

const BasicAssetElements = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [astCode, setAstCode] = useState<string>("");

  const [showScanner, setShowScanner] = useState(false);
  // QR 스캔 성공 콜백
  const handleScan = (result: any, error: any) => {
    if (result?.text) {
      setShowScanner(false);
      setAstCode(result.text);
      dispatch(getAssetInfo({ astCode: result.text }));
      dispatch(getAssetChangeHistory({ astCode: result.text }));
    }
  };
  return (
    <>
      <Card style={{ marginTop: "20px" }}>
        <Tab.Container defaultActiveKey="info">
          <Row className="align-items-center px-3 py-2">
            <Col xs="auto">
              <strong>기기정보(라벨)</strong>
            </Col>
            <Col>
              <input
                type="text"
                className="form-control"
                value={astCode}
                readOnly
                onClick={() => window.ui.modal.open("headerKeyPad")}
                style={{ cursor: "pointer" }}
              />
            </Col>
            <Col xs="auto">
              <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
                SCAN
              </button>
            </Col>
          </Row>

          {/* ───────── 키패드 팝업 ───────── */}
          <TabletTopCommonPopup
            setSearchValue={(val) => {
              setAstCode(val);
              dispatch(getAssetInfo({ astCode: val }));
              dispatch(getAssetChangeHistory({ astCode: val }));
            }}
          />

          {/* ───────── 카메라 팝업 ───────── */}
          {showScanner && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div style={{ position: "relative", width: "90%", maxWidth: 400 }}>
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  scanDelay={300}
                  onResult={handleScan}
                  containerStyle={{ width: "100%" }}
                  videoContainerStyle={{ width: "100%" }}
                />
                <button
                  onClick={() => setShowScanner(false)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(255,255,255,0.8)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <Nav variant="pills" as="ul" className="nav nav-pills nav-fill navtab-bg">
            <Nav.Item as="li" className="nav-tabs">
              <Nav.Link eventKey="info" className="nav-link cursor-pointer">
                1. 자산 정보
              </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" className="nav-tabs">
              <Nav.Link eventKey="change" className="nav-link cursor-pointer">
                2. 변경 이력
              </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" className="nav-tabs">
              <Nav.Link eventKey="error" className="nav-link cursor-pointer">
                3. 장애 이력
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content style={{ paddingTop: "0px" }}>
            <Tab.Pane eventKey="info">
              <UserAssetInfo />
            </Tab.Pane>
            <Tab.Pane eventKey="change">
              <UserAssetChangeHistory />
            </Tab.Pane>
            <Tab.Pane eventKey="error">
              <UserAssetErrorHistory />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card>
    </>
  );
};

const UserAssetInfo = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [astCode, setAstCode] = useState<string>("");
  const { asset } = useSelector((state: RootState) => ({
    asset: state.Asset.asset,
  }));

  useEffect(() => {
    if (!isEmpty(astCode)) {
      dispatch(getAssetInfo({ astCode }));
      dispatch(getAssetChangeHistory({ astCode }));
    }
  }, [astCode, dispatch]);
  return (
    <Card>
      <Card.Body>
        <table
          style={{ fontSize: "11px", textAlign: "center" }}
          className="table table-bordered mb-0 table-light table-centered"
        >
          <thead>
            <tr>
              <th className="thArea table-success" style={{ textAlign: "left", paddingLeft: "15px" }} colSpan={2}>
                1. 사용자 정보
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="tdArea" style={{ width: "35%" }}>
                사업장
              </td>
              <td className="tdArea">{cboAREA[asset?.area!]}</td>
            </tr>
            <tr>
              <td className="tdArea">자산번호</td>
              <td className="tdArea">{asset?.ast_CODE}</td>
            </tr>
            <tr>
              <td className="tdArea">대분류</td>
              <td className="tdArea">{cboAST_MCODE[asset?.ast_MCODE!]}</td>
            </tr>
            <tr>
              <td className="tdArea">사용자</td>
              <td className="tdArea">{asset?.nm_EMP}</td>
            </tr>
            <tr>
              <td className="tdArea">부서명</td>
              <td className="tdArea">{asset?.nm_DEPT}</td>
            </tr>
            <tr>
              <td className="tdArea">사용 시작일</td>
              <td className="tdArea">{yearFormat(asset?.use_DATE!)}</td>
            </tr>
            <tr>
              <td className="tdArea">제품상태</td>
              <td className="tdArea">{cboSTATUS[asset?.status!]}</td>
            </tr>
          </tbody>
        </table>

        <table
          style={{ fontSize: "11px", textAlign: "center" }}
          className="table table-bordered mb-0 table-secondary table-centered"
        >
          <thead>
            <tr>
              <th className="thArea table-success" style={{ textAlign: "left", paddingLeft: "15px" }} colSpan={2}>
                2. 제품 정보
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="tdArea" style={{ width: "35%" }}>
                모델명
              </td>
              <td className="tdArea">{asset?.model}</td>
            </tr>
            <tr>
              <td className="tdArea">제품사양</td>
              <td className="tdArea">{asset?.detail}</td>
            </tr>
            <tr>
              <td className="tdArea">SERIAL</td>
              <td className="tdArea">{asset?.serialno}</td>
            </tr>
          </tbody>
        </table>

        <table
          style={{ fontSize: "11px", textAlign: "center" }}
          className="table table-bordered mb-0 table-light table-centered"
        >
          <thead>
            <tr>
              <th className="thArea table-success" style={{ textAlign: "left", paddingLeft: "15px" }} colSpan={2}>
                3. 구입 및 렌탈정보
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="tdArea" style={{ width: "35%" }}>
                구입처/렌탈
              </td>
              <td className="tdArea">{asset?.buy_COMPNM}</td>
            </tr>
            <tr>
              <td className="tdArea">구입일자</td>
              <td className="tdArea">{yearFormat(asset?.buy_DATE!)}</td>
            </tr>
            <tr>
              <td className="tdArea">제조일자</td>
              <td className="tdArea">{monthFormat(asset?.pr_YYMM!)}</td>
            </tr>
            <tr>
              <td className="tdArea">렌탈기간</td>
              <td className="tdArea">{`${yearFormat(asset?.start_RDATE!)} ~ ${yearFormat(asset?.end_RDATE!)}`}</td>
            </tr>
          </tbody>
        </table>

        {asset?.ast_MCODE === "00" && (
          <table
            style={{ fontSize: "11px", textAlign: "center" }}
            className="table table-bordered mb-0 table-secondary table-centered"
          >
            <thead className="table-light">
              <tr>
                <th className="thArea table-success" style={{ textAlign: "left", paddingLeft: "15px" }} colSpan={5}>
                  4. 본체(노트북)
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="tdArea" style={{ width: "35%" }}>
                  OS
                </td>
                <td className="tdArea" colSpan={4}>
                  {asset?.os}
                </td>
              </tr>
              <tr>
                <td className="tdArea">CPU</td>
                <td className="tdArea">{asset?.cpu}</td>
              </tr>
              <tr>
                <td className="tdArea">HDD</td>
                <td className="tdArea">{asset?.hdd}</td>
              </tr>
              <tr>
                <td className="tdArea">RAM</td>
                <td className="tdArea">{asset?.ram}</td>
              </tr>
              <tr>
                <td className="tdArea">IP</td>
                <td className="tdArea">{`${asset?.ip1}.${asset?.ip2}.${asset?.ip3}.${asset?.ip4}`}</td>
              </tr>
            </tbody>
          </table>
        )}

        <table
          style={{ fontSize: "11px", textAlign: "center" }}
          className={`table table-bordered mb-0 ${
            asset?.ast_MCODE === "00" ? "table-light " : "table-secondary "
          }table-centered`}
        >
          <thead>
            <tr>
              <th className="thArea table-success" style={{ textAlign: "left", paddingLeft: "15px" }} colSpan={2}>
                {`${asset?.ast_MCODE === "00" ? "5" : "4"}. 참고사항`}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="tdArea" style={{ width: "35%" }}>
                비고
              </td>
              <td className="tdArea" style={{ wordBreak: "break-all" }}>
                {asset?.bigo}
              </td>
            </tr>
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

const UserAssetChangeHistory = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [searchParams, setSearchParams] = useSearchParams();

  const { assetChangeHistory } = useSelector((state: RootState) => ({
    assetChangeHistory: state.Asset.assetChangeHistory as AssetHistory[],
  }));

  interface AssetHistory {
    ast_SEQ: string;
    nm_EMP: string;
    area: number;
    nm_DEPT: string;
    use_DATE: string;
    start_RDATE: string;
    end_RDATE: string;
    status: string;
    pr_REMARK: string;
    seq_BIGO: string;
  }

  useEffect(() => {
    const astCode = searchParams.get("ast_code");

    if (!isEmpty(astCode)) {
      let params = {
        astCode: astCode as string,
      };

      dispatch(getAssetChangeHistory(params));
    }
  }, [searchParams]);

  return (
    <Card style={{ fontSize: "11px" }}>
      <Card.Body>
        <h4 className="header-title" style={{ fontSize: "13px" }}>
          변경 이력
        </h4>

        <div className="table-responsive">
          <Table className="table-bordered" striped style={{ textAlign: "center" }}>
            <thead className="table-success">
              <tr style={{ whiteSpace: "nowrap" }}>
                <th className="historyArea">일련번호</th>
                <th className="historyArea">사용자</th>
                <th className="historyArea">사용처</th>
                <th className="historyArea">부서명</th>
                <th className="historyArea">사용일자</th>
                <th className="historyArea">렌탈시작일</th>
                <th className="historyArea">렌탈종료일</th>
                <th className="historyArea">상태</th>
                <th className="historyArea">이전사용자</th>
                <th className="historyArea">참고사항</th>
              </tr>
            </thead>

            <tbody style={{ whiteSpace: "nowrap" }}>
              {assetChangeHistory?.map((assetHistory, idx) => {
                return (
                  <tr key={idx}>
                    <th className="historyArea" scope="row">
                      {assetHistory.ast_SEQ}
                    </th>
                    <td className="historyArea">{assetHistory.nm_EMP}</td>
                    <td className="historyArea">{cboAREA[assetHistory?.area]}</td>
                    <td className="historyArea">{assetHistory.nm_DEPT}</td>
                    <td className="historyArea">{yearFormat(assetHistory.use_DATE)}</td>
                    <td className="historyArea">{yearFormat(assetHistory.start_RDATE)}</td>
                    <td className="historyArea">{yearFormat(assetHistory.end_RDATE)}</td>
                    <td className="historyArea">{cboSTATUS[assetHistory.status]}</td>
                    <td className="historyArea">{assetHistory.pr_REMARK}</td>
                    <td className="historyArea">{assetHistory.seq_BIGO}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

const UserAssetErrorHistory = () => {
  const { assetChangeHistory } = useSelector((state: RootState) => ({
    assetChangeHistory: state.Asset.assetChangeHistory,
  }));

  return (
    <Card style={{ fontSize: "11px" }}>
      <Card.Body>
        <h4 className="header-title" style={{ fontSize: "13px" }}>
          장애 이력
        </h4>

        <div className="table-responsive">
          <Table className="table-bordered" striped style={{ textAlign: "center" }}>
            <thead className="table-danger">
              <tr style={{ whiteSpace: "nowrap" }}>
                <th className="historyArea">일련번호</th>
                <th className="historyArea">사용자</th>
                <th className="historyArea">사용처</th>
                <th className="historyArea">부서명</th>
                <th className="historyArea">사용일자</th>
                <th className="historyArea">렌탈시작일</th>
                <th className="historyArea">렌탈종료일</th>
                <th className="historyArea">상태</th>
                <th className="historyArea">이전사용자</th>
                <th className="historyArea">참고사항</th>
              </tr>
            </thead>

            <tbody style={{ whiteSpace: "nowrap" }}>
              {assetChangeHistory?.map((assetHistory, idx) => {
                return (
                  <tr key={idx}>
                    <th className="historyArea" scope="row">
                      {assetHistory.ast_SEQ}
                    </th>
                    <td className="historyArea">{assetHistory.nm_EMP}</td>
                    <td className="historyArea">{cboAREA[assetHistory?.area]}</td>
                    <td className="historyArea">{assetHistory.nm_DEPT}</td>
                    <td className="historyArea">{yearFormat(assetHistory.use_DATE)}</td>
                    <td className="historyArea">{yearFormat(assetHistory.start_RDATE)}</td>
                    <td className="historyArea">{yearFormat(assetHistory.end_RDATE)}</td>
                    <td className="historyArea">{cboSTATUS[assetHistory.status]}</td>
                    <td className="historyArea">{assetHistory.pr_REMARK}</td>
                    <td className="historyArea">{assetHistory.seq_BIGO}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

const AssetDetails = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    window.addEventListener(
      "load",
      function () {
        setTimeout(window.scrollTo, 0, 0, 1);
      },
      false
    );
  }, []);

  return (
    <React.Fragment>
      <BasicAssetElements />
    </React.Fragment>
  );
};
export default AssetDetails;
