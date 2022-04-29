import { WarrantyCenterModel } from "model/warranty/warranty.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantyCentersService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetWarrantyCenters() {
	const [warrantyCenters, setWarrantyCenters] = useState<Array<WarrantyCenterModel>>([]);
	const dispatch = useDispatch();

	useEffect(() => {
		getWarrantyCentersService().then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setWarrantyCenters(response.data.items);
			} else {
				handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch)
			}
		})
	}, [dispatch]);

	return warrantyCenters
}

export default useGetWarrantyCenters;
