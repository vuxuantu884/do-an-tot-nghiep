import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getPaymentMethod } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetPaymentMethods() {
	const [paymentMethods, setPaymentMethods] = useState<Array<PaymentMethodResponse>>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		getPaymentMethod().then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setPaymentMethods(response.data);
			} else {
				handleFetchApiError(response, "Danh sách phương thức thanh toán ", dispatch)
			}
		})
	}, [dispatch]);

  return paymentMethods
}

export default useGetPaymentMethods;
