import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchDeliverServices() {
  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      }),
    );
  }, [dispatch]);

  return deliveryServices;
}

export default useFetchDeliverServices;
