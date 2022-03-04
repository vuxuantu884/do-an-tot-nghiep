import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from 'utils/LocalStorageUtils';
import { AppConfig } from '../config/app.config';
import { showError } from "../utils/ToastUtils";
import { HttpStatus } from "../config/http-status.config";

const BaseAxios = axios.create({
  baseURL: AppConfig.baseUrl,
  timeout:  AppConfig.timeOut
});

BaseAxios.defaults.withCredentials =true;

BaseAxios.interceptors.request.use(function (request: AxiosRequestConfig) {
  const token = getToken();
  if(token != null) {
    request.headers['Authorization'] = `Bearer ${token}`
  }
  return request;
}, function (error) {
  !AppConfig.production && console.error(error);
})

BaseAxios.interceptors.response.use(function (response: AxiosResponse) {
  !AppConfig.production && console.log(response.data);
  switch (response.data.code) {
    case HttpStatus.FORBIDDEN:
    case HttpStatus.UNAUTHORIZED:
      showError("Bạn không đủ quyền truy cập, vui lòng liên hệ với IT để được cấp quyền.");
      return;
    case HttpStatus.BAD_GATEWAY:
      showError("Hệ thống đang gián đoạn, vui lòng thử lại sau 5 phút hoặc liên hệ với IT để được hỗ trợ kịp thời.");
      return;
    default:
      break;
  }
  return response.data;
}, function (error) {
  return Promise.reject(error);
})

export default BaseAxios;

