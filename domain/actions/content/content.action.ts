import { CountryResponse } from 'model/content/country.model';
import BaseAction from "base/BaseAction"
import { ContentType } from "domain/types/content.type";
import { DistrictResponse } from 'model/content/district.model';
import { WardResponse } from 'model/content/ward.model';
import { GroupResponse } from 'model/content/group.model';

export const CountryGetAllAction = (setData: (data: Array<CountryResponse>) => void) => {
  return BaseAction(ContentType.GET_COUNTRY_REQUEST, {setData});
}

export const DistrictGetByCountryAction = (countryId: number, setData: (data: Array<DistrictResponse>) => void) => {
  return BaseAction(ContentType.GET_DISTRICT_REQUEST, {countryId, setData});
}


export const WardGetByDistrictAction = (districtId: number, setData: (data: Array<WardResponse>) => void) => {
  return BaseAction(ContentType.GET_WARD_REQUEST, {districtId, setData});
}

export const GroupGetAction = (setData: (data: Array<GroupResponse>) => void) => {
  return BaseAction(ContentType.GET_GROUP_REQUEST, {setData})
}
