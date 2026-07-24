import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import axios, { AxiosError, AxiosResponse } from "axios";

interface RndArticleSaveReq {
  articleList: SaveRndArticleReq[];
  yarnList: SaveRndArticleYarnReq[];
  processList: SaveRndArticleProcessReq[];
  compositionList: SaveRndArticleCompositionReq[];
  fileList: SaveRndArticleFileReq[];
  styleList: SaveRndArticleStyleReq[];
}

interface SaveRndArticleReq {
  cdCompany: string;
  seqArticle: string;
  cdHanger: string;
  cdFabric: string;
  nmFabric: string;
  nmFabricSt: string;
  cdSupplier: string;
  nmSupplier: string;
  noSupplierArticle: string;
  fabricDivision: string;
  fabricType: string;
  productType: string;
  fabricCategory: string;
  fabricCategoryS: string;
  fabricStructure: string;
  fabricStructureS: string;
  fabricSecondStructure: string;
  cdLayer: string;
  composition: string;
  noLot: string;
  noSample: string;
  fabricInch: string;
  fabricGauge: number;
  widthInch: number;
  wgtGsm: number;
  wgtYdm: number;
  cdPressure: string;
  cdColorType: string;
  cdColor: string;
  nmColor: string;
  cdSeason: string;
  cdCurrency: string;
  dtPrice?: string /* PRICE DATE */;
  pricePerYard: number;
  pricePerWight: number;
  pricePerMeter: number;
  cdUnit: string;
  cdCountry: string;
  cdIncomterms: string;
  leadtimeDays: number;
  minOrders: number;
  minColor: number;
  qtyKeep: number;
  qtyKeepOrg: number;
  buyerNotify: string;
  internalNotify: string;
  ynConfirm: string;
  dtConfirm: string;
  cdTheme: string;
  cdItem: string;
  cdDept: string;
  nmDept: string;
  noEmp: string;
  userNm: string;
  cdHangerPrev: string;
  dtHanger: string;
  garmentSample: string;
  styleDesc: string;
  nuNidcnt: number;
  ynDevelopSample: string;
  yn1stSample: string;
  ynReviseColorSample: string;
  ynColorSample: string;
  ynAppSample: string;
  fabricFinishing: string;
  cdBuyer: string;
  nmBuyer: string;
  idInsert: string;
  dtInsert: string;
  idUpdate: string;
  dtUpdate: string;
}

interface SaveRndArticleYarnReq {
  cdCompany: string;
  seqArticle: string;
  cdFabric: string;
  cdYarn: string;
  nmYarn: string;
  seq: number;
  yarnMaterial: string;
  cpstRt: number;
  yarnCount: string;
  countType: string;
  loopLength: number;
  separate: string;
  yarnColor: string;
  is2Ply: string;
  feeder: string;
  ply: string;
  ynFlag: string;
}

interface SaveRndArticleProcessReq {
  cdCompany: string;
  seqArticle: string;
  cdFabric: string;
  cdProcess: string;
  rtLoss: number;
  ynFlag: string;
}

interface SaveRndArticleCompositionReq {
  cdCompany: string;
  seqArticle: string;
  cdFabric: string;
  cdComposition: string;
  rtComp: number;
  sortSeq: number;
  rtCompBack: number;
  ynFlag: string;
}

interface SaveRndArticleFileReq {
  cdCompany: string;
  seqArticle: string;
  seq: number;
  imgFileNameOrg: string;
  imgFileName: string;
  ynFlag: string;
}

interface SaveRndArticleStyleReq {
  cdCompany: string;
  seqArticle: string;
  seq: number;
  noStyle: string;
  descStyle: string;
  ynFlag: string;
}

