import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { DistrictResponse } from "model/content/district.model";
import { CountryResponse, RegionResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import { GroupResponse } from "model/content/group.model";

export const countryGetApi = (): Promise<BaseResponse<Array<CountryResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries`;
  return BaseAxios.get(url);
};

export const getDistrictApi = (
  countryId: number,
): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries/${countryId}/districts`;
  return BaseAxios.get(url);
};

export const getCityByCountryApi = (
  countryId: number,
): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/countries/${countryId}/cities`;
  return BaseAxios.get(url);
};

export const getDistrictByCityApi = (
  cityId: number,
): Promise<BaseResponse<Array<DistrictResponse>>> => {
  let url = `${ApiConfig.CONTENT}/cities/${cityId}/districts`;
  return BaseAxios.get(url);
};

export const getWardApi = (districtId: number): Promise<BaseResponse<Array<WardResponse>>> => {
  let url = `${ApiConfig.CONTENT}/districts/${districtId}/wards`;
  return BaseAxios.get(url);
};

export const getGroupsApi = (): Promise<BaseResponse<Array<GroupResponse>>> => {
  let url = `${ApiConfig.CONTENT}/groups`;
  return BaseAxios.get(url);
};

export const getRegionApi = (): Promise<BaseResponse<Array<RegionResponse>>> => {
  const url = `${ApiConfig.CUSTOMER}/region-phone-config`;
  return BaseAxios.get(url);
};
