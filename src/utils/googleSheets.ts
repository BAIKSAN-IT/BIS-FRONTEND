// ===============================
// src/utils/googleSheets.ts
// ===============================

/** ───────── 공통 타입 ───────── */
export type UrlMap = Record<string, string>;
export type GidMap = Record<string, number | string>;
export type IdMap = Record<string, string>;

type StorageBundle = { urlsKey: string; gidsKey: string; idsKey: string };

function keys(ns: string): StorageBundle {
  const safe = ns.toLowerCase().replace(/\s+/g, "_");
  return {
    urlsKey: `${safe}_factory_sheet_urls`,
    gidsKey: `${safe}_factory_gids`,
    idsKey: `${safe}_factory_sheet_ids`,
  };
}

/** ───────── URL 유틸 ───────── */

/** /spreadsheets/d/{ID}/... 에서 spreadsheetId 추출 */
export function extractEditId(u: string): string | null {
  try {
    const url = new URL(u);
    const m = url.pathname.match(/\/spreadsheets\/d\/([A-Za-z0-9-_]{20,})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** 편집 URL */
export function buildEditUrl(id: string, gid: number | string = 0) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${id}/edit`);
  url.searchParams.set("gid", String(gid ?? 0));
  return url.toString();
}

/** pubhtml 임베드 URL (ID가 있을 때) */
export function buildEmbedUrl(
  id: string,
  gid: number | string = 0,
  opts?: { widget?: boolean; headers?: boolean; single?: boolean }
) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${id}/pubhtml`);
  url.searchParams.set("gid", String(gid ?? 0));
  url.searchParams.set("widget", String(opts?.widget ?? true));
  url.searchParams.set("headers", String(opts?.headers ?? true)); // 행/열 머리글 on
  url.searchParams.set("single", String(opts?.single ?? false)); // 탭바 on
  return url.toString();
}

/** 어떤 URL이 와도 pubhtml로 최대 변환 (/d/e/...는 그대로) */
export function toPubHtml(u: string): string {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (url.pathname.includes("/pubhtml")) return url.toString();
    const id = extractEditId(u);
    if (id) return buildEmbedUrl(id, url.searchParams.get("gid") ?? 0);
    if (url.pathname.includes("/spreadsheets/d/e/")) return url.toString();
    return u;
  } catch {
    return u;
  }
}

/** 최종 임베드 URL (옵션 override) */
export function buildEmbedUrlFromAny(
  u: string,
  overrides?: { gid?: number | string; widget?: boolean; headers?: boolean; single?: boolean }
) {
  try {
    const base = new URL(toPubHtml(u) || "about:blank");
    if (overrides?.gid != null) base.searchParams.set("gid", String(overrides.gid));
    if (overrides?.widget != null) base.searchParams.set("widget", String(overrides.widget));
    if (overrides?.headers != null) base.searchParams.set("headers", String(overrides.headers));
    if (overrides?.single != null) base.searchParams.set("single", String(overrides.single));
    return base.toString();
  } catch {
    return u;
  }
}

/** pubhtml/임의 URL → 편집 URL (가능하면), 아니면 그대로 */
export function toEditUrlFromAny(u: string, fallbackGid: number | string = 0): string {
  const id = extractEditId(u);
  return id ? buildEditUrl(id, fallbackGid) : u;
}

/** 원본(편집) 열기: id 우선 → rawUrl이 /d/{id}면 추출 → 마지막 수단으로 그대로 */
export function openEdit(idOrUrl: string, gid: number | string = 0) {
  const id = idOrUrl && !idOrUrl.startsWith("http") ? idOrUrl : extractEditId(idOrUrl);
  window.open(id ? buildEditUrl(id, gid) : idOrUrl, "_blank", "noopener,noreferrer");
}

/** cache-bust 파라미터 부착 (브라우저 캐시 무력화) */
export function withCacheBust(u: string, bust: number) {
  try {
    const url = new URL(u);
    url.searchParams.set("cb", String(bust));
    return url.toString();
  } catch {
    return u;
  }
}

