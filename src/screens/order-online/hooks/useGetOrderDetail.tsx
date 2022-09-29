import { OrderDetailAction } from "domain/actions/order/order.action";
import { OrderResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useGetOrderDetail(orderId: string | undefined | null) {
  const [orderDetail, setOrderDetail] = useState<OrderResponse>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (orderId) {
      dispatch(OrderDetailAction(orderId, setOrderDetail));
    }
  }, [dispatch, orderId]);

  return orderDetail;
}

export default useGetOrderDetail;
