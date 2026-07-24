import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../helpers/api/apiCore";
import { AxiosError, AxiosResponse } from "axios";

interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}
interface NewsRes {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NewsItem[];
}
type NewsSort = "date" | "sim";
interface NewsReq {
  query: string;
  display?: number; // 1~100
  start?: number; // 1~1000
  sort?: NewsSort; // "date" | "sim"
}

const NEWS_LIST_URL = "news/list";

export const getNaverNewsList = createAsyncThunk<AxiosResponse<NewsRes>, NewsReq>(
  "news/list",
  async (arg, { rejectWithValue }) => {
    try {
      const res = await api.create(NEWS_LIST_URL, arg);
      return res as AxiosResponse<NewsRes>;
    } catch (err) {
      return rejectWithValue((err as AxiosError).response?.data);
    }
  }
);
export type { NewsReq, NewsRes, NewsItem };
