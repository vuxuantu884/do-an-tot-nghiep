import { hideLoading, showLoading } from "domain/actions/loading.action";
import { GetWarrantyProductStatusesParamModel } from "model/warranty/warranty.model";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantyProductStatusesService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";

function useFetchWarrantyProductStatuses(
  initQuery: GetWarrantyProductStatusesParamModel,
  location: any,
  countForceFetchData: number,
  setQuery: (data: GetWarrantyProductStatusesParamModel) => void
) {
  const [warrantyProductStatuses, setWarrantyProductStatuses] = useState<Array<any>>([]);
  const [metadata, setMetaData] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });
  const dispatch = useDispatch();
  const queryParamsParsed: any = queryString.parse(location.search);
  console.log("queryParamsParsed", queryParamsParsed);

  const changeQueryFromStringToQuery = (value: string) => {
    if(queryParamsParsed[value]) {
      return {
        [value]: undefined,
        query: queryParamsParsed[value]
      }
    }
  };

  useEffect(() => {
    let dataQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
		let result = {
      ...dataQuery,
      ...changeQueryFromStringToQuery("name"),
		}
    setQuery(dataQuery);
    dispatch(showLoading());
    getWarrantyProductStatusesService(result)
      .then((response) => {
        console.log("response", response);
        if (isFetchApiSuccessful(response)) {
          setWarrantyProductStatuses(response.data.items);
          setMetaData(response.data.metadata);
        } else {
          handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search, countForceFetchData, setQuery]);

  return {
    warrantyProductStatuses,
    metadata,
  };
}

export default useFetchWarrantyProductStatuses;
