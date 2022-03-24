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
      AppConfig.runMode === "development" && console.log(response.data);
      switch (response.data.code) {
        case HttpStatus.FORBIDDEN:
          showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
          return;
        case HttpStatus.BAD_GATEWAY:
          showError(
            "Hệ thống đang gián đoạn, vui lòng thử lại sau 5 phút hoặc liên hệ với IT để được hỗ trợ kịp thời."
          );
          return;
        default:
          break;
      }
      return response.data;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  return BaseAxios;
}

/**
 * Get axios instance
 * Tại môi trường local: dùng proxy để access api => không cần baseURL của api, chỉ cần prefix /unicorn
 * Tại môi trường production: DÙNG baseURL của api để access api
 */
const devMode = AppConfig.runMode === "development";
const BaseAxios = getAxiosBase({ baseURL: devMode ? "/unicorn" : AppConfig.baseApi + "/unicorn" });
export default BaseAxios;
