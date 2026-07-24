import type { ProgramMenuListRes } from "../redux/system/SystemProgramSlice";

export type DragProgramItem = {
  type: "PROGRAM_NODE";
  program: ProgramMenuListRes; // 드래그 payload는 항상 원본 Program
};
