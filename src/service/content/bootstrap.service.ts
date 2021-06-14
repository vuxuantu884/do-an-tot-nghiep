import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { BootstrapResponse } from 'model/content/bootstrap.model';

const getBootsrapAPI = (): Promise<BaseResponse<BootstrapResponse>> => {
  let url = `${ApiConfig.CONTENT}/common/enums` 
  return BaseAxios.get(url);
}

export {getBootsrapAPI}