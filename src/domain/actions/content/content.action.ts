import { CountryResponse, RegionResponse } from "model/content/country.model";
import BaseAction from "base/base.action";
import { ContentType } from "domain/types/content.type";
import { DistrictResponse } from "model/content/district.model";
import { WardResponse } from "model/content/ward.model";
import { GroupResponse } from "model/content/group.model";

export const CountryGetAllAction = (setData: (data: Array<CountryResponse>) => void) => {
  return BaseAction(ContentType.GET_COUNTRY_REQUEST, { setData });
};

export const DistrictGetByCountryAction = (
  countryId: number,
  setData: (data: Array<DistrictResponse>) => void,
) => {
  return BaseAction(ContentType.GET_DISTRICT_REQUEST, { countryId, setData });
};

export const WardGetByDistrictAction = (
  districtId: number,
  setData: (data: Array<WardResponse>) => void,
) => {
  return BaseAction(ContentType.GET_WARD_REQUEST, { districtId, setData });
};

export const GroupGetAction = (setData: (data: Array<GroupResponse>) => void) => {
  return BaseAction(ContentType.GET_GROUP_REQUEST, { setData });
};

export const DistrictByCityAction = (
  cityId: number,
  setData: (data: Array<DistrictResponse>) => void,
) => {
  return BaseAction(ContentType.GET_DISTRICT_BY_CITY_REQUEST, {
    cityId,
    setData,
  });
};

export const CityByCountryAction = (countryId: number, setData: (data: Array<any>) => void) => {
  return BaseAction(ContentType.GET_CITY_BY_COUNTRY_REQUEST, {
    countryId,
    setData,
  });
};

export const GetRegionAction = (setData: (data: Array<RegionResponse>) => void) => {
  return BaseAction(ContentType.GET_REGION_REQUEST, { setData });
};