interface RndArticleAllListRes {
  rndArticleList: RndArticleModel[]; // RndArticle 목록 조회
  rndArticleCompositionList: RndArticleCompositionModel[]; // RndArticle Composition 목록 조회
  rndArticleFileList: RndArticleFileModel[]; // RndArticle File 목록 조회
  rndArticleProcessList: RndArticleProcessModel[]; // RndArticle Process 목록 조회
  rndArticleQrcodeList: RndArticleQrCodeModel[]; // RndArticle QrCode 목록 조회
  rndArticleYarnList: RndArticleYarnModel[]; // RndArticle Yarn 목록 조회
  rndArticleStyleList: RndArticleStyleModel[]; // RndArticle Style 목록 조회
}
interface RndArticleReq {
  cdCompany: string; // 회사코드1
  startDate: string; // 회사코드1
  endDate: string; // 회사코드1
  seqArticle: string; // ARTICLE NO
  cdHanger: string; // HANGER #
  nmFabric: string; // Fabric Name
  cdSupplier: string; // Supplier
  noSupplierArticle: string; // Supplier
  productType: string; // Product Type
  fabricType: string; // Fabric Type
  fabricDivision: string; // Fabric Division
  fabricCategory: string; // Fabric Category
  fabricStructure: string; // Structure Category
  userNm: string; // user Name
  cdDept: string; // Department
  nmDept: string; // Department
  noSample: string; //SAMPLE#
  noLot: string; //LOT#
  ynConfirm: string; // Status
  cdFabric: string; // ERP 원단코드
  cdComposition: string; // 혼용율 코드
  cdProcess: string; // 공정코드
  cdYarn: string; // 원사코드
  nmYarn: string; // 원사코드
  qrcode: string; // Qr Code
  seq: number; // 순번
  rowQrNum: number; // QR 페이지 수
}
interface RndArticleModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE 일련번호
  cdHanger: string; // Hanger CD
  cdArticle: string; // ARTICLE CD
  cdFabric: string; // ERP 원단코드
  nmFabric: string; // 원단코드명
  nmFabricSt: string; // 원단코드명(약어)
  cdSupplier: string; // 공급처코드
  nmSupplier: string; // 공급처코드명
  noSupplierArticle: string; // 공급처 ARTICLE NO
  fabricDivision: string; //
  nmFabricDivision: string; //
  fabricType: string; // 원단타입 (W:우븐, K:니트, O:OTHERS)
  nmFabricType: string; // 원단타입 명(W:우븐, K:니트, O:OTHERS)
  productType: string; // Product Type (S:SAMPLE, B:BULK, P:PURCHASE)
  nmProductType: string; // Product Type 명(S:SAMPLE, B:BULK, P:PURCHASE)
  fabricCategory: string; // 원단 카테고리
  nmFabricCategory: string; // 원단 카테고리명
  fabricStructure: string; // 원단 조직 (Structure)
  nmFabricStructure: string; // 원단 조직 명(Structure)
  fabricSecondStructure: string; // 원단 조직 명(Structure)
  cdLayer: string; // 층수 정보 (이중지/삼중지)
  composition: string; // 혼용율
  noLot: string; // LOT 번호
  noSample: string; // Sample 번호
  fabricInch: string; // FABRIC INCH
  fabricGauge: number; // FABRIC 게이지 (편직세기)
  widthInch: number; // INCH
  wgtGsm: number; // 중량(gsm)
  wgtYdm: number; // 중량(yd/m²)
  cdPressure: string; // 염색 압력 (High, Normal 등)
  cdColorType: string; // 컬러 타입 (Solid, 멜란지 등)
  cdColor: string; // Color Code
  nmColor: string; // Color Name
  cdSeason: string; // 시즌
  nmSeason: string; // 시즌명
  cdCurrency: string; // 화폐 구분
  dtPrice?: string /* PRICE DATE */;
  pricePerYard: number; // 야드당 단가
  pricePerWight: number; // 킬로그램당 단가
  pricePerMeter: number; // 미터당 단가
  cdUnit: string; // 단위 (YDS, KG 등)
  cdCountry: string; // 국가
  cdIncomterms: string; // 가격조건
  leadtimeDays: number; // 리드타임 (일)
  minOrders: number; // 최소 주문 수량
  minColor: number; // 최소 컬러 수량
  qtyKeep: number; // KEEP 수량
  buyerNotify: string; // Buyer Notify
  internalNotify: string; // 내부 공유 알림
  ynConfirm: string; // 확정여부 (Y:확정, N:미확정)
  nmYnConfirm: string; // 확정여부 (Y:확정, N:미확정)
  dtConfirm: string; // 확정일자
  cdDept: string; // 이전 CD_Hanger값
  nmDept: string; // 이전 CD_Hanger값
  noEmp: string; // 이전 CD_Hanger값
  userNm: string; // 이전 CD_Hanger값
  cdTheme: string; // 이전 CD_Hanger값
  cdItem: string; // 이전 CD_Hanger값
  dtHanger: string; // 이전 CD_Hanger값
  garmentSample: string; // GARMENT SAMPLE
  styleDesc: string; // STYLE DESCRIPTION
  nuNidcnt: number; // 침수
  ynDevelopSample: string;
  yn1stSample: string;
  ynReviseColorSample: string;
  ynColorSample: string;
  ynAppSample: string;
  fabricFinishing: string;
  cdBuyer: string;
  nmBuyer: string;
  idInsert: string; // 등록자 ID
  dtInsert: string; // 등록일자 (YYYY-MM-DD)
  idUpdate: string; // 수정자 ID
  dtUpdate: string; // 수정일자 (YYYY-MM-DD)
  seqNo: number; // rowNum
}
interface RndArticleCompositionModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  cdFabric: string; // ERP 원단코드
  cdComposition: string; // 혼용율 코드
  rtComp: number; // 구성 비율
  sortSeq: number; // 순서
  rtCompBack: number; // 혼용률 100%,200%체크
  ynFlag: string; // 구성 비율
}