/** ───────── LocalStorage (namespace별) ───────── */
export function loadUrls(ns: string, defaults: UrlMap): UrlMap {
  const { urlsKey } = keys(ns);
  try {
    const saved = localStorage.getItem(urlsKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}
export function saveUrls(ns: string, value: UrlMap) {
  const { urlsKey } = keys(ns);
  try {
    localStorage.setItem(urlsKey, JSON.stringify(value));
  } catch {}
}

export function loadGids(ns: string, factoryKeys: string[]): GidMap {
  const { gidsKey } = keys(ns);
  const empty: GidMap = Object.fromEntries(factoryKeys.map((k) => [k, 0]));
  try {
    const saved = localStorage.getItem(gidsKey);
    return saved ? { ...empty, ...JSON.parse(saved) } : empty;
  } catch {
    return empty;
  }
}
export function saveGids(ns: string, value: GidMap) {
  const { gidsKey } = keys(ns);
  try {
    localStorage.setItem(gidsKey, JSON.stringify(value));
  } catch {}
}

export function loadIds(ns: string, factoryKeys: string[]): IdMap {
  const { idsKey } = keys(ns);
  const empty: IdMap = Object.fromEntries(factoryKeys.map((k) => [k, ""]));
  try {
    const saved = localStorage.getItem(idsKey);
    return saved ? { ...empty, ...JSON.parse(saved) } : empty;
  } catch {
    return empty;
  }
}
export function saveIds(ns: string, value: IdMap) {
  const { idsKey } = keys(ns);
  try {
    localStorage.setItem(idsKey, JSON.stringify(value));
  } catch {}
}

/** ───────── GViz 유틸(무깜빡임 데이터 렌더에 사용) ───────── */
export function buildGvizUrl(id: string, gid?: number | string, tq?: string) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq`);
  if (gid != null) url.searchParams.set("gid", String(gid));
  url.searchParams.set("tqx", "out:json");
  if (tq) url.searchParams.set("tq", tq);
  return url.toString();
}

export function parseGvizJsonp(text: string): any {
  const prefix = "google.visualization.Query.setResponse(";
  const suffix = ");";
  const s = text.indexOf(prefix);
  const e = text.lastIndexOf(suffix);
  if (s === -1 || e === -1) throw new Error("Invalid GViz response");
  return JSON.parse(text.slice(s + prefix.length, e));
}

export function gvizToMatrix(resp: any): { cols: string[]; rows: (string | number)[][] } {
  const cols = (resp.table.cols || []).map((c: any) => c?.label ?? "");
  const rows = (resp.table.rows || []).map((r: any) => (r.c || []).map((c: any) => c?.f ?? c?.v ?? ""));
  return { cols, rows };
}

/** ───────── 공장코드(cdFty) → SheetViewer 키(F1/F2/...) 매핑 ───────── */
const FACTORY_KEY_MAP: Record<string, Record<string, string>> = {
  // namespace 또는 brand: 'vina' | 'bago' | 'pktt'
  vina: {
    "3100": "F1",
    "3200": "F2",
    "3500": "F5",
  },
  bago: {
    "7100": "F1",
    "7200": "F2",
  },
  pktt: {
    "5100": "F1",
    "5200": "F2",
    "5700": "F7",
    "5900": "F9",
    "5A00": "F10", // 문자열 주의(대문자)
  },
};

/** cdFty로 F키 결정 (없으면 null) */
export function resolveFactoryKeyByCdFty(namespace: string, cdFty?: string | number | null): string | null {
  const brand = (namespace || "").toLowerCase();
  const table = FACTORY_KEY_MAP[brand];
  if (!table) return null;
  const code = String(cdFty ?? "").toUpperCase();
  return table[code] || null;
}

/** cdFty만으로 namespace('vina' | 'bago' | 'pktt') 결정 */
export function resolveNamespaceByCdFty(cdFty?: string | number | null): "vina" | "bago" | "pktt" | null {
  const code = String(cdFty ?? "").toUpperCase();
  if (!code) return null;
  for (const ns of Object.keys(FACTORY_KEY_MAP) as Array<"vina" | "bago" | "pktt">) {
    if (FACTORY_KEY_MAP[ns][code]) return ns;
  }
  return null;
}
