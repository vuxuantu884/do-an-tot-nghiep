import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { DistrictResponse } from 'model/response/content/district.response';
import { CountryResponse } from '../../model/response/content/country.response';


export const getCountry = (): Promise<BaseResponse<Array<CountryResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries` 
  return BaseAxios.get(url);
}


export const getDistrictApi = (countryId: number): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries/${countryId}/districts` 
  return BaseAxios.get(url);
}
