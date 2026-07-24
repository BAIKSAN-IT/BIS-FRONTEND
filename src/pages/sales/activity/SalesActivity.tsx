import React, { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Col, Row } from "react-bootstrap";

/* Component */
import PisTable from "../../../components/table/PisTable";
import SalesPageTitleBar from "../../../components/common/SalesPageTitleBar";
import { SalesActivityTableColumns } from "./SalesActivityTableColumns";
import SearchSalesActivity from "./SearchSalesActivty";
import SalesActivityRegister from "../register/SalesActivityRegister";

/* Redux */
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSalesActivity,
  deleteSalesActivityFile,
  getSalesActivityAllList,
  getSalesActivitySumList,
  SalesActivityAllListRes,
  SalesActivityCostListRes,
  SalesActivityOrderListRes,
  SalesActivitySaveReq,
  SalesActivitySeqRes,
  SalesActivitySumListRes,
  saveSalesActivity,
  saveSalesActivitySeq,
  uploadSalesActivityFile,
} from "../../../redux/sales/SalesActivitySlice";

import {
  CommonEApprovalRes,
  CommonSaveEapprovalReq,
  getEApproval,
  saveEApprovalHtml,
} from "../../../redux/common/commonSlice";

/* lb */
import Swal from "sweetalert2";

/* utils */
import { isEmpty } from "../../../utils/CommonUtil";

/* constant*/
import { Payload } from "../../../constants/common/common";
import useInputRefs from "../../../utils/useInputRefs";
import { DateUtils } from "../../../utils/dateUtils";

