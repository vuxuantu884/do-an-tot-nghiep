import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from 'utils/LocalStorageUtils';
import { AppConfig } from '../config/app.config';

const BaseAxios = axios.create({
  baseURL: 'http://192.168.2.6:8081/unicorn/',
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
  return response.data;
}, function (error) {
  return Promise.reject(error);
})

export default BaseAxios;

