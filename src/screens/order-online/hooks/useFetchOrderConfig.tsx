import { orderConfigSaga } from "domain/actions/order/order.action";
import { OrderConfigResponseModel } from "model/response/settings/order-settings.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchOrderConfig() {
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      }),
    );
  }, [dispatch]);

  return orderConfig;
}

export default useFetchOrderConfig;
