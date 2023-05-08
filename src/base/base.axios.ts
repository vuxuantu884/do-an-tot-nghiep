import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ACCOUNT_CODE_LOCAL_STORAGE, getToken } from "utils/LocalStorageUtils";
import { AppConfig } from "../config/app.config";
import { showError } from "../utils/ToastUtils";
import { HttpStatus } from "../config/http-status.config";
import qs from "query-string";

const ACCESS_TOKEN = "access_token";

export function getAxiosBase(
  config: AxiosRequestConfig,
  isGetAllResponseAxios: boolean = false, // tổng kết ca cần
) {
  const BaseAxios = axios.create({
    timeout: AppConfig.timeOut,
    ...config,
  });

  BaseAxios.defaults.withCredentials = true;

  BaseAxios.interceptors.request.use(
    function (request: AxiosRequestConfig) {
      // thêm version git commit để check xem user có update code mới nhất ko
      request.headers["X-Client-Git-Version"] = `${
        process.env.REACT_APP_GIT_COMMIT_HASH
          ? process.env.REACT_APP_GIT_COMMIT_HASH
          : "no-git-commit-hash"
      }`;
      const token = getToken();
      if (token != null) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }
      // thêm user code
      const accountCode = localStorage.getItem(ACCOUNT_CODE_LOCAL_STORAGE);
      if (accountCode) {
        request.headers["user_code"] = accountCode;
      }
      return request;
    },
    function (error) {
      AppConfig.runMode === "development" && console.error(error);
    },
  );

  BaseAxios.interceptors.response.use(
    function (response: AxiosResponse) {
      if (isGetAllResponseAxios) {
        return response;
      }
      /**
       * Thông báo lỗi
       */
      switch (response.data.code) {
        case HttpStatus.FORBIDDEN:
          showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
          return response;
        case HttpStatus.BAD_GATEWAY:
          showError(
            "Hệ thống đang gián đoạn, vui lòng thử lại sau 5 phút hoặc liên hệ với IT để được hỗ trợ kịp thời.",
          );
          return response;
        case HttpStatus.UNAUTHORIZED:
          /**
           * Record api 401 để check lỗi tự đăng xuất
           */
          localStorage.removeItem(ACCESS_TOKEN);
          let returnUrl = encodeURIComponent(
            `${window.location.pathname.slice(6, window.location.pathname.length)}${
              window.location.search
            }`,
          );
          window.location.replace(`/admin/login?returnUrl=${returnUrl}`);
          console.warn("Lỗi xác thực: \n", response?.config);
          return response;
        default:
          break;
      }

      return response.data;
    },
    function (error) {
      /**
       * Record api 401 để check lỗi tự đăng xuất
       */
      if (isGetAllResponseAxios) {
        return error?.response;
      }
      if (error?.response?.status === 401) {
        console.warn("Lỗi xác thực: \n", error?.response?.config);
      }
      return Promise.reject(error);
    },
  );
  return BaseAxios;
}

const BaseAxios = getAxiosBase({ baseURL: AppConfig.baseUrl });

export const DailyRevenueBaseAxios = getAxiosBase({ baseURL: AppConfig.baseApi });
export const DailyRevenueIncludeHeaderInfoBaseAxios = getAxiosBase(
  { baseURL: AppConfig.baseApi },
  true,
);

// AXIOS-V2
const handleUnauthenticated = (error: any) => {
  const url = error.config.url;
  if (error.response.status === 401) {
    /**
     * Record api 401 để check lỗi tự đăng xuất
     */
    localStorage.removeItem(ACCESS_TOKEN);
    let returnUrl = encodeURIComponent(
      `${window.location.pathname.slice(6, window.location.pathname.length)}${
        window.location.search
      }`,
    );
    window.location.replace(`/admin/login?returnUrl=${returnUrl}`);
    console.warn("Lỗi xác thực: \n", error.response?.config);
    return error.response;
  }
};
const handleOldError = (response: AxiosResponse) => {
  // response cũ mọi thứ đều trả về 200
  switch (response.data.code) {
    case HttpStatus.BAD_GATEWAY:
      showError(
        "Hệ thống đang gián đoạn, vui lòng thử lại sau 5 phút hoặc liên hệ với IT để được hỗ trợ kịp thời.",
      );
      return response;
    case 40300000:
      showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
      return response;
    default:
      break;
  }
};

const errorHandler = (error: any) => {
  switch (error.response.status) {
    case 401:
      handleUnauthenticated(error);
      break;
    case 403:
      showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
      return error.response;
    default:
      // handleErrorDefault(error);
      break;
  }
};

export function getAxiosBaseV2(
  config: AxiosRequestConfig,
  isGetAllResponseAxios: boolean = false, // tổng kết ca cần
) {
  const axiosInstance = axios.create({
    timeout: AppConfig.timeOut,
    ...config,
  });

  axiosInstance.defaults.withCredentials = true;
  axiosInstance.defaults.paramsSerializer = (params) => {
    return qs.stringify(params, { arrayFormat: "comma" });
  };

  axiosInstance.interceptors.request.use(
    function (request: AxiosRequestConfig) {
      // thêm version git commit để check xem user có update code mới nhất ko
      request.headers["X-Client-Git-Version"] = `${
        process.env.REACT_APP_GIT_COMMIT_HASH
          ? process.env.REACT_APP_GIT_COMMIT_HASH
          : "no-git-commit-hash"
      }`;
      const token = getToken();
      if (token != null) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }
      // thêm user code
      const accountCode = localStorage.getItem(ACCOUNT_CODE_LOCAL_STORAGE);
      if (accountCode) {
        request.headers["user_code"] = accountCode;
      }
      return request;
    },
    function (error) {
      AppConfig.runMode === "development" && console.error(error);
    },
  );

  axiosInstance.interceptors.response.use(
    function (response: AxiosResponse) {
      handleOldError(response);

      if (isGetAllResponseAxios) {
        return response;
      }
      return response.data;
    },
    function (error) {
      errorHandler(error);
      return Promise.reject(error);
    },
  );
  return axiosInstance;
}

export const axiosClientV2 = getAxiosBaseV2({ baseURL: process.env.REACT_APP_BASE_URL_V2 }, true);
export default BaseAxios;
