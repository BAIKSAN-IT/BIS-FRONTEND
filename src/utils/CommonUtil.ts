import { SHA256 } from "crypto-js";
import { format } from "date-fns";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React from "react";

// 풀사이즈 화면 타입 정의
interface DocumentElement extends HTMLElement {
  requestFullscreen(options?: FullscreenOptions): Promise<void>;
  webkitRequestFullscreen(options?: FullscreenOptions): Promise<void>;
  msRequestFullscreen(options?: FullscreenOptions): Promise<void>;
}

// null 체크
export const isEmpty = (val: any): boolean => {
  if (!val) return true;
  if (val === undefined) return true;

  if (
    typeof val === "function" ||
    typeof val === "number" ||
    typeof val === "boolean" ||
    Object.prototype.toString.call(val) === "[object Date]"
  ) {
    return false;
  }

  // null or 0 length array
  if (val === null || val.length === 0) {
    return true;
  }

  if (typeof val === "object") {
    // empty object
    for (const f in val) {
      if (val.hasOwnProperty(f)) {
        return false;
      }
    }
    return true;
  }

  return false;
};

// 풀사이즈 화면 기능
export const setFullscreen = () => {
  const elem = document.documentElement as DocumentElement;

  // Enter fullscreen
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};

// 풀사이즈 화면 해제 기능
export const setExitFullscreen = async () => {
  try {
    if (document.hidden) return;
    if (document.exitFullscreen) await document.exitFullscreen();
    else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
  } catch (e) {
    // silent
  }

  // if (document.exitFullscreen) {
  //   document.exitFullscreen();
  // } else if ((document as any).webkitExitFullscreen) {
  //   (document as any).webkitExitFullscreen();
  // } else if ((document as any).msExitFullscreen) {
  //   (document as any).msExitFullscreen();
  // }
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const day: string = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

export const formatDateType2 = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const day: string = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDate = (date: Date, type: string): string => {
  switch (type) {
    case "1":
      return format(date, "yyyy.MM.dd (EEE)");
    case "2":
      return format(date, "yyyy-MM-dd");
    case "3":
      return format(date, "HH:mm");
    case "4":
      return format(date, "yyyyMMdd");
    default:
      return format(date, "yyyy.MM.dd");
  }
};

// 월까지 표시
export const monthFormat = (dt: string) => {
  if (!isEmpty(dt)) {
    return dt?.slice(0, 4) + "-" + dt?.slice(4, 6);
  } else {
    return "";
  }
};

// 일까지 표시
export const yearFormat = (dt: string) => {
  if (!isEmpty(dt)) {
    return dt?.slice(0, 4) + "-" + dt?.slice(4, 6) + "-" + dt?.slice(6, 8);
  } else {
    return "";
  }
};

// 인코딩
export const encSHA256 = (password: string) => {
  const hashPwd = SHA256(password).toString();
  return hashPwd;
};

// 대시 포매터
export const dashFormatValue = (value: string, size: Number) => {
  if (!isEmpty(value) && size === 10) {
    return `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`;
  }
  return value;
};

// 시간 HH:DD 포맷
export const timeFormat = (value: string): string => {
  value = String(value).padStart(4, "0");

  const hour = value.substring(0, 2);
  const minute = value.substring(2);

  return `${hour}:${minute}`;
};

// 대시 포매터
export const dateFormatter = (value: string): string => {
  if (value && value.trim() !== "") {
    const year = parseInt(value.slice(0, 4), 10);
    const month = parseInt(value.slice(4, 6), 10) - 1;
    const day = parseInt(value.slice(6, 8), 10);
    const dateObject = new Date(year, month, day);
    const formattedDate = convertTime(dateObject).split("T")[0];
    return formattedDate;
  }
  return value;
};

// 유틸리티 함수 예제
export const convertTime = (date: Date): string => {
  // 예제 구현, 실제로는 실제 convertTime 함수에 맞게 변경
  return date.toISOString();
};

// time zone
export const getTimeZone = (date: Date) => {
  date = new Date(date);
  let offset = date.getTimezoneOffset() * 60000; //ms단위라 60000곱해줌
  let dateOffset = new Date(date.getTime() - offset);
  return dateOffset.toISOString();
};

// YYYYMMdd 포매터
export const getYYYYMMDDFormat = (date: Date) => {
  const year = date.getFullYear();
  const month = ("0" + (1 + date.getMonth())).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
};

// 전화번호 포맷
export const phoneChange = (str: string): string | undefined => {
  if (!isEmpty(str)) {
    const RegNotNum = /[^0-9]/gi;
    let RegPhonNum: RegExp;
    let DataForm = "";

    str = str.replace(RegNotNum, "");
    if (isEmpty(str)) {
      return "";
    }

    if (str.length > 3 && str.length < 7) {
      DataForm = "$1-$2";
      RegPhonNum = /([0-9]{3})([0-9]+)/;
    } else if (str.length === 7) {
      DataForm = "$1-$2";
      RegPhonNum = /([0-9]{3})([0-9]{4})/;
    } else if (str.length === 8) {
      DataForm = "$1-$2";
      RegPhonNum = /([0-9]{4})([0-9]{4})/;
    } else if (str.length === 9) {
      DataForm = "$1-$2-$3";
      RegPhonNum = /([0-9]{2})([0-9]{3})([0-9]+)/;
    } else if (str.length === 10) {
      if (str.substring(0, 2) === "02") {
        DataForm = "$1-$2-$3";
        RegPhonNum = /([0-9]{2})([0-9]{4})([0-9]+)/;
      } else {
        DataForm = "$1-$2-$3";
        RegPhonNum = /([0-9]{3})([0-9]{3})([0-9]+)/;
      }
    } else if (str.length > 10) {
      DataForm = "$1-$2-$3";
      RegPhonNum = /([0-9]{3})([0-9]{4})([0-9]+)/;
    } else {
      return str; // 길이가 4 미만인 경우 원래 문자열 반환
    }

    if (str.length >= 4) {
      while (RegPhonNum.test(str)) {
        str = str.replace(RegPhonNum, DataForm);
      }
    }
    return str;
  }
  return undefined; // isEmpty가 true인 경우 undefined 반환
};

// - 빼기
export const delDash = (val: string) => {
  if (!isEmpty(val)) {
    val = val.replaceAll("-", "").replaceAll("_", "");
    return val;
  }
};

// 테이블 body값 return
export const getBodyData = (bodyName: string) => {
  const bodyData = document.querySelector(`.${bodyName}`);
  const arr: number[] = [];

  if (bodyData) {
    const rowList = bodyData.getElementsByTagName("tr");

    Array.from(rowList).forEach((row, index) => {
      const checkbox = row.querySelector(".form-check-input") as HTMLInputElement;

      if (checkbox && checkbox.checked) {
        arr.push(index);
      }
    });
  }
  return arr;
};

// 체크 리스트 가져오기
export const getCheckList = (checkLists: any, checkListNames: Array<string>) => {
  let selectedQrList = [] as any;

  checkLists.forEach((checkList: any, index: number) => {
    const bodyData = getBodyData(checkListNames[index]);
    const selectedItems = checkList?.filter((item: any, idx: number) => bodyData.includes(idx));
    selectedQrList.push(...selectedItems);
  });

  return selectedQrList;
};

// 체크 리스트 초기화
export const checkListClear = (rejectListNames: any) => {
  rejectListNames.forEach((rejectListName: any, index: number) => {
    const bodyData = document.querySelector(`.${rejectListName}`);

    if (bodyData) {
      const rowList = bodyData.getElementsByTagName("tr");

      Array.from(rowList).forEach((row, index) => {
        const checkbox = row.querySelector(".form-check-input") as HTMLInputElement;

        if (checkbox && checkbox.checked) {
          checkbox.click();
        }
      });
    }
  });
};

// 체크 리스트 초기화
export const openKeypad = () => {
  window.ui.modal.open("keyPad");
};

// 베트남 로컬 시간 가져오기
export const getVtnTime = (date?: Date) => {
  if (date) {
    return new Date(date).toLocaleString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } else {
    return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  }
};

// 데이터 추출 및 정렬
export const dataExtraction = (data: any, val: string) => {
  const lineData: Array<{ key: string; value: any }> = [];

  for (const key in data) {
    if (key.startsWith(val)) {
      lineData.push({ key: key, value: data[key] });
    }
  }

  return lineData.sort((a, b) => a.key.localeCompare(b.key));
};

// 엑셀 파일 생성 함수
export const generateExcel = (data: any, filename: string) => {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const excelBuffer: any = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob: Blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });
  saveAs(blob, `${filename}.xlsx`);
};