interface RndArticleFileModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  seq: number; // 순번
  imgFileNameOrg: string; // 원본 파일명
  imgFileName: string; // 저장 파일명
  ynFlag: string; // 구성 비율
}

interface RndArticleProcessModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  cdFabric: string; // ERP 원단코드
  cdProcess: string; // 공정코드
  rtLoss: number; // 손실율
  ynFlag: string; // 구성 비율
}
interface RndArticleQrCodeModel {
  cdCompany: string; // 회사코드
  qrcode: string; // Qr Code
  seqArticle: string; // ARTICLE NO
}

interface RndArticleYarnModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  cdFabric: string; // ERP 원단코드
  cdYarn: string; // 원사코드
  nmYarnSt: string; // 원사코드명
  nmYarn: string; // 원사코드명
  seq: number; // 순번
  yarnMaterial: string; // 원사 소재 구분
  cpstRt: number; // 구성 비율
  yarnCount: string; // 원사 카운트
  countType: string; // 카운트 타입
  loopLength: number; // Loop 장
  separate: string; // 구분기호
  yarnColor: string; // 원사 컬러
  is2Ply: string; // 2합 여부
  feeder: string; // 피더 수
  ply: string; // 합사 수
  ynFlag: string; // 구성 비율
}

interface RndArticleStyleModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  seq: number; // 순번
  noStyle: string; //
  descStyle: string; //
  ynFlag: string; //
}

interface FabricInfoReq {
  cdCompany: string; // 회사 코드
  cdFabric: string; // 원단 코드
  nmFabric: string; // 원단명
  dyLot: string; // LOT번호
  noStyle: string; // STYLE번호
  pageNo: number; // 페이지번호
  pageSize: number; // 페이지사이즈
}