const SalesActivity = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const convertGwStatusToCode = (label: string) => {
    switch (label) {
      case "완료":
        return "Y";
      case "반려":
        return "N";
      case "진행중":
        return "C";
      case "작성중":
      default:
        return "P";
    }
  };

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

  const [isSalesActivity, setIsSalesActivity] = useState(true); // 현재 페이지 상태
  const [isSalesActivityCheckRow, setIsSalesActivityCheckRow] = useState(false); // checkBox 선택 후 추가협의 Row 상태
  const [isSalesActivitySelectRow, setIsSalesActivitySelectRow] = useState(false); // 수정 버튼
  const [isShowContent, setIsShowContent] = useState(false); // Contents 표기여부
  const [shouldLoadForEApproval, setShouldLoadForEApproval] = useState(false); //전자결제 상태값

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const [pendingFiles, setPendingFiles] = useState<File[]>([]); //파일 업로드
  const [pendingDeleteFiles, setPendingDeleteFiles] = useState<string[]>([]); //파일 삭제

  const [salesActivitySumList, setSalesActivitySumList] = useState<SalesActivitySumListRes[]>([]);

  const [checkedRow, setCheckedRow] = useState<SalesActivitySumListRes | null>(null); // 체크된 행 상태 추가
  const [selectedRow, setSelectedRow] = useState<SalesActivitySumListRes | null>(null); // 선택된 행 데이터 저장
  const [expandedNoDocus, setExpandedNoDocus] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState({
    cdCompany: user?.companyId || "1000",
    keywords: "",
    nmVendor: "",
    descAttend: "",
    nmEmp: user?.userNm || "",
    cdDept: user?.deptId || "",
    nmDept: user?.deptNm || "",
    dtMeetFrom: DateUtils.twelveMonthsAgo,
    dtMeetTo: DateUtils.today,
    nmWork: "",
    nmDetail: "",
    progress: "",
    gwStatus: "",
    noDocuSeq: "",
    purpose: "",
    nmBuyer: "",
    nmBrand: "",
    nmItem: "",
    dtInputFrom: DateUtils.twelveMonthsAgo,
    dtInputTo: DateUtils.today,
    nmActivity: "",
    nmNameVendor: "",
    pLang: "KOR",
  }); // 사용자 목록 검색 조건

  const { refs, getValues } = useInputRefs([
    "keywords",
    "nmVendor",
    "descAttend",
    "nmEmp",
    "cdDept",
    "nmDept",
    "dtMeetFrom",
    "dtMeetTo",
    "progress",
    "noDocuSeq",
    "purpose",
    "nmBuyer",
    "nmBrand",
    "nmItem",
    "dtInputFrom",
    "dtInputTo",
    "nmNameVendor",
    "pLang",
  ]);

  // 기본 주문 행
  const defaultOrderRow: SalesActivityOrderListRes = {
    cdCompany: user?.companyId || "1000",
    noDocu: "",
    seqDocu: "",
    seqOrder: 1,
    cdBuyer: "",
    nmBuyer: "",
    cdBrand: "",
    nmBrand: "",
    cdItem: "",
    nmItem: "",
    seqStyle: 0,
    noStyle: "",
    quantity: 0,
    amount: 0,
    ynFlag: "",
    remarks: "",
  };

  // 기본 비용 행
  const defaultCostRow: SalesActivityCostListRes = {
    cdCompany: user?.companyId || "1000",
    noDocu: "",
    seqDocu: "",
    seqCost: 1,
    cdCost: "01",
    nmCost: "",
    amtCost: 0,
    ynFlag: "",
    remarks: "",
  };

  /* 영업 활동 저장 RequestBody 상태 추가 */
  const defaultSalesActivitySaveReq: SalesActivitySaveReq = {
    saveActivityList: [],
    saveActivityOrderList: [],
    saveActivityFileList: [],
    saveActivityAttendList: [],
    saveActivityCostList: [],
    saveActivityContentsList: [],
  };

  const [salesActivitySaveReq, setSalesActivitySaveReq] = useState<SalesActivitySaveReq>(defaultSalesActivitySaveReq);

  /* 영업 활동 목록 조회 */
  const fetchSalesActivitySumList = async (params = searchParams) => {
    const converted = {
      ...params,
      dtMeetFrom: params.dtMeetFrom.replace(/-/g, ""),
      dtMeetTo: params.dtMeetTo.replace(/-/g, ""),
      dtInputFrom: params.dtInputFrom.replace(/-/g, ""),
      dtInputTo: params.dtInputTo.replace(/-/g, ""),
      pLang: "KOR",
    };
    await dispatch(getSalesActivitySumList(converted)).then((res) => {
      const payload = res.payload as Payload;
      if (payload.status === 200 && !isEmpty(payload.data)) {
        setSalesActivitySumList(payload.data);
        /* 페이지 초기 진입 시 전체보여줌 .*/
        const initialExpanded = payload.data
          .filter((row: SalesActivitySumListRes) => row.seqDocu === "01")
          .map((row: SalesActivitySumListRes) => row.noDocu);
        setExpandedNoDocus(initialExpanded); // 초기 펼침
      } else {
        setSalesActivitySumList([]);
        setExpandedNoDocus([]); // 실패 시 접기
      }
    });
  };

  const onRowClick = (row: SalesActivitySumListRes) => {
    // 항상 선택되도록 먼저 selectedRow 세팅
    setSelectedRow(row);

    // "최초"인 경우에만 toggle 동작
    if (row.seqDocu === "01") {
      setExpandedNoDocus((prev) =>
        prev.includes(row.noDocu) ? prev.filter((docu) => docu !== row.noDocu) : [...prev, row.noDocu]
      );
    }
  };
  const filteredData = salesActivitySumList.filter((row) => {
    if (row.seqDocu === "01") return true; // 항상 보여줌
    return expandedNoDocus.includes(row.noDocu); // 펼쳐진 noDocu만 표시
  });
  /* 부서 모달 클릭 */
  const onRowDoubleClick = (row: SalesActivitySumListRes) => {
    setSelectedRow(row);
    setCheckedRow(null); // 기존 체크 값 제거
    setIsSalesActivityCheckRow(false); // 추가협의 비활성화
    setIsSalesActivitySelectRow(true); // 수정 모드 활성화
    setIsSalesActivity(false); // 등록 모드 진입
  };

  // Checkbox 선택 시 selectedRow와 분리하여 관리
  const handleCheckboxChange = (row: SalesActivitySumListRes, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const isSame = checkedRow?.noDocuSeq === row.noDocuSeq;

    setCheckedRow(isSame ? null : row); // 동일하면 제거
    setSelectedRow(null); // 더블클릭 값 제거
    setIsSalesActivitySelectRow(false); // 수정 모드 비활성화
  };
  /* 조회 버튼 클릭 */
  const onSearchButtonClick = () => {
    // 1. 폼에서 들어온 값
    const inputValues = getValues();

    // 2. 우선 전체 merge
    const merged = {
      ...searchParams,
      ...inputValues,
    };

    // 3. 날짜 필드만 기본값 보존
    const nextParams = {
      ...merged,
      dtMeetFrom: merged.dtMeetFrom || searchParams.dtMeetFrom,
      dtMeetTo: merged.dtMeetTo || searchParams.dtMeetTo,
      dtInputFrom: merged.dtInputFrom || searchParams.dtInputFrom,
      dtInputTo: merged.dtInputTo || searchParams.dtInputTo,
    };

    setSearchParams(nextParams);
    fetchSalesActivitySumList(nextParams);
  };

  /* 저장 버튼 클릭 시 saveSalesActivity API 호출 */
  const onSaveButtonClick = async () => {
    if (!salesActivitySaveReq) return;

    // 1) 필드 라벨 매핑
    const fieldLabels: Record<string, string> = {
      dtMeeting: "상담일자",
      cdWork: "업무구분",
      cdDetail: "상세분류",
      cdActivity: "상담유형",
      levShare: "업무공유",
      purpose: "상담목적",
      keywords: "KeyWords",
      nmEmp: "담당자",
      nmDept: "부서",
      agenda: "Agenda",
    };

    // 2) 메인 리스트[0] 필수값 검사
    const main = salesActivitySaveReq.saveActivityList[0] || {};
    for (const key of Object.keys(fieldLabels)) {
      const val = (main as any)[key];
      if (!val || String(val).trim() === "") {
        showAlert(`${fieldLabels[key]}은(는) 필수 항목입니다.`);
        return;
      }
    }

    // 3) 참석자 필수값 검사
    if (salesActivitySaveReq.saveActivityAttendList.filter((r) => r.ynFlag !== "D").length < 1) {
      showAlert("참석자는 최소 한 명 이상 입력해야 합니다.");
      return;
    }

    // 4) 로컬 req 복제
    let req = { ...salesActivitySaveReq };

    // 4.1) order/cost 기본 행 보장
    //    저장 직전에 order 또는 cost 배열이 비어 있으면 최소 한 건을 넣어 줍니다.
    if (req.saveActivityOrderList.length === 0) {
      req.saveActivityOrderList = [
        {
          ...defaultOrderRow,
          noDocu: req.saveActivityList[0].noDocu || "",
          seqDocu: req.saveActivityList[0].seqDocu || "",
          ynFlag: "",
        },
      ];
    }
    if (req.saveActivityCostList.length === 0) {
      req.saveActivityCostList = [
        {
          ...defaultCostRow,
          noDocu: req.saveActivityList[0].noDocu || "",
          seqDocu: req.saveActivityList[0].seqDocu || "",
          ynFlag: "",
        },
      ];
    }

    const isNew = !req.saveActivityList[0].noDocu;

    try {
      let noDocu: string;
      let seqDocu: string;

      if (isNew) {
        // ── 신규 등록 ──
        // 5-1) 채번 요청
        const seqRes = await dispatch(
          saveSalesActivitySeq({
            cdCompany: user!.companyId!,
            setDate: DateUtils.today.replace(/-/g, ""),
          })
        ).unwrap();
        if (seqRes.status !== 200 || isEmpty(seqRes.data)) {
          showAlert("데이터를 불러오는 중 오류가 발생했습니다. 관리자에게 문의해주세요.");
          return;
        }
        ({ docuNo: noDocu, setDocu: seqDocu } = seqRes.data as SalesActivitySeqRes);

        // 5-2) 채번
        req = {
          ...req,
          saveActivityList: req.saveActivityList.map((it, i) => ({
            ...it,
            noDocu,
            seqDocu,
            contents: req.saveActivityContentsList[i]?.contents || it.contents,
            gwStatus: "P",
          })),
          saveActivityOrderList: req.saveActivityOrderList.map((it) => ({ ...it, noDocu, seqDocu })),
          saveActivityAttendList: req.saveActivityAttendList.map((it) => ({ ...it, noDocu, seqDocu })),
          saveActivityCostList: req.saveActivityCostList.map((it) => ({ ...it, noDocu, seqDocu })),
          saveActivityContentsList: req.saveActivityContentsList.map((it) => ({ ...it, noDocu, seqDocu })),
        };

        // 5-3) 삭제 대기 파일 처리
        if (pendingDeleteFiles.length) {
          pendingDeleteFiles.forEach((name) => dispatch(deleteSalesActivityFile({ noDocu, fileName: name })));
          setPendingDeleteFiles([]);
        }

        // 5-4) 파일 업로드
        if (pendingFiles.length) {
          const uploadRes = await dispatch(uploadSalesActivityFile({ noDocu, files: pendingFiles })).unwrap();
          const paths = uploadRes.data as string[];
          req.saveActivityFileList = paths.map((p, idx) => ({
            cdCompany: user!.companyId!,
            noDocu,
            seqDocu,
            seqFile: idx + 1,
            ynDel: "N",
            ynFlag: "",
            nmFile: p.split("/").pop()!,
          }));
          setPendingFiles([]);
        }
      } else {
        // ── 수정 ──
        noDocu = req.saveActivityList[0].noDocu!;
        seqDocu = req.saveActivityList[0].seqDocu!;

        // 6-1) 삭제 대기 파일 처리
        if (pendingDeleteFiles.length) {
          pendingDeleteFiles.forEach((name) => dispatch(deleteSalesActivityFile({ noDocu, fileName: name })));
          setPendingDeleteFiles([]);
        }

        // 6-2) 채번
        req = {
          ...req,
          saveActivityList: req.saveActivityList.map((it, i) => ({
            ...it,
            noDocu,
            seqDocu,
            contents: req.saveActivityContentsList[i]?.contents || it.contents,
            gwStatus: convertGwStatusToCode(it.gwStatus),
          })),
          saveActivityOrderList: req.saveActivityOrderList.map((it) => ({ ...it, noDocu, seqDocu })),
          saveActivityCostList: req.saveActivityCostList.map((it) => ({ ...it, noDocu, seqDocu })),
          saveActivityContentsList: req.saveActivityContentsList.map((it) => ({ ...it, noDocu, seqDocu })),
        };
        // 6-3) 새로운 파일 업로드 & 병합
        if (pendingFiles.length) {
          const uploadRes = await dispatch(uploadSalesActivityFile({ noDocu, files: pendingFiles })).unwrap();
          const paths = uploadRes.data as string[];
          const existing = req.saveActivityFileList.filter((f) => !!f.noDocu);
          const maxSeq = existing.length ? Math.max(...existing.map((f) => f.seqFile!)) : 0;
          const newFiles = paths.map((p, idx) => ({
            cdCompany: user!.companyId!,
            noDocu,
            seqDocu,
            seqFile: maxSeq + idx + 1,
            ynDel: "N",
            ynFlag: "",
            nmFile: p.split("/").pop()!,
          }));
          req.saveActivityFileList = [...existing.map((f) => ({ ...f, ynFlag: f.ynFlag || "" })), ...newFiles];
          setPendingFiles([]);
        }
      }

      // 7) 최종 저장
      const saveRes = await dispatch(saveSalesActivity(req)).unwrap();
      if (saveRes.status === 200) {
        fetchSalesActivitySumList();
        showAlert(t("저장하였습니다."));
        setIsSalesActivity(false);
        setIsSalesActivitySelectRow(true);
        setSelectedRow({
          cdCompany: user!.companyId!,
          noDocu,
          seqDocu,
        } as SalesActivitySumListRes);
      } else {
        showAlert("저장 중 에러가 발생했습니다.");
      }
    } catch (err) {
      showAlert("저장 중 에러가 발생했습니다.");
    }
  };

  /* 출력 버튼 클릭 시 */
  const onPrintButtonClick = () => {
    window.print();
  };

  const initialAll: SalesActivityAllListRes = {
    activityList: [],
    activityAttendList: [],
    activityContentsList: [],
    activityCostList: [],
    activityFileList: [],
    activityOrderList: [],
  };

  const [salesActivityAll, setSalesActivityAll] = useState<SalesActivityAllListRes>(initialAll);
  const onEApprovalButtonClick = async () => {
    if (!checkedRow) {
      showAlert("전자결제 항목을 선택해주세요.");
      return;
    }

    if (checkedRow.gwStatus === "완료") {
      showAlert("이미 결제가 완료되었습니다.");
      return;
    }

    if (checkedRow.gwStatus === "진행중") {
      showAlert("결제가 진행중입니다.");
      return;
    }
    setShouldLoadForEApproval(true);
  };
  useEffect(() => {
    const fetchAndRunApproval = async () => {
      if (!checkedRow || !shouldLoadForEApproval) return;

      const params = {
        cdCompany: checkedRow.cdCompany!,
        noDocu: checkedRow.noDocu!,
        seqDocu: checkedRow.seqDocu!,
      };

      const res = await dispatch(getSalesActivityAllList(params));
      const payload = res.payload as Payload;
      const fetchedData = payload.data;

      if (!fetchedData || isEmpty(fetchedData)) {
        showAlert("전자결제 데이터가 비어 있습니다.");
        setShouldLoadForEApproval(false);
        return;
      }

      setSalesActivityAll(fetchedData);

      confirmAction("전자결제를 진행하시겠습니까?", async () => {
        // 2) 공통 CSS
        const styleTag = `
      <style>
        .custom-eApproval-table {
          border-collapse: collapse;
          width: 100%;
          table-layout: fixed;
          word-break: break-all;
        }
        .custom-eApproval-table th,
        .custom-eApproval-table td {
          border: 1px solid #ccc;
          padding: 6px;
          white-space: normal;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .custom-eApproval-table th.section {
          background-color: #e5f7e5;
          font-weight: bold;
          text-align: center;
        }
        .custom-eApproval-table th.label {
          background-color: #f1f1f1;
          text-align: center;
        }

        .custom-eApproval-table td.text-left {
          text-align: left;
        }
        .custom-eApproval-table td.text-right {
          text-align: right;
        }

        .col-section { width: 120px; }
        .col-label { width: 80px; }
        .col-value { width: auto; }
      </style>

      `;

        const colgroup = `
        <colgroup>
          <col class="col-section">
          <col class="col-label"><col class="col-value">
          <col class="col-label"><col class="col-value">
          <col class="col-label"><col class="col-value">
          <col class="col-label"><col class="col-value">
        </colgroup>
      `;

        // 3) rows 생성
        const rows: string[] = [];

        // 기본정보
        rows.push(`
        <tr>
          <th class="section" rowspan="2">기본정보</th>
          <th class="label">문서번호</th><td>${checkedRow.noDocuSeq}</td>
          <th class="label">업무구분</th><td>${checkedRow.nmWork}</td>
          <th class="label">상세분류</th><td>${checkedRow.nmDetail}</td>
          <th class="label">상담유형</th><td>${checkedRow.nmActivity}</td>
        </tr>
      `);
        rows.push(`
        <tr>
          <th class="label">Keywords</th><td>${checkedRow.keywords}</td>
          <th class="label">상담일자</th><td>${checkedRow.dtMeeting}</td>
          <th class="label">담당자</th><td>${checkedRow.nmEmp}</td>
          <th class="label">결재상태</th><td>${checkedRow.gwStatus}</td>
        </tr>
      `);

        // 참가자
        rows.push(`
        <tr>
          <th class="section" rowspan="${
            fetchedData?.activityAttendList?.length > 0 ? fetchedData?.activityAttendList?.length + 2 : 2
          }">참가자</th>
          <th class="label" colspan="2">담당참석자</th>
          <th class="label" colspan="6">업체참석자</th>
        </tr>
        <tr>
          <th colspan="1" class="label">성명</th>
          <th colspan="1" class="label">부서명</th>
          <th colspan="1" class="label">성명</th>
          <th colspan="1" class="label">부서</th>
          <th colspan="1" class="label">직책</th>
          <th colspan="2" class="label">연락처</th>
          <th colspan="2" class="label">회사명</th>
        </tr>
      `);
        fetchedData?.activityAttendList?.forEach((att: any) => {
          rows.push(`
          <tr>
            <td class="text-left" colspan="1">${att.nmEmp}</td>
            <td class="text-left" colspan="1">${att.nmDept}</td>
            <td class="text-left" colspan="1">${att.empVendor}</td>
            <td class="text-left" colspan="1">${att.deptVendor}</td>
            <td class="text-left" colspan="1">${att.positionVendor}</td>
            <td class="text-left" colspan="1">${att.telNoVendor}</td>
            <td class="text-left" colspan="2">${att.nmVendor}</td>
          </tr>
        `);
        });

        //상담목적 / Agenda / 결과 및 기대효과 / 향후 계획
        const oneLine = (label: string, value: string) => `
        <tr style="height:auto;">
          <th class="section">${label}</th>
          <td colspan="8">${value}</td>
        </tr>
      `;
        rows.push(oneLine("상담목적", checkedRow.purpose));
        rows.push(oneLine("Agenda", checkedRow.agenda));
        rows.push(oneLine("결과 및 기대효과", checkedRow.results));
        rows.push(oneLine("향후 계획", checkedRow.progress));

        // ORDER 관련
        rows.push(`
        <tr>
          <th class="section" rowspan="${
            fetchedData?.activityOrderList?.length > 0 ? fetchedData?.activityOrderList?.length + 1 : 1
          }">ORDER</th>
          <th colspan="1" class="label">BUYER</th>
          <th colspan="1" class="label">BRAND</th>
          <th colspan="1" class="label">STYLE#</th>
          <th colspan="1" class="label">ITEM</th>
          <th colspan="1" class="label">수량</th>
          <th colspan="1" class="label">금액</th>
          <th colspan="2" class="label">참고사항</th>
        </tr>
      `);
        fetchedData?.activityOrderList?.forEach((o: any) => {
          rows.push(`
          <tr>
            <td class="text-left" colspan="1" >${o.nmBuyer}</td>
            <td class="text-left" colspan="1" >${o.nmBrand}</td>
            <td class="text-left" colspan="1" >${o.noStyle}</td>
            <td class="text-left" colspan="1" >${o.nmItem}</td>
            <td class="text-right" colspan="1" >${o.quantity.toLocaleString("ko-KR")}</td>
            <td class="text-right" colspan="1">${o.amount.toLocaleString("ko-KR")}</td>
            <td class="text-left" colspan="2" >${o.remarks}</td>
          </tr>
        `);
        });

        // COST
        rows.push(`
        <tr>
          <th class="section" rowspan="${
            fetchedData?.activityCostList?.length > 0 ? fetchedData?.activityCostList?.length + 1 : 1
          }">COST</th>
          <th colspan="3" class="label">구분</th>
          <th colspan="2" class="label">금액</th>
          <th colspan="3" class="label">참고사항</th>
        </tr>
      `);
        fetchedData?.activityCostList?.forEach((c: any) => {
          rows.push(`
          <tr>
            <td class="text-left" colspan="3">${c.nmCost}</td>
            <td class="text-right" colspan="2">${c.amtCost.toLocaleString("ko-KR")}</td>
            <td class="text-left" colspan="3">${c.remarks}</td>
          </tr>
        `);
        });

        // CONTENTS
        rows.push(`
        <tr>
          <th class="section">CONTENTS</th>
          <td colspan="8" style="vertical-align: top; height:450px; padding: 0; overflow: auto">
            ${fetchedData?.activityContentsList[0]?.contents || ""}
          </td>
        </tr>
      `);

        // 4) HTML 조합
        const dcHtml =
          styleTag + `<table class="custom-eApproval-table">${colgroup}<tbody>${rows.join("")}</tbody></table>`;

        // 5) 전자결제 API 호출
        const req: CommonSaveEapprovalReq = {
          cdKey1: checkedRow.cdCompany!,
          cdKey2: user!.cdBizarea!,
          cdKey3: `AT${checkedRow.noDocuSeq}`,
          nmTitle: `영업활동보고서_${user!.deptNm}_${user!.userNm}`,
          dcHtml,
          cdJobclass: "AT",
          idUser: user!.userId!,
          nwTitle: "영업활동보고서",
        };

        try {
          await dispatch(saveEApprovalHtml(req)).unwrap();
          // 2) 저장된 문서번호(pk)로 결재정보 조회
          const getRes = await dispatch(getEApproval({ noDocu: req.cdKey3 })).unwrap();
          // axios unwrap 반환값이 AxiosResponse 이므로 .data 가 실제 바디
          const commonEapproval: CommonEApprovalRes = getRes.data;

          // 3) portal URL 생성
          const { cdApproval } = commonEapproval;
          const url =
            `http://portal.panko.co.kr/workflow/wfApprovalSancIF.wfdo` +
            `?systemId=PANKO_SFE_GW&formid=230&ifhappid=${encodeURIComponent(cdApproval)}`;

          // 4) 새 탭으로 열기
          window.open(url, "_blank");
        } catch {
          showAlert("전자결제 요청 중 오류가 발생했습니다.");
        }
      });
      setShouldLoadForEApproval(false);
    };

    fetchAndRunApproval();
  }, [checkedRow, shouldLoadForEApproval]);

  /* 삭제 버튼 클릭 시 */
  const onDeleteButtonClick = () => {
    if (!checkedRow) {
      showAlert(t("체크박스를 선택 후 삭제해주세요. "));
      return;
    }
    if (checkedRow.gwStatus === "완료" || checkedRow.gwStatus === "진행중") {
      showAlert("완료 또는 진행중인 자료는 삭제할 수 없습니다.");
      return;
    }
    // 삭제 확인 팝업 띄우기
    confirmAction(t("common.confirm.delete"), handleDeleteConfirm);
  };

  /* 삭제 확인 후 실제 API 호출 */
  const handleDeleteConfirm = () => {
    dispatch(
      deleteSalesActivity({
        cdCompany: checkedRow?.cdCompany || "",
        noDocu: checkedRow?.noDocu || "",
        seqDocu: checkedRow?.seqDocu || "",
      })
    )
      .then((res) => {
        const payload = res.payload as Payload;
        if (payload.status === 200) {
          const resetParams = {
            cdCompany: user?.companyId || "1000",
            keywords: "",
            nmVendor: "",
            descAttend: "",
            nmEmp: user?.userNm || "",
            cdDept: user?.deptId || "",
            nmDept: user?.deptNm || "",
            dtMeetFrom: DateUtils.twelveMonthsAgo,
            dtMeetTo: DateUtils.today,
            nmWork: "",
            nmDetail: "",
            progress: "",
            gwStatus: "",
            noDocuSeq: "",
            purpose: "",
            nmBuyer: "",
            nmBrand: "",
            nmItem: "",
            dtInputFrom: DateUtils.twelveMonthsAgo,
            dtInputTo: DateUtils.today,
            nmActivity: "",
            nmNameVendor: "",
            pLang: "KOR",
          };
          fetchSalesActivitySumList(resetParams);
          setSelectedRow(null);
          setCheckedRow(null);
        } else {
          showAlert(t("common.confirm.deleteUserError") + payload.errorMessage);
        }
      })
      .catch(() => {
        showAlert(t("common.confirm.deleteUserErrorManager"));
      });
  };

  /* 처음 페이지 진입 시 */
  useEffect(() => {
    fetchSalesActivitySumList();
  }, []);

  const isDisabled =
    checkedRow?.gwStatus === "Y" ||
    checkedRow?.gwStatus === "완료" ||
    selectedRow?.gwStatus === "Y" ||
    selectedRow?.gwStatus === "완료"; //완료 값 체크

  useEffect(() => {
    if (selectedRow) setCheckedRow(null);
  }, [selectedRow]);

  useEffect(() => {
    if (checkedRow) setSelectedRow(null);
  }, [checkedRow]);
  return (
    <>
      <SalesPageTitleBar
        pageNm={"Sales"}
        pageUrl={"/salesActivityDashboard"}
        breadCrumbItems={[
          { label: "SalesPlus", path: "/salesActivityDashboard" },
          {
            label: isSalesActivity ? "SalesActivityList" : "SalesActivityPlus",
            path: "/salesActivity",
            active: true,
          },
        ]}
        isSalesActivity={isSalesActivity}
        isDisabled={isDisabled}
        isShowEApproval={true}
        onSearchButtonClick={onSearchButtonClick}
        onNewButtonClick={() => {
          setIsSalesActivity(false);
          setIsSalesActivityCheckRow(false);
          setIsSalesActivitySelectRow(false);
          setCheckedRow(null);
          setSelectedRow(null);
          setSalesActivitySaveReq(defaultSalesActivitySaveReq);
        }}
        onSaveButtonClick={onSaveButtonClick}
        onDeleteButtonClick={onDeleteButtonClick}
        onExcelDownloadClick={() => {}}
        onPrintButtonClick={onPrintButtonClick}
        onEApprovalButtonClick={onEApprovalButtonClick}
      />

      <div className="d-flex justify-content-start mb-1">
        <Button
          variant={!isSalesActivity ? "primary" : "outline-primary"}
          className={`sales-activity-button ${!isSalesActivity ? "active-button" : ""}`}
          onClick={() => setIsSalesActivity(false)}
        >
          SalesActivityPlus
        </Button>
        <Button
          variant={isSalesActivity ? "primary" : "outline-primary"}
          className={`sales-activity-button ${isSalesActivity ? "active-button" : ""}`}
          onClick={() => setIsSalesActivity(true)}
        >
          SalesActivityList
        </Button>
      </div>

      {/* 검색 조건 및 테이블 표시 */}
      {isSalesActivity ? (
        <>
          <SearchSalesActivity
            isShowContent={isShowContent}
            setIsShowContent={setIsShowContent}
            refs={refs}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onSearchButtonClick={onSearchButtonClick}
          />

          <Card className={"table-responsive sales-activity-table-top"}>
            <Card.Body>
              <div className="d-flex justify-content-start mb-1">
                <Button
                  variant={!isSalesActivity ? "primary" : "outline-primary"}
                  className={`sales-activity-button ${!isSalesActivity}`}
                  onClick={() => {
                    if (!checkedRow) {
                      showAlert("협의 항목을 체크해주세요");
                      return;
                    }
                    setSelectedRow(null); // 수정 모드 초기화
                    setIsSalesActivitySelectRow(false);
                    setIsSalesActivityCheckRow(true);
                    setIsSalesActivity(false); // 등록 화면 진입
                  }}
                >
                  추가협의
                </Button>
              </div>

              <Row className="gx-3 align-items-stretch d-flex flex-wrap" style={{ minHeight: "calc(95vh - 100px)" }}>
                <Col
                  xs={12}
                  sm={12}
                  md={isShowContent ? 7 : 12}
                  lg={isShowContent ? 7 : 12}
                  className="d-flex flex-column sales-activity-table-col"
                >
                  <div className="card flex-grow-1 card-gray-border">
                    <div className="sales-table-container">
                      <PisTable
                        columns={SalesActivityTableColumns()}
                        data={filteredData}
                        theadClass="table-custom-sales-light text-center font-12"
                        tableClass="table-custom-sales-background text-center font-12"
                        isSortable={true}
                        isSelectable={true}
                        errorMsg={""}
                        onRowClick={onRowClick}
                        onRowDoubleClick={(row) => onRowDoubleClick(row.original)}
                        onCheckboxChange={handleCheckboxChange}
                        checkedRow={checkedRow}
                        selectedRow={selectedRow}
                      />
                    </div>
                  </div>
                </Col>
                {/* Content 보기 */}
                {isShowContent && (
                  <Col xs={12} sm={12} md={5} lg={5} className="d-flex flex-column sales-activity-table-col">
                    <div
                      className="card flex-grow-1 card-gray-border overflow-auto sales-content-preview"
                      dangerouslySetInnerHTML={{ __html: checkedRow?.contents || selectedRow?.contents || "" }}
                    />
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </>
      ) : (
        /* Sales Activity PLUS 화면 (좌측탭) */
        <SalesActivityRegister
          selectedRow={selectedRow}
          checkedRow={checkedRow}
          isSalesActivitySelectRow={isSalesActivitySelectRow}
          isSalesActivityCheckRow={isSalesActivityCheckRow}
          isDisabled={isDisabled}
          salesActivitySaveReq={salesActivitySaveReq}
          setSalesActivitySaveReq={setSalesActivitySaveReq}
          setPendingFiles={setPendingFiles}
          setPendingDeleteFiles={setPendingDeleteFiles}
        />
      )}
    </>
  );
});

export default SalesActivity;
