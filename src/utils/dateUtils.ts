/** YYYY-MM-DD 기준으로 days 만큼 더한 뒤 YYYY-MM-DD 반환 */
const addDaysDash = (yyyyDash: string, days: number) => {
  const [y, m, d] = yyyyDash.split("-").map((v) => Number(v));

  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);

  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
};
/* YYYY-MM-DD 포맷 */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;
};

/* YYYYMM 포맷 */
export const formatYearMonth = (date: Date): string => {
  return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};

/* N일 전 */
const getDateAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

/* N주 전 */
const getWeeksAgo = (weeks: number): string => {
  return getDateAgo(weeks * 7);
};

/* N개월 전 */
const getMonthsAgo = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatDate(date);
};

/* 매달 1일 (YYYY-MM-DD) */
const getFirstDayOfMonth = (monthsAgo: number = 0): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo, 1); // 1일 고정
  return formatDate(date);
};

/* 매달 1일 (YYYYMM) */
const getFirstDayOfMonthYYYYMM = (monthsAgo: number = 0): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo, 1);
  return formatYearMonth(date);
};

export const DateUtils = {
  /* 오늘 */
  get today() {
    return formatDate(new Date());
  },
  get todayYYYYMM() {
    return formatYearMonth(new Date());
  },

  /* Days */
  oneDayAgo: getDateAgo(1),
  twoDaysAgo: getDateAgo(2),
  threeDaysAgo: getDateAgo(3),
  fourDaysAgo: getDateAgo(4),
  fiveDaysAgo: getDateAgo(5),
  sixDaysAgo: getDateAgo(6),
  sevenDaysAgo: getDateAgo(7),

  /* Weeks */
  oneWeekAgo: getWeeksAgo(1),
  twoWeeksAgo: getWeeksAgo(2),
  threeWeeksAgo: getWeeksAgo(3),
  fourWeeksAgo: getWeeksAgo(4),

  /* Months */
  oneMonthAgo: getMonthsAgo(1),
  twoMonthsAgo: getMonthsAgo(2),
  threeMonthsAgo: getMonthsAgo(3),
  fourMonthsAgo: getMonthsAgo(4),
  fiveMonthsAgo: getMonthsAgo(5),
  sixMonthsAgo: getMonthsAgo(6),
  sevenMonthsAgo: getMonthsAgo(7),
  eightMonthsAgo: getMonthsAgo(8),
  nineMonthsAgo: getMonthsAgo(9),
  tenMonthsAgo: getMonthsAgo(10),
  elevenMonthsAgo: getMonthsAgo(11),
  twelveMonthsAgo: getMonthsAgo(12),

  /* 매달 1일 (YYYY-MM-DD) 0~12개월 */
  thisMonthFirstDay: getFirstDayOfMonth(0),
  oneMonthAgoFirstDay: getFirstDayOfMonth(1),
  twoMonthsAgoFirstDay: getFirstDayOfMonth(2),
  threeMonthsAgoFirstDay: getFirstDayOfMonth(3),
  fourMonthsAgoFirstDay: getFirstDayOfMonth(4),
  fiveMonthsAgoFirstDay: getFirstDayOfMonth(5),
  sixMonthsAgoFirstDay: getFirstDayOfMonth(6),
  sevenMonthsAgoFirstDay: getFirstDayOfMonth(7),
  eightMonthsAgoFirstDay: getFirstDayOfMonth(8),
  nineMonthsAgoFirstDay: getFirstDayOfMonth(9),
  tenMonthsAgoFirstDay: getFirstDayOfMonth(10),
  elevenMonthsAgoFirstDay: getFirstDayOfMonth(11),
  twelveMonthsAgoFirstDay: getFirstDayOfMonth(12),

  /* 매달 1일 (YYYYMM) 0~12개월 */
  thisMonthFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(0),
  oneMonthAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(1),
  twoMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(2),
  threeMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(3),
  fourMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(4),
  fiveMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(5),
  sixMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(6),
  sevenMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(7),
  eightMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(8),
  nineMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(9),
  tenMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(10),
  elevenMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(11),
  twelveMonthsAgoFirstDayYYYYMM: getFirstDayOfMonthYYYYMM(12),

  addDaysDash,
};
