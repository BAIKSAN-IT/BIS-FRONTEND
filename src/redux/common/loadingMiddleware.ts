import { Middleware, isAnyOf } from "@reduxjs/toolkit";
import { startLoading, stopLoading } from "./loadingSlice";

const EXCLUDED_PREFIXES = [
  "factory/cutting/stock/cnt",
  "common/buyer/info",
];

// 타입 가드
function isActionWithType(
  action: unknown
): action is { type: string } {
  return (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof (action as any).type === "string"
  );
}

const loadingMiddleware: Middleware =
  (store) => (next) => (action) => {
    // 1.먼저 reducer로 전달
    const result = next(action);

    // 2.type 없는 액션은 무시
    if (!isActionWithType(action)) {
      return result;
    }

    // 3.제외 대상 전부 스킵
    if (EXCLUDED_PREFIXES.some((prefix) => action.type.startsWith(prefix))) {
      return result;
    }

    // 4.thunk lifecycle 기준 로딩 제어
    if (action.type.endsWith("/pending")) {
      store.dispatch(startLoading());
    }

    if (
      action.type.endsWith("/fulfilled") ||
      action.type.endsWith("/rejected")
    ) {
      store.dispatch(stopLoading());
    }

    return result;
  };

export default loadingMiddleware;
