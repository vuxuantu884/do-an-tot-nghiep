import { WarrantyReasonModel } from "model/warranty/warranty.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantyReasonsService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useFetchWarrantyReasons() {
	const [warrantyReasons, setWarrantyReasons] = useState<Array<WarrantyReasonModel>>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		getWarrantyReasonsService().then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setWarrantyReasons(response.data.items);
			} else {
				handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch)
			}
		})
	}, [dispatch]);

  return warrantyReasons
}

export default useFetchWarrantyReasons;
