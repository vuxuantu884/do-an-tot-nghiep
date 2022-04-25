import { hideLoading, showLoading } from "domain/actions/loading.action";
import { GetWarrantyCentersParamModel, WarrantyCenterModel } from "model/warranty/warranty.model";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantyCentersService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";

function useFetchWarrantyCenters(
  initQuery: GetWarrantyCentersParamModel,
  location: any,
  countForceFetchData: number,
  setQuery: (data: GetWarrantyCentersParamModel) => void
) {
  const [warrantyCenters, setWarrantyCenters] = useState<Array<WarrantyCenterModel>>([]);
  const [metadata, setMetaData] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });
  const dispatch = useDispatch();

  const queryParamsParsed: any = queryString.parse(location.search);

  const changeQueryFromStringToQuery = (value: string) => {
    if (queryParamsParsed[value]) {
      return {
        [value]: undefined,
        query: queryParamsParsed[value],
      };
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
      ...changeQueryFromStringToQuery("phone"),
    };
    setQuery(dataQuery);
    dispatch(showLoading());
    getWarrantyCentersService(result)
      .then((response) => {
        console.log("response", response);
        if (isFetchApiSuccessful(response)) {
          setWarrantyCenters(response.data.items);
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
    warrantyCenters,
    metadata,
  };
}

export default useFetchWarrantyCenters;
