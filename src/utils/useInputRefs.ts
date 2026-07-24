// utils/useInputRefs.ts
import { useRef } from "react";

export type InputRefMap<T extends string> = {
  [K in T]: React.RefObject<HTMLInputElement>;
};

export default function useInputRefs<T extends string>(keys: T[]) {
  const refs = useRef<InputRefMap<T>>(
    Object.fromEntries(keys.map((key) => [key, { current: null }])) as InputRefMap<T>
  );

  const getValues = (): Record<T, string> => {
    const values = {} as Record<T, string>;
    keys.forEach((key) => {
      values[key] = refs.current[key].current?.value || "";
    });
    return values;
  };

  return { refs: refs.current, getValues };
}
