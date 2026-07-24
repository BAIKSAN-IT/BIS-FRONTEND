// utils/typeGuards.ts
import { UserListRes, DeptListRes } from "../redux/system/SystemUserSlice";

export const isUserListRes = (row: any): row is UserListRes => {
  return "pageNum" in row; // UserListRes 타입은 'pageNum' 속성을 가짐
};

export const isDeptListRes = (row: any): row is DeptListRes => {
  return "rowNum" in row; // DeptListRes 타입은 'rowNum' 속성을 가짐
};
