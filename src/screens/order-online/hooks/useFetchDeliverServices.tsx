import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DELIVER_SERVICES_LOCAL_STORAGE } from "utils/LocalStorageUtils";

function useFetchDeliverServices() {
  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleIfFetchError = () => {
      let data = localStorage.getItem(DELIVER_SERVICES_LOCAL_STORAGE);
      if (data) {
        setDeliveryServices(JSON.parse(data));
      }
    };
    dispatch(
      DeliveryServicesGetList(
        (response: Array<DeliveryServiceResponse>) => {
          let result = response.filter((service) => service.active);
          localStorage.setItem(DELIVER_SERVICES_LOCAL_STORAGE, JSON.stringify(result));
          setDeliveryServices(result);
        },
        () => {
          handleIfFetchError();
        },
      ),
    );
  }, [dispatch]);

  return deliveryServices;
}

export default useFetchDeliverServices;
