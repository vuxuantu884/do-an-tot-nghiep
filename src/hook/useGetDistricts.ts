import { DistrictResponse } from "model/content/district.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDistrictByCityApi } from "service/content/content.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetDistricts(cityId: number | null) {
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    getDistrictByCityApi(cityId).then((response) => {
      console.log("response", response);
      if (isFetchApiSuccessful(response)) {
        setDistricts(response.data);
      } else {
        handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch);
      }
    });
  }, [cityId, dispatch]);

  return districts;
}

export default useGetDistricts;
