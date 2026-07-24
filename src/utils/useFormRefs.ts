// utils/useFormRefs.ts
import { useRef } from "react";

type AnyEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type UseFormRefsConfig<
  TInput extends string = never,
  TSelect extends string = never,
  TTextarea extends string = never,
  TRadio extends string = never,
  TCheck extends string = never
> = {
  /** input 요소들의 키 (예: ["dtsSyymm","dtsEyymm"]) */
  inputFields?: readonly TInput[];
  /** select 요소들의 키 */
  selectFields?: readonly TSelect[];
  /** textarea 요소들의 키 */
  textareaFields?: readonly TTextarea[];

  /** 라디오 그룹: 컨테이너 ref + name 기준으로 checked를 조회 */
  radioGroups?: Record<TRadio, { name: string }>;

  /** 체크박스 그룹: 컨테이너 ref 기준으로 checked 모두 수집 */
  checkboxGroups?: readonly TCheck[];

  /** 필드별 값 변환기 (예: month → YYYYMM) */
  transforms?: Partial<Record<TInput | TSelect | TTextarea, (el: AnyEl | null) => string>>;

  /** 체크박스 값 join 구분자 (기본 ',') */
  checkboxJoiner?: string;
};

export type UseFormRefsReturn<
  TInput extends string,
  TSelect extends string,
  TTextarea extends string,
  TRadio extends string,
  TCheck extends string
> = {
  /** 요소 타입별 refs */
  inputRefs: Record<TInput, React.RefObject<HTMLInputElement>>;
  selectRefs: Record<TSelect, React.RefObject<HTMLSelectElement>>;
  textareaRefs: Record<TTextarea, React.RefObject<HTMLTextAreaElement>>;

  /** 그룹 컨테이너 refs */
  radioGroupRefs: Record<TRadio, React.RefObject<HTMLDivElement>>;
  checkboxGroupRefs: Record<TCheck, React.RefObject<HTMLDivElement>>;

  /** 모든 값 읽기 */
  getValues: () => Record<TInput | TSelect | TTextarea | TRadio | TCheck, string>;
};

/** 자주 쓰는 변환기: YYYY-MM -> YYYYMM */
export const toYYYYMM = (el: AnyEl | null) => (el?.value || "").replace("-", "");

export default function useFormRefs<
  TInput extends string = never,
  TSelect extends string = never,
  TTextarea extends string = never,
  TRadio extends string = never,
  TCheck extends string = never
>(config: UseFormRefsConfig<TInput, TSelect, TTextarea, TRadio, TCheck>) {
  const {
    inputFields = [] as unknown as readonly TInput[],
    selectFields = [] as unknown as readonly TSelect[],
    textareaFields = [] as unknown as readonly TTextarea[],
    radioGroups,
    checkboxGroups,
    transforms,
    checkboxJoiner = ",",
  } = config;

  // 요소별 refs
  const inputRefs = useRef<Record<TInput, React.RefObject<HTMLInputElement>>>(
    Object.fromEntries((inputFields as readonly string[]).map((k) => [k, { current: null }])) as Record<
      TInput,
      React.RefObject<HTMLInputElement>
    >
  );

  const selectRefs = useRef<Record<TSelect, React.RefObject<HTMLSelectElement>>>(
    Object.fromEntries((selectFields as readonly string[]).map((k) => [k, { current: null }])) as Record<
      TSelect,
      React.RefObject<HTMLSelectElement>
    >
  );

  const textareaRefs = useRef<Record<TTextarea, React.RefObject<HTMLTextAreaElement>>>(
    Object.fromEntries((textareaFields as readonly string[]).map((k) => [k, { current: null }])) as Record<
      TTextarea,
      React.RefObject<HTMLTextAreaElement>
    >
  );

  // 그룹 refs
  const radioGroupRefs = useRef<Record<TRadio, React.RefObject<HTMLDivElement>>>(
    Object.fromEntries(Object.keys(radioGroups || {}).map((k) => [k, { current: null }])) as unknown as Record<
      TRadio,
      React.RefObject<HTMLDivElement>
    >
  );

  const checkboxGroupRefs = useRef<Record<TCheck, React.RefObject<HTMLDivElement>>>(
    Object.fromEntries((checkboxGroups || []).map((k) => [k, { current: null }])) as unknown as Record<
      TCheck,
      React.RefObject<HTMLDivElement>
    >
  );

  const getValues = () => {
    const result: Record<string, string> = {};

    // 1) input/select/textarea
    const readEl = (key: string, el: AnyEl | null) => {
      const transform = transforms?.[key as TInput | TSelect | TTextarea];
      return transform ? transform(el) : el?.value || "";
    };

    (inputFields as readonly string[]).forEach((k) => {
      result[k] = readEl(k, inputRefs.current[k as TInput]?.current || null);
    });

    (selectFields as readonly string[]).forEach((k) => {
      result[k] = readEl(k, selectRefs.current[k as TSelect]?.current || null);
    });

    (textareaFields as readonly string[]).forEach((k) => {
      result[k] = readEl(k, textareaRefs.current[k as TTextarea]?.current || null);
    });

    // 2) 라디오 그룹
    if (radioGroups) {
      (Object.keys(radioGroups) as TRadio[]).forEach((key) => {
        const groupRef = radioGroupRefs.current[key]?.current;
        const name = radioGroups[key].name;
        let val = "";
        if (groupRef && name) {
          const checked = groupRef.querySelector<HTMLInputElement>(`input[type="radio"][name="${name}"]:checked`);
          val = checked?.value || "";
        }
        result[key as string] = val;
      });
    }

    // 3) 체크박스 그룹
    if (checkboxGroups) {
      (checkboxGroups as readonly string[]).forEach((key) => {
        const groupRef = checkboxGroupRefs.current[key as TCheck]?.current;
        let val = "";
        if (groupRef) {
          const checked = Array.from(groupRef.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map(
            (n) => n.value
          );
          val = checked.join(checkboxJoiner);
        }
        result[key as string] = val;
      });
    }

    return result as Record<TInput | TSelect | TTextarea | TRadio | TCheck, string>;
  };

  return {
    inputRefs: inputRefs.current,
    selectRefs: selectRefs.current,
    textareaRefs: textareaRefs.current,
    radioGroupRefs: radioGroupRefs.current,
    checkboxGroupRefs: checkboxGroupRefs.current,
    getValues,
  } as UseFormRefsReturn<TInput, TSelect, TTextarea, TRadio, TCheck>;
}
