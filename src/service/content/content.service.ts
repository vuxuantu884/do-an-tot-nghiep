import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { CountryResponse } from '../../model/response/content/country.response';


export const getCountry = (): Promise<BaseResponse<Array<CountryResponse>>> => {
  debugger;
  let url = `${ApiConfig.CONTENT}/countries` 
  return BaseAxios.get(url);
}
