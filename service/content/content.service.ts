import BaseAxios from 'base/BaseAxios';
import BaseResponse from 'base/BaseResponse';
import {ApiConfig} from 'config/ApiConfig';
import { DistrictResponse } from 'model/content/district.model';
import { CountryResponse } from 'model/content/country.model';
import { WardResponse } from 'model/content/ward.model';
import { GroupResponse } from 'model/content/group.model';


export const countryGetApi = (): Promise<BaseResponse<Array<CountryResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries` 
  return BaseAxios.get(url);
}


export const getDistrictApi = (countryId: number): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries/${countryId}/districts` 
  return BaseAxios.get(url);
}

export const getWardApi = (districtId: number): Promise<BaseResponse<Array<WardResponse>>> => {
  let url = `${ApiConfig.CONTENT}/districts/${districtId}/wards` 
  return BaseAxios.get(url);
}

export const getGroupsApi = (): Promise<BaseResponse<Array<GroupResponse>>> => {
  let url = `${ApiConfig.CONTENT}/groups` 
  return BaseAxios.get(url);
}
