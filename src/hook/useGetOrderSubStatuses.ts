import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderProcessingStatusService } from "service/order/order-processing-status.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetOrderSubStatuses() {
	const [subStatuses, setSubStatuses] = useState<Array<OrderProcessingStatusModel>>([]);
	const dispatch = useDispatch();

  
  useEffect(() => {
    const params = {
      page: 1,
      limit: 1000,
      sort_type: "asc",
      sort_column: "display_order",
    }
		getOrderProcessingStatusService(params).then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setSubStatuses(response.data.items);
			} else {
				handleFetchApiError(response, "Danh sách trạng thái phụ", dispatch)
			}
		})
	}, [dispatch]);

  return subStatuses;
}

export default useGetOrderSubStatuses;