interface FabricAllInfoRes {
  fabricInfoList: FabricInfoRes[];
  fabricYarnInfoList: FabricYarnInfoRes[];
  fabricProcessInfoList: FabricProcessInfoRes[];
}
interface FabricInfoRes {
  seqNo: number; // 시퀀스 번호
  totalCount: number; // 총 개수
  cdCompany: string; // 회사 코드
  cdFabric: string; // 원단 코드
  nmFabricSt: string; // 원단명 (St)
  nmFabric: string; // 원단명
  category: string; // 카테고리
  structure: string; // 구조
  dyeing: string; // 염색 정보
  specialYarn: string; // 특수 원사
  widthInch: number; // 폭 (Inch)
  wgtSqm: number; // 중량 (sqm)
  wgtYd: number; // 중량 (yd)
  cdHs: string; // HS 코드
  fabricDesc: string; // 원단 설명
  dcRmk: string; // 비고
  cdCustoms: string; // 세관 코드
  nmCustoms: string; // 세관명
  ynUse: string; // 사용 여부
  nmSample: string; // 샘플명
  fabCategory: string; // 원단 대분류 코드
  nmFabCategory: string; // 원단 대분류명
  fabStructureType: string; // 원단 구조 타입 코드
  cdFabStructureType: string; // 원단 구조 타입 코드
  nmFabStructureType: string; // 원단 구조 타입 코드명
  fabStructureDetail1: string; // 원단 구조 상세1
  cdFabStructureDetail1: string; // 원단 구조 상세 코드
  nmFabStructureDetail1: string; // 원단 구조 상세 코드명
  fabStructureDetail2: string; // 원단 구조 상세2
  cdPurchase: string; // 구매처 코드
  cdBuyer: string; // 바이어 코드
  nmBuyer: string; // 바이어명
  knitInch: number; // 편직 폭
  knitGauge: number; // 편직 게이지
  knitMachineMaker: string; // 편직기 제조사
  dyeingType: string; // 염색 방식
  dyeingPressure: string; // 염색 압력
  dyeingColor: string; // 염색 색상
  isNew: string; // 신제품 여부
  isPique: string; // Pique 여부
  cdLayer: string; // 층 코드
  cdTwill: string; // 능직 코드
  fabric2Ply: string; // 2합 여부
  isHarinuki: string; // 바림 여부
  isYarnDyeing: string; // 선염 여부
  isCross: string; // 크로스 여부
  repeats: string; // 반복
  prodqtyPerday: string; // 일일 생산량
  composition: string; // 혼용률
  uqMaterial: string; // 단위 자재
  idJakji: string; // 작지 번호
  noCont: string; // 수주 번호
  noStyle: string; // 스타일 번호
  pog: string; // 가공조건 INCH
  masu: string; // 가공조건 gr/yd
  grm: string; // 가공조건 gr/m2
  machineNo: string; // 편직 기계명
  inch: string; // 편직 INCH
  guage: string; // 편직 게이지
  loop: string; // 편직 LOOP
  needle: string; // 편직 침수
  pog1: string; // 생지 텀블 전 폭
  wgt1: string; // 생지 텀블 전 중량(gr/m2)
  nmColor: string; // 염색 COLOR
  dyLot: string; // 염색 LOT
  dPog: string; // 건조체크 폭
  dWgt: string; // 건조체크 중량
  fgJob: string; // 작업 구분 (1:정상, 2:샘플, 3:반품)
  wchk: string; // 완결 체크 (1:미결, 2:완결, 3:보류, 4:취소)
  ncode08: string; // BASIC INFORMATION(SQM)
  ncode13: string; // BASIC INFORMATION(INCH)
  idInsert: string; // 등록자 ID
  idUpdate: string; // 수정자 ID
  dtInsert: string; // 등록일
  dtUpdate: string; // 수정일
  cdSample: string; // 샘플 코드
}
interface FabricYarnInfoRes {
  cdCompany: string;
  cdFabric: string;
  cdYarn: string;
  nmYarnSt: string;
  nmYarn: string;
  yarnMaterial: string;
  materialType: string;
  cpstRt: string;
  yarnCount: string;
  countType: string;
  loopLength: string;
  separate: string;
  seq: number;
  yarnColor: string;
  is2Ply: string;
  feeder: string;
  ply: string;
  yarnCountB: string;
  cdTwist: string;
  cdMelange: string;
  specialYarn: string;
  cdHs: string;
  yarnDesc: string;
  dcRmk: string;
  cdCustoms: string;
  nmCustoms: string;
  ynUse: string;
  nmYarnCn: string;
  compose01: string;
  composeR01: string;
  compose02: string;
  composeR02: string;
  compose03: string;
  composeR03: string;
  compose04: string;
  composeR04: string;
  compose05: string;
  composeR05: string;
}
interface FabricProcessInfoRes {
  cdCompany: string;
  cdFabric: string;
  code: string;
  rtLoss: number;
  cdField: string;
  cdSysdef: string;
  fg1Syscode: string;
  cdUsrdef: string;
  nmUsrdef: string;
  nmSysdef: string;
  cdFlag1: string;
}

