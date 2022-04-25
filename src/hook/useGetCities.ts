import { DistrictResponse } from "model/content/district.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getCityByCountryApi } from "service/content/content.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { VietNamId } from "utils/Constants";

function useGetCities() {
	const [districts, setDistricts] = useState<DistrictResponse[]>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		getCityByCountryApi(VietNamId).then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setDistricts(response.data);
			} else {
				handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch)
			}
		})
	}, [dispatch]);

  return districts
}

export default useGetCities;
