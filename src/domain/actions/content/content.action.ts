import { CountryResponse } from 'model/response/content/country.response';
import BaseAction from "base/BaseAction"
import { ContentType } from "domain/types/content.type";

export const getCountry = (setData: (data: Array<CountryResponse>) => void) => {
  return BaseAction(ContentType.GET_COUNTRY_REQUEST, {setData});
}
