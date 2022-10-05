import { actionGetOrderReturnReasons } from "domain/actions/order/order-return.action";
import { OrderReasonModel } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchOrderReturnReasons() {
  const [orderReturnReasonResponse, setOrderReturnReasonResponse] =
    useState<OrderReasonModel | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      actionGetOrderReturnReasons((response) => {
        setOrderReturnReasonResponse(response);
      }),
    );
  }, [dispatch]);

  return orderReturnReasonResponse?.sub_reasons;
}

export default useFetchOrderReturnReasons;
