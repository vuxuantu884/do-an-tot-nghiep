import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderProcessingStatusService } from "service/order/order-processing-status.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useFetchOrderStatuses() {
	const [orderStatuses, setOrderStatuses] = useState<Array<OrderProcessingStatusModel>>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		const params=  {
      sort_type: "asc",
      sort_column: "display_order",
			limit: 1000,
    }
		getOrderProcessingStatusService(params).then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setOrderStatuses(response.data.items);
			} else {
				handleFetchApiError(response, "Danh sách cửa hàng", dispatch)
			}
		})
	}, [dispatch]);

  return orderStatuses;
}

export default useFetchOrderStatuses;
