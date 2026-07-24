import React, { useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { GetSalaryRes } from "../../../redux/hrm/SalarySlice";
import { format } from "date-fns";
import panko from "../../../assets/images/panko.png";

interface Props {
  salaryAmt: GetSalaryRes | null;
}

// invoice component
const SalaryContractOverseas = ({ salaryAmt }: Props) => {
  const [customer] = useState<string>("Stanley Jones");
  const today = new Date();
  const oneYearLater = new Date();

  const setDate = format(today, "yyyy년 MM월 dd일");
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const formStart = format(today, "yyyy.MM.dd");
  const formEnd = format(oneYearLater, "yyyy.MM.dd");

  return (
    <Row>
      <Col>
        <Card>
          <Card.Body>
            <Row>
              <Col md={8}>
                <div className="mt-0" style={{ textAlign: "center" }}>
                  <h4 style={{ fontSize: "20px", textDecoration: "underline" }}>
                    <b>연 봉 계 약 서</b>
                    <br></br>
                    <br></br>
                  </h4>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mt-1">
                  <p>
                    <b>
                      주식회사 팬코 (이하 甲이라한다)와 {salaryAmt?.nmEmp || "(근로자)"} (이하 乙이라 한다)은(는) 아래와
                      같이 연봉계약을 체결하고,
                    </b>
                    <br></br>
                    <b>이를 상호간에 성실히 이행할 것을 서약한다.</b>
                    <br></br>
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div className="mt-1">
                  <p>
                    <b>제1조 [연봉계약기간]</b>
                    <br></br>
                    <b>
                      연봉계약기간은 {salaryAmt?.dtsStart || formStart} ~ {salaryAmt?.dtsEnd || formEnd} 까지로 한다.
                    </b>
                    <br></br>
                  </p>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <div className="mt-1">
                  <p>
                    <b>제2조 [연봉의 구성]</b>
                    <br></br>
                    <b>
                      乙의 연봉은 {salaryAmt?.amtPayYear ? Number(salaryAmt.amtPayYear).toLocaleString() : "0"}원이며,
                      甲은 연봉을 12로 나누어 매월 25일에 乙이 정한 예금통장 계좌로
                    </b>
                    <br></br>
                    <b>지급 하며, 휴일인 경우 전일 지급한다.</b>
                    <br></br>
                    <b>1) 월급여의 구성(월 통상임금 산정 209시간 기준)</b>
                    <div className="table-responsive">
                      <table
                        style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px", textAlign: "center" }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              구분
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              월봉
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              연봉
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "40%",
                              }}
                            >
                              비고
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>원화급여 계</td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtPay ? Number(salaryAmt.amtPay).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtPayYear ? Number(salaryAmt.amtPayYear).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>세전금액, 퇴직금산정시 포함.</td>
                          </tr>
                          <tr>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>기본급</td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtBasic ? Number(salaryAmt.amtBasic).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtBasicYear ? Number(salaryAmt.amtBasicYear).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}></td>
                          </tr>
                          <tr>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>연장근로</td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtOver ? Number(salaryAmt.amtOver).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              {salaryAmt?.amtOverYear ? Number(salaryAmt.amtOverYear).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>통상시급*52시간*150%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <b>2) 위 원화급여에는 기본급, 연장근로수당 등이 포괄산정되어 있다.</b>
                    <br></br>
                    <b>3) 월급여 구성은 사용자의 수당지급기준 변경, 개인인사발령 등에 따라 변경될 수 있다.</b>
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <div className="mt-1">
                  <p>
                    <b>제3조 [현지수당]</b>
                    <br></br>
                    <b>乙의 현지수당은 아래와 같다.</b>
                    <br></br>
                    <div className="table-responsive">
                      <table
                        style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px", textAlign: "center" }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              구분
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              월봉
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "20%",
                              }}
                            >
                              연봉
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "4px",
                                backgroundColor: "#f0f0f0",
                                width: "40%",
                              }}
                            >
                              비고
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>현지수당</td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              U${salaryAmt?.amtLocal ? Number(salaryAmt.amtLocal).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                              U${salaryAmt?.amtLocalYear ? Number(salaryAmt.amtLocalYear).toLocaleString() : "0"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "4px" }}>세후금액, 퇴직금산정시 불포함.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <div className="mt-1">
                  <p>
                    <b>제4조 [연봉 미공개의 의무]</b>
                    <br></br>
                    <b>
                      1) 乙은 본인의 연봉금액에 대하여 타인에게 누설하지 않으며, 이를 인지시킬 수 있는 어떠한 행동도
                      하지
                    </b>
                    <b>않는다.</b>
                    <br></br>
                    <b>
                      2) 乙은 타인의 연봉관련 사항을 취득하려 하지 말아야 하며, 타인의 연봉관련 사항의 공개를
                      요구하여서는
                    </b>
                    <b>아니된다.</b>
                    <br></br>
                    <b>3) 乙은 위의 조항을 위반 시, 이로 인한 모든 불이익을 감수한다.</b>
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <div className="mt-1">
                  <div className="table-responsive" style={{ overflowY: "hidden" }}>
                    <table>
                      <thead className="">
                        <tr>
                          <th style={{ width: "65%" }}></th>
                          <th style={{ width: "10%" }}></th>
                          <th style={{ width: "25" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={2} style={{ textAlign: "center" }}>
                            {salaryAmt?.dtsApproval || setDate}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>甲　회　　　사　　　명　:　{"주식회사 팬코"}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>　　대　　　표　　　자　:　{"오경석"}</td>
                          <td style={{ position: "relative", width: "100%", height: "100%" }}>
                            {/* 텍스트: 항상 보이게 고정 */}
                            <span style={{ position: "relative", zIndex: 2, fontWeight: "normal" }}>
                              {" "}
                              {/*  이미지보다 위에 놓으려면 이걸 10 이상으로 */}
                              서명 또는 인
                            </span>
                            {/* 이미지: 아래 깔리지만 텍스트 위치에 맞춰 띄우기 */}
                            <img
                              src={panko}
                              alt="서명 이미지"
                              style={{
                                position: "absolute",
                                top: "-30px", // 조절 가능
                                left: "50px", // 조절 가능
                                zIndex: 1, // 텍스트보다 낮게 → 배경처럼 보이게
                                width: "80px",
                                height: "auto",
                                opacity: 0.95, // 반투명 서명 효과
                                pointerEvents: "none",
                              }}
                            />
                          </td>
                        </tr>
                      </tbody>
                      <tbody>
                        <tr>
                          <td>乙　생　　년　월　　일　:　{salaryAmt?.dtsBirth || ""}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>　　성　　　　　　　명　:　{salaryAmt?.nmApproval || ""}</td>
                          <td style={{ position: "relative", width: "100%", height: "100%", border: "0px solid #ccc" }}>
                            <span>서명 또는 인</span>
                            <span
                              style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                transform: "translateX(-50%)",
                                fontWeight: "bold",
                                fontFamily: "Gulim",
                                fontSize: "25px",
                                color: "#000",
                                marginTop: "-6px",
                                marginLeft: "110px",
                              }}
                            >
                              {salaryAmt?.nmApproval || ""}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SalaryContractOverseas;
