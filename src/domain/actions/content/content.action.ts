import { CountryResponse } from 'model/response/content/country.response';
import BaseAction from "base/BaseAction"
import { ContentType } from "domain/types/content.type";
import { DistrictResponse } from 'model/response/content/district.response';

export const CountryGetAllAction = (setData: (data: Array<CountryResponse>) => void) => {
  return BaseAction(ContentType.GET_COUNTRY_REQUEST, {setData});
}

export const DistrictGetByCountryAction = (countryId: number, setData: (data: Array<DistrictResponse>) => void) => {
  return BaseAction(ContentType.GET_DISTRICT_REQUEST, {countryId, setData});
}
