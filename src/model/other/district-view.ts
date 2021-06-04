export interface CityView {
  city_name: string,
  city_id: number,
  districts: Array<DistrictView>
}

export interface DistrictView {
  id: number,
  name: string,
  code: string,
}