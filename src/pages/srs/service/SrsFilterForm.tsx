import React from "react";
import { SrsFilterState } from "@redux/srs/srsSlice";

type Option = {
  label: string;
  value: string;
};

type SrsFilterFormProps = {
  filters: SrsFilterState;
  departmentOptions: Option[];
  employeeOptions: Option[];
  statusOptions: Option[];
  category1Options: Option[];
  category2Options: Option[];
  category3Options: Option[];
  onChange: (name: keyof SrsFilterState, value: string | boolean) => void;
  onSearch: () => void;
  loading: boolean;
};

const SrsFilterForm = ({
  filters,
  departmentOptions,
  employeeOptions,
  statusOptions,
  category1Options,
  category2Options,
  category3Options,
  onChange,
  onSearch,
  loading,
}: SrsFilterFormProps) => {
  return (
    <section className="srs-filter-panel" aria-label="SRS 조회 조건">
      <div className="srs-section-title">
        <div>
          <p>조회</p>
          <h2>SRS 요청 조회</h2>
        </div>
        <button type="button" onClick={onSearch} disabled={loading}>
          {loading ? "조회중..." : "조회"}
        </button>
      </div>

      <div className="srs-filter-grid">
        <SelectField label="요청부서" value={filters.reqDeptCd} options={departmentOptions} onChange={(value) => onChange("reqDeptCd", value)} />
        <SelectField label="요청자" value={filters.reqEmpNo} options={employeeOptions} onChange={(value) => onChange("reqEmpNo", value)} />

        <label>
          요청일자 시작
          <input type="date" value={filters.dtReqFrom} onChange={(e) => onChange("dtReqFrom", e.target.value)} />
        </label>

        <label>
          요청일자 종료
          <input type="date" value={filters.dtReqTo} onChange={(e) => onChange("dtReqTo", e.target.value)} />
        </label>

        <SelectField label="상태" value={filters.cdStatus} options={statusOptions} onChange={(value) => onChange("cdStatus", value)} />
        <SelectField label="요청구분" value={filters.category1} options={category1Options} onChange={(value) => onChange("category1", value)} />
        <SelectField label="구분상세" value={filters.category2} options={category2Options} onChange={(value) => onChange("category2", value)} />
        <SelectField label="요청타입" value={filters.category3} options={category3Options} onChange={(value) => onChange("category3", value)} />
      </div>

      <div className="srs-keyword-row">
        <label>
          <input
            type="checkbox"
            checked={filters.includeAllRequests}
            onChange={(e) => onChange("includeAllRequests", e.target.checked)}
          />
          전체 요청 포함
        </label>

        <input
          type="text"
          value={filters.keyword}
          placeholder="제목, 내용, 부서명, 요청자명으로 검색"
          onChange={(e) => onChange("keyword", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
      </div>
    </section>
  );
};

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) => {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SrsFilterForm;
