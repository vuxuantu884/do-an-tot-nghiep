import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { DistrictResponse } from 'model/content/district.model';
import { CountryResponse } from 'model/content/country.model';


export const countryGetApi = (): Promise<BaseResponse<Array<CountryResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries` 
  return BaseAxios.get(url);
}


export const getDistrictApi = (countryId: number): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries/${countryId}/districts` 
  return BaseAxios.get(url);
}
