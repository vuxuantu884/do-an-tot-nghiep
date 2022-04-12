import { GetWarrantiesParamModel, WarrantyModel } from "model/warranty/warranty.model";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantiesService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";

function useFetchWarranties(initQuery: GetWarrantiesParamModel, location: any) {
	const [warranties, setWarranties] = useState<Array<WarrantyModel>>([]);
	const [metadata, setMetaData] = useState({
		limit: 0,
		page: 0,
		total: 0
	});
	const dispatch = useDispatch();
	const queryParamsParsed: any = queryString.parse(
    location.search
  );

	console.log('queryParamsParsed', queryParamsParsed)

  useEffect(() => {
		let dataQuery: GetWarrantiesParamModel = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
		getWarrantiesService(dataQuery).then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setWarranties(response.data.items);
				setMetaData(response.data.metadata)
			} else {
				handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch)
			}
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, location.search]);

  return {
		warranties,
		metadata
	};
}

export default useFetchWarranties;
