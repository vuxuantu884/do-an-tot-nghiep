import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AppConfig } from '../config/AppConfig';

const BaseAxios = axios.create({
  baseURL: AppConfig.baseUrl,
  timeout:  AppConfig.timeOut
});

BaseAxios.defaults.withCredentials =true;

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJNUndFdDVURzNfb2g3M01VRVlsVC01R1VHT0tBNWtLMThjSnlzU2FUTnZjIn0.eyJleHAiOjE2MjE1NzE0NjksImlhdCI6MTYyMDcwNzQ2OSwianRpIjoiNWU2ZDFjNGYtY2ViNy00MmNiLWEzMmItOGNhMWEyYTI0ZTg5IiwiaXNzIjoiaHR0cHM6Ly9kZXYuaWFtLnlvZHkudm4vYXV0aC9yZWFsbXMvWW9keSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1Y2ViNWI0NS0xZWEwLTQxN2MtYjZlMS1jOGI4NDZkNGJlNmQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ5b2R5LW8ybyIsInNlc3Npb25fc3RhdGUiOiJhZGVjYTg3MS05NGExLTQxZmUtOWZhZC05M2M3YzM5ZmVjMjIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTmd1eeG7hW4gw4FuaCIsInByZWZlcnJlZF91c2VybmFtZSI6ImFuaHRvbmciLCJnaXZlbl9uYW1lIjoiTmd1eeG7hW4gw4FuaCJ9.qWJwyKB0X-KO6wOyLVLhoCvUpFMf4q6rn6mZe5jYX1H-HoFwNGUePTRp6apC9kJqiNhPJdXICRGzkVpbngJC8PZ9NxJAE8XZH8gSTwqtz1DAw1VE_6uznrLvveMPFx-UzXNRnyA4eS03YZR4R7KGQ_RR-ykyP6m-jNl5KYzlmScZtnncI6Ja6B9pR_NhWlFPcjeBSpbfM3B0rT0aXMFPIVGNOuGLvZtTJgendg31cUZ70xH-MT9u89DI2Wkg67Pa0OFoPFk_o7k0mxGZ_jc6esu5cVhiR9KmvNlcBXFsGVuXL789a0shSVRhKTiAQG-h2I4UtakoXyRbJx9p_6S9Ew';

BaseAxios.interceptors.request.use(function (request: AxiosRequestConfig) {
  request.headers['Authorization'] = `Bearer ${token}`
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