interface deleteArticleReq {
  cdCompany: string;
  seqArticle: string;
}

interface RndArticleQrCodeInfoReq {
  cdCompany: string;
  seqArticle: string;
  qrcode: string;
}

interface RndArticleQrCodeInfoRes {
  cdCompany?: string /* 회사 코드 */;
  qrcode?: string /* QR 코드 */;
  cdHanger?: string /* 행거 코드 */;
  cdFabric?: string /* 원단 코드 */;
  nmFabric?: string /* 원단명 */;
  nmFabricSt?: string /* 원단명(약어) */;
  cdSupplier?: string /* 공급업체 코드 */;
  nmSupplier?: string /* 공급업체명 */;
  noSupplierArticle?: string /* 공급업체 Article No */;
  fabricDivision?: string /* 원단 구분 */;
  nmFabricDivision?: string /* 원단 구분명 */;
  fabricType?: string /* 원단 타입 */;
  nmFabricType?: string /* 원단 타입명 */;
  productType?: string /* 제품 타입 */;
  nmProductType?: string /* 제품 타입명 */;
  fabricCategory?: string /* 원단 카테고리 */;
  nmFabricCategory?: string /* 원단 카테고리명 */;
  fabricStructure?: string /* 원단 구조 */;
  nmFabricStructure?: string /* 원단 구조명 */;
  cdLayer?: string /* 층 코드 */;
  composition?: string /* 조성 */;
  noLot?: string /* Lot 번호 */;
  noSample?: string /* 샘플 번호 */;
  fabricInch?: string /* 원단 인치 */;
  fabricGauge?: string /* 원단 게이지 */;
  widthInch?: string /* 폭(Inch) */;
  wgtGsm?: string /* 중량(GSM) */;
  wgtYdm?: string /* 중량(YDM) */;
  cdPressure?: string /* 압력 코드 */;
  cdColorType?: string /* 컬러 타입 코드 */;
  cdColor?: string /* 컬러 코드 */;
  nmColor?: string /* 컬러 코드 명*/;
  cdCurrency?: string /* 통화 코드 */;
  dtPrice?: string /* PRICE DATE */;
  pricePerYard?: string /* 야드당 단가 */;
  pricePerWight?: string /* 중량 단가 */;
  pricePerMeter?: string /* 미터당 단가 */;
  cdUnit?: string /* 단위 코드 */;
  cdCountry?: string /* 국가 코드 */;
  cdIncomterms?: string /* 인코텀즈 코드 */;
  leadtimeDays?: string /* 리드타임(일) */;
  minOrders?: string /* 최소 주문량 */;
  minColor?: string /* 최소 색상 수 */;
  qtyKeep?: number /* KEEP 수량 */;
  buyerNotify?: string /* 바이어 전달사항 */;
  internalNotify?: string /* 내부 전달사항 */;
  ynConfirm?: string /* 확정 여부 */;
  nmYnConfirm?: string /* 확정 여부명 */;
  dtConfirm?: string /* 확정일자 */;
  cdDept?: string /* 부서 코드 */;
  nmDept?: string /* 부서명 */;
  noEmp?: string /* 사원 번호 */;
  userNm?: string /* 사용자명 */;
  cdTheme?: string /* 테마 코드 */;
  cdItem?: string /* 아이템 코드 */;
  cdHangerPrev?: string /* 이전 행거 코드 */;
  dtHanger?: string /* 행거 일자 */;
  garmentSample?: string /* 의류 샘플 */;
  styleDesc?: string /* 스타일 설명 */;
  nuNidcnt?: string /* NID Count */;
  ynDevelopSample?: string /* 개발 샘플 여부 */;
  yn1stSample?: string /* 1st 샘플 여부 */;
  ynColorSample?: string /* 컬러 샘플 여부 */;
  ynReviseColorSample?: string /* 리비전 컬러 샘플 여부 */;
  ynAppSample?: string /* App 샘플 여부 */;
  fabricFinishing?: string /* 원단 가공 */;
  seqNo?: number /* 순번 */;
  seqArticle?: string /* seqArticle */;
}

