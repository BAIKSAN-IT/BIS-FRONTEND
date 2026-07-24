import axios, { AxiosRequestConfig } from "axios";
import cookie from "react-cookies";
import Swal from "sweetalert2";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];
let isSessionAlertOpen = false;
const AUTH_SESSION_KEY = "pis_user";

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getLoginRedirectPath = () => {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/srs")) return "/auth/login/srs";
  if (pathname.startsWith("/factory")) return "/auth/login/factory";
  if (pathname.startsWith("/tablet")) return "/auth/login/tablet";
  return "/auth/login";
};

const looksLikeSessionExpired = (error: any) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.errorMessage || error?.response?.data?.message || error?.message || ""
  ).toLowerCase();

  if ([401, 419, 440].includes(status)) return true;
  if (status === 403 && /login|token|session|expired|unauthorized|forbidden/.test(message)) return true;
  if (status === 500 && /session|login|token|jwt|expired|unauthorized|authentication|security/.test(message)) return true;
  return false;
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await api.getRefreshToken();
        isRefreshing = false;
        processQueue(null, newTokens.token);

        originalRequest.headers["Authorization"] = `Bearer ${newTokens.token}`;
        setRefreshCookie(newTokens.refreshToken);

        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        void handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    if (looksLikeSessionExpired(error)) {
      void handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

const getStorageItem = (key: string) => {
  try {
    const localValue = localStorage.getItem(key);
    if (localValue) return localValue;
  } catch (error) {
    // ignore storage access error
  }

  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    // ignore storage access error
  }

  return null;
};

const setStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // ignore storage access error
  }

  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // ignore storage access error
  }
};

const removeStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // ignore storage access error
  }

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    // ignore storage access error
  }
};

const handleSessionExpired = async () => {
  if (isSessionAlertOpen) return;
  isSessionAlertOpen = true;

  try {
    setAuthorization(null);
    clearRefreshCookie();
    removeStorageItem(AUTH_SESSION_KEY);

    const loginPath = getLoginRedirectPath();

    await Swal.fire({
      icon: "warning",
      title: "세션이 만료되었습니다.",
      text: "로그인을 다시 해주세요.",
      confirmButtonText: "확인",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    window.location.replace(loginPath);
  } finally {
    isSessionAlertOpen = false;
  }
};

export const setAuthorization = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const setRefreshCookie = (token: string) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 12 * 60 * 60 * 1000);

  cookie.remove("refresh", { path: "/" });
  cookie.save("refresh", token, {
    path: "/",
    expires,
    secure: true, // HTTPS 환경에서 true로 변경
    domain: process.env.REACT_APP_DOMAIN,
  });
};

export const clearRefreshCookie = () => {
  cookie.remove("refresh", { path: "/" });
  cookie.remove("refresh", { path: "/", domain: process.env.REACT_APP_DOMAIN });
};

const getUserFromSession = () => {
  const user = getStorageItem(AUTH_SESSION_KEY);
  return user ? (typeof user == "object" ? user : JSON.parse(user)) : null;
};

class APICore {
  get = (url: string, params: any) => {
    let response;
    if (params) {
      var queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }
    return response;
  };

  getFile = (url: string, params: any) => {
    let response;
    if (params) {
      var queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
      response = axios.get(`${url}?${queryString}`, { responseType: "blob" });
    } else {
      response = axios.get(`${url}`, { responseType: "blob" });
    }
    return response;
  };

  getMultiple = (urls: string, params: any) => {
    const reqs = [];
    let queryString = "";
    if (params) {
      queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
    }

    for (const url of urls) {
      reqs.push(axios.get(`${url}?${queryString}`));
    }
    return axios.all(reqs);
  };

  create = (url: string, data: any) => {
    return axios.post(url, data);
  };

  createPdf = (url: string, data: any, config?: AxiosRequestConfig) => {
    return axios.post(url, data, config);
  };

  updatePatch = (url: string, data: any) => {
    return axios.patch(url, data);
  };

  update = (url: string, data: any) => {
    return axios.put(url, data);
  };

  delete = (url: string) => {
    return axios.delete(url);
  };

  createWithFile = (url: string, data: any) => {
    const formData = new FormData();
    for (const k in data) {
      formData.append(k, data[k]);
    }

    const config = {
      headers: {
        ...axios.defaults.headers,
        "content-type": "multipart/form-data",
      },
    };
    return axios.post(url, formData, config);
  };

  updateWithFile = (url: string, data: any) => {
    const formData = new FormData();
    for (const k in data) {
      formData.append(k, data[k]);
    }

    const config = {
      headers: {
        ...axios.defaults.headers,
        "content-type": "multipart/form-data",
      },
    };
    return axios.patch(url, formData, config);
  };

  isUserAuthenticated = () => {
    const user = this.getLoggedInUser();

    if (!user) {
      return false;
    }

    return true;
  };

  setLoggedInUser = (session: any) => {
    if (session) setStorageItem(AUTH_SESSION_KEY, JSON.stringify(session));
    else {
      removeStorageItem(AUTH_SESSION_KEY);
    }
  };

  getLoggedInUser = () => {
    return getUserFromSession();
  };

  setUserInSession = (modifiedUser: any) => {
    let userInfo = getStorageItem(AUTH_SESSION_KEY);
    if (userInfo) {
      const { token, refreshToken, ...user } = JSON.parse(userInfo);
      this.setLoggedInUser({ token, refreshToken, ...user, ...modifiedUser });
    }
  };

  getRefreshToken = async () => {
    const user = this.getLoggedInUser();
    if (user) {
      const refresh = cookie.load("refresh");

      try {
        const response = await axios.post(
          "/refresh/",
          {},
          {
            headers: {
              refresh: `Bearer ${refresh}`,
            },
          }
        );
        const { token, refreshToken } = response.data;

        setRefreshCookie(refreshToken);
        setAuthorization(token);
        this.setLoggedInUser({ ...user, token });
        return response.data;
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error("No logged in user");
    }
  };
}

export const api = new APICore();
