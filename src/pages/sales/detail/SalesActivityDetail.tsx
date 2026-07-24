import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import {
  downloadSalesActivityFile,
  getSalesActivityAllList,
  getSalesActivitySumList,
  SalesActivityAllListRes,
  SalesActivitySaveReq,
  SalesActivitySumListRes,
} from "../../../redux/sales/SalesActivitySlice";
import { Payload } from "../../../constants/common/common";
import { isEmpty } from "../../../utils/CommonUtil";
import IconComponent from "../../../components/common/IconComponent";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { useTranslation } from "react-i18next";

interface Props {
  salesActivitySaveReq?: SalesActivitySaveReq | null;
  isShowActivityDetailPopup?: boolean;
  setIsShowActivityDetailPopup?: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
}

const SalesActivityDetail: React.FC<Props> = ({
  salesActivitySaveReq,
  isShowActivityDetailPopup,
  setIsShowActivityDetailPopup,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const [salesActivitySumList, setSalesActivitySumList] = useState<SalesActivitySumListRes[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ noDocu: string; seqDocu: string } | null>(null); // row클릭

  const initialSearchDetailParams = {
    cdCompany: user?.companyId || "1000",
    keywords: "",
    nmVendor: "",
    descAttend: "",
    nmEmp: "",
    cdDept: "",
    nmDept: "",
    dtMeetFrom: "",
    dtMeetTo: "",
    nmWork: "",
    nmDetail: "",
    progress: "",
    gwStatus: "",
    noDocuSeq: salesActivitySaveReq?.saveActivityList[0]?.noDocu || selectedDoc?.noDocu || "",
    purpose: "",
    nmBuyer: "",
    nmBrand: "",
    nmItem: "",
    dtInputFrom: "",
    dtInputTo: "",
    nmActivity: "",
    nmNameVendor: "",
    pLang: "KOR",
  };

  const [searchDetailParams, setSearchDetailParams] = useState(initialSearchDetailParams); // 사용자 목록 검색 조건

  // 초기 상태 정의
  const initialAll: SalesActivityAllListRes = {
    activityList: [],
    activityAttendList: [],
    activityContentsList: [],
    activityCostList: [],
    activityFileList: [],
    activityOrderList: [],
  };

  const [salesActivityAll, setSalesActivityAll] = useState<SalesActivityAllListRes>(initialAll);
  // 공통 스타일
  const tableStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse",
    overflowY: "auto",
    tableLayout: "fixed",
    marginBottom: 0,
  };
  const cellStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: 4,
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "normal",
  };
  const labelStyle: React.CSSProperties = { ...cellStyle, backgroundColor: "#f1f1f1" };
  const sectionStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: "#bbdaf6",
    fontWeight: "bold",
    width: 120,
  };
  const selectedSumRow =
    salesActivitySumList.find((row) => row.noDocu === selectedDoc?.noDocu && row.seqDocu === selectedDoc?.seqDocu) ??
    salesActivitySumList[0]; // 초기 진입 시 첫 항목 fallback

  // 1) 기본정보 rows
  const basicInfoRows = [
    [
      { text: "기본정보", section: true, rowSpan: 2 },
      { text: "문서번호", header: true, align: "left" },
      { text: selectedSumRow?.noDocu || "" },
      { text: "업무구분", header: true, align: "left" },
      { text: selectedSumRow?.nmWork || "" },
      { text: "상세분류", header: true, align: "left" },
      { text: selectedSumRow?.nmDetail || "" },
      { text: "상담유형", header: true, align: "left" },
      { text: selectedSumRow?.nmActivity || "" },
    ],
    [
      { text: "Keywords", header: true, align: "left" },
      { text: selectedSumRow?.keywords || "" },
      { text: "상담일자", header: true, align: "left" },
      { text: selectedSumRow?.dtMeeting || "" },
      { text: "담당자", header: true, align: "left" },
      { text: selectedSumRow?.nmEmp || "" },
      { text: "결재상태", header: true, align: "left" },
      { text: selectedSumRow?.gwStatus || "" },
    ],
  ];

  const fetchSalesActivitySumList = async () => {
    const defaultParams = {
      ...searchDetailParams,
      noDocuSeq: salesActivitySaveReq?.saveActivityList[0]?.noDocu || "",
      cdCompany: salesActivitySaveReq?.saveActivityList[0]?.cdCompany || user?.companyId || "1000",
    };
    await dispatch(getSalesActivitySumList(defaultParams)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSalesActivitySumList(payload.data);
      } else {
        setSalesActivitySumList([]);
      }
    });
  };
  const fetchSalesActivityAllList = async () => {
    const params = {
      cdCompany: salesActivitySaveReq?.saveActivityList[0]?.cdCompany || "",
      noDocu: salesActivitySaveReq?.saveActivityList[0]?.noDocu || selectedDoc?.noDocu || "",
      seqDocu: salesActivitySaveReq?.saveActivityList[0]?.seqDocu || selectedDoc?.seqDocu || "",
    };

    await dispatch(getSalesActivityAllList(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        const activityAllData = payload.data as SalesActivityAllListRes;
        setSalesActivityAll(activityAllData);
      }
    });
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = (fileName: string) => {
    const noDocu = salesActivitySaveReq?.saveActivityList[0]?.noDocu || "";
    dispatch(downloadSalesActivityFile({ noDocu, fileName }))
      .unwrap()
      .then((res) => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("파일 다운로드에 실패했습니다."));
  };

  useEffect(() => {
    if (selectedDoc) {
      const params = {
        cdCompany: user?.companyId || "1000",
        noDocu: selectedDoc.noDocu,
        seqDocu: selectedDoc.seqDocu,
      };

      dispatch(getSalesActivityAllList(params)).then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          const activityAllData = payload.data as SalesActivityAllListRes;
          setSalesActivityAll(activityAllData);
        }
      });
    }
  }, [selectedDoc]);

  // 팝업 오픈 시 상세 조회
  useEffect(() => {
    if (isShowActivityDetailPopup) {
      setSalesActivityAll(initialAll);
      setSearchDetailParams(initialSearchDetailParams);
      setSelectedDoc(null);
      setSalesActivitySumList([]);
      fetchSalesActivityAllList();
      fetchSalesActivitySumList();
    }
  }, [isShowActivityDetailPopup]);
  // 팝업 닫힐 때 초기화
  useEffect(() => {
    if (!isShowActivityDetailPopup) {
      setSalesActivityAll(initialAll);
      setSearchDetailParams(initialSearchDetailParams);
      setSelectedDoc(null);
      setSalesActivitySumList([]);
    }
  }, [isShowActivityDetailPopup]);

  return (
    <Modal style={{ fontSize: "10px" }} show={isShowActivityDetailPopup} onHide={onClose} size="xl" centered>
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
        <Modal.Title className="modal-search-custom-title-class">{t("이전글 보기")}</Modal.Title>
      </Modal.Header>

      <Card style={{ backgroundColor: "#fff", marginTop: "1rem" }}>
        <Card.Body style={{ padding: "1rem", overflowX: "auto" }}>
          {/* 본문: 좌측(3) / 우측(9) */}
          <Row className="gx-0 gy-2">
            {/* 좌측 사이드바 */}
            <Col xs={12} md={3} lg={3} className="px-1">
              <div className="table-responsive">
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      {["DOCUNO", "SEQNO", "TITLE"].map((h, k) => (
                        <th key={k} style={labelStyle}>
                          {h}
                        </th>
                      ))}
                    </tr>
                    {salesActivitySumList.map((att, idx) => (
                      <tr
                        key={idx}
                        style={{
                          height: 20,
                          cursor: "pointer",
                          backgroundColor:
                            selectedDoc?.noDocu === att.noDocu && selectedDoc?.seqDocu === att.seqDocu
                              ? "#e0f7fa"
                              : undefined,
                        }}
                        onClick={() => {
                          setSelectedDoc({ noDocu: att.noDocu, seqDocu: att.seqDocu });
                        }}
                      >
                        <td style={{ ...cellStyle, textAlign: "left" }}>{att.noDocu}</td>
                        <td style={{ ...cellStyle, textAlign: "left" }}>{att.seqDocu}</td>
                        <td style={{ ...cellStyle, textAlign: "left" }}>{att.nmEmp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>

            {/* 우측 콘텐츠 */}
            <Col xs={12} md={9} lg={9} className="px-1">
              {/* 기본정보 */}
              <table style={tableStyle}>
                <tbody>
                  {basicInfoRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => {
                        const style = cell.section
                          ? sectionStyle
                          : cell.header
                          ? labelStyle
                          : {
                              ...cellStyle,
                              textAlign: cell.align || "left",
                            };

                        const props: any = { key: ci, style };
                        if (cell.rowSpan) props.rowSpan = cell.rowSpan;

                        return cell.section || cell.header ? (
                          <th {...props}>{cell.text}</th>
                        ) : (
                          <td {...props}>{cell.text}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 참가자 */}
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th rowSpan={salesActivityAll.activityAttendList.length + 2} style={sectionStyle}>
                      참가자
                    </th>
                    <th colSpan={2} style={labelStyle}>
                      담당참석자
                    </th>
                    <th colSpan={4} style={labelStyle}>
                      업체참석자
                    </th>
                  </tr>
                  <tr>
                    {["성명", "부서명", "성명", "부서명", "직책", "연락처", "회사명"].map((h, k) => (
                      <th key={k} style={labelStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                  {salesActivityAll.activityAttendList.map((att, idx) => (
                    <tr key={idx} style={{ height: 20 }}>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.nmEmp}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.nmDept}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.empVendor}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.deptVendor}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.positionVendor}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.telNoVendor}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{att.nmVendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 상담목적 */}
              <table style={tableStyle}>
                <tbody>
                  <tr style={{ height: "100%" }}>
                    <th style={sectionStyle}>상담목적</th>
                    <td style={{ ...cellStyle, textAlign: "left" }}>{salesActivityAll?.activityList[0]?.purpose}</td>
                  </tr>
                </tbody>
              </table>

              {/* 주요안건 */}
              <table style={tableStyle}>
                <tbody>
                  <tr style={{ height: "100%" }}>
                    <th style={sectionStyle}>Agenda</th>
                    <td style={{ ...cellStyle, textAlign: "left" }}>{salesActivityAll?.activityList[0]?.agenda}</td>
                  </tr>
                </tbody>
              </table>

              {/* 결과 및 기대효과 */}
              <table style={tableStyle}>
                <tbody>
                  <tr style={{ height: "100%" }}>
                    <th style={sectionStyle}>결과 및 기대효과</th>
                    <td style={{ ...cellStyle, textAlign: "left" }}>{salesActivityAll?.activityList[0]?.results}</td>
                  </tr>
                </tbody>
              </table>

              {/* 향후 계획 */}
              <table style={tableStyle}>
                <tbody>
                  <tr style={{ height: "100%" }}>
                    <th style={sectionStyle}>향후 계획</th>
                    <td style={{ ...cellStyle, textAlign: "left" }}>{salesActivityAll?.activityList[0]?.progress}</td>
                  </tr>
                </tbody>
              </table>

              {/* ORDER 관련 */}
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th rowSpan={salesActivityAll?.activityOrderList?.length + 1} style={sectionStyle}>
                      ORDER
                      <br />
                      관련
                    </th>
                    {["BUYER", "BRAND", "STYLE#", "ITEM", "수량", "금액", "참고사항"].map((h, k) => (
                      <th key={k} style={labelStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                  {salesActivityAll?.activityOrderList?.map((o, idx) => (
                    <tr key={idx} style={{ height: 20 }}>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{o.nmBuyer}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{o.nmBrand}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{o.noStyle}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{o.nmItem}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>{o.quantity.toLocaleString("ko-KR")}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>{o.amount.toLocaleString("ko-KR")}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{o.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th rowSpan={salesActivityAll?.activityCostList?.length + 1} style={sectionStyle}>
                      COST
                      <br />
                      관련
                    </th>
                    {["구분", "비용", "참고사항"].map((h, k) => (
                      <th key={k} style={labelStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                  {salesActivityAll?.activityCostList?.map((c, idx) => (
                    <tr key={idx} style={{ height: 20 }}>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{c.nmCost}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>{c.amtCost.toLocaleString("ko-KR")}</td>
                      <td style={{ ...cellStyle, textAlign: "left" }}>{c.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CONTENTS */}
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th style={sectionStyle}>CONTENTS</th>
                    <td
                      style={{
                        ...cellStyle,
                        padding: 0,
                        /* maxWidth 보장 + 높이만 스크롤 */
                        maxWidth: "100%",
                        height: 200,
                      }}
                    >
                      <div
                        className="sales-content-preview"
                        style={{
                          maxHeight: 350,
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          padding: "6px",
                          boxSizing: "border-box",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: salesActivityAll?.activityContentsList[0]?.contents || "",
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* 첨부파일 리스트 */}
              {salesActivityAll?.activityFileList?.filter((f: any) => f.ynFlag !== "D").length > 0 && (
                <div className="mt-3">
                  <h5>첨부파일</h5>
                  <ul className="list-group">
                    {salesActivityAll.activityFileList
                      .filter((f: any) => f.ynFlag !== "D")
                      .map((f: any) => (
                        <li
                          key={f.nmFile}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{f.nmFile}</span>
                          <Button variant="link" size="sm" onClick={() => handleFileDownload(f.nmFile)}>
                            다운로드
                          </Button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Modal>
  );
};

export default SalesActivityDetail;
