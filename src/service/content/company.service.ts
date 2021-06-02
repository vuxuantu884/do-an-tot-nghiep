import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { CompanyModel } from 'model/other/CompanyModel';

const getCompanyByGroupId = (groupId: number): Promise<BaseResponse<CompanyModel>> => {
  let url = `${ApiConfig.CONTENT}/companies/groups/${groupId}` 
  return BaseAxios.get(url);
}

export {getCompanyByGroupId}