import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/* Common */
import { Payload } from "../../../constants/common/common";

/* Redux */
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

// components
import SystemPageTitleBar from "../../../components/common/SystemPageTitleBar";

/* Utils */
import { isEmpty } from "../../../utils/CommonUtil";

import SalaryContractOverseas from "./SalaryContractOverseas";
import SalaryContractDomestic from "./SalaryContractDomestic";
import { getSalaryAmt, GetSalaryRes, saveSalaryAmt } from "../../../redux/hrm/SalarySlice";

import Swal from "sweetalert2";
import { format } from "date-fns";

interface Company {
  company: string;
  name: string;
}

interface Person {
  empNo: string;
  birth: string;
  name: string;
}

// SalaryContract component
const SalaryContract: React.FC = () => {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const today = new Date();

  const COUNTDOWN_SECONDS = 60;

  const [salaryAmt, setSalaryAmt] = useState<GetSalaryRes | null>(null); // 유저 정보 리스트

  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId ?? "",
    noEmp: user?.userId ?? "",
    numRegist: "",
    password: "",
    yymm: format(today, "yyyy"),
    loginPassword:user?.loginPwd ?? "",
  }); // 년봉정보 가져오기

  /* SweetAlert - 단순 메시지 알림 */
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };

  /* SweetAlert - 확인 취소 모달 */
  const confirmAction = (message: string, callback: () => void) => {
    Swal.fire({
      title: "Confirm",
      text: message,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "tight-swal-popup",
        title: "tight-swal-title",
        closeButton: "tight-swal-close",
        confirmButton: "small-swal-button",
        cancelButton: "small-swal-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  //const [data, setData] = useState<string>('초기 데이터');
  const timerRef = useRef<NodeJS.Timeout | null>(null); // setInterval ID 저장용
  const [secondsLeft, setSecondsLeft] = useState<number>(COUNTDOWN_SECONDS);

  // 사용자 목록 조회
  const getSalary = (params = searchParams) => {
    dispatch(getSalaryAmt(params)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSalaryAmt(payload.data);
      } else {
        setSalaryAmt(null); // 리스트 초기화
        setErrorMsg(payload.errorMessage); // 에러 메시지 설정
      }
    });
  };

  // 조회 버튼 클릭 시 호출되는 함수
  const onSearchButtonClick = () => {

    // 주민번호(앞)6자리 입력 체크
    if (!searchParams.numRegist) {
      showAlert("주민번호(앞)6자리를 입력하여 주세요."); // Swal으로 알림
      return;
    }

    // 사용자명 입력 체크
    if (!searchParams.password) {
      showAlert("Login 비밀번호를 입력하여 주세요."); // Swal으로 알림
      return;
    }

    getSalary(); // 년봉정보 가져오기
    setSecondsLeft(COUNTDOWN_SECONDS);
  };

  // 승인버튼 호출되는 함수
  const onExt1ButtonClick = () => {

        if (!salaryAmt?.noEmp) {
      showAlert(t("데이타 조회후에 승인처리하여 주세요."));
      return;
    }

    if (salaryAmt?.cdApproval) {
      showAlert(t("이미승인 처리된 자료입니다."));
      return;
    }

    confirmAction("승인하시겠습니까?", handleSaveConfirm);
  };

  // 저장 확인 모달에서 "확인" 클릭 시 호출되는 함수
  const handleSaveConfirm = () => {
    const saveData = {
      cdCompany: salaryAmt?.cdCompany || "",
      yymm: salaryAmt?.dtsYm || "",
      noEmp: salaryAmt?.noEmp || "",
    };

    dispatch(saveSalaryAmt(saveData))
      .then((res: any) => {
        const payload = res.payload as Payload;
        if (payload.status === 200 && !isEmpty(payload.data)) {
          getSalary(); // 년봉정보 가져오기
          setSecondsLeft(COUNTDOWN_SECONDS);
        } else {
          showAlert(payload.errorMessage || t("common.confirm.saveError"));
        }
      })
      .catch(() => {
        showAlert(t("common.confirm.saveErrorManager"));
      });
  };

  /* 출력 버튼 클릭 시 */
  const onPrintButtonClick = () => {
    if (salaryAmt?.cdApproval && Number(salaryAmt.cdApproval) >= 0) {
      window.print();
    } else {
      showAlert("승인후에 출력하여 주세요."); // Swal으로 알림
    }
  };

  useEffect(() => {
    // 최초 타이머 시작
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          // 0에 도달했을 때 처리
          //setData(""); // 데이터 초기화
          // 초기화
          setSalaryAmt(null);
          setSearchParams((prev) => ({
            ...prev, // 기존 필드를 보존
            cdCompany: user?.companyId ?? "",
            noEmp: user?.userId ?? "",
            numRegist: "",
            password: "",
            yymm: format(today, "yyyy"),
            loginPassword:user?.loginPwd ?? "",
          }));

          return COUNTDOWN_SECONDS; // 다시 리셋
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current); // 언마운트 시 타이머 해제
    };
  }, []);
  return (
    <>
      <React.Fragment>
        {/* System - PageTitleBar */}
        <SystemPageTitleBar
          pageTitle={"Salary Contract"}
          breadCrumbItems={[
            { label: "성과관리", path: "/salaryContract" },
            { label: "SalaryContract", path: "/salaryContract", active: true },
          ]}
          onSearchButtonClick={onSearchButtonClick}
          onPrintButtonClick={onPrintButtonClick}
          onExt1ButtonClick={onExt1ButtonClick}
        />

        <Row className={"print-hide"}>
          {/* 년봉기준년월 */}
          <Col md={2}>
            <div className="d-flex align-items-center mb-2">
              <label className="search-custom-salary-label-class">기준년도</label>
              <input
                type="text"
                className="form-control ml-2"
                style={{ height: "27px", fontSize: "10px" }}
                value={searchParams.yymm}
                autoComplete="off"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    yymm: e.target.value,
                  }))
                }
              />
            </div>
          </Col>
          {/* 주민번호끝자리 입력 필드 */}
          <Col md={2}>
            <div className="d-flex align-items-center mb-2">
              <label className="search-custom-salary-label-class">주민번호앞(6)</label>
              <input
                type="password"
                className="form-control ml-2"
                style={{ height: "27px", fontSize: "10px" }}
                value={searchParams.numRegist}
                autoComplete="off"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    numRegist: e.target.value,
                  }))
                }
              />
            </div>
          </Col>
          {/* Login Password 입력 필드 */}
          <Col md={2}>
            <div className="d-flex align-items-center mb-2">
              <label className="search-custom-salary-label-class">PASSWORD</label>
              <input
                type="password"
                className="form-control ml-2"
                style={{ height: "27px", fontSize: "10px" }}
                value={searchParams.password}
                autoComplete="off"
                //ref={passwordRef}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
          </Col>

          {/* Timer */}
          <Col md={2}>
            <span style={{ color: "lightsalmon" }}>초기화 : {secondsLeft}초</span>
          </Col>
        </Row>
        {/* System - PageTitleBar */}

        {salaryAmt?.cdSw === "1" ? ( //해외이면
          <SalaryContractOverseas salaryAmt={salaryAmt} />
        ) : (
          <SalaryContractDomestic salaryAmt={salaryAmt} />
        )}
      </React.Fragment>
    </>
  );
};

export default SalaryContract;
