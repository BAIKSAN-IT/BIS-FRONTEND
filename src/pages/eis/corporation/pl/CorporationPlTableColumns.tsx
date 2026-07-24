export interface TableColumn {
  Header: string;
  accessor?: string;
  id?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  leftSticky?: boolean;
  number?: boolean;
  editable?: boolean;
  columns?: TableColumn[];
  Cell?: (args: { row: { original: RowType }; value?: any }) => JSX.Element;
  groupEnd?: boolean;
  className?: string;
}

type SearchParams = {
  cdCompany: string;
  cdBizarea: string;
  dtsSyymm: string;
  dtsEyymm: string;
  cdCurrency: string;
};

type RowType = {
  tpGrpLv?: number | string;
  cdAcctGrp?: string | number;
  cdHacctGrp?: string | number;
  nmAcctGrp?: string;
};

type ColumnsFactoryArgs = {
  searchParams: SearchParams;
  expandedKeys: Set<string>;
  childIndexMap: Map<string, RowType[]>;
  showAll: boolean;
};

const rowKey = (r: RowType) => `${r.tpGrpLv ?? ""}|${r.cdAcctGrp ?? ""}|${r.cdHacctGrp ?? ""}`;

const BIZAREA_MAP = {
  "1000": { label: "HEAD", amtKey: "amtHead", ratKey: "ratHead" },
  "5000": { label: "TAMTHANG", amtKey: "amtTt", ratKey: "ratTt" },
  "3000": { label: "VINA", amtKey: "amtVina", ratKey: "ratVina" },
  "7000": { label: "BAGO", amtKey: "amtBago", ratKey: "ratBago" },
} as const;

const toMonthNum = (yyyymm: string) => {
  if (!yyyymm || yyyymm.length !== 6) return 1;
  return Math.max(1, Math.min(12, parseInt(yyyymm.slice(4, 6), 10)));
};

