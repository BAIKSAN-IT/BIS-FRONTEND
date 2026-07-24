import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

/** 타입 */
export interface SheetValuesReq {
  id: string;
  range: string; // "'시트1'!A1:D50" 처럼
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
  dateTimeRenderOption?: "SERIAL_NUMBER" | "FORMATTED_STRING";
}
export interface SheetValuesRes {
  range?: string;
  majorDimension?: "ROWS" | "COLUMNS";
  values?: string[][];
}

export interface SetValueReq {
  id: string;
  range: string; // "'시트1'!A1"
  v: string | number;
  userEntered?: boolean;
}
export interface UpdateValuesRes {
  spreadsheetId?: string;
  updatedRange?: string;
  updatedRows?: number;
  updatedColumns?: number;
  updatedCells?: number;
}

const SHEETS_VALUES_URL = (id: string) => `/api/in/sheets/${id}/values`; // GET
const SHEETS_VALUE_URL = (id: string) => `/api/in/sheets/${id}/value`; // POST

/** ------- READ: 값 조회 (api.get은 평평한 객체를 params로 받음!) ------- */
export const getSheetValues = createAsyncThunk<AxiosResponse<SheetValuesRes>, SheetValuesReq>(
  "sheets/values",
  async (arg, { rejectWithValue }) => {
    try {
      // ✅ 네 APICore.get 시그니처: get(url: string, params: any)
      const res = await api.get(SHEETS_VALUES_URL(arg.id), {
        range: arg.range,
        valueRenderOption: arg.valueRenderOption,
        dateTimeRenderOption: arg.dateTimeRenderOption,
      });
      return res as AxiosResponse<SheetValuesRes>;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/** ------- WRITE: 값 쓰기 (api.create는 2개 인자만! → 쿼리스트링 붙여서 전송) ------- */
export const setSheetValue = createAsyncThunk<AxiosResponse<UpdateValuesRes>, SetValueReq>(
  "sheets/value",
  async (arg, { rejectWithValue }) => {
    try {
      // ✅ api.create(url, data)만 있으므로, 쿼리스트링을 URL에 직접 붙입니다.
      const qs = new URLSearchParams({
        range: arg.range,
        v: String(arg.v),
        userEntered: String(arg.userEntered ?? true),
      }).toString();

      const url = `${SHEETS_VALUE_URL(arg.id)}?${qs}`;
      const res = await api.create(url, {}); // 두 번째 인자는 body(JSON). 여기선 비워둠.

      return res as AxiosResponse<UpdateValuesRes>;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

/** (옵션) 1행 헤더를 key로 매핑 */
export function valuesToObjects(values?: string[][]) {
  if (!values || values.length === 0) return [] as Array<Record<string, string>>;
  const [header, ...rows] = values;
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h ?? `COL${i + 1}`, r[i] ?? ""]))) as Array<
    Record<string, string>
  >;
}
