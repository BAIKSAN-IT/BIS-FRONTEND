import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface RndArticleAllListRes {
  rndArticleList: RndArticleModel[]; // RndArticle 목록 조회
  rndArticleCompositionList: RndArticleCompositionModel[]; // RndArticle Composition 목록 조회
  rndArticleFileList: RndArticleFileModel[]; // RndArticle File 목록 조회
  rndArticleProcessList: RndArticleProcessModel[]; // RndArticle Process 목록 조회
  rndArticleQrcodeList: RndArticleQrCodeModel[]; // RndArticle QrCode 목록 조회
  rndArticleYarnList: RndArticleYarnModel[]; // RndArticle Yarn 목록 조회
  rndArticleStyleList: RndArticleStyleModel[]; // RndArticle Yarn 목록 조회
}
interface RndReportsReq {
  cdCompany: string; // 회사코드1
  startDate: string; // START DATE
  endDate: string; // END DATE
  seqArticle: string; // ARTICLE NO
  seqArticleList: string[]; // ARTICLE NO
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
  noSample: string; // INPUT DATE
  noLot: string; // INPUT DATE
  ynConfirm: string; // Status
  cdFabric: string; // ERP 원단코드
  cdComposition: string; // 혼용율 코드
  cdProcess: string; // 공정코드
  cdYarn: string; // 원사코드
  nmYarn: string; // 원사코드명
  qrcode: string; // Qr Code
  seq: number; // 순번
  docType?: string; // excel | pdf | word
  rowQrNum?: number; // excel | pdf | word
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
  idInsert: string; // 등록자 ID
  dtInsert: string; // 등록일자 (YYYY-MM-DD)
  idUpdate: string; // 수정자 ID
  dtUpdate: string; // 수정일자 (YYYY-MM-DD)
  seqNo: number; // rowNum
  qrcode: string; // rowNum
}
interface RndArticleCompositionModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  cdFabric: string; // ERP 원단코드
  cdComposition: string; // 혼용율 코드
  rtComp: number; // 구성 비율
  sortSeq: number; // 구성 비율
  rtCompBack: number; // 혼용률 100%,200%체크
}

interface RndArticleFileModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  seq: number; // 순번
  imgFileNameOrg: string; // 원본 파일명
  imgFileName: string; // 저장 파일명
}

interface RndArticleProcessModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  cdFabric: string; // ERP 원단코드
  cdProcess: string; // 공정코드
  rtLoss: number; // 손실율
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
}

interface RndArticleStyleModel {
  cdCompany: string; // 회사코드
  seqArticle: string; // ARTICLE NO
  seq: number; // 순번
  noStyle: string; //
  descStyle: string; //
}

export const exportRndArticleReport = createAsyncThunk<
  AxiosResponse<Blob>,
  RndReportsReq,
  { rejectValue: string }
>(
  "reports/rnd/article/export",
  async (arg, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await api.createPdf("reports/rnd/article/export", arg, {
        responseType: "blob",
      });

      return res;
    } catch (err: any) {
      const axiosErr = err as AxiosError;

      // Blob 에러(JSON) 파싱
      if (axiosErr.response?.data instanceof Blob) {
        try {
          const text = await axiosErr.response.data.text(); // 핵심
          const json = JSON.parse(text);

          return rejectWithValue(json.message);
        } catch {
          return rejectWithValue("리포트 생성 중 오류가 발생했습니다.");
        }
      }

      return rejectWithValue("리포트 생성 중 오류가 발생했습니다.");
    }
  }
);

export type {
  RndArticleAllListRes,
  RndArticleModel,
  RndArticleCompositionModel,
  RndArticleProcessModel,
  RndArticleYarnModel,
  RndArticleStyleModel,
  RndArticleFileModel,
  RndArticleQrCodeModel,
  RndReportsReq,
};
