export interface Payload {
  data: any;
  status: number;
  errorCode: string;
  errorMessage: string;
  errResult: any;
}

export interface CodeParam {
  cdFlag: Array<string>;
}

export interface FactoryLineData {
  sewLn?: string;
  sewNm?: string;
}

export interface FactoryWorkerData {
  cdJob?: string;
  cdUser?: string;
  nmSuser?: string;
  noLine?: string;
}

export interface BuyerInfo {
  cdBuyer?: string;
  nmBuyer?: string;
}

export interface HeaderInfo {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsExfty?: string;
  dtsWk?: string;
  currentBuyer?: string;
  currentPage?: string;
  limitPage?: string;
  sewLn?: string;
  stLine?: string;
  edLine?: string;
  isEndLine?: string;
  excel?: string;
  cdFtyAll?:string;
  noStyle?:string;
  swFind?:string; // 0 :일자조회, 1:STYLE 조회 (CUTTING 에서 사용)
}

export interface FactorySewingHeaderInfo {
  cdCompany?: string;
  cdBizarea?: string;
  cdFty?: string;
  dtsWk?: string;
  bep?: string;
  rate?: string;
  gubun?: string;
  sewLn?: string;
}

export interface HEADER_PROPS {
  sendDataToParent?: (data: any) => void;
}