/** YYYY-Www → YYYYMMDD (ISO week 월요일) */
export const formatDateToYYYYMMDD22 = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

const parseYYYYMMDD = (v: string): Date =>
  new Date(
    Number(v.slice(0, 4)),
    Number(v.slice(4, 6)) - 1,
    Number(v.slice(6, 8))
  );

/** YYYYMMDD → YYYY-Www (ISO 기준) */
export const toWeekValue = (yyyymmdd: string): string => {
  if (!/^\d{8}$/.test(yyyymmdd)) return "";

  const date = parseYYYYMMDD(yyyymmdd);

  // ISO 기준: 목요일 기준 연도
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const isoYear = thursday.getFullYear();

  const firstThursday = new Date(isoYear, 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7)
  );

  const week =
    1 +
    Math.round(
      (thursday.getTime() - firstThursday.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
    );

  return `${isoYear}-W${String(week).padStart(2, "0")}`;
};

/** YYYY-Www → YYYYMMDD (월요일) */
export const weekToStartYYYYMMDD = (week: string): string => {
  if (!/^\d{4}-W\d{2}$/.test(week)) return "";

  const [y, w] = week.split("-W");
  const year = Number(y);
  const weekNum = Number(w);

  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;

  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - (jan4Day - 1));

  const target = new Date(mondayWeek1);
  target.setDate(mondayWeek1.getDate() + (weekNum - 1) * 7);

  return formatDateToYYYYMMDD22(target);
};

/** YYYY-Www → YYYYMMDD (일요일) */
export const weekToEndYYYYMMDD = (week: string): string => {
  const start = weekToStartYYYYMMDD(week);
  if (!start) return "";

  const d = parseYYYYMMDD(start);
  d.setDate(d.getDate() + 6);
  return formatDateToYYYYMMDD22(d);
};

/** YYYYMMDD ↔ YYYY-MM-DD */
export const compactToDashed = (v: string) =>
  `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

export const ymdDashedToCompact = (v: string) => v.replaceAll("-", "");
