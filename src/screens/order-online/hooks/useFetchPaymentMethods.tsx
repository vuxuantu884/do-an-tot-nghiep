import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PaymentMethodCode } from "utils/Constants";

function useFetchPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<Array<PaymentMethodResponse>>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        const result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        setPaymentMethods(result);
      }),
    );
  }, [dispatch]);

  return paymentMethods;
}

export default useFetchPaymentMethods;
