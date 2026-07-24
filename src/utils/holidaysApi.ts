// 한국천문연구원_특일 정보 (누리집 API )
export async function fetchKoreanHolidays(year: number, serviceKey: string) {
  const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${year}&numOfRows=100&ServiceKey=${serviceKey}&_type=json`;
  const res = await fetch(url);
  const json = await res.json();
  const items = json.response.body.items.item || [];
  return (Array.isArray(items) ? items : [items]).map((item: any) => {
    // 날짜 문자열로 변환 (UTC 문제 방지)
    const y = String(item.locdate).slice(0, 4);
    const m = String(item.locdate).slice(4, 6);
    const d = String(item.locdate).slice(6, 8);
    return {
      date: `${y}-${m}-${d}`,
      name: item.dateName,
    };
  });
}