/* Rnd Article 저장 API */
export const saveRndArticle = createAsyncThunk<AxiosResponse, RndArticleSaveReq>(
  "rnd/article/saveRndArticle",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.create("rnd/article/saveRndArticle", arg);
      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleAllList = createAsyncThunk<AxiosResponse, RndArticleReq>(
  "rnd/article/all/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("rnd/article/all/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFabricAllInfoList = createAsyncThunk<AxiosResponse, FabricInfoReq>(
  "rnd/fabric/all/info/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("rnd/fabric/all/info/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getFabricInfoList = createAsyncThunk<AxiosResponse, FabricInfoReq>(
  "rnd/fabric/info/list",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("rnd/fabric/info/list", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const getRndArticleQrCodeInfo = createAsyncThunk<AxiosResponse, RndArticleQrCodeInfoReq>(
  "rnd/fabric/qrcode/info",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("rnd/fabric/qrcode/info", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteArticleInfo = createAsyncThunk<AxiosResponse, deleteArticleReq>(
  "rnd/fabric/info/delete",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.create("rnd/fabric/info/delete", arg);

      return res;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 업로드 API */
export const uploadRndFile = createAsyncThunk<AxiosResponse<string[]>, { seqArticle: string; files: File[] }>(
  "rnd/uploadFile",
  async ({ seqArticle, files }, thunkAPI) => {
    try {
      const form = new FormData();
      form.append("seqArticle", seqArticle);
      files.forEach((f) => form.append("files", f)); // Spring @RequestParam("files")
      const res = await api.create("/rnd/uploadFile", form);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 다운로드 API */
export const downloadRndFile = createAsyncThunk<AxiosResponse<Blob>, { seqArticle: string; fileName: string }>(
  "rnd/downloadFilePatch",
  async ({ seqArticle, fileName }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        seqArticle,
        fileName,
      });
      const res = await axios.get(`/rnd/downloadFile?${params.toString()}`, { responseType: "blob" });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 삭제 API */
export const deleteRndFile = createAsyncThunk<AxiosResponse, { seqArticle: string; fileName?: string }>(
  "rnd/deleteFile",
  async ({ seqArticle, fileName }, thunkAPI) => {
    try {
      const res = await api.create("/rnd/deleteFile", { seqArticle, fileName });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/* 파일 미리보기 API */
export const previewRndFile = createAsyncThunk<
  AxiosResponse<Blob>,
  { seqArticle: string; fileName: string; bust?: boolean }
>("rnd/preview", async ({ seqArticle, fileName, bust }, thunkAPI) => {
  try {
    const params: Record<string, string> = { seqArticle, fileName };
    if (bust) params._ = String(Date.now()); // 캐시 무력화가 필요할 때 사용(옵션)

    const res = await axios.get(`/rnd/preview`, {
      params,
      responseType: "blob",
      // 304도 정상으로 간주
      validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
    });
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
  }
});
export type {
  RndArticleAllListRes,
  RndArticleModel,
  RndArticleCompositionModel,
  RndArticleProcessModel,
  RndArticleYarnModel,
  RndArticleStyleModel,
  RndArticleFileModel,
  RndArticleQrCodeModel,
  RndArticleReq,
  RndArticleSaveReq,
  SaveRndArticleReq,
  SaveRndArticleYarnReq,
  SaveRndArticleProcessReq,
  SaveRndArticleCompositionReq,
  SaveRndArticleFileReq,
  SaveRndArticleStyleReq,
  FabricInfoRes,
  FabricAllInfoRes,
  RndArticleQrCodeInfoReq,
  RndArticleQrCodeInfoRes,
};