export const CorporationPlTableColumns = ({
  searchParams,
  expandedKeys,
  childIndexMap,
  showAll,
}: ColumnsFactoryArgs): TableColumn[] => {
  const visibleBizareas = new Set(
    (searchParams.cdBizarea || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const mStart = toMonthNum(searchParams.dtsSyymm);
  const mEnd = toMonthNum(searchParams.dtsEyymm);
  const inRange = (m: number) => m >= mStart && m <= mEnd;

  const months: Array<[label: string, m: number]> = [
    ["JAN", 1],
    ["FEB", 2],
    ["MAR", 3],
    ["APR", 4],
    ["MAY", 5],
    ["JUN", 6],
    ["JUL", 7],
    ["AUG", 8],
    ["SEP", 9],
    ["OCT", 10],
    ["NOV", 11],
    ["DEC", 12],
  ];
  const visibleMonths = months.filter(([, m]) => inRange(m));

  /*  //  레벨별 색상 규칙
  const LV_TEXT_COLOR: Record<number, string> = {
    1: "#0B5ED7", // 파랑
    2: "#198754", // 초록
    3: "#6f42c1", // 보라
    4: "#fd7e14", // 오렌지
    5: "#6c757d", // 회색
  };*/
  //  레벨별 색상 규칙
  const LV_TEXT_COLOR: Record<number, string> = {
    1: "#333333", // 검정
    2: "#0B5ED7", // 파랑
    3: "#6f42c1", // 오렌지
    4: "#6f42c1", // 오렌지
    5: "#6f42c1", // 오렌지
  };

  //  공통 스타일
  const commonFontStyle: React.CSSProperties = {
    fontFamily: "inherit",
    fontWeight: 500,
    whiteSpace: "pre",
  };

  //  숫자 컬럼도 레벨별 색상 적용
  const LevelColorCell = ({ value, row }: { value: number | string; row: { original: RowType } }) => {
    const lv = Number(row.original.tpGrpLv) || 1;
    const color = LV_TEXT_COLOR[lv] || "#111";

    const raw = value;

    // 🔹 null/undefined/빈문자/0/'0'/'-' 등은 공백 처리
    if (
      raw === null ||
      raw === undefined ||
      raw === "" ||
      raw === 0 ||
      raw === "0" ||
      raw === "-" ||
      raw === "0.0" ||
      raw === "0.00"
    ) {
      return (
        <span
          style={{
            ...commonFontStyle,
            color,
            display: "block",
            textAlign: "right",
          }}
        >
        {/* 빈 문자열 출력 (아무것도 안 넣기) */}
      </span>
      );
    }

    // 🔹 그 외 값은 숫자면 숫자 포맷, 아니면 문자열 그대로
    let display: string;
    if (typeof raw === "number") {
      display = raw.toLocaleString();
    } else {
      const num = Number(raw);
      display = Number.isFinite(num) ? num.toLocaleString() : String(raw);
    }

    return (
      <span
        style={{
          ...commonFontStyle,
          color,
          display: "block",
          textAlign: "right",
        }}
      >
      {display}
    </span>
    );
  };

  //  월별 그룹 생성
  const makeMonthGroup = (label: string, suffix: string): TableColumn => {
    const cols: TableColumn[] = [
      {
        Header: "TOTAL",
        accessor: `total${suffix}`,
        width: 150,
        minWidth: 100,
        maxWidth: 500,
        number: true,
        Cell: ({ value, row }) => <LevelColorCell value={value} row={row} />,
      },
      {
        Header: "%",
        accessor: `ratTotal${suffix}`,
        width: 50,
        minWidth: 10,
        maxWidth: 500,
        className: "text-center",
        Cell: ({ value, row }) => <LevelColorCell value={value} row={row} />,
      },
    ];

    (Object.keys(BIZAREA_MAP) as Array<keyof typeof BIZAREA_MAP>).forEach((biz) => {
      if (!visibleBizareas.has(biz)) return;
      const { label: bizLabel, amtKey, ratKey } = BIZAREA_MAP[biz];
      cols.push(
        {
          Header: bizLabel,
          accessor: `${amtKey}${suffix}`,
          width: 130,
          minWidth: 80,
          maxWidth: 500,
          number: true,
          Cell: ({ value, row }) => <LevelColorCell value={value} row={row} />,
        },
        {
          Header: "%",
          accessor: `${ratKey}${suffix}`,
          width: 50,
          minWidth: 10,
          maxWidth: 500,
          className: "text-center",
          Cell: ({ value, row }) => <LevelColorCell value={value} row={row} />,
        }
      );
    });

    if (cols.length > 0) {
      cols[cols.length - 1] = { ...cols[cols.length - 1] };
    }

    return { Header: label, columns: cols };
  };

  //  DESCRIPTION 셀
  const DescriptionCell = ({ row }: { row: { original: RowType } }) => {
    const r = row.original;
    const lv = Number(r.tpGrpLv) || 1;
    const color = LV_TEXT_COLOR[lv] || "#111";
    return (
      <span
        style={{
          ...commonFontStyle,
          color,
        }}
      >
        {String(r.nmAcctGrp ?? "")}
      </span>
    );
  };

  // CODE 셀
  const CodeCell = ({ row }: { row: { original: RowType } }) => {
    const r = row.original;
    const k = rowKey(r);
    const hasChildren = childIndexMap.has(k);
    const isOpen = showAll || expandedKeys.has(k);
    const lv = Number(r.tpGrpLv) || 1;
    const color = LV_TEXT_COLOR[lv] || "#111";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          gap: 6,
        }}
      >
        {hasChildren ? (
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              lineHeight: "18px",
              textAlign: "center",
              border: "1px solid #bbb",
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 11,
              userSelect: "none",
              color: color,
            }}
            title={isOpen ? "접기" : "펼치기"}
          >
            {isOpen ? "−" : "+"}
          </span>
        ) : (
          <span style={{ width: 18 }} />
        )}

        <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.cdAcctGrp ?? "")}</span>
      </div>
    );
  };

  const columns: TableColumn[] = [
    {
      Header: "ACCOUNT",
      leftSticky: true,
      columns: [
        {
          Header: "CODE",
          accessor: "cdAcctGrp",
          id: "code",
          width: 100,
          minWidth: 100,
          maxWidth: 1000,
          leftSticky: true,
          className: "text-center",
          Cell: CodeCell,
        },
        {
          Header: "DESCRIPTION",
          accessor: "nmAcctGrp",
          id: "description",
          width: 180,
          minWidth: 150,
          maxWidth: 1000,
          leftSticky: true,
          className: "text-start",
          Cell: DescriptionCell,
        },
      ],
    },
    makeMonthGroup("YEAR", ""),
    ...visibleMonths.map(([label, m]) => makeMonthGroup(label, String(m))),
  ];

  return columns;
};
