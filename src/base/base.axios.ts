import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "utils/LocalStorageUtils";
import { AppConfig } from "../config/app.config";
import { showError } from "../utils/ToastUtils";
import { HttpStatus } from "../config/http-status.config";

export function getAxiosBase(config: AxiosRequestConfig) {
  const BaseAxios = axios.create({
    timeout: AppConfig.timeOut,
    ...config,
  });

  BaseAxios.defaults.withCredentials = true;

  BaseAxios.interceptors.request.use(
    function (request: AxiosRequestConfig) {
      const token = getToken();
      if (token != null) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }
      return request;
    },
    function (error) {
      AppConfig.runMode === "development" && console.error(error);
    }
  );

  BaseAxios.interceptors.response.use(
    function (response: AxiosResponse) {

      /**
       * Thông báo lỗi
       */
      switch (response.data.code) {
        case HttpStatus.FORBIDDEN:
          showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
          return response;
        case HttpStatus.BAD_GATEWAY:
          showError(
            "Hệ thống đang gián đoạn, vui lòng thử lại sau 5 phút hoặc liên hệ với IT để được hỗ trợ kịp thời."
          );
          return response;
        case HttpStatus.UNAUTHORIZED:
        /**
         * Record api 401 để check lỗi tự đăng xuất
         */
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
      if (error?.response?.status === 401) {
        console.warn("Lỗi xác thực: \n", error?.response?.config);
      }
      return Promise.reject(error);
    }
  );
  return BaseAxios;
}

const BaseAxios = getAxiosBase({ baseURL: AppConfig.baseUrl });
export default BaseAxios;
